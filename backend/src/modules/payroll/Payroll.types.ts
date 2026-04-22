import { z } from 'zod';
import { PayrollStatus, PayrollFrequency, BonusType, DeductionType } from '@prisma/client';

export const createPayrollPeriodSchema = z.object({
  name: z.string().min(3),
  frequency: z.nativeEnum(PayrollFrequency),
  startDate: z.string().transform(v => new Date(v)),
  endDate: z.string().transform(v => new Date(v)),
  payDate: z.string().transform(v => new Date(v)),
  departmentId: z.string().uuid().optional(),
});

export const payrollItemSchema = z.object({
  baseSalary: z.number().min(0),
  regularHours: z.number().min(0).optional(),
  overtimeHours: z.number().min(0).optional(),
  deductions: z.array(z.object({
    type: z.nativeEnum(DeductionType),
    name: z.string(),
    amount: z.number().min(0),
    percentage: z.number().optional()
  })).optional(),
  bonuses: z.array(z.object({
    type: z.nativeEnum(BonusType),
    name: z.string(),
    amount: z.number().min(0)
  })).optional(),
});

export const payrollQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  status: z.nativeEnum(PayrollStatus).optional(),
});

export type CreatePayrollPeriodDto = z.infer<typeof createPayrollPeriodSchema>;
export type PayrollItemDto = z.infer<typeof payrollItemSchema>;
export type PayrollQuery = z.infer<typeof payrollQuerySchema>;
