import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import pool from '../src/config/db.js';

describe('Todo API - Integration', () => {
  beforeAll(async () => {
    // Ensure table is clean before tests
    await pool.query('DELETE FROM todos');
  });

  afterAll(async () => {
    // Clean up and close pool
    await pool.query('DELETE FROM todos');
    await pool.end();
  });

  let createdTodoId;

  it('POST /todos - should create a new todo', async () => {
    const res = await request(app).post('/todos').send({
      title: 'Integration Test Todo',
      description: 'This is a test todo',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Integration Test Todo');
    expect(res.body.description).toBe('This is a test todo');
    expect(res.body.is_completed).toBe(false);
    expect(res.body).toHaveProperty('created_at');
    expect(res.body).toHaveProperty('updated_at');

    createdTodoId = res.body.id;
  });

  it('GET /todos - should return all todos', async () => {
    const res = await request(app).get('/todos');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /todos/:id - should return a single todo by ID', async () => {
    const res = await request(app).get(`/todos/${createdTodoId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdTodoId);
    expect(res.body.title).toBe('Integration Test Todo');
  });

  it('GET /todos/:id - should return 404 for non-existent UUID', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app).get(`/todos/${fakeId}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Todo not found');
  });

  it('PATCH /todos/:id - should update is_completed and refresh updated_at', async () => {
    // Get original todo to compare timestamps
    const original = await request(app).get(`/todos/${createdTodoId}`);
    const originalUpdatedAt = original.body.updated_at;

    // Wait briefly to ensure timestamp difference
    await new Promise((resolve) => setTimeout(resolve, 50));

    const res = await request(app)
      .patch(`/todos/${createdTodoId}`)
      .send({ is_completed: true });

    expect(res.status).toBe(200);
    expect(res.body.is_completed).toBe(true);
    expect(new Date(res.body.updated_at).getTime()).toBeGreaterThan(
      new Date(originalUpdatedAt).getTime()
    );
  });

  it('PATCH /todos/:id - should handle idempotent updates', async () => {
    const res = await request(app)
      .patch(`/todos/${createdTodoId}`)
      .send({ is_completed: true });

    expect(res.status).toBe(200);
    expect(res.body.is_completed).toBe(true);
  });

  it('PATCH /todos/:id - should return 404 for non-existent todo', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app)
      .patch(`/todos/${fakeId}`)
      .send({ title: 'does not exist' });

    expect(res.status).toBe(404);
  });

  it('DELETE /todos/:id - should delete the todo', async () => {
    const res = await request(app).delete(`/todos/${createdTodoId}`);
    expect(res.status).toBe(204);
  });

  it('DELETE /todos/:id - should return 404 when deleting same ID again', async () => {
    const res = await request(app).delete(`/todos/${createdTodoId}`);
    expect(res.status).toBe(404);
  });

  it('GET /todos - should support pagination', async () => {
    // Create 3 todos
    await request(app).post('/todos').send({ title: 'Pagination 1' });
    await request(app).post('/todos').send({ title: 'Pagination 2' });
    await request(app).post('/todos').send({ title: 'Pagination 3' });

    const res = await request(app).get('/todos?limit=2&offset=0');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);

    const res2 = await request(app).get('/todos?limit=2&offset=2');
    expect(res2.status).toBe(200);
    expect(res2.body.length).toBe(1);
  });

  it('POST /todos - should create todo without description', async () => {
    const res = await request(app)
      .post('/todos')
      .send({ title: 'No description' });

    expect(res.status).toBe(201);
    expect(res.body.description).toBeNull();
  });
});
