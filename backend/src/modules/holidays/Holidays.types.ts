import { z } from 'zod';

export const createHolidaySchema = z.object({
  name: z.string().min(3),
  date: z.string().transform(v => new Date(v)),
  country: z.string().default('US'),
});

export const updateHolidaySchema = createHolidaySchema.partial();

export const holidayQuerySchema = z.object({
  year: z.coerce.number().optional(),
  country: z.string().optional(),
});

export type CreateHolidayDto = z.infer<typeof createHolidaySchema>;
export type UpdateHolidayDto = z.infer<typeof updateHolidaySchema>;
export type HolidayQuery = z.infer<typeof holidayQuerySchema>;
