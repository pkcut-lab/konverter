// tests/components/header-tools-link.test.ts
//
// Verifies the i18n fix for the Header "Tools/Werkzeuge" nav link:
//   - DE pages get a link labeled "Werkzeuge" pointing at /de/werkzeuge
//   - EN pages get a link labeled "Tools" pointing at /en/tools (NOT /en/werkzeuge)
//
// Plus: confirms the EN tools-index page exists at the correct path (was the
// missing route that this fix introduces).
//
// Same source-level template-contract pattern as
// `tests/components/footer-tools-list.test.ts` — vitest can't reliably run
// experimental_AstroContainer here, so we assert the source code emits the
// right wiring + behaviour through the helper.

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getStaticPagePath } from '../../src/lib/static-page-slugs';

const headerSrc = readFileSync(
  join(process.cwd(), 'src/components/Header.astro'),
  'utf8',
);

describe('Header tools-nav link is lang-aware', () => {
  it('imports getStaticPagePath from static-page-slugs', () => {
    expect(headerSrc).toMatch(/from\s+['"]\.\.\/lib\/static-page-slugs['"]/);
    expect(headerSrc).toMatch(/getStaticPagePath\s*\(\s*['"]tools['"]/);
  });

  it('does NOT hardcode /werkzeuge for the EN nav (the bug)', () => {
    // The pre-fix DE entry hardcoded /${lang}/werkzeuge for both DE and EN.
    // After the fix the href comes from getStaticPagePath('tools', lang).
    expect(headerSrc).not.toMatch(/href:\s*`\/\$\{lang\}\/werkzeuge`/);
  });

  it('keeps the German label "Werkzeuge" and English label "Tools"', () => {
    expect(headerSrc).toMatch(/label:\s*['"]Werkzeuge['"]/);
    expect(headerSrc).toMatch(/label:\s*['"]Tools['"]/);
  });

  it('DE language → /de/werkzeuge', () => {
    expect(getStaticPagePath('tools', 'de')).toBe('/de/werkzeuge');
  });

  it('EN language → /en/tools (NOT /en/werkzeuge)', () => {
    expect(getStaticPagePath('tools', 'en')).toBe('/en/tools');
  });
});

describe('Tools-index pages exist on disk per language', () => {
  it('DE tools-index file exists at src/pages/de/werkzeuge.astro', () => {
    expect(existsSync(join(process.cwd(), 'src/pages/de/werkzeuge.astro'))).toBe(true);
  });

  it('EN tools-index file exists at src/pages/en/tools.astro (the fix)', () => {
    expect(existsSync(join(process.cwd(), 'src/pages/en/tools.astro'))).toBe(true);
  });

  it('legacy generic [lang]/werkzeuge.astro is removed (no longer mints /en/werkzeuge)', () => {
    const legacy = join(process.cwd(), 'src/pages/[lang]/werkzeuge.astro');
    expect(existsSync(legacy)).toBe(false);
  });

  it('EN tools page is wired to BaseLayout with EN strings + per-lang pathWithoutLang', () => {
    const enToolsSrc = readFileSync(
      join(process.cwd(), 'src/pages/en/tools.astro'),
      'utf8',
    );
    expect(enToolsSrc).toMatch(/lang\s*=\s*['"]en['"]/);
    expect(enToolsSrc).toMatch(/import\s+ToolsIndex/);
    expect(enToolsSrc).toMatch(/pathWithoutLang=\{\{[^}]*de:\s*['"]\/werkzeuge['"][^}]*en:\s*['"]\/tools['"]/);
  });
});

describe('CF Edge Function defaults to EN for unknown browsers', () => {
  it('DEFAULT_LANG is "en" not "de"', () => {
    const fnSrc = readFileSync(join(process.cwd(), 'functions/index.js'), 'utf8');
    expect(fnSrc).toMatch(/const DEFAULT_LANG = ['"]en['"]/);
    expect(fnSrc).not.toMatch(/const DEFAULT_LANG = ['"]de['"]/);
  });

  it('bypasses redirect for explicit /de/* and /en/* paths (respects user choice)', () => {
    const fnSrc = readFileSync(join(process.cwd(), 'functions/index.js'), 'utf8');
    // The function must check for an existing language prefix and return
    // next() without redirecting when the user is already on /de or /en.
    expect(fnSrc).toMatch(/path\s*===\s*`\/\$\{lang\}`/);
    expect(fnSrc).toMatch(/path\.startsWith\s*\(\s*`\/\$\{lang\}\/`\)/);
  });
});
