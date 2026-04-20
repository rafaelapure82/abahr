import { Request, Response, NextFunction } from 'express';
import { logger } from '../../config/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = err.statusCode ?? 500;
  const isProduction = process.env.NODE_ENV === 'production';

  logger.error(`[${req.method}] ${req.path} → ${statusCode}`, {
    message: err.message,
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message: isProduction && statusCode === 500 ? 'Internal server error' : err.message,
      ...(isProduction ? {} : { stack: err.stack }),
    },
  });
};

export class HttpError extends Error implements AppError {
  statusCode: number;
  isOperational = true;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'HttpError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const BadRequest    = (msg: string) => new HttpError(400, msg);
export const Unauthorized  = (msg = 'Unauthorized') => new HttpError(401, msg);
export const Forbidden     = (msg = 'Forbidden') => new HttpError(403, msg);
export const NotFound      = (msg: string) => new HttpError(404, msg);
export const Conflict      = (msg: string) => new HttpError(409, msg);
export const InternalError = (msg = 'Internal server error') => new HttpError(500, msg);
