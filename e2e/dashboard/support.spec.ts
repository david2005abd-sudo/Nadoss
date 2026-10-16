import { test, expect } from '@playwright/test';

test.describe('Dashboard — Support', () => {
  test('support page loads tickets list', async ({ page }) => {
    await page.goto('/dashboard/support');
    await expect(page.getByRole('heading', { name: 'الدعم الفني' })).toBeVisible();
  });

  test('creates a new support ticket', async ({ page }) => {
    await page.goto('/dashboard/support/new');

    const unique = Date.now().toString().slice(-6);
    await page.getByLabel('الموضوع').fill(`مشكلة اختبار ${unique}`);
    await page.getByLabel('التصنيف').selectOption('technical');
    await page.getByLabel('الأولوية').selectOption('medium');
    await page.getByLabel('وصف المشكلة').fill('هذا وصف تفصيلي للمشكلة التي واجهتها أثناء الاختبار.');

    await page.getByRole('button', { name: 'إرسال التذكرة' }).click();

    await page.waitForURL(/\/dashboard\/support\/[a-f0-9-]+/, { timeout: 15_000 });
    await expect(page.getByText('المحادثة')).toBeVisible();
  });

  test('ticket detail shows SLA indicator', async ({ page }) => {
    await page.goto('/dashboard/support');
    const firstTicket = page.locator('table tbody tr a').first();
    if ((await firstTicket.count()) === 0) test.skip();

    await firstTicket.click();
    await expect(page.getByText('اتفاقية مستوى الخدمة')).toBeVisible();
  });
});
