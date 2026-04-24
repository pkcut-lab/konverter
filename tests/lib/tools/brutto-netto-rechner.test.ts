import { describe, it, expect } from 'vitest';
import {
  bruttoNettoRechner,
  berechneSV,
  berechneLohnsteuer,
  berechneSoli,
  berechneKirchensteuer,
  berechne,
  eStTarif2026,
  kirchensteuerSatz,
  isSachsen,
} from '../../../src/lib/tools/brutto-netto-rechner';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

// ───────────────────────────────────────────────────────────
// Config-Gate
// ───────────────────────────────────────────────────────────

describe('bruttoNettoRechner config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(bruttoNettoRechner);
    expect(r.ok).toBe(true);
  });

  it('has correct identity fields', () => {
    expect(bruttoNettoRechner.id).toBe('gross-net-calculator');
    expect(bruttoNettoRechner.type).toBe('formatter');
    expect(bruttoNettoRechner.categoryId).toBe('finance');
    expect(bruttoNettoRechner.mode).toBe('custom');
  });

  it('rejects invalid modification', () => {
    const broken = { ...bruttoNettoRechner, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

// ───────────────────────────────────────────────────────────
// Hilfsfunktionen
// ───────────────────────────────────────────────────────────

describe('kirchensteuerSatz', () => {
  it('BY → 8 %', () => expect(kirchensteuerSatz('BY')).toBe(0.08));
  it('BW → 8 %', () => expect(kirchensteuerSatz('BW')).toBe(0.08));
  it('NW → 9 %', () => expect(kirchensteuerSatz('NW')).toBe(0.09));
  it('BE → 9 %', () => expect(kirchensteuerSatz('BE')).toBe(0.09));
});

describe('isSachsen', () => {
  it('SN → true', () => expect(isSachsen('SN')).toBe(true));
  it('BY → false', () => expect(isSachsen('BY')).toBe(false));
});

// ───────────────────────────────────────────────────────────
// §32a EStG 2026 Tarif
// ───────────────────────────────────────────────────────────

describe('eStTarif2026', () => {
  it('0 bei zvE = 0', () => expect(eStTarif2026(0)).toBe(0));
  it('0 bei zvE = Grundfreibetrag 12.348', () => expect(eStTarif2026(12348)).toBe(0));
  it('> 0 bei zvE = 12.500 (Zone 2, über Grundfreibetrag)', () => expect(eStTarif2026(12500)).toBeGreaterThan(0));
  it('> 0 bei zvE = 20.000 (Zone 3)', () => expect(eStTarif2026(20000)).toBeGreaterThan(0));
  it('Zone 4: 42 % an 100.000', () => {
    // 0.42 × 100.000 - 10.602,13 = 31.397,87
    expect(eStTarif2026(100000)).toBeCloseTo(31397, 0);
  });
  it('Zone 5: 45 % an 300.000', () => {
    // 0.45 × 300.000 - 18.936,88 = 116.063,12
    expect(eStTarif2026(300000)).toBeCloseTo(116063, 0);
  });
  it('progressiv — 50.000 zahlt mehr als Doppeltes von 25.000', () => {
    // Progressive Besteuerung: Doppeltes Einkommen → mehr als doppelte Steuer
    expect(eStTarif2026(50000)).toBeGreaterThan(2 * eStTarif2026(25000));
  });
});

// ───────────────────────────────────────────────────────────
// Sozialversicherungs-Berechnung
// ───────────────────────────────────────────────────────────

describe('berechneSV — Vollzeit 3.500 €/Monat', () => {
  const sv = berechneSV(3500, 'NW', false, false, 0, 'vollzeit');

  it('RV = 9,30 % × 3.500 = 325,50', () => expect(sv.rv).toBeCloseTo(325.5, 1));
  it('KV = (7,30 + 0,725) % × 3.500 ≈ 280,88', () => expect(sv.kv).toBeCloseTo(280.88, 1));
  it('PV kinderlos = 2,40 % × 3.500 = 84,00 — mit Kind = 1,80 % = 63,00', () => {
    // kinderlos=false → 1,80 %
    expect(sv.pv).toBeCloseTo(63, 0);
  });
  it('AV = 1,30 % × 3.500 = 45,50', () => expect(sv.av).toBeCloseTo(45.5, 1));
  it('keine Warnungen', () => expect(sv.warnungen).toHaveLength(0));
});

describe('berechneSV — Minijob 400 €/Monat', () => {
  const sv = berechneSV(400, 'NW', false, false, 0, 'minijob');
  it('RV = 0', () => expect(sv.rv).toBe(0));
  it('KV = 0', () => expect(sv.kv).toBe(0));
  it('PV = 0', () => expect(sv.pv).toBe(0));
  it('AV = 0', () => expect(sv.av).toBe(0));
  it('Warnung enthält "minijob"', () => expect(sv.warnungen).toContain('minijob'));
});

describe('berechneSV — Midijob 1.000 €/Monat', () => {
  // Midijob bei 1.000 €: reduzierte SV-Basis vs. Vollzeit bei 3.000 € (über Midijob-Grenze)
  const svMidi = berechneSV(1000, 'NW', false, false, 0, 'midijob');
  const svVoll = berechneSV(3000, 'NW', false, false, 0, 'vollzeit');
  it('RV-Rate bei Midijob (1.000 €) < RV-Rate bei Vollzeit (3.000 €) — reduzierte Basis', () =>
    expect(svMidi.rv / 1000).toBeLessThan(svVoll.rv / 3000));
  it('Warnung enthält "midijob"', () => expect(svMidi.warnungen).toContain('midijob'));
});

describe('berechneSV — BBG-Kappung KV/PV bei 6.000 €', () => {
  const sv6000 = berechneSV(6000, 'NW', false, false, 0, 'vollzeit');
  const sv5812 = berechneSV(5812.5, 'NW', false, false, 0, 'vollzeit');
  it('KV identisch über BBG KV/PV', () => expect(sv6000.kv).toBe(sv5812.kv));
  it('PV identisch über BBG KV/PV', () => expect(sv6000.pv).toBe(sv5812.pv));
  it('Warnung enthält "bbg-kv"', () => expect(sv6000.warnungen).toContain('bbg-kv'));
});

describe('berechneSV — BBG-Kappung RV/AV bei 9.000 €', () => {
  const sv9000 = berechneSV(9000, 'NW', false, false, 0, 'vollzeit');
  const sv8450 = berechneSV(8450, 'NW', false, false, 0, 'vollzeit');
  it('RV identisch über BBG RV/AV', () => expect(sv9000.rv).toBe(sv8450.rv));
  it('AV identisch über BBG RV/AV', () => expect(sv9000.av).toBe(sv8450.av));
  it('Warnung enthält "bbg-rv"', () => expect(sv9000.warnungen).toContain('bbg-rv'));
});

describe('berechneSV — Sachsen PV-Sonderregel', () => {
  const svSN = berechneSV(3500, 'SN', false, false, 0, 'vollzeit');
  const svNW = berechneSV(3500, 'NW', false, false, 0, 'vollzeit');
  it('Sachsen-PV > Standard-PV (AN trägt mehr)', () => expect(svSN.pv).toBeGreaterThan(svNW.pv));
  it('Sachsen AN-PV = 2,30 % × 3.500 = 80,50', () => expect(svSN.pv).toBeCloseTo(80.5, 1));
});

describe('berechneSV — Kinderlosenzuschlag', () => {
  const svKinderlos = berechneSV(3500, 'NW', true, false, 0, 'vollzeit');
  const svMitKind = berechneSV(3500, 'NW', false, false, 0, 'vollzeit');
  it('Kinderlose zahlen mehr PV', () => expect(svKinderlos.pv).toBeGreaterThan(svMitKind.pv));
  it('Kinderlos 2,40 % × 3.500 = 84,00', () => expect(svKinderlos.pv).toBeCloseTo(84, 1));
});

// ───────────────────────────────────────────────────────────
// Lohnsteuer
// ───────────────────────────────────────────────────────────

describe('berechneLohnsteuer — Steuerklasse-Vergleich bei 3.500 €/Monat', () => {
  const lst1 = berechneLohnsteuer(3500, 1);
  const lst2 = berechneLohnsteuer(3500, 2);
  const lst3 = berechneLohnsteuer(3500, 3);
  const lst4 = berechneLohnsteuer(3500, 4);
  const lst5 = berechneLohnsteuer(3500, 5);
  const lst6 = berechneLohnsteuer(3500, 6);

  it('SK 3 (Splitting) < SK 1 (Single)', () => expect(lst3).toBeLessThan(lst1));
  it('SK 2 (Alleinerziehend) ≤ SK 1', () => expect(lst2).toBeLessThanOrEqual(lst1));
  it('SK 4 ≈ SK 1', () => expect(lst4).toBeCloseTo(lst1, 0));
  it('SK 5 > SK 1', () => expect(lst5).toBeGreaterThan(lst1));
  it('SK 6 ≥ SK 5', () => expect(lst6).toBeGreaterThanOrEqual(lst5));
  it('SK 1 > 0 bei 3.500 €', () => expect(lst1).toBeGreaterThan(0));
});

describe('berechneLohnsteuer — Grenzwerte', () => {
  it('0 € Brutto → 0 € LSt', () => expect(berechneLohnsteuer(0, 1)).toBe(0));
  it('800 €/Monat SK I → 0 oder sehr wenig (unter Grundfreibetrag)', () => {
    // 800 × 12 = 9.600 < Grundfreibetrag 12.348
    expect(berechneLohnsteuer(800, 1)).toBe(0);
  });
});

// ───────────────────────────────────────────────────────────
// Solidaritätszuschlag
// ───────────────────────────────────────────────────────────

describe('berechneSoli', () => {
  it('0 bei niedrigem Brutto (SK I, 3.500 €)', () => {
    // LSt ~644 €/Monat × 12 = 7.728 < 18.130 Freigrenze
    const lst = berechneLohnsteuer(3500, 1);
    expect(berechneSoli(lst)).toBe(0);
  });
  it('> 0 bei hohem Brutto (SK I, 8.000 €)', () => {
    const lst = berechneLohnsteuer(8000, 1);
    expect(berechneSoli(lst)).toBeGreaterThan(0);
  });
  it('0 bei lst = 0', () => expect(berechneSoli(0)).toBe(0));
});

// ───────────────────────────────────────────────────────────
// Kirchensteuer
// ───────────────────────────────────────────────────────────

describe('berechneKirchensteuer', () => {
  it('8 % auf LSt in Bayern', () => {
    expect(berechneKirchensteuer(100, 'BY')).toBeCloseTo(8, 2);
  });
  it('9 % auf LSt in NRW', () => {
    expect(berechneKirchensteuer(100, 'NW')).toBeCloseTo(9, 2);
  });
  it('0 bei LSt = 0', () => expect(berechneKirchensteuer(0, 'NW')).toBe(0));
});

// ───────────────────────────────────────────────────────────
// Haupt-Berechnung (Integration)
// ───────────────────────────────────────────────────────────

describe('berechne — Minijob (Brutto = Netto)', () => {
  const r = berechne({
    brutto: 400,
    steuerklasse: 1,
    bundesland: 'NW',
    kirchensteuer: false,
    beschaeftigungsart: 'minijob',
    pkv: false,
    pkvBeitragMonatlich: 0,
    kinderlos: false,
  });
  it('Netto = Brutto bei Minijob', () => expect(r.netto).toBe(400));
  it('Gesamtabzüge = 0', () => expect(r.gesamtAbzuege).toBe(0));
  it('Jahres-Netto = 4.800', () => expect(r.jahresNetto).toBe(4800));
});

describe('berechne — Vollzeit SK I, 3.500 €, NW, keine KiSt', () => {
  const r = berechne({
    brutto: 3500,
    steuerklasse: 1,
    bundesland: 'NW',
    kirchensteuer: false,
    beschaeftigungsart: 'vollzeit',
    pkv: false,
    pkvBeitragMonatlich: 0,
    kinderlos: false,
  });
  it('Netto < Brutto', () => expect(r.netto).toBeLessThan(3500));
  it('Netto > 0', () => expect(r.netto).toBeGreaterThan(0));
  it('Gesamtabzüge = Brutto − Netto', () =>
    expect(r.gesamtAbzuege).toBeCloseTo(3500 - r.netto, 2));
  it('Jahres-Netto = 12 × Netto', () =>
    expect(r.jahresNetto).toBeCloseTo(r.netto * 12, 2));
  it('Netto > 2.000 (plausibel)', () => expect(r.netto).toBeGreaterThan(2000));
});

describe('berechne — Kirchensteuer erhöht Abzüge', () => {
  const ohneKiSt = berechne({
    brutto: 3500, steuerklasse: 1, bundesland: 'NW',
    kirchensteuer: false, beschaeftigungsart: 'vollzeit',
    pkv: false, pkvBeitragMonatlich: 0, kinderlos: false,
  });
  const mitKiSt = berechne({
    brutto: 3500, steuerklasse: 1, bundesland: 'NW',
    kirchensteuer: true, beschaeftigungsart: 'vollzeit',
    pkv: false, pkvBeitragMonatlich: 0, kinderlos: false,
  });
  it('mit KiSt → höhere Abzüge', () => expect(mitKiSt.gesamtAbzuege).toBeGreaterThan(ohneKiSt.gesamtAbzuege));
  it('mit KiSt → niedrigeres Netto', () => expect(mitKiSt.netto).toBeLessThan(ohneKiSt.netto));
});

describe('berechne — SK III günstiger als SK I (Splitting)', () => {
  const sk1 = berechne({
    brutto: 5000, steuerklasse: 1, bundesland: 'NW',
    kirchensteuer: false, beschaeftigungsart: 'vollzeit',
    pkv: false, pkvBeitragMonatlich: 0, kinderlos: false,
  });
  const sk3 = berechne({
    brutto: 5000, steuerklasse: 3, bundesland: 'NW',
    kirchensteuer: false, beschaeftigungsart: 'vollzeit',
    pkv: false, pkvBeitragMonatlich: 0, kinderlos: false,
  });
  it('SK III hat niedrigere Lohnsteuer als SK I', () => expect(sk3.lohnsteuer).toBeLessThan(sk1.lohnsteuer));
  it('SK III Netto > SK I Netto', () => expect(sk3.netto).toBeGreaterThan(sk1.netto));
});

describe('berechne — Boundary-Tests (Dossier §8)', () => {
  it('brutto = 603,00 → Minijob, kein Abzug', () => {
    const r = berechne({
      brutto: 603, steuerklasse: 1, bundesland: 'NW',
      kirchensteuer: false, beschaeftigungsart: 'minijob',
      pkv: false, pkvBeitragMonatlich: 0, kinderlos: false,
    });
    expect(r.netto).toBe(603);
  });
  it('brutto = 603,01 → Midijob-Warnung', () => {
    const r = berechne({
      brutto: 603.01, steuerklasse: 1, bundesland: 'NW',
      kirchensteuer: false, beschaeftigungsart: 'midijob',
      pkv: false, pkvBeitragMonatlich: 0, kinderlos: false,
    });
    expect(r.warnungen).toContain('midijob');
  });
});
