import { Router } from 'express';
import { Role } from '@prisma/client';
import { PayrollController } from './Payroll.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { PayrollQuerySchema } from './Payroll.types';

export const PayrollRouter = Router();

PayrollRouter.use(authJWT);

PayrollRouter.get(
  '/',
  rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_MANAGER),
  validate(PayrollQuerySchema, 'query'),
  PayrollController.list,
);

PayrollRouter.get('/:id',  PayrollController.show);
PayrollRouter.post('/',    rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER), PayrollController.create);
PayrollRouter.patch('/:id',rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER), PayrollController.update);
PayrollRouter.delete('/:id',rbac(Role.SUPER_ADMIN, Role.HR_ADMIN), PayrollController.remove);
