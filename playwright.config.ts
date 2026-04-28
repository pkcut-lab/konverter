import { defineConfig, devices } from 'playwright/test';

/**
 * Playwright config — Browser-Test-Suiten (a11y + Mobile-Overflow-Gate).
 * Serves the pre-built `dist/` via a static file server.
 *
 * Subsuiten:
 *   tests/a11y/  — axe-core WCAG-AAA Audits (Headed-Smoke, langsam)
 *   tests/e2e/   — Layer-4 Overflow-Gate (mobile Viewport × Routen)
 *
 * Run:
 *   npx playwright test                  # alle Suiten
 *   npx playwright test tests/a11y/      # nur a11y (= npm run a11y:test)
 *   npx playwright test tests/e2e/       # nur Overflow (= npm run test:overflow)
 */
export default defineConfig({
  testDir: 'tests',
  testMatch: ['a11y/**/*.spec.ts', 'e2e/**/*.spec.ts'],
  timeout: 30_000,
  retries: 1,
  reporter: [['list'], ['json', { outputFile: 'tests/playwright-results.json' }]],

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
