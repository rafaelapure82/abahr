import { Router } from 'express';
import { PerformanceController } from './Performance.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';

const router = Router();

router.use(authJWT);

// Templates
router.post('/templates', rbac(['MANAGE:PERFORMANCE', 'MANAGE:ALL']), PerformanceController.createTemplate);
router.get('/templates', PerformanceController.getTemplates);

// Cycles & Reviews
router.post('/cycles', rbac(['MANAGE:PERFORMANCE', 'MANAGE:ALL']), PerformanceController.createCycle);
router.get('/reviews', rbac(['MANAGE:PERFORMANCE', 'MANAGE:ALL']), PerformanceController.listReviews);
router.get('/reviews/:id', PerformanceController.getReview);

// Feedback Actions
router.post('/reviews/:id/submit-self', PerformanceController.submitSelf);
router.post('/reviews/:id/submit-manager', rbac(['MANAGE:PERFORMANCE', 'MANAGE:ALL']), PerformanceController.submitManager);
router.post('/reviews/:id/share', rbac(['MANAGE:PERFORMANCE', 'MANAGE:ALL']), PerformanceController.share);

// 360 Feedback
router.post('/reviews/:id/request-feedback', rbac(['MANAGE:PERFORMANCE', 'MANAGE:ALL']), PerformanceController.requestFeedback);
router.post('/feedback/:id/submit', PerformanceController.submitFeedback);

// Reports
router.get('/reports/:employeeId', rbac(['MANAGE:PERFORMANCE', 'MANAGE:ALL']), PerformanceController.getReport);

// Goals
router.get('/goals', PerformanceController.listGoals);
router.post('/goals', PerformanceController.upsertGoal);
router.put('/goals/:id', PerformanceController.upsertGoal);

export const performanceRouter = router;
