import { Router } from 'express';
import { DashboardController } from './Dashboard.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';

export const dashboardRouter = Router();

// All dashboard routes require authentication
dashboardRouter.use(authJWT);

// Full dashboard (KPIs + charts + activity)
dashboardRouter.get(
  '/',
  rbac(['READ:DASHBOARD', 'MANAGE:ALL']),
  DashboardController.getFullDashboard,
);
