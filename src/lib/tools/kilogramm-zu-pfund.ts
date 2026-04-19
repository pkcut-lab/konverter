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
 * WebP mit Alpha. Dateiname: public/icons/tools/kg-to-lb.webp.
 */
export const kilogrammZuPfund: ConverterConfig = {
  id: 'kg-to-lb',
  type: 'converter',
  categoryId: 'gewicht',
  iconPrompt:
    'A premium editorial pencil sketch of a classic two-pan balance scale with ' +
    'a small weight resting on one pan. Minimalist line drawing featuring ' +
    'beautifully textured, bold and expressive graphite strokes. Very clean ' +
    'composition on a pure white background, high contrast monochromatic. No ' +
    'heavy shading, focusing on the raw, authentic texture of a soft graphite ' +
    'pencil. Centered, modern artistic execution, bespoke and unique appearance. ' +
    'Scale slightly tilted to one side, weight as a small cylinder on the heavier pan.',
  units: {
    from: { id: 'kg', label: 'Kilogramm' },
    to: { id: 'lb', label: 'Pfund' },
  },
  formula: { type: 'linear', factor: 2.2046226218 },
  decimals: 4,
  examples: [1, 5, 70, 100],
};
