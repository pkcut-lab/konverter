import { describe, it, expect } from 'vitest';
import { regexTester } from '../../../src/lib/tools/regex-tester';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('regexTester config', () => {
  it('parses as valid ValidatorConfig', () => {
    const r = parseToolConfig(regexTester);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(regexTester.id).toBe('regex-tester');
    expect(regexTester.type).toBe('validator');
    expect(regexTester.categoryId).toBe('dev');
  });

  it('rejects invalid modification', () => {
    const broken = { ...regexTester, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('regexTester validate', () => {
  it('accepts a valid simple pattern', () => {
    expect(regexTester.validate('^hello$')).toBe(true);
  });

  it('accepts a pattern with character class', () => {
    expect(regexTester.validate('[a-zA-Z0-9]+')).toBe(true);
  });

  it('accepts a pattern with named capture group', () => {
    expect(regexTester.validate('(?<year>\\d{4})-(?<month>\\d{2})')).toBe(true);
  });

  it('accepts a pattern with lookahead', () => {
    expect(regexTester.validate('foo(?=bar)')).toBe(true);
  });

  it('accepts a pattern with lookbehind', () => {
    expect(regexTester.validate('(?<=@)\\w+')).toBe(true);
  });

  it('accepts an empty pattern', () => {
    expect(regexTester.validate('')).toBe(true);
  });

  it('rejects unbalanced parenthesis', () => {
    expect(regexTester.validate('(abc')).toBe(false);
  });

  it('rejects invalid character class', () => {
    expect(regexTester.validate('[z-a]')).toBe(false);
  });

  it('rejects lone trailing backslash', () => {
    expect(regexTester.validate('abc\\')).toBe(false);
  });

  it('accepts unicode property escape', () => {
    expect(regexTester.validate('\\p{Letter}')).toBe(true);
  });
});
