import { z } from 'zod';
import { NotificationType, NotificationChannel } from '@prisma/client';

export const notificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.nativeEnum(NotificationType),
  channel: z.nativeEnum(NotificationChannel).optional().default('IN_APP'),
  title: z.string().min(1),
  message: z.string().min(1),
  data: z.any().optional(),
  link: z.string().optional(),
});

export const notificationsQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  isRead: z.preprocess((val) => val === 'true' ? true : val === 'false' ? false : undefined, z.boolean().optional()),
});

export type CreateNotificationDto = z.infer<typeof notificationSchema>;
export type NotificationsQuery = z.infer<typeof notificationsQuerySchema>;
