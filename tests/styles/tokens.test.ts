import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('tokens — cross-link pre-introduction', () => {
  const src = readFileSync('src/styles/tokens.css', 'utf8');
  it('exposes --space-5 (fills scale gap; unblocks homepage tool-card padding)', () => {
    expect(src).toMatch(/--space-5:\s*1\.25rem/);
  });
  it('exposes --icon-size-md', () => {
    expect(src).toMatch(/--icon-size-md:\s*48px/);
  });
  it('exposes --stagger-step', () => {
    expect(src).toMatch(/--stagger-step:\s*60ms/);
  });
  it('exposes --underline-offset', () => {
    expect(src).toMatch(/--underline-offset:\s*2px/);
  });
});
