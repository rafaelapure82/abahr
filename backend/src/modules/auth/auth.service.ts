import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Role } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import {
  Unauthorized,
  BadRequest,
  Conflict,
  NotFound,
} from '../../common/utils/apiError';
import type {
  LoginDto,
  RegisterDto,
  RefreshDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  AuthTokens,
  AuthUser,
} from './auth.types';

// ── Token generation ──────────────────────────────────────────────────────────
const EMPLOYEE_SELECT = {
  id: true,
  employeeCode: true,
  firstName: true,
  lastName: true,
  displayName: true,
  jobTitle: true,
  avatarUrl: true,
  departmentId: true,
} as const;

function generateAccessToken(
  userId: string,
  email: string,
  role: string,
  employeeId?: string,
): string {
  return jwt.sign(
    { sub: userId, email, role, employeeId },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );
}

function generateRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
}

function parseExpiresIn(value: string): number {
  const map: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) return 900;
  return parseInt(match[1], 10) * (map[match[2]] ?? 1);
}

// ─────────────────────────────────────────────────────────────────────────────
export class AuthService {
  // ── Login ─────────────────────────────────────────────────────────────────
  async login(dto: LoginDto): Promise<{ tokens: AuthTokens; user: AuthUser }> {
    const user = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase(), deletedAt: null },
      include: { employee: { select: EMPLOYEE_SELECT } },
    });

    if (!user) throw Unauthorized('Invalid email or password');

    // Account lockout check
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw Unauthorized('Account is temporarily locked. Please try again later.');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      // Increment failed attempts (lock after 5)
      const attempts = (user.loginAttempts ?? 0) + 1;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: attempts,
          lockedUntil: attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null,
        },
      });
      throw Unauthorized('Invalid email or password');
    }

    if (!user.isActive) throw Unauthorized('Account is deactivated. Contact HR.');

    // Generate tokens
    const accessToken = generateAccessToken(
      user.id,
      user.email,
      user.role,
      user.employee?.id,
    );
    const refreshToken = generateRefreshToken(user.id);

    // Store hashed refresh token + reset lockout
    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: await bcrypt.hash(refreshToken, 6),
        lastLoginAt: new Date(),
        lastLoginIp: null, // set by controller
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    logger.info(`User ${user.email} logged in`);

    return {
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: parseExpiresIn(env.JWT_EXPIRES_IN),
      },
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        employee: user.employee,
      },
    };
  }

  // ── Register (privileged – only HR/Admin can call) ────────────────────────
  async register(dto: RegisterDto): Promise<AuthUser> {
    // Check duplicate email
    const existing = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) throw Conflict('A user with this email already exists');

    const passwordHash = await bcrypt.hash(dto.password, env.BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        role: dto.role as Role,
        isActive: true,
        isEmailVerified: true, // admin-created accounts are pre-verified
        employee: {
          create: {
            employeeCode: await this.nextEmployeeCode(),
            firstName: dto.firstName,
            lastName: dto.lastName,
            jobTitle: dto.jobTitle,
            departmentId: dto.departmentId,
            employmentStatus: 'ACTIVE',
          },
        },
      },
      include: { employee: { select: EMPLOYEE_SELECT } },
    });

    logger.info(`New user registered: ${user.email} (${user.role})`);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      employee: user.employee,
    };
  }

  // ── Refresh access token ──────────────────────────────────────────────────
  async refresh(dto: RefreshDto): Promise<AuthTokens> {
    let payload: { sub: string };
    try {
      payload = jwt.verify(dto.refreshToken, env.JWT_REFRESH_SECRET) as { sub: string };
    } catch {
      throw Unauthorized('Invalid or expired refresh token');
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub, deletedAt: null },
      include: { employee: { select: { id: true } } },
    });

    if (!user || !user.refreshToken) throw Unauthorized('Session not found. Please login.');
    if (!user.isActive) throw Unauthorized('Account is deactivated');

    // Validate stored refresh token
    const tokenMatches = await bcrypt.compare(dto.refreshToken, user.refreshToken);
    if (!tokenMatches) throw Unauthorized('Refresh token is invalid');

    // Issue new pair
    const newAccess = generateAccessToken(user.id, user.email, user.role, user.employee?.id);
    const newRefresh = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(newRefresh, 6) },
    });

    return {
      accessToken: newAccess,
      refreshToken: newRefresh,
      expiresIn: parseExpiresIn(env.JWT_EXPIRES_IN),
    };
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  async logout(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    logger.info(`User ${userId} logged out`);
  }

  // ── Get current user ──────────────────────────────────────────────────────
  async getMe(userId: string): Promise<AuthUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      include: { employee: { select: EMPLOYEE_SELECT } },
    });

    if (!user) throw NotFound('User');

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      employee: user.employee,
    };
  }

  // ── Change password ───────────────────────────────────────────────────────
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw NotFound('User');

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw BadRequest('Current password is incorrect');

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: await bcrypt.hash(dto.newPassword, env.BCRYPT_ROUNDS),
        refreshToken: null, // force re-login everywhere
      },
    });
  }

  // ── Forgot password ───────────────────────────────────────────────────────
  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // Always succeed silently (don't reveal if email exists)
    if (!user || !user.isActive) return;

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpires: expires },
    });

    // TODO: send email via notification service
    logger.info(`Password reset token generated for ${user.email}: ${token}`);
  }

  // ── Reset password ────────────────────────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: dto.token,
        passwordResetExpires: { gt: new Date() },
      },
    });

    if (!user) throw BadRequest('Password reset token is invalid or has expired');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(dto.password, env.BCRYPT_ROUNDS),
        passwordResetToken: null,
        passwordResetExpires: null,
        refreshToken: null,
        loginAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private async nextEmployeeCode(): Promise<string> {
    const last = await prisma.employee.findFirst({
      orderBy: { employeeCode: 'desc' },
      select: { employeeCode: true },
    });
    const n = last ? parseInt(last.employeeCode.replace('EMP-', ''), 10) + 1 : 1;
    return `EMP-${String(n).padStart(4, '0')}`;
  }
}

export const authService = new AuthService();
