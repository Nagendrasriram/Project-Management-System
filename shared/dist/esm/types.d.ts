import { z } from 'zod';
import { RegisterSchema, LoginSchema, CreateProjectSchema, UpdateProjectSchema, ProjectQuerySchema, CreateTaskSchema, UpdateTaskSchema, UpdateTaskStatusSchema, TaskQuerySchema, IdParamSchema } from './schemas';
import { ProjectStatus, TaskPriority, TaskStatus } from './enums';
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type ProjectQueryParams = z.infer<typeof ProjectQuerySchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof UpdateTaskStatusSchema>;
export type TaskQueryParams = z.infer<typeof TaskQuerySchema>;
export type IdParam = z.infer<typeof IdParamSchema>;
export interface UserResponse {
    id: string;
    fullName: string;
    email: string;
    createdAt: string | Date;
    updatedAt?: string | Date;
}
export interface AuthSuccessResponse {
    token: string;
    user: UserResponse;
}
export interface ProjectResponse {
    id: string;
    name: string;
    description: string | null;
    status: ProjectStatus;
    startDate: string | null;
    endDate: string | null;
    ownerId: string;
    createdAt: string | Date;
    updatedAt?: string | Date;
    _count?: {
        tasks: number;
    };
    tasks?: TaskResponse[];
}
export interface TaskResponse {
    id: string;
    name: string;
    description: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string | null;
    projectId: string;
    createdAt: string | Date;
    updatedAt?: string | Date;
    project?: {
        id: string;
        name: string;
    };
}
export interface DashboardStats {
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    projectsInProgress: number;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
}
export interface ApiErrorShape {
    error: {
        code: string;
        message: string;
        details?: any;
    };
}
