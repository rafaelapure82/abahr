import { z } from 'zod';
import { JobStatus, EmploymentType, ApplicationStatus, CandidateSource } from '@prisma/client';

export const RecruitmentQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  status: z.nativeEnum(JobStatus).optional(),
  departmentId: z.string().uuid().optional(),
});

export type RecruitmentQuery = z.infer<typeof RecruitmentQuerySchema>;

export const CreateJobPostingSchema = z.object({
  title: z.string().min(3),
  departmentId: z.string().uuid().optional(),
  description: z.string().min(10),
  requirements: z.string().optional(),
  responsibilities: z.string().optional(),
  benefits: z.string().optional(),
  skills: z.array(z.string()).optional(),
  employmentType: z.nativeEnum(EmploymentType).default('FULL_TIME'),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  currency: z.string().default('USD'),
  location: z.string().optional(),
  isRemote: z.boolean().default(false),
  openingsCount: z.coerce.number().default(1),
  closingDate: z.string().datetime().optional().transform(v => v ? new Date(v) : undefined),
  status: z.nativeEnum(JobStatus).default('DRAFT'),
});

export type CreateJobPostingDto = z.infer<typeof CreateJobPostingSchema>;

export const CreateCandidateSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  source: z.nativeEnum(CandidateSource).default('OTHER'),
  skills: z.array(z.string()).optional(),
});

export type CreateCandidateDto = z.infer<typeof CreateCandidateSchema>;

export const ApplyJobSchema = z.object({
  jobId: z.string().uuid(),
  candidateId: z.string().uuid().optional(), // if candidate already exists
  candidate: CreateCandidateSchema.optional(), // if new candidate
  coverLetter: z.string().optional(),
});

export type ApplyJobDto = z.infer<typeof ApplyJobSchema>;

export const MoveStageSchema = z.object({
  status: z.nativeEnum(ApplicationStatus).optional(),
  currentStageId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export type MoveStageDto = z.infer<typeof MoveStageSchema>;
