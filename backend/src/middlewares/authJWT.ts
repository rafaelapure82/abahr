import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import redis from '../config/redis';
import { Unauthorized } from '../common/utils/apiError';

// ── Extend Express Request type ───────────────────────────────────────────────
export interface JwtPayload {
  sub: string;       // userId
  sid: string;       // sessionId (single session check)
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { id: string };
    }
  }
}

// ── Authentication middleware ─────────────────────────────────────────────────
export const authJWT = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw Unauthorized('No authentication token provided');
    }

    const token = authHeader.split(' ')[1];

    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw Unauthorized('Token expired');
      }
      throw Unauthorized('Invalid token');
    }

    // 1. Single Session Verification (Redis)
    const activeSessionId = await redis.get(`user:session:${payload.sub}`);
    if (!activeSessionId || activeSessionId !== payload.sid) {
      throw Unauthorized('Session expired or invalidated (Logged in elsewhere)');
    }

    // 2. Verify user is still active in DB
    const user = await prisma.user.findUnique({
      where: { id: payload.sub, deletedAt: null },
      select: { id: true, isActive: true },
    });

    if (!user) throw Unauthorized('User not found');
    if (!user.isActive) throw Unauthorized('Account is deactivated');

    // Attach to request
    req.user = { 
      ...payload, 
      id: user.id 
    } as any;

    next();
  } catch (err) {
    next(err);
  }
};

// ── Optional auth (does not block if no token) ────────────────────────────────
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();

  try {
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = payload as any;
  } catch {
    // Silently ignore invalid tokens for optional routes
  }
  next();
};
