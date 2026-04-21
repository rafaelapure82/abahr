import { prisma } from '../../config/prisma';
import { parsePagination, paginate } from '../../common/utils/response';
import { NotFound, BadRequest } from '../../common/utils/apiError';
import type { CreatePayrollPeriodDto, PayrollQuery } from './Payroll.types';
import { Decimal } from '@prisma/client/runtime/library';

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
   * Generate a Payroll Period (Nivel Dios: Automatic Data Integration)
   */
  async generatePeriod(dto: CreatePayrollPeriodDto) {
    const { startDate, endDate, frequency } = dto;

    if (startDate >= endDate) throw BadRequest('Start date must be before end date');

    const exchangeRate = await this.getExchangeRate();

    // 1. Create the Period
    const period = await prisma.payrollPeriod.create({
      data: {
        name: dto.name,
        frequency: dto.frequency,
        startDate,
        endDate,
        payDate: dto.payDate,
        departmentId: dto.departmentId,
        status: 'DRAFT'
      }
    });

    // 2. Fetch Employees
    const employees = await prisma.employee.findMany({
      where: {
        employmentStatus: 'ACTIVE',
        deletedAt: null,
        departmentId: dto.departmentId || undefined
      },
      include: { department: true }
    });

    const config = await this.getPayrollConfig();

    // 3. Process each employee
    const items = await Promise.all(employees.map(async (emp) => {
      // a. Summary
      const start = new Date(startDate);
      const end = new Date(endDate);

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

      // b. Calculations
      const baseSalary = Number(emp.baseSalary);
      const freqDivisor = frequency === 'BIWEEKLY' ? 2 : 1;
      const periodBase = baseSalary / freqDivisor;
      
      // i. Overtime
      const otRate = emp.department?.overtimeRate || 1.5;
      const overtimeHours = Number(attendance._sum.overtimeHours || 0);
      const hourlyRate = baseSalary / 160;
      const overtimePay = overtimeHours * hourlyRate * otRate;

      // ii. Bonuses
      const bonuses: any[] = [];
      
      // Seniority: 2% per year
      const years = Math.floor((start.getTime() - emp.hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
      if (years > 0) {
        bonuses.push({ name: 'Antiquity Bonus', type: 'SENIORITY', amount: periodBase * (years * 0.02) });
      }

      // Performance
      if (latestReview?.overallScore) {
        const score = Number(latestReview.overallScore);
        let perfRate = 0;
        if (score >= 4.5) perfRate = 0.10;
        else if (score >= 4.0) perfRate = 0.05;
        else if (score >= 3.0) perfRate = 0.02;

        if (perfRate > 0) {
          bonuses.push({ name: 'Performance Bonus', type: 'PERFORMANCE', amount: periodBase * perfRate });
        }
      }

      const totalBonuses = bonuses.reduce((acc, b) => acc + b.amount, 0);
      const grossPay = periodBase + overtimePay + totalBonuses;
      
      // iii. Deductions
      const deductions: any[] = [
        { name: 'Income Tax', type: 'TAX_INCOME', amount: grossPay * config.taxRate, percentage: config.taxRate },
        { name: 'Social Security', type: 'TAX_SOCIAL_SECURITY', amount: grossPay * config.ssRate, percentage: config.ssRate }
      ];

      const totalDeductions = deductions.reduce((acc, d) => acc + d.amount, 0);
      const netPay = grossPay - totalDeductions;

      return {
        employeeId: emp.id,
        baseSalary: periodBase,
        regularHours: attendance._sum.hoursWorked || 0,
        overtimeHours,
        overtimePay,
        grossPay,
        netPay,
        currency: 'USD',
        notes: `Overtime Rate: ${otRate}x`,
        attendedDays: attendance._count.id,
        leaveDays: leaves._sum.daysRequested || 0,
        payrollPeriodId: period.id,
        bonuses: { create: bonuses },
        deductions: { create: deductions }
      };
    }));

    // 4. Create one Payroll object to group items (Backward compatibility with schema)
    const payroll = await prisma.payroll.create({
      data: {
        periodStart: startDate,
        periodEnd: endDate,
        status: 'DRAFT',
        departmentId: dto.departmentId,
        items: {
          create: items.map(item => ({
            ...item,
            payrollPeriodId: undefined // Remove to avoid conflict if any, handled by parent
          }))
        }
      }
    });

    return { period, payroll };
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
    return prisma.payroll.update({
      where: { id: id },
      data: { status: 'APPROVED' }
    });
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



