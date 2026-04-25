import { prisma } from '../../config/prisma';
import { parsePagination, paginate } from '../../common/utils/response';
import { NotFound, BadRequest } from '../../common/utils/apiError';
import type { CreatePayrollPeriodDto, PayrollQuery } from './Payroll.types';
import { Decimal } from '@prisma/client/runtime/library';
import { payrollQueue } from './Payroll.queue';
import { logger } from '../../config/logger';

export class PayrollService {
  
  /**
   * Fetch current exchange rate from SystemConfig
   */
  async getExchangeRate(): Promise<number> {
    const config = await prisma.systemConfig.findUnique({ where: { key: 'EXCHANGE_RATE_VES' } });
    if (!config) return 1;
    return Number((config.value as any).rate || 1);
  }

  async getPayrollConfig(): Promise<{ taxRate: number; ssRate: number }> {
    const [tax, ss] = await Promise.all([
      prisma.systemConfig.findUnique({ where: { key: 'payroll.tax_rate' } }),
      prisma.systemConfig.findUnique({ where: { key: 'payroll.ss_rate' } })
    ]);
    return {
      taxRate: Number(tax?.value || 0.05),
      ssRate: Number(ss?.value || 0.04)
    };
  }

  /**
   * Calculate working days (Mon-Fri) excluding public holidays
   */
  async getWorkingDays(start: Date, end: Date): Promise<number> {
    let count = 0;
    const current = new Date(start);
    const stop = new Date(end);
    
    // Fetch holidays in range
    const holidays = await prisma.publicHoliday.findMany({
      where: { date: { gte: start, lte: end }, isActive: true }
    });
    const holidayStrings = holidays.map(h => h.date.toISOString().split('T')[0]);

    while (current <= stop) {
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sun = 0, Sat = 6
      const isHoliday = holidayStrings.includes(current.toISOString().split('T')[0]);

      if (!isWeekend && !isHoliday) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  /**
   * Generate a Payroll Period (Nivel Dios: Automatic Data Integration)
   */
  async generatePeriod(dto: CreatePayrollPeriodDto) {
    const { startDate, endDate } = dto;

    if (startDate >= endDate) throw BadRequest('Start date must be before end date');

    // 1. Create the Period and Payroll records with status PROCESSING
    const period = await prisma.payrollPeriod.create({
      data: {
        name: dto.name,
        frequency: dto.frequency,
        startDate,
        endDate,
        payDate: dto.payDate,
        departmentId: dto.departmentId,
        status: 'PROCESSING'
      }
    });

    const payroll = await prisma.payroll.create({
      data: {
        periodStart: startDate,
        periodEnd: endDate,
        status: 'PROCESSING',
        departmentId: dto.departmentId,
      }
    });

    // 2. Dispatch to Queue
    await payrollQueue.add('generate-payroll', {
      periodId: period.id,
      payrollId: payroll.id,
      dto
    });

    return { period, payroll, message: 'Payroll processing started in background' };
  }

  /**
   * Heavy calculation task triggered by Worker
   */
  async processPayrollTask(periodId: string, payrollId: string, dto: CreatePayrollPeriodDto) {
    const { startDate, endDate, frequency } = dto;
    const start = new Date(startDate);
    const end = new Date(endDate);

    try {
      const exchangeRate = await this.getExchangeRate();
      const config = await this.getPayrollConfig();
      const expectedWorkingDays = await this.getWorkingDays(start, end);

      // Fetch Employees
      const employees = await prisma.employee.findMany({
        where: {
          employmentStatus: 'ACTIVE',
          deletedAt: null,
          departmentId: dto.departmentId || undefined
        },
        include: { department: true }
      });

      // Process each employee
      const items = await Promise.all(employees.map(async (emp) => {
        const [attendance, leaves, latestReview] = await Promise.all([
          prisma.attendance.aggregate({
            where: { employeeId: emp.id, date: { gte: start, lte: end } },
            _sum: { hoursWorked: true, overtimeHours: true },
            _count: { id: true }
          }),
          prisma.leaveRequest.aggregate({
            where: { employeeId: emp.id, status: 'APPROVED', startDate: { lte: end }, endDate: { gte: start } },
            _sum: { daysRequested: true }
          }),
          prisma.performanceReview.findFirst({
            where: { employeeId: emp.id, status: 'COMPLETED' },
            orderBy: { createdAt: 'desc' }
          })
        ]);

        const baseSalary = Number(emp.baseSalary);
        const freqDivisor = frequency === 'BIWEEKLY' ? 2 : 1;
        const periodBase = baseSalary / freqDivisor;
        
        const attendedDays = attendance._count.id;
        const leaveDays = Number(leaves._sum.daysRequested || 0);
        const absenceDays = Math.max(0, expectedWorkingDays - attendedDays - leaveDays);

        const otRate = emp.department?.overtimeRate || 1.5;
        const overtimeHours = Number(attendance._sum.overtimeHours || 0);
        const hourlyRate = baseSalary / 160;
        const overtimePay = overtimeHours * hourlyRate * otRate;

        const bonuses: any[] = [];
        const years = Math.floor((start.getTime() - emp.hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
        if (years > 0) {
          bonuses.push({ name: 'Bono Antigüedad', type: 'SENIORITY', amount: periodBase * (years * 0.02) });
        }

        if (latestReview?.overallScore) {
          const score = Number(latestReview.overallScore);
          let perfRate = 0;
          if (score >= 4.5) perfRate = 0.10;
          else if (score >= 4.0) perfRate = 0.05;
          else if (score >= 3.0) perfRate = 0.02;

          if (perfRate > 0) {
            bonuses.push({ name: 'Bono Desempeño', type: 'PERFORMANCE', amount: periodBase * perfRate });
          }
        }

        const totalBonuses = bonuses.reduce((acc, b) => acc + b.amount, 0);
        let grossPay = periodBase + overtimePay + totalBonuses;
        
        const deductions: any[] = [
          { name: 'Impuesto sobre la Renta', type: 'TAX_INCOME', amount: grossPay * config.taxRate, percentage: config.taxRate },
          { name: 'Seguro Social', type: 'TAX_SOCIAL_SECURITY', amount: grossPay * config.ssRate, percentage: config.ssRate }
        ];

        if (absenceDays > 0) {
          const dailyRate = periodBase / expectedWorkingDays;
          const absenceAmount = absenceDays * dailyRate;
          deductions.push({ 
            name: `Deducción por Faltas (${absenceDays} días)`, 
            type: 'ABSENCE', 
            amount: absenceAmount 
          });
        }

        const totalDeductions = deductions.reduce((acc, d) => acc + d.amount, 0);
        const netPay = Math.max(0, grossPay - totalDeductions);

        return {
          employeeId: emp.id,
          baseSalary: periodBase,
          regularHours: attendance._sum.hoursWorked || 0,
          overtimeHours,
          overtimePay,
          grossPay,
          netPay,
          currency: 'USD',
          notes: `Tasa Horas Extra: ${otRate}x | Días Laborables: ${expectedWorkingDays}`,
          attendedDays,
          leaveDays,
          absenceDays,
          workingDays: expectedWorkingDays,
          payrollId, // Link to the main Payroll object
          payrollPeriodId: periodId,
          bonuses: { create: bonuses },
          deductions: { create: deductions }
        };
      }));

      // Update in transaction
      await prisma.$transaction(async (tx) => {
        // Create all items
        for (const item of items) {
          await tx.payrollItem.create({ data: item });
        }

        const totals = items.reduce((acc, item) => {
          acc.gross += item.grossPay;
          acc.net += item.netPay;
          acc.deductions += (item.grossPay - item.netPay); // Simplified for now
          acc.bonuses += item.overtimePay; // Should actually sum bonuses
          return acc;
        }, { gross: 0, net: 0, deductions: 0, bonuses: 0 });

        await tx.payroll.update({
          where: { id: payrollId },
          data: {
            status: 'DRAFT',
            totalGross: totals.gross,
            totalNet: totals.net,
            totalDeductions: totals.deductions,
            totalBonuses: totals.bonuses,
            processedAt: new Date()
          }
        });

        await tx.payrollPeriod.update({
          where: { id: periodId },
          data: {
            status: 'DRAFT',
            processedAt: new Date()
          }
        });
      });

      logger.info(`Payroll processing completed for Period ${periodId}`);
    } catch (error) {
      logger.error(`Payroll processing failed for Period ${periodId}:`, error);
      
      await prisma.payroll.update({
        where: { id: payrollId },
        data: { status: 'FAILED', notes: String(error) }
      });

      await prisma.payrollPeriod.update({
        where: { id: periodId },
        data: { status: 'FAILED', notes: String(error) }
      });

      throw error;
    }
  }

  async findAll(query: PayrollQuery) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = {};
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      prisma.payroll.findMany({ 
        where, 
        skip, 
        take: limit, 
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { items: true } } }
      }),
      prisma.payroll.count({ where }),
    ]);

