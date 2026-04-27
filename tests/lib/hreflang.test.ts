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

  it('DEFAULT_LANGUAGE is en (matches functions/index.js DEFAULT_LANG)', () => {
    expect(DEFAULT_LANGUAGE).toBe('en');
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
    expect(xDefault?.href).toBe('https://kittokit.com/en');
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

  it('per-lang record: emits one entry per language with that language\'s slug', () => {
    const links = buildHreflangLinks({
      pathWithoutLang: { de: '/meter-zu-fuss', en: '/meter-to-feet' },
    });
    const de = links.find((l) => l.hreflang === 'de');
    const en = links.find((l) => l.hreflang === 'en');
    expect(de?.href).toBe('https://kittokit.com/de/meter-zu-fuss');
    expect(en?.href).toBe('https://kittokit.com/en/meter-to-feet');
  });

  it('per-lang record: OMITS langs without a translation (no fabricated URL)', () => {
    const links = buildHreflangLinks({
      pathWithoutLang: { de: '/de-only-tool' }, // no en slot
    });
    expect(links.find((l) => l.hreflang === 'en')).toBeUndefined();
    expect(links.find((l) => l.hreflang === 'de')?.href).toBe(
      'https://kittokit.com/de/de-only-tool',
    );
  });

  it('per-lang record: x-default points at default lang slug when present', () => {
    const links = buildHreflangLinks({
      pathWithoutLang: { en: '/en-only-tool' },
    });
    expect(links.find((l) => l.hreflang === 'x-default')?.href).toBe(
      'https://kittokit.com/en/en-only-tool',
    );
  });

  it('per-lang record: x-default omitted when default lang slot missing', () => {
    const links = buildHreflangLinks({
      pathWithoutLang: { de: '/de-only-tool' }, // no en — no x-default
    });
    expect(links.find((l) => l.hreflang === 'x-default')).toBeUndefined();
  });
});
