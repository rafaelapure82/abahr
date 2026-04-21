import { z } from 'zod';
import { BenefitCategory, EnrollmentStatus, EmploymentType } from '@prisma/client';

export const BenefitsQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  category: z.nativeEnum(BenefitCategory).optional(),
});

export type BenefitsQuery = z.infer<typeof BenefitsQuerySchema>;

export const CreateBenefitPlanSchema = z.object({
  name: z.string().min(3),
  category: z.nativeEnum(BenefitCategory),
  description: z.string().optional(),
  provider: z.string().optional(),
  policyNumber: z.string().optional(),
  employerCost: z.coerce.number().optional(),
  employeeCost: z.coerce.number().optional(),
  currency: z.string().default('USD'),
  minTenureDays: z.coerce.number().default(0),
  eligibleTypes: z.array(z.nativeEnum(EmploymentType)).default(['FULL_TIME']),
  enrollmentDeadline: z.string().datetime().optional(),
  effectiveDate: z.string().datetime().optional(),
  expirationDate: z.string().datetime().optional(),
  details: z.any().optional(),
});

export type CreateBenefitPlanDto = z.infer<typeof CreateBenefitPlanSchema>;

export const EnrollBenefitSchema = z.object({
  planId: z.string().uuid(),
  dependents: z.array(z.object({
    name: z.string(),
    dob: z.string(),
    relation: z.string(),
  })).optional(),
  notes: z.string().optional(),
});

export type EnrollBenefitDto = z.infer<typeof EnrollBenefitSchema>;

export const UpdateEnrollmentSchema = z.object({
  status: z.nativeEnum(EnrollmentStatus),
  effectiveAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  waiveReason: z.string().optional(),
});

export type UpdateEnrollmentDto = z.infer<typeof UpdateEnrollmentSchema>;
