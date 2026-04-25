#!/usr/bin/env node
/**
 * Audit-Screenshot-Helper.
 * Usage: node scripts/audit-screenshot.mjs <slug> [port]
 *   slug — tool slug, e.g. "meter-zu-fuss"
 *   port — dev-server port, default 4321
 *
 * Writes PNG to `audit/screenshots/<slug>.png` (1280×900 viewport,
 * full-page if shorter). Assumes the Astro dev server is already running.
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const slug = process.argv[2];
const port = process.argv[3] ?? '4321';
if (!slug) {
  console.error('usage: audit-screenshot.mjs <slug> [port]');
  process.exit(1);
}

const outDir = join(process.cwd(), 'audit', 'screenshots');
await mkdir(outDir, { recursive: true });
const outPath = join(outDir, `${slug}.png`);
const url = `http://localhost:${port}/de/${slug}`;

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 1,
});
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`);
});

try {
  const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
  const status = resp?.status() ?? 0;
  await page.waitForTimeout(800); // let islands hydrate
  await page.screenshot({ path: outPath, fullPage: true });
  console.log(JSON.stringify({ slug, url, status, outPath, errors }, null, 2));
} catch (e) {
  console.error(JSON.stringify({ slug, url, error: String(e), errors }, null, 2));
  process.exit(2);
} finally {
  await browser.close();
}
