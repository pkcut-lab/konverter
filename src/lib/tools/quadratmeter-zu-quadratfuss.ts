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
 * WebP mit Alpha. Dateiname: public/icons/tools/sqm-to-sqft.webp.
 *
 * Note on formula: 1 m² = 10.7639 ft² is the already-squared linear factor
 * (3.28084² = 10.7639). Using `linear` works correctly because the user
 * enters m² and receives ft² directly — no live squaring needed at runtime.
 * The schemas.ts comment mentions `power` as a future extension; not required here.
 */
export const quadratmeterZuQuadratfuss: ConverterConfig = {
  id: 'sqm-to-sqft',
  type: 'converter',
  categoryId: 'flaeche',
  iconPrompt:
    'A premium editorial pencil sketch of a floor plan rectangle with a small ' +
    'tape measure resting along its edge, hinting at area measurement. Minimalist ' +
    'line drawing featuring beautifully textured, bold and expressive graphite ' +
    'strokes. Very clean composition on a pure white background, high contrast ' +
    'monochromatic. No heavy shading, focusing on the raw, authentic texture of a ' +
    'soft graphite pencil. Centered, modern artistic execution, bespoke and unique ' +
    'appearance. Rectangle roughly 4:3 aspect, tape measure along its bottom edge.',
  units: {
    from: { id: 'm2', label: 'Quadratmeter' },
    to: { id: 'ft2', label: 'Quadratfuß' },
  },
  formula: { type: 'linear', factor: 10.7639104 },
  decimals: 4,
  examples: [1, 10, 50, 100],
};
