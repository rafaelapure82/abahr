import { Router } from 'express';

export const recruitmentRouter = Router();

// TODO: implement recruitment routes
recruitmentRouter.get('/', (_req, res) => {
  res.json({ success: true, module: 'recruitment', message: 'Module ready' });
});
