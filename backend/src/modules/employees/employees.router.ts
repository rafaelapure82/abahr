import { Router } from 'express';

export const employeesRouter = Router();

// TODO: implement employees routes
employeesRouter.get('/', (_req, res) => {
  res.json({ success: true, module: 'employees', message: 'Module ready' });
});
