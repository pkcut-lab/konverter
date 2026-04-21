import { describe, it, expect } from 'vitest';
import {
  loremIpsumGenerator,
  parseInput,
  generate,
  pickWords,
  buildSentence,
  buildParagraph,
} from '../../../src/lib/tools/lorem-ipsum-generator';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('loremIpsumGenerator config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(loremIpsumGenerator);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(loremIpsumGenerator.id).toBe('lorem-ipsum-generator');
    expect(loremIpsumGenerator.type).toBe('formatter');
    expect(loremIpsumGenerator.categoryId).toBe('text');
    expect(loremIpsumGenerator.mode).toBe('custom');
  });
});

describe('parseInput', () => {
  it('parses "5 absätze deutsch"', () => {
    const result = parseInput('5 absätze deutsch');
    expect(result).toEqual({ count: 5, unit: 'paragraphs', variant: 'german' });
  });

  it('parses "10 sätze latein"', () => {
    const result = parseInput('10 sätze latein');
    expect(result).toEqual({ count: 10, unit: 'sentences', variant: 'latin' });
  });

  it('parses "20 wörter"', () => {
    const result = parseInput('20 wörter');
    expect(result).toEqual({ count: 20, unit: 'words', variant: 'latin' });
  });

  it('defaults to paragraphs and latin with just a number', () => {
    const result = parseInput('3');
    expect(result).toEqual({ count: 3, unit: 'paragraphs', variant: 'latin' });
  });

  it('throws on empty input', () => {
    expect(() => parseInput('')).toThrow('Bitte');
    expect(() => parseInput('   ')).toThrow('Bitte');
  });

  it('throws when no number is found', () => {
    expect(() => parseInput('absätze deutsch')).toThrow('Keine Zahl');
  });

  it('throws on count below 1', () => {
    expect(() => parseInput('0 absätze')).toThrow('zwischen 1 und 50');
  });

  it('throws on count above 50', () => {
    expect(() => parseInput('51 absätze')).toThrow('zwischen 1 und 50');
  });

  it('parses English-style keywords', () => {
    expect(parseInput('5 paragraphs german')).toEqual({
      count: 5,
      unit: 'paragraphs',
      variant: 'german',
    });
    expect(parseInput('10 sentences latin')).toEqual({
      count: 10,
      unit: 'sentences',
      variant: 'latin',
    });
    expect(parseInput('20 words')).toEqual({
      count: 20,
      unit: 'words',
      variant: 'latin',
    });
  });
});

describe('pickWords', () => {
  const pool = ['alpha', 'beta', 'gamma'];

  it('returns the requested number of words', () => {
    expect(pickWords(pool, 5)).toHaveLength(5);
    expect(pickWords(pool, 1)).toHaveLength(1);
  });

  it('cycles through the pool for large counts', () => {
    const words = pickWords(pool, 10);
    expect(words).toHaveLength(10);
    // All words should come from the pool
    words.forEach((w) => expect(pool).toContain(w));
  });
});

describe('buildSentence', () => {
  const pool = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur',
    'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt',
    'ut', 'labore', 'et'];

  it('starts with an uppercase letter', () => {
    const sentence = buildSentence(pool);
    expect(sentence[0]).toMatch(/[A-Z]/);
  });

  it('ends with a period', () => {
    const sentence = buildSentence(pool);
    expect(sentence).toMatch(/\.$/);
  });

  it('contains at least 5 words', () => {
    const sentence = buildSentence(pool);
    const wordCount = sentence.replace(/\.$/, '').split(/\s+/).length;
    expect(wordCount).toBeGreaterThanOrEqual(5);
  });
});

describe('buildParagraph', () => {
  const pool = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur',
    'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt',
    'ut', 'labore', 'et'];

  it('contains multiple sentences (at least 3)', () => {
    const para = buildParagraph(pool);
    // Count periods as proxy for sentence count
    const periods = (para.match(/\./g) || []).length;
    expect(periods).toBeGreaterThanOrEqual(3);
  });

  it('produces non-empty text', () => {
    expect(buildParagraph(pool).length).toBeGreaterThan(0);
  });
});

describe('generate', () => {
  it('generates paragraphs with paragraph separators', () => {
    const text = generate({ count: 3, unit: 'paragraphs', variant: 'latin' });
    // 3 paragraphs = 2 double-newline separators (before stats line)
    const mainText = text.split('\n\n--- Statistik')[0];
    const paragraphs = mainText.split('\n\n');
    expect(paragraphs).toHaveLength(3);
  });

  it('generates the requested number of words', () => {
    const text = generate({ count: 20, unit: 'words', variant: 'latin' });
    const mainText = text.split('\n\n--- Statistik')[0];
    const words = mainText.split(/\s+/).filter((w) => w.length > 0);
    expect(words).toHaveLength(20);
  });

  it('includes statistics line', () => {
    const text = generate({ count: 1, unit: 'paragraphs', variant: 'latin' });
    expect(text).toContain('--- Statistik:');
    expect(text).toMatch(/\d+ Wörter/);
    expect(text).toMatch(/\d+ Zeichen/);
  });

  it('german variant includes umlauts', () => {
    // Generate enough text to statistically guarantee umlauts appear
    const text = generate({ count: 5, unit: 'paragraphs', variant: 'german' });
    expect(text).toMatch(/[äöüßÄÖÜ]/);
  });

  it('handles count=1 (edge case)', () => {
    const text = generate({ count: 1, unit: 'paragraphs', variant: 'latin' });
    expect(text).toContain('--- Statistik:');
    const mainText = text.split('\n\n--- Statistik')[0];
    expect(mainText.length).toBeGreaterThan(0);
  });

  it('handles count=50 (edge case)', () => {
    const text = generate({ count: 50, unit: 'words', variant: 'latin' });
    const mainText = text.split('\n\n--- Statistik')[0];
    const words = mainText.split(/\s+/).filter((w) => w.length > 0);
    expect(words).toHaveLength(50);
  });

  it('word count varies with different count parameters', () => {
    const small = generate({ count: 1, unit: 'paragraphs', variant: 'latin' });
    const large = generate({ count: 5, unit: 'paragraphs', variant: 'latin' });
    expect(large.length).toBeGreaterThan(small.length);
  });
});

describe('format function (integration)', () => {
  it('generates latin text from "3 absätze"', () => {
    const result = loremIpsumGenerator.format('3 absätze');
    expect(result).toContain('--- Statistik:');
    expect(result.length).toBeGreaterThan(50);
  });

  it('generates german text from "5 absätze deutsch"', () => {
    const result = loremIpsumGenerator.format('5 absätze deutsch');
    expect(result).toMatch(/[äöüßÄÖÜ]/);
    expect(result).toContain('--- Statistik:');
  });

  it('generates words from "10 wörter"', () => {
    const result = loremIpsumGenerator.format('10 wörter');
    expect(result).toContain('--- Statistik:');
  });

  it('throws on empty input', () => {
    expect(() => loremIpsumGenerator.format('')).toThrow('Bitte');
    expect(() => loremIpsumGenerator.format('   ')).toThrow('Bitte');
  });

  it('throws on out-of-range count', () => {
    expect(() => loremIpsumGenerator.format('0')).toThrow('zwischen 1 und 50');
    expect(() => loremIpsumGenerator.format('51 wörter')).toThrow('zwischen 1 und 50');
  });
});
