import { Router } from 'express';

export const attendanceRouter = Router();

// TODO: implement attendance routes
attendanceRouter.get('/', (_req, res) => {
  res.json({ success: true, module: 'attendance', message: 'Module ready' });
});
