import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('User Authorization Isolation Tests', () => {
  let aliceToken = '';
  let bobToken = '';
  let aliceProjectId = '';
  let aliceTaskId = '';

  beforeAll(async () => {
    // Log in alice
    const aliceRes = await request(app).post('/api/auth/login').send({
      email: 'alice@example.com',
      password: 'Password123!',
    });
    aliceToken = aliceRes.body.token;

    // Log in bob
    const bobRes = await request(app).post('/api/auth/login').send({
      email: 'bob@example.com',
      password: 'Password123!',
    });
    bobToken = bobRes.body.token;

    // Alice creates a private project
    const projRes = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        name: 'Alice Secret Project',
        description: 'Classified details',
      });
    aliceProjectId = projRes.body.id;

    // Alice creates a private task
    const taskRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        name: 'Alice Secret Task',
        projectId: aliceProjectId,
      });
    aliceTaskId = taskRes.body.id;
  });

  it('Bob cannot access Alice project via GET and receives 404', async () => {
    const res = await request(app)
      .get(`/api/projects/${aliceProjectId}`)
      .set('Authorization', `Bearer ${bobToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('Bob cannot modify Alice project via PUT and receives 404', async () => {
    const res = await request(app)
      .put(`/api/projects/${aliceProjectId}`)
      .set('Authorization', `Bearer ${bobToken}`)
      .send({ name: 'Hacked Project Name' });

    expect(res.status).toBe(404);
  });

  it('Bob cannot delete Alice project via DELETE and receives 404', async () => {
    const res = await request(app)
      .delete(`/api/projects/${aliceProjectId}`)
      .set('Authorization', `Bearer ${bobToken}`);

    expect(res.status).toBe(404);
  });

  it('Bob cannot view Alice task via GET and receives 404', async () => {
    const res = await request(app)
      .get(`/api/tasks/${aliceTaskId}`)
      .set('Authorization', `Bearer ${bobToken}`);

    expect(res.status).toBe(404);
  });

  it('Bob cannot modify Alice task via PUT and receives 404', async () => {
    const res = await request(app)
      .put(`/api/tasks/${aliceTaskId}`)
      .set('Authorization', `Bearer ${bobToken}`)
      .send({ name: 'Hacked Task Name' });

    expect(res.status).toBe(404);
  });

  it('Bob cannot create a task in Alice project and receives 404', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${bobToken}`)
      .send({
        name: 'Intruder Task',
        projectId: aliceProjectId,
      });

    expect(res.status).toBe(404);
  });

  it('Bob task and project lists do not include Alice resources', async () => {
    const projRes = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${bobToken}`);

    const projectNames = projRes.body.data.map((p: any) => p.name);
    expect(projectNames).not.toContain('Alice Secret Project');

    const taskRes = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${bobToken}`);

    const taskNames = taskRes.body.data.map((t: any) => t.name);
    expect(taskNames).not.toContain('Alice Secret Task');
  });
});
