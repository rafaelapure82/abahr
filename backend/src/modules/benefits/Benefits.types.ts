import { z } from 'zod';

// Benefit plans, employee enrollment
export const BenefitsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});
export type BenefitsQuery = z.infer<typeof BenefitsQuerySchema>;
