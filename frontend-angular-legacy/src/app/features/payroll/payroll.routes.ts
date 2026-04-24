import { Routes } from '@angular/router';
import { PayrollListComponent } from './payroll-list/payroll-list.component';
import { PayrollGenerateComponent } from './payroll-generate/payroll-generate.component';
import { PayrollDetailComponent } from './payroll-detail/payroll-detail.component';
import { payrollListResolver, payrollDetailResolver } from './payroll.resolvers';

export const PAYROLL_ROUTES: Routes = [
  {
    path: '',
    component: PayrollListComponent,
    resolve: { payrolls: payrollListResolver }
  },
  {
    path: 'generate',
    component: PayrollGenerateComponent
  },
  {
    path: ':id',
    component: PayrollDetailComponent,
    resolve: { payroll: payrollDetailResolver }
  }
];
