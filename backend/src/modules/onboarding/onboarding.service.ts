import { prisma } from '../../config/prisma';
import { parsePagination, paginate } from '../../common/utils/response';
import { NotFound, BadRequest } from '../../common/utils/apiError';
import { 
  BoardingStatus, TaskStatus, WebhookEvent, NotificationType 
} from '@prisma/client';
import type { 
  OnboardingQuery, AssignOnboardingDto, 
  UpdateOnboardingTaskDto, CreateOnboardingTemplateDto 
} from './Onboarding.types';
import { notificationsService } from '../notifications/Notifications.service';
import { webhooksService } from '../webhooks/Webhooks.service';
import { addDays } from 'date-fns';

export class OnboardingService {
  
  // ─── Template Management ──────────────────────────────────────────────────

  async findAllTemplates() {
    return prisma.onboardingTemplate.findMany({
      where: { isActive: true },
      include: { tasks: true },
      orderBy: { name: 'asc' },
    });
  }

  async findTemplateById(id: string) {
    const template = await prisma.onboardingTemplate.findUnique({
      where: { id },
      include: { tasks: true },
    });
    if (!template) throw NotFound('Template');
    return template;
  }

  async createTemplate(dto: CreateOnboardingTemplateDto) {
    const { tasks, ...data } = dto;
    return prisma.onboardingTemplate.create({
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

  // ─── Onboarding Instance Logic ───────────────────────────────────────────

  async findAll(query: OnboardingQuery) {
    const { page, limit, skip } = parsePagination(query);
    const where: any = {};
    if (query.employeeId) where.employeeId = query.employeeId;
    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      prisma.onboarding.findMany({
        where,
        skip,
        take: limit,
        include: {
          employee: { select: { firstName: true, lastName: true, jobTitle: true, hireDate: true } },
          tasks: { select: { id: true, status: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.onboarding.count({ where }),
    ]);

    return { data, meta: paginate(total, page, limit) };
  }

  async findById(id: string) {
    const onboarding = await prisma.onboarding.findUnique({
      where: { id },
      include: {
        employee: true,
        tasks: { orderBy: { order: 'asc' } },
        template: true,
      },
    });
    if (!onboarding) throw NotFound('Onboarding');
    return onboarding;
  }

  /**
   * ── Initiate Onboarding ──────────────────────────────────────────────────
   * Logic:
   * 1. Check if employee already has onboarding.
   * 2. Find template (or default).
   * 3. Create instance + tasks.
   * 4. Assign tasks based on roles.
   */
  async initiate(dto: AssignOnboardingDto) {
    const existing = await prisma.onboarding.findUnique({ where: { employeeId: dto.employeeId } });
    if (existing) throw BadRequest('Employee already has an onboarding process');

    const employee = await prisma.employee.findUnique({ where: { id: dto.employeeId } });
    if (!employee) throw NotFound('Employee');

    // 1. Find Template
    const template = dto.templateId 
      ? await this.findTemplateById(dto.templateId)
      : await prisma.onboardingTemplate.findFirst({ where: { isDefault: true }, include: { tasks: true } });

    if (!template) throw BadRequest('No onboarding template found');

    // 2. Create Onboarding Instance
    const onboarding = await prisma.onboarding.create({
      data: {
        employeeId: dto.employeeId,
        templateId: template.id,
        status: BoardingStatus.IN_PROGRESS,
        startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
        targetDate: dto.targetDate ? new Date(dto.targetDate) : addDays(new Date(employee.hireDate), 30),
        hrOwnerId: dto.hrOwnerId,
        notes: dto.notes,
      },
    });

    // 3. Clone Template Tasks and Auto-Assign Roles
    const taskPromises = template.tasks.map(async (t) => {
      let assignedToId: string | null = null;
      
      if (t.roleId) {
        // Find a user with this role. For now, we take the first active one.
        const roleUser = await prisma.userRole.findFirst({
          where: { roleId: t.roleId, user: { isActive: true } },
          select: { userId: true },
        });
        assignedToId = roleUser?.userId || null;
      }

      return prisma.onboardingTask.create({
        data: {
          onboardingId: onboarding.id,
          title: t.title,
          description: t.description,
          category: t.category,
          status: TaskStatus.PENDING,
          order: t.order,
          dueDate: addDays(new Date(employee.hireDate), t.dueDays),
          assignedToId,
          isRequired: t.isRequired,
          checklistItems: (t.checklistItems as string[] || []).map(label => ({ label, done: false })),
        }
      });
    });

    const tasks = await Promise.all(taskPromises);

    // 4. Notify Assigned Users
    for (const task of tasks) {
      if (task.assignedToId) {
        await notificationsService.notify({
          userId: task.assignedToId,
          type: NotificationType.ONBOARDING_TASK,
          channel: 'IN_APP',
          title: 'New Onboarding Task Assigned',
          message: `You have been assigned the task: "${task.title}" for ${employee.firstName} ${employee.lastName}`,
          data: { onboardingId: onboarding.id, taskId: task.id },
        });
      }
    }

    return { ...onboarding, tasks };
  }

  /**
   * ── Update Task Status ───────────────────────────────────────────────────
   */
  async updateTaskStatus(taskId: string, dto: UpdateOnboardingTaskDto, actorId?: string) {
    const task = await prisma.onboardingTask.findUnique({
      where: { id: taskId },
      include: { onboarding: { include: { employee: true } } },
    });
    if (!task) throw NotFound('Task');

    const updatedTask = await prisma.onboardingTask.update({
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
      // 1. Notify HR / Owner if needed (placeholder)
      
      // 2. Trigger Webhook for task completion (Requirement #2)
      await webhooksService.trigger(WebhookEvent.EMPLOYEE_UPDATED, { // Using UPDATED as proxy or we could add a CUSTOM event
        type: 'ONBOARDING_TASK_COMPLETED',
        taskId: task.id,
        taskTitle: task.title,
        employeeId: task.onboarding.employeeId,
      });

      // 3. Check if all required tasks are done to auto-complete onboarding
      const remaining = await prisma.onboardingTask.count({
        where: { onboardingId: task.onboardingId, isRequired: true, status: { not: TaskStatus.COMPLETED } },
      });

      if (remaining === 0) {
        await prisma.onboarding.update({
          where: { id: task.onboardingId },
          data: { status: BoardingStatus.COMPLETED, completedAt: new Date() },
        });
        
        await webhooksService.trigger(WebhookEvent.ONBOARDING_COMPLETED, {
          onboardingId: task.onboardingId,
          employeeId: task.onboarding.employeeId,
          completedAt: new Date(),
        });
      }
    }

    return updatedTask;
  }
}

export const onboardingService = new OnboardingService();
