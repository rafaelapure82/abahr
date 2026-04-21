import { Router } from 'express';
import { onboardingController } from './Onboarding.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { 
  AssignOnboardingDtoSchema, OnboardingQuerySchema, 
  CreateOnboardingTemplateDtoSchema, UpdateOnboardingTaskDtoSchema 
} from './Onboarding.types';

const router = Router();

// All routes require authentication
router.use(authJWT);

// ─── Templates ────────────────────────────────────────────────────────────
router.get(
  '/templates',
  rbac(['READ:ONBOARDING', 'MANAGE:ALL']),
  asyncHandler(onboardingController.listTemplates)
);

router.get(
  '/templates/:id',
  rbac(['READ:ONBOARDING', 'MANAGE:ALL']),
  asyncHandler(onboardingController.getTemplate)
);

router.post(
  '/templates',
  rbac(['CREATE:ONBOARDING', 'MANAGE:ALL']),
  validate(CreateOnboardingTemplateDtoSchema),
  asyncHandler(onboardingController.createTemplate)
);

// ─── Onboarding Instances ──────────────────────────────────────────────────
router.get(
  '/',
  rbac(['READ:ONBOARDING', 'MANAGE:ALL']),
  validate(OnboardingQuerySchema, 'query'),
  asyncHandler(onboardingController.list)
);

router.get(
  '/:id',
  rbac(['READ:ONBOARDING', 'MANAGE:ALL']),
  asyncHandler(onboardingController.getById)
);

router.post(
  '/initiate',
  rbac(['CREATE:ONBOARDING', 'MANAGE:ALL']),
  validate(AssignOnboardingDtoSchema),
  asyncHandler(onboardingController.initiate)
);

router.patch(
  '/tasks/:taskId',
  rbac(['UPDATE:ONBOARDING', 'MANAGE:ALL']),
  validate(UpdateOnboardingTaskDtoSchema),
  asyncHandler(onboardingController.updateTask)
);

export const onboardingRouter = router;
