import { describe, it, expect } from 'vitest';
import {
  RegisterSchema,
  LoginSchema,
  CreateProjectSchema,
  CreateTaskSchema,
  ProjectStatus,
  TaskPriority,
  TaskStatus,
} from '@project-mgmt/shared';

describe('Validation Unit Tests', () => {
  describe('RegisterSchema', () => {
    it('accepts valid registration input', () => {
      const result = RegisterSchema.safeParse({
        fullName: 'John Developer',
        email: 'john@example.com',
        password: 'Password123!',
      });
      expect(result.success).toBe(true);
    });

    it('rejects short passwords under 8 characters', () => {
      const result = RegisterSchema.safeParse({
        fullName: 'John',
        email: 'john@example.com',
        password: '12345',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email format', () => {
      const result = RegisterSchema.safeParse({
        fullName: 'John',
        email: 'not-an-email',
        password: 'Password123!',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('CreateProjectSchema', () => {
    it('rejects endDate before startDate', () => {
      const result = CreateProjectSchema.safeParse({
        name: 'Invalid Project',
        startDate: '2026-10-10T00:00:00.000Z',
        endDate: '2026-10-05T00:00:00.000Z',
        status: ProjectStatus.NOT_STARTED,
      });
      expect(result.success).toBe(false);
    });

    it('accepts valid dates when endDate >= startDate', () => {
      const result = CreateProjectSchema.safeParse({
        name: 'Valid Project',
        startDate: '2026-10-01T00:00:00.000Z',
        endDate: '2026-10-10T00:00:00.000Z',
        status: ProjectStatus.IN_PROGRESS,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('CreateTaskSchema', () => {
    it('rejects invalid UUID for projectId', () => {
      const result = CreateTaskSchema.safeParse({
        name: 'My Task',
        priority: TaskPriority.HIGH,
        status: TaskStatus.PENDING,
        projectId: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('accepts valid task with UUID projectId', () => {
      const result = CreateTaskSchema.safeParse({
        name: 'My Task',
        priority: TaskPriority.HIGH,
        status: TaskStatus.PENDING,
        projectId: 'e9e8f413-5858-45a8-bd2f-f4c0a5fcfd01',
      });
      expect(result.success).toBe(true);
    });
  });
});
