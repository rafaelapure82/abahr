import { Routes } from '@angular/router';
import { PerformanceDashboardComponent } from './performance-dashboard/performance-dashboard.component';
import { ReviewDetailComponent } from './review-detail/review-detail.component';

export const PERFORMANCE_ROUTES: Routes = [
  {
    path: '',
    component: PerformanceDashboardComponent
  },
  {
    path: 'reviews/:id',
    component: ReviewDetailComponent
  }
];
