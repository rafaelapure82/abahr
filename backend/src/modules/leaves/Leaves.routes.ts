import { Router } from 'express';
import { LeavesController } from './Leaves.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { 
  leaveRequestSchema, 
  leaveReviewSchema, 
  leavePolicySchema, 
  leavesQuerySchema 
} from './Leaves.types';

export const leavesRouter = Router();


// All routes require authentication
leavesRouter.use(authJWT);

// ── Self Service ────────────────────────────────────────────────────────────

leavesRouter.post(
  '/', 
  validate(leaveRequestSchema), 
  LeavesController.request
);

leavesRouter.get(
  '/mine', 
  LeavesController.list // Logic inside controller filters by user id
);

// ── Management ───────────────────────────────────────────────────────────────

leavesRouter.get(
  '/', 
  rbac(['READ:LEAVE', 'MANAGE:ALL']), 
  validate(leavesQuerySchema, 'query'),
  LeavesController.list
);

leavesRouter.patch(
  '/:id/review', 
  rbac(['MANAGE:LEAVE', 'MANAGE:ALL']), 
  validate(leaveReviewSchema),
  LeavesController.review
);

// ── Policies ───────────────────────────────────────────────────────────────

leavesRouter.get(
  '/policies', 
  rbac(['READ:LEAVE', 'MANAGE:ALL']), 
  LeavesController.getPolicies
);

leavesRouter.post(
  '/policies', 
  rbac(['MANAGE:LEAVE', 'MANAGE:ALL']), 
  validate(leavePolicySchema),
  LeavesController.createPolicy
);



