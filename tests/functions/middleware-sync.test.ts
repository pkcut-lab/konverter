import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ACTIVE_LANGUAGES, DEFAULT_LANGUAGE } from '../../src/lib/hreflang';

/**
 * Sync-check: the CF Pages Functions (functions/index.js for the root
 * redirect, functions/_middleware.js for *.pages.dev noindex) MUST stay in
 * sync with the source-of-truth in src/lib/hreflang.ts. Drift between the
 * edge function and the in-page hreflang signals was the original Audit
 * P0-5 mismatch (DE vs EN x-default). This test catches it at CI time.
 *
 * Audit P1-Q (2026-04-27).
 */

describe('CF Pages Functions — sync check vs ACTIVE_LANGUAGES + DEFAULT_LANGUAGE', () => {
  const indexJs = readFileSync(join(process.cwd(), 'functions/index.js'), 'utf-8');

  it("functions/index.js SUPPORTED list matches ACTIVE_LANGUAGES", () => {
    const m = indexJs.match(/const\s+SUPPORTED\s*=\s*\[([^\]]+)\]/);
    expect(m, 'SUPPORTED const not found').toBeTruthy();
    const declared = (m![1] ?? '')
      .split(',')
      .map((s: string) => s.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
    expect(declared.sort()).toEqual([...ACTIVE_LANGUAGES].sort());
  });

  it("functions/index.js DEFAULT_LANG matches DEFAULT_LANGUAGE", () => {
    const m = indexJs.match(/const\s+DEFAULT_LANG\s*=\s*['"]([^'"]+)['"]/);
    expect(m, 'DEFAULT_LANG const not found').toBeTruthy();
    expect(m![1]).toBe(DEFAULT_LANGUAGE);
  });

  it("functions/index.js COOKIE_NAME stays kittokit-lang", () => {
    expect(indexJs).toMatch(/const\s+COOKIE_NAME\s*=\s*['"]kittokit-lang['"]/);
  });
});
