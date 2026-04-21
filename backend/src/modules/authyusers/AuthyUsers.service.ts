import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../../config/prisma';
import redis from '../../config/redis';
import { env } from '../../config/env';
import { 
  BadRequest, Unauthorized, Forbidden, NotFound, Conflict 
} from '../../common/utils/apiError';
import { LoginInput, RegisterInput, ChangePasswordInput, RoleCreateInput } from './AuthyUsers.types';
import { logger } from '../../config/logger';

export class AuthyUsersService {
  private static readonly SESSION_PREFIX = 'user:session:';
  private static readonly PERMISSIONS_CACHE_PREFIX = 'user:perms:';

  /**
   * ── Authentication ────────────────────────────────────────────────────────
   */

  async login(data: LoginInput, ip: string) {
    const user = await prisma.user.findUnique({
      where: { email: data.email, deletedAt: null },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true }
                }
              }
            }
          }
        }
      }
    });

    if (!user) throw Unauthorized('Invalid credentials');
    if (!user.isActive) throw Forbidden('Account inactive');

    // Lockout check
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw Forbidden('Account locked. Try again later.');
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);

    if (!isMatch) {
      await this.handleFailedLogin(user.id, user.loginAttempts);
      throw Unauthorized('Invalid credentials');
    }

    // Success - Create Serialized Session (Single Session enforcement)
    const sessionId = uuidv4();
    await redis.set(`${AuthyUsersService.SESSION_PREFIX}${user.id}`, sessionId, 'EX', 60 * 60 * 24 * 7); // 7 days

    // Generate Tokens
    const accessToken = this.generateToken(user.id, sessionId, 'access');
    const refreshToken = this.generateToken(user.id, sessionId, 'refresh');

    // Update User
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ip,
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    // Cache permissions for RBAC
    await this.cacheUserPermissions(user.id, user);

    const { passwordHash, ...userResponse } = user;
    return { user: userResponse, accessToken, refreshToken };
  }

  async logout(userId: string) {
    await redis.del(`${AuthyUsersService.SESSION_PREFIX}${userId}`);
    await redis.del(`${AuthyUsersService.PERMISSIONS_CACHE_PREFIX}${userId}`);
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any;
      const cachedSessionId = await redis.get(`${AuthyUsersService.SESSION_PREFIX}${decoded.sub}`);

      if (!cachedSessionId || cachedSessionId !== decoded.sid) {
        throw Unauthorized('Session expired or invalidated');
      }

      const accessToken = this.generateToken(decoded.sub, decoded.sid, 'access');
      return { accessToken };
    } catch (err) {
      throw Unauthorized('Invalid refresh token');
    }
  }

  /**
   * ── User & Role Management ────────────────────────────────────────────────
   */

  async register(data: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw Conflict('Email already registered');

    const role = await prisma.role.findUnique({ where: { name: data.roleName } });
    if (!role) throw NotFound('Role not found');

    const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);

    return await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          roles: {
            create: { roleId: role.id }
          },
          isActive: true,
          isEmailVerified: true
        }
      });

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          employeeCode: `EMP-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
          firstName: data.firstName,
          lastName: data.lastName,
          jobTitle: data.jobTitle,
          departmentId: data.departmentId,
        }
      });

      return { user, employee };
    });
  }

  async getPermissions(userId: string): Promise<string[]> {
    // Try cache first
    const cached = await redis.get(`${AuthyUsersService.PERMISSIONS_CACHE_PREFIX}${userId}`);
    if (cached) return JSON.parse(cached);

    // Fetch and cache
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: { permissions: { include: { permission: true } } }
            }
          }
        }
      }
    });

    if (!user) return [];
    return await this.cacheUserPermissions(userId, user);
  }

  /**
   * ── Private Helpers ───────────────────────────────────────────────────────
   */

  private generateToken(userId: string, sessionId: string, type: 'access' | 'refresh') {
    const secret = type === 'access' ? env.JWT_SECRET : env.JWT_REFRESH_SECRET;
    const expiresIn = type === 'access' ? env.JWT_EXPIRES_IN : env.JWT_REFRESH_EXPIRES_IN;

    return jwt.sign({ sub: userId, sid: sessionId }, secret, { expiresIn: expiresIn as any });
  }

  private async cacheUserPermissions(userId: string, user: any): Promise<string[]> {
    const permissions = new Set<string>();
    
    user.roles.forEach((ur: any) => {
      ur.role.permissions.forEach((rp: any) => {
        permissions.add(`${rp.permission.action}:${rp.permission.resource}`);
      });
      // If the role name is special, we could add high-level permissions
      if (ur.role.name === 'SUPER_ADMIN') permissions.add('MANAGE:ALL');
    });

    const permsArray = Array.from(permissions);
    await redis.set(`${AuthyUsersService.PERMISSIONS_CACHE_PREFIX}${userId}`, JSON.stringify(permsArray), 'EX', 3600); // 1 hour
    return permsArray;
  }

  private async handleFailedLogin(userId: string, attempts: number) {
    const newAttempts = attempts + 1;
    const data: any = { loginAttempts: newAttempts };

    if (newAttempts >= 5) {
      data.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 min lock
      logger.warn(`User ${userId} locked due to too many failed attempts`);
    }

    await prisma.user.update({ where: { id: userId }, data });
  }
}

export const authyUsersService = new AuthyUsersService();

