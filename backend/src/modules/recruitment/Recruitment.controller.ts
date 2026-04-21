import { Request, Response, NextFunction } from 'express';
import { recruitmentService } from './Recruitment.service';
import { 
  RecruitmentQuerySchema, 
  CreateJobPostingSchema, 
  ApplyJobSchema,
  MoveStageSchema 
} from './Recruitment.types';
import { validate } from '../../middlewares/validate';
import { BadRequest } from '../../common/utils/apiError';

export class RecruitmentController {
  
  // ── Job Postings ──────────────────────────────────────────────────────────

  async getAllJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const query = RecruitmentQuerySchema.parse(req.query);
      const result = await recruitmentService.findAllJobs(query);
      res.json(result);
    } catch (err) { next(err); }
  }

  async getJob(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await recruitmentService.findJobById(req.params.id);
      res.json(job);
    } catch (err) { next(err); }
  }

  async createJob(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = CreateJobPostingSchema.parse(req.body);
      const job = await recruitmentService.createJob(dto);
      res.status(201).json(job);
    } catch (err) { next(err); }
  }

  async updateJob(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await recruitmentService.updateJob(req.params.id, req.body);
      res.json(job);
    } catch (err) { next(err); }
  }

  async deleteJob(req: Request, res: Response, next: NextFunction) {
    try {
      await recruitmentService.removeJob(req.params.id);
      res.status(204).end();
    } catch (err) { next(err); }
  }

  // ── Applications ──────────────────────────────────────────────────────────

  async apply(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = ApplyJobSchema.parse(req.body);
      const application = await recruitmentService.applyToJob(dto);
      res.status(201).json(application);
    } catch (err) { next(err); }
  }

  async getJobApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const apps = await recruitmentService.getApplicationsByJob(req.params.jobId);
      res.json(apps);
    } catch (err) { next(err); }
  }

  async getApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const app = await recruitmentService.getApplicationDetails(req.params.id);
      res.json(app);
    } catch (err) { next(err); }
  }

  async moveStage(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = MoveStageSchema.parse(req.body);
      const updated = await recruitmentService.moveApplicationStage(req.params.id, dto);
      res.json(updated);
    } catch (err) { next(err); }
  }

  async scheduleInterview(req: Request, res: Response, next: NextFunction) {
    try {
      const interview = await recruitmentService.scheduleInterview(req.params.id, req.body);
      res.status(201).json(interview);
    } catch (err) { next(err); }
  }

  async uploadResume(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw BadRequest('No file uploaded');
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      const candidate = await recruitmentService.updateCandidateResume(req.params.candidateId, fileUrl);
      res.json(candidate);
    } catch (err) { next(err); }
  }
}

export const recruitmentController = new RecruitmentController();
