import { test, expect } from '@playwright/test';

test.describe('Security — RLS isolation', () => {
  test('unauthenticated user cannot access dashboard', async ({ page }) => {
    await page.goto('/dashboard/products');
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain('/login');
  });

  test('unauthenticated user cannot access API routes', async ({ request }) => {
    const res = await request.get('/api/dashboard/products');
    // Should return 401 or redirect
    expect([401, 403, 302, 307]).toContain(res.status());
  });

  test('WhatsApp webhook rejects invalid signature', async ({ request }) => {
    const res = await request.post('/api/webhooks/whatsapp', {
      data: { object: 'whatsapp_business_account', entry: [] },
      headers: { 'x-hub-signature-256': 'sha256=invalid' },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('delivery webhook rejects unknown provider', async ({ request }) => {
    const res = await request.post('/api/webhooks/delivery/unknown-provider', {
      data: {},
    });
    expect(res.status()).toBe(404);
  });
});
