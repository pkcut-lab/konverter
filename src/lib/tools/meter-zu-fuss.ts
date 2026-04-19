import type { ConverterConfig } from './schemas';

/**
 * Recraft.ai icon prompt — "premium editorial pencil sketch" template
 * (gelockt 2026-04-19 nach Session-7-Smoke-Test). Subjekt-Block + Layout-Satz
 * werden pro Tool ausgetauscht; alle Stil-Sätze bleiben WORTGLEICH zwischen
 * Tools, damit die Icon-Familie visuell kohärent ist.
 *
 * Status: [x] Generated (PNG, white background)  [ ] Background-Removed  [ ] Delivered
 *
 * Target: public/icons/tools/meter-to-feet.webp (160x160, CSS 80x80).
 * Pipeline: Recraft → BG-Remover-Tool (Session 9/10) → pending-icons/meter-to-feet.png
 *           → Build-Script konvertiert zu WebP.
 */
export const meterZuFuss: ConverterConfig = {
  id: 'meter-to-feet',
  type: 'converter',
  categoryId: 'laengen',
  iconPrompt:
    'A premium editorial pencil sketch of a retractable measuring tape extended ' +
    'toward a bare human footprint outline. Minimalist line drawing featuring ' +
    'beautifully textured, bold and expressive graphite strokes. Very clean ' +
    'composition on a pure white background, high contrast monochromatic. No ' +
    'heavy shading, focusing on the raw, authentic texture of a soft graphite ' +
    'pencil. Centered, modern artistic execution, bespoke and unique appearance. ' +
    'Tape on the left with small measurement ticks, footprint on the right, ' +
    'balanced symmetrical composition.',
  units: {
    from: { id: 'm', label: 'Meter' },
    to: { id: 'ft', label: 'Fuß' },
  },
  formula: { type: 'linear', factor: 3.28084 },
  decimals: 4,
  examples: [1, 10, 100, 1000],
};
