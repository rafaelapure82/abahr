import { Request, Response } from 'express';
import { offboardingService } from './Offboarding.service';
import { sendOk, sendCreated, sendPaginated } from '../../common/utils/response';

export class OffboardingController {
  
  // ─── Templates ────────────────────────────────────────────────────────────
  
  async listTemplates(_req: Request, res: Response) {
    const templates = await offboardingService.findAllTemplates();
    return sendOk(res, templates);
  }

  async getTemplate(req: Request, res: Response) {
    const template = await offboardingService.findTemplateById(req.params.id);
    return sendOk(res, template);
  }

  async createTemplate(req: Request, res: Response) {
    const template = await offboardingService.createTemplate(req.body);
    return sendCreated(res, template);
  }

  // ─── Offboarding Instances ─────────────────────────────────────────────────

  async list(req: Request, res: Response) {
    const { data, meta } = await offboardingService.findAll(req.query as any);
    return sendPaginated(res, data, meta);
  }

  async getById(req: Request, res: Response) {
    const offboarding = await offboardingService.findById(req.params.id);
    return sendOk(res, offboarding);
  }

  async initiate(req: Request, res: Response) {
    const result = await offboardingService.initiate(req.body);
    return sendCreated(res, result);
  }

  async update(req: Request, res: Response) {
    const result = await offboardingService.update(req.params.id, req.body);
    return sendOk(res, result);
  }

  async updateTask(req: Request, res: Response) {
    const actorId = (req as any).user?.id;
    const task = await offboardingService.updateTaskStatus(req.params.taskId, req.body, actorId);
    return sendOk(res, task);
  }

  async export(req: Request, res: Response) {
    const csv = await offboardingService.exportReport();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=offboarding_report.csv');
    return res.send(csv);
  }
}

export const offboardingController = new OffboardingController();
