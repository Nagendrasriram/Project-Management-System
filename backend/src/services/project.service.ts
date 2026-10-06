import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler';
import {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectQueryParams,
  ProjectResponse,
  PaginatedResponse,
  ProjectStatus,
} from '@project-mgmt/shared';
import { logAuditEvent } from './audit.service';

export class ProjectService {
  static async listProjects(
    userId: string,
    query: ProjectQueryParams
  ): Promise<PaginatedResponse<ProjectResponse>> {
    const { page = 1, limit = 10, search, status, sortBy = 'createdAt', order = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ownerId: userId,
    };

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (status) {
      where.status = status;
    }

    const [total, items] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: order,
        },
        include: {
          _count: {
            select: { tasks: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      data: items.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status as ProjectStatus,
        startDate: p.startDate ? p.startDate.toISOString() : null,
        endDate: p.endDate ? p.endDate.toISOString() : null,
        ownerId: p.ownerId,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        _count: p._count,
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

  static async getProjectById(userId: string, projectId: string): Promise<ProjectResponse> {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      // Must return 404 (not 403) to prevent leaking existence
      throw new AppError(404, 'NOT_FOUND', 'Project not found');
    }

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status as ProjectStatus,
      startDate: project.startDate ? project.startDate.toISOString() : null,
      endDate: project.endDate ? project.endDate.toISOString() : null,
      ownerId: project.ownerId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      _count: project._count,
      tasks: project.tasks.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        priority: t.priority as any,
        status: t.status as any,
        dueDate: t.dueDate ? t.dueDate.toISOString() : null,
        projectId: t.projectId,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
    };
  }

  static async createProject(userId: string, input: CreateProjectInput): Promise<ProjectResponse> {
    const startDate = input.startDate ? new Date(input.startDate) : null;
    const endDate = input.endDate ? new Date(input.endDate) : null;

    if (startDate && endDate && endDate.getTime() < startDate.getTime()) {
      throw new AppError(400, 'VALIDATION_ERROR', 'End date must be on or after start date');
    }

    const project = await prisma.project.create({
      data: {
        name: input.name.trim(),
        description: input.description?.trim() || null,
        status: input.status,
        startDate,
        endDate,
        ownerId: userId,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    await logAuditEvent(userId, 'PROJECT_CREATED', 'Project', project.id, { name: project.name });

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status as ProjectStatus,
      startDate: project.startDate ? project.startDate.toISOString() : null,
      endDate: project.endDate ? project.endDate.toISOString() : null,
      ownerId: project.ownerId,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      _count: project._count,
    };
  }

  static async updateProject(
    userId: string,
    projectId: string,
    input: UpdateProjectInput
  ): Promise<ProjectResponse> {
    const existing = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
      },
    });

    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Project not found');
    }

    const startDate = input.startDate !== undefined ? (input.startDate ? new Date(input.startDate) : null) : existing.startDate;
    const endDate = input.endDate !== undefined ? (input.endDate ? new Date(input.endDate) : null) : existing.endDate;

    if (startDate && endDate && endDate.getTime() < startDate.getTime()) {
      throw new AppError(400, 'VALIDATION_ERROR', 'End date must be on or after start date');
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.description !== undefined ? { description: input.description?.trim() || null } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.startDate !== undefined ? { startDate } : {}),
        ...(input.endDate !== undefined ? { endDate } : {}),
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    await logAuditEvent(userId, 'PROJECT_UPDATED', 'Project', updated.id, input);

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      status: updated.status as ProjectStatus,
      startDate: updated.startDate ? updated.startDate.toISOString() : null,
      endDate: updated.endDate ? updated.endDate.toISOString() : null,
      ownerId: updated.ownerId,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      _count: updated._count,
    };
  }

  static async deleteProject(userId: string, projectId: string): Promise<void> {
    const existing = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
      },
    });

    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Project not found');
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    await logAuditEvent(userId, 'PROJECT_DELETED', 'Project', projectId);
  }
}
