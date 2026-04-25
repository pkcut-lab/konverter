import { describe, it, expect } from 'vitest';
import { parseToolConfig } from '../../../src/lib/tools/schemas';
import {
  erbschaftsteuerRechner,
  berechneErbschaftsteuer,
  berechneRohsteuer,
  versorgungsfreibetragKind,
} from '../../../src/lib/tools/erbschaftsteuer-rechner';

describe('erbschaftsteuerRechner config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(erbschaftsteuerRechner);
    expect(r.ok).toBe(true);
  });

  it('has correct identity fields', () => {
    expect(erbschaftsteuerRechner.id).toBe('inheritance-tax-calculator');
    expect(erbschaftsteuerRechner.type).toBe('formatter');
    expect(erbschaftsteuerRechner.categoryId).toBe('finance');
    expect(erbschaftsteuerRechner.mode).toBe('custom');
  });

  it('rejects invalid modification (empty categoryId)', () => {
    const broken = { ...erbschaftsteuerRechner, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('versorgungsfreibetragKind', () => {
  it('Kind 0–5 Jahre → 52.000 EUR', () => {
    expect(versorgungsfreibetragKind(0)).toBe(52_000);
    expect(versorgungsfreibetragKind(5)).toBe(52_000);
  });
  it('Kind 6–10 Jahre → 41.000 EUR', () => {
    expect(versorgungsfreibetragKind(6)).toBe(41_000);
    expect(versorgungsfreibetragKind(10)).toBe(41_000);
  });
  it('Kind 11–15 Jahre → 30.700 EUR', () => {
    expect(versorgungsfreibetragKind(15)).toBe(30_700);
  });
  it('Kind 16–20 Jahre → 20.500 EUR', () => {
    expect(versorgungsfreibetragKind(18)).toBe(20_500);
  });
  it('Kind 21–27 Jahre → 10.300 EUR', () => {
    expect(versorgungsfreibetragKind(25)).toBe(10_300);
  });
  it('Kind 28+ Jahre → 0 EUR (kein Versorgungsfreibetrag)', () => {
    expect(versorgungsfreibetragKind(28)).toBe(0);
  });
});

describe('berechneRohsteuer — StKl I', () => {
  it('0 EUR → 0 EUR Steuer', () => {
    expect(berechneRohsteuer(0, 1)).toBe(0);
  });

  it('75.000 EUR → 5.250 EUR (7 %)', () => {
    expect(berechneRohsteuer(75_000, 1)).toBe(5_250);
  });

  it('80.000 EUR → Härtteausgleich: 7.750 EUR statt 8.800 EUR', () => {
    // Regular: 80.000 × 11% = 8.800 EUR
    // Härte: 5.250 + 0,5 × (80.000 – 75.000) = 5.250 + 2.500 = 7.750 EUR
    expect(berechneRohsteuer(80_000, 1)).toBe(7_750);
  });

  it('300.000 EUR → 33.000 EUR (11 %)', () => {
    expect(berechneRohsteuer(300_000, 1)).toBe(33_000);
  });

  it('600.000 EUR → 90.000 EUR (15 %)', () => {
    expect(berechneRohsteuer(600_000, 1)).toBe(90_000);
  });
});

describe('berechneRohsteuer — StKl II', () => {
  it('75.000 EUR → 11.250 EUR (15 %)', () => {
    expect(berechneRohsteuer(75_000, 2)).toBe(11_250);
  });

  it('100.000 EUR → Härtteausgleich: < 100.000 × 20% = 20.000', () => {
    const tax = berechneRohsteuer(100_000, 2);
    // Regular: 100.000 × 20% = 20.000
    // Härte: 11.250 + 0,5 × (100.000 − 75.000) = 11.250 + 12.500 = 23.750
    // min(20.000, 23.750) = 20.000 — Härteausgleich nicht aktiv hier
    expect(tax).toBe(20_000);
  });
});

describe('berechneRohsteuer — StKl III', () => {
  it('100.000 EUR → 30.000 EUR (30 %)', () => {
    expect(berechneRohsteuer(100_000, 3)).toBe(30_000);
  });

  it('6.000.000 EUR → 1.800.000 EUR (30 %)', () => {
    expect(berechneRohsteuer(6_000_000, 3)).toBe(1_800_000);
  });
});

describe('berechneErbschaftsteuer — Ehepartner', () => {
  it('500.000 EUR Erbe → 0 EUR Steuer (Freibetrag 500k)', () => {
    const r = berechneErbschaftsteuer({
      verwandtschaftsgrad: 'ehepartner',
      nachlasswert: 500_000,
      schulden: 0,
      familienheimWert: 0,
      mietwohnAbschlag: false,
      mietwohnWert: 0,
      vorschenkungen: 0,
      kindesalter: 0,
    });
    expect(r.erbschaftsteuer).toBe(0);
    expect(r.steuerklasse).toBe(1);
    expect(r.freibetrag).toBe(500_000);
    expect(r.versorgungsfreibetrag).toBe(256_000);
  });

  it('1.000.000 EUR Erbe → korrekte Steuer nach Freibetrag + Versorgungsfreibetrag', () => {
    const r = berechneErbschaftsteuer({
      verwandtschaftsgrad: 'ehepartner',
      nachlasswert: 1_000_000,
      schulden: 0,
      familienheimWert: 0,
      mietwohnAbschlag: false,
      mietwohnWert: 0,
      vorschenkungen: 0,
      kindesalter: 0,
    });
    // Nachlasswert: 1.000.000
    // - Schulden: 0
    // - Erbfallkostenpauschale: 15.000
    // - Hausrat StKl I: 41.000
    // = stpfl brutto: 944.000
    // - Freibetrag: 500.000
    // - VFB: 256.000
    // = stpfl netto: 188.000
    // Band: bis 300.000 → 11%, aber Härteausgleich nach 75k-Grenze?
    // 188.000 liegt in Band 2 (11%): regular = 188.000 × 11% = 20.680
    // Härte: tax(75.000) + 0.5*(188.000-75.000) = 5.250 + 56.500 = 61.750
    // min(20.680, 61.750) = 20.680
    expect(r.stpflErwerbNetto).toBe(188_000);
    expect(r.erbschaftsteuer).toBe(20_680);
  });
});

describe('berechneErbschaftsteuer — Kind', () => {
  it('Kind 10 Jahre, 600.000 EUR Erbe → StKl I, VFB 41.000 EUR', () => {
    const r = berechneErbschaftsteuer({
      verwandtschaftsgrad: 'kind',
      nachlasswert: 600_000,
      schulden: 0,
      familienheimWert: 0,
      mietwohnAbschlag: false,
      mietwohnWert: 0,
      vorschenkungen: 0,
      kindesalter: 10,
    });
    expect(r.freibetrag).toBe(400_000);
    expect(r.versorgungsfreibetrag).toBe(41_000);
    // stpfl brutto: 600.000 - 15.000 - 41.000 = 544.000
    // stpfl netto: 544.000 - 400.000 - 41.000 = 103.000
    expect(r.stpflErwerbNetto).toBe(103_000);
    expect(r.steuerklasse).toBe(1);
  });
});

describe('berechneErbschaftsteuer — Sonstiger Empfänger (StKl III)', () => {
  it('100.000 EUR Erbe, keine Verwandtschaft → StKl III, FB 20.000, hohe Steuer', () => {
    const r = berechneErbschaftsteuer({
      verwandtschaftsgrad: 'sonstiges',
      nachlasswert: 100_000,
      schulden: 0,
      familienheimWert: 0,
      mietwohnAbschlag: false,
      mietwohnWert: 0,
      vorschenkungen: 0,
      kindesalter: 0,
    });
    expect(r.steuerklasse).toBe(3);
    expect(r.freibetrag).toBe(20_000);
    // stpfl brutto: 100.000 - 15.000 - 12.000 = 73.000
    // stpfl netto: 73.000 - 20.000 = 53.000
    // Steuer: 53.000 × 30% = 15.900
    expect(r.stpflErwerbNetto).toBe(53_000);
    expect(r.erbschaftsteuer).toBe(15_900);
  });
});

describe('berechneErbschaftsteuer — §14 Vorschenkungen', () => {
  it('Vorschenkungen erhöhen Steuerlast korrekt', () => {
    const ohneVorschenk = berechneErbschaftsteuer({
      verwandtschaftsgrad: 'enkel-eltern-leben',
      nachlasswert: 300_000,
      schulden: 0,
      familienheimWert: 0,
      mietwohnAbschlag: false,
      mietwohnWert: 0,
      vorschenkungen: 0,
      kindesalter: 0,
    });
    const mitVorschenk = berechneErbschaftsteuer({
      verwandtschaftsgrad: 'enkel-eltern-leben',
      nachlasswert: 300_000,
      schulden: 0,
      familienheimWert: 0,
      mietwohnAbschlag: false,
      mietwohnWert: 0,
      vorschenkungen: 100_000,
      kindesalter: 0,
    });
    expect(mitVorschenk.erbschaftsteuer).toBeGreaterThan(ohneVorschenk.erbschaftsteuer);
  });
});

describe('berechneErbschaftsteuer — §13d Mietwohnabschlag', () => {
  it('10%-Abschlag auf Mietwohnimmobilie reduziert Steuerlast', () => {
    const ohneAbschlag = berechneErbschaftsteuer({
      verwandtschaftsgrad: 'kind',
      nachlasswert: 800_000,
      schulden: 0,
      familienheimWert: 0,
      mietwohnAbschlag: false,
      mietwohnWert: 0,
      vorschenkungen: 0,
      kindesalter: 30,
    });
    const mitAbschlag = berechneErbschaftsteuer({
      verwandtschaftsgrad: 'kind',
      nachlasswert: 800_000,
      schulden: 0,
      familienheimWert: 0,
      mietwohnAbschlag: true,
      mietwohnWert: 500_000,
      vorschenkungen: 0,
      kindesalter: 30,
    });
    // Abzug: 500.000 × 10% = 50.000 EUR → niedrigerer stpfl. Erwerb
    expect(mitAbschlag.mietwohnAbzug).toBe(50_000);
    expect(mitAbschlag.erbschaftsteuer).toBeLessThan(ohneAbschlag.erbschaftsteuer);
  });
});

describe('berechneErbschaftsteuer — Familienheim §13', () => {
  it('Familienheim-Abzug reduziert steuerpflichtigen Erwerb', () => {
    const r = berechneErbschaftsteuer({
      verwandtschaftsgrad: 'ehepartner',
      nachlasswert: 1_200_000,
      schulden: 0,
      familienheimWert: 400_000,
      mietwohnAbschlag: false,
      mietwohnWert: 0,
      vorschenkungen: 0,
      kindesalter: 0,
    });
    expect(r.familienheimAbzug).toBe(400_000);
    // Nach Familienheim-Abzug: 800.000 Nachlasswert → weniger Steuer
    expect(r.stpflErwerbVorFreibetrag).toBeLessThan(1_200_000 - 15_000 - 41_000);
  });
});
