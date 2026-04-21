import { Routes } from '@angular/router';

export const PERFORMANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./performance-dashboard/performance-dashboard.component').then(m => m.PerformanceDashboardComponent)
  },
  {
    path: 'reviews/:id',
    loadComponent: () => import('./review-detail/review-detail.component').then(m => m.ReviewDetailComponent)
  }
];
