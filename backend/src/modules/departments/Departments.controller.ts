import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendOk, sendCreated, sendNoContent } from '../../common/utils/response';
import { departmentsService } from './Departments.service';

export class DepartmentsController {
  
  // ── Departments ────────────────────────────────────────────────────────────

  static list = asyncHandler(async (req: Request, res: Response) => {
    const result = await departmentsService.findAll(req.query as any);
    res.json({ success: true, ...result });
  });

  static getTree = asyncHandler(async (_req: Request, res: Response) => {
    const tree = await departmentsService.getTree();
    sendOk(res, tree);
  });

  static getOrgChart = asyncHandler(async (_req: Request, res: Response) => {
    const chart = await departmentsService.getOrgChart();
    sendOk(res, chart);
  });

  static show = asyncHandler(async (req: Request, res: Response) => {
    const department = await departmentsService.findById(req.params.id);
    sendOk(res, department);
  });

  static create = asyncHandler(async (req: Request, res: Response) => {
    const department = await departmentsService.create(req.body);
    sendCreated(res, department, 'Department created successfully');
  });

  static update = asyncHandler(async (req: Request, res: Response) => {
    const department = await departmentsService.update(req.params.id, req.body);
    sendOk(res, department, 'Department updated successfully');
  });

  static remove = asyncHandler(async (req: Request, res: Response) => {
    await departmentsService.remove(req.params.id);
    sendNoContent(res);
  });

  // ── Positions ──────────────────────────────────────────────────────────────

  static listPositions = asyncHandler(async (req: Request, res: Response) => {
    const positions = await departmentsService.findPositions(req.query);
    sendOk(res, positions);
  });

  static createPosition = asyncHandler(async (req: Request, res: Response) => {
    const position = await departmentsService.createPosition(req.body);
    sendCreated(res, position, 'Position created successfully');
  });

  static updatePosition = asyncHandler(async (req: Request, res: Response) => {
    const position = await departmentsService.updatePosition(req.params.id, req.body);
    sendOk(res, position, 'Position updated successfully');
  });

  // ── Office Locations ────────────────────────────────────────────────────────

  static listLocations = asyncHandler(async (_req: Request, res: Response) => {
    const locations = await departmentsService.findLocations();
    sendOk(res, locations);
  });

  static createLocation = asyncHandler(async (req: Request, res: Response) => {
    const location = await departmentsService.createLocation(req.body);
    sendCreated(res, location, 'Location created successfully');
  });

  static updateLocation = asyncHandler(async (req: Request, res: Response) => {
    const location = await departmentsService.updateLocation(req.params.id, req.body);
    sendOk(res, location, 'Location updated successfully');
  });
}



