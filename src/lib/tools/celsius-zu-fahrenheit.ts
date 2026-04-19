import type { ConverterConfig } from './schemas';

/**
 * Recraft.ai icon prompt — "premium editorial pencil sketch" template
 * (gelockt 2026-04-19 nach Session-7-Smoke-Test). Subjekt-Block + Layout-Satz
 * werden pro Tool ausgetauscht; alle Stil-Sätze bleiben WORTGLEICH zwischen
 * Tools, damit die Icon-Familie visuell kohärent ist.
 *
 * Status: [ ] Generated  [ ] Background-Removed  [ ] Delivered
 *
 * Pipeline: Recraft → BG-Remover-Tool (/de/hintergrund-entfernen) →
 * WebP mit Alpha. Dateiname: public/icons/tools/celsius-to-fahrenheit.webp.
 *
 * Formula is affine because temperature conversions require both scale and
 * offset: °F = °C × 1.8 + 32. The schemas.ts formula union already supports
 * `affine` for exactly this case.
 */
export const celsiusZuFahrenheit: ConverterConfig = {
  id: 'celsius-to-fahrenheit',
  type: 'converter',
  categoryId: 'temperatur',
  iconPrompt:
    'A premium editorial pencil sketch of a classic vertical mercury thermometer ' +
    'with tick marks along its length and a rounded bulb at the bottom. Minimalist ' +
    'line drawing featuring beautifully textured, bold and expressive graphite ' +
    'strokes. Very clean composition on a pure white background, high contrast ' +
    'monochromatic. No heavy shading, focusing on the raw, authentic texture of a ' +
    'soft graphite pencil. Centered, modern artistic execution, bespoke and unique ' +
    'appearance. Thermometer oriented vertically, mercury column partially filled.',
  units: {
    from: { id: 'c', label: 'Celsius' },
    to: { id: 'f', label: 'Fahrenheit' },
  },
  formula: { type: 'affine', factor: 1.8, offset: 32 },
  decimals: 2,
  examples: [-40, 0, 20, 37, 100],
};
