import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendOk, sendCreated, sendNoContent } from '../../common/utils/response';
import { employeesService } from './Employees.service';
import { BadRequest } from '../../common/utils/apiError';

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
    const actorId = req.user?.sub;
    const employee = await employeesService.create(req.body, actorId);
    sendCreated(res, employee, 'Employee created successfully');
  });

  // PATCH /employees/:id
  static update = asyncHandler(async (req: Request, res: Response) => {
    const actorId = req.user?.sub;
    const employee = await employeesService.update(req.params.id, req.body, actorId);
    sendOk(res, employee, 'Employee updated successfully');
  });

  // PATCH /employees/:id/bank-info
  static updateBankInfo = asyncHandler(async (req: Request, res: Response) => {
    const actorId = req.user?.sub;
    const employee = await employeesService.updateBankInfo(req.params.id, req.body, actorId);
    sendOk(res, employee, 'Bank information updated');
  });

  // PATCH /employees/:id/emergency-contact
  static updateEmergencyContact = asyncHandler(async (req: Request, res: Response) => {
    const actorId = req.user?.sub;
    const employee = await employeesService.updateEmergencyContact(req.params.id, req.body, actorId);
    sendOk(res, employee, 'Emergency contact updated');
  });

  // GET /employees/:id/history
  static getHistory = asyncHandler(async (req: Request, res: Response) => {
    const history = await employeesService.getAuditHistory(req.params.id);
    sendOk(res, history);
  });

  // ── Documents ───────────────────────────────────────────────────────────
  
  // POST /employees/:id/documents
  static uploadDoc = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw BadRequest('No file uploaded');
    const { type } = req.body;
    if (!type) throw BadRequest('Document type is required');

    const actorId = req.user?.sub;
    const doc = await employeesService.uploadDocument(
      req.params.id, 
      type, 
      {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      },
      actorId
    );

    sendCreated(res, doc, 'Document uploaded successfully');
  });

  // GET /employees/:id/documents
  static listDocs = asyncHandler(async (req: Request, res: Response) => {
    const docs = await employeesService.listDocuments(req.params.id);
    sendOk(res, docs);
  });

  // DELETE /employees/documents/:docId
  static deleteDoc = asyncHandler(async (req: Request, res: Response) => {
    const actorId = req.user?.sub;
    await employeesService.deleteDocument(req.params.docId, actorId);
    sendNoContent(res);
  });

  // ── Legacy / Other ──────────────────────────────────────────────────────

  // DELETE /employees/:id
  static remove = asyncHandler(async (req: Request, res: Response) => {
    await employeesService.softDelete(req.params.id);
    sendNoContent(res);
  });

  // GET /employees/me  (self-service)
  static me = asyncHandler(async (req: Request, res: Response) => {
    const employee = await employeesService.findById(req.user!.sub);
    sendOk(res, employee);
  });
}

