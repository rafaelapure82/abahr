import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendOk, sendCreated, sendNoContent } from '../../common/utils/response';
import { dashboardService } from './Dashboard.service';

export class DashboardController {
  static list = asyncHandler(async (req: Request, res: Response) => {
    const result = await dashboardService.findAll(req.query as never);
    res.json({ success: true, ...result });
  });

  static show = asyncHandler(async (req: Request, res: Response) => {
    const item = await dashboardService.findById(req.params.id);
    sendOk(res, item);
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const item = await dashboardService.create(req.body);
    sendCreated(res, item);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const item = await dashboardService.update(req.params.id, req.body);
    sendOk(res, item);
  });

  static remove = asyncHandler(async (req: Request, res: Response) => {
    await dashboardService.remove(req.params.id);
    sendNoContent(res);
  });
}

