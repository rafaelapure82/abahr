import { z } from 'zod';
import { AttendanceStatus } from '@prisma/client';

export const checkInSchema = z.object({
  isRemote: z.boolean().optional().default(false),
  locationId: z.string().uuid().optional().nullable(),
  note: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export const checkOutSchema = z.object({
  note: z.string().optional().nullable(),
  breakMinutes: z.number().int().min(0).optional().default(0),
});

export const manualAttendanceSchema = z.object({
  employeeId: z.string().uuid(),
  date: z.string(), // ISO date
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  status: z.nativeEnum(AttendanceStatus).optional(),
  note: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const attendanceQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  employeeId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.nativeEnum(AttendanceStatus).optional(),
});

export type CheckInDto = z.infer<typeof checkInSchema>;
export type CheckOutDto = z.infer<typeof checkOutSchema>;
export type ManualAttendanceDto = z.infer<typeof manualAttendanceSchema>;
export type AttendanceQuery = z.infer<typeof attendanceQuerySchema>;
