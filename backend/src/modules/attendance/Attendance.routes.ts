import { Router } from 'express';
import { AttendanceController } from './Attendance.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { 
  checkInSchema, 
  checkOutSchema, 
  attendanceQuerySchema 
} from './Attendance.types';

export const attendanceRouter = Router();


// All routes require authentication
attendanceRouter.use(authJWT);

// ── Self Service ────────────────────────────────────────────────────────────

attendanceRouter.get('/mine/today', AttendanceController.getMyToday);

attendanceRouter.post(
  '/check-in', 
  validate(checkInSchema), 
  AttendanceController.checkIn
);

attendanceRouter.post(
  '/check-out', 
  validate(checkOutSchema), 
  AttendanceController.checkOut
);

// ── Management ───────────────────────────────────────────────────────────────

attendanceRouter.get(
  '/', 
  rbac(['READ:ATTENDANCE', 'MANAGE:ALL']), 
  validate(attendanceQuerySchema, 'query'),
  AttendanceController.list
);

attendanceRouter.get(
  '/stats', 
  rbac(['READ:ATTENDANCE', 'MANAGE:ALL']), 
  AttendanceController.stats
);



