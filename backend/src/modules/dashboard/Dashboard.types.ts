import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  period: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
  departmentId: z.string().uuid().optional(),
});

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;

export interface KpiCard {
  label: string;
  value: number | string;
  change?: number;     // % change vs previous period
  trend?: 'up' | 'down' | 'flat';
  icon?: string;
}

export interface DepartmentHeadcount {
  departmentId: string;
  departmentName: string;
  count: number;
  color?: string;
}

export interface MonthlyTrend {
  month: string; // "2026-01", "2026-02" ...
  hires: number;
  terminations: number;
  headcount: number;
}

export interface PayrollSummary {
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
  totalBonuses: number;
  employeeCount: number;
  currency: string;
}

export interface LeaveOverview {
  pending: number;
  approved: number;
  rejected: number;
  totalThisMonth: number;
}

export interface RecentActivity {
  id: string;
  type: 'hire' | 'leave' | 'payroll' | 'termination' | 'review' | 'attendance';
  title: string;
  description: string;
  timestamp: Date;
  severity: 'info' | 'success' | 'warning' | 'error';
}

export interface DashboardData {
  kpis: {
    totalEmployees: KpiCard;
    activeEmployees: KpiCard;
    departmentsCount: KpiCard;
    pendingLeaves: KpiCard;
    turnoverRate: KpiCard;
    avgPerformance: KpiCard;
    absenteeismRate: KpiCard;
    payrollCost: KpiCard;
  };
  headcountByDepartment: DepartmentHeadcount[];
  monthlyTrends: MonthlyTrend[];
  payrollSummary: PayrollSummary;
  leaveOverview: LeaveOverview;
  recentActivity: RecentActivity[];
  upcomingBirthdays: { name: string; date: string; departmentName: string }[];
}
