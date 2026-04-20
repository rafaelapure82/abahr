import bcrypt from 'bcryptjs';
import { Role, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { Conflict, NotFound } from '../../common/utils/apiError';
import { parsePagination, paginate } from '../../common/utils/response';
import type { CreateEmployeeDto, UpdateEmployeeDto, UpdateStatusDto, EmployeeQuery } from './employees.types';

// ── Common selects ────────────────────────────────────────────────────────────
const LIST_SELECT = {
  id: true, employeeCode: true, firstName: true, lastName: true,
  displayName: true, jobTitle: true, avatarUrl: true,
  employmentStatus: true, employmentType: true, hireDate: true,
  department: { select: { id: true, name: true } },
  manager: { select: { id: true, firstName: true, lastName: true } },
} as const;

const DETAIL_SELECT = {
  ...LIST_SELECT,
  middleName: true, gender: true, dateOfBirth: true, maritalStatus: true,
  bloodType: true, nationality: true, workPhone: true, personalPhone: true,
  workEmail: true, personalEmail: true, linkedinUrl: true,
  addressLine1: true, addressLine2: true, city: true, state: true,
  postalCode: true, country: true,
  emergencyName: true, emergencyPhone: true, emergencyRelation: true,
  baseSalary: true, currency: true, salaryFrequency: true,
  probationEndDate: true, terminationDate: true, terminationReason: true,
  isRemote: true, timeZone: true, createdAt: true, updatedAt: true,
  position: { select: { id: true, title: true, code: true } },
  location: { select: { id: true, name: true, city: true } },
  directReports: { select: { id: true, firstName: true, lastName: true, jobTitle: true, avatarUrl: true } },
  user: { select: { id: true, email: true, role: true, lastLoginAt: true } },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
export class EmployeesService {
  // ── List ─────────────────────────────────────────────────────────────────
  async findAll(query: EmployeeQuery) {
    const { page, limit, skip } = parsePagination(query);

    // Build dynamic where clause
    const where: Prisma.EmployeeWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName:  { contains: query.search, mode: 'insensitive' } },
        { jobTitle:  { contains: query.search, mode: 'insensitive' } },
        { employeeCode: { contains: query.search, mode: 'insensitive' } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.status)       where.employmentStatus = query.status;
    if (query.type)         where.employmentType = query.type;
    if (query.managerId)    where.managerId = query.managerId;

    const orderBy = { [query.sortBy ?? 'firstName']: query.sortOrder ?? 'asc' };

    const [data, total] = await Promise.all([
      prisma.employee.findMany({ where, select: LIST_SELECT, skip, take: limit, orderBy }),
      prisma.employee.count({ where }),
    ]);

    return { data, meta: paginate(total, page, limit) };
  }

  // ── Get by ID ─────────────────────────────────────────────────────────────
  async findById(id: string) {
    const emp = await prisma.employee.findUnique({
      where: { id, deletedAt: null },
      select: DETAIL_SELECT,
    });
    if (!emp) throw NotFound('Employee');
    return emp;
  }

  // ── Get by user ID ────────────────────────────────────────────────────────
  async findByUserId(userId: string) {
    const emp = await prisma.employee.findUnique({
      where: { userId, deletedAt: null },
      select: DETAIL_SELECT,
    });
    if (!emp) throw NotFound('Employee');
    return emp;
  }

  // ── Create (also creates User account) ───────────────────────────────────
  async create(dto: CreateEmployeeDto) {
    const existing = await prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw Conflict('A user with this email already exists');

    const passwordHash = await bcrypt.hash(dto.password, env.BCRYPT_ROUNDS);
    const employeeCode = await this.nextCode();

    const employee = await prisma.employee.create({
      data: {
        employeeCode,
        firstName: dto.firstName,
        middleName: dto.middleName,
        lastName: dto.lastName,
        gender: dto.gender,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        maritalStatus: dto.maritalStatus,
        nationality: dto.nationality,
        workPhone: dto.workPhone,
        personalPhone: dto.personalPhone,
        personalEmail: dto.personalEmail,
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country,
        emergencyName: dto.emergencyName,
        emergencyPhone: dto.emergencyPhone,
        emergencyRelation: dto.emergencyRelation,
        jobTitle: dto.jobTitle,
        employmentType: dto.employmentType,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : new Date(),
        probationEndDate: dto.probationEndDate ? new Date(dto.probationEndDate) : undefined,
        departmentId: dto.departmentId,
        positionId: dto.positionId,
        managerId: dto.managerId,
        locationId: dto.locationId,
        baseSalary: dto.baseSalary,
        currency: dto.currency,
        salaryFrequency: dto.salaryFrequency,
        bankName: dto.bankName,
        bankAccountNumber: dto.bankAccountNumber,
        isRemote: dto.isRemote,
        timeZone: dto.timeZone,
        user: {
          create: {
            email: dto.email.toLowerCase(),
            passwordHash,
            role: dto.role as Role,
            isActive: true,
            isEmailVerified: true,
          },
        },
      },
      select: DETAIL_SELECT,
    });

    return employee;
  }

  // ── Update ────────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateEmployeeDto) {
    await this.findById(id); // existence check

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...dto,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
        probationEndDate: dto.probationEndDate ? new Date(dto.probationEndDate) : undefined,
      },
      select: DETAIL_SELECT,
    });

    return employee;
  }

  // ── Update status (terminate, suspend, etc.) ──────────────────────────────
  async updateStatus(id: string, dto: UpdateStatusDto) {
    await this.findById(id);

    return prisma.employee.update({
      where: { id },
      data: {
        employmentStatus: dto.status,
        terminationDate:
          dto.status === 'TERMINATED' && dto.effectiveDate
            ? new Date(dto.effectiveDate)
            : undefined,
        terminationReason:
          dto.status === 'TERMINATED' ? dto.reason : undefined,
      },
      select: LIST_SELECT,
    });
  }

  // ── Soft delete ───────────────────────────────────────────────────────────
  async softDelete(id: string) {
    await this.findById(id);
    await prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date(), employmentStatus: 'TERMINATED' },
    });
  }

  // ── Org chart path (ancestors) ────────────────────────────────────────────
  async getOrgPath(id: string): Promise<Array<{ id: string; firstName: string; lastName: string; jobTitle: string }>> {
    const path = [];
    let currentId: string | null = id;

    while (currentId) {
      const emp = await prisma.employee.findUnique({
        where: { id: currentId, deletedAt: null },
        select: { id: true, firstName: true, lastName: true, jobTitle: true, managerId: true },
      });
      if (!emp) break;
      path.unshift({ id: emp.id, firstName: emp.firstName, lastName: emp.lastName, jobTitle: emp.jobTitle });
      currentId = emp.managerId;
    }

    return path;
  }

  // ── Direct reports tree ───────────────────────────────────────────────────
  async getTeam(managerId: string) {
    return prisma.employee.findMany({
      where: { managerId, deletedAt: null },
      select: {
        id: true, firstName: true, lastName: true, jobTitle: true,
        avatarUrl: true, employmentStatus: true,
        _count: { select: { directReports: true } },
      },
    });
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  async getStats() {
    const [total, byStatus, byDept, newThisMonth] = await Promise.all([
      prisma.employee.count({ where: { deletedAt: null } }),
      prisma.employee.groupBy({ by: ['employmentStatus'], where: { deletedAt: null }, _count: true }),
      prisma.employee.groupBy({
        by: ['departmentId'], where: { deletedAt: null },
        _count: true,
        orderBy: { _count: { departmentId: 'desc' } },
        take: 5,
      }),
      prisma.employee.count({
        where: {
          deletedAt: null,
          hireDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
    ]);

    return { total, byStatus, byDept, newThisMonth };
  }

  private async nextCode(): Promise<string> {
    const last = await prisma.employee.findFirst({
      orderBy: { employeeCode: 'desc' },
      select: { employeeCode: true },
    });
    const n = last ? parseInt(last.employeeCode.replace('EMP-', ''), 10) + 1 : 1;
    return `EMP-${String(n).padStart(4, '0')}`;
  }
}

export const employeesService = new EmployeesService();
