import { describe, it, expect } from 'vitest';
import { parseToolConfig } from '../../../src/lib/tools/schemas';
import {
  kgvRechner,
  computeKgv,
  formatDE,
} from '../../../src/lib/tools/kgv-rechner';

describe('kgvRechner config', () => {
  it('parses as valid FormatterConfig', () => {
    const r = parseToolConfig(kgvRechner);
    expect(r.ok).toBe(true);
  });

  it('has correct identity fields', () => {
    expect(kgvRechner.id).toBe('kgv-calculator');
    expect(kgvRechner.type).toBe('formatter');
    expect(kgvRechner.categoryId).toBe('finance');
    expect(kgvRechner.mode).toBe('custom');
  });

  it('rejects invalid modification (empty categoryId)', () => {
    const broken = { ...kgvRechner, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
});

describe('computeKgv — Standardfälle', () => {
  it('KGV 20 für Kurs 120, EPS 6 → KGV 20, Gewinnrendite 5 %', () => {
    const out = computeKgv(120, 6);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.kgv).toBe(20);
    expect(out.result.gewinnrendite).toBe(5);
  });

  it('KGV 14 → Ampel "guenstig" (< 15)', () => {
    const out = computeKgv(140, 10);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.kgv).toBe(14);
    expect(out.result.ampel).toBe('guenstig');
  });

  it('KGV 18 → Ampel "moderat" (15–22)', () => {
    const out = computeKgv(180, 10);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.kgv).toBe(18);
    expect(out.result.ampel).toBe('moderat');
  });

  it('KGV 25 → Ampel "teuer" (> 22)', () => {
    const out = computeKgv(250, 10);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.kgv).toBe(25);
    expect(out.result.ampel).toBe('teuer');
  });

  it('Gewinnrendite = 1/KGV × 100 (Beispiel: KGV 20 → 5 %)', () => {
    const out = computeKgv(200, 10);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.gewinnrendite).toBeCloseTo(5, 2);
  });

  it('enthält nicht-leeren Formel-Text', () => {
    const out = computeKgv(120, 6);
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.formelText).toBeTruthy();
    expect(out.result.formelText).toContain('÷');
  });
});

describe('computeKgv — Edge-Cases', () => {
  it('EPS = 0 → Fehler eps-zero', () => {
    const out = computeKgv(100, 0);
    expect(out.ok).toBe(false);
    if (out.ok) return;
    expect(out.error.kind).toBe('eps-zero');
  });

  it('EPS < 0 (Verlust) → Fehler eps-negativ', () => {
    const out = computeKgv(100, -5);
    expect(out.ok).toBe(false);
    if (out.ok) return;
    expect(out.error.kind).toBe('eps-negativ');
    expect(out.error.message).toContain('Verluste');
  });

  it('Kurs = 0 → Fehler kurs-invalid', () => {
    const out = computeKgv(0, 5);
    expect(out.ok).toBe(false);
    if (out.ok) return;
    expect(out.error.kind).toBe('kurs-invalid');
  });

  it('Kurs < 0 → Fehler kurs-invalid', () => {
    const out = computeKgv(-10, 5);
    expect(out.ok).toBe(false);
    if (out.ok) return;
    expect(out.error.kind).toBe('kurs-invalid');
  });

  it('KGV < 5 → warnBadge "value-trap"', () => {
    const out = computeKgv(20, 10); // KGV = 2
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.warnBadge).toBe('value-trap');
  });

  it('KGV > 60 → warnBadge "growth-premium"', () => {
    const out = computeKgv(1000, 10); // KGV = 100
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.warnBadge).toBe('growth-premium');
  });

  it('KGV zwischen 5 und 60 → kein warnBadge', () => {
    const out = computeKgv(150, 10); // KGV = 15
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.result.warnBadge).toBeNull();
  });
});

describe('formatDE', () => {
  it('formatiert 1234.56 → "1.234,56" (DE-Locale)', () => {
    expect(formatDE(1_234.56)).toBe('1.234,56');
  });

  it('formatiert 20 → "20,00"', () => {
    expect(formatDE(20)).toBe('20,00');
  });

  it('gibt leeren String für NaN zurück', () => {
    expect(formatDE(NaN)).toBe('');
  });

  it('gibt leeren String für Infinity zurück', () => {
    expect(formatDE(Infinity)).toBe('');
  });
});
