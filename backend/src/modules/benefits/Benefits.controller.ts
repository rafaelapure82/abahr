import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendOk, sendCreated, sendNoContent } from '../../common/utils/response';
import { benefitsService } from './Benefits.service';

export class BenefitsController {
  static list = asyncHandler(async (req: Request, res: Response) => {
    const result = await benefitsService.findAll(req.query as never);
    res.json({ success: true, ...result });
  });

  static show = asyncHandler(async (req: Request, res: Response) => {
    const item = await benefitsService.findById(req.params.id);
    sendOk(res, item);
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const item = await benefitsService.create(req.body);
    sendCreated(res, item);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const item = await benefitsService.update(req.params.id, req.body);
    sendOk(res, item);
  });

  static remove = asyncHandler(async (req: Request, res: Response) => {
    await benefitsService.remove(req.params.id);
    sendNoContent(res);
  });
}

