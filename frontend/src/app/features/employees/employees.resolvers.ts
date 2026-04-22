import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { EmployeeService, Employee, PaginatedResponse } from '../../core/services/employee.service';

export const employeeListResolver: ResolveFn<PaginatedResponse<Employee>> = () => {
  return inject(EmployeeService).getEmployees({ page: 1, limit: 20, sortBy: 'firstName', sortOrder: 'asc' });
};

export const employeeDetailResolver: ResolveFn<{ data: Employee }> = (route) => {
  const id = route.paramMap.get('id');
  if (!id) throw new Error('Employee ID is required');
  return inject(EmployeeService).getEmployeeById(id);
};
