import { Router } from 'express';
import { Role } from '@prisma/client';
import { OnboardingController } from './Onboarding.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { OnboardingQuerySchema } from './Onboarding.types';

export const OnboardingRouter = Router();

OnboardingRouter.use(authJWT);

OnboardingRouter.get(
  '/',
  rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_MANAGER),
  validate(OnboardingQuerySchema, 'query'),
  OnboardingController.list,
);

OnboardingRouter.get('/:id',  OnboardingController.show);
OnboardingRouter.post('/',    rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER), OnboardingController.create);
OnboardingRouter.patch('/:id',rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER), OnboardingController.update);
OnboardingRouter.delete('/:id',rbac(Role.SUPER_ADMIN, Role.HR_ADMIN), OnboardingController.remove);
