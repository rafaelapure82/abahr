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



// Public Check-In/Out (QR/Manual)
attendanceRouter.post('/public-register', AttendanceController.publicRegister);

// All routes below require authentication
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

attendanceRouter.post(
  '/', 
  rbac(['MANAGE:ATTENDANCE', 'MANAGE:ALL']), 
  AttendanceController.create
);

attendanceRouter.patch(
  '/:id', 
  rbac(['MANAGE:ATTENDANCE', 'MANAGE:ALL']), 
  AttendanceController.update
);

attendanceRouter.delete(
  '/:id', 
  rbac(['MANAGE:ATTENDANCE', 'MANAGE:ALL']), 
  AttendanceController.remove
);



