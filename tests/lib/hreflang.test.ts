import { describe, it, expect } from 'vitest';
import {
  ACTIVE_LANGUAGES,
  DEFAULT_LANGUAGE,
  buildHreflangLinks,
} from '../../src/lib/hreflang';

describe('ACTIVE_LANGUAGES', () => {
  it('contains de and en in Phase 3 (bilingual)', () => {
    expect(ACTIVE_LANGUAGES).toEqual(['de', 'en']);
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
    expect(xDefault?.href).toBe('https://kittokit.com/de');
  });

  it('builds absolute URLs with trailing path (no trailing slash)', () => {
    const links = buildHreflangLinks({ pathWithoutLang: '/styleguide/' });
    const de = links.find((l) => l.hreflang === 'de');
    expect(de?.href).toBe('https://kittokit.com/de/styleguide');
  });

  it('normalises path: missing leading slash is added', () => {
    const links = buildHreflangLinks({ pathWithoutLang: 'styleguide/' });
    const de = links.find((l) => l.hreflang === 'de');
    expect(de?.href).toBe('https://kittokit.com/de/styleguide');
  });

  it('normalises path: trailing slash is stripped for non-root', () => {
    const links = buildHreflangLinks({ pathWithoutLang: '/styleguide' });
    const de = links.find((l) => l.hreflang === 'de');
    expect(de?.href).toBe('https://kittokit.com/de/styleguide');
  });

  it('root path "/" maps to /{lang} (no trailing slash)', () => {
    const links = buildHreflangLinks({ pathWithoutLang: '/' });
    const de = links.find((l) => l.hreflang === 'de');
    expect(de?.href).toBe('https://kittokit.com/de');
  });
});
