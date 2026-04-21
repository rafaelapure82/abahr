import { Router } from 'express';
import { ReportsController } from './Reports.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { validate } from '../../middlewares/validate';
import { reportQuerySchema } from './Reports.types';

export const reportsRouter = Router();


const READ_REPORTS = ['READ:REPORT', 'MANAGE:ALL'];

// All routes require authentication
reportsRouter.use(authJWT);

reportsRouter.get('/', rbac(READ_REPORTS), ReportsController.listAvailable);
reportsRouter.get('/generate', rbac(READ_REPORTS), validate(reportQuerySchema, 'query'), ReportsController.generate);


