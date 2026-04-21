import { describe, it, expect } from 'vitest';
import { hashGenerator, computeHash, HASH_ALGORITHMS } from '../../../src/lib/tools/hash-generator';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('hashGenerator config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(hashGenerator);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(hashGenerator.id).toBe('hash-generator');
    expect(hashGenerator.type).toBe('formatter');
    expect(hashGenerator.categoryId).toBe('dev');
    expect(hashGenerator.mode).toBe('custom');
  });

  it('rejects invalid modification', () => {
    const broken = { ...hashGenerator, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('computeHash — known vectors', () => {
  // Reference vectors computed with Node.js crypto / standard tools

  it('MD5 of empty string', () => {
    expect(computeHash('md5', '')).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });

  it('MD5 of "Hallo"', () => {
    expect(computeHash('md5', 'Hallo')).toBe('d1bf93299de1b68e6d382c893bf1215f');
  });

  it('SHA-1 of empty string', () => {
    expect(computeHash('sha1', '')).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709');
  });

  it('SHA-1 of "Hallo"', () => {
    expect(computeHash('sha1', 'Hallo')).toBe('59d9a6df06b9f610f7db8e036896ed03662d168f');
  });

  it('SHA-256 of empty string', () => {
    expect(computeHash('sha256', '')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });

  it('SHA-256 of "Hallo"', () => {
    expect(computeHash('sha256', 'Hallo')).toBe(
      '753692ec36adb4c794c973945eb2a99c1649703ea6f76bf259abb4fb838e013e',
    );
  });

  it('SHA-384 of empty string', () => {
    expect(computeHash('sha384', '')).toBe(
      '38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b',
    );
  });

  it('SHA-512 of empty string', () => {
    expect(computeHash('sha512', '')).toBe(
      'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e',
    );
  });

  it('SHA-256 of "test"', () => {
    expect(computeHash('sha256', 'test')).toBe(
      '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    );
  });
});

describe('computeHash — output lengths', () => {
  for (const algo of HASH_ALGORITHMS) {
    it(`${algo.label} produces ${algo.hexLen} hex characters`, () => {
      const result = computeHash(algo.id, 'test-input');
      expect(result).toHaveLength(algo.hexLen);
      expect(result).toMatch(/^[0-9a-f]+$/);
    });
  }
});

describe('computeHash — all algorithms produce non-empty hex for non-empty input', () => {
  for (const algo of HASH_ALGORITHMS) {
    it(`${algo.label} produces valid hex for "hello world"`, () => {
      const result = computeHash(algo.id, 'hello world');
      expect(result.length).toBeGreaterThan(0);
      expect(result).toMatch(/^[0-9a-f]+$/);
    });
  }
});

describe('hashGenerator format function', () => {
  it('outputs all five algorithms labelled', () => {
    const output = hashGenerator.format('test');
    expect(output).toContain('MD5:');
    expect(output).toContain('SHA-1:');
    expect(output).toContain('SHA-256:');
    expect(output).toContain('SHA-384:');
    expect(output).toContain('SHA-512:');
  });

  it('throws on empty input', () => {
    expect(() => hashGenerator.format('')).toThrow('Bitte Text eingeben');
    expect(() => hashGenerator.format('   ')).toThrow('Bitte Text eingeben');
  });

  it('trims whitespace before hashing', () => {
    const withSpaces = hashGenerator.format('  test  ');
    const without = hashGenerator.format('test');
    expect(withSpaces).toBe(without);
  });
});
