import { differenceInMinutes, startOfDay, endOfDay } from 'date-fns';
import { prisma } from '../../config/prisma';
import { parsePagination, paginate } from '../../common/utils/response';
import { NotFound, BadRequest } from '../../common/utils/apiError';
import { notificationsService } from '../notifications/Notifications.service';
import type { 
  CheckInDto, CheckOutDto, AttendanceQuery, ManualAttendanceDto 
} from './Attendance.types';

// Standard shift constants
const STD_SHIFT_HOURS = 8;
const LATE_THRESHOLD_MINS = 15; // 09:15 AM
const EARTH_RADIUS_KM = 6371;

export class AttendanceService {
  
  /**
   * Smart Check-In (Atomic per day)
   */
  async checkIn(employeeId: string, dto: CheckInDto) {
    const today = startOfDay(new Date());

    // Check if record already exists for today
    const existing = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } }
    });

    if (existing && existing.checkIn) {
      return existing; // Already checked in
    }

    // 1. Geofencing check (if locationId provided and not remote)
    if (!dto.isRemote && dto.locationId && dto.latitude && dto.longitude) {
      const office = await prisma.officeLocation.findUnique({ where: { id: dto.locationId } });
      if (office && office.latitude && office.longitude) {
        const distance = this.calculateDistance(
          dto.latitude, dto.longitude,
          office.latitude, office.longitude
        );
        if (distance > (office.radius || 500)) {
          throw BadRequest(`You are too far from the office (${Math.round(distance)}m). Distance allowed: ${office.radius}m.`);
        }
      }
    }

    // 2. Late Detection
    let status: any = 'PRESENT';
    const now = new Date();
    const shiftStart = new Date(now);
    shiftStart.setHours(9, 0, 0, 0); // Assuming 09:00 standard start
    const delayMins = differenceInMinutes(now, shiftStart);
    if (delayMins > LATE_THRESHOLD_MINS) {
      status = 'LATE';
    }

    const attendance = await prisma.attendance.upsert({
      where: { employeeId_date: { employeeId, date: today } },
      create: {
        employeeId,
        date: today,
        checkIn: now,
        isRemote: dto.isRemote,
        locationId: dto.locationId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        note: dto.note,
        status
      },
      update: {
        checkIn: now,
        isRemote: dto.isRemote,
        locationId: dto.locationId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        note: dto.note,
        status
      }
    });

    return attendance;
  }

  /**
   * Manual entry for HR admins
   */
  async createManual(data: ManualAttendanceDto) {
    const date = startOfDay(new Date(data.date));
    return prisma.attendance.upsert({
      where: { employeeId_date: { employeeId: data.employeeId, date } },
      create: {
        ...data,
        date,
        checkIn: data.checkIn ? new Date(data.checkIn) : undefined,
        checkOut: data.checkOut ? new Date(data.checkOut) : undefined,
      },
      update: {
        ...data,
        checkIn: data.checkIn ? new Date(data.checkIn) : undefined,
        checkOut: data.checkOut ? new Date(data.checkOut) : undefined,
      }
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c * 1000; // Return meters
  }

  /**
   * Smart Check-Out (Calculates Hours)
   */
  async checkOut(employeeId: string, dto: CheckOutDto) {
    const today = startOfDay(new Date());
    
    const record = await prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } }
    });

    if (!record || !record.checkIn) {
      throw BadRequest('No check-in record found for today. Please check-in first.');
    }

    if (record.checkOut) return record; // Already checked out

    const checkOutTime = new Date();
    const breakMins = dto.breakMinutes || 0;
    
    // Calculate hours
    const totalMins = differenceInMinutes(checkOutTime, record.checkIn);
    const netMins = Math.max(0, totalMins - breakMins);
    const hoursWorked = +(netMins / 60).toFixed(2);
    
    // Calculate overtime
    const overtime = Math.max(0, hoursWorked - STD_SHIFT_HOURS);

    return prisma.attendance.update({
      where: { id: record.id },
      data: {
        checkOut: checkOutTime,
        breakMinutes: breakMins,
        hoursWorked,
        overtimeHours: overtime,
        note: dto.note ? `${record.note || ''} | ${dto.note}` : record.note
      }
    });
  }

  async findAll(query: AttendanceQuery) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = {};

    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.status)     where.status = query.status;
    if (query.startDate || query.endDate) {
      where.date = {
        gte: query.startDate ? new Date(query.startDate) : undefined,
        lte: query.endDate ? new Date(query.endDate) : undefined,
      };
    }

    const [data, total] = await Promise.all([
      prisma.attendance.findMany({ 
        where, 
        skip, 
        take: limit, 
        orderBy: { date: 'desc' },
        include: { employee: { select: { firstName: true, lastName: true, employeeCode: true } } }
      }),
      prisma.attendance.count({ where }),
    ]);

    return { data, meta: paginate(total, page, limit) };
  }

  async getMyToday(employeeId: string) {
    const today = startOfDay(new Date());
    return prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } }
    });
  }

  async getDashboardStats() {
    const today = startOfDay(new Date());
    const [active, total, late] = await Promise.all([
      prisma.attendance.count({ where: { date: today, checkIn: { not: null }, checkOut: null } }),
      prisma.employee.count({ where: { employmentStatus: 'ACTIVE', deletedAt: null } }),
      prisma.attendance.count({ where: { date: today, status: 'LATE' } }),
    ]);

    return {
      employeesPresent: active,
      employeesTotal: total,
      employeesLate: late,
      attendanceRate: total > 0 ? (active / total) * 100 : 0
    };
  }
}

export const attendanceService = new AttendanceService();




