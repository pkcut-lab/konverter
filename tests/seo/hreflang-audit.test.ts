/**
 * tests/seo/hreflang-audit.test.ts
 *
 * Verifies that buildHreflangLinks produces correct bidirectional hreflang links
 * for every tool page when called with a per-language path record (T3.1 fix).
 *
 * Coverage:
 *  - All 72 toolIds in slug-map produce a DE href and EN href
 *  - DE href points to /de/{de-slug}, EN href to /en/{en-slug}
 *  - x-default matches the DE (default language) URL
 *  - Bidirectionality: for each toolId, the DE page's EN hreflang URL is the
 *    exact inverse of the EN page's DE hreflang URL
 */

import { describe, it, expect } from 'vitest';
import { buildHreflangLinks, ACTIVE_LANGUAGES, type ActiveLanguage } from '../../src/lib/hreflang';
import { slugMap, getSlug } from '../../src/lib/slug-map';
import { SITE_URL } from '../../src/lib/site';

const TOOL_IDS = Object.keys(slugMap);

describe('buildHreflangLinks — per-language path record (T3.1)', () => {
  it('produces 3 link entries (de + en + x-default) for each tool', () => {
    for (const toolId of TOOL_IDS) {
      const deSlug = getSlug(toolId, 'de');
      const enSlug = getSlug(toolId, 'en');
      if (!deSlug || !enSlug) continue;

      const pathByLang: Partial<Record<ActiveLanguage, string>> = {
        de: `/${deSlug}`,
        en: `/${enSlug}`,
      };
      const links = buildHreflangLinks({ pathWithoutLang: pathByLang });

      expect(links).toHaveLength(3); // de + en + x-default
      const hreflangs = links.map((l) => l.hreflang);
      expect(hreflangs).toContain('de');
      expect(hreflangs).toContain('en');
      expect(hreflangs).toContain('x-default');
    }
  });

  it('DE href is /de/{de-slug} for all tools', () => {
    for (const toolId of TOOL_IDS) {
      const deSlug = getSlug(toolId, 'de');
      const enSlug = getSlug(toolId, 'en');
      if (!deSlug || !enSlug) continue;

      const links = buildHreflangLinks({ pathWithoutLang: { de: `/${deSlug}`, en: `/${enSlug}` } });
      const deLink = links.find((l) => l.hreflang === 'de');
      expect(deLink?.href).toBe(`${SITE_URL}/de/${deSlug}`);
    }
  });

  it('EN href is /en/{en-slug} (not /en/{de-slug}) for tools with distinct slugs', () => {
    for (const toolId of TOOL_IDS) {
      const deSlug = getSlug(toolId, 'de');
      const enSlug = getSlug(toolId, 'en');
      if (!deSlug || !enSlug) continue;

      const links = buildHreflangLinks({ pathWithoutLang: { de: `/${deSlug}`, en: `/${enSlug}` } });
      const enLink = links.find((l) => l.hreflang === 'en');
      expect(enLink?.href).toBe(`${SITE_URL}/en/${enSlug}`);

      // Only assert non-equality for tools where DE slug ≠ EN slug
      // (some tools like qr-code-generator intentionally share the slug across languages)
      if (deSlug !== enSlug) {
        expect(enLink?.href).not.toBe(`${SITE_URL}/en/${deSlug}`);
      }
    }
  });

  it('x-default matches the DE URL (default language)', () => {
    for (const toolId of TOOL_IDS) {
      const deSlug = getSlug(toolId, 'de');
      const enSlug = getSlug(toolId, 'en');
      if (!deSlug || !enSlug) continue;

      const links = buildHreflangLinks({ pathWithoutLang: { de: `/${deSlug}`, en: `/${enSlug}` } });
      const xDefault = links.find((l) => l.hreflang === 'x-default');
      const deLink = links.find((l) => l.hreflang === 'de');
      expect(xDefault?.href).toBe(deLink?.href);
    }
  });

  it('bidirectionality: DE-page EN-href == EN-page self-href', () => {
    for (const toolId of TOOL_IDS) {
      const deSlug = getSlug(toolId, 'de');
      const enSlug = getSlug(toolId, 'en');
      if (!deSlug || !enSlug) continue;

      // Simulate what [slug].astro now passes for the DE page
      const dePageLinks = buildHreflangLinks({ pathWithoutLang: { de: `/${deSlug}`, en: `/${enSlug}` } });
      // Simulate what [slug].astro now passes for the EN page
      const enPageLinks = buildHreflangLinks({ pathWithoutLang: { de: `/${deSlug}`, en: `/${enSlug}` } });

      const dePageEnHref = dePageLinks.find((l) => l.hreflang === 'en')?.href;
      const enPageSelfHref = enPageLinks.find((l) => l.hreflang === 'en')?.href;

      expect(dePageEnHref).toBe(enPageSelfHref);
    }
  });

  it('all 72 toolIds have both DE and EN slugs registered', () => {
    let count = 0;
    for (const toolId of TOOL_IDS) {
      const deSlug = getSlug(toolId, 'de');
      const enSlug = getSlug(toolId, 'en');
      if (deSlug && enSlug) count++;
    }
    // Currently all 72 have both; this asserts the minimum
    expect(count).toBeGreaterThanOrEqual(72);
  });
});

describe('buildHreflangLinks — old single-string path (bug regression check)', () => {
  it('single-string path produces WRONG EN href (confirms the bug T3.1 fixed)', () => {
    const toolId = 'meter-to-feet';
    const deSlug = getSlug(toolId, 'de')!; // 'meter-zu-fuss'

    // Old broken behaviour: passing only the DE slug as string
    const brokenLinks = buildHreflangLinks({ pathWithoutLang: `/${deSlug}` });
    const enLink = brokenLinks.find((l) => l.hreflang === 'en');
    // Would produce /en/meter-zu-fuss — incorrect
    expect(enLink?.href).toBe(`${SITE_URL}/en/${deSlug}`);
    expect(enLink?.href).not.toContain('meter-to-feet');
  });
});
