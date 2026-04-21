import { differenceInDays, startOfDay } from 'date-fns';
import { prisma } from '../../config/prisma';
import { parsePagination, paginate } from '../../common/utils/response';
import { NotFound, BadRequest } from '../../common/utils/apiError';
import { notificationsService } from '../notifications/Notifications.service';
import { calculateNetLeaveDays } from '../../common/utils/dateUtils';
import { holidaysService } from '../holidays/Holidays.service';
import type { 
  LeaveRequestDto, LeaveReviewDto, LeavesQuery, LeavePolicyDto 
} from './Leaves.types';

export class LeavesService {
  
  /**
   * Request Leave (Nivel Dios: Overlap, Policy & Balance logic)
   */
  async requestLeave(employeeId: string, dto: LeaveRequestDto) {
    const start = startOfDay(dto.startDate);
    const end = startOfDay(dto.endDate);
    
    if (start > end) throw BadRequest('Start date must be before end date');

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { location: true }
    });
    if (!employee) throw NotFound('Employee');

    // 1. Fetch Policy
    const policy = await prisma.leavePolicy.findUnique({ where: { leaveType: dto.leaveType } });
    if (!policy) throw BadRequest(`No policy defined for ${dto.leaveType}`);

    // 2. Overlap Check
    const overlap = await prisma.leaveRequest.findFirst({
      where: {
        employeeId,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [{ startDate: { lte: end }, endDate: { gte: start } }]
      }
    });
    if (overlap) throw BadRequest(`You already have a ${overlap.status} request for these dates.`);

    // 3. Calculation (Skip Weekends & Holidays)
    const netDays = await calculateNetLeaveDays(start, end, employee.location?.country || 'US');
    if (netDays === 0) throw BadRequest('Requested dates have no working days.');
    const requestedDays = dto.isHalfDay ? 0.5 : netDays;

    // 4. Policy Enforcement
    // Notice Period
    const noticeDays = differenceInDays(start, new Date());
    if (noticeDays < policy.minNoticeDays) {
      throw BadRequest(`Notice period too short. ${policy.minNoticeDays} days required.`);
    }

    // Max Consecutive
    if (policy.maxConsecutiveDays && requestedDays > policy.maxConsecutiveDays) {
      throw BadRequest(`Maximum consecutive days allowed is ${policy.maxConsecutiveDays}.`);
    }

    // Balance Check (Proactive)
    const year = start.getFullYear();
    const balance = await prisma.leaveBalance.findUnique({
      where: { employeeId_leaveType_year: { employeeId, leaveType: dto.leaveType, year } }
    });

    if (balance) {
      const remaining = Number(balance.allocated) - Number(balance.used) - Number(balance.pending);
      if (requestedDays > remaining) {
        throw BadRequest(`Insufficient balance. Remaining: ${remaining} days.`);
      }
    }

    // 5. Request creation
    return prisma.$transaction(async (tx) => {
      const request = await tx.leaveRequest.create({
        data: {
          employeeId,
          leaveType: dto.leaveType,
          startDate: start,
          endDate: end,
          daysRequested: requestedDays,
          reason: dto.reason,
          isHalfDay: dto.isHalfDay,
          status: 'PENDING'
        }
      });

      // Update Pending in Balance
      if (balance) {
        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: { pending: { increment: requestedDays } }
        });
      }

      return request;
    });
  }

  /**
   * Review Leave (Nivel Dios: Automatic Balance Deduction)
   */
  async reviewLeave(requestId: string, reviewerId: string, dto: LeaveReviewDto) {
    const request = await prisma.leaveRequest.findUnique({
      where: { id: requestId },
      include: { employee: true }
    });

    if (!request) throw NotFound('Leave Request');
    if (request.status !== 'PENDING') throw BadRequest('Request is already processed');

    // Atomic transaction for Status Update + Balance Update
    return prisma.$transaction(async (tx) => {
      const updated = await tx.leaveRequest.update({
        where: { id: requestId },
        data: {
          status: dto.status,
          approverId: dto.status === 'APPROVED' ? reviewerId : null,
          approvedAt: dto.status === 'APPROVED' ? new Date() : null,
          approverNotes: dto.managerComments
        }
      });

      if (dto.status === 'APPROVED') {
        const year = request.startDate.getFullYear();
        
        let balance = await tx.leaveBalance.findUnique({
          where: { employeeId_leaveType_year: { employeeId: request.employeeId, leaveType: request.leaveType, year } }
        });

        if (!balance) {
          const policy = await tx.leavePolicy.findUnique({ where: { leaveType: request.leaveType } });
          balance = await tx.leaveBalance.create({
            data: {
              employeeId: request.employeeId,
              leaveType: request.leaveType,
              year,
              allocated: policy?.daysAllowed || 15,
              used: 0,
              pending: 0
            }
          });
        }

        // Deduct from Pending, add to Used
        await tx.leaveBalance.update({
          where: { id: balance.id },
          data: {
            used: { increment: request.daysRequested },
            pending: { decrement: request.daysRequested }
          }
        });

        // Trigger Notification
        await notificationsService.notify({
          userId: request.employeeId,
          type: 'LEAVE_APPROVED', 
          channel: 'IN_APP',
          title: 'Solicitud de Vacaciones Aprobada',
          message: `Tu solicitud para el ${request.startDate.toLocaleDateString()} ha sido aprobada.`,
          data: { status: 'APPROVED', days: Number(request.daysRequested) }
        });
      } else if (dto.status === 'REJECTED') {
        // Return Pending to allocated (well, just decrement pending)
        const year = request.startDate.getFullYear();
        const balance = await tx.leaveBalance.findUnique({
          where: { employeeId_leaveType_year: { employeeId: request.employeeId, leaveType: request.leaveType, year } }
        });
        if (balance) {
          await tx.leaveBalance.update({
            where: { id: balance.id },
            data: { pending: { decrement: request.daysRequested } }
          });
        }
      }

      return updated;
    });
  }

  async findAll(query: LeavesQuery) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = {};
    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.status)     where.status = query.status;

    const [data, total] = await Promise.all([
      prisma.leaveRequest.findMany({ 
        where, 
        skip, 
        take: limit, 
        orderBy: { createdAt: 'desc' },
        include: { 
          employee: { select: { firstName: true, lastName: true } }
        }
      }),
      prisma.leaveRequest.count({ where }),
    ]);

    return { data, meta: paginate(total, page, limit) };
  }

  async createPolicy(dto: LeavePolicyDto) {
    return prisma.leavePolicy.create({ data: dto });
  }

  async getPolicies() {
    return prisma.leavePolicy.findMany({ where: { isActive: true } });
  }
}

export const leavesService = new LeavesService();
