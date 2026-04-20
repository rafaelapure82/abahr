import { Request, Response, NextFunction } from 'express';
import { AuditAction } from '@prisma/client';
import { prisma } from '../config/prisma';
import { logger } from '../config/logger';

interface AuditOptions {
  action: AuditAction;
  resource: string;
  getResourceId?: (req: Request) => string | undefined;
}

/**
 * Audit log middleware factory.
 * Logs user actions to the AuditLog table AFTER the response is sent.
 * Usage: router.delete('/:id', authJWT, auditLog({ action: 'DELETE', resource: 'Employee' }), handler)
 */
export const auditLog =
  (options: AuditOptions) =>
  (req: Request, res: Response, next: NextFunction): void => {
    // Save original json function to intercept response
    const originalJson = res.json.bind(res);
    const startTime = Date.now();

    res.json = (body: unknown) => {
      const result = originalJson(body);

      // Fire-and-forget audit log after response
      setImmediate(async () => {
        try {
          const resourceId = options.getResourceId
            ? options.getResourceId(req)
            : req.params.id;

          await prisma.auditLog.create({
            data: {
              userId: req.user?.sub,
              action: options.action,
              resource: options.resource,
              resourceId,
              description: `${options.action} ${options.resource}${resourceId ? ` #${resourceId}` : ''}`,
              ipAddress: req.ip ?? req.socket.remoteAddress,
              userAgent: req.headers['user-agent'],
              duration: Date.now() - startTime,
              isSuccess: res.statusCode < 400,
              errorMessage:
                res.statusCode >= 400
                  ? (body as Record<string, unknown>)?.error?.toString()
                  : undefined,
            },
          });
        } catch (err) {
          logger.warn('Failed to write audit log:', err);
        }
      });

      return result;
    };

    next();
  };

// ── Request ID middleware ──────────────────────────────────────────────────────
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const id = crypto.randomUUID();
  req.headers['x-request-id'] = id;
  res.setHeader('X-Request-ID', id);
  next();
};
