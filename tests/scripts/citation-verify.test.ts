import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, rmSync, mkdirSync, existsSync } from 'node:fs';
// @ts-expect-error — .mjs import without types is fine here
import {
  verifyQuote,
  verifyDossier,
  extractQuotes,
  normalize,
  bigramJaccard,
  levenshtein,
} from '../../scripts/citation-verify.mjs';

const TMP_DIR = 'tests/.tmp-citation';
const DOSSIER = `${TMP_DIR}/dossier.md`;

describe('citation-verify — helpers', () => {
  it('normalize lowercases, collapses whitespace, strips punctuation', () => {
    expect(normalize('  Hello,   WORLD!!  ')).toBe('hello world');
  });

  it('bigramJaccard returns 1 for identical strings', () => {
    expect(bigramJaccard('testing', 'testing')).toBe(1);
  });

  it('bigramJaccard returns 0 for disjoint inputs', () => {
    expect(bigramJaccard('abcdef', 'xyzuvw')).toBe(0);
  });

  it('bigramJaccard is between 0 and 1 for partial overlap', () => {
    const s = bigramJaccard('privacy first', 'privacy focused');
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThan(1);
  });

  it('levenshtein: windowed distance is 0 when a is substring of b', () => {
    expect(levenshtein('quick fox', 'the quick fox jumps')).toBe(0);
  });

  it('levenshtein: distance scales with typos', () => {
    const d = levenshtein('privacy', 'privvcy');
    expect(d).toBeGreaterThan(0);
    expect(d).toBeLessThanOrEqual(2);
  });
});

describe('citation-verify — verifyQuote', () => {
  const source = 'We offer a free, privacy-first image converter with no server upload.';

  it('passes (method=substring) on exact match after normalization', () => {
    const res = verifyQuote('Privacy-first image converter', source);
    expect(res.status).toBe('pass');
    expect(res.method).toBe('substring');
  });

  it('warns via jaccard for paraphrased quote', () => {
    const res = verifyQuote(
      'privacy first image converter',
      'privacy-first image converter with no upload',
    );
    expect(['pass', 'warned']).toContain(res.status);
  });

  it('fails with no fallback method when quote is completely unrelated', () => {
    const res = verifyQuote('Lorem ipsum dolor sit amet consectetur', source);
    expect(res.status).toBe('failed');
    expect(res.method).toBe('none');
  });
});

describe('citation-verify — extractQuotes', () => {
  it('pulls blockquote citations with German quote marks', () => {
    const md = [
      '# Dossier',
      '',
      '> „Kein Server-Upload ist Pflicht"',
      '>',
      '> — [Beispiel](https://example.com/post)',
      '',
      'Weitere Zeile.',
    ].join('\n');
    const quotes = extractQuotes(md);
    expect(quotes.length).toBe(1);
    expect(quotes[0].quote).toBe('Kein Server-Upload ist Pflicht');
    expect(quotes[0].sourceUrl).toBe('https://example.com/post');
  });

  it('returns empty array when no blockquotes present', () => {
    expect(extractQuotes('# Header\n\nplain paragraph')).toEqual([]);
  });
});

describe('citation-verify — verifyDossier (with injected fetchFn)', () => {
  beforeEach(() => {
    mkdirSync(TMP_DIR, { recursive: true });
  });
  afterEach(() => {
    if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true, force: true });
  });

  it('passes when the quoted substring exists in fetched source', async () => {
    writeFileSync(
      DOSSIER,
      [
        '---',
        'tool: x',
        '---',
        '',
        '> „privacy first without server upload"',
        '>',
        '> — [Bsp](https://ex.com/a)',
        '',
      ].join('\n'),
    );
    const fetchFn = async () => 'Our USP: privacy first without server upload, always client-only.';
    const res = await verifyDossier(DOSSIER, { fetchFn });
    expect(res.ok).toBe(true);
    expect(res.counts.pass).toBe(1);
    expect(res.counts.failed).toBe(0);
  });

  it('fails when quote missing in source and no fuzzy fallback matches', async () => {
    writeFileSync(
      DOSSIER,
      [
        '---',
        'tool: x',
        '---',
        '',
        '> „this specific sentence is absolutely not in source"',
        '>',
        '> — [Bsp](https://ex.com/a)',
        '',
      ].join('\n'),
    );
    const fetchFn = async () => 'Completely unrelated wombat content here.';
    const res = await verifyDossier(DOSSIER, { fetchFn });
    expect(res.ok).toBe(false);
    expect(res.counts.failed).toBe(1);
  });

  it('reports fetch-error when the source URL fails', async () => {
    writeFileSync(
      DOSSIER,
      [
        '---',
        'tool: x',
        '---',
        '',
        '> „anything"',
        '>',
        '> — [Bsp](https://ex.com/a)',
        '',
      ].join('\n'),
    );
    const fetchFn = async () => {
      throw new Error('HTTP 404');
    };
    const res = await verifyDossier(DOSSIER, { fetchFn });
    expect(res.ok).toBe(false);
    expect(res.results[0].method).toBe('fetch-error');
  });

  it('returns error when dossier path does not exist', async () => {
    const res = await verifyDossier(`${TMP_DIR}/nope.md`);
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/file not found/);
  });
});
