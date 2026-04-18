import { describe, it, expect } from 'vitest';
import { toolContentFrontmatterSchema } from '../../src/content/tools.schema';

const valid = {
  slug: 'meter-zu-fuss',
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
  contentVersion: 1,
};

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

  it('rejects metaDescription outside 140-160 chars', () => {
    const tooShort = toolContentFrontmatterSchema.safeParse({ ...valid, metaDescription: 'zu kurz' });
    const tooLong = toolContentFrontmatterSchema.safeParse({ ...valid, metaDescription: 'X'.repeat(161) });
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

  it('rejects more than 6 FAQ entries', () => {
    const seven = [...valid.faq, ...valid.faq, ...valid.faq].slice(0, 7);
    const r = toolContentFrontmatterSchema.safeParse({ ...valid, faq: seven });
    expect(r.success).toBe(false);
  });

  it('rejects fewer than 3 relatedTools', () => {
    const r = toolContentFrontmatterSchema.safeParse({ ...valid, relatedTools: ['a', 'b'] });
    expect(r.success).toBe(false);
  });

  it('rejects more than 5 relatedTools', () => {
    const r = toolContentFrontmatterSchema.safeParse({
      ...valid,
      relatedTools: ['a', 'b', 'c', 'd', 'e', 'f'],
    });
    expect(r.success).toBe(false);
  });

  it('rejects language not in ACTIVE_LANGUAGES', () => {
    const r = toolContentFrontmatterSchema.safeParse({ ...valid, language: 'en' });
    expect(r.success).toBe(false);
  });

  it('rejects non-kebab-case slug', () => {
    const r = toolContentFrontmatterSchema.safeParse({ ...valid, slug: 'Meter_zu_Fuß' });
    expect(r.success).toBe(false);
  });

  it('rejects contentVersion < 1', () => {
    const r = toolContentFrontmatterSchema.safeParse({ ...valid, contentVersion: 0 });
    expect(r.success).toBe(false);
  });
});
