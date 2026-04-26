import { describe, it, expect } from 'vitest';
import { parseToolConfig } from '../../../src/lib/tools/schemas';
import { pdfPasswort } from '../../../src/lib/tools/pdf-passwort';
import {
  isValidPdfMagicBytes,
  deriveUnlockedFilename,
  formatUnlockFileSize,
} from '../../../src/lib/tools/pdf-passwort-utils';

// ---------------------------------------------------------------------------
// Config tests
// ---------------------------------------------------------------------------

describe('pdf-passwort config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(pdfPasswort);
    expect(r.ok).toBe(true);
  });

  it('has correct id and type', () => {
    expect(pdfPasswort.id).toBe('pdf-password');
    expect(pdfPasswort.type).toBe('formatter');
    expect(pdfPasswort.mode).toBe('custom');
  });

  it('has document categoryId', () => {
    expect(pdfPasswort.categoryId).toBe('document');
  });

  it('format function is callable and returns identity', () => {
    expect(pdfPasswort.format('hello')).toBe('hello');
    expect(pdfPasswort.format('')).toBe('');
  });

  it('rejects modification (empty id)', () => {
    const broken = { ...pdfPasswort, id: '' };
    expect(parseToolConfig(broken).ok).toBe(false);
  });

  it('rejects modification (wrong mode)', () => {
    const broken = { ...pdfPasswort, mode: 'invalid' as never };
    expect(parseToolConfig(broken).ok).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isValidPdfMagicBytes
// ---------------------------------------------------------------------------

describe('isValidPdfMagicBytes', () => {
  const PDF_HEADER = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]); // "%PDF-"

  it('returns true for valid PDF magic bytes', () => {
    const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
    expect(isValidPdfMagicBytes(bytes)).toBe(true);
  });

  it('returns true for minimal 5-byte PDF header', () => {
    expect(isValidPdfMagicBytes(PDF_HEADER)).toBe(true);
  });

  it('returns false for empty array', () => {
    expect(isValidPdfMagicBytes(new Uint8Array([]))).toBe(false);
  });

  it('returns false for array shorter than 5 bytes', () => {
    expect(isValidPdfMagicBytes(new Uint8Array([0x25, 0x50, 0x44]))).toBe(false);
  });

  it('returns false for wrong first byte', () => {
    const bytes = new Uint8Array([0x00, 0x50, 0x44, 0x46, 0x2d]);
    expect(isValidPdfMagicBytes(bytes)).toBe(false);
  });

  it('returns false for PNG header', () => {
    // PNG magic: 0x89 0x50 0x4e 0x47 0x0d
    const bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d]);
    expect(isValidPdfMagicBytes(bytes)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// deriveUnlockedFilename
// ---------------------------------------------------------------------------

describe('deriveUnlockedFilename', () => {
  it('appends -entsperrt before .pdf extension', () => {
    expect(deriveUnlockedFilename('vertrag.pdf')).toBe('vertrag-entsperrt.pdf');
  });

  it('handles uppercase .PDF extension', () => {
    expect(deriveUnlockedFilename('DOKUMENT.PDF')).toBe('DOKUMENT-entsperrt.pdf');
  });

  it('handles mixed-case extension', () => {
    expect(deriveUnlockedFilename('file.Pdf')).toBe('file-entsperrt.pdf');
  });

  it('handles filename without extension', () => {
    expect(deriveUnlockedFilename('file')).toBe('file-entsperrt.pdf');
  });

  it('handles filename with spaces', () => {
    expect(deriveUnlockedFilename('mein dokument.pdf')).toBe('mein dokument-entsperrt.pdf');
  });

  it('handles filename with dots in base', () => {
    expect(deriveUnlockedFilename('bericht.v2.pdf')).toBe('bericht.v2-entsperrt.pdf');
  });

  it('handles already-unlocked filename gracefully', () => {
    expect(deriveUnlockedFilename('vertrag-entsperrt.pdf')).toBe(
      'vertrag-entsperrt-entsperrt.pdf',
    );
  });
});

// ---------------------------------------------------------------------------
// formatUnlockFileSize
// ---------------------------------------------------------------------------

describe('formatUnlockFileSize', () => {
  it('formats bytes', () => {
    expect(formatUnlockFileSize(512)).toBe('512 B');
  });

  it('formats kilobytes with one decimal', () => {
    expect(formatUnlockFileSize(1536)).toBe('1.5 KB');
  });

  it('formats megabytes with two decimals', () => {
    expect(formatUnlockFileSize(2 * 1024 * 1024)).toBe('2.00 MB');
  });

  it('handles zero', () => {
    expect(formatUnlockFileSize(0)).toBe('0 B');
  });

  it('handles negative input gracefully', () => {
    expect(formatUnlockFileSize(-1)).toBe('0 B');
  });

  it('handles Infinity gracefully', () => {
    expect(formatUnlockFileSize(Infinity)).toBe('0 B');
  });
});
