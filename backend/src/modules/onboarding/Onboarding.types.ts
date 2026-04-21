import { z } from 'zod';
import { BoardingStatus, TaskStatus, TaskCategory } from '@prisma/client';

// ─── Shared Schemas ─────────────────────────────────────────────────────────
export const ChecklistItemSchema = z.object({
  label: z.string().min(1),
  done: z.boolean().default(false),
});

// ─── Onboarding Template ────────────────────────────────────────────────────
export const CreateOnboardingTemplateDtoSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
  tasks: z.array(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    category: z.nativeEnum(TaskCategory).default('OTHER'),
    order: z.number().default(0),
    dueDays: z.number().default(7),
    roleId: z.string().uuid().optional(),
    isRequired: z.boolean().default(true),
    checklistItems: z.array(z.string()).default([]),
  })).optional(),
});

export type CreateOnboardingTemplateDto = z.infer<typeof CreateOnboardingTemplateDtoSchema>;

// ─── Onboarding Assignment ──────────────────────────────────────────────────
export const AssignOnboardingDtoSchema = z.object({
  employeeId: z.string().uuid(),
  templateId: z.string().uuid().optional(), // If null, uses default template
  startDate: z.string().datetime().optional(),
  targetDate: z.string().datetime().optional(),
  hrOwnerId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export type AssignOnboardingDto = z.infer<typeof AssignOnboardingDtoSchema>;

// ─── Onboarding Task Update ─────────────────────────────────────────────────
export const UpdateOnboardingTaskDtoSchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  notes: z.string().optional(),
  checklistItems: z.array(ChecklistItemSchema).optional(),
  assignedToId: z.string().uuid().optional(),
});

export type UpdateOnboardingTaskDto = z.infer<typeof UpdateOnboardingTaskDtoSchema>;

// ─── Query Schema ───────────────────────────────────────────────────────────
export const OnboardingQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  employeeId: z.string().uuid().optional(),
  status: z.nativeEnum(BoardingStatus).optional(),
  search: z.string().optional(),
});

export type OnboardingQuery = z.infer<typeof OnboardingQuerySchema>;
