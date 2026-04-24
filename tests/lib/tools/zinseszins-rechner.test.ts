import { describe, it, expect } from 'vitest';
import {
  zinseszinsRechner,
  computeZinseszinsCalc,
} from '../../../src/lib/tools/zinseszins-rechner';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

// ---------------------------------------------------------------------------
// Config validation
// ---------------------------------------------------------------------------

describe('zinseszinsRechner config', () => {
  it('parses as valid CalculatorConfig', () => {
    const r = parseToolConfig(zinseszinsRechner);
    expect(r.ok).toBe(true);
  });

  it('has correct identity fields', () => {
    expect(zinseszinsRechner.id).toBe('compound-interest-calculator');
    expect(zinseszinsRechner.type).toBe('calculator');
    expect(zinseszinsRechner.categoryId).toBe('finance');
  });

  it('has required inputs (anfangskapital, sparrate, zinssatz, laufzeit)', () => {
    const inputIds = zinseszinsRechner.inputs.map((i) => i.id);
    expect(inputIds).toContain('anfangskapital');
    expect(inputIds).toContain('sparrate');
    expect(inputIds).toContain('zinssatz');
    expect(inputIds).toContain('laufzeit');
  });

  it('has inflation and TER inputs', () => {
    const inputIds = zinseszinsRechner.inputs.map((i) => i.id);
    expect(inputIds).toContain('inflationsrate');
    expect(inputIds).toContain('ter');
  });

  it('has required outputs (nominal, netto, real)', () => {
    const outputIds = zinseszinsRechner.outputs.map((o) => o.id);
    expect(outputIds).toContain('endkapital_nominal');
    expect(outputIds).toContain('endkapital_netto');
    expect(outputIds).toContain('endkapital_real');
    expect(outputIds).toContain('gesamteinzahlungen');
    expect(outputIds).toContain('zinsen_brutto');
    expect(outputIds).toContain('steuern_gesamt');
  });

  it('rejects invalid modification (empty categoryId)', () => {
    const broken = { ...zinseszinsRechner, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('compute returns all expected keys', () => {
    const result = zinseszinsRechner.compute({
      anfangskapital: 1000,
      sparrate: 100,
      zinssatz: 5,
      laufzeit: 10,
      inflationsrate: 2,
      ter: 0,
    });
    expect(result).toHaveProperty('endkapital_nominal');
    expect(result).toHaveProperty('endkapital_netto');
    expect(result).toHaveProperty('endkapital_real');
    expect(result).toHaveProperty('gesamteinzahlungen');
    expect(result).toHaveProperty('zinsen_brutto');
    expect(result).toHaveProperty('steuern_gesamt');
  });

  it('compute returns finite numbers', () => {
    const result = zinseszinsRechner.compute({
      anfangskapital: 10000,
      sparrate: 200,
      zinssatz: 7,
      laufzeit: 20,
      inflationsrate: 2,
      ter: 0.3,
    });
    for (const v of Object.values(result)) {
      expect(Number.isFinite(v)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// computeZinseszinsCalc — edge cases (Dossier §8 Boundary-Tests)
// ---------------------------------------------------------------------------

describe('computeZinseszinsCalc — K0=0, R=0 → zero result', () => {
  const r = computeZinseszinsCalc(0, 0, 5, 10, 2, 0);
  it('endkapital_nominal = 0', () => expect(r.endkapital_nominal).toBe(0));
  it('gesamteinzahlungen = 0', () => expect(r.gesamteinzahlungen).toBe(0));
  it('zinsen_brutto = 0', () => expect(r.zinsen_brutto).toBe(0));
  it('steuern_gesamt = 0', () => expect(r.steuern_gesamt).toBe(0));
});

describe('computeZinseszinsCalc — K0=0, R=100, n=1, p=0 → pure contribution', () => {
  const r = computeZinseszinsCalc(0, 100, 0, 1, 0, 0);
  it('endkapital_nominal = 1200 (12 months × 100 €)', () =>
    expect(r.endkapital_nominal).toBeCloseTo(1200, 0));
  it('gesamteinzahlungen = 1200', () => expect(r.gesamteinzahlungen).toBeCloseTo(1200, 0));
  it('zinsen_brutto = 0 (no interest)', () => expect(r.zinsen_brutto).toBe(0));
  it('steuern_gesamt = 0', () => expect(r.steuern_gesamt).toBe(0));
});

describe('computeZinseszinsCalc — K0=1000, R=0, p=0 → no growth', () => {
  const r = computeZinseszinsCalc(1000, 0, 0, 1, 0, 0);
  it('endkapital_nominal = 1000', () => expect(r.endkapital_nominal).toBe(1000));
  it('zinsen_brutto = 0', () => expect(r.zinsen_brutto).toBe(0));
  it('steuern_gesamt = 0', () => expect(r.steuern_gesamt).toBe(0));
});

describe('computeZinseszinsCalc — K0=1000, R=0, n=1, p=12 → annual compounding via monthly', () => {
  // Monthly compounding at 12 % p.a.: 1000 × 1.12 = 1120 exactly
  const r = computeZinseszinsCalc(1000, 0, 12, 1, 0, 0);
  it('endkapital_nominal ≈ 1120', () => expect(r.endkapital_nominal).toBeCloseTo(1120, 0));
});

describe('computeZinseszinsCalc — classic: 10.000 € × 5 % × 10 Jahre', () => {
  // 10000 × 1.05^10 ≈ 16289.46 (annual equivalent, monthly sim ≈ same)
  const r = computeZinseszinsCalc(10000, 0, 5, 10, 0, 0);
  it('endkapital_nominal ≈ 16289', () => expect(r.endkapital_nominal).toBeCloseTo(16289, -1));
  it('zinsen_brutto > 0', () => expect(r.zinsen_brutto).toBeGreaterThan(0));
  it('gesamteinzahlungen = 10000 (no sparrate)', () =>
    expect(r.gesamteinzahlungen).toBe(10000));
});

describe('computeZinseszinsCalc — negative interest reduces capital (Dossier §8)', () => {
  const r = computeZinseszinsCalc(1000, 0, -5, 1, 0, 0);
  it('endkapital_nominal < K0', () => expect(r.endkapital_nominal).toBeLessThan(1000));
  it('zinsen_brutto < 0', () => expect(r.zinsen_brutto).toBeLessThan(0));
  it('steuern_gesamt = 0 (no taxable gain)', () => expect(r.steuern_gesamt).toBe(0));
});

describe('computeZinseszinsCalc — inflation reduces real value (Dossier §1 Fisher)', () => {
  const withInflation = computeZinseszinsCalc(10000, 0, 5, 10, 2, 0);
  const noInflation = computeZinseszinsCalc(10000, 0, 5, 10, 0, 0);
  it('endkapital_real < endkapital_netto when inflation > 0', () =>
    expect(withInflation.endkapital_real).toBeLessThan(withInflation.endkapital_netto));
  it('endkapital_real ≈ endkapital_netto when inflation = 0', () =>
    expect(noInflation.endkapital_real).toBeCloseTo(noInflation.endkapital_netto, 0));
});

describe('computeZinseszinsCalc — TER reduces returns (Dossier §1)', () => {
  const noTer = computeZinseszinsCalc(10000, 0, 7, 20, 0, 0);
  const withTer = computeZinseszinsCalc(10000, 0, 7, 20, 0, 0.5);
  it('TER reduces nominal endkapital', () =>
    expect(withTer.endkapital_nominal).toBeLessThan(noTer.endkapital_nominal));
});

describe('computeZinseszinsCalc — Abgeltungssteuer above Sparerpauschbetrag', () => {
  // High yield, long duration → yearly interest > 1000 € → tax applies
  const r = computeZinseszinsCalc(100000, 0, 5, 10, 0, 0);
  it('steuern_gesamt > 0 when gains exceed Sparerpauschbetrag', () =>
    expect(r.steuern_gesamt).toBeGreaterThan(0));
  it('endkapital_netto < endkapital_nominal', () =>
    expect(r.endkapital_netto).toBeLessThan(r.endkapital_nominal));
});

describe('computeZinseszinsCalc — small gains below Sparerpauschbetrag (1000 € p.a.)', () => {
  // 1 € capital at 0 % → no gains → no tax
  const r = computeZinseszinsCalc(1, 0, 0, 10, 0, 0);
  it('steuern_gesamt = 0 (no gains)', () => expect(r.steuern_gesamt).toBe(0));
});

describe('computeZinseszinsCalc — gesamteinzahlungen formula', () => {
  const r = computeZinseszinsCalc(500, 100, 5, 5, 0, 0);
  it('gesamteinzahlungen = K0 + sparrate × laufzeit × 12', () =>
    expect(r.gesamteinzahlungen).toBeCloseTo(500 + 100 * 5 * 12, 0));
});

describe('computeZinseszinsCalc — laufzeit clamp to min 1', () => {
  const r01 = computeZinseszinsCalc(1000, 0, 5, 0.1, 0, 0);
  const r1 = computeZinseszinsCalc(1000, 0, 5, 1, 0, 0);
  it('laufzeit 0.1 clamped to 1 year', () =>
    expect(r01.endkapital_nominal).toBeCloseTo(r1.endkapital_nominal, 0));
});

describe('computeZinseszinsCalc — laufzeit clamp to max 80', () => {
  const r100 = computeZinseszinsCalc(1000, 0, 5, 100, 0, 0);
  const r80 = computeZinseszinsCalc(1000, 0, 5, 80, 0, 0);
  it('laufzeit 100 clamped to 80 years', () =>
    expect(r100.endkapital_nominal).toBeCloseTo(r80.endkapital_nominal, 0));
});

describe('computeZinseszinsCalc — large float no overflow (Dossier §8)', () => {
  const r = computeZinseszinsCalc(1_000_000, 0, 7, 80, 0, 0);
  it('endkapital_nominal is finite', () => expect(Number.isFinite(r.endkapital_nominal)).toBe(true));
  it('endkapital_nominal > 0', () => expect(r.endkapital_nominal).toBeGreaterThan(0));
});
