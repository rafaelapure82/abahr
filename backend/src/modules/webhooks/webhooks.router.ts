import { Router } from 'express';

export const webhooksRouter = Router();

// TODO: implement webhooks routes
webhooksRouter.get('/', (_req, res) => {
  res.json({ success: true, module: 'webhooks', message: 'Module ready' });
});
