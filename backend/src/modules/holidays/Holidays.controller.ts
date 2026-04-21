import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendOk, sendCreated } from '../../common/utils/response';
import { holidaysService } from './Holidays.service';

export class HolidaysController {
  
  static create = asyncHandler(async (req: Request, res: Response) => {
    const holiday = await holidaysService.create(req.body);
    sendCreated(res, holiday, 'Holiday created successfully');
  });

  static list = asyncHandler(async (req: Request, res: Response) => {
    const holidays = await holidaysService.findAll(req.query as any);
    sendOk(res, holidays);
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const holiday = await holidaysService.update(req.params.id, req.body);
    sendOk(res, holiday, 'Holiday updated successfully');
  });

  static delete = asyncHandler(async (req: Request, res: Response) => {
    await holidaysService.delete(req.params.id);
    sendOk(res, null, 'Holiday deleted successfully');
  });
}
