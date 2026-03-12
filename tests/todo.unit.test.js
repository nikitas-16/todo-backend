import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Todo API - Validation (Unit)', () => {
  describe('POST /todos', () => {
    it('should return 400 when title is missing', async () => {
      const res = await request(app).post('/todos').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should return 400 when title is empty string', async () => {
      const res = await request(app).post('/todos').send({ title: '' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should return 400 when title is only whitespace', async () => {
      const res = await request(app).post('/todos').send({ title: '   ' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });
  });

  describe('UUID validation', () => {
    it('should return 400 for invalid UUID on GET /todos/:id', async () => {
      const res = await request(app).get('/todos/not-a-uuid');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid UUID format');
    });

    it('should return 400 for invalid UUID on PATCH /todos/:id', async () => {
      const res = await request(app)
        .patch('/todos/invalid')
        .send({ title: 'test' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid UUID format');
    });

    it('should return 400 for invalid UUID on DELETE /todos/:id', async () => {
      const res = await request(app).delete('/todos/12345');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid UUID format');
    });
  });

  describe('GET /todos query validation', () => {
    it('should return 400 when limit is not a number', async () => {
      const res = await request(app).get('/todos?limit=abc');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should return 400 when limit is negative', async () => {
      const res = await request(app).get('/todos?limit=-1');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should return 400 when limit is zero', async () => {
      const res = await request(app).get('/todos?limit=0');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should return 400 when offset is not a number', async () => {
      const res = await request(app).get('/todos?offset=abc');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should return 400 when offset is negative', async () => {
      const res = await request(app).get('/todos?offset=-1');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });
  });

  describe('PATCH /todos/:id validation', () => {
    it('should return 400 when no fields provided', async () => {
      const uuid = '00000000-0000-0000-0000-000000000000';
      const res = await request(app).patch(`/todos/${uuid}`).send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });
  });
});
