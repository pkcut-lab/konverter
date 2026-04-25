import { describe, it, expect } from 'vitest';
import { parseToolConfig } from '../../../src/lib/tools/schemas';
import {
  roiRechner,
  computeRoiBasis,
  computeRoiErweitert,
  computeRoiDupont,
  formatEuro,
  formatProzent,
} from '../../../src/lib/tools/roi-rechner';

describe('roiRechner config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(roiRechner);
    expect(r.ok).toBe(true);
  });

  it('has correct identity fields', () => {
    expect(roiRechner.id).toBe('roi-calculator');
    expect(roiRechner.type).toBe('formatter');
    expect(roiRechner.categoryId).toBe('finance');
    expect(roiRechner.mode).toBe('custom');
  });

  it('rejects invalid modification (empty categoryId)', () => {
    const broken = { ...roiRechner, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('computeRoiBasis — Standardfälle', () => {
  it('Gewinn: 50.000 € Invest, 63.400 € Ertrag → ROI 26,8 %, Gewinn 13.400 €', () => {
    const r = computeRoiBasis(50_000, 63_400);
    expect(r.roi).toBe(26.8);
    expect(r.gewinn).toBe(13_400);
    expect(r.status).toBe('gewinn');
  });

  it('Verlust: 50.000 € Invest, 40.000 € Ertrag → ROI −20 %', () => {
    const r = computeRoiBasis(50_000, 40_000);
    expect(r.roi).toBe(-20);
    expect(r.gewinn).toBe(-10_000);
    expect(r.status).toBe('verlust');
  });

  it('Break-Even: Ertrag = Investition → ROI 0 %', () => {
    const r = computeRoiBasis(100_000, 100_000);
    expect(r.roi).toBe(0);
    expect(r.gewinn).toBe(0);
    expect(r.status).toBe('breakeven');
  });

  it('enthält Formel-Text als nicht-leeren String', () => {
    const r = computeRoiBasis(50_000, 63_400);
    expect(r.formelText).toBeTruthy();
    expect(r.formelText).toContain('%');
  });
});

describe('computeRoiErweitert — mit Betriebskosten + AROI', () => {
  it('berechnet Basisfelder korrekt (100k/150k/3J/5k BK)', () => {
    const r = computeRoiErweitert(100_000, 150_000, 3, 5_000);
    expect(r.gesamtBetriebskosten).toBe(15_000);
    expect(r.gewinn).toBe(35_000);
    expect(r.roi).toBe(35);
    expect(r.status).toBe('gewinn');
  });

  it('berechnet annualisierten ROI (AROI) via Zinseszins-Formel', () => {
    // (150000/100000)^(1/3) − 1 = 1.5^(1/3) − 1 ≈ 14.47 %
    const r = computeRoiErweitert(100_000, 150_000, 3, 5_000);
    expect(r.aroi).toBeCloseTo(14.47, 1);
    expect(r.aroiFormelText).toContain('%');
  });

  it('berechnet Amortisationsdauer korrekt', () => {
    // jährlicherNetto = (150000−15000)/3 = 45000; amort = 100000/45000 ≈ 2.22
    const r = computeRoiErweitert(100_000, 150_000, 3, 5_000);
    expect(r.amortisation).toBeCloseTo(2.22, 1);
  });

  it('amortisation = null wenn jährlicher Netto ≤ 0', () => {
    // Ertrag 20000, BK 10000×3=30000 → Netto negativ
    const r = computeRoiErweitert(100_000, 20_000, 3, 10_000);
    expect(r.amortisation).toBeNull();
  });

  it('ohne Betriebskosten (Default 0) entspricht AROI dem reinen Zinseszins', () => {
    const r = computeRoiErweitert(100_000, 150_000, 3);
    expect(r.gesamtBetriebskosten).toBe(0);
    expect(r.aroi).toBeCloseTo(14.47, 1);
  });
});

describe('computeRoiDupont — Dreifaktor-Schema', () => {
  it('ROI = Umsatzrendite × Kapitalumschlag (20k/200k/250k)', () => {
    const r = computeRoiDupont(20_000, 200_000, 250_000);
    // Umsatzrendite = 20000/200000×100 = 10 %
    // Kapitalumschlag = 200000/250000 = 0.8
    // ROI = 10 × 0.8 = 8 %
    expect(r.umsatzrendite).toBeCloseTo(10, 4);
    expect(r.kapitalumschlag).toBeCloseTo(0.8, 4);
    expect(r.roi).toBeCloseTo(8, 4);
    expect(r.status).toBe('gewinn');
  });

  it('Verlust-Status bei negativem Gewinn', () => {
    const r = computeRoiDupont(-10_000, 200_000, 250_000);
    expect(r.status).toBe('verlust');
    expect(r.roi).toBeLessThan(0);
  });

  it('Break-Even bei Gewinn = 0', () => {
    const r = computeRoiDupont(0, 200_000, 250_000);
    expect(r.status).toBe('breakeven');
    expect(r.roi).toBe(0);
  });

  it('enthält Formel-Text mit Umsatzrendite und Kapitalumschlag', () => {
    const r = computeRoiDupont(20_000, 200_000, 250_000);
    expect(r.formelText).toContain('Umsatzrendite');
    expect(r.formelText).toContain('Kapitalumschlag');
  });
});

describe('formatEuro', () => {
  it('formatiert 1234.56 → "1.234,56" (DE-Locale)', () => {
    expect(formatEuro(1_234.56)).toBe('1.234,56');
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
});

describe('formatProzent', () => {
  it('formatiert 26.8 → "26,80" (2 Dezimalen)', () => {
    expect(formatProzent(26.8)).toBe('26,80');
  });

  it('formatiert mit custom Dezimalen: 14.4714 → "14,471" bei 3', () => {
    expect(formatProzent(14.4714, 3)).toBe('14,471');
  });

  it('gibt leeren String für NaN zurück', () => {
    expect(formatProzent(NaN)).toBe('');
  });
});
