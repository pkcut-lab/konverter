import { describe, it, expect, vi } from 'vitest';
import { resolveRelatedToolsWithFallback } from '../../../src/lib/tools/list';

// Mock entspricht dem tatsächlichen DE-Content-State NACH der Category-Migration.
// toolIds + category matchen 1:1 die 9 DE-Files in src/content/tools/*/de.md.
vi.mock('astro:content', () => ({
  getCollection: vi.fn(async (_name, filter) => {
    const all = [
      {
        data: {
          toolId: 'remove-background',
          language: 'de',
          title: 'Hintergrund entfernen — direkt im Browser',
          tagline: 'Freisteller in Sekunden — das Bild bleibt auf deinem Gerät.',
          category: 'image',
        },
      },
      {
        data: {
          toolId: 'meter-to-feet',
          language: 'de',
          title: 'Meter in Fuß umrechnen – Formel & Tabelle',
          tagline: 'Präzise Längen-Umrechnung in Sekunden — klient-seitig, ohne Tracking.',
          category: 'length',
        },
      },
      {
        data: {
          toolId: 'png-jpg-to-webp',
          language: 'de',
          title: 'PNG und JPG in WebP umwandeln – ohne Upload',
          tagline: 'Bilder direkt im Browser komprimieren — kein Server, kein Tracking.',
          category: 'image',
        },
      },
      {
        data: {
          toolId: 'cm-to-inch',
          language: 'de',
          title: 'Zentimeter in Zoll umrechnen – Formel & Tabelle',
          tagline: 'Präzise cm-zu-Zoll-Umrechnung in Sekunden — client-seitig, ohne Tracking.',
          category: 'length',
        },
      },
      {
        data: {
          toolId: 'km-to-mile',
          language: 'de',
          title: 'Kilometer in Meilen umrechnen – Formel & Tabelle',
          tagline: 'Schnelle km-zu-Meilen-Umrechnung — client-seitig, ohne Tracking, ohne Upload.',
          category: 'length',
        },
      },
      {
        data: {
          toolId: 'kg-to-lb',
          language: 'de',
          title: 'Kilogramm in Pfund umrechnen – Formel & Tabelle',
          tagline: 'Präzise kg-zu-Pfund-Umrechnung in Sekunden — client-seitig, ohne Tracking.',
          category: 'weight',
        },
      },
      {
        data: {
          toolId: 'celsius-to-fahrenheit',
          language: 'de',
          title: 'Celsius in Fahrenheit umrechnen – Formel & Tabelle',
          tagline: 'Schnelle °C-zu-°F-Umrechnung mit affiner Formel — client-seitig, ohne Tracking.',
          category: 'temperature',
        },
      },
      {
        data: {
          toolId: 'sqm-to-sqft',
          language: 'de',
          title: 'Quadratmeter in Quadratfuß umrechnen – Formel & Tabelle',
          tagline: 'Präzise m²-zu-ft²-Umrechnung mit vorquadriertem Faktor — client-seitig, ohne Tracking.',
          category: 'area',
        },
      },
      {
        data: {
          toolId: 'hevc-to-h264',
          language: 'de',
          title: 'iPhone-Video in MP4 umwandeln — HEVC zu H.264 Konverter',
          tagline: 'Direkt im Browser — ohne Upload, ohne Wasserzeichen.',
          category: 'video',
        },
      },
    ];
    return filter ? all.filter(filter) : all;
  }),
}));

describe('resolveRelatedToolsWithFallback', () => {
  it('returns all explicit resolvable slugs when count >= minCount', async () => {
    const items = await resolveRelatedToolsWithFallback(
      'de',
      'meter-zu-fuss',
      ['zentimeter-zu-zoll', 'kilometer-zu-meilen', 'quadratmeter-zu-quadratfuss'],
      3,
    );
    expect(items).toHaveLength(3);
    const slugs = items.map((t) => t.href.split('/').pop());
    expect(slugs).toEqual(['zentimeter-zu-zoll', 'kilometer-zu-meilen', 'quadratmeter-zu-quadratfuss']);
  });

  it('backfills with same-category siblings when explicit resolves < minCount', async () => {
    // hintergrund-entfernen hat Forward-Refs, nur webp-konverter resolvt.
    // Fallback-Pool = image-Kategorie ohne self → webp-konverter (bereits drin),
    // kein weiterer image-Konverter vorhanden → Ergebnis bleibt 1.
    const items = await resolveRelatedToolsWithFallback(
      'de',
      'hintergrund-entfernen',
      ['bild-komprimieren', 'bild-groesse-aendern', 'webp-konverter'],
      3,
    );
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items.length).toBeLessThanOrEqual(3);
    expect(items.map((t) => t.toolId)).toContain('png-jpg-to-webp');
    expect(items.map((t) => t.toolId)).not.toContain('remove-background');
  });

  it('excludes own slug from fallback', async () => {
    const items = await resolveRelatedToolsWithFallback('de', 'meter-zu-fuss', [], 3);
    const slugs = items.map((t) => t.href.split('/').pop());
    expect(slugs).not.toContain('meter-zu-fuss');
  });

  it('deduplicates: explicit-hits are never backfilled again via category', async () => {
    const items = await resolveRelatedToolsWithFallback(
      'de',
      'meter-zu-fuss',
      ['zentimeter-zu-zoll'],
      3,
    );
    const slugs = items.map((t) => t.href.split('/').pop());
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs[0]).toBe('zentimeter-zu-zoll');
  });

  it('respects minCount = 0 (no fallback when no explicit)', async () => {
    const items = await resolveRelatedToolsWithFallback('de', 'meter-zu-fuss', [], 0);
    expect(items).toHaveLength(0);
  });

  it('preserves explicit ordering; fallback items follow', async () => {
    const items = await resolveRelatedToolsWithFallback(
      'de',
      'meter-zu-fuss',
      ['kilometer-zu-meilen'],
      3,
    );
    const slugs = items.map((t) => t.href.split('/').pop());
    expect(slugs[0]).toBe('kilometer-zu-meilen');
    // Nach Content-Migration resolven Fallbacks zu anderen length-Geschwistern.
    // length-Kategorie (ohne self, ohne explicit): cm-to-inch → ein Fallback.
    // Gesamt: 2 (1 explicit + 1 fallback), da nur 3 length-Tools existieren.
    expect(items.length).toBe(2);
    expect(slugs[1]).toBe('zentimeter-zu-zoll');
    expect(items.every((t) => t.toolId !== 'meter-to-feet')).toBe(true);
  });
});