    return { data, meta: paginate(total, page, limit) };
  }

  async findEmployeeItems(employeeId: string) {
    return prisma.payrollItem.findMany({
      where: { employeeId },
      include: {
        payroll: true,
        payrollPeriod: true,
        bonuses: true,
        deductions: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getDetails(id: string) {
    const payroll = await prisma.payroll.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            employee: { select: { firstName: true, lastName: true, employeeCode: true } }
          }
        }
      }
    });

    if (!payroll) throw NotFound('Payroll');
    
    // Add VES conversions dynamically for viewing
    const exchangeRate = await this.getExchangeRate();
    const items = payroll.items.map(item => ({
      ...item,
      grossPayVes: Number(item.grossPay) * exchangeRate,
      netPayVes: Number(item.netPay) * exchangeRate
    }));

    return { ...payroll, items, exchangeRate };
  }

  async approve(id: string) {
    const payroll = await prisma.payroll.findUnique({
      where: { id },
      select: { items: { select: { payrollPeriodId: true } } }
    });

    const periodId = payroll?.items[0]?.payrollPeriodId;

    return prisma.$transaction([
      prisma.payroll.update({
        where: { id },
        data: { status: 'APPROVED', approvedAt: new Date() }
      }),
      ...(periodId ? [
        prisma.payrollPeriod.update({
          where: { id: periodId },
          data: { status: 'APPROVED', approvedAt: new Date() }
        })
      ] : [])
    ]);
  }

  async getAccountingSummary(id: string) {
    const payroll = await prisma.payroll.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            bonuses: true,
            deductions: true
          }
        }
      }
    });

    if (!payroll) throw NotFound('Payroll');

    const summary = {
      totalGross: 0,
      totalNet: 0,
      totalTaxes: 0,
      totalSS: 0,
      totalBonuses: 0,
      itemCount: payroll.items.length
    };

    payroll.items.forEach(item => {
      summary.totalGross += Number(item.grossPay);
      summary.totalNet += Number(item.netPay);
      
      item.deductions.forEach(d => {
        if (d.type === 'TAX_INCOME') summary.totalTaxes += Number(d.amount);
        if (d.type === 'TAX_SOCIAL_SECURITY') summary.totalSS += Number(d.amount);
      });

      item.bonuses.forEach(b => {
        summary.totalBonuses += Number(b.amount);
      });
    });

    return summary;
  }
}

export const payrollService = new PayrollService();



