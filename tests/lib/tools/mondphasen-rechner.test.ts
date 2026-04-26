import { describe, it, expect } from 'vitest';
import {
  computeMoonPhase,
  PHASE_NAMES_DE,
  PHASE_NAMES_EN,
} from '../../../src/lib/tools/mondphasen-rechner';

/**
 * Reference moon-phase events (UTC) used to validate the Meeus implementation.
 * Source: NASA / timeanddate.com.
 */
describe('computeMoonPhase — known events', () => {
  it('full moon 1 May 2026 at ~17:23 UTC is detected as Full Moon', () => {
    const r = computeMoonPhase(new Date('2026-05-01T17:23:00Z'));
    expect(r.illumination).toBeGreaterThan(0.99);
    expect(PHASE_NAMES_DE[r.phaseIndex]).toBe('Vollmond');
    expect(PHASE_NAMES_EN[r.phaseIndex]).toBe('Full Moon');
  });

  it('1 May 2026 noon UTC: nextFull is within ±12 h of 17:23 UTC', () => {
    const r = computeMoonPhase(new Date('2026-05-01T12:00:00Z'));
    const expected = new Date('2026-05-01T17:23:00Z').getTime();
    const diff = Math.abs(r.nextFull.getTime() - expected);
    expect(diff).toBeLessThan(12 * 60 * 60 * 1000);
  });

  it('reference new moon 6 Jan 2000 18:14 UTC has illumination ~0', () => {
    const r = computeMoonPhase(new Date('2000-01-06T18:14:00Z'));
    expect(r.illumination).toBeLessThan(0.01);
  });

  it('21 Jan 2000 04:40 UTC (lunar eclipse / full moon) has illumination ~1', () => {
    const r = computeMoonPhase(new Date('2000-01-21T04:40:00Z'));
    expect(r.illumination).toBeGreaterThan(0.99);
  });

  it('detects waxing on day after new moon', () => {
    const r = computeMoonPhase(new Date('2026-05-17T12:00:00Z'));
    expect(r.waxing).toBe(true);
  });

  it('detects waning on day after full moon', () => {
    const r = computeMoonPhase(new Date('2026-05-03T12:00:00Z'));
    expect(r.waxing).toBe(false);
    // Day after full should still be high illumination, not eclipse-like
    expect(r.illumination).toBeGreaterThan(0.9);
  });
});

describe('computeMoonPhase — phase index ranges', () => {
  it('illumination is in [0, 1]', () => {
    const samples = [
      '2026-01-15', '2026-02-15', '2026-03-15', '2026-04-15',
      '2026-05-15', '2026-06-15', '2026-07-15', '2026-08-15',
    ];
    for (const s of samples) {
      const r = computeMoonPhase(new Date(s + 'T12:00:00Z'));
      expect(r.illumination).toBeGreaterThanOrEqual(0);
      expect(r.illumination).toBeLessThanOrEqual(1);
    }
  });

  it('phaseIndex is always 0–7', () => {
    for (let day = 1; day <= 365; day += 7) {
      const date = new Date(2026, 0, day);
      const r = computeMoonPhase(date);
      expect(r.phaseIndex).toBeGreaterThanOrEqual(0);
      expect(r.phaseIndex).toBeLessThanOrEqual(7);
    }
  });

  it('age is in [0, 29.53]', () => {
    for (let day = 1; day <= 365; day += 5) {
      const date = new Date(2026, 0, day);
      const r = computeMoonPhase(date);
      expect(r.age).toBeGreaterThanOrEqual(0);
      expect(r.age).toBeLessThanOrEqual(29.6);
    }
  });
});

describe('computeMoonPhase — next-event distances', () => {
  it('daysToNew is between 0 and 29.53', () => {
    const r = computeMoonPhase(new Date('2026-05-01T12:00:00Z'));
    expect(r.daysToNew).toBeGreaterThan(0);
    expect(r.daysToNew).toBeLessThan(29.6);
  });

  it('daysToFull is between 0 and 29.53', () => {
    const r = computeMoonPhase(new Date('2026-05-15T12:00:00Z'));
    expect(r.daysToFull).toBeGreaterThan(0);
    expect(r.daysToFull).toBeLessThan(29.6);
  });
});
