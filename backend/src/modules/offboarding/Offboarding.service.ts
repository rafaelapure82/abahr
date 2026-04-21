import { prisma } from '../../config/prisma';
import { parsePagination, paginate } from '../../common/utils/response';
import { NotFound, BadRequest } from '../../common/utils/apiError';
import { 
  BoardingStatus, TaskStatus, WebhookEvent, NotificationType, EmploymentStatus 
} from '@prisma/client';
import type { 
  OffboardingQuery, InitiateOffboardingDto, 
  UpdateOffboardingTaskDto, CreateOffboardingTemplateDto 
} from './Offboarding.types';
import { notificationsService } from '../notifications/Notifications.service';
import { webhooksService } from '../webhooks/Webhooks.service';
import { addDays } from 'date-fns';

export class OffboardingService {
  
  // ─── Template Management ──────────────────────────────────────────────────

  async findAllTemplates() {
    return prisma.offboardingTemplate.findMany({
      where: { isActive: true },
      include: { tasks: true },
      orderBy: { name: 'asc' },
    });
  }

  async findTemplateById(id: string) {
    const template = await prisma.offboardingTemplate.findUnique({
      where: { id },
      include: { tasks: true },
    });
    if (!template) throw NotFound('Template');
    return template;
  }

  async createTemplate(dto: CreateOffboardingTemplateDto) {
    const { tasks, ...data } = dto;
    return prisma.offboardingTemplate.create({
      data: {
        ...data,
        tasks: tasks ? {
          create: tasks.map(t => ({
            ...t,
            checklistItems: t.checklistItems || [],
          }))
        } : undefined,
      },
      include: { tasks: true },
    });
  }

  // ─── Offboarding Instance Logic ───────────────────────────────────────────

  async findAll(query: OffboardingQuery) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = {};
    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      prisma.offboarding.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: { select: { firstName: true, lastName: true, jobTitle: true, hireDate: true } },
          tasks: { select: { id: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.offboarding.count({ where }),
    ]);

    return { data, meta: paginate(total, page, limit) };
  }

  async findById(id: string) {
    const offboarding = await prisma.offboarding.findUnique({
      where: { id },
      include: {
        employee: true,
        tasks: { orderBy: { order: 'asc' } },
        template: true,
      },
    });
    if (!offboarding) throw NotFound('Offboarding');
    return offboarding;
  }

  /**
   * ── Initiate Offboarding ──────────────────────────────────────────────────
   */
  async initiate(dto: InitiateOffboardingDto) {
    const existing = await prisma.offboarding.findUnique({ where: { employeeId: dto.employeeId } });
    if (existing) throw BadRequest('Employee already has an offboarding process');

    const employee = await prisma.employee.findUnique({ where: { id: dto.employeeId } });
    if (!employee) throw NotFound('Employee');

    // 1. Find Template
    const template = dto.templateId 
      ? await this.findTemplateById(dto.templateId)
      : await prisma.offboardingTemplate.findFirst({ where: { isDefault: true }, include: { tasks: true } });

    if (!template) throw BadRequest('No offboarding template found');

    const lastWorkDay = new Date(dto.lastWorkDay);

    // 2. Create Offboarding Instance
    const offboarding = await prisma.offboarding.create({
      data: {
        employeeId: dto.employeeId,
        templateId: template.id,
        status: BoardingStatus.IN_PROGRESS,
        lastWorkDay,
        exitInterviewAt: dto.exitInterviewAt ? new Date(dto.exitInterviewAt) : undefined,
        exitReason: dto.exitReason,
        hrOwnerId: dto.hrOwnerId,
        notes: dto.notes,
      },
    });

    // 3. Clone Template Tasks and Auto-Assign Roles
    const taskPromises = template.tasks.map(async (t) => {
      let assignedToId: string | null = null;
      
      if (t.roleId) {
        const roleUser = await prisma.userRole.findFirst({
          where: { roleId: t.roleId, user: { isActive: true } },
          select: { userId: true },
        });
        assignedToId = roleUser?.userId || null;
      }

      return prisma.offboardingTask.create({
        data: {
          offboardingId: offboarding.id,
          title: t.title,
          description: t.description,
          category: t.category,
          status: TaskStatus.PENDING,
          order: t.order,
          dueDate: addDays(lastWorkDay, t.dueDays), // t.dueDays is negative in templates
          assignedToId,
          isRequired: t.isRequired,
          checklistItems: (t.checklistItems as string[] || []).map(label => ({ label, done: false })),
        }
      });
    });

    const tasks = await Promise.all(taskPromises);

    // 4. Update Employee Status
    await prisma.employee.update({
      where: { id: dto.employeeId },
      data: { employmentStatus: EmploymentStatus.TERMINATED, terminationDate: lastWorkDay, terminationReason: dto.exitReason }
    });

    // 5. Notify Assigned Users
    for (const task of tasks) {
      if (task.assignedToId) {
        await notificationsService.notify({
          userId: task.assignedToId,
          type: NotificationType.OFFBOARDING_TASK,
          channel: 'IN_APP',
          title: 'New Offboarding Task Assigned',
          message: `You have been assigned the exit task: "${task.title}" for ${employee.firstName} ${employee.lastName}`,
          data: { offboardingId: offboarding.id, taskId: task.id },
        });
      }
    }

    return { ...offboarding, tasks };
  }

  /**
   * ── Update Task Status ───────────────────────────────────────────────────
   */
  async updateTaskStatus(taskId: string, dto: UpdateOffboardingTaskDto, actorId?: string) {
    const task = await prisma.offboardingTask.findUnique({
      where: { id: taskId },
      include: { offboarding: { include: { employee: true } } },
    });
    if (!task) throw NotFound('Task');

    const updatedTask = await prisma.offboardingTask.update({
      where: { id: taskId },
      data: {
        status: dto.status,
        notes: dto.notes,
        checklistItems: dto.checklistItems ? JSON.parse(JSON.stringify(dto.checklistItems)) : undefined,
        assignedToId: dto.assignedToId,
        completedAt: dto.status === TaskStatus.COMPLETED ? new Date() : undefined,
        completedById: dto.status === TaskStatus.COMPLETED ? actorId : undefined,
      },
    });

    // Post-update triggers
    if (dto.status === TaskStatus.COMPLETED) {
      // Trigger Webhook for task completion
      await webhooksService.trigger(WebhookEvent.EMPLOYEE_UPDATED, {
        type: 'OFFBOARDING_TASK_COMPLETED',
        taskId: task.id,
        taskTitle: task.title,
        employeeId: task.offboarding.employeeId,
      });

      // Check remaining required tasks
      const remaining = await prisma.offboardingTask.count({
        where: { offboardingId: task.offboardingId, isRequired: true, status: { not: TaskStatus.COMPLETED } },
      });

      if (remaining === 0) {
        await prisma.offboarding.update({
          where: { id: task.offboardingId },
          data: { status: BoardingStatus.COMPLETED, completedAt: new Date() },
        });
        
        await webhooksService.trigger(WebhookEvent.OFFBOARDING_COMPLETED, {
          offboardingId: task.offboardingId,
          employeeId: task.offboarding.employeeId,
          completedAt: new Date(),
        });
      }
    }

    return updatedTask;
  }
}

export const offboardingService = new OffboardingService();
