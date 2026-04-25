import { describe, it, expect } from 'vitest';
import { parseToolConfig } from '../../../src/lib/tools/schemas';
import { jpgZuPdf } from '../../../src/lib/tools/jpg-zu-pdf';
import { parseJpegMetadata } from '../../../src/lib/tools/jpg-zu-pdf-runtime';

describe('jpgZuPdf config', () => {
  it('parses as valid FileToolConfig', () => {
    const r = parseToolConfig(jpgZuPdf);
    expect(r.ok).toBe(true);
  });

  it('has correct identity fields', () => {
    expect(jpgZuPdf.id).toBe('jpg-to-pdf');
    expect(jpgZuPdf.type).toBe('file-tool');
    expect(jpgZuPdf.categoryId).toBe('document');
  });

  it('accepts JPEG, PNG and WebP MIME types', () => {
    expect(jpgZuPdf.accept).toContain('image/jpeg');
    expect(jpgZuPdf.accept).toContain('image/png');
    expect(jpgZuPdf.accept).toContain('image/webp');
  });

  it('has reasonable maxSizeMb (≤25 MB für mobile-Bewerbungsfotos)', () => {
    expect(jpgZuPdf.maxSizeMb).toBeGreaterThan(0);
    expect(jpgZuPdf.maxSizeMb).toBeLessThanOrEqual(25);
  });

  it('has filenameSuffix .pdf', () => {
    expect(jpgZuPdf.filenameSuffix).toBe('.pdf');
  });

  it('cameraCapture aktiviert (mobile-first)', () => {
    expect(jpgZuPdf.cameraCapture).toBe(true);
  });

  it('process is callable', () => {
    expect(typeof jpgZuPdf.process).toBe('function');
  });

  it('rejects modification with empty categoryId', () => {
    const broken = { ...jpgZuPdf, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('rejects modification with maxSizeMb 0', () => {
    const broken = { ...jpgZuPdf, maxSizeMb: 0 };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('rejects modification with empty accept array', () => {
    const broken = { ...jpgZuPdf, accept: [] };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('parseJpegMetadata', () => {
  // Minimaler valider JPEG-Header für Metadata-Test:
  // SOI (FFD8) + APP0/JFIF (16 byte) + SOF0 mit 8x8 RGB + EOI
  function makeMinimalJpeg(width: number, height: number, components = 3): Uint8Array {
    // SOI
    const bytes: number[] = [0xff, 0xd8];
    // SOF0 marker (FFC0)
    bytes.push(0xff, 0xc0);
    // length (17 bytes for SOF segment incl. length itself)
    const segLen = 8 + components * 3;
    bytes.push((segLen >> 8) & 0xff, segLen & 0xff);
    // precision (8 bits per sample)
    bytes.push(8);
    // height (2 bytes)
    bytes.push((height >> 8) & 0xff, height & 0xff);
    // width (2 bytes)
    bytes.push((width >> 8) & 0xff, width & 0xff);
    // components count
    bytes.push(components);
    for (let c = 0; c < components; c++) {
      bytes.push(c + 1, 0x22, 0x00);
    }
    // EOI
    bytes.push(0xff, 0xd9);
    return new Uint8Array(bytes);
  }

  it('parsed correct dimensions for 800×600 RGB JPEG', () => {
    const data = makeMinimalJpeg(800, 600, 3);
    const meta = parseJpegMetadata(data);
    expect(meta.width).toBe(800);
    expect(meta.height).toBe(600);
    expect(meta.colorComponents).toBe(3);
  });

  it('parses single-component (Grayscale) JPEG', () => {
    const data = makeMinimalJpeg(100, 100, 1);
    const meta = parseJpegMetadata(data);
    expect(meta.width).toBe(100);
    expect(meta.height).toBe(100);
    expect(meta.colorComponents).toBe(1);
  });

  it('parses 4-component (CMYK) JPEG', () => {
    const data = makeMinimalJpeg(2480, 3508, 4);
    const meta = parseJpegMetadata(data);
    expect(meta.width).toBe(2480);
    expect(meta.height).toBe(3508);
    expect(meta.colorComponents).toBe(4);
  });

  it('throws on non-JPEG data (Magic-Number-Check)', () => {
    const notJpeg = new Uint8Array([0x89, 0x50, 0x4e, 0x47]); // PNG-Magic
    expect(() => parseJpegMetadata(notJpeg)).toThrow();
  });

  it('throws on too-short data', () => {
    const tiny = new Uint8Array([0xff, 0xd8]);
    expect(() => parseJpegMetadata(tiny)).toThrow();
  });

  it('throws on missing SOF marker', () => {
    // SOI + EOI ohne SOFn
    const data = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
    expect(() => parseJpegMetadata(data)).toThrow();
  });

  it('handles edge: width=1, height=1 (1×1 pixel JPEG)', () => {
    const data = makeMinimalJpeg(1, 1, 3);
    const meta = parseJpegMetadata(data);
    expect(meta.width).toBe(1);
    expect(meta.height).toBe(1);
  });

  it('handles edge: large dimensions (8192×8192)', () => {
    const data = makeMinimalJpeg(8192, 8192, 3);
    const meta = parseJpegMetadata(data);
    expect(meta.width).toBe(8192);
    expect(meta.height).toBe(8192);
  });
});

describe('jpg-zu-pdf integration constraints', () => {
  it('FileToolConfig accept-list ist ASCII-only', () => {
    for (const mime of jpgZuPdf.accept) {
      expect(/^[\x20-\x7E]+$/.test(mime)).toBe(true);
    }
  });

  it('Tool-ID matcht slug-map convention (kebab-case)', () => {
    expect(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(jpgZuPdf.id)).toBe(true);
  });

  it('categoryId matcht TOOL_CATEGORIES enum', () => {
    expect(jpgZuPdf.categoryId).toBe('document');
  });

  it('defaultFormat ist .pdf', () => {
    expect(jpgZuPdf.defaultFormat).toBe('pdf');
  });

  it('showQuality false (PDF-Embed ist lossless für JPEG)', () => {
    expect(jpgZuPdf.showQuality).toBe(false);
  });
});
