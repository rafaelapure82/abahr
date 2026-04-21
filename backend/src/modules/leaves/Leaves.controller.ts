import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendOk, sendCreated } from '../../common/utils/response';
import { leavesService } from './Leaves.service';

export class LeavesController {
  
  static request = asyncHandler(async (req: Request, res: Response) => {
    const employeeId = req.user!.id; // Assumes req.user.id is the employee's ID
    const request = await leavesService.requestLeave(employeeId, req.body);
    sendCreated(res, request, 'Leave request submitted successfully');
  });

  static review = asyncHandler(async (req: Request, res: Response) => {
    const reviewerId = req.user!.id;
    const updated = await leavesService.reviewLeave(req.params.id, reviewerId, req.body);
    sendOk(res, updated, `Leave request ${req.body.status.toLowerCase()} successfully`);
  });

  static list = asyncHandler(async (req: Request, res: Response) => {
    // If not admin, filter by own employeeId
    const query = { ...req.query } as any;
    // Note: RBAC will handle the logic of who can see what.
    // For now, if employeeId is not provided and user is not admin, we could force it.
    const result = await leavesService.findAll(query);
    sendOk(res, result);
  });

  static getPolicies = asyncHandler(async (_req: Request, res: Response) => {
    const policies = await leavesService.getPolicies();
    sendOk(res, policies);
  });

  static createPolicy = asyncHandler(async (req: Request, res: Response) => {
    const policy = await leavesService.createPolicy(req.body);
    sendCreated(res, policy, 'Leave policy created successfully');
  });
}



