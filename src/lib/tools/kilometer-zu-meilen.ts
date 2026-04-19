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
 * WebP mit Alpha. Dateiname: public/icons/tools/km-to-mile.webp.
 */
export const kilometerZuMeilen: ConverterConfig = {
  id: 'km-to-mile',
  type: 'converter',
  categoryId: 'laengen',
  iconPrompt:
    'A premium editorial pencil sketch of a winding country road seen from above ' +
    'with a small distance marker post standing at the side. Minimalist line ' +
    'drawing featuring beautifully textured, bold and expressive graphite strokes. ' +
    'Very clean composition on a pure white background, high contrast monochromatic. ' +
    'No heavy shading, focusing on the raw, authentic texture of a soft graphite ' +
    'pencil. Centered, modern artistic execution, bespoke and unique appearance. ' +
    'Road curves from lower-left to upper-right, marker post on the right side.',
  units: {
    from: { id: 'km', label: 'Kilometer' },
    to: { id: 'mi', label: 'Meilen' },
  },
  formula: { type: 'linear', factor: 0.6213711922 },
  decimals: 4,
  examples: [1, 5, 42.195, 100],
};
