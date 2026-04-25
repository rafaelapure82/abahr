import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendOk, sendCreated } from '../../common/utils/response';
import { attendanceService } from './Attendance.service';
import { logger } from '../../config/logger';

export class AttendanceController {
  
  static checkIn = asyncHandler(async (req: Request, res: Response) => {
    const employeeId = req.user!.id; // Assumes req.user is populated with employeeId/userId
    const attendance = await attendanceService.checkIn(employeeId, req.body);
    sendCreated(res, attendance, 'Checked in successfully');
  });

  static publicRegister = asyncHandler(async (req: Request, res: Response) => {
    const { externalId, ...dto } = req.body;
    const attendance = await attendanceService.registerByExternalId(externalId, dto);
    const msg = attendance.checkOut ? 'Salida registrada con éxito' : 'Entrada registrada con éxito';
    sendOk(res, attendance, msg);
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
    logger.debug(`Fetching attendance list with query: ${JSON.stringify(req.query)}`);
    const result = await attendanceService.findAll(req.query as any);
    res.json({ success: true, ...result });
  });

  static stats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await attendanceService.getDashboardStats();
    res.json({ success: true, data: stats });
  });

  static reportStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await attendanceService.getReportStats(req.query);
    res.json({ success: true, data: stats });
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const attendance = await attendanceService.createManual(req.body);
    sendCreated(res, attendance, 'Registro de asistencia creado');
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const attendance = await attendanceService.update(req.params.id, req.body);
    sendOk(res, attendance, 'Registro de asistencia actualizado');
  });

  static remove = asyncHandler(async (req: Request, res: Response) => {
    await attendanceService.softDelete(req.params.id);
    sendOk(res, null, 'Registro de asistencia eliminado');
  });
}
