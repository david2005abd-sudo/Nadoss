import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const authDir = path.join(__dirname, '.auth');
const ownerFile = path.join(authDir, 'owner.json');
const customerFile = path.join(authDir, 'customer.json');

setup.beforeAll(async () => {
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });
});

setup('authenticate as store owner', async ({ page }) => {
  const phone = process.env.E2E_OWNER_PHONE ?? '07701234567';
  const password = process.env.E2E_OWNER_PASSWORD ?? 'Test123456';

  await page.goto('/login');
  await page.getByLabel('رقم الهاتف').fill(phone);
  await page.getByLabel('كلمة المرور').fill(password);
  await page.getByRole('button', { name: 'تسجيل الدخول' }).click();

  await page.waitForURL('/dashboard', { timeout: 15_000 });
  await expect(page.getByRole('heading', { name: 'نظرة عامة' })).toBeVisible();

  await page.context().storageState({ path: ownerFile });
});
