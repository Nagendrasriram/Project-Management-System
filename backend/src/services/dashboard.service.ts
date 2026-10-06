import { prisma } from '../config/prisma';
import { DashboardStats } from '@project-mgmt/shared';

export class DashboardService {
  static async getDashboardStats(userId: string): Promise<DashboardStats> {
    const [totalProjects, totalTasks, completedTasks, pendingTasks, projectsInProgress] =
      await Promise.all([
        prisma.project.count({
          where: { ownerId: userId },
        }),
        prisma.task.count({
          where: { project: { ownerId: userId } },
        }),
        prisma.task.count({
          where: {
            project: { ownerId: userId },
            status: 'COMPLETED',
          },
        }),
        prisma.task.count({
          where: {
            project: { ownerId: userId },
            status: 'PENDING',
          },
        }),
        prisma.project.count({
          where: {
            ownerId: userId,
            status: 'IN_PROGRESS',
          },
        }),
      ]);

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      projectsInProgress,
    };
  }
}
