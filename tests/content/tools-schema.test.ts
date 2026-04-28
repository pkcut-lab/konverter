import { describe, it, expect } from 'vitest';
import { toolContentFrontmatterSchema } from '../../src/content/tools.schema';

const valid = {
  toolId: 'meter-to-feet',
  language: 'de' as const,
  title: 'Meter zu Fuß Konverter — Schnell & Genau',
  metaDescription:
    'Wandle Meter in Fuß um. Kostenlos, ohne Anmeldung. Präzise Umrechnung mit Formel, Tabelle und Anwendungsbeispielen für Bauwesen und Luftfahrt heute.',
  tagline: 'Präzise Längen-Umrechnung in Sekunden',
  intro:
    'Meter und Fuß sind die weltweit gebräuchlichsten Längeneinheiten. ' +
    'Dieser Konverter rechnet beide Richtungen exakt und sofort um. ' +
    'Keine Installation, keine Anmeldung nötig. Einfach eintippen.',
  howToUse: ['Wert in Meter eingeben', 'Ergebnis erscheint automatisch', 'Tausch-Button für Umkehr'],
  faq: [
    { q: 'Wie viele Fuß sind ein Meter?', a: 'Ein Meter entspricht 3,28084 Fuß.' },
    { q: 'Ist die Umrechnung exakt?', a: 'Ja, 1 Fuß = 0,3048 Meter exakt seit 1959.' },
    { q: 'Welcher Fuß?', a: 'International foot, identisch mit UK/US seit 1959.' },
    { q: 'Dezimaltrennung?', a: 'Komma deutsch, Punkt englisch.' },
  ],
  relatedTools: ['zentimeter-zu-zoll', 'kilometer-zu-meile', 'meter-zu-yard'],
  category: 'length' as const,
  contentVersion: 1,
};

function makeValidFrontmatter() {
  return {
    toolId: 'demo-tool',
    language: 'de' as const,
    title: 'Demo-Titel der exakt die Mindest-Länge trifft',
    metaDescription: 'a'.repeat(150),
    tagline: 'Demo-Tagline.',
    intro: 'Demo-Intro.',
    howToUse: ['step1', 'step2', 'step3'],
    faq: [
      { q: 'q1', a: 'a1' },
      { q: 'q2', a: 'a2' },
      { q: 'q3', a: 'a3' },
      { q: 'q4', a: 'a4' },
    ],
    relatedTools: ['a', 'b', 'c'],
    category: 'length' as const,
    contentVersion: 1,
  };
}

describe('toolContentFrontmatterSchema', () => {
  it('accepts a minimal valid frontmatter', () => {
    const r = toolContentFrontmatterSchema.safeParse(valid);
    expect(r.success).toBe(true);
  });

  it('rejects title shorter than 30 chars', () => {
    const r = toolContentFrontmatterSchema.safeParse({ ...valid, title: 'Zu kurz' });
    expect(r.success).toBe(false);
  });

  it('rejects title longer than 60 chars', () => {
    const r = toolContentFrontmatterSchema.safeParse({
      ...valid,
      title: 'X'.repeat(61),
    });
    expect(r.success).toBe(false);
  });

  it('rejects metaDescription outside 140-220 chars', () => {
    const tooShort = toolContentFrontmatterSchema.safeParse({ ...valid, metaDescription: 'zu kurz' });
    const tooLong = toolContentFrontmatterSchema.safeParse({ ...valid, metaDescription: 'X'.repeat(221) });
    expect(tooShort.success).toBe(false);
    expect(tooLong.success).toBe(false);
  });

  it('rejects fewer than 3 howToUse steps', () => {
    const r = toolContentFrontmatterSchema.safeParse({ ...valid, howToUse: ['a', 'b'] });
    expect(r.success).toBe(false);
  });

  it('rejects more than 5 howToUse steps', () => {
    const r = toolContentFrontmatterSchema.safeParse({
      ...valid,
      howToUse: ['a', 'b', 'c', 'd', 'e', 'f'],
    });
    expect(r.success).toBe(false);
  });

  it('rejects fewer than 4 FAQ entries', () => {
    const r = toolContentFrontmatterSchema.safeParse({ ...valid, faq: valid.faq.slice(0, 3) });
    expect(r.success).toBe(false);
  });

  it('rejects more than 12 FAQ entries', () => {
    // Schema max bumped 6 → 12 to fit deep-content tools (HEIC, video-bg-remove)
    // where the long-tail of distinct user concerns exceeds 6.
    const thirteen = Array.from({ length: 13 }, (_, i) => valid.faq[i % valid.faq.length]!);
    const r = toolContentFrontmatterSchema.safeParse({ ...valid, faq: thirteen });
    expect(r.success).toBe(false);
  });

  it('accepts fewer than 3 relatedTools (fallback-füllt auf)', () => {
    const r = toolContentFrontmatterSchema.safeParse({ ...valid, relatedTools: ['a', 'b'] });
    expect(r.success).toBe(true);
  });

  it('rejects more than 5 relatedTools', () => {
    const r = toolContentFrontmatterSchema.safeParse({
      ...valid,
      relatedTools: ['a', 'b', 'c', 'd', 'e', 'f'],
    });
    expect(r.success).toBe(false);
  });

  it('rejects language not in ACTIVE_LANGUAGES', () => {
    const r = toolContentFrontmatterSchema.safeParse({ ...valid, language: 'fr' });
    expect(r.success).toBe(false);
  });

  it('rejects contentVersion < 1', () => {
    const r = toolContentFrontmatterSchema.safeParse({ ...valid, contentVersion: 0 });
    expect(r.success).toBe(false);
  });

  it('accepts optional category from TOOL_CATEGORIES enum', () => {
    const base = makeValidFrontmatter();
    const result = toolContentFrontmatterSchema.safeParse({ ...base, category: 'length' });
    expect(result.success).toBe(true);
  });

  it('rejects category values outside TOOL_CATEGORIES', () => {
    const base = makeValidFrontmatter();
    const result = toolContentFrontmatterSchema.safeParse({ ...base, category: 'not-a-category' });
    expect(result.success).toBe(false);
  });

  it('accepts relatedTools of length 0 (fallback-fähig)', () => {
    const base = makeValidFrontmatter();
    const result = toolContentFrontmatterSchema.safeParse({ ...base, relatedTools: [] });
    expect(result.success).toBe(true);
  });

  it('still rejects relatedTools of length 6 (hard cap at 5)', () => {
    const base = makeValidFrontmatter();
    const six = ['a', 'b', 'c', 'd', 'e', 'f'];
    const result = toolContentFrontmatterSchema.safeParse({ ...base, relatedTools: six });
    expect(result.success).toBe(false);
  });

  it('rejects frontmatter without `category`', () => {
    const base = makeValidFrontmatter();
    const { category: _omitted, ...withoutCategory } = base;
    const result = toolContentFrontmatterSchema.safeParse(withoutCategory);
    expect(result.success).toBe(false);
  });
});
