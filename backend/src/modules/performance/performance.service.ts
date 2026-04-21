import { prisma } from '../../config/prisma';
import { parsePagination, paginate } from '../../common/utils/response';
import { NotFound, BadRequest } from '../../common/utils/apiError';
import type { 
  CreateReviewCycleDto, 
  SelfReviewDto, 
  ManagerReviewDto, 
  GoalDto, 
  PerformanceQuery,
  CreateTemplateDto,
  Feedback360Dto
} from './Performance.types';
import { PerformanceRating } from '@prisma/client';

const RATING_MAP: Record<PerformanceRating, number> = {
  UNSATISFACTORY: 1,
  NEEDS_IMPROVEMENT: 2,
  MEETS: 3,
  EXCEEDS: 4,
  EXCEPTIONAL: 5
};

export class PerformanceService {
  
  // ── Templates ─────────────────────────────────────────────────────────────

  async createTemplate(dto: CreateTemplateDto) {
    return prisma.reviewTemplate.create({
      data: {
        name: dto.name,
        description: dto.description,
        criteria: {
          create: dto.criteria
        }
      },
      include: { criteria: true }
    });
  }

  async getTemplates() {
    return prisma.reviewTemplate.findMany({ where: { isActive: true } });
  }

  // ── Cycles & Reviews ──────────────────────────────────────────────────────

  async createCycle(dto: CreateReviewCycleDto) {
    return prisma.$transaction(async (tx) => {
      const cycle = await tx.reviewCycle.create({ 
        data: {
          name: dto.name,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          dueDate: new Date(dto.dueDate),
          templateId: dto.templateId
        } 
      });

      // Get template criteria if provided
      const templateCriteria = dto.templateId 
        ? await tx.templateCriterion.findMany({ where: { templateId: dto.templateId } })
        : [];

      // Identify active employees and their managers
      const employees = await tx.employee.findMany({
        where: { employmentStatus: 'ACTIVE', deletedAt: null, managerId: { not: null } }
      });

      // Create reviews and copy criteria
      for (const emp of employees) {
        const review = await tx.performanceReview.create({
          data: {
            cycleId: cycle.id,
            employeeId: emp.id,
            reviewerId: emp.managerId!,
            status: 'SELF_REVIEW'
          }
        });

        if (templateCriteria.length > 0) {
          await tx.reviewCriterion.createMany({
            data: templateCriteria.map(c => ({
              reviewId: review.id,
              name: c.name,
              description: c.description,
              weight: c.weight
            }))
          });
        }
      }

      return { cycle, reviewsCount: employees.length };
    });
  }

  async submitSelfReview(reviewId: string, employeeId: string, dto: SelfReviewDto) {
    const review = await prisma.performanceReview.findUnique({ where: { id: reviewId } });
    if (!review || review.employeeId !== employeeId) throw NotFound('Review');
    if (review.status !== 'SELF_REVIEW') throw BadRequest('Cycle is not in Self-Review stage');

    return prisma.$transaction(async (tx) => {
      // Update individual criteria self ratings if provided
      if (dto.criteria) {
        for (const c of dto.criteria) {
          await tx.reviewCriterion.update({
            where: { id: c.criterionId },
            data: { selfRating: c.selfRating, selfComment: c.selfComment }
          });
        }
      }

      return tx.performanceReview.update({
        where: { id: reviewId },
        data: {
          selfRating: dto.selfRating,
          selfComments: dto.selfComments,
          status: 'MANAGER_REVIEW'
        }
      });
    });
  }

