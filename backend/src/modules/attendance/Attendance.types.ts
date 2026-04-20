import { z } from 'zod';

// Clock in/out, attendance records, overtime
export const AttendanceQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});
export type AttendanceQuery = z.infer<typeof AttendanceQuerySchema>;
