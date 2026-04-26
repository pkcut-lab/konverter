// tests/components/ToolStats.test.ts
//
// Same pattern as related-tools.test.ts: source inspection + schema validation.
// AstroContainer + vitest conflict prevents full render; source-level invariants
// cover the contract instead. End-to-end rendering verified via build smoke test.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const componentSrc = readFileSync(
  join(process.cwd(), 'src/components/ToolStats.astro'),
  'utf8',
);

describe('ToolStats — component source invariants', () => {
  it('uses font-family-mono token for numbers (no raw font name)', () => {
    expect(componentSrc).toContain('var(--font-family-mono)');
    expect(componentSrc).not.toMatch(/font-family:\s*['"]?JetBrains/);
  });

  it('has no hex color values in styles', () => {
    const styleBlock = componentSrc.match(/<style>([\s\S]*)<\/style>/)?.[1] ?? '';
    expect(styleBlock).not.toMatch(/#[0-9a-fA-F]{3,6}\b/);
  });

  it('has no raw px/rem arbitrary values — only token variables', () => {
    const styleBlock = componentSrc.match(/<style>([\s\S]*)<\/style>/)?.[1] ?? '';
    // Allow font-size with rem/em (locked design values) but no arbitrary padding/margin px
    const arbitraryPx = styleBlock.match(/(?:padding|margin|gap|width|height):\s*\d+px/g);
    expect(arbitraryPx).toBeNull();
  });

  it('renders a <dl> element (definition list for stat pairs)', () => {
    expect(componentSrc).toContain('<dl');
  });

  it('renders <dt> for label and <dd> for value', () => {
    expect(componentSrc).toContain('<dt');
    expect(componentSrc).toContain('<dd');
  });

  it('conditionally renders unit span only when unit is present', () => {
    expect(componentSrc).toContain('s.unit &&');
  });

  it('has min-height reservation to prevent CLS', () => {
    const styleBlock = componentSrc.match(/<style>([\s\S]*)<\/style>/)?.[1] ?? '';
    expect(styleBlock).toContain('min-height');
  });

  it('wraps in a guard so empty stats array renders nothing', () => {
    // Template must gate on stats.length > 0
    expect(componentSrc).toMatch(/stats\.length\s*>\s*0/);
  });

  it('uses color-text-subtle token for labels (AAA-compliant)', () => {
    expect(componentSrc).toContain('var(--color-text-subtle)');
  });

  it('uses uppercase + letter-spacing for labels (Refined-Minimalism eyebrow pattern)', () => {
    const styleBlock = componentSrc.match(/<style>([\s\S]*)<\/style>/)?.[1] ?? '';
    expect(styleBlock).toContain('text-transform: uppercase');
    expect(styleBlock).toContain('letter-spacing');
  });
});

describe('ToolStats — Zod schema invariants', () => {
  it('schema accepts a valid stat with label, value, unit', async () => {
    const { toolContentFrontmatterSchema } = await import(
      '../../src/content/tools.schema'
    );
    const base = {
      toolId: 'test-tool',
      language: 'de' as const,
      title: 'Test Tool — ein langer Titel hier',
      metaDescription: 'A'.repeat(140),
      tagline: 'Ein tagline',
      intro: 'Intro text.',
      howToUse: ['Schritt 1', 'Schritt 2', 'Schritt 3'],
      faq: [
        { q: 'Frage 1?', a: 'Antwort 1' },
        { q: 'Frage 2?', a: 'Antwort 2' },
        { q: 'Frage 3?', a: 'Antwort 3' },
        { q: 'Frage 4?', a: 'Antwort 4' },
      ],
      relatedTools: [],
      category: 'dev' as const,
      contentVersion: 1,
    };

    // 0 stats — field omitted → valid
    expect(() => toolContentFrontmatterSchema.parse(base)).not.toThrow();

    // 3 stats with unit → valid
    const withStats = {
      ...base,
      stats: [
        { label: 'Genauigkeit', value: '5', unit: 'Dezimalstellen' },
        { label: 'Verarbeitung', value: '<1', unit: 'ms' },
        { label: 'Datenschutz', value: 'lokal' },
      ],
    };
    const result = toolContentFrontmatterSchema.parse(withStats);
    expect(result.stats).toHaveLength(3);
    expect(result.stats![0].unit).toBe('Dezimalstellen');
    expect(result.stats![2].unit).toBeUndefined();
  });

  it('schema rejects stats with empty label', async () => {
    const { toolContentFrontmatterSchema } = await import(
      '../../src/content/tools.schema'
    );
    expect(() =>
      toolContentFrontmatterSchema.parse({
        toolId: 'x',
        language: 'de',
        title: 'T'.repeat(30),
        metaDescription: 'A'.repeat(140),
        tagline: 'T',
        intro: 'I',
        howToUse: ['a', 'b', 'c'],
        faq: [
          { q: 'Q1?', a: 'A1' },
          { q: 'Q2?', a: 'A2' },
          { q: 'Q3?', a: 'A3' },
          { q: 'Q4?', a: 'A4' },
        ],
        relatedTools: [],
        category: 'dev',
        contentVersion: 1,
        stats: [{ label: '', value: 'ok' }],
      }),
    ).toThrow();
  });

  it('schema accepts stats without unit (unit is optional)', async () => {
    const { toolContentFrontmatterSchema } = await import(
      '../../src/content/tools.schema'
    );
    const result = toolContentFrontmatterSchema.parse({
      toolId: 'y',
      language: 'de',
      title: 'T'.repeat(30),
      metaDescription: 'A'.repeat(140),
      tagline: 'T',
      intro: 'I',
      howToUse: ['a', 'b', 'c'],
      faq: [
        { q: 'Q1?', a: 'A1' },
        { q: 'Q2?', a: 'A2' },
        { q: 'Q3?', a: 'A3' },
        { q: 'Q4?', a: 'A4' },
      ],
      relatedTools: [],
      category: 'dev',
      contentVersion: 1,
      stats: [{ label: 'Algorithmen', value: '5' }],
    });
    expect(result.stats![0].unit).toBeUndefined();
  });
});
