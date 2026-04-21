import { prisma } from '../../config/prisma';
import { parsePagination, paginate } from '../../common/utils/response';
import { NotFound } from '../../common/utils/apiError';
import type { CreateNotificationDto, NotificationsQuery } from './Notifications.types';

export class NotificationsService {
  
  // ── Core notify method (to be used by other services) ──────────────────────
  async notify(dto: CreateNotificationDto) {
    const notification = await prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        channel: dto.channel || 'IN_APP',
        title: dto.title,
        message: dto.message,
        data: dto.data,
        link: dto.link,
        status: 'PENDING',
      }
    });

    // Real-time (Socket.IO)
    // We expect the 'io' instance to be available globally or via a setter
    // For now, we'll try to emit if a global holder is implemented later, 
    // or we'll use the app.get('io') in controllers.
    // In service level, we can use a small event emitter that controllers listen to.
    
    return notification;
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  async findAll(query: NotificationsQuery & { userId: string }) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = { userId: query.userId };
    if (query.isRead !== undefined) where.isRead = query.isRead;

    const [data, total] = await Promise.all([
      prisma.notification.findMany({ 
        where, 
        skip, 
        take: limit, 
        orderBy: { createdAt: 'desc' } 
      }),
      prisma.notification.count({ where }),
    ]);

    return { data, meta: paginate(total, page, limit) };
  }

  async markAsRead(id: string, userId: string) {
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId) throw NotFound('Notification');

    return prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date(), status: 'SENT' }
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date(), status: 'SENT' }
    });
  }

  async remove(id: string, userId: string) {
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId) throw NotFound('Notification');

    await prisma.notification.delete({ where: { id } });
  }
}

export const notificationsService = new NotificationsService();



