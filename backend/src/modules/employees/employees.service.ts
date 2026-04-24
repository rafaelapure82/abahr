import bcrypt from 'bcryptjs';
import { Prisma, DocumentType, AuditAction } from '@prisma/client';
import { prisma } from '../../config/prisma';
import redis from '../../config/redis';
import { env } from '../../config/env';
import { Conflict, NotFound } from '../../common/utils/apiError';
import { parsePagination, paginate } from '../../common/utils/response';
import { storageService } from '../../common/services/storage.service';
import { webhooksService } from '../webhooks/Webhooks.service';
import type { FileData } from '../../common/services/storage.service';
import type { 
  CreateEmployeeDto, UpdateEmployeeDto, 
  EmployeeQuery, EmergencyContactDto, BankInfoDto 
} from './Employees.types';

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
  bankName: true, bankAccountNumber: true, bankRoutingNumber: true, taxId: true,
  probationEndDate: true, terminationDate: true, terminationReason: true,
  isRemote: true, timeZone: true, createdAt: true, updatedAt: true,
  position: { select: { id: true, title: true, code: true } },
  location: { select: { id: true, name: true, city: true } },
  directReports: { select: { id: true, firstName: true, lastName: true, jobTitle: true, avatarUrl: true } },
  user: { select: { id: true, email: true, lastLoginAt: true, roles: { select: { role: { select: { name: true } } } } } },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
export class EmployeesService {
  // ── List (Advanced Search) ────────────────────────────────────────────────
  async findAll(query: EmployeeQuery) {
    const { page, limit, skip } = parsePagination(query);
    const where: Prisma.EmployeeWhereInput = { deletedAt: null };

    // Advanced Filters
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName:  { contains: query.search, mode: 'insensitive' } },
        { jobTitle:  { contains: query.search, mode: 'insensitive' } },
        { employeeCode: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.firstName)    where.firstName = { contains: query.firstName, mode: 'insensitive' };
    if (query.lastName)     where.lastName  = { contains: query.lastName, mode: 'insensitive' };
    if (query.employeeCode) where.employeeCode = { contains: query.employeeCode, mode: 'insensitive' };
    if (query.departmentId) where.departmentId = query.departmentId;
    if (query.status)       where.employmentStatus = query.status;
    if (query.type)         where.employmentType = query.type;
    if (query.managerId)    where.managerId = query.managerId;

    // Search by document (Tax ID or Bank Account as proxy if National ID not in separate field yet)
    if (query.document) {
      where.OR = [
        ...(where.OR || []),
        { taxId: { contains: query.document, mode: 'insensitive' } },
        { bankAccountNumber: { contains: query.document, mode: 'insensitive' } },
      ];
    }

    const orderBy = { [query.sortBy ?? 'firstName']: query.sortOrder ?? 'asc' };

    const [data, total] = await Promise.all([
      prisma.employee.findMany({ where, select: LIST_SELECT, skip, take: limit, orderBy }),
      prisma.employee.count({ where }),
    ]);

