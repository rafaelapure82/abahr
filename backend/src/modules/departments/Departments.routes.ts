import { Router } from 'express';
import { Role } from '@prisma/client';
import { DepartmentsController } from './Departments.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { DepartmentsQuerySchema } from './Departments.types';

export const DepartmentsRouter = Router();

DepartmentsRouter.use(authJWT);

DepartmentsRouter.get(
  '/',
  rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_MANAGER),
  validate(DepartmentsQuerySchema, 'query'),
  DepartmentsController.list,
);

DepartmentsRouter.get('/:id',  DepartmentsController.show);
DepartmentsRouter.post('/',    rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER), DepartmentsController.create);
DepartmentsRouter.patch('/:id',rbac(Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER), DepartmentsController.update);
DepartmentsRouter.delete('/:id',rbac(Role.SUPER_ADMIN, Role.HR_ADMIN), DepartmentsController.remove);
