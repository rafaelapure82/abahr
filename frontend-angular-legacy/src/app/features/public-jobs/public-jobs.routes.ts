import { Routes } from '@angular/router';
import { JobListComponent } from './job-list/job-list.component';
import { JobApplyComponent } from './job-apply/job-apply.component';

export const PUBLIC_JOBS_ROUTES: Routes = [
  {
    path: '',
    component: JobListComponent
  },
  {
    path: ':id/apply',
    component: JobApplyComponent
  }
];
