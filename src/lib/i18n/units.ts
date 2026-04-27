import type { LocalizedString } from './types';

/**
 * Unit glossary — single source of truth for all unit display labels.
 *
 * Tool-configs reference units by `unitId` (e.g. `'m'`, `'ft'`); the
 * Converter shell looks up the localised label here at render time.
 *
 * Adding a new language to `Lang` makes every entry here a TypeScript
 * compile-error until the new translation is filled in. That is the
 * whole point — a new language touches THIS file (and a few others),
 * not 73 individual tool-configs.
 *
 * Unit-ids are NOT translated (they are stable identifiers used in URL
 * params, formula keys, JSON-LD). Display labels ARE translated.
 */

export const UNITS = {
  // ── Length ────────────────────────────────────────────────────────
  m:    { de: 'Meter',          en: 'Meters' },
  ft:   { de: 'Fuß',            en: 'Feet' },
  cm:   { de: 'Zentimeter',     en: 'Centimeters' },
  in:   { de: 'Zoll',           en: 'Inches' },
  mm:   { de: 'Millimeter',     en: 'Millimeters' },
  km:   { de: 'Kilometer',      en: 'Kilometers' },
  mi:   { de: 'Meilen',         en: 'Miles' },
  nmi:  { de: 'Seemeile',       en: 'Nautical miles' },
  yd:   { de: 'Yard',           en: 'Yards' },

  // ── Weight ────────────────────────────────────────────────────────
  kg:   { de: 'Kilogramm',      en: 'Kilograms' },
  lb:   { de: 'Pfund',          en: 'Pounds' },
  g:    { de: 'Gramm',          en: 'Grams' },
  oz:   { de: 'Unzen',          en: 'Ounces' },
  st:   { de: 'Stone',          en: 'Stone' },
  t:    { de: 'Tonne',          en: 'Tonnes' },

  // ── Area ──────────────────────────────────────────────────────────
  m2:   { de: 'Quadratmeter',       en: 'Square meters' },
  ft2:  { de: 'Quadratfuß',         en: 'Square feet' },
  ha:   { de: 'Hektar',             en: 'Hectares' },
  ac:   { de: 'Acre',               en: 'Acres' },
  'km²': { de: 'Quadratkilometer',  en: 'Square kilometers' },
  'mi²': { de: 'Quadratmeile',      en: 'Square miles' },

  // ── Volume ────────────────────────────────────────────────────────
  l:    { de: 'Liter',          en: 'Liters' },
  gal:  { de: 'Gallone (US)',   en: 'US gallons' },
  ml:   { de: 'Milliliter',     en: 'Milliliters' },
  'fl oz': { de: 'Flüssigunze (US)', en: 'US fluid ounces' },

  // ── Temperature ───────────────────────────────────────────────────
  c:    { de: 'Celsius',        en: 'Celsius' },
  f:    { de: 'Fahrenheit',     en: 'Fahrenheit' },
} as const satisfies Record<string, LocalizedString>;

export type UnitId = keyof typeof UNITS;

/** Look up the localised label for a unit-id. Throws if unknown — that's
 *  intentional: an unknown id is a bug in the tool-config, not a runtime
 *  user error to be silently swallowed. */
export function unit(id: UnitId): LocalizedString {
  return UNITS[id];
}
