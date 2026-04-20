import { z } from 'zod';

// In-app and email notifications
export const NotificationsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});
export type NotificationsQuery = z.infer<typeof NotificationsQuerySchema>;
