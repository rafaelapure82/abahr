import { Router } from 'express';
import { Role } from '@prisma/client';
import { BenefitsController } from './Benefits.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { BenefitsQuerySchema } from './Benefits.types';

export const BenefitsRouter = Router();

BenefitsRouter.use(authJWT);

BenefitsRouter.get(
  '/',
  rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_MANAGER),
  validate(BenefitsQuerySchema, 'query'),
  BenefitsController.list,
);

BenefitsRouter.get('/:id',  BenefitsController.show);
BenefitsRouter.post('/',    rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER), BenefitsController.create);
BenefitsRouter.patch('/:id',rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER), BenefitsController.update);
BenefitsRouter.delete('/:id',rbac(Role.SUPER_ADMIN, Role.HR_ADMIN), BenefitsController.remove);
