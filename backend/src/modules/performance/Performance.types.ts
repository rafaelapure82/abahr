import { z } from 'zod';

// Reviews, goals, 360 feedback
export const PerformanceQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});
export type PerformanceQuery = z.infer<typeof PerformanceQuerySchema>;
