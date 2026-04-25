import { describe, it, expect } from 'vitest';
import { parseToolConfig } from '../../../src/lib/tools/schemas';
import { pdfZusammenfuehren } from '../../../src/lib/tools/pdf-zusammenfuehren';
import {
  isValidPdfMagic,
  formatFileSize,
  deriveOutputFilename,
  totalBytes,
} from '../../../src/lib/tools/pdf-merge-utils';

describe('pdf-zusammenfuehren config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(pdfZusammenfuehren);
    expect(r.ok).toBe(true);
  });

  it('has correct type and mode', () => {
    expect(pdfZusammenfuehren.type).toBe('formatter');
    expect(pdfZusammenfuehren.mode).toBe('custom');
  });

  it('has correct id matching slug-map entry', () => {
    expect(pdfZusammenfuehren.id).toBe('pdf-merge');
  });

  it('has document categoryId', () => {
    expect(pdfZusammenfuehren.categoryId).toBe('document');
  });

  it('format function is callable and returns identity', () => {
    const result = pdfZusammenfuehren.format('test');
    expect(result).toBe('test');
  });

  it('format does not mutate empty input', () => {
    expect(pdfZusammenfuehren.format('')).toBe('');
  });

  it('format preserves unicode + whitespace', () => {
    const input = '  hellö wörld 日本語 \n';
    expect(pdfZusammenfuehren.format(input)).toBe(input);
  });

  it('rejects invalid modification (empty id)', () => {
    const broken = { ...pdfZusammenfuehren, id: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('rejects invalid modification (wrong type)', () => {
    const broken = { ...pdfZusammenfuehren, type: 'unknown' as never };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('rejects modification (missing categoryId)', () => {
    const broken: Record<string, unknown> = { ...pdfZusammenfuehren };
    delete broken.categoryId;
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('pdf-merge-utils — isValidPdfMagic', () => {
  it('accepts canonical PDF magic header bytes', () => {
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]); // "%PDF-1.4"
    expect(isValidPdfMagic(bytes)).toBe(true);
  });

  it('rejects empty buffer', () => {
    expect(isValidPdfMagic(new Uint8Array(0))).toBe(false);
  });

  it('rejects buffer too short to contain magic', () => {
    expect(isValidPdfMagic(new Uint8Array([0x25, 0x50]))).toBe(false);
  });

  it('rejects buffer with wrong leading bytes (e.g. ZIP)', () => {
    // PK\x03\x04… = ZIP / DOCX disguised as .pdf
    const bytes = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x00]);
    expect(isValidPdfMagic(bytes)).toBe(false);
  });

  it('rejects buffer with PDF magic offset by 1 byte (BOM-like prefix)', () => {
    const bytes = new Uint8Array([0xef, 0x25, 0x50, 0x44, 0x46, 0x2d]);
    expect(isValidPdfMagic(bytes)).toBe(false);
  });
});

describe('pdf-merge-utils — formatFileSize', () => {
  it('formats sub-KB as bytes with NBSP between value and unit', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(1023)).toBe('1023 B');
  });

  it('formats KB range with one decimal', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(2048)).toBe('2.0 KB');
    expect(formatFileSize(1024 * 100 + 512)).toBe('100.5 KB');
  });

  it('formats MB range with two decimals', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.00 MB');
  });

  it('handles invalid input safely (negative / NaN / Infinity)', () => {
    expect(formatFileSize(-1)).toBe('0 B');
    expect(formatFileSize(NaN)).toBe('0 B');
    expect(formatFileSize(Infinity)).toBe('0 B');
  });
});

describe('pdf-merge-utils — deriveOutputFilename', () => {
  it('returns default when no input filename', () => {
    expect(deriveOutputFilename(undefined)).toBe('zusammengefuehrt.pdf');
    expect(deriveOutputFilename('')).toBe('zusammengefuehrt.pdf');
  });

  it('strips .pdf extension and appends merge suffix', () => {
    expect(deriveOutputFilename('vertrag.pdf')).toBe('vertrag-zusammengefuehrt.pdf');
    expect(deriveOutputFilename('VERTRAG.PDF')).toBe('VERTRAG-zusammengefuehrt.pdf');
  });

  it('keeps name without extension intact', () => {
    expect(deriveOutputFilename('vertrag')).toBe('vertrag-zusammengefuehrt.pdf');
  });

  it('falls back when stem is empty after stripping extension', () => {
    expect(deriveOutputFilename('.pdf')).toBe('zusammengefuehrt.pdf');
  });
});

describe('pdf-merge-utils — totalBytes', () => {
  it('returns 0 for empty list', () => {
    expect(totalBytes([])).toBe(0);
  });

  it('sums positive sizes', () => {
    expect(totalBytes([100, 200, 300])).toBe(600);
  });

  it('ignores invalid (negative, NaN, Infinity) sizes', () => {
    expect(totalBytes([100, -50, NaN, Infinity, 200])).toBe(300);
  });
});
