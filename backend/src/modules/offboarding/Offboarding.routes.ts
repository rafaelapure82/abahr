import { Router } from 'express';
import { Role } from '@prisma/client';
import { OffboardingController } from './Offboarding.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { OffboardingQuerySchema } from './Offboarding.types';

export const OffboardingRouter = Router();

OffboardingRouter.use(authJWT);

OffboardingRouter.get(
  '/',
  rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_MANAGER),
  validate(OffboardingQuerySchema, 'query'),
  OffboardingController.list,
);

OffboardingRouter.get('/:id',  OffboardingController.show);
OffboardingRouter.post('/',    rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER), OffboardingController.create);
OffboardingRouter.patch('/:id',rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER), OffboardingController.update);
OffboardingRouter.delete('/:id',rbac(Role.SUPER_ADMIN, Role.HR_ADMIN), OffboardingController.remove);
