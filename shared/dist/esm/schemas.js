import { z } from 'zod';
import { ProjectStatus, TaskPriority, TaskStatus } from './enums';
// Common regex / primitives
export const uuidSchema = z.string().uuid({ message: 'Invalid UUID format' });
export const trimmedString = (min = 1, max = 255, fieldName = 'Field') => z
    .string({ required_error: `${fieldName} is required` })
    .trim()
    .min(min, { message: `${fieldName} must be at least ${min} character(s)` })
    .max(max, { message: `${fieldName} must be at most ${max} character(s)` });
// ================= AUTH SCHEMAS =================
export const RegisterSchema = z.object({
    fullName: trimmedString(2, 100, 'Full name'),
    email: z
        .string({ required_error: 'Email is required' })
        .trim()
        .toLowerCase()
        .email({ message: 'Invalid email address' }),
    password: z
        .string({ required_error: 'Password is required' })
        .min(8, { message: 'Password must be at least 8 characters long' })
        .max(100, { message: 'Password must not exceed 100 characters' }),
});
export const LoginSchema = z.object({
    email: z
        .string({ required_error: 'Email is required' })
        .trim()
        .toLowerCase()
        .email({ message: 'Invalid email address' }),
    password: z
        .string({ required_error: 'Password is required' })
        .min(1, { message: 'Password is required' }),
});
// ================= PROJECT SCHEMAS =================
export const CreateProjectSchema = z
    .object({
    name: trimmedString(1, 100, 'Project name'),
    description: z.string().trim().max(1000).optional().nullable(),
    status: z.nativeEnum(ProjectStatus).default(ProjectStatus.NOT_STARTED),
    startDate: z.string().datetime({ offset: true }).optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()),
    endDate: z.string().datetime({ offset: true }).optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()),
})
    .refine((data) => {
    if (data.startDate && data.endDate) {
        return new Date(data.endDate).getTime() >= new Date(data.startDate).getTime();
    }
    return true;
}, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
});
export const UpdateProjectSchema = z
    .object({
    name: trimmedString(1, 100, 'Project name').optional(),
    description: z.string().trim().max(1000).optional().nullable(),
    status: z.nativeEnum(ProjectStatus).optional(),
    startDate: z.string().datetime({ offset: true }).optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()),
    endDate: z.string().datetime({ offset: true }).optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()),
})
    .refine((data) => {
    if (data.startDate && data.endDate) {
        return new Date(data.endDate).getTime() >= new Date(data.startDate).getTime();
    }
    return true;
}, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
});
export const ProjectQuerySchema = z.object({
    search: z.string().trim().optional(),
    status: z.nativeEnum(ProjectStatus).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sortBy: z.enum(['name', 'status', 'startDate', 'endDate', 'createdAt']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
});
// ================= TASK SCHEMAS =================
export const CreateTaskSchema = z.object({
    name: trimmedString(1, 100, 'Task name'),
    description: z.string().trim().max(1000).optional().nullable(),
    priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
    status: z.nativeEnum(TaskStatus).default(TaskStatus.PENDING),
    dueDate: z.string().datetime({ offset: true }).optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()),
    projectId: uuidSchema,
});
export const UpdateTaskSchema = z.object({
    name: trimmedString(1, 100, 'Task name').optional(),
    description: z.string().trim().max(1000).optional().nullable(),
    priority: z.nativeEnum(TaskPriority).optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    dueDate: z.string().datetime({ offset: true }).optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()),
    projectId: uuidSchema.optional(),
});
export const UpdateTaskStatusSchema = z.object({
    status: z.nativeEnum(TaskStatus),
});
export const TaskQuerySchema = z.object({
    projectId: uuidSchema.optional(),
    search: z.string().trim().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sortBy: z.enum(['name', 'status', 'priority', 'dueDate', 'createdAt']).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
});
// Id param schema
export const IdParamSchema = z.object({
    id: uuidSchema,
});
