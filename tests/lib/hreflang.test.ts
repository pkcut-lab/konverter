import { describe, it, expect } from 'vitest';
import {
  ACTIVE_LANGUAGES,
  DEFAULT_LANGUAGE,
  buildHreflangLinks,
} from '../../src/lib/hreflang';

describe('ACTIVE_LANGUAGES', () => {
  it('contains exactly de in Phase 0', () => {
    expect(ACTIVE_LANGUAGES).toEqual(['de']);
  });

  it('DEFAULT_LANGUAGE is de', () => {
    expect(DEFAULT_LANGUAGE).toBe('de');
  });
});

describe('buildHreflangLinks', () => {
  it('emits one alternate per active language plus x-default (Phase 0: 2 entries)', () => {
    const links = buildHreflangLinks({ pathWithoutLang: '/' });
    expect(links).toHaveLength(ACTIVE_LANGUAGES.length + 1);
  });

  it('includes x-default pointing at default language URL', () => {
    const links = buildHreflangLinks({ pathWithoutLang: '/' });
    const xDefault = links.find((l) => l.hreflang === 'x-default');
    expect(xDefault).toBeDefined();
    expect(xDefault?.href).toBe('https://konverter.pages.dev/de/');
  });

  it('builds absolute URLs with trailing path', () => {
    const links = buildHreflangLinks({ pathWithoutLang: '/styleguide/' });
    const de = links.find((l) => l.hreflang === 'de');
    expect(de?.href).toBe('https://konverter.pages.dev/de/styleguide/');
  });

  it('normalises path: missing leading slash is added', () => {
    const links = buildHreflangLinks({ pathWithoutLang: 'styleguide/' });
    const de = links.find((l) => l.hreflang === 'de');
    expect(de?.href).toBe('https://konverter.pages.dev/de/styleguide/');
  });

  it('normalises path: missing trailing slash is added for non-root', () => {
    const links = buildHreflangLinks({ pathWithoutLang: '/styleguide' });
    const de = links.find((l) => l.hreflang === 'de');
    expect(de?.href).toBe('https://konverter.pages.dev/de/styleguide/');
  });

  it('root path "/" maps to /{lang}/ (no double slash)', () => {
    const links = buildHreflangLinks({ pathWithoutLang: '/' });
    const de = links.find((l) => l.hreflang === 'de');
    expect(de?.href).toBe('https://konverter.pages.dev/de/');
  });
});
