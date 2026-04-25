import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { exportsService } from './Exports.service';

export class ExportsController {
  
  static exportEmployees = asyncHandler(async (req: Request, res: Response) => {
    const buffer = await exportsService.exportEmployeesToExcel();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=employees_report.xlsx');
    res.send(buffer);
  });

  static exportPayroll = asyncHandler(async (req: Request, res: Response) => {
    const pdfDoc = await exportsService.exportPayrollToPdf(req.params.id);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payroll_report_${req.params.id}.pdf`);
    
    pdfDoc.pipe(res);
    pdfDoc.end();
  });

  static exportAttendance = asyncHandler(async (req: Request, res: Response) => {
    const buffer = await exportsService.exportAttendanceToExcel(req.query);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.xlsx');
    res.send(buffer);
  });

  static exportAttendancePdf = asyncHandler(async (req: Request, res: Response) => {
    const pdfDoc = await exportsService.exportAttendanceReportPdf(req.query as any);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance_report.pdf');
    
    pdfDoc.pipe(res);
    pdfDoc.end();
  });
}
