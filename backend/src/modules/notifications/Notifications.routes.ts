import { Router } from 'express';
import { Role } from '@prisma/client';
import { NotificationsController } from './Notifications.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { NotificationsQuerySchema } from './Notifications.types';

export const NotificationsRouter = Router();

NotificationsRouter.use(authJWT);

NotificationsRouter.get(
  '/',
  rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_MANAGER),
  validate(NotificationsQuerySchema, 'query'),
  NotificationsController.list,
);

NotificationsRouter.get('/:id',  NotificationsController.show);
NotificationsRouter.post('/',    rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER), NotificationsController.create);
NotificationsRouter.patch('/:id',rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER), NotificationsController.update);
NotificationsRouter.delete('/:id',rbac(Role.SUPER_ADMIN, Role.HR_ADMIN), NotificationsController.remove);
