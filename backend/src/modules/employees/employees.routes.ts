import { Router } from 'express';
import multer from 'multer';
import os from 'os';
import { EmployeesController } from './Employees.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac, rbacOrSelf } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { auditLog } from '../../middlewares/auditLog';
import { env } from '../../config/env';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  updateStatusSchema,
  employeeQuerySchema,
  emergencyContactSchema,
  bankInfoSchema,
} from './Employees.types';

export const employeesRouter = Router();


// ── Multer Configuration ─────────────────────────────────────────────────────
const upload = multer({
  dest: os.tmpdir(),
  limits: {
    fileSize: (env.MAX_FILE_SIZE_MB || 20) * 1024 * 1024,
  },
});

// Permission sets
const READ_EMP = ['READ:EMPLOYEE', 'MANAGE:ALL'];
const WRITE_EMP = ['CREATE:EMPLOYEE', 'UPDATE:EMPLOYEE', 'MANAGE:ALL'];
const ADMIN_EMP = ['DELETE:EMPLOYEE', 'MANAGE:ALL'];

// All employee routes require authentication
employeesRouter.use(authJWT);

// Self-service
employeesRouter.get('/me', EmployeesController.me);

// Stats (HR+)
employeesRouter.get('/stats', rbac(READ_EMP), EmployeesController.stats);

// List employees (Advanced Search)
employeesRouter.get(
  '/',
  rbac(READ_EMP),
  validate(employeeQuerySchema, 'query'),
  EmployeesController.list,
);

// Get single employee (HR sees all; employee sees self)
employeesRouter.get(
  '/:id',
  rbacOrSelf('id', READ_EMP),
  EmployeesController.show,
);

// Get employee history (Audit Logs)
employeesRouter.get(
  '/:id/history',
  rbac(READ_EMP),
  EmployeesController.getHistory,
);

// Org path & team (HR or self)
employeesRouter.get('/:id/team',     rbac(READ_EMP), EmployeesController.team);
employeesRouter.get('/:id/org-path', EmployeesController.orgPath);

// Create (HR only)
employeesRouter.post(
  '/',
  rbac(WRITE_EMP),
  validate(createEmployeeSchema),
  // Middleware auditLog logs the success/fail of the request
  auditLog({ action: 'CREATE', resource: 'Employee' }),
  EmployeesController.create,
);

// Update (General Profile)
employeesRouter.patch(
  '/:id',
  rbacOrSelf('id', WRITE_EMP),
  validate(updateEmployeeSchema),
  auditLog({ action: 'UPDATE', resource: 'Employee' }),
  EmployeesController.update,
);

// Dedicated Updates (Sub-resources)
employeesRouter.patch(
  '/:id/bank-info',
  rbacOrSelf('id', WRITE_EMP),
  validate(bankInfoSchema),
  EmployeesController.updateBankInfo,
);

employeesRouter.patch(
  '/:id/emergency-contact',
  rbacOrSelf('id', WRITE_EMP),
  validate(emergencyContactSchema),
  EmployeesController.updateEmergencyContact,
);

// Avatar upload
employeesRouter.patch(
  '/:id/avatar',
  rbacOrSelf('id', WRITE_EMP),
  upload.single('avatar'),
  EmployeesController.updateAvatar,
);

// ── Document Management ───────────────────────────────────────────────────

// List docs
employeesRouter.get(
  '/:id/documents',
  rbacOrSelf('id', READ_EMP),
  EmployeesController.listDocs,
);

// Upload doc
employeesRouter.post(
  '/:id/documents',
  rbacOrSelf('id', WRITE_EMP), // Employees can upload their own docs if allowed
  upload.single('file'),
  EmployeesController.uploadDoc,
);

// Delete doc
employeesRouter.delete(
  '/documents/:docId',
  rbac(WRITE_EMP), // Usually HR deletes docs
  EmployeesController.deleteDoc,
);

// ── System / Admin ───────────────────────────────────────────────────────

// Soft delete (super admin only)
employeesRouter.delete(
  '/:id',
  rbac(ADMIN_EMP),
  auditLog({ action: 'SOFT_DELETE', resource: 'Employee' }),
  EmployeesController.remove,
);


