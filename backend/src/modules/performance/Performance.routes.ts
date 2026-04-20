import { Router } from 'express';
import { Role } from '@prisma/client';
import { PerformanceController } from './Performance.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { PerformanceQuerySchema } from './Performance.types';

export const PerformanceRouter = Router();

PerformanceRouter.use(authJWT);

PerformanceRouter.get(
  '/',
  rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_MANAGER),
  validate(PerformanceQuerySchema, 'query'),
  PerformanceController.list,
);

PerformanceRouter.get('/:id',  PerformanceController.show);
PerformanceRouter.post('/',    rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER), PerformanceController.create);
PerformanceRouter.patch('/:id',rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER), PerformanceController.update);
PerformanceRouter.delete('/:id',rbac(Role.SUPER_ADMIN, Role.HR_ADMIN), PerformanceController.remove);
