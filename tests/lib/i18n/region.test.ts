import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  detectRegion,
  setRegion,
  regionLabel,
  regionCurrency,
  REGION_CHANGE_EVENT,
} from '../../../src/lib/i18n/region';

describe('region — pure helpers', () => {
  it('regionLabel returns United States / United Kingdom', () => {
    expect(regionLabel('us')).toBe('United States');
    expect(regionLabel('uk')).toBe('United Kingdom');
  });

  it('regionCurrency returns USD / GBP', () => {
    expect(regionCurrency('us')).toBe('USD');
    expect(regionCurrency('uk')).toBe('GBP');
  });
});

describe('region — detectRegion priority', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns persisted choice when present (us)', () => {
    window.localStorage.setItem('kittokit-region', 'us');
    expect(detectRegion()).toBe('us');
  });

  it('returns persisted choice when present (uk)', () => {
    window.localStorage.setItem('kittokit-region', 'uk');
    expect(detectRegion()).toBe('uk');
  });

  it('ignores invalid persisted values', () => {
    window.localStorage.setItem('kittokit-region', 'fr');
    // No persisted UK signal in nav.languages by default in jsdom — falls
    // through to default 'us'.
    expect(detectRegion()).toBe('us');
  });

  it('detects en-GB navigator.languages → uk', () => {
    Object.defineProperty(window.navigator, 'languages', {
      value: ['en-GB', 'en'],
      configurable: true,
    });
    expect(detectRegion()).toBe('uk');
  });

  it('detects en-US navigator.languages → us', () => {
    Object.defineProperty(window.navigator, 'languages', {
      value: ['en-US', 'en'],
      configurable: true,
    });
    expect(detectRegion()).toBe('us');
  });

  it('falls back to us when navigator.languages has no en hint', () => {
    Object.defineProperty(window.navigator, 'languages', {
      value: ['de-DE'],
      configurable: true,
    });
    expect(detectRegion()).toBe('us');
  });
});

describe('region — setRegion side effects', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists value in localStorage', () => {
    setRegion('uk');
    expect(window.localStorage.getItem('kittokit-region')).toBe('uk');
  });

  it('dispatches a kittokit-region-change event with the new region', () => {
    const handler = vi.fn();
    window.addEventListener(REGION_CHANGE_EVENT, handler);
    setRegion('uk');
    expect(handler).toHaveBeenCalledTimes(1);
    const evt = handler.mock.calls[0]![0] as CustomEvent<{ region: string }>;
    expect(evt.detail.region).toBe('uk');
    window.removeEventListener(REGION_CHANGE_EVENT, handler);
  });
});
