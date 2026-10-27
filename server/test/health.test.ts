import { describe, it, expect } from 'vitest';
import { buildApp } from '../src/app.js';

describe('Health endpoint', () => {
  it('returns status ok on GET /api/health', async () => {
    const app = buildApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/health',
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok' });
    await app.close();
  });
});
