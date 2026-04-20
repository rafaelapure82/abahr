import { Router } from 'express';

export const authRouter = Router();

// TODO: implement auth routes
authRouter.get('/', (_req, res) => {
  res.json({ success: true, module: 'auth', message: 'Module ready' });
});
