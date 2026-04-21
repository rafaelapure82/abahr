import { prisma } from '../../config/prisma';
import { parsePagination, paginate } from '../../common/utils/response';
import { NotFound, BadRequest } from '../../common/utils/apiError';
import type { 
  CreateReviewCycleDto, SelfReviewDto, ManagerReviewDto, GoalDto, PerformanceQuery 
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
  
  /**
   * Create Cycle & Generate Reviews (Nivel Dios)
   */
  async createCycle(dto: CreateReviewCycleDto) {
    return prisma.$transaction(async (tx) => {
      const cycle = await tx.reviewCycle.create({ data: dto });

      // Identify active employees and their managers
      const employees = await tx.employee.findMany({
        where: { employmentStatus: 'ACTIVE', deletedAt: null, managerId: { not: null } }
      });

      // Bulk create reviews
      const reviews = await Promise.all(employees.map(emp => 
        tx.performanceReview.create({
          data: {
            cycleId: cycle.id,
            employeeId: emp.id,
            reviewerId: emp.managerId!,
            status: 'SELF_REVIEW'
          }
        })
      ));

      return { cycle, reviewsCount: reviews.length };
    });
  }

  /**
   * Self Review Submission
   */
  async submitSelfReview(reviewId: string, employeeId: string, dto: SelfReviewDto) {
    const review = await prisma.performanceReview.findUnique({ where: { id: reviewId } });
    if (!review || review.employeeId !== employeeId) throw NotFound('Review');
    if (review.status !== 'SELF_REVIEW') throw BadRequest('Cycle is not in Self-Review stage');

    return prisma.performanceReview.update({
      where: { id: reviewId },
      data: {
        selfRating: dto.selfRating,
        selfComments: dto.selfComments,
        status: 'MANAGER_REVIEW'
      }
    });
  }

  /**
   * Manager Review (Nivel Dios: Weighted Scoring)
   */
  async submitManagerReview(reviewId: string, managerId: string, dto: ManagerReviewDto) {
    const review = await prisma.performanceReview.findUnique({ where: { id: reviewId } });
    if (!review || review.reviewerId !== managerId) throw NotFound('Review');

    // Calculate overall score based on criteria weights
    let totalWeight = 0;
    let weightedSum = 0;

    dto.criteria.forEach(c => {
      const ratingValue = RATING_MAP[c.managerRating];
      weightedSum += ratingValue * c.weight;
      totalWeight += c.weight;
    });

    const overallScore = totalWeight > 0 ? (weightedSum / totalWeight) : 0;

    return prisma.$transaction(async (tx) => {
      // 1. Upsert Criteria
      await Promise.all(dto.criteria.map(c => 
        tx.reviewCriterion.create({
          data: {
            reviewId,
            name: c.name,
            weight: c.weight,
            managerRating: c.managerRating,
            managerComment: c.managerComment,
            score: RATING_MAP[c.managerRating]
          }
        })
      ));

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

  async getReviewDetails(id: string) {
    const review = await prisma.performanceReview.findUnique({
      where: { id },
      include: {
        employee: { select: { firstName: true, lastName: true, id: true } },
        reviewer: { select: { firstName: true, lastName: true } },
        criteria: true,
        goals: true,
        cycle: true
      }
    });

    if (!review) throw NotFound('Performance Review');
    
    // Nivel Dios: Automatically link current active goals if not already linked
    if (review.goals.length === 0) {
      const activeGoals = await prisma.goal.findMany({
        where: { employeeId: review.employeeId, status: { not: 'COMPLETED' } }
      });
      // Logic would be to associate them or just return them for context
      (review as any).currentGoals = activeGoals;
    }

    return review;
  }

  async shareWithEmployee(id: string) {
    return prisma.performanceReview.update({
      where: { id },
      data: { isSharedWithEmployee: true, sharedAt: new Date(), status: 'COMPLETED' }
    });
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

  // ── OKR / Goals Management ───────────────────────────────────────────────────

  async upsertGoal(employeeId: string, dto: GoalDto, goalId?: string) {
    if (goalId) {
      return prisma.goal.update({ where: { id: goalId }, data: dto });
    }
    return prisma.goal.create({ data: { ...dto, employeeId } });
  }

  async getGoals(employeeId: string) {
    return prisma.goal.findMany({ where: { employeeId }, orderBy: { dueDate: 'asc' } });
  }
}

export const performanceService = new PerformanceService();



