import { Request, Response } from 'express';
import { onboardingService } from './Onboarding.service';
import { sendOk, sendCreated } from '../../common/utils/response';

export class OnboardingController {
  
  // ─── Templates ────────────────────────────────────────────────────────────
  
  async listTemplates(_req: Request, res: Response) {
    const templates = await onboardingService.findAllTemplates();
    return sendOk(res, templates);
  }

  async getTemplate(req: Request, res: Response) {
    const template = await onboardingService.findTemplateById(req.params.id);
    return sendOk(res, template);
  }

  async createTemplate(req: Request, res: Response) {
    const template = await onboardingService.createTemplate(req.body);
    return sendCreated(res, template);
  }

  // ─── Onboarding Instances ──────────────────────────────────────────────────

  async list(req: Request, res: Response) {
    const result = await onboardingService.findAll(req.query as any);
    return sendOk(res, result);
  }

  async getById(req: Request, res: Response) {
    const onboarding = await onboardingService.findById(req.params.id);
    return sendOk(res, onboarding);
  }

  async initiate(req: Request, res: Response) {
    const result = await onboardingService.initiate(req.body);
    return sendCreated(res, result);
  }

  async updateTask(req: Request, res: Response) {
    const actorId = (req as any).user?.id;
    const task = await onboardingService.updateTaskStatus(req.params.taskId, req.body, actorId);
    return sendOk(res, task);
  }
}

export const onboardingController = new OnboardingController();
