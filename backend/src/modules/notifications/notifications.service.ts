import { prisma } from '../../config/prisma';
import { parsePagination, paginate } from '../../common/utils/response';
import { NotFound } from '../../common/utils/apiError';
import type { NotificationsQuery } from './Notifications.types';

export class NotificationsService {
  async findAll(query: NotificationsQuery) {
    const { page, limit, skip } = parsePagination(query);
    // TODO: implement filters
    const [data, total] = await Promise.all([
      (prisma as any)['Notifications'.replace(/s$/, '')]?.findMany?.({ skip, take: limit }) ?? [],
      0,
    ]);
    return { data, meta: paginate(total, page, limit) };
  }

  async findById(id: string) {
    // TODO: implement
    return { id, placeholder: true };
  }

  async create(dto: unknown) {
    // TODO: implement
    return dto;
  }

  async update(id: string, dto: unknown) {
    // TODO: implement
    return { id, ...dto as object };
  }

  async remove(id: string): Promise<void> {
    // TODO: implement soft delete
    void id;
  }
}

export const NotificationsService = new NotificationsService();
