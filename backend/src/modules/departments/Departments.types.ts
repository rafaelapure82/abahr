import { z } from 'zod';

// ── Department Schemas ──────────────────────────────────────────────────────────
export const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters'),
  description: z.string().optional(),
  parentId: z.string().uuid().optional().nullable(),
  headId: z.string().uuid().optional().nullable(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color').optional().nullable(),
  icon: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

// ── Position Schemas ────────────────────────────────────────────────────────────
export const createPositionSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  code: z.string().min(2, 'Code is required'),
  description: z.string().optional(),
  departmentId: z.string().uuid('Invalid department ID'),
  level: z.number().int().min(1, 'Level must be at least 1').default(1),
  minSalary: z.number().optional().nullable(),
  maxSalary: z.number().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updatePositionSchema = createPositionSchema.partial();

// ── Office Location Schemas ──────────────────────────────────────────────────────
export const createLocationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  timeZone: z.string().default('UTC'),
  isHQ: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const updateLocationSchema = createLocationSchema.partial();

// ── Query Schemas ───────────────────────────────────────────────────────────────
export const departmentsQuerySchema = z.object({
  page: z.string().optional().transform(Number),
  limit: z.string().optional().transform(Number),
  search: z.string().optional(),
  isActive: z.string().optional().transform(v => v === 'true'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// ── Types ───────────────────────────────────────────────────────────────────────
export type CreateDepartmentDto = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentDto = z.infer<typeof updateDepartmentSchema>;
export type CreatePositionDto = z.infer<typeof createPositionSchema>;
export type UpdatePositionDto = z.infer<typeof updatePositionSchema>;
export type CreateLocationDto = z.infer<typeof createLocationSchema>;
export type UpdateLocationDto = z.infer<typeof updateLocationSchema>;
export type DepartmentsQuery = z.infer<typeof departmentsQuerySchema>;

// Tree Response Structure
export interface DepartmentTree {
  id: string;
  name: string;
  code: string;
  color?: string | null;
  head?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  } | null;
  children: DepartmentTree[];
  _count?: {
    employees: number;
    positions: number;
  };
}

// Org Chart Structure (Employees & Depts)
export interface OrgChartNode {
  id: string;
  type: 'department' | 'employee';
  name: string;
  title?: string;
  avatarUrl?: string | null;
  color?: string | null;
  children: OrgChartNode[];
  data: any;
}
