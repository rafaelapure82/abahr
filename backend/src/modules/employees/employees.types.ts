import { z } from 'zod';
import { EmploymentType, EmploymentStatus, Gender, MaritalStatus, PayrollFrequency } from '@prisma/client';

// ── Pagination / Filter ───────────────────────────────────────────────────────
export const employeeQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(), // general search
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  employeeCode: z.string().optional(),
  document: z.string().optional(), // Search by Tax ID or National ID
  departmentId: z.string().uuid().optional(),
  status: z.nativeEnum(EmploymentStatus).optional(),
  type: z.nativeEnum(EmploymentType).optional(),
  managerId: z.string().uuid().optional(),
  
  // Advanced Filter Additions
  minSalary: z.coerce.number().optional(),
  maxSalary: z.coerce.number().optional(),
  hireDateStart: z.string().optional(),
  hireDateEnd: z.string().optional(),

  sortBy: z.enum(['firstName', 'lastName', 'hireDate', 'jobTitle', 'createdAt', 'baseSalary']).default('firstName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});
export type EmployeeQuery = z.infer<typeof employeeQuerySchema>;

// ── Emergency Contact ──────────────────────────────────────────────────────────
export const emergencyContactSchema = z.object({
  emergencyName: z.string().min(2),
  emergencyPhone: z.string().min(5),
  emergencyRelation: z.string().min(2),
});
export type EmergencyContactDto = z.infer<typeof emergencyContactSchema>;

// ── Bank Information ────────────────────────────────────────────────────────────
export const bankInfoSchema = z.object({
  bankName: z.string().min(2),
  bankAccountNumber: z.string().min(5),
  bankRoutingNumber: z.string().optional(),
  taxId: z.string().optional(),
});
export type BankInfoDto = z.infer<typeof bankInfoSchema>;

// ── Create Employee ───────────────────────────────────────────────────────────
export const createEmployeeSchema = z.object({
  // Auth
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
  roleIds: z.array(z.string().uuid()).optional(), // Updated for Dynamic RBAC

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
  nationalId: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  linkedinUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  twitterUrl: z.string().url().optional(),
  personalWebsiteUrl: z.string().url().optional(),

  // Address
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),

  // Emergency (Optional at creation)
  ...emergencyContactSchema.partial().shape,

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
  ...bankInfoSchema.partial().shape,

  // Settings
  isRemote: z.boolean().default(false),
  timeZone: z.string().default('UTC'),
});
export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>;

// ── Update Employee ───────────────────────────────────────────────────────────
export const updateEmployeeSchema = createEmployeeSchema
  .omit({ email: true, password: true, roleIds: true })
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
