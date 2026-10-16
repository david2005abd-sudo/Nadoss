import { test as base, expect } from '@playwright/test';

type Fixtures = {
  /** generate a unique test phone number per run */
  uniquePhone: string;
  /** random slug-safe identifier */
  randomId: string;
};

export const test = base.extend<Fixtures>({
  uniquePhone: async ({}, use) => {
    const rand = Math.floor(10000000 + Math.random() * 89999999);
    await use(`077${rand}`);
  },
  randomId: async ({}, use) => {
    await use(Math.random().toString(36).slice(2, 10));
  },
});

export { expect };
