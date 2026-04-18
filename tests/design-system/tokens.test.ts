import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const TOKENS_PATH = join(process.cwd(), 'src/styles/tokens.css');
const css = readFileSync(TOKENS_PATH, 'utf8');

const LIGHT_BLOCK = css.match(/:root\s*\{([\s\S]*?)\}/)?.[1] ?? '';
const DARK_BLOCK = css.match(/:root\[data-theme="dark"\]\s*\{([\s\S]*?)\}/)?.[1] ?? '';

const REQUIRED_COLOR_VARS = [
  '--color-bg',
  '--color-surface',
  '--color-border',
  '--color-text',
  '--color-text-muted',
  '--color-text-subtle',
  '--color-accent',
  '--color-accent-hover',
  '--color-success',
  '--color-error',
  '--icon-filter',
];

const REQUIRED_LIGHT_ONLY_VARS = [
  '--font-family-sans',
  '--font-family-mono',
  '--font-size-h1',
  '--font-size-body',
  '--space-1',
  '--space-4',
  '--space-24',
  '--r-sm',
  '--r-md',
  '--r-lg',
  '--shadow-sm',
  '--shadow-md',
  '--shadow-lg',
  '--ease-out',
  '--dur-fast',
  '--dur-med',
  '--ad-slot-1-height-mobile',
  '--ad-slot-1-height-desktop',
  '--ad-slot-2-height',
  '--ad-slot-3-height',
  '--bp-sm',
  '--bp-lg',
];

describe('Design Tokens — structural completeness', () => {
  it('parses both :root and :root[data-theme="dark"] blocks', () => {
    expect(LIGHT_BLOCK.length).toBeGreaterThan(100);
    expect(DARK_BLOCK.length).toBeGreaterThan(50);
  });

  it.each(REQUIRED_COLOR_VARS)('light theme declares %s', (varName) => {
    expect(LIGHT_BLOCK).toMatch(new RegExp(`${varName}\\s*:`));
  });

  it.each(REQUIRED_COLOR_VARS)('dark theme declares %s', (varName) => {
    expect(DARK_BLOCK).toMatch(new RegExp(`${varName}\\s*:`));
  });

  it.each(REQUIRED_LIGHT_ONLY_VARS)('declares theme-agnostic var %s', (varName) => {
    expect(LIGHT_BLOCK).toMatch(new RegExp(`${varName}\\s*:`));
  });
});
