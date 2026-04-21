import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendOk, sendCreated } from '../../common/utils/response';
import { performanceService } from './Performance.service';

export class PerformanceController {
  
  // ── Templates ─────────────────────────────────────────────────────────────

  static createTemplate = asyncHandler(async (req: Request, res: Response) => {
    const template = await performanceService.createTemplate(req.body);
    sendCreated(res, template, 'Evaluation template created');
  });

  static getTemplates = asyncHandler(async (req: Request, res: Response) => {
    const templates = await performanceService.getTemplates();
    sendOk(res, templates);
  });

  // ── Cycles & Reviews ──────────────────────────────────────────────────────
  
  static createCycle = asyncHandler(async (req: Request, res: Response) => {
    const result = await performanceService.createCycle(req.body);
    sendCreated(res, result, 'Performance review cycle initiated');
  });

  static listReviews = asyncHandler(async (req: Request, res: Response) => {
    const query = { ...req.query } as any;
    const result = await performanceService.findAll(query);
    sendOk(res, result);
  });

  static getReview = asyncHandler(async (req: Request, res: Response) => {
    const review = await performanceService.findReviewById(req.params.id);
    sendOk(res, review);
  });

  static submitSelf = asyncHandler(async (req: Request, res: Response) => {
    // In a real scenario, we'd lookup the employeeId from req.user.id
    // For now, we assume the frontend sends the employeeId or it's handled by middleware
    const employeeId = req.body.employeeId || req.user!.id; 
    const result = await performanceService.submitSelfReview(req.params.id, employeeId, req.body);
    sendOk(res, result, 'Self-review submitted successfully');
  });

  static submitManager = asyncHandler(async (req: Request, res: Response) => {
    const managerId = req.body.managerId || req.user!.id;
    const result = await performanceService.submitManagerReview(req.params.id, managerId, req.body);
    sendOk(res, result, 'Manager evaluation completed');
  });

  static share = asyncHandler(async (req: Request, res: Response) => {
    const result = await performanceService.shareWithEmployee(req.params.id);
    sendOk(res, result, 'Review shared with employee');
  });

  // ── 360 Feedback ──────────────────────────────────────────────────────────

  static requestFeedback = asyncHandler(async (req: Request, res: Response) => {
    const result = await performanceService.requestPeerFeedback(req.params.id, req.body.giverId);
    sendCreated(res, result, '360 feedback requested');
  });

  static submitFeedback = asyncHandler(async (req: Request, res: Response) => {
    const giverId = req.body.giverId || req.user!.id;
    const result = await performanceService.submitFeedback360(req.params.id, giverId, req.body);
    sendOk(res, result, 'Peer feedback submitted');
  });

  // ── Reports ───────────────────────────────────────────────────────────────

  static getReport = asyncHandler(async (req: Request, res: Response) => {
    const report = await performanceService.getDevelopmentReport(req.params.employeeId);
    sendOk(res, report);
  });

  // ── Goals / OKRs ─────────────────────────────────────────────────────────

  static listGoals = asyncHandler(async (req: Request, res: Response) => {
    const employeeId = (req.query.employeeId as string) || req.user!.id;
    const goals = await performanceService.getGoals(employeeId);
    sendOk(res, goals);
  });

  static upsertGoal = asyncHandler(async (req: Request, res: Response) => {
    const employeeId = req.body.employeeId || req.user!.id;
    const goalId = req.params.id; 
    const goal = await performanceService.upsertGoal(employeeId, req.body, goalId);
    sendOk(res, goal, goalId ? 'Goal updated' : 'Goal created');
  });
}
