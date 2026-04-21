import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendOk } from '../../common/utils/response';
import { ReportsService } from './Reports.service';

const reportsService = new ReportsService();

export class ReportsController {
  static generate = asyncHandler(async (req: Request, res: Response) => {
    // Note: Request query validation is handled by middleware
    const result = await reportsService.generateReport(req.query as any);
    sendOk(res, result, 'Report generation started');
  });

  static listAvailable = asyncHandler(async (_req: Request, res: Response) => {
    const list = [
      { id: 'emp-list', name: 'Employee Directory', types: ['PDF', 'XLSX'] },
      { id: 'payroll-sum', name: 'Payroll Summary', types: ['PDF', 'XLSX'] },
      { id: 'attendance-log', name: 'Attendance Detailed Log', types: ['XLSX'] }
    ];
    sendOk(res, list);
  });
}
