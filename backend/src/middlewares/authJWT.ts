import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { Unauthorized } from '../common/utils/apiError';

// ── Extend Express Request type ───────────────────────────────────────────────
export interface JwtPayload {
  sub: string;       // userId
  email: string;
  role: string;
  employeeId?: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
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
    // Support Bearer token in Authorization header
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

    // Verify user is still active in DB (catches deactivated accounts)
    const user = await prisma.user.findUnique({
      where: { id: payload.sub, deletedAt: null },
      select: { id: true, isActive: true, role: true },
    });

    if (!user) throw Unauthorized('User not found');
    if (!user.isActive) throw Unauthorized('Account is deactivated');

    // Attach to request
    req.user = payload;
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
    req.user = payload;
  } catch {
    // Silently ignore invalid tokens for optional routes
  }
  next();
};
