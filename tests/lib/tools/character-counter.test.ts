import { describe, it, expect } from 'vitest';
import { characterCounter } from '../../../src/lib/tools/character-counter';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('characterCounter config', () => {
  it('parses as valid AnalyzerConfig', () => {
    const r = parseToolConfig(characterCounter);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(characterCounter.id).toBe('character-counter');
    expect(characterCounter.type).toBe('analyzer');
    expect(characterCounter.categoryId).toBe('text');
  });

  it('has at least 1 metric', () => {
    expect(characterCounter.metrics.length).toBeGreaterThanOrEqual(1);
  });

  it('includes core metrics', () => {
    const ids = characterCounter.metrics.map((m) => m.id);
    expect(ids).toContain('chars');
    expect(ids).toContain('chars-no-spaces');
    expect(ids).toContain('words');
    expect(ids).toContain('reading-time');
  });

  it('rejects invalid modification (empty categoryId)', () => {
    const broken = { ...characterCounter, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('rejects invalid modification (empty metrics)', () => {
    const broken = { ...characterCounter, metrics: [] };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});
