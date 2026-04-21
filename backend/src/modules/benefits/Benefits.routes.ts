import { Router } from 'express';
import { Role } from '@prisma/client';
import { BenefitsController } from './Benefits.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { BenefitsQuerySchema } from './Benefits.types';

export const benefitsRouter = Router();


benefitsRouter.use(authJWT);

benefitsRouter.get(
  '/',
  rbac(['SUPER_ADMIN', 'HR_ADMIN', 'HR_MANAGER', 'DEPARTMENT_MANAGER']),
  validate(BenefitsQuerySchema, 'query'),
  BenefitsController.list,
);

benefitsRouter.get('/:id',  BenefitsController.show);
benefitsRouter.post('/',    rbac(['SUPER_ADMIN', 'HR_ADMIN', 'HR_MANAGER']), BenefitsController.create);
benefitsRouter.patch('/:id',rbac(['SUPER_ADMIN', 'HR_ADMIN', 'HR_MANAGER']), BenefitsController.update);
benefitsRouter.delete('/:id',rbac(['SUPER_ADMIN', 'HR_ADMIN']), BenefitsController.remove);



