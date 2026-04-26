import { describe, it, expect } from 'vitest';
import { TOOL_CATEGORIES } from '../../../src/lib/tools/categories';

describe('TOOL_CATEGORIES taxonomy', () => {
  it('contains exactly 25 categories', () => {
    expect(TOOL_CATEGORIES).toHaveLength(25);
  });

  it('all entries are unique', () => {
    expect(new Set(TOOL_CATEGORIES).size).toBe(TOOL_CATEGORIES.length);
  });

  it('all entries are kebab-case', () => {
    for (const c of TOOL_CATEGORIES) {
      expect(c).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it('includes the unit-split set (length, weight, area, volume, distance)', () => {
    for (const c of ['length', 'weight', 'area', 'volume', 'distance']) {
      expect(TOOL_CATEGORIES).toContain(c);
    }
  });
});
