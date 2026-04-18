import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const TOKENS_PATH = join(process.cwd(), 'src/styles/tokens.css');
const css = readFileSync(TOKENS_PATH, 'utf8');

function extractBlock(source: string, selector: string): string {
  const re = new RegExp(`${selector.replace(/[[\]]/g, '\\$&')}\\s*\\{([\\s\\S]*?)\\}`);
  return source.match(re)?.[1] ?? '';
}

function parseVar(block: string, name: string): string | null {
  const re = new RegExp(`${name}\\s*:\\s*([^;]+);`);
  return block.match(re)?.[1]?.trim() ?? null;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  if (h.length !== 6) throw new Error(`Unexpected hex: ${hex}`);
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fg: string, bg: string): number {
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const [bright, dark] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (bright + 0.05) / (dark + 0.05);
}

const light = extractBlock(css, ':root');
const dark = extractBlock(css, ':root[data-theme="dark"]');

const AAA = 7;

describe('WCAG AAA contrast — Light theme', () => {
  it('text on bg ≥ 7:1', () => {
    const ratio = contrastRatio(parseVar(light, '--color-text')!, parseVar(light, '--color-bg')!);
    expect(ratio).toBeGreaterThanOrEqual(AAA);
  });
  it('accent on bg ≥ 7:1', () => {
    const ratio = contrastRatio(parseVar(light, '--color-accent')!, parseVar(light, '--color-bg')!);
    expect(ratio).toBeGreaterThanOrEqual(AAA);
  });
  it('text on surface ≥ 7:1', () => {
    const ratio = contrastRatio(parseVar(light, '--color-text')!, parseVar(light, '--color-surface')!);
    expect(ratio).toBeGreaterThanOrEqual(AAA);
  });
});

describe('WCAG AAA contrast — Dark theme', () => {
  it('text on bg ≥ 7:1', () => {
    const ratio = contrastRatio(parseVar(dark, '--color-text')!, parseVar(dark, '--color-bg')!);
    expect(ratio).toBeGreaterThanOrEqual(AAA);
  });
  it('accent on bg ≥ 7:1', () => {
    const ratio = contrastRatio(parseVar(dark, '--color-accent')!, parseVar(dark, '--color-bg')!);
    expect(ratio).toBeGreaterThanOrEqual(AAA);
  });
  it('text on surface ≥ 7:1', () => {
    const ratio = contrastRatio(parseVar(dark, '--color-text')!, parseVar(dark, '--color-surface')!);
    expect(ratio).toBeGreaterThanOrEqual(AAA);
  });
});
