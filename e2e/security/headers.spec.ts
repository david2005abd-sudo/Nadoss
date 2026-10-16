import { test, expect } from '@playwright/test';

test.describe('Security — HTTP headers', () => {
  test('responses include security headers', async ({ request }) => {
    const res = await request.get('/');
    const headers = res.headers();

    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toMatch(/DENY|SAMEORIGIN/);
  });

  test('no server version leaked', async ({ request }) => {
    const res = await request.get('/');
    const headers = res.headers();
    expect(headers['x-powered-by']).toBeUndefined();
  });
});
