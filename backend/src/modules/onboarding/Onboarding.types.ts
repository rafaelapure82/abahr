import { z } from 'zod';

// Onboarding instances and tasks
export const OnboardingQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});
export type OnboardingQuery = z.infer<typeof OnboardingQuerySchema>;
