import { Request, Response } from 'express';
import { offboardingService } from './Offboarding.service';
import { sendOk, sendCreated } from '../../common/utils/response';

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
    const result = await offboardingService.findAll(req.query as any);
    return sendOk(res, result);
  }

  async getById(req: Request, res: Response) {
    const offboarding = await offboardingService.findById(req.params.id);
    return sendOk(res, offboarding);
  }

  async initiate(req: Request, res: Response) {
    const result = await offboardingService.initiate(req.body);
    return sendCreated(res, result);
  }

  async updateTask(req: Request, res: Response) {
    const actorId = (req as any).user?.id;
    const task = await offboardingService.updateTaskStatus(req.params.taskId, req.body, actorId);
    return sendOk(res, task);
  }
}

export const offboardingController = new OffboardingController();
