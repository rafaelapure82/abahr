import { Router } from 'express';
import { Role } from '@prisma/client';
import { EmployeesController } from './employees.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac, rbacOrSelf } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { auditLog } from '../../middlewares/auditLog';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  updateStatusSchema,
  employeeQuerySchema,
} from './employees.types';

export const employeesRouter = Router();

const HR_ROLES = [Role.SUPER_ADMIN, Role.HR_ADMIN, Role.HR_MANAGER];
const MGR_ROLES = [...HR_ROLES, Role.DEPARTMENT_MANAGER];

// All employee routes require authentication
employeesRouter.use(authJWT);

// Self-service
employeesRouter.get('/me', EmployeesController.me);

// Stats (HR+)
employeesRouter.get('/stats', rbac(...HR_ROLES), EmployeesController.stats);

// List employees
employeesRouter.get(
  '/',
  rbac(...MGR_ROLES),
  validate(employeeQuerySchema, 'query'),
  EmployeesController.list,
);

// Get single employee (HR sees all; employee sees self)
employeesRouter.get(
  '/:id',
  rbacOrSelf('id', ...MGR_ROLES),
  EmployeesController.show,
);

// Org path & team (HR or self)
employeesRouter.get('/:id/team',     rbac(...MGR_ROLES), EmployeesController.team);
employeesRouter.get('/:id/org-path', EmployeesController.orgPath);

// Create (HR only)
employeesRouter.post(
  '/',
  rbac(...HR_ROLES),
  validate(createEmployeeSchema),
  auditLog({ action: 'CREATE', resource: 'Employee' }),
  EmployeesController.create,
);

// Update (HR or self for own profile)
employeesRouter.patch(
  '/:id',
  rbacOrSelf('id', ...MGR_ROLES),
  validate(updateEmployeeSchema),
  auditLog({ action: 'UPDATE', resource: 'Employee' }),
  EmployeesController.update,
);

// Update employment status (HR only)
employeesRouter.patch(
  '/:id/status',
  rbac(...HR_ROLES),
  validate(updateStatusSchema),
  auditLog({ action: 'UPDATE', resource: 'Employee', getResourceId: (r) => r.params.id }),
  EmployeesController.updateStatus,
);

// Soft delete (super admin only)
employeesRouter.delete(
  '/:id',
  rbac(Role.SUPER_ADMIN),
  auditLog({ action: 'SOFT_DELETE', resource: 'Employee' }),
  EmployeesController.remove,
);
