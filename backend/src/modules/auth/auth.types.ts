import { z } from 'zod';

// ── Login ─────────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
export type LoginDto = z.infer<typeof loginSchema>;

// ── Register (HR creates user) ────────────────────────────────────────────────
export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Min 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: z
    .enum([
      'SUPER_ADMIN',
      'HR_ADMIN',
      'HR_MANAGER',
      'DEPARTMENT_MANAGER',
      'PAYROLL_ADMIN',
      'RECRUITER',
      'EMPLOYEE',
      'VIEWER',
    ])
    .default('EMPLOYEE'),
  jobTitle: z.string().min(1).max(150),
  departmentId: z.string().uuid().optional(),
});
export type RegisterDto = z.infer<typeof registerSchema>;

// ── Refresh token ─────────────────────────────────────────────────────────────
export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshDto = z.infer<typeof refreshSchema>;

// ── Change password ───────────────────────────────────────────────────────────
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/)
      .regex(/[^A-Za-z0-9]/),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;

// ── Forgot/Reset password ─────────────────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;

// ── Auth response ─────────────────────────────────────────────────────────────
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;       // seconds
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  employee?: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    displayName: string | null;
    jobTitle: string;
    avatarUrl: string | null;
    departmentId: string | null;
  } | null;
}
