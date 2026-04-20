import { describe, it, expect } from 'vitest';
// @ts-expect-error — .mjs import without types is fine here
import { scrub, totalHits, PATTERNS, PII_SCRUB_VERSION } from '../../scripts/pii-scrub.mjs';

describe('pii-scrub', () => {
  it('exports a version string', () => {
    expect(typeof PII_SCRUB_VERSION).toBe('string');
    expect(PII_SCRUB_VERSION).toMatch(/^\d+\.\d+/);
  });

  it('replaces reddit-user handles', () => {
    const { text, counts } = scrub('Posted by u/user42 yesterday');
    expect(text).toBe('Posted by [reddit-user] yesterday');
    expect(counts['reddit-user']).toBe(1);
  });

  it('replaces email addresses', () => {
    const { text, counts } = scrub('Contact alice@example.com or bob+news@sub.co.uk');
    expect(text).toContain('[email]');
    expect(text).not.toContain('alice@example.com');
    expect(counts.email).toBe(2);
  });

  it('replaces trustpilot-style author signatures', () => {
    const { text } = scrub('posted by Max Mustermann');
    expect(text).toBe('posted by [author]');
  });

  it('replaces reddit/twitter profile URLs', () => {
    const { text } = scrub('See https://reddit.com/u/someone or https://x.com/handle');
    expect(text).toContain('[profile-url]');
    expect(text).not.toContain('reddit.com/u/someone');
    expect(text).not.toContain('x.com/handle');
  });

  it('leaves clean text untouched', () => {
    const input = 'Dies ist ein normaler Satz ohne PII.';
    const { text, counts } = scrub(input);
    expect(text).toBe(input);
    expect(totalHits(counts)).toBe(0);
  });

  it('handles multiple PII types in one string', () => {
    const input = 'u/alice at alice@foo.com +49 30 12345678';
    const { text, counts } = scrub(input);
    expect(text).toContain('[reddit-user]');
    expect(text).toContain('[email]');
    expect(text).toContain('[phone]');
    expect(totalHits(counts)).toBeGreaterThanOrEqual(3);
  });

  it('rejects non-string input', () => {
    expect(() => scrub(null as unknown as string)).toThrow(TypeError);
    expect(() => scrub(42 as unknown as string)).toThrow(TypeError);
  });

  it('is pure (does not mutate input)', () => {
    const input = 'Find u/user42 now';
    const copy = input;
    scrub(input);
    expect(input).toBe(copy);
  });

  it('exports PATTERNS array with name+regex+replace shape', () => {
    expect(Array.isArray(PATTERNS)).toBe(true);
    for (const p of PATTERNS) {
      expect(typeof p.name).toBe('string');
      expect(p.regex).toBeInstanceOf(RegExp);
      expect(p.replace).toBeDefined();
    }
  });
});
