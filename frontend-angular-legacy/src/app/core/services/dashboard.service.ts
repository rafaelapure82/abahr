import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { resource } from '@angular/core';


export interface KpiCard {
  label: string;
  value: number | string;
  change?: number;
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
  month: string;
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
  timestamp: string;
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

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/dashboard`;

  getDashboard(period: string = 'month', departmentId?: string) {
    let params = new HttpParams().set('period', period);
    if (departmentId) {
      params = params.set('departmentId', departmentId);
    }
    return this.http.get<{ data: DashboardData }>(this.apiUrl, { params });
  }

  private cache = new Map<string, { data: DashboardData; timestamp: number }>();

  getDashboardResource(period: () => string) {
    return resource<{ data: DashboardData }, unknown>({
      loader: async () => {
        const p = period();
        const now = Date.now();
        const cached = this.cache.get(p);
        
        // Return cached data if valid (5 minutes)
        if (cached && (now - cached.timestamp < 300000)) {
          return { data: cached.data };
        }

        const params = new HttpParams().set('period', p);
        const res = await firstValueFrom(this.http.get<{ data: DashboardData }>(this.apiUrl, { params }));
        
        this.cache.set(p, { data: res.data, timestamp: now });
        return res;
      }
    });
  }
}
