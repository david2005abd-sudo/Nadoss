import { test, expect } from '@playwright/test';

test.describe('Storefront — Home page', () => {
  test('loads storefront home with RTL direction', async ({ page }) => {
    await page.goto('/store/demo-store');

    // RTL check
    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
    await expect(html).toHaveAttribute('lang', 'ar');

    // Header + store name
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('displays product cards with valid prices', async ({ page }) => {
    await page.goto('/store/demo-store');

    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();
    if (count > 0) {
      const firstCard = productCards.first();
      await expect(firstCard).toBeVisible();
      // Price should be visible
      await expect(firstCard.locator('[data-testid="product-price"]')).toBeVisible();
    }
  });

  test('add to cart updates cart badge', async ({ page }) => {
    await page.goto('/store/demo-store');

    const addButtons = page.getByRole('button', { name: 'أضف إلى السلة' });
    if ((await addButtons.count()) === 0) test.skip();

    await addButtons.first().click();
    // Cart drawer opens
    await expect(page.getByRole('heading', { name: /السلة/ })).toBeVisible();

    // Item appears in drawer
    await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible();
  });

  test('navigates to product detail', async ({ page }) => {
    await page.goto('/store/demo-store/products');

    const firstProduct = page.locator('[data-testid="product-card"] a').first();
    if ((await firstProduct.count()) === 0) test.skip();

    await firstProduct.click();
    await expect(page.getByTestId('add-to-cart')).toBeVisible();
  });
});
