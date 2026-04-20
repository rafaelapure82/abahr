import { z } from 'zod';

// Offboarding instances and tasks
export const OffboardingQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});
export type OffboardingQuery = z.infer<typeof OffboardingQuerySchema>;
