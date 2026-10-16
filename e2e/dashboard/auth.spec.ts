import { test, expect } from '@playwright/test';

test.describe('Dashboard — Authentication', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain('/login');
  });

  test('authenticated user sees overview dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'نظرة عامة' })).toBeVisible();
    // Stats cards
    await expect(page.getByText('المنتجات')).toBeVisible();
    await expect(page.getByText('الطلبات')).toBeVisible();
  });

  test('logout clears session and redirects', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: 'خروج' }).click();
    await page.waitForURL('/login');
  });
});
