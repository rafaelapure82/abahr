import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendOk, sendCreated } from '../../common/utils/response';
import { performanceService } from './Performance.service';

export class PerformanceController {
  
  // ── Cycles & Reviews ──────────────────────────────────────────────────────
  
  static createCycle = asyncHandler(async (req: Request, res: Response) => {
    const result = await performanceService.createCycle(req.body);
    sendCreated(res, result, 'Performance review cycle initiated');
  });

  static listReviews = asyncHandler(async (req: Request, res: Response) => {
    const query = { ...req.query } as any;
    // Basic multi-role isolation: if not admin, only show related reviews
    // (Actual isolation ideally happens at service layer with user context)
    const result = await performanceService.findAll(query);
    sendOk(res, result);
  });

  static getReview = asyncHandler(async (req: Request, res: Response) => {
    const review = await performanceService.getReviewDetails(req.params.id);
    sendOk(res, review);
  });

  static submitSelf = asyncHandler(async (req: Request, res: Response) => {
    const employeeId = req.user!.id; // Mapping User to Employee needed here ideally
    const result = await performanceService.submitSelfReview(req.params.id, employeeId, req.body);
    sendOk(res, result, 'Self-review submitted successfully');
  });

  static submitManager = asyncHandler(async (req: Request, res: Response) => {
    const managerId = req.user!.id;
    const result = await performanceService.submitManagerReview(req.params.id, managerId, req.body);
    sendOk(res, result, 'Manager evaluation completed');
  });

  static share = asyncHandler(async (req: Request, res: Response) => {
    const result = await performanceService.shareWithEmployee(req.params.id);
    sendOk(res, result, 'Review shared with employee');
  });

  // ── Goals / OKRs ─────────────────────────────────────────────────────────

  static listGoals = asyncHandler(async (req: Request, res: Response) => {
    const employeeId = (req.query.employeeId as string) || req.user!.id;
    const goals = await performanceService.getGoals(employeeId);
    sendOk(res, goals);
  });

  static upsertGoal = asyncHandler(async (req: Request, res: Response) => {
    const employeeId = req.body.employeeId || req.user!.id;
    const goalId = req.params.id; // optional from route
    const goal = await performanceService.upsertGoal(employeeId, req.body, goalId);
    sendOk(res, goal, goalId ? 'Goal updated' : 'Goal created');
  });
}



