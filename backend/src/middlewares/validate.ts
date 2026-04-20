import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequest } from '../common/utils/apiError';

type RequestSection = 'body' | 'query' | 'params';

/**
 * Zod request validation middleware.
 * Validates and transforms the specified section of the request.
 * Replaces req[section] with the parsed (coerced) value.
 *
 * Usage:
 *   router.post('/', validate(createUserSchema), handler)
 *   router.get('/', validate(querySchema, 'query'), handler)
 */
export const validate =
  (schema: ZodSchema, section: RequestSection = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[section]);

    if (!result.success) {
      const errors = formatZodError(result.error);
      return next(BadRequest('Validation failed', errors));
    }

    // Replace with coerced / transformed values
    (req as Record<string, unknown>)[section] = result.data;
    next();
  };

// ── Format Zod errors into flat field → messages map ─────────────────────────
function formatZodError(error: ZodError): Record<string, string[]> {
  return error.errors.reduce<Record<string, string[]>>((acc, issue) => {
    const field = issue.path.join('.') || 'root';
    if (!acc[field]) acc[field] = [];
    acc[field].push(issue.message);
    return acc;
  }, {});
}
