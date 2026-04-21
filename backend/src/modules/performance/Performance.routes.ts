import { Router } from 'express';
import { PerformanceController } from './Performance.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { 
  createReviewCycleSchema, 
  selfReviewSchema, 
  managerReviewSchema, 
  goalSchema,
  performanceQuerySchema 
} from './Performance.types';

export const performanceRouter = Router();


// All routes require authentication
performanceRouter.use(authJWT);

// ── Cycles ──────────────────────────────────────────────────────────────────

performanceRouter.post(
  '/cycles', 
  rbac(['MANAGE:PERFORMANCE', 'MANAGE:ALL']), 
  validate(createReviewCycleSchema), 
  PerformanceController.createCycle
);

// ── Reviews ─────────────────────────────────────────────────────────────────

performanceRouter.get(
  '/reviews', 
  rbac(['READ:PERFORMANCE', 'MANAGE:ALL']), 
  validate(performanceQuerySchema, 'query'),
  PerformanceController.listReviews
);

performanceRouter.get(
  '/reviews/:id', 
  PerformanceController.getReview
);

performanceRouter.patch(
  '/reviews/:id/self', 
  validate(selfReviewSchema),
  PerformanceController.submitSelf
);

performanceRouter.patch(
  '/reviews/:id/manager', 
  rbac(['MANAGE:PERFORMANCE', 'MANAGE:ALL']), // Or custom logic for direct manager
  validate(managerReviewSchema),
  PerformanceController.submitManager
);

performanceRouter.patch(
  '/reviews/:id/share', 
  rbac(['MANAGE:PERFORMANCE', 'MANAGE:ALL']), 
  PerformanceController.share
);

// ── Goals ───────────────────────────────────────────────────────────────────

performanceRouter.get(
  '/goals', 
  PerformanceController.listGoals
);

performanceRouter.post(
  '/goals', 
  validate(goalSchema),
  PerformanceController.upsertGoal
);

performanceRouter.patch(
  '/goals/:id', 
  validate(goalSchema),
  PerformanceController.upsertGoal
);




