import { Request, Response } from 'express';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { sendOk, sendCreated } from '../../common/utils/response';
import { benefitsService } from './Benefits.service';

export class BenefitsController {
  
  static createPlan = asyncHandler(async (req: Request, res: Response) => {
    const plan = await benefitsService.createPlan(req.body);
    sendCreated(res, plan, 'Benefit plan created');
  });

  static listPlans = asyncHandler(async (req: Request, res: Response) => {
    const result = await benefitsService.findAllPlans(req.query as any);
    sendOk(res, result);
  });

  static getPlan = asyncHandler(async (req: Request, res: Response) => {
    const plan = await benefitsService.getPlanById(req.params.id);
    sendOk(res, plan);
  });

  static enroll = asyncHandler(async (req: Request, res: Response) => {
    const employeeId = req.body.employeeId || req.user!.id;
    const enrollment = await benefitsService.enrollEmployee(employeeId, req.body);
    sendCreated(res, enrollment, 'Benefit enrollment requested');
  });

  static listEmployeeBenefits = asyncHandler(async (req: Request, res: Response) => {
    const employeeId = req.params.employeeId || req.user!.id;
    const benefits = await benefitsService.getEmployeeBenefits(employeeId);
    sendOk(res, benefits);
  });

  static updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const result = await benefitsService.updateEnrollmentStatus(req.params.id, req.body);
    sendOk(res, result, 'Enrollment status updated');
  });

  static deletePlan = asyncHandler(async (req: Request, res: Response) => {
    await benefitsService.deletePlan(req.params.id);
    sendOk(res, null, 'Benefit plan deactivated');
  });
}
