import { test, expect } from '@playwright/test';

test.describe('Dashboard — Billing', () => {
  test('billing page shows current plan and usage', async ({ page }) => {
    await page.goto('/dashboard/billing');
    await expect(page.getByRole('heading', { name: 'الاشتراك والفواتير' })).toBeVisible();
    await expect(page.getByText('خطتك الحالية').first()).toBeVisible();
    await expect(page.getByText('حدود الاستخدام')).toBeVisible();
  });

  test('usage meters render with correct labels', async ({ page }) => {
    await page.goto('/dashboard/billing');
    await expect(page.getByText('المنتجات')).toBeVisible();
    await expect(page.getByText('الطلبات')).toBeVisible();
    await expect(page.getByText('رسائل الذكاء الاصطناعي')).toBeVisible();
  });
});
