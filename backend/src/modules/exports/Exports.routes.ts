import { Router } from 'express';
import { ExportsController } from './Exports.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';

const router = Router();

router.use(authJWT);

router.get('/employees/excel', rbac(['MANAGE:EMPLOYEES', 'MANAGE:ALL']), ExportsController.exportEmployees);
router.get('/attendance/excel', rbac(['READ:ATTENDANCE', 'MANAGE:ALL']), ExportsController.exportAttendance);
router.get('/attendance/pdf', rbac(['READ:ATTENDANCE', 'MANAGE:ALL']), ExportsController.exportAttendancePdf);
router.get('/payroll/:id/pdf', rbac(['MANAGE:PAYROLL', 'MANAGE:ALL']), ExportsController.exportPayroll);

export default router;
