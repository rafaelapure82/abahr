import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { PayrollService } from '../../core/services/payroll.service';

export const payrollListResolver: ResolveFn<any> = () => {
  return inject(PayrollService).list();
};

export const payrollDetailResolver: ResolveFn<any> = (route) => {
  const id = route.paramMap.get('id');
  if (!id) throw new Error('Payroll ID is required');
  return inject(PayrollService).getById(id);
};
