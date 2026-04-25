import { describe, it, expect } from 'vitest';
import { parseToolConfig } from '../../../src/lib/tools/schemas';
import {
  leasingFaktorRechner,
  computeLeasingFaktor,
  getBewertung,
  formatFaktor,
  formatEuro,
  round2,
  round4,
  MARKT_DURCHSCHNITT,
} from '../../../src/lib/tools/leasing-faktor-rechner';

describe('leasingFaktorRechner config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(leasingFaktorRechner);
    expect(r.ok).toBe(true);
  });

  it('has correct identity fields', () => {
    expect(leasingFaktorRechner.id).toBe('leasing-factor-calculator');
    expect(leasingFaktorRechner.type).toBe('formatter');
    expect(leasingFaktorRechner.categoryId).toBe('finance');
    expect(leasingFaktorRechner.mode).toBe('custom');
  });

  it('rejects invalid modification (empty categoryId)', () => {
    const broken = { ...leasingFaktorRechner, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('computeLeasingFaktor — Primärformel (ohne Sonderzahlung)', () => {
  it('250 € Rate / 33.850 € Listenpreis → Faktor 0,7386', () => {
    const r = computeLeasingFaktor(250, 33_850);
    expect(r.faktor).toBe(0.7386);
    expect(r.bereinigt).toBe(false);
    expect(r.bewertung).toBe('gut');
  });

  it('Faktor < 0,50 → Spitzenangebot (EV-Niveau)', () => {
    const r = computeLeasingFaktor(80, 33_850);
    expect(r.faktor).toBeLessThan(0.5);
    expect(r.bewertung).toBe('spitzenangebot');
  });

  it('Faktor 1,10 → wenig-attraktiv', () => {
    const r = computeLeasingFaktor(372.35, 33_850);
    expect(r.bewertung).toBe('wenig-attraktiv');
  });

  it('enthält Formeltext mit Listenpreis', () => {
    const r = computeLeasingFaktor(250, 33_850);
    expect(r.formelText).toContain('33.850,00');
    expect(r.formelText).toContain('250,00');
  });

  it('sonderzahlungProMonat ist undefined wenn keine Sonderzahlung', () => {
    const r = computeLeasingFaktor(250, 33_850);
    expect(r.sonderzahlungProMonat).toBeUndefined();
  });
});

describe('computeLeasingFaktor — bereinigte Formel (mit Sonderzahlung)', () => {
  it('250 € Rate + 3.600 € SZ / 36 Monate / 33.850 € → bereinigt, Faktor höher', () => {
    const r = computeLeasingFaktor(250, 33_850, 3_600, 36);
    expect(r.bereinigt).toBe(true);
    expect(r.faktor).toBeGreaterThan(0.7386);
    expect(r.sonderzahlungProMonat).toBe(100);
  });

  it('SZ = 0 → Primärformel, bereinigt = false', () => {
    const r = computeLeasingFaktor(250, 33_850, 0, 36);
    expect(r.bereinigt).toBe(false);
  });

  it('enthält Sonderzahlungs-Anteil im Formeltext wenn bereinigt', () => {
    const r = computeLeasingFaktor(250, 33_850, 3_600, 36);
    expect(r.formelText).toContain('3.600,00');
    expect(r.formelText).toContain('36');
  });
});

describe('getBewertung — Skalengrenzen', () => {
  it('genau 0 → spitzenangebot', () => {
    expect(getBewertung(0)).toBe('spitzenangebot');
  });

  it('0,499 → spitzenangebot', () => {
    expect(getBewertung(0.499)).toBe('spitzenangebot');
  });

  it('0,50 → sehr-gut', () => {
    expect(getBewertung(0.5)).toBe('sehr-gut');
  });

  it('0,70 → gut', () => {
    expect(getBewertung(0.7)).toBe('gut');
  });

  it('0,90 → durchschnittlich', () => {
    expect(getBewertung(0.9)).toBe('durchschnittlich');
  });

  it('1,00 → wenig-attraktiv', () => {
    expect(getBewertung(1.0)).toBe('wenig-attraktiv');
  });

  it('2,5 → wenig-attraktiv', () => {
    expect(getBewertung(2.5)).toBe('wenig-attraktiv');
  });
});

describe('MARKT_DURCHSCHNITT', () => {
  it('Markt-Benchmark 0,63 (leasingmarkt.de 2024)', () => {
    expect(MARKT_DURCHSCHNITT).toBe(0.63);
  });
});

describe('round2 / round4', () => {
  it('round2(100 / 36) → 2,78', () => {
    expect(round2(100 / 36)).toBe(2.78);
  });

  it('round4(250 / 33850 * 100) → 0,7386', () => {
    expect(round4((250 / 33_850) * 100)).toBe(0.7386);
  });
});

describe('formatFaktor', () => {
  it('0,7386 → "0,74"', () => {
    expect(formatFaktor(0.7386)).toBe('0,74');
  });

  it('gibt leeren String für NaN', () => {
    expect(formatFaktor(NaN)).toBe('');
  });

  it('gibt leeren String für Infinity', () => {
    expect(formatFaktor(Infinity)).toBe('');
  });
});

describe('formatEuro', () => {
  it('33850 → "33.850,00"', () => {
    expect(formatEuro(33_850)).toBe('33.850,00');
  });

  it('0 → "0,00"', () => {
    expect(formatEuro(0)).toBe('0,00');
  });

  it('gibt leeren String für NaN', () => {
    expect(formatEuro(NaN)).toBe('');
  });
});
