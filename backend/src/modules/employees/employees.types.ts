import { z } from 'zod';
import { EmploymentType, EmploymentStatus, Gender, MaritalStatus, PayrollFrequency } from '@prisma/client';

// ── Pagination / Filter ───────────────────────────────────────────────────────
export const employeeQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  status: z.nativeEnum(EmploymentStatus).optional(),
  type: z.nativeEnum(EmploymentType).optional(),
  managerId: z.string().uuid().optional(),
  sortBy: z.enum(['firstName','lastName','hireDate','jobTitle','createdAt']).default('firstName'),
  sortOrder: z.enum(['asc','desc']).default('asc'),
});
export type EmployeeQuery = z.infer<typeof employeeQuerySchema>;

// ── Create Employee ───────────────────────────────────────────────────────────
export const createEmployeeSchema = z.object({
  // Auth
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
  role: z.enum(['HR_ADMIN','HR_MANAGER','DEPARTMENT_MANAGER','PAYROLL_ADMIN','RECRUITER','EMPLOYEE','VIEWER']).default('EMPLOYEE'),

  // Personal
  firstName: z.string().min(1).max(100),
  middleName: z.string().optional(),
  lastName: z.string().min(1).max(100),
  gender: z.nativeEnum(Gender).optional(),
  dateOfBirth: z.string().datetime({ offset: true }).optional(),
  maritalStatus: z.nativeEnum(MaritalStatus).optional(),
  nationality: z.string().optional(),
  personalPhone: z.string().optional(),
  workPhone: z.string().optional(),
  personalEmail: z.string().email().optional(),

  // Address
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),

  // Emergency
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelation: z.string().optional(),

  // Employment
  jobTitle: z.string().min(1).max(150),
  employmentType: z.nativeEnum(EmploymentType).default(EmploymentType.FULL_TIME),
  hireDate: z.string().datetime({ offset: true }).optional(),
  probationEndDate: z.string().datetime({ offset: true }).optional(),
  departmentId: z.string().uuid().optional(),
  positionId: z.string().uuid().optional(),
  managerId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),

  // Compensation
  baseSalary: z.coerce.number().min(0).default(0),
  currency: z.string().length(3).default('USD'),
  salaryFrequency: z.nativeEnum(PayrollFrequency).default(PayrollFrequency.MONTHLY),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),

  // Settings
  isRemote: z.boolean().default(false),
  timeZone: z.string().default('UTC'),
});
export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>;

// ── Update Employee ───────────────────────────────────────────────────────────
export const updateEmployeeSchema = createEmployeeSchema
  .omit({ email: true, password: true, role: true })
  .partial();
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeSchema>;

// ── Update Employment Status ──────────────────────────────────────────────────
export const updateStatusSchema = z.object({
  status: z.nativeEnum(EmploymentStatus),
  reason: z.string().optional(),
  effectiveDate: z.string().datetime({ offset: true }).optional(),
});
export type UpdateStatusDto = z.infer<typeof updateStatusSchema>;

// ── Response types ────────────────────────────────────────────────────────────
export interface EmployeeListItem {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  displayName: string | null;
  jobTitle: string;
  avatarUrl: string | null;
  employmentStatus: string;
  employmentType: string;
  hireDate: Date;
  department: { id: string; name: string } | null;
  manager: { id: string; firstName: string; lastName: string } | null;
}
