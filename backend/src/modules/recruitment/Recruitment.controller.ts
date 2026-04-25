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
import { sendOk, sendCreated, sendPaginated } from '../../common/utils/response';

export class RecruitmentController {
  
  // ── Job Postings ──────────────────────────────────────────────────────────

  async getAllJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const query = RecruitmentQuerySchema.parse(req.query);
      const { data, meta } = await recruitmentService.findAllJobs(query);
      return sendPaginated(res, data, meta);
    } catch (err) { next(err); }
  }

  async getJob(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await recruitmentService.findJobById(req.params.id);
      return sendOk(res, job);
    } catch (err) { next(err); }
  }

  async createJob(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = CreateJobPostingSchema.parse(req.body);
      const job = await recruitmentService.createJob(dto);
      return sendCreated(res, job);
    } catch (err) { next(err); }
  }

  async updateJob(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await recruitmentService.updateJob(req.params.id, req.body);
      return sendOk(res, job);
    } catch (err) { next(err); }
  }

  async deleteJob(req: Request, res: Response, next: NextFunction) {
    try {
      await recruitmentService.removeJob(req.params.id);
      return res.status(204).end();
    } catch (err) { next(err); }
  }

  // ── Applications ──────────────────────────────────────────────────────────

  async apply(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = ApplyJobSchema.parse(req.body);
      const application = await recruitmentService.applyToJob(dto);
      return sendCreated(res, application);
    } catch (err) { next(err); }
  }

  async getJobApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const apps = await recruitmentService.getApplicationsByJob(req.params.jobId);
      return sendOk(res, apps);
    } catch (err) { next(err); }
  }

  async getApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const app = await recruitmentService.getApplicationDetails(req.params.id);
      return sendOk(res, app);
    } catch (err) { next(err); }
  }

  async moveStage(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = MoveStageSchema.parse(req.body);
      const updated = await recruitmentService.moveApplicationStage(req.params.id, dto);
      return sendOk(res, updated);
    } catch (err) { next(err); }
  }

  async scheduleInterview(req: Request, res: Response, next: NextFunction) {
    try {
      const interview = await recruitmentService.scheduleInterview(req.params.id, req.body);
      return sendCreated(res, interview);
    } catch (err) { next(err); }
  }

  async uploadResume(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw BadRequest('No file uploaded');
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      const candidate = await recruitmentService.updateCandidateResume(req.params.candidateId, fileUrl);
      return sendOk(res, candidate);
    } catch (err) { next(err); }
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await recruitmentService.getStats();
      return sendOk(res, stats);
    } catch (err) { next(err); }
  }

  async downloadOfferLetter(req: Request, res: Response, next: NextFunction) {
    try {
      const pdfDoc = await recruitmentService.generateOfferLetterPdf(req.params.id);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=offer_letter_${req.params.id}.pdf`);
      
      pdfDoc.pipe(res);
      pdfDoc.end();
    } catch (err) { next(err); }
  }

  async signOfferLetter(req: Request, res: Response, next: NextFunction) {
    try {
      const { signatureData } = req.body;
      const updated = await recruitmentService.saveHrSignature(req.params.id, signatureData);
      return sendOk(res, updated);
    } catch (err) { next(err); }
  }
}

export const recruitmentController = new RecruitmentController();
