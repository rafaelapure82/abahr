import { z } from 'zod';

export const reportQuerySchema = z.object({
  type: z.enum(['EMPLOYEE_LIST', 'PAYROLL_SUMMARY', 'ATTENDANCE_REPORT', 'LEAVE_SUMMARY']).optional(),
  format: z.enum(['PDF', 'XLSX', 'CSV']).default('PDF'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  departmentId: z.string().optional(),
});

export type ReportQuery = z.infer<typeof reportQuerySchema>;
