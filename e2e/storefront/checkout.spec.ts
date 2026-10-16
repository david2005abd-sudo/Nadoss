import { test, expect } from '@playwright/test';

test.describe('Storefront — Checkout', () => {
  test('places a COD order and protects order details with an access token', async ({ page }) => {
    await page.goto('/store/demo-store');

    const addButton = page.getByRole('button', { name: 'أضف إلى السلة' }).first();
    await expect(addButton).toBeVisible();
    await addButton.click();

    await expect(page.getByRole('heading', { name: /السلة/ })).toBeVisible();
    await page.getByRole('link', { name: 'إتمام الطلب' }).click();
    await expect(page).toHaveURL(/\/store\/demo-store\/checkout$/);

    await page.getByLabel('الاسم الكامل').fill('مستخدم اختبار');
    await page.getByLabel('رقم الهاتف').fill('07709998877');
    await page.getByLabel('المحافظة').selectOption({ index: 1 });
    await page.getByLabel('المدينة / القضاء').fill('بغداد');
    await page.getByLabel('العنوان التفصيلي').fill('شارع تجريبي، بناية 1');
    await page.getByRole('button', { name: 'تأكيد الطلب' }).click();

    await expect(page).toHaveURL(
      /\/store\/demo-store\/order\/[0-9a-f-]+\?new=1&token=[a-f0-9]{64}$/,
      { timeout: 20_000 }
    );
    await expect(page.getByText('تم استلام طلبك بنجاح!')).toBeVisible();

    const orderPath = new URL(page.url()).pathname;
    await page.getByRole('button', { name: 'عرض السلة' }).click();
    await expect(page.getByText('سلتك فارغة')).toBeVisible();

    const response = await page.goto(orderPath);
    expect(response?.status()).toBe(404);
  });
});
