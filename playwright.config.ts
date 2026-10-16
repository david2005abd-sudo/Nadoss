import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',

  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'ar-IQ',
  },

  projects: [
    // 1. Auth setup (login once, save storage state)
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // 2. Public storefront tests
    {
      name: 'storefront',
      testMatch: /storefront\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // 3. Dashboard tests (authenticated)
    {
      name: 'dashboard',
      testMatch: /dashboard\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/owner.json',
      },
    },

    // 4. Store owner flows (products, orders)
    {
      name: 'merchant',
      testMatch: /merchant\/.*\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/owner.json',
      },
    },

    // 5. Mobile storefront
    {
      name: 'mobile',
      testMatch: /storefront\/.*\.spec\.ts/,
      use: { ...devices['iPhone 14'] },
    },
  ],

  webServer: process.env.CI
    ? undefined
    : {
        command: 'npm run start',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
