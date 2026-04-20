import { Router } from 'express';

export const dashboardRouter = Router();

// TODO: implement dashboard routes
dashboardRouter.get('/', (_req, res) => {
  res.json({ success: true, module: 'dashboard', message: 'Module ready' });
});
