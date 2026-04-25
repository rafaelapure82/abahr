import { prisma } from '../../config/prisma';
import { parsePagination, paginate } from '../../common/utils/response';
import { NotFound, BadRequest, Conflict } from '../../common/utils/apiError';
import type { 
  DepartmentsQuery, CreateDepartmentDto, UpdateDepartmentDto,
  CreatePositionDto, UpdatePositionDto, CreateLocationDto, UpdateLocationDto,
  DepartmentTree
} from './Departments.types';

export class DepartmentsService {
  
  // ── Departments ────────────────────────────────────────────────────────────
  
  async findAll(query: DepartmentsQuery) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = { deletedAt: null };
    
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.isActive !== undefined) where.isActive = query.isActive;

    const [data, total] = await Promise.all([
      prisma.department.findMany({ 
        where, 
        skip, 
        take: limit, 
        orderBy: { name: 'asc' },
        include: { _count: { select: { employees: true, positions: true } } }
      }),
      prisma.department.count({ where }),
    ]);
    
    return { data, meta: paginate(total, page, limit) };
  }

  async findById(id: string) {
    const dept = await prisma.department.findUnique({
      where: { id, deletedAt: null },
      include: { 
        parent: { select: { id: true, name: true } },
        children: { where: { deletedAt: null }, select: { id: true, name: true } },
        positions: { where: { deletedAt: null } },
        _count: { select: { employees: true } }
      }
    });
    if (!dept) throw NotFound('Department');
    return dept;
  }

  async create(dto: CreateDepartmentDto) {
    const existing = await prisma.department.findUnique({ where: { code: dto.code } });
    if (existing) throw Conflict('Department code already exists');

    if (dto.headId) {
      await this.validateManagerUniqueness(dto.headId);
    }

    return prisma.department.create({ data: dto as any });
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    if (dto.parentId === id) throw BadRequest('A department cannot be its own parent');
    
    const dept = await this.findById(id);

    if (dto.headId && dto.headId !== dept.headId) {
      await this.validateManagerUniqueness(dto.headId);
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.department.update({
        where: { id },
        data: dto as any
      });

      // Log changes for specific fields
      if (dto.headId && dto.headId !== dept.headId) {
        await tx.deptHistory.create({
          data: {
            departmentId: id,
            action: 'MANAGER_CHANGE',
            previousValue: dept.headId,
            newValue: dto.headId,
            changedById: (dto as any).userId || 'system'
          }
        });
      }

      if (dto.budget !== undefined && Number(dto.budget) !== Number(dept.budget)) {
        await tx.deptHistory.create({
          data: {
            departmentId: id,
            action: 'BUDGET_UPDATE',
            previousValue: dept.budget?.toString(),
            newValue: dto.budget.toString(),
            changedById: (dto as any).userId || 'system'
          }
        });
      }

      return updated;
    });
  }

  async remove(id: string) {
    const dept = await this.findById(id);
    if (dept._count.employees > 0) {
      throw BadRequest('Cannot delete department with active employees. Reassign them first.');
    }

    // Soft delete
    await prisma.department.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false }
    });
  }

  // ── Hierarchical Tree (JSON) ───────────────────────────────────────────────
  
  async getTree(): Promise<DepartmentTree[]> {
    const all = await prisma.department.findMany({
      where: { deletedAt: null, isActive: true },
      include: {
        _count: { select: { employees: true, positions: true } }
      }
    });

    const map = new Map<string, DepartmentTree>();
    const roots: DepartmentTree[] = [];

    all.forEach(d => {
      map.set(d.id, { ...d, children: [], _count: d._count } as any);
    });

    all.forEach(d => {
      const node = map.get(d.id)!;
      if (d.parentId && map.has(d.parentId)) {
        map.get(d.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  // ── Dynamic Org Chart (Employee Reporting Structure) ──────────────────────

  async getOrgChart() {
    const employees = await prisma.employee.findMany({
      where: { deletedAt: null, employmentStatus: 'ACTIVE' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        avatarUrl: true,
        managerId: true,
        department: { select: { id: true, name: true, color: true } }
      }
    });

    const map = new Map<string, any>();
    const roots: any[] = [];

    employees.forEach(e => {
      map.set(e.id, { 
        ...e, 
        name: `${e.firstName} ${e.lastName}`,
        children: [] 
      });
    });

    employees.forEach(e => {
      const node = map.get(e.id)!;
      if (e.managerId && map.has(e.managerId)) {
        map.get(e.managerId)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  // ── Positions ──────────────────────────────────────────────────────────────

  async findPositions(query: any) {
    const where = { deletedAt: null };
    return prisma.position.findMany({ 
      where, 
      include: { department: { select: { name: true } } },
      orderBy: { level: 'desc' }
    });
  }

  async createPosition(dto: CreatePositionDto) {
    const existing = await prisma.position.findUnique({ where: { code: dto.code } });
    if (existing) throw Conflict('Position code already exists');

    return prisma.position.create({ data: dto as any });
  }

  async updatePosition(id: string, dto: UpdatePositionDto) {
    const pos = await prisma.position.findUnique({ where: { id } });
    if (!pos) throw NotFound('Position');

    // If level is changing, we might want to log it or check implications, 
    // but strict validation happens at the Employee-Manager link level.
    return prisma.position.update({
      where: { id },
      data: dto as any
    });
  }

  async removePosition(id: string) {
    const count = await prisma.employee.count({ where: { positionId: id, deletedAt: null } });
    if (count > 0) throw BadRequest('Cannot delete position with active employees.');

    await prisma.position.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  // ── Strict Level Validation Helper (To be used from Employees module or here) ──
  
  /**
   * Validates that a manager has a higher seniority level than the subordinate.
   * @param subordinatePositionId 
   * @param managerPositionId 
   */
  async validateHierarchyLevel(subordinatePositionId: string, managerPositionId: string) {
    const [sub, mgr] = await Promise.all([
      prisma.position.findUnique({ where: { id: subordinatePositionId } }),
      prisma.position.findUnique({ where: { id: managerPositionId } }),
    ]);

    if (!sub || !mgr) throw BadRequest('Invalid position references for hierarchy validation');

    if (mgr.level <= sub.level) {
      throw BadRequest(`Hierarchy Violation: Manager position (${mgr.title}, Lvl ${mgr.level}) must have a strictly higher level than subordinate (${sub.title}, Lvl ${sub.level}).`);
    }

    return true;
  }

  /**
   * Validates that an employee is not already a manager (Head) of another department.
   * @param employeeId 
   */
  async validateManagerUniqueness(employeeId: string) {
    const existingParticipation = await prisma.department.findFirst({
      where: { 
        headId: employeeId,
        deletedAt: null,
        isActive: true
      }
    });

    if (existingParticipation) {
      throw Conflict(`Employee is already the manager of department: ${existingParticipation.name}. An employee cannot lead two departments.`);
    }
  }

  async findLocations() {
    return prisma.officeLocation.findMany({ 
      orderBy: { name: 'asc' }
    });
  }

  async createLocation(dto: CreateLocationDto) {
    const existing = await prisma.officeLocation.findUnique({ where: { code: dto.code } });
    if (existing) throw Conflict('Location code already exists');
    return prisma.officeLocation.create({ data: dto as any });
  }

  async updateLocation(id: string, dto: UpdateLocationDto) {
    return prisma.officeLocation.update({
      where: { id },
      data: dto as any
    });
  }

  async removeLocation(id: string) {
    await prisma.officeLocation.delete({ where: { id } });
  }

  async bulkMoveEmployees(dto: any, processedById: string) {
    const { employeeIds, newDeptId, newPositionId, newManagerId, reason, effectiveDate } = dto;

    return prisma.$transaction(async (tx) => {
      const results = [];

      for (const empId of employeeIds) {
        const emp = await tx.employee.findUnique({ where: { id: empId } });
        if (!emp) continue;

        // Record movement
        await tx.orgMovement.create({
          data: {
            employeeId: empId,
            oldDeptId: emp.departmentId,
            newDeptId: newDeptId,
            oldPositionId: emp.positionId,
            newPositionId: newPositionId,
            oldManagerId: emp.managerId,
            newManagerId: newManagerId,
            reason,
            effectiveDate,
            processedById
          }
        });

        // Update employee
        const updated = await tx.employee.update({
          where: { id: empId },
          data: {
            departmentId: newDeptId !== undefined ? newDeptId : undefined,
            positionId: newPositionId !== undefined ? newPositionId : undefined,
            managerId: newManagerId !== undefined ? newManagerId : undefined,
          }
        });

        results.push(updated);
      }

      return results;
    });
  }

  async getHistory(departmentId: string) {
    return prisma.deptHistory.findMany({
      where: { departmentId },
      include: { department: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const departmentsService = new DepartmentsService();



