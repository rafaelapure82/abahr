import { z } from 'zod';
import { ReviewStatus, PerformanceRating, GoalStatus, GoalPriority } from '@prisma/client';

export const PerformanceQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  status: z.nativeEnum(ReviewStatus).optional(),
  employeeId: z.string().uuid().optional(),
});

export type PerformanceQuery = z.infer<typeof PerformanceQuerySchema>;

export const CreateTemplateSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  criteria: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    weight: z.number().int().min(1).max(100),
  })),
});

export type CreateTemplateDto = z.infer<typeof CreateTemplateSchema>;

export const CreateReviewCycleSchema = z.object({
  name: z.string().min(3),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  dueDate: z.string().datetime(),
  templateId: z.string().uuid().optional(),
});

export type CreateReviewCycleDto = z.infer<typeof CreateReviewCycleSchema>;

export const SelfReviewSchema = z.object({
  selfRating: z.nativeEnum(PerformanceRating),
  selfComments: z.string().optional(),
  criteria: z.array(z.object({
    criterionId: z.string().uuid(),
    selfRating: z.nativeEnum(PerformanceRating),
    selfComment: z.string().optional(),
  })).optional(),
});

export type SelfReviewDto = z.infer<typeof SelfReviewSchema>;

export const ManagerReviewSchema = z.object({
  managerComments: z.string().optional(),
  managerStrengths: z.string().optional(),
  managerImprovements: z.string().optional(),
  overallRating: z.nativeEnum(PerformanceRating),
  criteria: z.array(z.object({
    criterionId: z.string().uuid(),
    managerRating: z.nativeEnum(PerformanceRating),
    managerComment: z.string().optional(),
  })),
});

export type ManagerReviewDto = z.infer<typeof ManagerReviewSchema>;

export const Feedback360Schema = z.object({
  giverId: z.string().uuid(),
  receiverId: z.string().uuid(),
  reviewId: z.string().uuid(),
  relationship: z.string(),
  rating: z.nativeEnum(PerformanceRating).optional(),
  comments: z.string().optional(),
  strengths: z.string().optional(),
  improvements: z.string().optional(),
  isAnonymous: z.boolean().default(true),
});

export type Feedback360Dto = z.infer<typeof Feedback360Schema>;

export const GoalSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  status: z.nativeEnum(GoalStatus).default('NOT_STARTED'),
  priority: z.nativeEnum(GoalPriority).default('MEDIUM'),
  progress: z.number().min(0).max(100).default(0),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  kpi: z.string().optional(),
});

export type GoalDto = z.infer<typeof GoalSchema>;
