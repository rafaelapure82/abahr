import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendOk, sendNoContent } from '../../common/utils/response';
import { notificationsService } from './Notifications.service';

export class NotificationsController {
  
  static list = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await notificationsService.findAll({ ...req.query, userId } as any);
    sendOk(res, result);
  });

  static markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const updated = await notificationsService.markAsRead(req.params.id, userId);
    sendOk(res, updated, 'Notification marked as read');
  });

  static markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await notificationsService.markAllAsRead(userId);
    sendOk(res, null, 'All notifications marked as read');
  });

  static remove = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await notificationsService.remove(req.params.id, userId);
    sendNoContent(res);
  });
}



