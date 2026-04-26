import { defineConfig, devices } from 'playwright/test';

export default defineConfig({
  testDir: 'tests/audit',
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  retries: 0,
  workers: 4,
  reporter: [['list'], ['json', { outputFile: 'audits/playwright-results.json' }]],
  use: {
    baseURL: 'http://localhost:4173',
    headless: true,
  },
  webServer: {
    command: 'npx serve dist -p 4173 --no-clipboard',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 15_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
