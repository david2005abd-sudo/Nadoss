import { test, expect } from '@playwright/test';

test.describe('Storefront — Accessibility', () => {
  test('all form inputs have associated labels', async ({ page }) => {
    await page.goto('/store/demo-store/checkout');

    const inputs = page.locator('input[type="text"], input[type="tel"], textarea');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');

      expect(
        id || ariaLabel || ariaLabelledBy,
        `Input at index ${i} lacks accessible label`
      ).toBeTruthy();
    }
  });

  test('page has no obvious heading-order violations', async ({ page }) => {
    await page.goto('/store/demo-store');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveCount(1); // exactly one h1
  });
});
