import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendOk } from '../../common/utils/response';
import { auditLogsService } from './AuditLogs.service';
import { NotFound } from '../../common/utils/apiError';

export class AuditLogsController {
  // GET /audit-logs
  static list = asyncHandler(async (req: Request, res: Response) => {
    const result = await auditLogsService.findAll(req.query as any);
    res.json({ success: true, ...result });
  });

  // GET /audit-logs/stats
  static stats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await auditLogsService.getStats();
    sendOk(res, stats);
  });

  // GET /audit-logs/:id
  static show = asyncHandler(async (req: Request, res: Response) => {
    const log = await auditLogsService.findById(req.params.id);
    if (!log) throw NotFound('Audit Log');
    sendOk(res, log);
  });
}
