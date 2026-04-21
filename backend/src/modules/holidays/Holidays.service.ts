import { startOfDay, endOfDay, isSameDay } from 'date-fns';
import { prisma } from '../../config/prisma';
import { NotFound } from '../../common/utils/apiError';
import type { CreateHolidayDto, UpdateHolidayDto, HolidayQuery } from './Holidays.types';

export class HolidaysService {
  
  async create(data: CreateHolidayDto) {
    return prisma.publicHoliday.create({
      data: {
        ...data,
        date: startOfDay(data.date)
      }
    });
  }

  async findAll(query: HolidayQuery) {
    const where: any = { isActive: true };
    if (query.year) {
      where.date = {
        gte: new Date(query.year, 0, 1),
        lte: new Date(query.year, 11, 31),
      };
    }
    if (query.country) where.country = query.country;

    return prisma.publicHoliday.findMany({
      where,
      orderBy: { date: 'asc' }
    });
  }

  async update(id: string, data: UpdateHolidayDto) {
    const existing = await prisma.publicHoliday.findUnique({ where: { id } });
    if (!existing) throw NotFound('Holiday');

    return prisma.publicHoliday.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? startOfDay(data.date) : undefined
      }
    });
  }

  async delete(id: string) {
    return prisma.publicHoliday.update({
      where: { id },
      data: { isActive: false }
    });
  }

  /**
   * Utility for other modules
   */
  async isHoliday(date: Date, country: string = 'US'): Promise<boolean> {
    const day = startOfDay(date);
    const holiday = await prisma.publicHoliday.findUnique({
      where: {
        date_country: {
          date: day,
          country
        }
      }
    });
    return !!holiday && holiday.isActive;
  }

  async getHolidaysInRange(start: Date, end: Date, country: string = 'US'): Promise<Date[]> {
    const holidays = await prisma.publicHoliday.findMany({
      where: {
        country,
        isActive: true,
        date: {
          gte: startOfDay(start),
          lte: startOfDay(end)
        }
      },
      select: { date: true }
    });
    return holidays.map(h => h.date);
  }
}

export const holidaysService = new HolidaysService();
