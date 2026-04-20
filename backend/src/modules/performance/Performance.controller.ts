import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendOk, sendCreated, sendNoContent } from '../../common/utils/response';
import { PerformanceService } from './Performance.service';

export class PerformanceController {
  static list = asyncHandler(async (req: Request, res: Response) => {
    const result = await PerformanceService.findAll(req.query as never);
    res.json({ success: true, ...result });
  });

  static show = asyncHandler(async (req: Request, res: Response) => {
    const item = await PerformanceService.findById(req.params.id);
    sendOk(res, item);
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const item = await PerformanceService.create(req.body);
    sendCreated(res, item);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const item = await PerformanceService.update(req.params.id, req.body);
    sendOk(res, item);
  });

  static remove = asyncHandler(async (req: Request, res: Response) => {
    await PerformanceService.remove(req.params.id);
    sendNoContent(res);
  });
}
