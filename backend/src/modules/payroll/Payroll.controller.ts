import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendOk, sendCreated, sendNoContent } from '../../common/utils/response';
import { PayrollService } from './Payroll.service';

export class PayrollController {
  static list = asyncHandler(async (req: Request, res: Response) => {
    const result = await PayrollService.findAll(req.query as never);
    res.json({ success: true, ...result });
  });

  static show = asyncHandler(async (req: Request, res: Response) => {
    const item = await PayrollService.findById(req.params.id);
    sendOk(res, item);
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const item = await PayrollService.create(req.body);
    sendCreated(res, item);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const item = await PayrollService.update(req.params.id, req.body);
    sendOk(res, item);
  });

  static remove = asyncHandler(async (req: Request, res: Response) => {
    await PayrollService.remove(req.params.id);
    sendNoContent(res);
  });
}
