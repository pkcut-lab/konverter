#!/usr/bin/env node
/**
 * scripts/a11y-audit.mjs
 * A11y audit orchestrator — reusable across tool slugs.
 *
 * Usage:
 *   node scripts/a11y-audit.mjs [slug]
 *   node scripts/a11y-audit.mjs meter-zu-fuss
 *   node scripts/a11y-audit.mjs --all
 *
 * Without arguments, defaults to the reference tool (meter-zu-fuss).
 *
 * Requires:
 *   - dist/ must exist (run `npm run build` first)
 *   - Playwright browsers installed (`npx playwright install chromium`)
 *
 * Outputs:
 *   - Structured JSON result to stdout
 *   - Human-readable summary to stderr
 *   - Exit 0 on full pass, 1 on any failure, 2 on setup error
 */

import { execSync, spawn } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TESTS_A11Y = join(ROOT, 'tests', 'a11y');
const RESULTS_FILE = join(TESTS_A11Y, 'results.json');
const DIST_DIR = join(ROOT, 'dist');

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const runAll = args.includes('--all');
const slugArg = args.find(a => !a.startsWith('--'));
const targetSlug = slugArg ?? 'meter-zu-fuss';

// ---------------------------------------------------------------------------
// Pre-flight checks
// ---------------------------------------------------------------------------

if (!existsSync(DIST_DIR)) {
  process.stderr.write('ERROR: dist/ missing — run `npm run build` first\n');
  process.exit(2);
}

if (!existsSync(TESTS_A11Y)) {
  process.stderr.write('ERROR: tests/a11y/ missing — this directory must exist\n');
  process.exit(2);
}

// ---------------------------------------------------------------------------
// Discover available specs
// ---------------------------------------------------------------------------

function discoverSlugs() {
  return readdirSync(TESTS_A11Y)
    .filter(f => f.endsWith('.spec.ts') && !f.startsWith('_'))
    .map(f => f.replace('.spec.ts', ''));
}

const availableSlugs = discoverSlugs();

if (!runAll && !availableSlugs.includes(targetSlug)) {
  process.stderr.write(
    `ERROR: No spec found for slug "${targetSlug}".\n` +
    `Available: ${availableSlugs.join(', ')}\n`,
  );
  process.exit(2);
}

const slugsToRun = runAll ? availableSlugs : [targetSlug];

// ---------------------------------------------------------------------------
// Run Playwright
// ---------------------------------------------------------------------------

process.stderr.write(`a11y-audit: running ${slugsToRun.length} spec(s): ${slugsToRun.join(', ')}\n`);

const specPattern = runAll
  ? 'tests/a11y/*.spec.ts'
  : `tests/a11y/${targetSlug}.spec.ts`;

const playwrightArgs = [
  'playwright', 'test',
  specPattern,
  '--reporter=list,json',
  `--output=${join(TESTS_A11Y, 'test-results')}`,
];

// Playwright writes JSON report to the file configured in playwright.config.ts.
const result = { slugs: slugsToRun, pass: 0, fail: 0, checks: [], exitCode: 0 };

try {
  execSync(`npx ${playwrightArgs.join(' ')}`, {
    cwd: ROOT,
    stdio: ['ignore', 'inherit', 'inherit'],
    env: { ...process.env, FORCE_COLOR: '1' },
  });
  result.exitCode = 0;
} catch (err) {
  result.exitCode = err.status ?? 1;
}

// ---------------------------------------------------------------------------
// Parse results JSON written by Playwright reporter
// ---------------------------------------------------------------------------

if (existsSync(RESULTS_FILE)) {
  try {
    const raw = JSON.parse(readFileSync(RESULTS_FILE, 'utf8'));
    const suites = raw.suites ?? [];

    for (const suite of suites) {
      for (const spec of (suite.specs ?? [])) {
        const checkName = spec.title ?? spec.file ?? 'unknown';
        const passed = (spec.tests ?? []).every(t =>
          (t.results ?? []).every(r => r.status === 'passed'),
        );
        result.checks.push({ check: checkName, pass: passed });
        if (passed) result.pass++;
        else result.fail++;
      }
    }
  } catch {
    process.stderr.write('WARN: Could not parse results.json\n');
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

const total = result.pass + result.fail;
const f1 = total > 0
  ? (2 * result.pass) / (2 * result.pass + result.fail + 0) // simplified for binary pass/fail
  : 0;

process.stderr.write(
  `\na11y-audit summary: ${result.pass}/${total} checks passed  f1=${f1.toFixed(3)}\n`,
);

process.stdout.write(JSON.stringify({ ...result, f1 }, null, 2) + '\n');
process.exit(result.exitCode);
