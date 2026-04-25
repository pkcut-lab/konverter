import { describe, it, expect } from 'vitest';
import { parseToolConfig } from '../../../src/lib/tools/schemas';
import { pdfAufteilen } from '../../../src/lib/tools/pdf-aufteilen';
import {
  parsePageRanges,
  totalPagesInRanges,
  formatFileSize,
  formatRangeLabel,
  derivePerRangeFilename,
  deriveSingleOutputFilename,
} from '../../../src/lib/tools/pdf-split-utils';

describe('pdf-aufteilen config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(pdfAufteilen);
    expect(r.ok).toBe(true);
  });

  it('has correct id and type', () => {
    expect(pdfAufteilen.id).toBe('pdf-split');
    expect(pdfAufteilen.type).toBe('formatter');
    expect(pdfAufteilen.mode).toBe('custom');
  });

  it('has document categoryId', () => {
    expect(pdfAufteilen.categoryId).toBe('document');
  });

  it('format function is callable and returns identity', () => {
    expect(pdfAufteilen.format('hello')).toBe('hello');
    expect(pdfAufteilen.format('')).toBe('');
  });

  it('rejects modification (empty id)', () => {
    const broken = { ...pdfAufteilen, id: '' };
    expect(parseToolConfig(broken).ok).toBe(false);
  });

  it('rejects modification (wrong mode)', () => {
    const broken = { ...pdfAufteilen, mode: 'unknown' as never };
    expect(parseToolConfig(broken).ok).toBe(false);
  });
});

describe('parsePageRanges — happy paths', () => {
  it('parses single page', () => {
    const r = parsePageRanges('5', 10);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.ranges).toEqual([{ start: 5, end: 5 }]);
  });

  it('parses simple range', () => {
    const r = parsePageRanges('1-3', 10);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.ranges).toEqual([{ start: 1, end: 3 }]);
  });

  it('parses combined ranges with whitespace', () => {
    const r = parsePageRanges('1-3, 5, 7-9', 10);
    expect(r.ok).toBe(true);
    if (r.ok)
      expect(r.ranges).toEqual([
        { start: 1, end: 3 },
        { start: 5, end: 5 },
        { start: 7, end: 9 },
      ]);
  });

  it('parses range with whitespace around dash', () => {
    const r = parsePageRanges('5 - 7', 10);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.ranges).toEqual([{ start: 5, end: 7 }]);
  });

  it('preserves duplicate page entries', () => {
    const r = parsePageRanges('1, 1, 1', 10);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.ranges.length).toBe(3);
  });

  it('ignores trailing comma', () => {
    const r = parsePageRanges('1-3,', 10);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.ranges).toEqual([{ start: 1, end: 3 }]);
  });

  it('preserves user-input range order', () => {
    const r = parsePageRanges('5, 1, 3', 10);
    expect(r.ok).toBe(true);
    if (r.ok)
      expect(r.ranges.map((x) => x.start)).toEqual([5, 1, 3]);
  });
});

describe('parsePageRanges — error paths', () => {
  it('rejects empty input', () => {
    const r = parsePageRanges('', 10);
    expect(r.ok).toBe(false);
  });

  it('rejects whitespace-only input', () => {
    const r = parsePageRanges('   ', 10);
    expect(r.ok).toBe(false);
  });

  it('rejects 0 as page number', () => {
    const r = parsePageRanges('0', 10);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/beginnen bei 1/);
  });

  it('rejects negative page number', () => {
    const r = parsePageRanges('-3', 10);
    expect(r.ok).toBe(false);
  });

  it('rejects non-numeric token', () => {
    const r = parsePageRanges('a-b', 10);
    expect(r.ok).toBe(false);
  });

  it('rejects reverse range like 5-3', () => {
    const r = parsePageRanges('5-3', 10);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/Startseite/);
  });

  it('rejects out-of-bounds range', () => {
    const r = parsePageRanges('1-99', 10);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/existiert nicht/);
  });

  it('rejects out-of-bounds single page', () => {
    const r = parsePageRanges('99', 10);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/existiert nicht/);
  });

  it('rejects three-part token like 1-2-3', () => {
    const r = parsePageRanges('1-2-3', 10);
    expect(r.ok).toBe(false);
  });

  it('rejects input over 500 chars', () => {
    const r = parsePageRanges('1,'.repeat(300), 10);
    expect(r.ok).toBe(false);
  });

  it('rejects when totalPages is invalid', () => {
    const r = parsePageRanges('1', 0);
    expect(r.ok).toBe(false);
  });
});

describe('parsePageRanges — boundary tests', () => {
  it('accepts first page', () => {
    const r = parsePageRanges('1', 10);
    expect(r.ok).toBe(true);
  });

  it('accepts last page', () => {
    const r = parsePageRanges('10', 10);
    expect(r.ok).toBe(true);
  });

  it('accepts full document range', () => {
    const r = parsePageRanges('1-10', 10);
    expect(r.ok).toBe(true);
  });

  it('accepts single-page document with range "1"', () => {
    const r = parsePageRanges('1', 1);
    expect(r.ok).toBe(true);
  });
});

describe('totalPagesInRanges', () => {
  it('returns 0 for empty list', () => {
    expect(totalPagesInRanges([])).toBe(0);
  });

  it('sums page counts including duplicates', () => {
    expect(
      totalPagesInRanges([
        { start: 1, end: 3 },
        { start: 5, end: 5 },
        { start: 7, end: 9 },
      ]),
    ).toBe(7);
  });

  it('counts single-page range as 1', () => {
    expect(totalPagesInRanges([{ start: 5, end: 5 }])).toBe(1);
  });
});

describe('formatRangeLabel', () => {
  it('formats single page as plain number', () => {
    expect(formatRangeLabel({ start: 5, end: 5 })).toBe('5');
  });

  it('formats range with en-dash', () => {
    expect(formatRangeLabel({ start: 1, end: 3 })).toBe('1–3');
  });
});

describe('formatFileSize', () => {
  it('formats sub-KB / KB / MB ranges with NBSP', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(2048)).toBe('2.0 KB');
    expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
  });

  it('handles invalid input safely', () => {
    expect(formatFileSize(-1)).toBe('0 B');
    expect(formatFileSize(NaN)).toBe('0 B');
  });
});

describe('derivePerRangeFilename + deriveSingleOutputFilename', () => {
  it('per-range filename for single-page range', () => {
    expect(derivePerRangeFilename('vertrag.pdf', { start: 5, end: 5 })).toBe(
      'vertrag-seite-5.pdf',
    );
  });

  it('per-range filename for multi-page range', () => {
    expect(derivePerRangeFilename('vertrag.pdf', { start: 3, end: 7 })).toBe(
      'vertrag-seiten-3-7.pdf',
    );
  });

  it('falls back when no source name', () => {
    expect(derivePerRangeFilename(undefined, { start: 1, end: 1 })).toBe(
      'pdf-seite-1.pdf',
    );
  });

  it('handles uppercase .PDF extension', () => {
    expect(derivePerRangeFilename('VERTRAG.PDF', { start: 1, end: 2 })).toBe(
      'VERTRAG-seiten-1-2.pdf',
    );
  });

  it('single-output filename appends -auszug', () => {
    expect(deriveSingleOutputFilename('vertrag.pdf')).toBe('vertrag-auszug.pdf');
    expect(deriveSingleOutputFilename(undefined)).toBe('pdf-auszug.pdf');
  });
});
