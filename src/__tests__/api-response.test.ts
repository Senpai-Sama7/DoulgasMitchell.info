import { describe, it, expect } from 'vitest';
import { ApiHandler } from '@/lib/api-response';

async function readJson(response: Response) {
  return (await response.json()) as Record<string, unknown>;
}

describe('ApiHandler', () => {
  describe('success', () => {
    it('returns success true with 200 by default', async () => {
      const response = ApiHandler.success();
      expect(response.status).toBe(200);
      const body = await readJson(response);
      expect(body.success).toBe(true);
    });

    it('spreads data into the top-level payload', async () => {
      const response = ApiHandler.success({ items: [1, 2], editable: true });
      const body = await readJson(response);
      expect(body.success).toBe(true);
      expect(body.items).toEqual([1, 2]);
      expect(body.editable).toBe(true);
    });

    it('includes an optional message and custom status', async () => {
      const response = ApiHandler.success(undefined, 'Created.', 201);
      expect(response.status).toBe(201);
      const body = await readJson(response);
      expect(body.message).toBe('Created.');
    });
  });

  describe('error', () => {
    it('returns success false with the given message and status', async () => {
      const response = ApiHandler.error('Nope', 422);
      expect(response.status).toBe(422);
      const body = await readJson(response);
      expect(body).toMatchObject({ success: false, error: 'Nope' });
    });

    it('reduces Error details to just the message — no stack traces', async () => {
      const boom = new Error('secret internals');
      const response = ApiHandler.error('Failed', 400, boom);
      const body = await readJson(response);
      expect(body.details).toBe('secret internals');
      expect(JSON.stringify(body)).not.toContain('at ');
      expect(JSON.stringify(body)).not.toContain('stack');
    });

    it('passes through structured details such as zod flatten output', async () => {
      const details = { fieldErrors: { title: ['Required'] } };
      const response = ApiHandler.error('Invalid', 400, details);
      const body = await readJson(response);
      expect(body.details).toEqual(details);
    });
  });

  describe('status helpers', () => {
    it('unauthorized defaults to 401', async () => {
      const response = ApiHandler.unauthorized();
      expect(response.status).toBe(401);
      const body = await readJson(response);
      expect(body.error).toBe('Unauthorized');
    });

    it('forbidden defaults to 403', async () => {
      const response = ApiHandler.forbidden();
      expect(response.status).toBe(403);
    });

    it('notFound defaults to 404', async () => {
      const response = ApiHandler.notFound();
      expect(response.status).toBe(404);
    });

    it('internalServerError returns 500 and never leaks the error object', async () => {
      const response = ApiHandler.internalServerError('Boom', new Error('db creds leaked'));
      expect(response.status).toBe(500);
      const body = await readJson(response);
      expect(body).toEqual({ success: false, error: 'Boom' });
      expect(JSON.stringify(body)).not.toContain('db creds leaked');
    });
  });
});
