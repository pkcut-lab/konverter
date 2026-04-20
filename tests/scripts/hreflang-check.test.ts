import { describe, it, expect } from 'vitest';
// @ts-expect-error — .mjs import without types is fine here
import { checkHreflang, DEFAULT_LANG, ACTIVE_LANGS_PHASE_1 } from '../../scripts/hreflang-check.mjs';

const WRAP = (head: string) => `<!doctype html><html><head>${head}</head><body></body></html>`;

describe('hreflang-check', () => {
  it('exports DEFAULT_LANG and Phase-1 active-langs', () => {
    expect(DEFAULT_LANG).toBe('de');
    expect(ACTIVE_LANGS_PHASE_1).toEqual(['de']);
  });

  it('passes for valid Phase-1 DE page with x-default', () => {
    const html = WRAP(`
      <link rel="alternate" hreflang="de" href="https://konverter.de/meter-zu-fuss" />
      <link rel="alternate" hreflang="x-default" href="https://konverter.de/meter-zu-fuss" />
    `);
    const res = checkHreflang(html, 'de');
    expect(res.ok).toBe(true);
    expect(res.failures).toEqual([]);
    expect(res.links.length).toBe(2);
  });

  it('fails when current-lang link is missing', () => {
    const html = WRAP(`
      <link rel="alternate" hreflang="x-default" href="https://konverter.de/x" />
    `);
    const res = checkHreflang(html, 'de');
    expect(res.ok).toBe(false);
    expect(res.failures.some((f: string) => f.includes('missing hreflang="de"'))).toBe(true);
  });

  it('fails when x-default is missing', () => {
    const html = WRAP(`
      <link rel="alternate" hreflang="de" href="https://konverter.de/x" />
    `);
    const res = checkHreflang(html, 'de');
    expect(res.ok).toBe(false);
    expect(res.failures.some((f: string) => f.includes('x-default'))).toBe(true);
  });

  it('fails when an active-lang is not referenced (Phase-3 simulation)', () => {
    const html = WRAP(`
      <link rel="alternate" hreflang="de" href="https://konverter.de/x" />
      <link rel="alternate" hreflang="x-default" href="https://konverter.de/x" />
    `);
    const res = checkHreflang(html, 'de', ['de', 'en', 'fr']);
    expect(res.ok).toBe(false);
    expect(res.failures.some((f: string) => f.includes('active lang "en"'))).toBe(true);
    expect(res.failures.some((f: string) => f.includes('active lang "fr"'))).toBe(true);
  });

  it('fails on dangling href (empty href for non-xdefault)', () => {
    const html = WRAP(`
      <link rel="alternate" hreflang="de" href="" />
      <link rel="alternate" hreflang="x-default" href="https://konverter.de/x" />
    `);
    const res = checkHreflang(html, 'de');
    expect(res.ok).toBe(false);
    expect(res.failures.some((f: string) => f.includes('empty href'))).toBe(true);
  });

  it('returns parsed link list regardless of ok', () => {
    const html = WRAP(`
      <link rel="alternate" hreflang="de" href="https://a/" />
      <link rel="alternate" hreflang="en" href="https://b/" />
      <link rel="alternate" hreflang="x-default" href="https://a/" />
    `);
    const res = checkHreflang(html, 'de', ['de', 'en']);
    expect(res.links).toContainEqual({ hreflang: 'de', href: 'https://a/' });
    expect(res.links).toContainEqual({ hreflang: 'en', href: 'https://b/' });
    expect(res.links).toContainEqual({ hreflang: 'x-default', href: 'https://a/' });
  });

  it('ignores link tags without hreflang attribute', () => {
    const html = WRAP(`
      <link rel="stylesheet" href="/s.css" />
      <link rel="alternate" hreflang="de" href="https://konverter.de/x" />
      <link rel="alternate" hreflang="x-default" href="https://konverter.de/x" />
    `);
    const res = checkHreflang(html, 'de');
    expect(res.ok).toBe(true);
    expect(res.links.length).toBe(2);
  });
});
