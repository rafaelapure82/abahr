import { Router } from 'express';

export const reportsRouter = Router();

// TODO: implement reports routes
reportsRouter.get('/', (_req, res) => {
  res.json({ success: true, module: 'reports', message: 'Module ready' });
});
