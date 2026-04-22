import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AttendanceService } from '../../core/services/attendance.service';

export const attendanceListResolver: ResolveFn<any> = () => {
  return inject(AttendanceService).getAll({});
};
