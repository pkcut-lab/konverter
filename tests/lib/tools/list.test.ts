import { describe, it, expect, vi } from 'vitest';
import { listToolsForLang, resolveRelatedTools } from '../../../src/lib/tools/list';

vi.mock('astro:content', () => ({
  getCollection: vi.fn(async (_name, filter) => {
    const all = [
      { data: { toolId: 'remove-background', language: 'de',
                title: 'Hintergrund entfernen — direkt im Browser',
                tagline: 'Freisteller in Sekunden — das Bild bleibt auf deinem Gerät.' } },
      { data: { toolId: 'meter-to-feet', language: 'de',
                title: 'Meter in Fuß umrechnen – Formel & Tabelle',
                tagline: 'Präzise Längen-Umrechnung in Sekunden — klient-seitig, ohne Tracking.' } },
      { data: { toolId: 'png-jpg-to-webp', language: 'de',
                title: 'PNG und JPG in WebP umwandeln – ohne Upload',
                tagline: 'Bilder direkt im Browser komprimieren — kein Server, kein Tracking.' } },
    ];
    return filter ? all.filter(filter) : all;
  }),
}));

describe('listToolsForLang', () => {
  it('returns all DE tools sorted alphabetically by title', async () => {
    const tools = await listToolsForLang('de');
    expect(tools.map((t) => t.toolId)).toEqual([
      'remove-background',      // „Hintergrund…"
      'meter-to-feet',          // „Meter…"
      'png-jpg-to-webp',        // „PNG…"
    ]);
  });

  it('returns empty array for unsupported language', async () => {
    const tools = await listToolsForLang('en');
    expect(tools).toEqual([]);
  });

  it('attaches href to each entry', async () => {
    const tools = await listToolsForLang('de');
    const bgRemover = tools.find((t) => t.toolId === 'remove-background')!;
    expect(bgRemover.href).toBe('/de/hintergrund-entfernen');
  });

  it('ToolListItem carries `category` field from frontmatter', async () => {
    const items = await listToolsForLang('de');
    const mf = items.find((t) => t.toolId === 'meter-to-feet');
    expect(mf).toBeDefined();
    // Nach Content-Migration ist category gesetzt; vor Migration undefined.
    expect(Object.prototype.hasOwnProperty.call(mf!, 'category')).toBe(true);
  });
});

describe('resolveRelatedTools (accepts localized slugs, not toolIds)', () => {
  it('resolves existing slugs in input-order (not alphabetical)', async () => {
    const tools = await resolveRelatedTools('de', ['webp-konverter', 'meter-zu-fuss']);
    expect(tools.map((t) => t.toolId)).toEqual(['png-jpg-to-webp', 'meter-to-feet']);
  });

  it('silently ignores forward-looking Phase-1 slugs', async () => {
    const tools = await resolveRelatedTools('de', ['bild-komprimieren', 'bild-groesse-aendern']);
    expect(tools).toEqual([]);
  });

  it('mixed-resolve: drops unresolvable, keeps resolvable', async () => {
    const tools = await resolveRelatedTools('de', [
      'bild-komprimieren',   // forward-looking
      'webp-konverter',      // resolves
      'jpg-zu-png',          // forward-looking
    ]);
    expect(tools.map((t) => t.toolId)).toEqual(['png-jpg-to-webp']);
  });
});
