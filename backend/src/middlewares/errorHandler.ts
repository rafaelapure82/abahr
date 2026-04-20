import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { ApiError } from '../common/utils/apiError';
import { logger } from '../config/logger';

// ── Centralized error handler ─────────────────────────────────────────────────
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const isProd = process.env.NODE_ENV === 'production';

  // ── ApiError (our own) ───────────────────────────────────────────────────
  if (err instanceof ApiError) {
    logger.warn(`[${req.method}] ${req.path} → ${err.statusCode}: ${err.message}`);
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        ...(err.errors && { errors: err.errors }),
        ...(isProd ? {} : { stack: err.stack }),
      },
    });
    return;
  }

  // ── Zod validation error (unhandled) ────────────────────────────────────
  if (err instanceof ZodError) {
    const errors = err.errors.reduce<Record<string, string[]>>((acc, issue) => {
      const field = issue.path.join('.') || 'root';
      if (!acc[field]) acc[field] = [];
      acc[field].push(issue.message);
      return acc;
    }, {});

    res.status(422).json({ success: false, error: { message: 'Validation error', errors } });
    return;
  }

  // ── Prisma errors ────────────────────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const field = (err.meta?.target as string[])?.join(', ') ?? 'field';
        res.status(409).json({
          success: false,
          error: { message: `A record with this ${field} already exists` },
        });
        return;
      }
      case 'P2025':
        res.status(404).json({ success: false, error: { message: 'Record not found' } });
        return;
      case 'P2003':
        res.status(400).json({ success: false, error: { message: 'Related record not found' } });
        return;
      case 'P2014':
        res.status(400).json({ success: false, error: { message: 'Invalid relation' } });
        return;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({ success: false, error: { message: 'Invalid data provided' } });
    return;
  }

  // ── JWT errors ───────────────────────────────────────────────────────────
  if (err instanceof Error && err.name === 'JsonWebTokenError') {
    res.status(401).json({ success: false, error: { message: 'Invalid token' } });
    return;
  }

  if (err instanceof Error && err.name === 'TokenExpiredError') {
    res.status(401).json({ success: false, error: { message: 'Token expired' } });
    return;
  }

  // ── Unexpected errors ────────────────────────────────────────────────────
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error(`[${req.method}] ${req.path} → 500: ${error.message}`, {
    stack: error.stack,
    body: req.body,
  });

  res.status(500).json({
    success: false,
    error: {
      message: isProd ? 'Internal server error' : error.message,
      ...(isProd ? {} : { stack: error.stack }),
    },
  });
};

// ── 404 handler ───────────────────────────────────────────────────────────────
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: { message: `Route [${req.method}] ${req.path} not found` },
  });
};
