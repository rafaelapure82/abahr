import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const APP_ROUTES: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'employees',
        loadChildren: () => import('./features/employees/employees.routes').then(m => m.EMPLOYEE_ROUTES)
      },
      {
        path: 'performance',
        loadChildren: () => import('./features/performance/performance.routes').then(m => m.PERFORMANCE_ROUTES)
      },
      {
        path: 'benefits',
        loadChildren: () => import('./features/benefits/benefits.routes').then(m => m.BENEFITS_ROUTES)
      },
      {
        path: 'recruitment',
        loadChildren: () => import('./features/recruitment/recruitment.routes').then(m => m.RECRUITMENT_ROUTES)
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
