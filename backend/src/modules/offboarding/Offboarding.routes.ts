import { Router } from 'express';
import { offboardingController } from './Offboarding.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { 
  InitiateOffboardingDtoSchema, OffboardingQuerySchema, 
  CreateOffboardingTemplateDtoSchema, UpdateOffboardingTaskDtoSchema 
} from './Offboarding.types';

const router = Router();

// All routes require authentication
router.use(authJWT);

// ─── Templates ────────────────────────────────────────────────────────────
router.get(
  '/templates',
  rbac(['READ:OFFBOARDING', 'MANAGE:ALL']),
  asyncHandler(offboardingController.listTemplates)
);

router.get(
  '/templates/:id',
  rbac(['READ:OFFBOARDING', 'MANAGE:ALL']),
  asyncHandler(offboardingController.getTemplate)
);

router.post(
  '/templates',
  rbac(['CREATE:OFFBOARDING', 'MANAGE:ALL']),
  validate(CreateOffboardingTemplateDtoSchema),
  asyncHandler(offboardingController.createTemplate)
);

// ─── Offboarding Instances ─────────────────────────────────────────────────
router.get(
  '/',
  rbac(['READ:OFFBOARDING', 'MANAGE:ALL']),
  validate(OffboardingQuerySchema, 'query'),
  asyncHandler(offboardingController.list)
);

router.get(
  '/:id',
  rbac(['READ:OFFBOARDING', 'MANAGE:ALL']),
  asyncHandler(offboardingController.getById)
);

router.post(
  '/initiate',
  rbac(['CREATE:OFFBOARDING', 'MANAGE:ALL']),
  validate(InitiateOffboardingDtoSchema),
  asyncHandler(offboardingController.initiate)
);

router.patch(
  '/tasks/:taskId',
  rbac(['UPDATE:OFFBOARDING', 'MANAGE:ALL']),
  validate(UpdateOffboardingTaskDtoSchema),
  asyncHandler(offboardingController.updateTask)
);

export const offboardingRouter = router;
