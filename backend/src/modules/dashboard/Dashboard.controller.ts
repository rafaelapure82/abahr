import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendOk } from '../../common/utils/response';
import { dashboardService } from './Dashboard.service';
import type { DashboardQuery } from './Dashboard.types';

export class DashboardController {

  static getFullDashboard = asyncHandler(async (req: Request, res: Response) => {
    const query: DashboardQuery = {
      period: (req.query.period as any) || 'month',
      departmentId: req.query.departmentId as string | undefined,
    };
    const data = await dashboardService.getDashboard(query);
    sendOk(res, data, 'Dashboard data retrieved');
  });
}