  async submitManagerReview(reviewId: string, managerId: string, dto: ManagerReviewDto) {
    const review = await prisma.performanceReview.findUnique({ 
      where: { id: reviewId },
      include: { criteria: true }
    });
    if (!review || review.reviewerId !== managerId) throw NotFound('Review');

    // Calculate overall score based on criteria weights
    let totalWeight = 0;
    let weightedSum = 0;

    const criteriaUpdates = dto.criteria.map(c => {
      const dbCriterion = review.criteria.find(dc => dc.id === c.criterionId);
      const weight = dbCriterion?.weight || 1;
      const ratingValue = RATING_MAP[c.managerRating];
      
      weightedSum += ratingValue * weight;
      totalWeight += weight;

      return {
        id: c.criterionId,
        managerRating: c.managerRating,
        managerComment: c.managerComment,
        score: ratingValue
      };
    });

    const overallScore = totalWeight > 0 ? (weightedSum / totalWeight) : 0;

    return prisma.$transaction(async (tx) => {
      // 1. Update Criteria
      for (const cu of criteriaUpdates) {
        await tx.reviewCriterion.update({
          where: { id: cu.id },
          data: {
            managerRating: cu.managerRating,
            managerComment: cu.managerComment,
            score: cu.score
          }
        });
      }

      // 2. Update Review
      return tx.performanceReview.update({
        where: { id: reviewId },
        data: {
          managerStrengths: dto.managerStrengths,
          managerImprovements: dto.managerImprovements,
          managerComments: dto.managerComments,
          overallRating: dto.overallRating,
          overallScore,
          status: 'HR_REVIEW'
        }
      });
    });
  }

  // ── 360 Feedback ──────────────────────────────────────────────────────────

  async requestPeerFeedback(reviewId: string, giverId: string) {
    const review = await prisma.performanceReview.findUnique({ where: { id: reviewId } });
    if (!review) throw NotFound('Review');

    return prisma.feedback360.create({
      data: {
        reviewId,
        giverId,
        receiverId: review.employeeId,
        relationship: 'PEER'
      }
    });
  }

  async submitFeedback360(id: string, giverId: string, dto: Partial<Feedback360Dto>) {
    const feedback = await prisma.feedback360.findUnique({ where: { id } });
    if (!feedback || feedback.giverId !== giverId) throw NotFound('Feedback request');

    return prisma.feedback360.update({
      where: { id },
      data: {
        ...dto,
        submittedAt: new Date()
      }
    });
  }

  // ── Reports & Queries ─────────────────────────────────────────────────────

  async getDevelopmentReport(employeeId: string) {
    const reviews = await prisma.performanceReview.findMany({
      where: { employeeId, status: 'COMPLETED' },
      include: { cycle: true, criteria: true, goals: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Simple trend calculation
    const scores = reviews.map(r => Number(r.overallScore || 0)).reverse();
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    return {
      employeeId,
      recentReviews: reviews,
      scoreTrend: scores,
      averageScore,
      summary: `Employee has completed ${reviews.length} review cycles with an average score of ${averageScore.toFixed(2)}/5.`
    };
  }

  async shareWithEmployee(id: string) {
    return prisma.performanceReview.update({
      where: { id },
      data: { isSharedWithEmployee: true, sharedAt: new Date(), status: 'COMPLETED' }
    });
  }

  async findReviewById(id: string) {
    const review = await prisma.performanceReview.findUnique({
      where: { id },
      include: {
        employee: { select: { firstName: true, lastName: true, id: true, jobTitle: true } },
        reviewer: { select: { firstName: true, lastName: true } },
        criteria: true,
        goals: true,
        cycle: true,
        feedback360: { include: { giver: { select: { firstName: true, lastName: true } } } }
      }
    });
    if (!review) throw NotFound('Performance Review');
    return review;
  }

  async findAll(query: PerformanceQuery) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.employeeId) where.employeeId = query.employeeId;

    const [data, total] = await Promise.all([
      prisma.performanceReview.findMany({ 
        where, 
        skip, 
        take: limit, 
        include: { 
          employee: { select: { firstName: true, lastName: true } },
          cycle: { select: { name: true } }
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.performanceReview.count({ where }),
    ]);

    return { data, meta: paginate(total, page, limit) };
  }

  async upsertGoal(employeeId: string, dto: GoalDto, goalId?: string) {
    const data = {
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    };

    if (goalId) {
      return prisma.goal.update({ where: { id: goalId }, data });
    }
    return prisma.goal.create({ data: { ...data, employeeId } });
  }

  async getGoals(employeeId: string) {
    return prisma.goal.findMany({ where: { employeeId }, orderBy: { dueDate: 'asc' } });
  }
}

export const performanceService = new PerformanceService();
