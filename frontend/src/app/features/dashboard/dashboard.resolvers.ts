import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';

export const dashboardStatsResolver: ResolveFn<any> = () => {
  return inject(DashboardService).getDashboard('month');
};
