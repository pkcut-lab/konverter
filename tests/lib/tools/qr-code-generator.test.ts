import { describe, it, expect } from 'vitest';
import {
  qrCodeGenerator,
  generateQrSvg,
} from '../../../src/lib/tools/qr-code-generator';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('qrCodeGenerator config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(qrCodeGenerator);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(qrCodeGenerator.id).toBe('qr-code-generator');
    expect(qrCodeGenerator.type).toBe('formatter');
    expect(qrCodeGenerator.categoryId).toBe('image');
    expect(qrCodeGenerator.mode).toBe('custom');
  });
});

describe('generateQrSvg', () => {
  it('produces a non-empty SVG string for simple input', () => {
    const svg = generateQrSvg('Hello');
    expect(svg.length).toBeGreaterThan(0);
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('SVG contains expected elements (rect + path)', () => {
    const svg = generateQrSvg('Test');
    expect(svg).toContain('<rect');
    expect(svg).toContain('<path');
    expect(svg).toContain('viewBox');
    expect(svg).toContain('xmlns');
  });

  it('different inputs produce different outputs', () => {
    const svg1 = generateQrSvg('Hello');
    const svg2 = generateQrSvg('World');
    expect(svg1).not.toEqual(svg2);
  });

  it('throws on empty input', () => {
    expect(() => generateQrSvg('')).toThrow('Bitte');
    expect(() => generateQrSvg('   ')).toThrow('Bitte');
  });

  it('handles URL input', () => {
    const svg = generateQrSvg('https://example.com');
    expect(svg).toContain('<svg');
    expect(svg).toContain('<path');
  });

  it('handles longer text input (up to version limits)', () => {
    const longText = 'A'.repeat(100);
    const svg = generateQrSvg(longText);
    expect(svg).toContain('<svg');
    expect(svg).toContain('<path');
  });

  it('throws on text exceeding capacity', () => {
    const tooLong = 'A'.repeat(300);
    expect(() => generateQrSvg(tooLong)).toThrow('zu lang');
  });

  it('produces valid SVG with crispEdges rendering', () => {
    const svg = generateQrSvg('QR');
    expect(svg).toContain('shape-rendering="crispEdges"');
  });

  it('produces different SVG sizes for different input lengths', () => {
    const short = generateQrSvg('Hi');
    const longer = generateQrSvg('https://example.com/a-longer-path-that-needs-more-modules');
    // Longer input → larger version → larger viewBox
    const shortSize = short.match(/viewBox="0 0 (\d+)/);
    const longerSize = longer.match(/viewBox="0 0 (\d+)/);
    expect(shortSize).not.toBeNull();
    expect(longerSize).not.toBeNull();
    expect(Number(longerSize![1])).toBeGreaterThanOrEqual(Number(shortSize![1]));
  });
});

describe('format function (integration)', () => {
  it('generates SVG from text input', () => {
    const result = qrCodeGenerator.format('Hello World');
    expect(result).toContain('<svg');
    expect(result).toContain('</svg>');
  });

  it('generates SVG from URL input', () => {
    const result = qrCodeGenerator.format('https://konverter.app');
    expect(result).toContain('<svg');
    expect(result).toContain('<path');
  });

  it('throws on empty input', () => {
    expect(() => qrCodeGenerator.format('')).toThrow('Bitte');
  });

  it('single character input works', () => {
    const result = qrCodeGenerator.format('A');
    expect(result).toContain('<svg');
  });
});
