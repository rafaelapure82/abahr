import { Routes } from '@angular/router';
import { DepartmentListComponent } from './department-list/department-list.component';
import { OrgChartComponent } from './org-chart/org-chart.component';

export const DEPARTMENT_ROUTES: Routes = [
  {
    path: '',
    component: DepartmentListComponent
  },
  {
    path: 'org-chart',
    component: OrgChartComponent
  }
];
