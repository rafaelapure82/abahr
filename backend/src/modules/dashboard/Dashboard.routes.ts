import { Router } from 'express';
import { Role } from '@prisma/client';
import { DashboardController } from './Dashboard.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { DashboardQuerySchema } from './Dashboard.types';

export const dashboardRouter = Router();


dashboardRouter.use(authJWT);

dashboardRouter.get(
  '/',
  rbac(['SUPER_ADMIN', 'HR_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']),
  validate(DashboardQuerySchema, 'query'),
  DashboardController.list,
);

dashboardRouter.get('/:id',  DashboardController.show);
dashboardRouter.post('/',    rbac(['SUPER_ADMIN', 'HR_ADMIN', 'HR_MANAGER']), DashboardController.create);
dashboardRouter.patch('/:id',rbac(['SUPER_ADMIN', 'HR_ADMIN', 'HR_MANAGER']), DashboardController.update);
dashboardRouter.delete('/:id',rbac(['SUPER_ADMIN', 'HR_ADMIN']), DashboardController.remove);



