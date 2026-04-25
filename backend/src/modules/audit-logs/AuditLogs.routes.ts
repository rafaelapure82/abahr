import { Router } from 'express';
import { AuditLogsController } from './AuditLogs.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';

export const auditLogsRouter = Router();

// Require admin permissions to view system-wide logs
const ADMIN_LOGS = ['READ:SETTINGS', 'MANAGE:ALL'];

auditLogsRouter.use(authJWT);
auditLogsRouter.use(rbac(ADMIN_LOGS));

auditLogsRouter.get('/', AuditLogsController.list);
auditLogsRouter.get('/stats', AuditLogsController.stats);
auditLogsRouter.get('/:id', AuditLogsController.show);
