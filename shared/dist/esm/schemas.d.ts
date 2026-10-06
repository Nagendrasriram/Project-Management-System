import { z } from 'zod';
import { ProjectStatus, TaskPriority, TaskStatus } from './enums';
export declare const uuidSchema: z.ZodString;
export declare const trimmedString: (min?: number, max?: number, fieldName?: string) => z.ZodString;
export declare const RegisterSchema: z.ZodObject<{
    fullName: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    fullName: string;
    email: string;
    password: string;
}, {
    fullName: string;
    email: string;
    password: string;
}>;
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const CreateProjectSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodDefault<z.ZodNativeEnum<typeof ProjectStatus>>;
    startDate: z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodNullable<z.ZodOptional<z.ZodString>>]>;
    endDate: z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodNullable<z.ZodOptional<z.ZodString>>]>;
}, "strip", z.ZodTypeAny, {
    status: ProjectStatus;
    name: string;
    description?: string | null | undefined;
    startDate?: string | null | undefined;
    endDate?: string | null | undefined;
}, {
    name: string;
    status?: ProjectStatus | undefined;
    description?: string | null | undefined;
    startDate?: string | null | undefined;
    endDate?: string | null | undefined;
}>, {
    status: ProjectStatus;
    name: string;
    description?: string | null | undefined;
    startDate?: string | null | undefined;
    endDate?: string | null | undefined;
}, {
    name: string;
    status?: ProjectStatus | undefined;
    description?: string | null | undefined;
    startDate?: string | null | undefined;
    endDate?: string | null | undefined;
}>;
export declare const UpdateProjectSchema: z.ZodEffects<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof ProjectStatus>>;
    startDate: z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodNullable<z.ZodOptional<z.ZodString>>]>;
    endDate: z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodNullable<z.ZodOptional<z.ZodString>>]>;
}, "strip", z.ZodTypeAny, {
    status?: ProjectStatus | undefined;
    name?: string | undefined;
    description?: string | null | undefined;
    startDate?: string | null | undefined;
    endDate?: string | null | undefined;
}, {
    status?: ProjectStatus | undefined;
    name?: string | undefined;
    description?: string | null | undefined;
    startDate?: string | null | undefined;
    endDate?: string | null | undefined;
}>, {
    status?: ProjectStatus | undefined;
    name?: string | undefined;
    description?: string | null | undefined;
    startDate?: string | null | undefined;
    endDate?: string | null | undefined;
}, {
    status?: ProjectStatus | undefined;
    name?: string | undefined;
    description?: string | null | undefined;
    startDate?: string | null | undefined;
    endDate?: string | null | undefined;
}>;
export declare const ProjectQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof ProjectStatus>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["name", "status", "startDate", "endDate", "createdAt"]>>;
    order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "status" | "name" | "startDate" | "endDate" | "createdAt";
    order: "asc" | "desc";
    status?: ProjectStatus | undefined;
    search?: string | undefined;
}, {
    status?: ProjectStatus | undefined;
    search?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "status" | "name" | "startDate" | "endDate" | "createdAt" | undefined;
    order?: "asc" | "desc" | undefined;
}>;
export declare const CreateTaskSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    priority: z.ZodDefault<z.ZodNativeEnum<typeof TaskPriority>>;
    status: z.ZodDefault<z.ZodNativeEnum<typeof TaskStatus>>;
    dueDate: z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodNullable<z.ZodOptional<z.ZodString>>]>;
    projectId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: TaskStatus;
    name: string;
    priority: TaskPriority;
    projectId: string;
    description?: string | null | undefined;
    dueDate?: string | null | undefined;
}, {
    name: string;
    projectId: string;
    status?: TaskStatus | undefined;
    description?: string | null | undefined;
    priority?: TaskPriority | undefined;
    dueDate?: string | null | undefined;
}>;
export declare const UpdateTaskSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    priority: z.ZodOptional<z.ZodNativeEnum<typeof TaskPriority>>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof TaskStatus>>;
    dueDate: z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodNullable<z.ZodOptional<z.ZodString>>]>;
    projectId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: TaskStatus | undefined;
    name?: string | undefined;
    description?: string | null | undefined;
    priority?: TaskPriority | undefined;
    dueDate?: string | null | undefined;
    projectId?: string | undefined;
}, {
    status?: TaskStatus | undefined;
    name?: string | undefined;
    description?: string | null | undefined;
    priority?: TaskPriority | undefined;
    dueDate?: string | null | undefined;
    projectId?: string | undefined;
}>;
export declare const UpdateTaskStatusSchema: z.ZodObject<{
    status: z.ZodNativeEnum<typeof TaskStatus>;
}, "strip", z.ZodTypeAny, {
    status: TaskStatus;
}, {
    status: TaskStatus;
}>;
export declare const TaskQuerySchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<typeof TaskStatus>>;
    priority: z.ZodOptional<z.ZodNativeEnum<typeof TaskPriority>>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["name", "status", "priority", "dueDate", "createdAt"]>>;
    order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "status" | "name" | "createdAt" | "priority" | "dueDate";
    order: "asc" | "desc";
    status?: TaskStatus | undefined;
    search?: string | undefined;
    priority?: TaskPriority | undefined;
    projectId?: string | undefined;
}, {
    status?: TaskStatus | undefined;
    search?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "status" | "name" | "createdAt" | "priority" | "dueDate" | undefined;
    order?: "asc" | "desc" | undefined;
    priority?: TaskPriority | undefined;
    projectId?: string | undefined;
}>;
export declare const IdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
