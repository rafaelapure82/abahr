// ── Custom API Error ──────────────────────────────────────────────────────────
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: Record<string, string[]>;

  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// ── Error factories ───────────────────────────────────────────────────────────
export const BadRequest = (msg = 'Bad request', errors?: Record<string, string[]>) =>
  new ApiError(400, msg, true, errors);

export const Unauthorized = (msg = 'Unauthorized') => new ApiError(401, msg);

export const Forbidden = (msg = 'Insufficient permissions') => new ApiError(403, msg);

export const NotFound = (resource = 'Resource') =>
  new ApiError(404, `${resource} not found`);

export const Conflict = (msg: string) => new ApiError(409, msg);

export const UnprocessableEntity = (msg: string, errors?: Record<string, string[]>) =>
  new ApiError(422, msg, true, errors);

export const TooManyRequests = (msg = 'Too many requests') => new ApiError(429, msg);

export const InternalError = (msg = 'Internal server error') =>
  new ApiError(500, msg, false);
