import { describe, it, expect } from 'vitest';
import {
  rabattRechner,
  parseDE,
  formatEuro,
  formatProzent,
  round2,
  computeEndpreis,
  computeUrsprungspreis,
  computeRabattProzent,
  computeKettenrabatt,
} from '../../../src/lib/tools/rabatt-rechner';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('rabattRechner config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(rabattRechner);
    expect(r.ok).toBe(true);
  });

  it('has correct identity fields', () => {
    expect(rabattRechner.id).toBe('discount-calculator');
    expect(rabattRechner.type).toBe('formatter');
    expect(rabattRechner.categoryId).toBe('finance');
    expect(rabattRechner.mode).toBe('custom');
  });

  it('rejects invalid modification', () => {
    const broken = { ...rabattRechner, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('parseDE', () => {
  it('parses integer string', () => expect(parseDE('100')).toBe(100));
  it('parses German decimal comma', () => expect(parseDE('5,48')).toBeCloseTo(5.48));
  it('parses English decimal dot', () => expect(parseDE('5.48')).toBeCloseTo(5.48));
  it('strips German thousands separator', () => expect(parseDE('9.999.999,00')).toBeCloseTo(9_999_999));
  it('returns NaN for empty string', () => expect(parseDE('')).toBeNaN());
  it('returns NaN for non-numeric string', () => expect(parseDE('abc')).toBeNaN());
  it('strips whitespace', () => expect(parseDE('  100  ')).toBe(100));
  it('parses 0', () => expect(parseDE('0')).toBe(0));
});

describe('formatEuro', () => {
  it('formats 100 → "100,00"', () => expect(formatEuro(100)).toBe('100,00'));
  it('formats 1234.56 with thousands dot', () => expect(formatEuro(1234.56)).toBe('1.234,56'));
  it('returns empty string for NaN', () => expect(formatEuro(NaN)).toBe(''));
  it('returns empty string for Infinity', () => expect(formatEuro(Infinity)).toBe(''));
});

describe('formatProzent', () => {
  it('formats 20 → "20,00"', () => expect(formatProzent(20)).toBe('20,00'));
  it('formats 21.8 correctly', () => expect(formatProzent(21.8)).toBe('21,80'));
  it('returns empty for NaN', () => expect(formatProzent(NaN)).toBe(''));
});

describe('round2', () => {
  it('rounds 1.555 → 1.56 (third decimal rounds up)', () => expect(round2(1.555)).toBe(1.56));
  it('rounds 1.004 → 1.00 (third decimal rounds down)', () => expect(round2(1.004)).toBe(1));
  it('leaves 5.48 intact', () => expect(round2(5.48)).toBeCloseTo(5.48));
  it('rounds 0.005 to 2-decimal precision', () => expect(round2(0.005)).toBeCloseTo(0.01, 2));
});

describe('computeEndpreis — Standard', () => {
  it('100 € − 20% = 80 €', () => {
    const r = computeEndpreis(100, 20);
    expect(r.endpreis).toBe(80);
    expect(r.rabattBetrag).toBe(20);
    expect(r.rabattProzent).toBe(20);
    expect(r.ursprungspreis).toBe(100);
  });

  it('Dossier §8: 5,48 € − 10% = 4,93 €', () => {
    const r = computeEndpreis(5.48, 10);
    expect(r.endpreis).toBe(4.93);
  });

  it('Null-Rabatt: 100 € − 0% = 100 €', () => {
    const r = computeEndpreis(100, 0);
    expect(r.endpreis).toBe(100);
    expect(r.rabattBetrag).toBe(0);
  });

  it('Vollrabatt: 100 € − 100% = 0 €', () => {
    const r = computeEndpreis(100, 100);
    expect(r.endpreis).toBe(0);
    expect(r.rabattBetrag).toBe(100);
  });

  it('Großer Betrag: 9.999.999 € − 15% = 8.499.999,15 €', () => {
    const r = computeEndpreis(9_999_999, 15);
    expect(r.endpreis).toBeCloseTo(8_499_999.15, 1);
  });
});

describe('computeUrsprungspreis — Rückrechnung Preis', () => {
  it('80 € bei 20% → Ursprungspreis 100 €', () => {
    const r = computeUrsprungspreis(80, 20);
    expect(r.ursprungspreis).toBe(100);
    expect(r.rabattBetrag).toBe(20);
  });

  it('50 € bei 50% → Ursprungspreis 100 €', () => {
    const r = computeUrsprungspreis(50, 50);
    expect(r.ursprungspreis).toBe(100);
  });
});

describe('computeRabattProzent — Rückrechnung Rabatt%', () => {
  it('P=100, E=80 → R=20%', () => {
    const r = computeRabattProzent(100, 80);
    expect(r.rabattProzent).toBe(20);
    expect(r.rabattBetrag).toBe(20);
  });

  it('P=200, E=144 → R=28%', () => {
    const r = computeRabattProzent(200, 144);
    expect(r.rabattProzent).toBeCloseTo(28, 1);
  });
});

describe('computeKettenrabatt — Dossier §8', () => {
  it('200 € − 20% − 10% = 144 € (nicht 140 €)', () => {
    const r = computeKettenrabatt(200, 20, 10);
    expect(r.endpreis).toBe(144);
  });

  it('Gesamtrabatt 20%+10% ≠ 30%, korrekt ≈28%', () => {
    const r = computeKettenrabatt(200, 20, 10);
    expect(r.gesamtRabattProzent).toBeCloseTo(28, 1);
    expect(r.gesamtRabattProzent).toBeLessThan(30);
  });

  it('Dossier §1 Beispiel: 15%+8% → Gesamtrabatt ≈21,8%', () => {
    const r = computeKettenrabatt(100, 15, 8);
    expect(r.endpreis).toBeCloseTo(78.2, 1);
    expect(r.gesamtRabattProzent).toBeCloseTo(21.8, 1);
  });

  it('Null-Rabatt zweistufig: 0%+0% → Endpreis = Ursprungspreis', () => {
    const r = computeKettenrabatt(100, 0, 0);
    expect(r.endpreis).toBe(100);
    expect(r.gesamtRabattProzent).toBe(0);
  });
});

describe('boundary values', () => {
  it('R=0 → Endpreis = Ursprungspreis', () => {
    expect(computeEndpreis(250, 0).endpreis).toBe(250);
  });

  it('R=100 → Endpreis = 0', () => {
    expect(computeEndpreis(250, 100).endpreis).toBe(0);
  });

  it('P=E bei Rückrechnung R% → R=0', () => {
    const r = computeRabattProzent(100, 100);
    expect(r.rabattProzent).toBe(0);
    expect(r.rabattBetrag).toBe(0);
  });
});
