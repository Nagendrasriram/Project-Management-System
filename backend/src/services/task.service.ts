import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskQueryParams,
  TaskResponse,
  PaginatedResponse,
  TaskStatus,
  TaskPriority,
} from '@project-mgmt/shared';
import { logAuditEvent } from './audit.service';

export class TaskService {
  static async listTasks(
    userId: string,
    query: TaskQueryParams
  ): Promise<PaginatedResponse<TaskResponse>> {
    const { page = 1, limit = 10, projectId, search, status, priority, sortBy = 'createdAt', order = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      project: {
        ownerId: userId,
      },
    };

    if (projectId) {
      where.projectId = projectId;
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    const [total, items] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: order,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: items.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        priority: t.priority as TaskPriority,
        status: t.status as TaskStatus,
        dueDate: t.dueDate ? t.dueDate.toISOString() : null,
        projectId: t.projectId,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        project: t.project,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  static async getTaskById(userId: string, taskId: string): Promise<TaskResponse> {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          ownerId: userId,
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!task) {
      throw new AppError(404, 'NOT_FOUND', 'Task not found');
    }

    return {
      id: task.id,
      name: task.name,
      description: task.description,
      priority: task.priority as TaskPriority,
      status: task.status as TaskStatus,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      projectId: task.projectId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      project: task.project,
    };
  }

  static async createTask(userId: string, input: CreateTaskInput): Promise<TaskResponse> {
    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: input.projectId,
        ownerId: userId,
      },
    });

    if (!project) {
      throw new AppError(404, 'NOT_FOUND', 'Project not found');
    }

    const dueDate = input.dueDate ? new Date(input.dueDate) : null;

    const task = await prisma.task.create({
      data: {
        name: input.name.trim(),
        description: input.description?.trim() || null,
        priority: input.priority,
        status: input.status,
        dueDate,
        projectId: input.projectId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await logAuditEvent(userId, 'TASK_CREATED', 'Task', task.id, { name: task.name, projectId: task.projectId });

    return {
      id: task.id,
      name: task.name,
      description: task.description,
      priority: task.priority as TaskPriority,
      status: task.status as TaskStatus,
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      projectId: task.projectId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      project: task.project,
    };
  }

  static async updateTask(
    userId: string,
    taskId: string,
    input: UpdateTaskInput
  ): Promise<TaskResponse> {
    // Verify task exists and belongs to a project owned by user
    const existing = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          ownerId: userId,
        },
      },
    });

    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Task not found');
    }

    // If moving to a different project, verify user owns the target project
    if (input.projectId && input.projectId !== existing.projectId) {
      const targetProject = await prisma.project.findFirst({
        where: {
          id: input.projectId,
          ownerId: userId,
        },
      });

      if (!targetProject) {
        throw new AppError(404, 'NOT_FOUND', 'Target project not found');
      }
    }

    const dueDate = input.dueDate !== undefined ? (input.dueDate ? new Date(input.dueDate) : null) : existing.dueDate;

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.description !== undefined ? { description: input.description?.trim() || null } : {}),
        ...(input.priority !== undefined ? { priority: input.priority } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.projectId !== undefined ? { projectId: input.projectId } : {}),
        ...(input.dueDate !== undefined ? { dueDate } : {}),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    await logAuditEvent(userId, 'TASK_UPDATED', 'Task', updated.id, input);

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      priority: updated.priority as TaskPriority,
      status: updated.status as TaskStatus,
      dueDate: updated.dueDate ? updated.dueDate.toISOString() : null,
      projectId: updated.projectId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      project: updated.project,
    };
  }

  static async deleteTask(userId: string, taskId: string): Promise<void> {
    const existing = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          ownerId: userId,
        },
      },
    });

    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Task not found');
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    await logAuditEvent(userId, 'TASK_DELETED', 'Task', taskId);
  }
}
