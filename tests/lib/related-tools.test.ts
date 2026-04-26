/**
 * tests/lib/related-tools.test.ts
 *
 * Tests for src/lib/related-tools.ts — computeRelatedTools()
 *
 * Coverage:
 *  - Returns tools in the same category
 *  - Excludes the current tool from results
 *  - Respects maxCount
 *  - Returns empty array when no category
 *  - Symmetry: if A→B then B→A
 */

import { describe, it, expect } from 'vitest';
import { computeRelatedTools } from '../../src/lib/related-tools';
import type { ToolListItem } from '../../src/lib/tools/list';

function item(toolId: string, category: string): ToolListItem {
  return {
    toolId,
    title: toolId,
    shortTitle: toolId,
    tagline: '',
    href: `/de/${toolId}`,
    category: category as any,
  };
}

const FINANCE_TOOLS = [
  item('vat-calculator', 'finance'),
  item('discount-calculator', 'finance'),
  item('interest-calculator', 'finance'),
  item('loan-calculator', 'finance'),
  item('roi-calculator', 'finance'),
  item('compound-interest-calculator', 'finance'),
];

const LENGTH_TOOLS = [
  item('meter-to-feet', 'length'),
  item('cm-to-inch', 'length'),
  item('km-to-mile', 'length'),
];

const ALL = [...FINANCE_TOOLS, ...LENGTH_TOOLS];

describe('computeRelatedTools', () => {
  it('returns tools with the same category', () => {
    const result = computeRelatedTools('vat-calculator', 'finance', ALL);
    expect(result.every((t) => t.category === 'finance')).toBe(true);
  });

  it('excludes the current tool', () => {
    const result = computeRelatedTools('vat-calculator', 'finance', ALL);
    expect(result.find((t) => t.toolId === 'vat-calculator')).toBeUndefined();
  });

  it('respects maxCount', () => {
    const result = computeRelatedTools('vat-calculator', 'finance', ALL, 3);
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('returns empty array when category is undefined', () => {
    const result = computeRelatedTools('vat-calculator', undefined, ALL);
    expect(result).toHaveLength(0);
  });

  it('returns empty array when no tools in category exist', () => {
    const result = computeRelatedTools('vat-calculator', 'finance', LENGTH_TOOLS);
    expect(result).toHaveLength(0);
  });

  it('does not return tools from other categories', () => {
    const result = computeRelatedTools('vat-calculator', 'finance', ALL);
    expect(result.find((t) => t.category === 'length')).toBeUndefined();
  });
});

describe('computeRelatedTools — symmetry property (T3.3)', () => {
  it('if A appears in related(B), then B appears in related(A)', () => {
    for (let i = 0; i < FINANCE_TOOLS.length; i++) {
      const toolA = FINANCE_TOOLS[i]!;
      const relatedOfA = computeRelatedTools(toolA.toolId, toolA.category, ALL);

      for (const toolB of relatedOfA) {
        const relatedOfB = computeRelatedTools(toolB.toolId, toolB.category, ALL);
        const hasA = relatedOfB.some((t) => t.toolId === toolA.toolId);
        expect(hasA).toBe(true);
      }
    }
  });

  it('cross-category tools are never related to each other', () => {
    const financeResult = computeRelatedTools('vat-calculator', 'finance', ALL);
    const lengthResult = computeRelatedTools('meter-to-feet', 'length', ALL);

    const financeIds = new Set(financeResult.map((t) => t.toolId));
    const lengthIds = new Set(lengthResult.map((t) => t.toolId));

    // No overlap between finance and length related lists
    for (const id of financeIds) {
      expect(lengthIds.has(id)).toBe(false);
    }
  });
});
