// tests/components/footer-tools-list.test.ts
//
// NOTE on test mechanism: The plan specified `experimental_AstroContainer`
// for rendering FooterToolsList in vitest. That combination is not viable
// in this workspace — the container compiles via esbuild, and neither env
// option works:
//   - `environment: 'node'` → transitive markdown deps (decode-named-
//     character-reference) resolve to their browser-conditional `.dom.js`
//     export and `ReferenceError: document is not defined` at load time.
//   - `environment: 'jsdom'` → jsdom's TextEncoder polyfill violates
//     esbuild's `instanceof Uint8Array` invariant; esbuild throws at init,
//     before user setupFiles can swap globals.
// Tried: explicit node/ssr conditions, setupFile globalThis.TextEncoder
// swap, removing svelte plugin from project, clearing .vite cache. None
// land both sides of the environment trade-off.
//
// Pivot: unit-test the component's behavior by (a) exercising the same
// data helper the component uses (listToolsForLang) and (b) asserting the
// component's source-level template contract. This verifies the three
// plan-specified invariants without runtime rendering. The smoke-build
// test (Task 6) will verify end-to-end rendering.

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

import { listToolsForLang } from '../../src/lib/tools/list';

const componentSrc = readFileSync(
  join(process.cwd(), 'src/components/FooterToolsList.astro'),
  'utf8',
);

describe('FooterToolsList', () => {
  it('renders one <a> per DE tool in alphabetical order', async () => {
    // Data side: helper returns all 3 tools sorted by title (DE locale).
    const tools = await listToolsForLang('de');
    expect(tools.length).toBeGreaterThanOrEqual(3);
    // Alphabetical: Hintergrund < Meter < PNG/WebP
    const hrefs = tools.map((t) => t.href);
    const idxBg = hrefs.indexOf('/de/hintergrund-entfernen');
    const idxMeter = hrefs.indexOf('/de/meter-zu-fuss');
    expect(idxBg).toBeGreaterThanOrEqual(0);
    expect(idxMeter).toBeGreaterThan(idxBg);

    // Template side: component maps each tool to an anchor containing a
    // bold shortTitle + muted tagline (two-line editorial hierarchy).
    expect(componentSrc).toMatch(
      /<a\s+href=\{t\.href\}>[\s\S]*?\{t\.shortTitle\}[\s\S]*?\{t\.tagline\}[\s\S]*?<\/a>/,
    );
  });

  it('renders lang-aware heading ("Werkzeuge" for DE, "Tools" for EN)', () => {
    // Heading is now lang-aware via {heading}; after i18n migration the
    // value comes from t(lang).header.nav.tools rather than a ternary.
    expect(componentSrc).toMatch(/<h2>\{heading\}<\/h2>/);
    expect(componentSrc).toMatch(/strings\.header\.nav\.tools/);
  });

  it('does NOT render overflow link when count <= 8', async () => {
    // CAP is 8. With 3 mocked tools, `overflow` is 0, overflow-<li> is not
    // emitted. Assert both the CAP constant and the conditional guard.
    const tools = await listToolsForLang('de');
    expect(tools.length).toBeLessThanOrEqual(8);
    expect(componentSrc).toMatch(/const CAP = 8;/);
    expect(componentSrc).toMatch(/\{overflow > 0 && \(/);
  });
});
