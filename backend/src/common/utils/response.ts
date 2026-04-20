import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: Record<string, string[]>;
}

// ── Send helpers ──────────────────────────────────────────────────────────────
export const sendOk = <T>(res: Response, data: T, message?: string): Response =>
  res.status(200).json({ success: true, message, data } satisfies ApiResponse<T>);

export const sendCreated = <T>(res: Response, data: T, message?: string): Response =>
  res.status(201).json({ success: true, message: message ?? 'Created successfully', data });

export const sendNoContent = (res: Response): Response => res.status(204).send();

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
  message?: string,
): Response =>
  res.status(200).json({ success: true, message, data, meta } satisfies ApiResponse<T[]>);

// ── Pagination calculator ─────────────────────────────────────────────────────
export const paginate = (
  total: number,
  page: number,
  limit: number,
): PaginationMeta => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
  hasNext: page < Math.ceil(total / limit),
  hasPrev: page > 1,
});

// ── Parse pagination from query ───────────────────────────────────────────────
export const parsePagination = (
  query: Record<string, unknown>,
  defaults = { page: 1, limit: 20, maxLimit: 100 },
): { page: number; limit: number; skip: number } => {
  const page = Math.max(1, parseInt(String(query.page ?? defaults.page), 10));
  const limit = Math.min(
    defaults.maxLimit,
    Math.max(1, parseInt(String(query.limit ?? defaults.limit), 10)),
  );
  return { page, limit, skip: (page - 1) * limit };
};
