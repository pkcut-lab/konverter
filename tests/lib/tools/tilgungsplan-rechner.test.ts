import { describe, it, expect } from 'vitest';
import {
  tilgungsplanRechner,
  formatEuro,
  computeMonatsrate,
  computeMonatsrateFromAnfangstilgung,
  computeLaufzeit,
  computeAnfangstilgungPct,
  computeTilgungsplan,
} from '../../../src/lib/tools/tilgungsplan-rechner';
import { parseDE } from '../../../src/lib/tools/parse-de';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('tilgungsplanRechner config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(tilgungsplanRechner);
    expect(r.ok).toBe(true);
  });

  it('has correct identity fields', () => {
    expect(tilgungsplanRechner.id).toBe('amortization-calculator');
    expect(tilgungsplanRechner.type).toBe('formatter');
    expect(tilgungsplanRechner.categoryId).toBe('finance');
    expect(tilgungsplanRechner.mode).toBe('custom');
  });

  it('rejects invalid modification — empty categoryId', () => {
    const broken = { ...tilgungsplanRechner, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('rejects invalid modification — wrong type', () => {
    const broken = { ...tilgungsplanRechner, type: 'converter' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('parseDE', () => {
  it('parses integer string', () => expect(parseDE('300000')).toBe(300000));
  it('parses German decimal comma', () => expect(parseDE('3,50')).toBeCloseTo(3.5));
  it('parses English decimal dot', () => expect(parseDE('3.50')).toBeCloseTo(3.5));
  it('strips German thousands separator', () => expect(parseDE('300.000,00')).toBeCloseTo(300000));
  it('strips English thousands separator', () => expect(parseDE('300,000.00')).toBeCloseTo(300000));
  it('returns NaN for empty string', () => expect(parseDE('')).toBeNaN());
  it('returns NaN for non-numeric', () => expect(parseDE('abc')).toBeNaN());
  it('parses zero', () => expect(parseDE('0')).toBe(0));
  it('strips whitespace', () => expect(parseDE('  1500  ')).toBe(1500));
});

describe('formatEuro', () => {
  it('formats 1234.56 with DE thousands+decimal', () => expect(formatEuro(1234.56)).toBe('1.234,56'));
  it('formats 100 → "100,00"', () => expect(formatEuro(100)).toBe('100,00'));
  it('returns empty for NaN', () => expect(formatEuro(NaN)).toBe(''));
  it('returns empty for Infinity', () => expect(formatEuro(Infinity)).toBe(''));
});

describe('computeMonatsrate — Annuität', () => {
  // Standard: 300.000 € at 3.5% p.a., 30 Jahre (360 Monate)
  // Formel: A = K × (q^n × i) / (q^n − 1)
  // i = 0.035/12 = 0.002916..., q = 1.002916..., q^360 ≈ 2.849...
  // A ≈ 1347.13
  it('300k at 3.5% over 30 years ≈ 1347 €/month', () => {
    const a = computeMonatsrate(300_000, 3.5, 360);
    expect(a).toBeGreaterThan(1340);
    expect(a).toBeLessThan(1360);
  });

  // Classic: 100k at 6% over 20 years (240 months)
  // i = 0.005, q^240 = 3.3102, A = 100000 * 3.3102 * 0.005 / (3.3102 - 1) ≈ 716.43
  it('100k at 6% over 20 years ≈ 716 €/month', () => {
    const a = computeMonatsrate(100_000, 6, 240);
    expect(a).toBeGreaterThan(710);
    expect(a).toBeLessThan(725);
  });

  // Zinssatz = 0: pure division
  it('300k at 0% over 360 months = 833.33 €/month', () => {
    const a = computeMonatsrate(300_000, 0, 360);
    expect(a).toBeCloseTo(833.33, 0);
  });

  it('returns NaN for K <= 0', () => {
    expect(computeMonatsrate(0, 3.5, 360)).toBeNaN();
  });

  it('returns NaN for nMonate <= 0', () => {
    expect(computeMonatsrate(300_000, 3.5, 0)).toBeNaN();
  });
});

describe('computeMonatsrateFromAnfangstilgung', () => {
  // 300k at 3.5% Zins + 2% Anfangstilgung = (3.5 + 2) / 12 % × 300k = 1375 €
  it('300k at 3.5% Zins, 2% Anfangstilgung = 1375 €/month', () => {
    const a = computeMonatsrateFromAnfangstilgung(300_000, 3.5, 2);
    expect(a).toBeCloseTo(1375, 0);
  });

  // 200k at 4% Zins + 1% Anfangstilgung = 5% / 12 × 200k = 833.33
  it('200k at 4% Zins, 1% Anfangstilgung ≈ 833 €/month', () => {
    const a = computeMonatsrateFromAnfangstilgung(200_000, 4, 1);
    expect(a).toBeCloseTo(833.33, 0);
  });
});

describe('computeLaufzeit', () => {
  // 300k at 3.5%, monthly rate 1375 should give around 296 months (≈25 years)
  it('300k at 3.5%, 1375 €/month → ~348 months', () => {
    // Monthly interest = 300000 × 0.035/12 = 875; Tilgung = 500; n ≈ 347.5 → ceil = 348
    const n = computeLaufzeit(300_000, 1375, 3.5);
    expect(n).toBeGreaterThan(330);
    expect(n).toBeLessThan(365);
  });

  // Rate = monthly interest → Infinity
  it('returns Infinity if rate equals monthly interest', () => {
    // 300k at 3.5%: monthly interest = 300000 * 0.035/12 = 875
    const n = computeLaufzeit(300_000, 875, 3.5);
    expect(n).toBe(Infinity);
  });

  // Rate below monthly interest → Infinity
  it('returns Infinity if rate < monthly interest', () => {
    const n = computeLaufzeit(300_000, 800, 3.5);
    expect(n).toBe(Infinity);
  });

  // Zinssatz = 0
  it('300k at 0%, 1000 €/month → 300 months', () => {
    const n = computeLaufzeit(300_000, 1000, 0);
    expect(n).toBe(300);
  });
});

describe('computeAnfangstilgungPct', () => {
  // 300k at 3.5%, rate 1375: Anfangstilgung = (1375*12/300000 - 0.035) * 100 = (0.055 - 0.035) * 100 = 2%
  it('300k at 3.5%, 1375 €/month → ≈2% Anfangstilgung', () => {
    const pct = computeAnfangstilgungPct(300_000, 1375, 3.5);
    expect(pct).toBeCloseTo(2, 0);
  });

  // 200k at 4%, 833.33: (833.33*12/200000 - 0.04) * 100 ≈ 1%
  it('200k at 4%, 833.33 €/month → ≈1% Anfangstilgung', () => {
    const pct = computeAnfangstilgungPct(200_000, 833.33, 4);
    expect(pct).toBeCloseTo(1, 0);
  });
});

describe('computeTilgungsplan — Modus A (Annuität)', () => {
  const result = computeTilgungsplan({
    betrag: 300_000,
    zinssatzJahrPct: 3.5,
    monatsrate: 1375,
    zinsbindungJahre: 10,
    sondertilgungPA: 0,
  });

  it('monatsrate matches input', () => {
    expect(result.monatsrate).toBe(1375);
  });

  it('anfangstilgungPct ≈ 2%', () => {
    expect(result.anfangstilgungPct).toBeCloseTo(2, 0);
  });

  it('has positive Gesamtzinsen', () => {
    expect(result.gesamtZinsen).toBeGreaterThan(0);
  });

  it('Restschuld after 10 years is less than original betrag', () => {
    expect(result.restschuldNachZinsbindung).toBeLessThan(300_000);
    expect(result.restschuldNachZinsbindung).toBeGreaterThan(0);
  });

  it('laufzeitMonate > 0', () => {
    expect(result.laufzeitMonate).toBeGreaterThan(0);
  });

  it('laufzeitMonate <= 600 (50-year cap)', () => {
    expect(result.laufzeitMonate).toBeLessThanOrEqual(600);
  });

  it('has yearly rows', () => {
    expect(result.rows.length).toBeGreaterThan(0);
  });

  it('rows are sorted by year ascending', () => {
    for (let i = 1; i < result.rows.length; i++) {
      expect(result.rows[i]!.jahr).toBeGreaterThan(result.rows[i - 1]!.jahr);
    }
  });

  it('Zinsbindungsende-Marker set on year 10 row', () => {
    const year10 = result.rows.find((r) => r.jahr === 10);
    expect(year10?.isZinsbindungsende).toBe(true);
  });

  it('no paradox warning at 2% Anfangstilgung', () => {
    expect(result.paradoxWarning).toBe(false);
  });

  it('no Sondertilgung savings', () => {
    expect(result.sondertilgungEinsparungZinsen).toBe(0);
    expect(result.sondertilgungVerkürzungMonate).toBe(0);
  });

  it('last row Restschuld is 0 (fully paid)', () => {
    const last = result.rows[result.rows.length - 1];
    expect(last!.restschuld).toBeCloseTo(0, 0);
  });
});

describe('computeTilgungsplan — Tilgungsparadoxon warning', () => {
  // 1% Anfangstilgung at 3.5% Zins → warning
  const rate = computeMonatsrateFromAnfangstilgung(300_000, 3.5, 1);
  const result = computeTilgungsplan({
    betrag: 300_000,
    zinssatzJahrPct: 3.5,
    monatsrate: rate,
    zinsbindungJahre: 10,
    sondertilgungPA: 0,
  });

  it('triggers paradox warning at <1.5% Anfangstilgung with Zins >3%', () => {
    expect(result.paradoxWarning).toBe(true);
  });
});

describe('computeTilgungsplan — Zinssatz = 0%', () => {
  // Edge case: 0% interest rate
  const result = computeTilgungsplan({
    betrag: 120_000,
    zinssatzJahrPct: 0,
    monatsrate: 1000,
    zinsbindungJahre: 5,
    sondertilgungPA: 0,
  });

  it('Gesamtzinsen = 0 at 0% Zinssatz', () => {
    expect(result.gesamtZinsen).toBe(0);
  });

  it('laufzeitMonate = 120 (120k / 1000)', () => {
    expect(result.laufzeitMonate).toBe(120);
  });

  it('last row Restschuld = 0', () => {
    const last = result.rows[result.rows.length - 1];
    expect(last!.restschuld).toBeCloseTo(0, 0);
  });
});

describe('computeTilgungsplan — Sondertilgung', () => {
  const betrag = 300_000;
  const rate = computeMonatsrateFromAnfangstilgung(betrag, 3.5, 2);

  const withS = computeTilgungsplan({
    betrag,
    zinssatzJahrPct: 3.5,
    monatsrate: rate,
    zinsbindungJahre: 10,
    sondertilgungPA: 5000,
  });

  it('Sondertilgung reduces Gesamtzinsen', () => {
    expect(withS.sondertilgungEinsparungZinsen).toBeGreaterThan(0);
  });

  it('Sondertilgung reduces Laufzeit', () => {
    expect(withS.sondertilgungVerkürzungMonate).toBeGreaterThan(0);
  });

  it('Sondertilgung year has sondertilgungJahr > 0', () => {
    const yearWithS = withS.rows.find((r) => r.sondertilgungJahr > 0);
    expect(yearWithS).toBeDefined();
  });
});

describe('computeTilgungsplan — Zinsbindung >= Laufzeit', () => {
  // 10-year loan, 10-year Zinsbindung: Restschuld at end = 0
  const result = computeTilgungsplan({
    betrag: 100_000,
    zinssatzJahrPct: 4,
    monatsrate: computeMonatsrate(100_000, 4, 120),
    zinsbindungJahre: 10,
    sondertilgungPA: 0,
  });

  it('restschuldNachZinsbindung = 0 when Zinsbindung >= Laufzeit', () => {
    expect(result.restschuldNachZinsbindung).toBeCloseTo(0, 0);
  });
});
