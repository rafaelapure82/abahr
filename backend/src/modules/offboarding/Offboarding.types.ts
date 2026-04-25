import { z } from 'zod';
import { BoardingStatus, TaskStatus, TaskCategory } from '@prisma/client';

// ─── Offboarding Template ───────────────────────────────────────────────────
export const CreateOffboardingTemplateDtoSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  isDefault: z.boolean().default(false),
  tasks: z.array(z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    category: z.nativeEnum(TaskCategory).default('OTHER'),
    order: z.number().default(0),
    dueDays: z.number().default(-3), // Negative = days before termination
    roleId: z.string().uuid().optional(),
    isRequired: z.boolean().default(true),
    checklistItems: z.array(z.string()).default([]),
  })).optional(),
});

export type CreateOffboardingTemplateDto = z.infer<typeof CreateOffboardingTemplateDtoSchema>;

// ─── Offboarding Initiation ─────────────────────────────────────────────────
export const InitiateOffboardingDtoSchema = z.object({
  employeeId: z.string(),
  templateId: z.string().optional(),
  lastWorkDay: z.string(),
  exitInterviewAt: z.string().optional(),
  exitReason: z.string().optional(),
  hrOwnerId: z.string().optional(),
  notes: z.string().optional(),
});

export type InitiateOffboardingDto = z.infer<typeof InitiateOffboardingDtoSchema>;

// ─── Offboarding Task Update ────────────────────────────────────────────────
export const UpdateOffboardingTaskDtoSchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  notes: z.string().optional(),
  checklistItems: z.array(z.object({
    label: z.string().min(1),
    done: z.boolean().default(false),
  })).optional(),
  assignedToId: z.string().uuid().optional(),
});

export type UpdateOffboardingTaskDto = z.infer<typeof UpdateOffboardingTaskDtoSchema>;

// ─── Query Schema ───────────────────────────────────────────────────────────
export const OffboardingQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  employeeId: z.string().optional(),
  status: z.nativeEnum(BoardingStatus).optional(),
  search: z.string().optional(),
});

export type OffboardingQuery = z.infer<typeof OffboardingQuerySchema>;
