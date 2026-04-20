import { z } from 'zod';

// Executive KPIs and analytics
export const DashboardQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});
export type DashboardQuery = z.infer<typeof DashboardQuerySchema>;