    return { data, meta: paginate(total, page, limit) };
  }

  // ── Get by ID ─────────────────────────────────────────────────────────────
  async findById(id: string) {
    const cacheKey = `employee:${id}`;
    
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      console.error('Redis error:', err);
    }

    const emp = await prisma.employee.findUnique({
      where: { id, deletedAt: null },
      select: DETAIL_SELECT,
    });
    if (!emp) throw NotFound('Employee');
    
    try {
      await redis.setex(cacheKey, 3600, JSON.stringify(emp)); // Cache for 1h
    } catch (err) {
      console.error('Redis save error:', err);
    }
    
    return emp;
  }

  // ── Create ────────────────────────────────────────────────────────────────
  async create(dto: CreateEmployeeDto, creatorId?: string) {
    const existing = await prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existing) throw Conflict('A user with this email already exists');

    const passwordHash = await bcrypt.hash(dto.password, env.BCRYPT_ROUNDS);
    const employeeCode = await this.nextCode();

    const { roleIds, email, password, ...empData } = dto;

    const employee = await prisma.employee.create({
      data: {
        ...(empData as any),
        employeeCode,
        dateOfBirth: empData.dateOfBirth ? new Date(empData.dateOfBirth) : undefined,
        hireDate: empData.hireDate ? new Date(empData.hireDate) : new Date(),
        probationEndDate: empData.probationEndDate ? new Date(empData.probationEndDate) : undefined,
        user: {
          create: {
            email: email.toLowerCase(),
            passwordHash,
            isActive: true,
            isEmailVerified: true,
            roles: roleIds ? {
              create: roleIds.map(roleId => ({ roleId }))
            } : undefined
          },
        },
      },
      select: DETAIL_SELECT,
    });

    // Initial Audit Log
    await this.logAudit(creatorId, 'CREATE', 'Employee', employee.id, null, employee);

    // Webhook Trigger
    await webhooksService.trigger('EMPLOYEE_CREATED', employee);

    return employee;
  }

  // ── Update with Detailed Auditing ──────────────────────────────────────────
  async update(id: string, dto: UpdateEmployeeDto, actorId?: string) {
    const oldState = await this.findById(id);

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...(dto as any),
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        hireDate: dto.hireDate ? new Date(dto.hireDate) : undefined,
        probationEndDate: dto.probationEndDate ? new Date(dto.probationEndDate) : undefined,
      },
      select: DETAIL_SELECT,
    });

    // Diff values for audit
    const diff = this.calculateDiff(oldState, employee);
    if (Object.keys(diff.newData).length > 0) {
      await this.logAudit(actorId, 'UPDATE', 'Employee', id, diff.oldData, diff.newData);
    }

    // Invalidate cache
    try {
      await redis.del(`employee:${id}`);
    } catch (err) {
      console.error('Redis invalidation error:', err);
    }

    return employee;
  }

  // ── Dedicated Updates ─────────────────────────────────────────────────────
  async updateEmergencyContact(id: string, dto: EmergencyContactDto, actorId?: string) {
    return this.update(id, dto, actorId);
  }

  async updateBankInfo(id: string, dto: BankInfoDto, actorId?: string) {
    return this.update(id, dto, actorId);
  }

  // ── Document Management ───────────────────────────────────────────────────
  async uploadDocument(employeeId: string, type: DocumentType, file: FileData, actorId?: string) {
    await this.findById(employeeId); // check existence

    const { url, key } = await storageService.upload(file, `employees/${employeeId}/docs`);

    const doc = await prisma.document.create({
      data: {
        employeeId,
        type,
        name: file.originalName,
        fileUrl: url,
        fileKey: key,
        fileSize: file.size,
        mimeType: file.mimetype,
      }
    });

    await this.logAudit(actorId, 'CREATE', 'Document', doc.id, null, { employeeId, type, name: file.originalName });
    return doc;
  }

  async listDocuments(employeeId: string) {
    return prisma.document.findMany({
      where: { employeeId, deletedAt: null },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async deleteDocument(id: string, actorId?: string) {
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) throw NotFound('Document');

    await prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await storageService.delete(doc.fileKey!);
    await this.logAudit(actorId, 'DELETE', 'Document', id, doc, null);
  }

  // ── Audit History for Employee ────────────────────────────────────────────
  async getAuditHistory(id: string) {
    return prisma.auditLog.findMany({
      where: { resource: 'Employee', resourceId: id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } }
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private calculateDiff(oldObj: any, newObj: any) {
    const oldData: any = {};
    const newData: any = {};

    for (const key in newObj) {
      if (['updatedAt', 'createdAt', 'user', 'department', 'manager', 'position', 'location'].includes(key)) continue;
      
      const oldVal = oldObj[key];
      const newVal = newObj[key];

      // Deep compare for dates/objects if needed, but for root fields:
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        oldData[key] = oldVal;
        newData[key] = newVal;
      }
    }
    return { oldData, newData };
  }

  private async logAudit(userId: string | undefined, action: AuditAction, resource: string, resourceId: string, oldValues: any, newValues: any) {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          resource,
          resourceId,
          oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : undefined,
          newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : undefined,
          description: `${action} ${resource} #${resourceId}`,
        }
      });
    } catch (err) {
      console.error('Audit Log failed:', err);
    }
  }

  async softDelete(id: string, actorId?: string) {
    const employee = await this.findById(id);
    await prisma.$transaction([
      prisma.employee.update({ where: { id }, data: { deletedAt: new Date(), employmentStatus: 'TERMINATED' } }),
      prisma.user.update({ where: { id: employee.user!.id }, data: { deletedAt: new Date(), isActive: false } })
    ]);
    await this.logAudit(actorId, 'SOFT_DELETE', 'Employee', id, employee, { deletedAt: new Date() });
    
    // Invalidate cache
    try {
      await redis.del(`employee:${id}`);
    } catch (err) {
      console.error('Redis invalidation error:', err);
    }
  }

  async getStats() {
    const [total, byStatus, byType] = await Promise.all([
      prisma.employee.count({ where: { deletedAt: null } }),
      prisma.employee.groupBy({ by: ['employmentStatus'], _count: true, where: { deletedAt: null } }),
      prisma.employee.groupBy({ by: ['employmentType'], _count: true, where: { deletedAt: null } }),
    ]);
    return { total, byStatus, byType };
  }

  async getTeam(managerId: string) {
    return prisma.employee.findMany({
      where: { managerId, deletedAt: null },
      select: LIST_SELECT,
    });
  }

  async getOrgPath(id: string) {
    const path = [];
    let current = await prisma.employee.findUnique({
      where: { id },
      select: { id: true, firstName: true, lastName: true, managerId: true }
    });
    while (current?.managerId) {
      current = await prisma.employee.findUnique({
        where: { id: current.managerId },
        select: { id: true, firstName: true, lastName: true, managerId: true }
      });
      if (current) path.unshift(current);
    }
    return path;
  }

  private async nextCode(): Promise<string> {
    const employees = await prisma.employee.findMany({
      select: { employeeCode: true },
    });
    
    const numbers = employees
      .map(e => parseInt(e.employeeCode.replace('EMP-', ''), 10))
      .filter(n => !isNaN(n));
      
    const max = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `EMP-${String(max + 1).padStart(4, '0')}`;
  }
}

export const employeesService = new EmployeesService();
