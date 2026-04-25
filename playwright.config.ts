import { defineConfig, devices } from 'playwright/test';

/**
 * Playwright config — a11y test suite only.
 * Serves the pre-built `dist/` via a static file server.
 * Run: npx playwright test tests/a11y/
 */
export default defineConfig({
  testDir: 'tests/a11y',
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  retries: 1,
  reporter: [['list'], ['json', { outputFile: 'tests/a11y/results.json' }]],

  use: {
    baseURL: 'http://localhost:4173',
    headless: true,
    // Capture traces on retry so failures are diagnosable in CI.
    trace: 'on-first-retry',
  },

  // Serve the pre-built dist/ directory. Build must run before a11y tests.
  webServer: {
    command: 'npx serve dist -p 4173 --no-clipboard',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 10_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
