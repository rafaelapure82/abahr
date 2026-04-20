import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendOk, sendCreated, sendNoContent } from '../../common/utils/response';
import { LeavesService } from './Leaves.service';

export class LeavesController {
  static list = asyncHandler(async (req: Request, res: Response) => {
    const result = await LeavesService.findAll(req.query as never);
    res.json({ success: true, ...result });
  });

  static show = asyncHandler(async (req: Request, res: Response) => {
    const item = await LeavesService.findById(req.params.id);
    sendOk(res, item);
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const item = await LeavesService.create(req.body);
    sendCreated(res, item);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const item = await LeavesService.update(req.params.id, req.body);
    sendOk(res, item);
  });

  static remove = asyncHandler(async (req: Request, res: Response) => {
    await LeavesService.remove(req.params.id);
    sendNoContent(res);
  });
}
