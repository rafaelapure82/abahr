import { Routes } from '@angular/router';
import { RecruitmentDashboardComponent } from './recruitment-dashboard/recruitment-dashboard.component';
import { RecruitmentKanbanComponent } from './recruitment-kanban/recruitment-kanban.component';
import { jobListResolver } from './recruitment.resolvers';

export const RECRUITMENT_ROUTES: Routes = [
  {
    path: '',
    component: RecruitmentDashboardComponent,
    resolve: { jobs: jobListResolver }
  },
  {
    path: 'kanban',
    component: RecruitmentKanbanComponent
  }
];
