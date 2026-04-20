import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Phase 0 Bootstrap — Smoke', () => {
  it('dist/ exists after build', () => {
    expect(existsSync(join(process.cwd(), 'dist'))).toBe(true);
  });

  it('dist/de/index.html was generated', () => {
    expect(existsSync(join(process.cwd(), 'dist', 'de', 'index.html'))).toBe(true);
  });

  it('all 6 rulebook files exist at workspace root', () => {
    const rulebooks = ['PROJECT.md', 'CONVENTIONS.md', 'STYLE.md', 'CONTENT.md', 'TRANSLATION.md', 'PROGRESS.md'];
    for (const rb of rulebooks) {
      expect(existsSync(join(process.cwd(), rb))).toBe(true);
    }
  });

  it('CLAUDE.md exists at workspace root', () => {
    expect(existsSync(join(process.cwd(), 'CLAUDE.md'))).toBe(true);
  });
});

describe('Cross-Links — Footer + RelatedTools', () => {
  const readDist = (path: string) =>
    readFileSync(join(process.cwd(), 'dist', path), 'utf8');

  const PAGES = [
    'de/index.html',
    'de/hintergrund-entfernen/index.html',
    'de/meter-zu-fuss/index.html',
    'de/webp-konverter/index.html',
  ];

  describe('Footer Werkzeuge section (global, on every DE page)', () => {
    for (const page of PAGES) {
      it(`${page} has Footer <h2>Werkzeuge</h2> + ≥1 tool link`, () => {
        const html = readDist(page);
        // Astro injects scoped `data-astro-cid-*` attributes on the <h2>,
        // so we allow arbitrary attributes but require the exact text.
        expect(html).toMatch(/<h2[^>]*>\s*Werkzeuge\s*<\/h2>/);
        expect(html).toMatch(/href="\/de\/(hintergrund-entfernen|meter-zu-fuss|webp-konverter)"/);
      });
    }
  });

  describe('RelatedTools render matrix', () => {
    it('hintergrund-entfernen renders the bar with 1 resolvable → webp-konverter', () => {
      // Runde-3-Session-4-Redesign: <RelatedTools> rendert jetzt als
      // `<nav class="related-bar" aria-label="Verwandt">` mit span-Label,
      // nicht mehr als Card-Grid mit <h2 id="related-heading">.
      const html = readDist('de/hintergrund-entfernen/index.html');
      expect(html).toMatch(/<nav[^>]*class="related-bar"[^>]*aria-label="Verwandt"/);
      // Forward-looking slugs (bild-komprimieren, bild-groesse-aendern) werden
      // still verworfen — nur webp-konverter resolvt heute.
      const section = html.split('class="related-bar"')[1]?.split('</nav>')[0] ?? '';
      const links = section.match(/href="\/de\/webp-konverter"/g) ?? [];
      expect(links.length).toBeGreaterThanOrEqual(1);
    });

    it('meter-zu-fuss renders the bar with 3 resolvable Längen-Tools', () => {
      // Phase-1 Batch-1 shipped zentimeter-zu-zoll, kilometer-zu-meilen,
      // quadratmeter-zu-quadratfuss — all three relatedSlugs now resolve.
      const html = readDist('de/meter-zu-fuss/index.html');
      expect(html).toMatch(/<nav[^>]*class="related-bar"[^>]*aria-label="Verwandt"/);
      const section = html.split('class="related-bar"')[1]?.split('</nav>')[0] ?? '';
      for (const slug of ['zentimeter-zu-zoll', 'kilometer-zu-meilen', 'quadratmeter-zu-quadratfuss']) {
        expect(section).toMatch(new RegExp(`href="/de/${slug}"`));
      }
    });

    it('webp-konverter suppresses the bar (all slugs forward-looking)', () => {
      const html = readDist('de/webp-konverter/index.html');
      expect(html).not.toMatch(/class="related-bar"/);
    });
  });
});
