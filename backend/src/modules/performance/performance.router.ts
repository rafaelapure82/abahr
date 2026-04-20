import { Router } from 'express';

export const performanceRouter = Router();

// TODO: implement performance routes
performanceRouter.get('/', (_req, res) => {
  res.json({ success: true, module: 'performance', message: 'Module ready' });
});
