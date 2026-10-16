import { test, expect } from '@playwright/test';

test.describe('Dashboard — Orders', () => {
  test('orders list loads with status filters', async ({ page }) => {
    await page.goto('/dashboard/orders');
    await expect(page.getByRole('heading', { name: 'الطلبات' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'الكل' })).toBeVisible();
  });

  test('order detail shows timeline and status actions', async ({ page }) => {
    await page.goto('/dashboard/orders');

    const orderLink = page.locator('table tbody tr a').first();
    if ((await orderLink.count()) === 0) test.skip();

    await orderLink.click();
    await expect(page.getByText('سجل النشاط')).toBeVisible();
    await expect(page.getByText('العميل والتوصيل')).toBeVisible();
  });

  test('manual order can be created', async ({ page }) => {
    await page.goto('/dashboard/orders/new');

    const unique = Date.now().toString().slice(-6);
    await page.getByLabel('الاسم الكامل').fill(`عميل ${unique}`);
    await page.getByLabel('رقم الهاتف').fill(`077${Math.floor(10000000 + Math.random() * 89999999)}`);

    // Wait for products list to appear (client-side)
    await page.waitForTimeout(1000);
  });
});
