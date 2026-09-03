import { defineConfig, devices } from '@playwright/test';

/**
 * E2E contra API real em fluxos críticos (`.spec/12` D-12). Na Etapa 0 ainda
 * não há fluxo de negócio; a suíte E2E começa a ser preenchida na Etapa 3.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
