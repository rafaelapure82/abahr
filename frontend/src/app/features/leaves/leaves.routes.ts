import { Routes } from '@angular/router';
import { LeavesDashboardComponent } from './leaves-dashboard/leaves-dashboard.component';
import { LeavesAdminComponent } from './leaves-admin/leaves-admin.component';

export const LEAVES_ROUTES: Routes = [
  {
    path: '',
    component: LeavesDashboardComponent
  },
  {
    path: 'admin',
    component: LeavesAdminComponent
  }
];
