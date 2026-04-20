import { Router } from 'express';

export const payrollRouter = Router();

// TODO: implement payroll routes
payrollRouter.get('/', (_req, res) => {
  res.json({ success: true, module: 'payroll', message: 'Module ready' });
});
