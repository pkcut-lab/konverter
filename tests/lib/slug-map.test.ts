import { describe, it, expect } from 'vitest';
import { slugMap, getSlug, getToolId, getSupportedLangs } from '../../src/lib/slug-map';

describe('slugMap', () => {
  it('is an object (may be empty in Phase 0)', () => {
    expect(typeof slugMap).toBe('object');
    expect(slugMap).not.toBeNull();
  });
});

describe('getSlug', () => {
  it('returns undefined for an unknown tool id', () => {
    expect(getSlug('nonexistent-tool-id', 'de')).toBeUndefined();
  });
});

describe('getToolId', () => {
  it('returns undefined for an unknown slug/lang pair', () => {
    expect(getToolId('de', 'nonexistent-slug')).toBeUndefined();
  });
});

describe('getSupportedLangs', () => {
  it('returns an empty array for an unknown tool id', () => {
    expect(getSupportedLangs('nonexistent-tool-id')).toEqual([]);
  });
});

describe('round-trip — synthetic fixture', () => {
  it('getSlug + getToolId are inverse for registered tools', () => {
    // Use real entries once slugMap has any; until then, test the property
    // by inspecting the map's current entries (works even when empty).
    for (const [toolId, perLang] of Object.entries(slugMap)) {
      for (const [lang, slug] of Object.entries(perLang)) {
        expect(getSlug(toolId, lang as 'de')).toBe(slug);
        expect(getToolId(lang as 'de', slug!)).toBe(toolId);
      }
    }
  });
});

describe('slug-map — meter-to-feet entry', () => {
  it('getSlug("meter-to-feet", "de") resolves to "meter-zu-fuss"', () => {
    expect(getSlug('meter-to-feet', 'de')).toBe('meter-zu-fuss');
  });

  it('getToolId("de", "meter-zu-fuss") resolves to "meter-to-feet"', () => {
    expect(getToolId('de', 'meter-zu-fuss')).toBe('meter-to-feet');
  });

  it('getSupportedLangs("meter-to-feet") returns ["de"]', () => {
    expect(getSupportedLangs('meter-to-feet')).toEqual(['de']);
  });
});
