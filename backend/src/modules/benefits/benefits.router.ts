import { Router } from 'express';

export const benefitsRouter = Router();

// TODO: implement benefits routes
benefitsRouter.get('/', (_req, res) => {
  res.json({ success: true, module: 'benefits', message: 'Module ready' });
});
