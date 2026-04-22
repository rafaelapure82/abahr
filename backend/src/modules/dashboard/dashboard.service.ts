import { prisma } from '../../config/prisma';
import { logger } from '../../config/logger';
import redis from '../../config/redis';
import type {
  DashboardData,
  DashboardQuery,
  DepartmentHeadcount,
  MonthlyTrend,
  RecentActivity,
  PayrollSummary,
  LeaveOverview,
} from './Dashboard.types';

export class DashboardService {

  /**
   * ── Master KPIs ───────────────────────────────────────────────────────────
   * Returns the full dashboard payload with real data.
   * Includes Redis caching for high concurrency performance.
   */
  async getDashboard(query: DashboardQuery): Promise<DashboardData> {
    const cacheKey = `dashboard:${query.period}:${query.departmentId || 'all'}`;

    // Try to get from cache first
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        logger.debug(`Cache hit for ${cacheKey}`);
        return JSON.parse(cachedData);
      }
    } catch (err) {
      logger.error('Redis cache error:', err);
    }

    const now = new Date();
    const periodMonths = this.getPeriodMonths(query.period);
    const periodStart = new Date(now.getFullYear(), now.getMonth() - periodMonths, 1);
    const prevPeriodStart = new Date(now.getFullYear(), now.getMonth() - (periodMonths * 2), 1);

    const deptFilter = query.departmentId ? { departmentId: query.departmentId } : {};

    const [
      kpis,
      headcountByDepartment,
      monthlyTrends,
      payrollSummary,
      leaveOverview,
      recentActivity,
      upcomingBirthdays,
    ] = await Promise.all([
      this.calculateKpis(periodStart, prevPeriodStart, now, deptFilter),
      this.getHeadcountByDepartment(deptFilter),
      this.getMonthlyTrends(periodStart, now, deptFilter),
      this.getPayrollSummary(deptFilter),
      this.getLeaveOverview(now),
      this.getRecentActivity(),
      this.getUpcomingBirthdays(now),
    ]);

    const result = {
      kpis,
      headcountByDepartment,
      monthlyTrends,
      payrollSummary,
      leaveOverview,
      recentActivity,
      upcomingBirthdays,
    };

    // Save to cache (TTL: 5 minutes)
    try {
      await redis.setex(cacheKey, 300, JSON.stringify(result));
    } catch (err) {
      logger.error('Redis save error:', err);
    }

    return result;
  }

  /**
   * ── KPI Calculations ──────────────────────────────────────────────────────
   */
  private async calculateKpis(
    periodStart: Date,
    prevPeriodStart: Date,
    now: Date,
    deptFilter: any,
  ) {
    const where = { deletedAt: null, ...deptFilter };

    const [
      totalEmployees,
      activeEmployees,
      departmentsCount,
      pendingLeaves,
      terminatedCurrentPeriod,
      terminatedPrevPeriod,
      avgPerformance,
      totalAttendanceDays,
      expectedAttendanceDays,
      latestPayroll,
    ] = await Promise.all([
      // Total employees
      prisma.employee.count({ where }),

      // Active employees
      prisma.employee.count({ where: { ...where, employmentStatus: 'ACTIVE' } }),

      // Departments count
      prisma.department.count({ where: { isActive: true, deletedAt: null } }),

      // Pending leave requests
      prisma.leaveRequest.count({ where: { status: 'PENDING' } }),

      // Terminated in current period (for turnover)
      prisma.employee.count({
        where: { ...where, employmentStatus: 'TERMINATED', terminationDate: { gte: periodStart, lte: now } },
      }),

      // Terminated in previous period (for trend)
      prisma.employee.count({
        where: { ...where, employmentStatus: 'TERMINATED', terminationDate: { gte: prevPeriodStart, lt: periodStart } },
      }),

      // Average performance score
      prisma.performanceReview.aggregate({
        where: { status: 'COMPLETED' },
        _avg: { overallScore: true },
      }),

      // Attendance: total attended days this month
      prisma.attendance.count({
        where: {
          date: { gte: new Date(now.getFullYear(), now.getMonth(), 1), lte: now },
          status: { in: ['PRESENT', 'LATE', 'REMOTE'] },
        },
      }),

      // Expected attendance (active employees * working days so far this month — simplified)
      prisma.employee.count({ where: { ...where, employmentStatus: 'ACTIVE' } }),

      // Latest payroll
      prisma.payroll.findFirst({
        where: { status: { in: ['APPROVED', 'PAID'] } },
        orderBy: { createdAt: 'desc' },
        select: { totalGross: true, totalNet: true },
      }),
    ]);

    // Turnover rate = (terminated / avg headcount) * 100
    const avgHeadcount = totalEmployees || 1;
    const turnoverRate = Number(((terminatedCurrentPeriod / avgHeadcount) * 100).toFixed(1));
    const prevTurnoverRate = Number(((terminatedPrevPeriod / avgHeadcount) * 100).toFixed(1));
    const turnoverChange = turnoverRate - prevTurnoverRate;

    // Absenteeism: approximate working days this month
    const dayOfMonth = now.getDate();
    const workingDaysEstimate = Math.ceil(dayOfMonth * (5 / 7)); // rough weekday estimate
    const expectedTotal = expectedAttendanceDays * workingDaysEstimate;
    const absenteeismRate = expectedTotal > 0
      ? Number((((expectedTotal - totalAttendanceDays) / expectedTotal) * 100).toFixed(1))
      : 0;

    const avgScore = Number(avgPerformance._avg.overallScore || 0);
    const payrollCost = Number(latestPayroll?.totalGross || 0);

    return {
      totalEmployees: {
        label: 'Total Empleados',
        value: totalEmployees,
        trend: 'flat' as const,
        icon: 'users',
      },
      activeEmployees: {
        label: 'Activos',
        value: activeEmployees,
        change: totalEmployees > 0 ? Number(((activeEmployees / totalEmployees) * 100).toFixed(0)) : 0,
        trend: 'up' as const,
        icon: 'user-check',
      },
      departmentsCount: {
        label: 'Departamentos',
        value: departmentsCount,
        trend: 'flat' as const,
        icon: 'building-2',
      },
      pendingLeaves: {
        label: 'Permisos Pendientes',
        value: pendingLeaves,
        trend: pendingLeaves > 5 ? 'up' as const : 'flat' as const,
        icon: 'calendar-clock',
      },
      turnoverRate: {
        label: 'Tasa de Rotación',
        value: `${turnoverRate}%`,
        change: turnoverChange,
        trend: turnoverChange > 0 ? 'up' as const : turnoverChange < 0 ? 'down' as const : 'flat' as const,
        icon: 'trending-down',
      },
      avgPerformance: {
        label: 'Desempeño Promedio',
        value: `${avgScore.toFixed(1)} / 5`,
        trend: avgScore >= 3.5 ? 'up' as const : 'down' as const,
        icon: 'star',
      },
      absenteeismRate: {
        label: 'Índice Ausentismo',
        value: `${absenteeismRate}%`,
        trend: absenteeismRate > 10 ? 'up' as const : 'flat' as const,
        icon: 'alert-circle',
      },
      payrollCost: {
        label: 'Costo Nómina',
        value: `$${payrollCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        trend: 'flat' as const,
        icon: 'dollar-sign',
      },
    };
  }

  /**
   * ── Headcount by Department ───────────────────────────────────────────────
   */
  private async getHeadcountByDepartment(deptFilter: any): Promise<DepartmentHeadcount[]> {
    const departments = await prisma.department.findMany({
      where: { isActive: true, deletedAt: null },
      select: {
        id: true,
        name: true,
        color: true,
        _count: { select: { employees: { where: { deletedAt: null, employmentStatus: 'ACTIVE' } } } },
      },
      orderBy: { name: 'asc' },
    });

    return departments.map((d) => ({
      departmentId: d.id,
      departmentName: d.name,
      count: d._count.employees,
      color: d.color || undefined,
    }));
  }

  /**
   * ── Monthly Trends (Hires vs Terminations) ─────────────────────────────
   */
  private async getMonthlyTrends(periodStart: Date, now: Date, deptFilter: any): Promise<MonthlyTrend[]> {
    const employees = await prisma.employee.findMany({
      where: { deletedAt: null, ...deptFilter },
      select: {
        hireDate: true,
        terminationDate: true,
        employmentStatus: true,
      },
    });

    const months: MonthlyTrend[] = [];
    const current = new Date(periodStart);

    while (current <= now) {
      const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);

      const hires = employees.filter(
        (e) => e.hireDate >= monthStart && e.hireDate <= monthEnd,
      ).length;

      const terminations = employees.filter(
        (e) => e.terminationDate && e.terminationDate >= monthStart && e.terminationDate <= monthEnd,
      ).length;

      // Headcount at end of month = total hired before monthEnd minus terminated before monthEnd
      const headcount = employees.filter(
        (e) => e.hireDate <= monthEnd && (!e.terminationDate || e.terminationDate > monthEnd),
      ).length;

      months.push({ month: monthKey, hires, terminations, headcount });
      current.setMonth(current.getMonth() + 1);
    }

    return months;
  }

  /**
   * ── Payroll Summary ───────────────────────────────────────────────────────
   */
  private async getPayrollSummary(deptFilter: any): Promise<PayrollSummary> {
    const latestPayroll = await prisma.payroll.findFirst({
      where: { status: { in: ['APPROVED', 'PAID'] } },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { bonuses: true, deductions: true },
        },
      },
    });

    if (!latestPayroll) {
      return { totalGross: 0, totalNet: 0, totalDeductions: 0, totalBonuses: 0, employeeCount: 0, currency: 'USD' };
    }

    let totalGross = 0;
    let totalNet = 0;
    let totalDeductions = 0;
    let totalBonuses = 0;

    latestPayroll.items.forEach((item) => {
      totalGross += Number(item.grossPay);
      totalNet += Number(item.netPay);
      item.deductions.forEach((d) => { totalDeductions += Number(d.amount); });
      item.bonuses.forEach((b) => { totalBonuses += Number(b.amount); });
    });

    return {
      totalGross,
      totalNet,
      totalDeductions,
      totalBonuses,
      employeeCount: latestPayroll.items.length,
      currency: latestPayroll.currency,
    };
  }

  /**
   * ── Leave Overview ────────────────────────────────────────────────────────
   */
  private async getLeaveOverview(now: Date): Promise<LeaveOverview> {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [pending, approved, rejected, totalThisMonth] = await Promise.all([
      prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
      prisma.leaveRequest.count({ where: { status: 'APPROVED', createdAt: { gte: monthStart } } }),
      prisma.leaveRequest.count({ where: { status: 'REJECTED', createdAt: { gte: monthStart } } }),
      prisma.leaveRequest.count({ where: { createdAt: { gte: monthStart } } }),
    ]);

    return { pending, approved, rejected, totalThisMonth };
  }

  /**
   * ── Recent Activity Feed ──────────────────────────────────────────────────
   */
  private async getRecentActivity(): Promise<RecentActivity[]> {
    const activities: RecentActivity[] = [];

    // Latest hires
    const recentHires = await prisma.employee.findMany({
      where: { deletedAt: null },
      orderBy: { hireDate: 'desc' },
      take: 3,
      select: { id: true, firstName: true, lastName: true, hireDate: true, department: { select: { name: true } } },
    });

    recentHires.forEach((e) => {
      activities.push({
        id: e.id,
        type: 'hire',
        title: 'Nuevo empleado incorporado',
        description: `${e.firstName} ${e.lastName} se unió a ${e.department?.name || 'la organización'}`,
        timestamp: e.hireDate,
        severity: 'success',
      });
    });

    // Latest leave requests
    const recentLeaves = await prisma.leaveRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: {
        id: true,
        status: true,
        leaveType: true,
        createdAt: true,
        employee: { select: { firstName: true, lastName: true } },
      },
    });

    recentLeaves.forEach((l) => {
      const severity = l.status === 'APPROVED' ? 'success' : l.status === 'REJECTED' ? 'error' : 'info';
      activities.push({
        id: l.id,
        type: 'leave',
        title: `Permiso ${l.status === 'APPROVED' ? 'aprobado' : l.status === 'REJECTED' ? 'rechazado' : 'solicitado'}`,
        description: `${l.employee.firstName} ${l.employee.lastName} - ${l.leaveType}`,
        timestamp: l.createdAt,
        severity,
      });
    });

    // Sort by most recent
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return activities.slice(0, 8);
  }

  /**
   * ── Upcoming Birthdays ────────────────────────────────────────────────────
   */
  private async getUpcomingBirthdays(now: Date) {
    const employees = await prisma.employee.findMany({
      where: { deletedAt: null, employmentStatus: 'ACTIVE', dateOfBirth: { not: null } },
      select: { firstName: true, lastName: true, dateOfBirth: true, department: { select: { name: true } } },
    });

    const upcoming = employees
      .filter((e) => {
        if (!e.dateOfBirth) return false;
        const bday = new Date(e.dateOfBirth);
        const thisYearBday = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());
        const diff = (thisYearBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 30;
      })
      .map((e) => ({
        name: `${e.firstName} ${e.lastName}`,
        date: e.dateOfBirth!.toISOString().split('T')[0],
        departmentName: e.department?.name || 'Sin departamento',
      }))
      .slice(0, 5);

    return upcoming;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  private getPeriodMonths(period: string): number {
    switch (period) {
      case 'week': return 1;
      case 'month': return 1;
      case 'quarter': return 3;
      case 'year': return 12;
      default: return 1;
    }
  }
}

export const dashboardService = new DashboardService();
