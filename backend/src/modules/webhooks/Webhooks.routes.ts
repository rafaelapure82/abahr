import { Router } from 'express';
import { WebhooksController } from './Webhooks.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { webhookCreateSchema, webhookUpdateSchema } from './Webhooks.types';

export const webhooksRouter = Router();


const MANAGE_WEBHOOKS = ['MANAGE:SETTINGS', 'MANAGE:ALL'];

// All routes require authentication
webhooksRouter.use(authJWT);

webhooksRouter.get('/', rbac(MANAGE_WEBHOOKS), WebhooksController.list);
webhooksRouter.get('/:id', rbac(MANAGE_WEBHOOKS), WebhooksController.show);
webhooksRouter.post('/', rbac(MANAGE_WEBHOOKS), validate(webhookCreateSchema), WebhooksController.create);
webhooksRouter.patch('/:id', rbac(MANAGE_WEBHOOKS), validate(webhookUpdateSchema), WebhooksController.update);
webhooksRouter.delete('/:id', rbac(MANAGE_WEBHOOKS), WebhooksController.remove);


