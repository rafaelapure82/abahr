import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendOk, sendCreated } from '../../common/utils/response';
import { attendanceService } from './Attendance.service';

export class AttendanceController {
  
  static checkIn = asyncHandler(async (req: Request, res: Response) => {
    const employeeId = req.user!.id; // Assumes req.user is populated with employeeId/userId
    const attendance = await attendanceService.checkIn(employeeId, req.body);
    sendCreated(res, attendance, 'Checked in successfully');
  });

  static checkOut = asyncHandler(async (req: Request, res: Response) => {
    const employeeId = req.user!.id;
    const attendance = await attendanceService.checkOut(employeeId, req.body);
    sendOk(res, attendance, 'Checked out successfully');
  });

  static getMyToday = asyncHandler(async (req: Request, res: Response) => {
    const status = await attendanceService.getMyToday(req.user!.id);
    sendOk(res, status || { status: 'ABSENT', checkIn: null });
  });

  static list = asyncHandler(async (req: Request, res: Response) => {
    const result = await attendanceService.findAll(req.query as any);
    sendOk(res, result);
  });

  static stats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await attendanceService.getDashboardStats();
    sendOk(res, stats);
  });
}



