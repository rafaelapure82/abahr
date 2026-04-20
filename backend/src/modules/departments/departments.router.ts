import { Router } from 'express';

export const departmentsRouter = Router();

// TODO: implement departments routes
departmentsRouter.get('/', (_req, res) => {
  res.json({ success: true, module: 'departments', message: 'Module ready' });
});
