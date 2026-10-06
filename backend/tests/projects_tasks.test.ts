import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Projects, Tasks & Dashboard Endpoints', () => {
  let token = '';
  let createdProjectId = '';
  let createdTaskId = '';

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'alice@example.com',
      password: 'Password123!',
    });
    token = res.body.token;
  });

  it('GET /api/dashboard returns correct aggregated statistics', async () => {
    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalProjects');
    expect(res.body).toHaveProperty('totalTasks');
    expect(res.body).toHaveProperty('completedTasks');
    expect(res.body).toHaveProperty('pendingTasks');
    expect(res.body).toHaveProperty('projectsInProgress');
    expect(typeof res.body.totalProjects).toBe('number');
  });

  it('POST /api/projects creates a new project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'New Feature Project',
        description: 'Building new awesome capabilities',
        status: 'NOT_STARTED',
        startDate: '2026-10-15T00:00:00.000Z',
        endDate: '2026-11-15T00:00:00.000Z',
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('New Feature Project');
    createdProjectId = res.body.id;
  });

  it('GET /api/projects supports search and status filtering', async () => {
    const res = await request(app)
      .get('/api/projects?search=New Feature&status=NOT_STARTED')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.pagination).toHaveProperty('total');
  });

  it('POST /api/tasks creates task under project', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Write integration tests',
        description: 'Cover all critical test cases',
        priority: 'HIGH',
        status: 'PENDING',
        projectId: createdProjectId,
        dueDate: '2026-10-25T00:00:00.000Z',
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Write integration tests');
    expect(res.body.priority).toBe('HIGH');
    createdTaskId = res.body.id;
  });

  it('PUT /api/tasks/:id updates task status to COMPLETED', async () => {
    const res = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        status: 'COMPLETED',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('COMPLETED');
  });

  it('GET /api/tasks supports filtering by status and priority', async () => {
    const res = await request(app)
      .get(`/api/tasks?projectId=${createdProjectId}&status=COMPLETED&priority=HIGH`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].id).toBe(createdTaskId);
  });

  it('DELETE /api/projects/:id deletes project and cascades tasks', async () => {
    const res = await request(app)
      .delete(`/api/projects/${createdProjectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);

    // Verify task is also deleted
    const taskRes = await request(app)
      .get(`/api/tasks/${createdTaskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(taskRes.status).toBe(404);
  });
});
