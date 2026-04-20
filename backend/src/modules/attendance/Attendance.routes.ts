import { Router } from 'express';
import { Role } from '@prisma/client';
import { AttendanceController } from './Attendance.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { AttendanceQuerySchema } from './Attendance.types';

export const AttendanceRouter = Router();

AttendanceRouter.use(authJWT);

AttendanceRouter.get(
  '/',
  rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_MANAGER),
  validate(AttendanceQuerySchema, 'query'),
  AttendanceController.list,
);

AttendanceRouter.get('/:id',  AttendanceController.show);
AttendanceRouter.post('/',    rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER), AttendanceController.create);
AttendanceRouter.patch('/:id',rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER), AttendanceController.update);
AttendanceRouter.delete('/:id',rbac(Role.SUPER_ADMIN, Role.HR_ADMIN), AttendanceController.remove);
