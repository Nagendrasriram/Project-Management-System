"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdParamSchema = exports.TaskQuerySchema = exports.UpdateTaskStatusSchema = exports.UpdateTaskSchema = exports.CreateTaskSchema = exports.ProjectQuerySchema = exports.UpdateProjectSchema = exports.CreateProjectSchema = exports.LoginSchema = exports.RegisterSchema = exports.trimmedString = exports.uuidSchema = void 0;
const zod_1 = require("zod");
const enums_1 = require("./enums");
// Common regex / primitives
exports.uuidSchema = zod_1.z.string().uuid({ message: 'Invalid UUID format' });
const trimmedString = (min = 1, max = 255, fieldName = 'Field') => zod_1.z
    .string({ required_error: `${fieldName} is required` })
    .trim()
    .min(min, { message: `${fieldName} must be at least ${min} character(s)` })
    .max(max, { message: `${fieldName} must be at most ${max} character(s)` });
exports.trimmedString = trimmedString;
// ================= AUTH SCHEMAS =================
exports.RegisterSchema = zod_1.z.object({
    fullName: (0, exports.trimmedString)(2, 100, 'Full name'),
    email: zod_1.z
        .string({ required_error: 'Email is required' })
        .trim()
        .toLowerCase()
        .email({ message: 'Invalid email address' }),
    password: zod_1.z
        .string({ required_error: 'Password is required' })
        .min(8, { message: 'Password must be at least 8 characters long' })
        .max(100, { message: 'Password must not exceed 100 characters' }),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z
        .string({ required_error: 'Email is required' })
        .trim()
        .toLowerCase()
        .email({ message: 'Invalid email address' }),
    password: zod_1.z
        .string({ required_error: 'Password is required' })
        .min(1, { message: 'Password is required' }),
});
// ================= PROJECT SCHEMAS =================
exports.CreateProjectSchema = zod_1.z
    .object({
    name: (0, exports.trimmedString)(1, 100, 'Project name'),
    description: zod_1.z.string().trim().max(1000).optional().nullable(),
    status: zod_1.z.nativeEnum(enums_1.ProjectStatus).default(enums_1.ProjectStatus.NOT_STARTED),
    startDate: zod_1.z.string().datetime({ offset: true }).optional().nullable().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()),
    endDate: zod_1.z.string().datetime({ offset: true }).optional().nullable().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()),
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
exports.UpdateProjectSchema = zod_1.z
    .object({
    name: (0, exports.trimmedString)(1, 100, 'Project name').optional(),
    description: zod_1.z.string().trim().max(1000).optional().nullable(),
    status: zod_1.z.nativeEnum(enums_1.ProjectStatus).optional(),
    startDate: zod_1.z.string().datetime({ offset: true }).optional().nullable().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()),
    endDate: zod_1.z.string().datetime({ offset: true }).optional().nullable().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()),
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
exports.ProjectQuerySchema = zod_1.z.object({
    search: zod_1.z.string().trim().optional(),
    status: zod_1.z.nativeEnum(enums_1.ProjectStatus).optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(10),
    sortBy: zod_1.z.enum(['name', 'status', 'startDate', 'endDate', 'createdAt']).default('createdAt'),
    order: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
// ================= TASK SCHEMAS =================
exports.CreateTaskSchema = zod_1.z.object({
    name: (0, exports.trimmedString)(1, 100, 'Task name'),
    description: zod_1.z.string().trim().max(1000).optional().nullable(),
    priority: zod_1.z.nativeEnum(enums_1.TaskPriority).default(enums_1.TaskPriority.MEDIUM),
    status: zod_1.z.nativeEnum(enums_1.TaskStatus).default(enums_1.TaskStatus.PENDING),
    dueDate: zod_1.z.string().datetime({ offset: true }).optional().nullable().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()),
    projectId: exports.uuidSchema,
});
exports.UpdateTaskSchema = zod_1.z.object({
    name: (0, exports.trimmedString)(1, 100, 'Task name').optional(),
    description: zod_1.z.string().trim().max(1000).optional().nullable(),
    priority: zod_1.z.nativeEnum(enums_1.TaskPriority).optional(),
    status: zod_1.z.nativeEnum(enums_1.TaskStatus).optional(),
    dueDate: zod_1.z.string().datetime({ offset: true }).optional().nullable().or(zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable()),
    projectId: exports.uuidSchema.optional(),
});
exports.UpdateTaskStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(enums_1.TaskStatus),
});
exports.TaskQuerySchema = zod_1.z.object({
    projectId: exports.uuidSchema.optional(),
    search: zod_1.z.string().trim().optional(),
    status: zod_1.z.nativeEnum(enums_1.TaskStatus).optional(),
    priority: zod_1.z.nativeEnum(enums_1.TaskPriority).optional(),
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(10),
    sortBy: zod_1.z.enum(['name', 'status', 'priority', 'dueDate', 'createdAt']).default('createdAt'),
    order: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
// Id param schema
exports.IdParamSchema = zod_1.z.object({
    id: exports.uuidSchema,
});
