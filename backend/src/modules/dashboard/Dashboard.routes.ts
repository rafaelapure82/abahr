import { Router } from 'express';
import { Role } from '@prisma/client';
import { DashboardController } from './Dashboard.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { DashboardQuerySchema } from './Dashboard.types';

export const DashboardRouter = Router();

DashboardRouter.use(authJWT);

DashboardRouter.get(
  '/',
  rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_MANAGER),
  validate(DashboardQuerySchema, 'query'),
  DashboardController.list,
);

DashboardRouter.get('/:id',  DashboardController.show);
DashboardRouter.post('/',    rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER), DashboardController.create);
DashboardRouter.patch('/:id',rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER), DashboardController.update);
DashboardRouter.delete('/:id',rbac(Role.SUPER_ADMIN, Role.HR_ADMIN), DashboardController.remove);
