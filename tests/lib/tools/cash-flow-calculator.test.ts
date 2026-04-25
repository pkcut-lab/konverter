import { describe, it, expect } from 'vitest';
import { parseToolConfig } from '../../../src/lib/tools/schemas';
import {
  cashflowRechner,
  computeCashflowDirekt,
  computeCashflowIndirekt,
  computeFreeCashflow,
  formatEuro,
} from '../../../src/lib/tools/cash-flow-calculator';

describe('cashflowRechner config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(cashflowRechner);
    expect(r.ok).toBe(true);
  });

  it('has correct identity fields', () => {
    expect(cashflowRechner.id).toBe('cash-flow-calculator');
    expect(cashflowRechner.type).toBe('formatter');
    expect(cashflowRechner.categoryId).toBe('finance');
    expect(cashflowRechner.mode).toBe('custom');
  });

  it('rejects invalid modification (empty categoryId)', () => {
    const broken = { ...cashflowRechner, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('computeCashflowDirekt — direkte Methode', () => {
  it('Basisfall: 85.000 − 72.000 = 13.000 € positiv', () => {
    const r = computeCashflowDirekt(85_000, 72_000);
    expect(r.cashflow).toBe(13_000);
    expect(r.status).toBe('positiv');
    expect(r.einzahlungen).toBe(85_000);
    expect(r.auszahlungen).toBe(72_000);
  });

  it('negativer Cashflow: Auszahlungen > Einzahlungen', () => {
    const r = computeCashflowDirekt(50_000, 70_000);
    expect(r.cashflow).toBe(-20_000);
    expect(r.status).toBe('negativ');
  });

  it('Break-Even: Einzahlungen = Auszahlungen → CF = 0', () => {
    const r = computeCashflowDirekt(100_000, 100_000);
    expect(r.cashflow).toBe(0);
    expect(r.status).toBe('null');
  });

  it('Null-Inputs → CF = 0', () => {
    const r = computeCashflowDirekt(0, 0);
    expect(r.cashflow).toBe(0);
    expect(r.status).toBe('null');
  });

  it('enthält Formel-Text mit Einzahlungen und Ergebnis', () => {
    const r = computeCashflowDirekt(85_000, 72_000);
    expect(r.formelText).toBeTruthy();
    expect(r.formelText).toContain('€');
  });

  it('rundet auf 2 Nachkommastellen', () => {
    const r = computeCashflowDirekt(100.005, 0);
    expect(r.cashflow).toBe(100.01);
  });
});

describe('computeCashflowIndirekt — indirekte Methode', () => {
  it('Basisfall (Dossier §8 Edge-Case): JÜ −100.000 + AfA 150.000 = OCF +50.000', () => {
    const r = computeCashflowIndirekt(-100_000, 150_000, 0, 0, 0, 0);
    expect(r.ocf).toBe(50_000);
    expect(r.status).toBe('positiv');
  });

  it('Standardfall: JÜ 20.000 + AfA 15.000 − ΔFord. 5.000 = OCF 30.000', () => {
    const r = computeCashflowIndirekt(20_000, 15_000, 0, 5_000, 0, 0);
    expect(r.ocf).toBe(30_000);
    expect(r.status).toBe('positiv');
  });

  it('Working-Capital-Vollbild: JÜ 50.000 + AfA 10.000 + ΔRückst. 5.000 − ΔFord. 8.000 − ΔVorr. 3.000 + ΔVerb. 6.000 = 60.000', () => {
    const r = computeCashflowIndirekt(50_000, 10_000, 5_000, 8_000, 3_000, 6_000);
    expect(r.ocf).toBe(60_000);
  });

  it('negativer Forderungs-Delta (Forderungen sinken) verbessert OCF', () => {
    // Forderungen sinken um 10.000 → addiert zum OCF (ford-Param positiv = steigt)
    const r = computeCashflowIndirekt(0, 0, 0, -10_000, 0, 0);
    expect(r.ocf).toBe(10_000);
    expect(r.status).toBe('positiv');
  });

  it('hatLernmoment = true wenn OCF wesentlich von JÜ abweicht (>500 €)', () => {
    const r = computeCashflowIndirekt(20_000, 15_000, 0, 5_000, 0, 0);
    expect(r.hatLernmoment).toBe(true);
  });

  it('hatLernmoment = true bei unterschiedlichen Vorzeichen (JÜ negativ, OCF positiv)', () => {
    const r = computeCashflowIndirekt(-100_000, 150_000, 0, 0, 0, 0);
    expect(r.hatLernmoment).toBe(true);
  });

  it('hatLernmoment = false wenn JÜ = OCF (nur JÜ, alles andere 0)', () => {
    const r = computeCashflowIndirekt(30_000, 0, 0, 0, 0, 0);
    expect(r.hatLernmoment).toBe(false);
  });

  it('enthält Formel-Text mit JÜ und AfA', () => {
    const r = computeCashflowIndirekt(20_000, 15_000, 0, 5_000, 0, 0);
    expect(r.formelText).toContain('€');
    expect(r.formelText).toContain('JÜ');
  });
});

describe('computeFreeCashflow — Free Cashflow', () => {
  it('FCF = OCF − CapEx: 30.000 − 10.000 = 20.000', () => {
    const r = computeFreeCashflow(30_000, 10_000);
    expect(r.freeCf).toBe(20_000);
    expect(r.status).toBe('positiv');
    expect(r.ocf).toBe(30_000);
    expect(r.capex).toBe(10_000);
  });

  it('CapEx > OCF → negativer FCF', () => {
    const r = computeFreeCashflow(10_000, 50_000);
    expect(r.freeCf).toBe(-40_000);
    expect(r.status).toBe('negativ');
  });

  it('CapEx = 0 → FCF = OCF', () => {
    const r = computeFreeCashflow(25_000, 0);
    expect(r.freeCf).toBe(25_000);
  });

  it('OCF = CapEx → FCF = 0 (Break-Even)', () => {
    const r = computeFreeCashflow(15_000, 15_000);
    expect(r.freeCf).toBe(0);
    expect(r.status).toBe('null');
  });

  it('enthält Formel-Text', () => {
    const r = computeFreeCashflow(30_000, 10_000);
    expect(r.formelText).toContain('€');
  });
});

describe('formatEuro', () => {
  it('formatiert 13000 → "13.000,00" (DE-Locale)', () => {
    expect(formatEuro(13_000)).toBe('13.000,00');
  });

  it('formatiert 0 → "0,00"', () => {
    expect(formatEuro(0)).toBe('0,00');
  });

  it('gibt leeren String für NaN zurück', () => {
    expect(formatEuro(NaN)).toBe('');
  });

  it('gibt leeren String für Infinity zurück', () => {
    expect(formatEuro(Infinity)).toBe('');
  });

  it('negative Zahl wird korrekt formatiert', () => {
    const result = formatEuro(-20_000);
    expect(result).toContain('20.000');
    expect(result).toContain(',00');
  });
});
