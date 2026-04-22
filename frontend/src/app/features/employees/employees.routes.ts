import { Routes } from '@angular/router';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { EmployeeDetailComponent } from './employee-detail/employee-detail.component';
import { employeeListResolver, employeeDetailResolver } from './employees.resolvers';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    component: EmployeeListComponent,
    resolve: { employees: employeeListResolver }
  },
  {
    path: 'new',
    component: EmployeeFormComponent
  },
  {
    path: ':id',
    component: EmployeeDetailComponent,
    resolve: { employee: employeeDetailResolver }
  },
  {
    path: ':id/edit',
    component: EmployeeFormComponent
  }
];
