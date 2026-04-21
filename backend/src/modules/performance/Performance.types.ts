import { z } from 'zod';
import { 
  ReviewStatus, PerformanceRating, GoalStatus, GoalPriority 
} from '@prisma/client';

export const createReviewCycleSchema = z.object({
  name: z.string().min(3),
  startDate: z.string().transform(v => new Date(v)),
  endDate: z.string().transform(v => new Date(v)),
  dueDate: z.string().transform(v => new Date(v)),
});

export const selfReviewSchema = z.object({
  selfRating: z.nativeEnum(PerformanceRating),
  selfComments: z.string().optional(),
});

export const managerReviewSchema = z.object({
  managerStrengths: z.string().min(5),
  managerImprovements: z.string().min(5),
  managerComments: z.string().optional(),
  overallRating: z.nativeEnum(PerformanceRating),
  criteria: z.array(z.object({
    id: z.string().uuid().optional(), // for existing criteria
    name: z.string(),
    weight: z.number().min(1).max(100),
    managerRating: z.nativeEnum(PerformanceRating),
    managerComment: z.string().optional(),
  })),
});

export const goalSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  status: z.nativeEnum(GoalStatus).optional(),
  priority: z.nativeEnum(GoalPriority).optional(),
  progress: z.number().min(0).max(100).optional(),
  dueDate: z.string().optional().transform(v => v ? new Date(v) : undefined),
  kpi: z.string().optional(),
});

export const performanceQuerySchema = z.object({
  page: z.string().optional().transform(Number),
  limit: z.string().optional().transform(Number),
  status: z.nativeEnum(ReviewStatus).optional(),
  employeeId: z.string().uuid().optional(),
});

export type CreateReviewCycleDto = z.infer<typeof createReviewCycleSchema>;
export type SelfReviewDto = z.infer<typeof selfReviewSchema>;
export type ManagerReviewDto = z.infer<typeof managerReviewSchema>;
export type GoalDto = z.infer<typeof goalSchema>;
export type PerformanceQuery = z.infer<typeof performanceQuerySchema>;
