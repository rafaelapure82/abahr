import { z } from 'zod';

export const webhookCreateSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  events: z.array(z.string()),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const webhookUpdateSchema = webhookCreateSchema.partial();
