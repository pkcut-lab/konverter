import { describe, it, expect } from 'vitest';
import { parseToolConfig } from '../../../src/lib/tools/schemas';
import {
  skontoRechner,
  computeSkonto,
  getAmpelStatus,
  round2,
  formatEuro,
} from '../../../src/lib/tools/skonto-rechner';

describe('skontoRechner config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(skontoRechner);
    expect(r.ok).toBe(true);
  });

  it('has correct id and type', () => {
    expect(skontoRechner.id).toBe('cash-discount-calculator');
    expect(skontoRechner.type).toBe('formatter');
    expect(skontoRechner.categoryId).toBe('finance');
  });

  it('rejects invalid modification (empty categoryId)', () => {
    const broken = { ...skontoRechner, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('computeSkonto — Basisberechnung', () => {
  it('berechnet Standardbeispiel: 1000 € × 2 % = 20 € Skonto, 980 € Zahlbetrag', () => {
    const r = computeSkonto(1000, 2, 10, 30);
    expect(r.skontoBetrag).toBe(20);
    expect(r.zahlBetrag).toBe(980);
  });

  it('berechnet effektiven Jahreszins korrekt: 2%/10d/30d ≈ 36,73 %', () => {
    const r = computeSkonto(1000, 2, 10, 30);
    // (2 / 98) × (360 / 20) × 100 = 36.7346...
    expect(r.effJahreszins).toBeCloseTo(36.73, 1);
  });

  it('berechnet Jahreszins bei 3%/7d/30d', () => {
    const r = computeSkonto(5000, 3, 7, 30);
    // (3/97) × (360/23) × 100 ≈ 48.30 %
    expect(r.effJahreszins).toBeCloseTo(48.3, 0);
  });

  it('liefert null für effJahreszins wenn Zahlungsziel = Skontofrist (Division-by-Zero)', () => {
    const r = computeSkonto(1000, 2, 10, 10);
    expect(r.effJahreszins).toBeNull();
  });

  it('Skontosatz = 0: Skontobetrag und Jahreszins = 0', () => {
    const r = computeSkonto(1000, 0, 10, 30);
    expect(r.skontoBetrag).toBe(0);
    expect(r.zahlBetrag).toBe(1000);
    expect(r.effJahreszins).toBe(0);
  });

  it('large amount: 1.000.000 € × 5 %', () => {
    const r = computeSkonto(1_000_000, 5, 14, 60);
    expect(r.skontoBetrag).toBe(50_000);
    expect(r.zahlBetrag).toBe(950_000);
  });
});

describe('computeSkonto — Netto-Modus', () => {
  it('berechnet Netto-Aufschlüsselung bei 19 % MwSt', () => {
    const r = computeSkonto(1000, 2, 10, 30, 19);
    expect(r.nettoBasis).toBeDefined();
    expect(r.nettoBasis!.nettoVorSkonto).toBe(1000);
    expect(r.nettoBasis!.nettoNachSkonto).toBe(980);
    expect(r.nettoBasis!.mwstNachSkonto).toBeCloseTo(186.2, 1);
    expect(r.nettoBasis!.bruttoNachSkonto).toBeCloseTo(1166.2, 1);
  });

  it('berechnet Netto-Modus mit 7 % MwSt', () => {
    const r = computeSkonto(500, 3, 7, 30, 7);
    expect(r.nettoBasis).toBeDefined();
    expect(r.nettoBasis!.nettoNachSkonto).toBeCloseTo(485, 0);
  });
});

describe('getAmpelStatus', () => {
  it('gruen bei Jahreszins > 10 %', () => {
    expect(getAmpelStatus(36.73)).toBe('gruen');
    expect(getAmpelStatus(10.01)).toBe('gruen');
  });

  it('gelb bei Jahreszins 5–10 %', () => {
    expect(getAmpelStatus(5)).toBe('gelb');
    expect(getAmpelStatus(10)).toBe('gelb');
  });

  it('rot bei Jahreszins < 5 %', () => {
    expect(getAmpelStatus(4.99)).toBe('rot');
    expect(getAmpelStatus(0)).toBe('rot');
  });

  it('null wenn kein Jahreszins', () => {
    expect(getAmpelStatus(null)).toBeNull();
  });
});

describe('Hilfsfunktionen', () => {
  it('round2 rundet kaufmännisch auf 2 Stellen', () => {
    expect(round2(1.236)).toBe(1.24);
    expect(round2(10.123)).toBe(10.12);
  });

  it('formatEuro formatiert korrekt auf DE-Lokale', () => {
    expect(formatEuro(1234.56)).toBe('1.234,56');
    expect(formatEuro(980)).toBe('980,00');
  });
});
