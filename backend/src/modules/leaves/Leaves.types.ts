import { z } from 'zod';
import { LeaveStatus, LeaveType } from '@prisma/client';

export const leaveRequestSchema = z.object({
  leaveType: z.nativeEnum(LeaveType),
  startDate: z.string().transform(v => new Date(v)),
  endDate: z.string().transform(v => new Date(v)),
  reason: z.string().min(5),
  isHalfDay: z.boolean().optional().default(false),
});

export const leaveReviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  managerComments: z.string().optional(),
});

export const leavePolicySchema = z.object({
  name: z.string(),
  leaveType: z.nativeEnum(LeaveType),
  description: z.string().optional(),
  daysAllowed: z.number().min(0),
  isPaid: z.boolean().default(true),
  requireApproval: z.boolean().default(true),
});

export const leavesQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  employeeId: z.string().uuid().optional(),
  status: z.nativeEnum(LeaveStatus).optional(),
});

export type LeaveRequestDto = z.infer<typeof leaveRequestSchema>;
export type LeaveReviewDto = z.infer<typeof leaveReviewSchema>;
export type LeavePolicyDto = z.infer<typeof leavePolicySchema>;
export type LeavesQuery = z.infer<typeof leavesQuerySchema>;
