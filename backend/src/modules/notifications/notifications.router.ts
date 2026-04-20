import { Router } from 'express';

export const notificationsRouter = Router();

// TODO: implement notifications routes
notificationsRouter.get('/', (_req, res) => {
  res.json({ success: true, module: 'notifications', message: 'Module ready' });
});
