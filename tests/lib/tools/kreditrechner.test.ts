import { describe, it, expect } from 'vitest';
import {
  kreditrechner,
  computeMonatsrate,
  buildTilgungsplan,
  computeKreditErgebnis,
} from '../../../src/lib/tools/kreditrechner';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

// ──────────────────────────────────────────────
// Config validation
// ──────────────────────────────────────────────

describe('kreditrechner config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(kreditrechner);
    expect(r.ok).toBe(true);
  });

  it('has correct identity fields', () => {
    expect(kreditrechner.id).toBe('loan-calculator');
    expect(kreditrechner.type).toBe('formatter');
    expect(kreditrechner.categoryId).toBe('finance');
  });

  it('has mode custom', () => {
    expect(kreditrechner.mode).toBe('custom');
  });

  it('rejects invalid modification', () => {
    const broken = { ...kreditrechner, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

// ──────────────────────────────────────────────
// computeMonatsrate — Annuitätenformel
// ──────────────────────────────────────────────

describe('computeMonatsrate — Dossier-Beispiel', () => {
  // 200.000 €, 3,80 % p.a., 20 Jahre (240 Monate)
  // Dossier nennt ≈ 1.191,99 € — Formel ergibt 1.190,99 € (quellenseitige Rundung)
  const rate = computeMonatsrate(200_000, 3.8, 240);
  it('monatsrate liegt im Bereich 1190–1193', () => {
    expect(rate).toBeGreaterThan(1190);
    expect(rate).toBeLessThan(1193);
  });
  it('is finite', () => expect(Number.isFinite(rate)).toBe(true));
});

describe('computeMonatsrate — gängige Werte', () => {
  it('10.000 € / 5 % / 12 Monate', () => {
    const rate = computeMonatsrate(10_000, 5, 12);
    expect(rate).toBeCloseTo(856.07, 0);
  });

  it('100.000 € / 4 % / 120 Monate', () => {
    const rate = computeMonatsrate(100_000, 4, 120);
    expect(rate).toBeCloseTo(1012.45, 0);
  });
});

describe('computeMonatsrate — ungültige Eingaben', () => {
  it('kreditbetrag = 0 → NaN', () => expect(computeMonatsrate(0, 3, 120)).toBeNaN());
  it('kreditbetrag < 0 → NaN', () => expect(computeMonatsrate(-1000, 3, 120)).toBeNaN());
  it('sollzins = 0 → NaN (Division nicht definiert)', () => expect(computeMonatsrate(100_000, 0, 120)).toBeNaN());
  it('sollzins < 0 → NaN', () => expect(computeMonatsrate(100_000, -1, 120)).toBeNaN());
  it('laufzeit < 1 → NaN', () => expect(computeMonatsrate(100_000, 3, 0)).toBeNaN());
  it('NaN-Input → NaN', () => expect(computeMonatsrate(NaN, 3, 120)).toBeNaN());
});

describe('computeMonatsrate — Grenzwerte', () => {
  it('laufzeit = 1 Monat: rate ≈ kreditbetrag + 1 Monat Zinsen', () => {
    const rate = computeMonatsrate(1_000, 6, 1);
    const erwartet = 1_000 * (1 + 0.06 / 12);
    expect(rate).toBeCloseTo(erwartet, 2);
  });

  it('laufzeit = 600 Monate (50 Jahre) ist valide', () => {
    const rate = computeMonatsrate(200_000, 3, 600);
    expect(Number.isFinite(rate)).toBe(true);
    expect(rate).toBeGreaterThan(0);
  });
});

// ──────────────────────────────────────────────
// buildTilgungsplan
// ──────────────────────────────────────────────

describe('buildTilgungsplan — ohne Sondertilgung', () => {
  const plan = buildTilgungsplan(100_000, 4, 120);

  it('erzeugt 120 Zeilen', () => expect(plan.length).toBe(120));

  it('erste Zeile hat korrekten Zinsanteil', () => {
    // Monat 1: Zinsanteil = 100.000 × (4%/12) = 333,33 €
    expect(plan[0].zinsanteil).toBeCloseTo(333.33, 0);
  });

  it('letzte Zeile hat Restschuld ≈ 0', () => {
    expect(plan[plan.length - 1].restschuld).toBeCloseTo(0, 0);
  });

  it('Zinsanteil sinkt monoton', () => {
    for (let i = 1; i < plan.length; i++) {
      expect(plan[i].zinsanteil).toBeLessThanOrEqual(plan[i - 1].zinsanteil + 0.01);
    }
  });

  it('Tilgungsanteil steigt monoton', () => {
    for (let i = 1; i < plan.length; i++) {
      expect(plan[i].tilgungsanteil).toBeGreaterThanOrEqual(plan[i - 1].tilgungsanteil - 0.01);
    }
  });
});

describe('buildTilgungsplan — mit Sondertilgung', () => {
  const planOhne = buildTilgungsplan(100_000, 4, 120, 0);
  const planMit = buildTilgungsplan(100_000, 4, 120, 5_000);

  it('Sondertilgung verkürzt Laufzeit', () => {
    expect(planMit.length).toBeLessThan(planOhne.length);
  });

  it('Sondertilgung-Feld im 12. Monat gesetzt', () => {
    const monat12 = planMit.find((z) => z.monat === 12);
    expect(monat12).toBeDefined();
    expect(monat12!.sondertilgung).toBeGreaterThan(0);
  });

  it('Restschuld nach Sondertilgung korrekt reduziert', () => {
    const planBasis = buildTilgungsplan(100_000, 4, 120, 0);
    const planSonder = buildTilgungsplan(100_000, 4, 120, 5_000);
    // Nach Monat 12 sollte Restschuld mit Sondertilgung deutlich niedriger sein
    const r12Ohne = planBasis.find((z) => z.monat === 12)!.restschuld;
    const r12Mit = planSonder.find((z) => z.monat === 12)!.restschuld;
    expect(r12Mit).toBeLessThan(r12Ohne);
  });
});

describe('buildTilgungsplan — ungültige Eingaben', () => {
  it('kreditbetrag ≤ 0 → []', () => expect(buildTilgungsplan(0, 4, 120)).toEqual([]));
  it('sollzins ≤ 0 → []', () => expect(buildTilgungsplan(100_000, 0, 120)).toEqual([]));
  it('laufzeit < 1 → []', () => expect(buildTilgungsplan(100_000, 4, 0)).toEqual([]));
});

// ──────────────────────────────────────────────
// computeKreditErgebnis
// ──────────────────────────────────────────────

describe('computeKreditErgebnis — ohne Sondertilgung', () => {
  const r = computeKreditErgebnis(100_000, 4, 120, 0);

  it('monatsrate ist positiv', () => expect(r.monatsrate).toBeGreaterThan(0));
  it('gesamtzinsen > 0', () => expect(r.gesamtzinsen).toBeGreaterThan(0));
  it('gesamtkosten ≈ kreditbetrag + gesamtzinsen', () => {
    expect(r.gesamtkosten).toBeCloseTo(100_000 + r.gesamtzinsen, 0);
  });
  it('ersparnis_zinsen = 0 ohne Sondertilgung', () => expect(r.ersparnis_zinsen).toBe(0));
  it('ersparnis_monate = 0 ohne Sondertilgung', () => expect(r.ersparnis_monate).toBe(0));
});

describe('computeKreditErgebnis — mit Sondertilgung (Differenzierung H2)', () => {
  const ohneS = computeKreditErgebnis(100_000, 4, 120, 0);
  const mitS = computeKreditErgebnis(100_000, 4, 120, 5_000);

  it('Ersparnis Zinsen > 0', () => expect(mitS.ersparnis_zinsen).toBeGreaterThan(0));
  it('Ersparnis Monate > 0', () => expect(mitS.ersparnis_monate).toBeGreaterThan(0));
  it('Gesamtzinsen mit Sondertilgung geringer', () => {
    expect(mitS.gesamtzinsen).toBeLessThan(ohneS.gesamtzinsen);
  });
});

describe('computeKreditErgebnis — ungültige Eingaben', () => {
  it('kreditbetrag = 0 → monatsrate NaN', () => {
    expect(computeKreditErgebnis(0, 4, 120).monatsrate).toBeNaN();
  });
  it('sollzins = 0 → monatsrate NaN', () => {
    expect(computeKreditErgebnis(100_000, 0, 120).monatsrate).toBeNaN();
  });
});

