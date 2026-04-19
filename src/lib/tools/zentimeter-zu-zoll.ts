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
 * WebP mit Alpha. Dateiname: public/icons/tools/cm-to-inch.webp.
 */
export const zentimeterZuZoll: ConverterConfig = {
  id: 'cm-to-inch',
  type: 'converter',
  categoryId: 'laengen',
  iconPrompt:
    'A premium editorial pencil sketch of a small wooden ruler segment with ' +
    'centimeter ticks on one edge and inch ticks on the other edge. Minimalist ' +
    'line drawing featuring beautifully textured, bold and expressive graphite ' +
    'strokes. Very clean composition on a pure white background, high contrast ' +
    'monochromatic. No heavy shading, focusing on the raw, authentic texture of a ' +
    'soft graphite pencil. Centered, modern artistic execution, bespoke and unique ' +
    'appearance. Ruler oriented slightly diagonal, balanced composition.',
  units: {
    from: { id: 'cm', label: 'Zentimeter' },
    to: { id: 'in', label: 'Zoll' },
  },
  formula: { type: 'linear', factor: 0.3937007874 },
  decimals: 4,
  examples: [1, 10, 30, 100],
};
