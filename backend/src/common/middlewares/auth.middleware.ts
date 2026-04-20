import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { prisma } from '../../config/prisma';
import { Unauthorized, Forbidden } from './errorHandler';

export interface JwtPayload {
  sub: string;        // userId
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ── Authentication guard ──────────────────────────────────────────────────────
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) throw Unauthorized('No token provided');

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, isActive: true },
    });

    if (!user || !user.isActive) throw Unauthorized('User account is inactive or deleted');

    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      next(Unauthorized('Invalid token'));
    } else {
      next(err);
    }
  }
};

// ── Role-based access control guard ──────────────────────────────────────────
export const authorize = (...roles: string[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(Unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(Forbidden('Insufficient permissions'));
    }
    next();
  };
