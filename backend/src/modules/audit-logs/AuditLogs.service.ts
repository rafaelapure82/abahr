import { Prisma, AuditAction } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { parsePagination, paginate } from '../../common/utils/response';

export interface AuditLogQuery {
  page?: number;
  limit?: number;
  userId?: string;
  action?: AuditAction;
  resource?: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export class AuditLogsService {
  async findAll(query: AuditLogQuery) {
    const { page, limit, skip } = parsePagination(query as any);
    const where: Prisma.AuditLogWhereInput = {};

    if (query.userId) where.userId = query.userId;
    if (query.action) where.action = query.action;
    if (query.resource) where.resource = query.resource;
    if (query.resourceId) where.resourceId = query.resourceId;

    if (query.startDate || query.endDate) {
      where.createdAt = {
        gte: query.startDate ? new Date(query.startDate) : undefined,
        lte: query.endDate ? new Date(query.endDate) : undefined,
      };
    }

    if (query.search) {
      where.OR = [
        { description: { contains: query.search, mode: 'insensitive' } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              employee: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true
                }
              }
            }
          }
        }
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { data, meta: paginate(total, page, limit) };
  }

  async findById(id: string) {
    return prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            employee: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });
  }

  async getStats() {
    const [total, byAction, byResource] = await Promise.all([
      prisma.auditLog.count(),
      prisma.auditLog.groupBy({
        by: ['action'],
        _count: true
      }),
      prisma.auditLog.groupBy({
        by: ['resource'],
        _count: true
      })
    ]);

    return { total, byAction, byResource };
  }
}

export const auditLogsService = new AuditLogsService();
