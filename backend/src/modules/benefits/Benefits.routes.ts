import { Router } from 'express';
import { BenefitsController } from './Benefits.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';

const router = Router();

router.use(authJWT);

// Plans
router.post('/plans', rbac(['MANAGE:BENEFITS', 'MANAGE:ALL']), BenefitsController.createPlan);
router.get('/plans', BenefitsController.listPlans);
router.get('/plans/:id', BenefitsController.getPlan);
router.delete('/plans/:id', rbac(['MANAGE:BENEFITS', 'MANAGE:ALL']), BenefitsController.deletePlan);

// Enrollments
router.post('/enroll', BenefitsController.enroll);
router.get('/employee/:employeeId', BenefitsController.listEmployeeBenefits);
router.patch('/enrollments/:id/status', rbac(['MANAGE:BENEFITS', 'MANAGE:ALL']), BenefitsController.updateStatus);

export const benefitsRouter = router;
