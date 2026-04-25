import { Router } from 'express';
import { PayrollController } from './Payroll.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { createPayrollPeriodSchema, payrollQuerySchema } from './Payroll.types';

export const payrollRouter = Router();


// All routes require authentication
payrollRouter.use(authJWT);

payrollRouter.post(
  '/', 
  rbac(['MANAGE:PAYROLL', 'MANAGE:ALL']), 
  validate(createPayrollPeriodSchema), 
  PayrollController.generate
);

payrollRouter.get(
  '/', 
  rbac(['READ:PAYROLL', 'MANAGE:ALL']), 
  validate(payrollQuerySchema, 'query'), 
  PayrollController.list
);

payrollRouter.get(
  '/history', 
  rbac(['READ:PAYROLL', 'SELF:PAYROLL', 'MANAGE:ALL']), 
  validate(payrollQuerySchema, 'query'), 
  PayrollController.getByEmployee
);

payrollRouter.get(
  '/:id', 
  rbac(['READ:PAYROLL', 'MANAGE:ALL']), 
  PayrollController.show
);

payrollRouter.patch(
  '/:id/approve', 
  rbac(['APPROVE:PAYROLL', 'MANAGE:ALL']), 
  PayrollController.approve
);

payrollRouter.get(
  '/item/:itemId/pdf', 
  rbac(['READ:PAYROLL', 'SELF:PAYROLL', 'MANAGE:ALL']), 
  PayrollController.downloadPDF
);

payrollRouter.get(
  '/:id/excel', 
  rbac(['READ:PAYROLL', 'MANAGE:ALL']), 
  PayrollController.exportExcel
);

payrollRouter.get(
  '/:id/summary', 
  rbac(['READ:PAYROLL', 'MANAGE:ALL']), 
  PayrollController.getSummary
);



