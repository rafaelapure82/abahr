import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendOk, sendCreated, sendNoContent } from '../../common/utils/response';
import { employeesService } from './employees.service';

export class EmployeesController {
  // GET /employees
  static list = asyncHandler(async (req: Request, res: Response) => {
    const result = await employeesService.findAll(req.query as never);
    res.json({ success: true, ...result });
  });

  // GET /employees/stats
  static stats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await employeesService.getStats();
    sendOk(res, stats);
  });

  // GET /employees/:id
  static show = asyncHandler(async (req: Request, res: Response) => {
    const employee = await employeesService.findById(req.params.id);
    sendOk(res, employee);
  });

  // GET /employees/:id/team
  static team = asyncHandler(async (req: Request, res: Response) => {
    const team = await employeesService.getTeam(req.params.id);
    sendOk(res, team);
  });

  // GET /employees/:id/org-path
  static orgPath = asyncHandler(async (req: Request, res: Response) => {
    const path = await employeesService.getOrgPath(req.params.id);
    sendOk(res, path);
  });

  // POST /employees
  static create = asyncHandler(async (req: Request, res: Response) => {
    const employee = await employeesService.create(req.body);
    sendCreated(res, employee, 'Employee created successfully');
  });

  // PATCH /employees/:id
  static update = asyncHandler(async (req: Request, res: Response) => {
    const employee = await employeesService.update(req.params.id, req.body);
    sendOk(res, employee, 'Employee updated successfully');
  });

  // PATCH /employees/:id/status
  static updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const employee = await employeesService.updateStatus(req.params.id, req.body);
    sendOk(res, employee, 'Employee status updated');
  });

  // DELETE /employees/:id
  static remove = asyncHandler(async (req: Request, res: Response) => {
    await employeesService.softDelete(req.params.id);
    sendNoContent(res);
  });

  // GET /employees/me  (self-service)
  static me = asyncHandler(async (req: Request, res: Response) => {
    const employee = await employeesService.findByUserId(req.user!.sub);
    sendOk(res, employee);
  });
}
