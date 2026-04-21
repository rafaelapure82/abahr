import { prisma } from '../../config/prisma';
import { parsePagination, paginate } from '../../common/utils/response';
import { NotFound, BadRequest } from '../../common/utils/apiError';
import type { 
  CreateBenefitPlanDto, EnrollBenefitDto, UpdateEnrollmentDto, BenefitsQuery 
} from './Benefits.types';
import { EnrollmentStatus } from '@prisma/client';

export class BenefitsService {
  
  // ── Benefit Plans ────────────────────────────────────────────────────────

  async createPlan(dto: CreateBenefitPlanDto) {
    return prisma.benefitPlan.create({
      data: {
        ...dto,
        enrollmentDeadline: dto.enrollmentDeadline ? new Date(dto.enrollmentDeadline) : undefined,
        effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : undefined,
        expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : undefined,
        details: dto.details as any
      }
    });
  }

  async findAllPlans(query: BenefitsQuery) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = { isActive: true };
    if (query.category) where.category = query.category;

    const [data, total] = await Promise.all([
      prisma.benefitPlan.findMany({ where, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.benefitPlan.count({ where }),
    ]);

    return { data, meta: paginate(total, page, limit) };
  }

  async getPlanById(id: string) {
    const plan = await prisma.benefitPlan.findUnique({ where: { id } });
    if (!plan) throw NotFound('Benefit Plan');
    return plan;
  }

  // ── Employee Enrollments ──────────────────────────────────────────────────

  async enrollEmployee(employeeId: string, dto: EnrollBenefitDto) {
    const plan = await this.getPlanById(dto.planId);
    
    // Eligibility check
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw NotFound('Employee');

    if (!plan.eligibleTypes.includes(employee.employmentType)) {
      throw BadRequest(`Employee is not eligible for this plan (Required: ${plan.eligibleTypes.join(', ')})`);
    }

    return prisma.employeeBenefit.upsert({
      where: {
        employeeId_planId: { employeeId, planId: dto.planId }
      },
      create: {
        employeeId,
        planId: dto.planId,
        dependents: dto.dependents as any,
        notes: dto.notes,
        status: EnrollmentStatus.PENDING
      },
      update: {
        dependents: dto.dependents as any,
        notes: dto.notes,
        status: EnrollmentStatus.PENDING
      }
    });
  }

  async getEmployeeBenefits(employeeId: string) {
    return prisma.employeeBenefit.findMany({
      where: { employeeId },
      include: { plan: true }
    });
  }

  async updateEnrollmentStatus(id: string, dto: UpdateEnrollmentDto) {
    const enrollment = await prisma.employeeBenefit.findUnique({ where: { id } });
    if (!enrollment) throw NotFound('Benefit Enrollment');

    return prisma.employeeBenefit.update({
      where: { id },
      data: {
        status: dto.status,
        effectiveAt: dto.effectiveAt ? new Date(dto.effectiveAt) : undefined,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        waiveReason: dto.waiveReason
      }
    });
  }

  async deletePlan(id: string) {
    return prisma.benefitPlan.update({
      where: { id },
      data: { isActive: false }
    });
  }
}

export const benefitsService = new BenefitsService();
