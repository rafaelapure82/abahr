import { Routes } from '@angular/router';
import { AttendanceDashboardComponent } from './attendance-dashboard/attendance-dashboard.component';
import { AttendanceListComponent } from './attendance-list/attendance-list.component';
import { attendanceListResolver } from './attendance.resolvers';

export const ATTENDANCE_ROUTES: Routes = [
  {
    path: '',
    component: AttendanceDashboardComponent
  },
  {
    path: 'records',
    component: AttendanceListComponent,
    resolve: { records: attendanceListResolver }
  }
];
