import { describe, it, expect } from 'vitest';
import { textDiff } from '../../../src/lib/tools/text-diff';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('textDiff config', () => {
  it('parses as valid ComparerConfig', () => {
    const r = parseToolConfig(textDiff);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(textDiff.id).toBe('text-diff');
    expect(textDiff.type).toBe('comparer');
    expect(textDiff.categoryId).toBe('text');
    expect(textDiff.diffMode).toBe('text');
  });

  it('rejects invalid modification', () => {
    const broken = { ...textDiff, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('textDiff diff', () => {
  it('returns all unchanged lines for identical texts', () => {
    const text = 'hallo\nwelt';
    const result = textDiff.diff(text, text);
    expect(result).toBe('  hallo\n  welt');
  });

  it('marks added lines with + prefix', () => {
    const result = textDiff.diff('', 'neue zeile');
    expect(result).toContain('+ neue zeile');
  });

  it('marks removed lines with - prefix', () => {
    const result = textDiff.diff('alte zeile', '');
    expect(result).toContain('- alte zeile');
  });

  it('shows changed line as removal + addition', () => {
    const result = textDiff.diff('hallo\nwelt', 'hallo\nerde');
    const lines = result.split('\n');
    expect(lines[0]).toBe('  hallo');
    expect(lines).toContain('- welt');
    expect(lines).toContain('+ erde');
  });

  it('handles multi-line additions', () => {
    const a = 'zeile 1\nzeile 3';
    const b = 'zeile 1\nzeile 2\nzeile 3';
    const result = textDiff.diff(a, b);
    expect(result).toContain('  zeile 1');
    expect(result).toContain('+ zeile 2');
    expect(result).toContain('  zeile 3');
  });

  it('handles multi-line removals', () => {
    const a = 'zeile 1\nzeile 2\nzeile 3';
    const b = 'zeile 1\nzeile 3';
    const result = textDiff.diff(a, b);
    expect(result).toContain('  zeile 1');
    expect(result).toContain('- zeile 2');
    expect(result).toContain('  zeile 3');
  });

  it('normalises \\r\\n to \\n before comparing', () => {
    const a = 'hallo\r\nwelt';
    const b = 'hallo\nwelt';
    const result = textDiff.diff(a, b);
    expect(result).toBe('  hallo\n  welt');
  });

  it('handles both fields empty', () => {
    const result = textDiff.diff('', '');
    expect(result).toBe('  ');
  });

  it('handles unicode and emojis', () => {
    const a = 'Ärger mit Ü\n🎉 Party';
    const b = 'Ärger mit Ü\n🎊 Feier';
    const result = textDiff.diff(a, b);
    expect(result).toContain('  Ärger mit Ü');
    expect(result).toContain('- 🎉 Party');
    expect(result).toContain('+ 🎊 Feier');
  });

  it('handles whitespace-only changes', () => {
    const a = 'a b c';
    const b = 'a  b c';
    const result = textDiff.diff(a, b);
    expect(result).toContain('- a b c');
    expect(result).toContain('+ a  b c');
  });
});
