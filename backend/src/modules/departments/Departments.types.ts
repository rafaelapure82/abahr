import { z } from 'zod';

// Manage org departments, hierarchy and positions
export const DepartmentsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});
export type DepartmentsQuery = z.infer<typeof DepartmentsQuerySchema>;
