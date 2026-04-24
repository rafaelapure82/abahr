import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { NotificationsPageComponent } from './features/notifications/notifications-page.component';
import { SettingsPageComponent } from './features/settings/settings-page.component';
import { dashboardStatsResolver } from './features/dashboard/dashboard.resolvers';

// Import Route Objects Directly for Eager Loading
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { EMPLOYEE_ROUTES } from './features/employees/employees.routes';
import { PERFORMANCE_ROUTES } from './features/performance/performance.routes';
import { BENEFITS_ROUTES } from './features/benefits/benefits.routes';
import { RECRUITMENT_ROUTES } from './features/recruitment/recruitment.routes';
import { DEPARTMENT_ROUTES } from './features/departments/departments.routes';
import { ATTENDANCE_ROUTES } from './features/attendance/attendance.routes';
import { LEAVES_ROUTES } from './features/leaves/leaves.routes';
import { PAYROLL_ROUTES } from './features/payroll/payroll.routes';
import { ONBOARDING_ROUTES } from './features/onboarding/onboarding.routes';
import { PUBLIC_JOBS_ROUTES } from './features/public-jobs/public-jobs.routes';

export const APP_ROUTES: Routes = [
  {
    path: 'jobs',
    children: PUBLIC_JOBS_ROUTES
  },
  {
    path: 'auth',
    children: AUTH_ROUTES
  },
  {
    path: '',
    canActivate: [authGuard],
    component: MainLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        resolve: { stats: dashboardStatsResolver }
      },
      {
        path: 'employees',
        children: EMPLOYEE_ROUTES
      },
      {
        path: 'performance',
        children: PERFORMANCE_ROUTES
      },
      {
        path: 'benefits',
        children: BENEFITS_ROUTES
      },
      {
        path: 'recruitment',
        children: RECRUITMENT_ROUTES
      },
      {
        path: 'departments',
        children: DEPARTMENT_ROUTES
      },
      {
        path: 'attendance',
        children: ATTENDANCE_ROUTES
      },
      {
        path: 'leaves',
        children: LEAVES_ROUTES
      },
      {
        path: 'payroll',
        children: PAYROLL_ROUTES
      },
      {
        path: 'onboarding',
        children: ONBOARDING_ROUTES
      },
      {
        path: 'notifications',
        component: NotificationsPageComponent
      },
      {
        path: 'settings',
        component: SettingsPageComponent
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
