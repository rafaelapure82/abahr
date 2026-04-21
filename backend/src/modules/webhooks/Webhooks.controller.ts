import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendOk, sendCreated, sendNoContent } from '../../common/utils/response';
import { WebhooksService } from './Webhooks.service';

const webhooksService = new WebhooksService();

export class WebhooksController {
  static list = asyncHandler(async (_req: Request, res: Response) => {
    const list = await webhooksService.findAll();
    sendOk(res, list);
  });

  static show = asyncHandler(async (req: Request, res: Response) => {
    const item = await webhooksService.findById(req.params.id);
    sendOk(res, item);
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const item = await webhooksService.create(req.body);
    sendCreated(res, item);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const item = await webhooksService.update(req.params.id, req.body);
    sendOk(res, item);
  });

  static remove = asyncHandler(async (req: Request, res: Response) => {
    await webhooksService.remove(req.params.id);
    sendNoContent(res);
  });
}
