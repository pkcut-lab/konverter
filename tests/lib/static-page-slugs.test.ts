import { describe, it, expect } from 'vitest';
import { getStaticPageSlug, getStaticPagePath } from '../../src/lib/static-page-slugs';

describe('static-page-slugs', () => {
  describe('getStaticPageSlug', () => {
    it('returns the German slug "werkzeuge" for the tools page', () => {
      expect(getStaticPageSlug('tools', 'de')).toBe('werkzeuge');
    });

    it('returns the English slug "tools" for the tools page', () => {
      expect(getStaticPageSlug('tools', 'en')).toBe('tools');
    });

    it('DE and EN slugs differ — the bug we are fixing', () => {
      // Regression guard for the i18n bug where /en/werkzeuge was rendered
      // instead of /en/tools (German slug under English language route).
      const de = getStaticPageSlug('tools', 'de');
      const en = getStaticPageSlug('tools', 'en');
      expect(de).not.toBe(en);
    });
  });

  describe('getStaticPagePath', () => {
    it('builds /de/werkzeuge for German', () => {
      expect(getStaticPagePath('tools', 'de')).toBe('/de/werkzeuge');
    });

    it('builds /en/tools for English (NOT /en/werkzeuge)', () => {
      expect(getStaticPagePath('tools', 'en')).toBe('/en/tools');
      expect(getStaticPagePath('tools', 'en')).not.toBe('/en/werkzeuge');
    });

    it('always prefixes with the language slot', () => {
      expect(getStaticPagePath('tools', 'de')).toMatch(/^\/de\//);
      expect(getStaticPagePath('tools', 'en')).toMatch(/^\/en\//);
    });
  });
});
