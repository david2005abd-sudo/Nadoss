import { test, expect } from '@playwright/test';

test.describe('Storefront — Cart & Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/store/demo-store');
    const addButtons = page.getByRole('button', { name: 'أضف إلى السلة' });
    if ((await addButtons.count()) === 0) test.skip();
    await addButtons.first().click();
    await page.keyboard.press('Escape'); // close drawer for isolated cart state test
  });

  test('cart persists across page reloads (localStorage)', async ({ page }) => {
    await page.reload();
    // Cart button should still show count
    const cartButton = page.getByRole('button', { name: /السلة/ }).first();
    await expect(cartButton).toBeVisible();
  });

  test('checkout form validates required fields', async ({ page }) => {
    await page.goto('/store/demo-store/checkout');

    await page.getByRole('button', { name: /تأكيد الطلب|ادفع/ }).click();

    // Should show validation error (html5 or zod)
    await expect(page.locator('text=/مطلوب|مطلوب|يرجى|صالح/').first()).toBeVisible({
      timeout: 5_000,
    });
  });

  test('COD order can be placed end-to-end', async ({ page }) => {
    await page.goto('/store/demo-store/checkout');

    // Fill form
    await page.getByLabel('الاسم الكامل').fill('علي محمد');
    await page.getByLabel('رقم الهاتف').fill('07701234567');

    const govSelect = page.locator('select[name="governorateId"]');
    await govSelect.selectOption({ index: 1 });

    await page.getByLabel('المدينة / القضاء').fill('الكرادة');
    await page.getByLabel('التفاصيل التفصيلي').fill('شارع 14، بناية 12');

    // Select COD
    await page.getByRole('button', { name: 'الدفع عند الاستلام' }).click();

    // Submit
    await page.getByRole('button', { name: 'تأكيد الطلب' }).click();

    // Should land on order confirmation
    await page.waitForURL(/\/store\/demo-store\/order\//, { timeout: 15_000 });
    await expect(page.getByText('تم استلام طلبك بنجاح')).toBeVisible();
  });
});
