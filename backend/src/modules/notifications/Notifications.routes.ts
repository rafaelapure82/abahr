import { Router } from 'express';
import { NotificationsController } from './Notifications.controller';
import { authJWT } from '../../middlewares/authJWT';
import { validate } from '../../middlewares/validate';
import { notificationsQuerySchema } from './Notifications.types';

export const notificationsRouter = Router();


// Notifications are always user-specific
notificationsRouter.use(authJWT);

notificationsRouter.get(
  '/', 
  validate(notificationsQuerySchema, 'query'), 
  NotificationsController.list
);

notificationsRouter.patch(
  '/read-all', 
  NotificationsController.markAllAsRead
);

notificationsRouter.patch(
  '/:id/read', 
  NotificationsController.markAsRead
);

notificationsRouter.delete(
  '/:id', 
  NotificationsController.remove
);



