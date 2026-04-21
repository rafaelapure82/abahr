import { Router } from 'express';
import { recruitmentController } from './Recruitment.controller';
import { authJWT } from '../../middlewares/authJWT';
import { rbac } from '../../middlewares/rbac';
import { upload } from '../../middlewares/upload';

const router = Router();

// Publicly accessible (e.g. for external job board)
router.get('/jobs', recruitmentController.getAllJobs);
router.get('/jobs/:id', recruitmentController.getJob);
router.post('/apply', recruitmentController.apply);

// Protected routes (HR/Admin only)
router.use(authJWT);

// Job Management
router.post('/jobs', rbac(['MANAGE:RECRUITMENT', 'MANAGE:ALL']), recruitmentController.createJob);
router.patch('/jobs/:id', rbac(['MANAGE:RECRUITMENT', 'MANAGE:ALL']), recruitmentController.updateJob);
router.delete('/jobs/:id', rbac(['MANAGE:RECRUITMENT', 'MANAGE:ALL']), recruitmentController.deleteJob);

// Application & Selection Pipeline
router.get('/applications/:id', rbac(['READ:RECRUITMENT', 'MANAGE:ALL']), recruitmentController.getApplication);
router.get('/jobs/:jobId/applications', rbac(['READ:RECRUITMENT', 'MANAGE:ALL']), recruitmentController.getJobApplications);
router.post('/applications/:id/move', rbac(['MANAGE:RECRUITMENT', 'MANAGE:ALL']), recruitmentController.moveStage);
router.post('/applications/:id/interview', rbac(['MANAGE:RECRUITMENT', 'MANAGE:ALL']), recruitmentController.scheduleInterview);
router.post('/candidates/:candidateId/resume', upload.single('resume'), recruitmentController.uploadResume);

export { router as recruitmentRouter };
