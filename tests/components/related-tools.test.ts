// tests/components/related-tools.test.ts
//
// NOTE on test mechanism: Same rationale as tests/components/footer-tools-list.test.ts.
// `experimental_AstroContainer` + vitest + this workspace's environment conflict
// (esbuild + jsdom TextEncoder invariant vs. markdown browser-conditional exports).
// Pivot: unit-test (a) the data helper the component uses (resolveRelatedTools)
// and (b) the component's source-level template / token contract. End-to-end
// rendering is verified in the smoke-build test (Task 5).

import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Mock `astro:content` so listToolsForLang() returns the 3 Phase-1 DE tools.
vi.mock('astro:content', () => ({
  getCollection: vi.fn(
    async (_name: string, filter?: (e: { data: { language: string } }) => boolean) => {
      const all = [
        {
          data: {
            toolId: 'remove-background',
            language: 'de',
            title: 'Hintergrund entfernen — direkt im Browser',
            tagline: 'Freisteller in Sekunden — das Bild bleibt auf deinem Gerät.',
          },
        },
        {
          data: {
            toolId: 'meter-to-feet',
            language: 'de',
            title: 'Meter in Fuß umrechnen – Formel & Tabelle',
            tagline: 'Präzise Längen-Umrechnung in Sekunden — klient-seitig, ohne Tracking.',
          },
        },
        {
          data: {
            toolId: 'png-jpg-to-webp',
            language: 'de',
            title: 'PNG und JPG in WebP umwandeln – ohne Upload',
            tagline: 'Bilder direkt im Browser komprimieren — kein Server, kein Tracking.',
          },
        },
      ];
      return filter ? all.filter(filter) : all;
    },
  ),
}));

import { resolveRelatedTools } from '../../src/lib/tools/list';

const componentSrc = readFileSync(
  join(process.cwd(), 'src/components/RelatedTools.astro'),
  'utf8',
);

describe('RelatedTools — template invariants (source inspection)', () => {
  // Runde 3 Session (2026-04-20): Redesign from card-grid to popular-bar-twin
  // — dotted horizontal tabs with mono uppercase label, positioned directly
  // below the tool area. No cards, no stagger-fade-in.
  it('wraps the output in <nav class="related-bar"> with an aria-label', () => {
    expect(componentSrc).toMatch(
      /<nav[^>]*class="related-bar"[^>]*aria-label=\{label\}/,
    );
  });

  it('renders the mono-uppercase label span with class "related-bar__label"', () => {
    expect(componentSrc).toMatch(
      /<span\s+class="related-bar__label">\{label\}<\/span>/,
    );
  });

  it('resolves the label by language (de → "Verwandt", en → "Related")', () => {
    expect(componentSrc).toMatch(/de:\s*'Verwandt'/);
    expect(componentSrc).toMatch(/en:\s*'Related'/);
  });

  it('guards output with a `tools.length > 0` conditional so empty resolutions render nothing', () => {
    expect(componentSrc).toMatch(/tools\.length\s*>\s*0/);
  });

  it('renders each tool as a .related-tab with a dot + label pair', () => {
    expect(componentSrc).toMatch(
      /<a\s+class="related-tab"\s+href=\{t\.href\}>/,
    );
    expect(componentSrc).toMatch(/class="related-tab__dot"/);
    expect(componentSrc).toMatch(/class="related-tab__label">\{t\.shortTitle\}/);
  });

  it('drops the old stagger-fade-in (no --stagger-step / --dur-med reference)', () => {
    expect(componentSrc).not.toMatch(/var\(--stagger-step\)/);
    expect(componentSrc).not.toMatch(/var\(--dur-med\)/);
  });

  it('uses --dur-fast + --ease-out for hover transitions (motion tokens)', () => {
    expect(componentSrc).toMatch(/var\(--dur-fast\)/);
    expect(componentSrc).toMatch(/var\(--ease-out\)/);
  });

  it('contains no hex color literals (tokens-only discipline)', () => {
    expect(componentSrc).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
  });
});

describe('RelatedTools — data-side (resolveRelatedTools)', () => {
  it('returns the resolved tool for a real slug (webp-konverter → png-jpg-to-webp)', async () => {
    const out = await resolveRelatedTools('de', ['webp-konverter']);
    expect(out).toHaveLength(1);
    expect(out[0].toolId).toBe('png-jpg-to-webp');
    expect(out[0].href).toBe('/de/webp-konverter');
  });

  it('returns [] for empty input (enables conditional render to output nothing)', async () => {
    const out = await resolveRelatedTools('de', []);
    expect(out).toEqual([]);
  });

  it('drops forward-looking slugs silently (no throw, no placeholder)', async () => {
    const out = await resolveRelatedTools('de', ['nonexistent-slug', 'bild-komprimieren']);
    expect(out).toEqual([]);
  });

  it('preserves input order for multiple resolving slugs', async () => {
    const out = await resolveRelatedTools('de', [
      'webp-konverter',
      'hintergrund-entfernen',
      'meter-zu-fuss',
    ]);
    expect(out.map((t) => t.toolId)).toEqual([
      'png-jpg-to-webp',
      'remove-background',
      'meter-to-feet',
    ]);
  });
});
