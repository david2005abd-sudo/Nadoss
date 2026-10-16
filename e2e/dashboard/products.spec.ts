import { test, expect } from '@playwright/test';

test.describe('Dashboard — Products CRUD', () => {
  test('products list loads', async ({ page }) => {
    await page.goto('/dashboard/products');
    await expect(page.getByRole('heading', { name: 'المنتجات' })).toBeVisible();
  });

  test('creates a new product with all fields', async ({ page }) => {
    await page.goto('/dashboard/products/new');

    const unique = Date.now().toString().slice(-6);
    await page.getByLabel('الاسم (عربي)').fill(`منتج اختبار ${unique}`);
    await page.getByLabel('الاسم (إنجليزي)').fill(`Test Product ${unique}`);
    await page.getByLabel('السعر (د.ع)').fill('25000');
    await page.getByLabel('المخزون').fill('100');

    await page.getByRole('button', { name: 'إنشاء المنتج' }).click();

    // Redirect to products list with success
    await page.waitForURL(/\/dashboard\/products\?created=1/, { timeout: 15_000 });
    await expect(page.getByText('تم إنشاء المنتج بنجاح')).toBeVisible();
  });

  test('validates required fields on product creation', async ({ page }) => {
    await page.goto('/dashboard/products/new');
    await page.getByRole('button', { name: 'إنشاء المنتج' }).click();

    // Zod field errors
    await expect(page.locator('text=/قصير جدًا|مطلوب/').first()).toBeVisible();
  });

  test('filters products by low stock', async ({ page }) => {
    await page.goto('/dashboard/products?status=low');
    // Page should load without errors
    await expect(page.getByRole('heading', { name: 'المنتجات' })).toBeVisible();
  });
});
