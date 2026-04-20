import { Router } from 'express';
import { Role } from '@prisma/client';
import { LeavesController } from './Leaves.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { LeavesQuerySchema } from './Leaves.types';

export const LeavesRouter = Router();

LeavesRouter.use(authJWT);

LeavesRouter.get(
  '/',
  rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_MANAGER),
  validate(LeavesQuerySchema, 'query'),
  LeavesController.list,
);

LeavesRouter.get('/:id',  LeavesController.show);
LeavesRouter.post('/',    rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER), LeavesController.create);
LeavesRouter.patch('/:id',rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER), LeavesController.update);
LeavesRouter.delete('/:id',rbac(Role.SUPER_ADMIN, Role.HR_ADMIN), LeavesController.remove);
