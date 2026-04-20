import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<void | Response>;

/**
 * Wraps an async route handler and forwards any thrown errors to next().
 * Eliminates repetitive try/catch in every controller.
 */
export const asyncHandler =
  (fn: AsyncFn): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
