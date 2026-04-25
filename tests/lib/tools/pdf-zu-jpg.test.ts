import { describe, it, expect } from 'vitest';
import { parseToolConfig } from '../../../src/lib/tools/schemas';
import { pdfZuJpg } from '../../../src/lib/tools/pdf-zu-jpg';
import {
  deriveJpgFilename,
  deriveZipFilename,
  estimateJpgSizeBytes,
  formatFileSize,
  dpiToScale,
  dpiLabel,
  buildZipStore,
  DPI_OPTIONS,
} from '../../../src/lib/tools/pdf-zu-jpg-utils';

// ---------------------------------------------------------------------------
// Config tests
// ---------------------------------------------------------------------------

describe('pdf-zu-jpg config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(pdfZuJpg);
    expect(r.ok).toBe(true);
  });

  it('has correct id and type', () => {
    expect(pdfZuJpg.id).toBe('pdf-to-jpg');
    expect(pdfZuJpg.type).toBe('formatter');
    expect(pdfZuJpg.mode).toBe('custom');
  });

  it('has document categoryId', () => {
    expect(pdfZuJpg.categoryId).toBe('document');
  });

  it('format function is callable and returns identity', () => {
    expect(pdfZuJpg.format('hello')).toBe('hello');
    expect(pdfZuJpg.format('')).toBe('');
  });

  it('rejects modification (empty id)', () => {
    const broken = { ...pdfZuJpg, id: '' };
    expect(parseToolConfig(broken).ok).toBe(false);
  });

  it('rejects modification (wrong mode)', () => {
    const broken = { ...pdfZuJpg, mode: 'unknown' as never };
    expect(parseToolConfig(broken).ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deriveJpgFilename
// ---------------------------------------------------------------------------

describe('deriveJpgFilename', () => {
  it('includes base name, zero-padded page, .jpg extension', () => {
    expect(deriveJpgFilename('vertrag.pdf', 1, 5)).toBe('vertrag-seite-1.jpg');
  });

  it('pads with leading zeros for double-digit total', () => {
    expect(deriveJpgFilename('doc.pdf', 3, 10)).toBe('doc-seite-03.jpg');
  });

  it('pads correctly for 100+ pages', () => {
    expect(deriveJpgFilename('bericht.pdf', 7, 100)).toBe('bericht-seite-007.jpg');
  });

  it('falls back when pdfName is undefined', () => {
    expect(deriveJpgFilename(undefined, 1, 1)).toBe('seite-1.jpg');
  });

  it('strips .PDF extension case-insensitively', () => {
    expect(deriveJpgFilename('SCAN.PDF', 2, 5)).toBe('SCAN-seite-2.jpg');
  });

  it('strips mixed-case .Pdf extension', () => {
    expect(deriveJpgFilename('file.Pdf', 1, 1)).toBe('file-seite-1.jpg');
  });
});

// ---------------------------------------------------------------------------
// deriveZipFilename
// ---------------------------------------------------------------------------

describe('deriveZipFilename', () => {
  it('appends -jpg.zip to base name', () => {
    expect(deriveZipFilename('vertrag.pdf')).toBe('vertrag-jpg.zip');
  });

  it('falls back for undefined name', () => {
    expect(deriveZipFilename(undefined)).toBe('pdf-jpg.zip');
  });

  it('strips .PDF extension case-insensitively', () => {
    expect(deriveZipFilename('SCAN.PDF')).toBe('SCAN-jpg.zip');
  });
});

// ---------------------------------------------------------------------------
// estimateJpgSizeBytes + formatFileSize
// ---------------------------------------------------------------------------

describe('estimateJpgSizeBytes', () => {
  it('returns positive value for valid dimensions', () => {
    expect(estimateJpgSizeBytes(1240, 1754)).toBeGreaterThan(0);
  });

  it('returns 0 for zero width', () => {
    expect(estimateJpgSizeBytes(0, 1754)).toBe(0);
  });

  it('returns 0 for zero height', () => {
    expect(estimateJpgSizeBytes(1240, 0)).toBe(0);
  });

  it('A4 at 150 DPI is roughly 200–600 KB (reasonable range)', () => {
    // A4 @150 DPI = 1240×1754 px
    const bytes = estimateJpgSizeBytes(1240, 1754);
    expect(bytes).toBeGreaterThan(100_000);
    expect(bytes).toBeLessThan(1_000_000);
  });
});

describe('formatFileSize', () => {
  it('formats sub-KB', () => {
    expect(formatFileSize(512)).toBe('512 B');
  });

  it('formats KB range', () => {
    expect(formatFileSize(2048)).toBe('2.0 KB');
  });

  it('formats MB range', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
  });

  it('handles 0', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });

  it('handles negative gracefully', () => {
    expect(formatFileSize(-1)).toBe('0 B');
  });
});

// ---------------------------------------------------------------------------
// DPI helpers
// ---------------------------------------------------------------------------

describe('dpiToScale', () => {
  it('72 DPI → scale 1.0', () => {
    expect(dpiToScale(72)).toBe(1.0);
  });

  it('150 DPI → scale ~2.08', () => {
    expect(dpiToScale(150)).toBeCloseTo(150 / 72, 5);
  });

  it('300 DPI → scale ~4.17', () => {
    expect(dpiToScale(300)).toBeCloseTo(300 / 72, 5);
  });
});

describe('dpiLabel', () => {
  it('returns label for each DPI option', () => {
    for (const dpi of DPI_OPTIONS) {
      const label = dpiLabel(dpi);
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    }
  });

  it('label for 300 mentions Druck', () => {
    expect(dpiLabel(300)).toMatch(/Druck/);
  });
});

// ---------------------------------------------------------------------------
// buildZipStore
// ---------------------------------------------------------------------------

describe('buildZipStore', () => {
  it('returns a Uint8Array', () => {
    const zip = buildZipStore([{ name: 'test.jpg', data: new Uint8Array([0xff, 0xd8]) }]);
    expect(zip).toBeInstanceOf(Uint8Array);
  });

  it('starts with PK local file header signature (0x504b0304)', () => {
    const zip = buildZipStore([{ name: 'a.jpg', data: new Uint8Array([1, 2, 3]) }]);
    // 0x504b0304 little-endian = 50 4b 03 04
    expect(zip[0]).toBe(0x50);
    expect(zip[1]).toBe(0x4b);
    expect(zip[2]).toBe(0x03);
    expect(zip[3]).toBe(0x04);
  });

  it('ends with end-of-central-directory signature (0x504b0506)', () => {
    const zip = buildZipStore([{ name: 'a.jpg', data: new Uint8Array([1]) }]);
    const len = zip.length;
    // EOCD record is last 22 bytes; first 4 = 0x504b0506
    expect(zip[len - 22]).toBe(0x50);
    expect(zip[len - 21]).toBe(0x4b);
    expect(zip[len - 20]).toBe(0x05);
    expect(zip[len - 19]).toBe(0x06);
  });

  it('handles empty file list', () => {
    const zip = buildZipStore([]);
    expect(zip.length).toBe(22); // only EOCD record
  });

  it('embeds file data in output', () => {
    const data = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    const zip = buildZipStore([{ name: 'page.jpg', data }]);
    // Data must appear somewhere in the ZIP body
    const str = Array.from(zip).join(',');
    expect(str).toContain('255,216,255,224');
  });

  it('handles multiple files', () => {
    const files = [
      { name: 'p1.jpg', data: new Uint8Array([1]) },
      { name: 'p2.jpg', data: new Uint8Array([2]) },
      { name: 'p3.jpg', data: new Uint8Array([3]) },
    ];
    const zip = buildZipStore(files);
    expect(zip.length).toBeGreaterThan(100);
    // 3 entries → entry count in EOCD (bytes len-6..len-7 LE) = 3
    const view = new DataView(zip.buffer);
    const totalEntries = view.getUint16(zip.length - 12, true);
    expect(totalEntries).toBe(3);
  });
});
