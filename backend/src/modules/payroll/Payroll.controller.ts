import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendOk, sendCreated } from '../../common/utils/response';
import { payrollService } from './Payroll.service';
import { payrollReportService } from './PayrollReport.service';

export class PayrollController {
  
  static generate = asyncHandler(async (req: Request, res: Response) => {
    const result = await payrollService.generatePeriod(req.body);
    sendCreated(res, result, 'Payroll run generated successfully');
  });

  static list = asyncHandler(async (req: Request, res: Response) => {
    const result = await payrollService.findAll(req.query as any);
    sendOk(res, result);
  });

  static show = asyncHandler(async (req: Request, res: Response) => {
    const details = await payrollService.getDetails(req.params.id);
    sendOk(res, details);
  });

  static approve = asyncHandler(async (req: Request, res: Response) => {
    const updated = await payrollService.approve(req.params.id);
    sendOk(res, updated, 'Payroll approved successfully');
  });

  static downloadPDF = asyncHandler(async (req: Request, res: Response) => {
    await payrollReportService.generatePayslipPDF(req.params.itemId, res);
  });

  static exportExcel = asyncHandler(async (req: Request, res: Response) => {
    await payrollReportService.exportToExcel(req.params.id, res);
  });

  static getSummary = asyncHandler(async (req: Request, res: Response) => {
    const summary = await payrollService.getAccountingSummary(req.params.id);
    sendOk(res, summary);
  });
}



