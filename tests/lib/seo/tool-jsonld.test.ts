import { describe, it, expect } from 'vitest';
import { buildToolJsonLd } from '../../../src/lib/seo/tool-jsonld';

describe('buildToolJsonLd', () => {
  const content = {
    toolId: 'remove-background',
    lang: 'de',
    title: 'Hintergrund entfernen',
    description: 'Beschreibung',
    faq: [
      { q: 'Funktioniert das offline?', a: 'Ja, nach dem ersten Modell-Download.' },
      { q: 'Ist es kostenlos?', a: 'Ja.' },
    ],
    steps: [
      { title: 'Bild hochladen', description: 'Drag-&-Drop oder Click.' },
      { title: 'Warten', description: 'KI arbeitet 100–200 ms lokal.' },
      { title: 'Download', description: 'PNG mit Transparenz.' },
    ],
  };

  it('emits an array with SoftwareApplication + FAQPage + HowTo @types', () => {
    const out = buildToolJsonLd(content, 'https://example.com/de/hintergrund-entfernen');
    const types = out.map((x) => x['@type']);
    expect(types).toContain('SoftwareApplication');
    expect(types).toContain('FAQPage');
    expect(types).toContain('HowTo');
  });

  it('SoftwareApplication includes name, applicationCategory, offers free', () => {
    const [soft] = buildToolJsonLd(content, 'https://example.com/de/hintergrund-entfernen');
    expect(soft.name).toBe('Hintergrund entfernen');
    expect(soft.applicationCategory).toBe('MultimediaApplication');
    expect((soft.offers as { price: string }).price).toBe('0');
  });

  it('FAQPage mainEntity matches faq length and shape', () => {
    const out = buildToolJsonLd(content, 'https://example.com/x');
    const faq = out.find((x) => x['@type'] === 'FAQPage');
    expect((faq?.mainEntity as unknown[]).length).toBe(2);
  });

  it('HowTo step count matches steps length', () => {
    const out = buildToolJsonLd(content, 'https://example.com/x');
    const howTo = out.find((x) => x['@type'] === 'HowTo');
    expect((howTo?.step as unknown[]).length).toBe(3);
  });

  it('omits FAQPage when faq is empty', () => {
    const out = buildToolJsonLd({ ...content, faq: [] }, 'https://example.com/x');
    expect(out.find((x) => x['@type'] === 'FAQPage')).toBeUndefined();
  });

  it('omits HowTo when steps are empty', () => {
    const out = buildToolJsonLd({ ...content, steps: [] }, 'https://example.com/x');
    expect(out.find((x) => x['@type'] === 'HowTo')).toBeUndefined();
  });
});
