import type { ConverterConfig } from './schemas';

/**
 * Recraft.ai icon prompt (Primary — locked with icon-prompt draft).
 * Status: [ ] Pending  [ ] Generated  [ ] Delivered
 * Source: docs/drafts/meter-zu-fuss-icon-prompt.md
 *
 * Target: public/icons/tools/meter-to-feet.webp (160x160, CSS 80x80).
 * After PNG generation: drop 512x512 source into pending-icons/meter-to-feet.png.
 * Build-Script (Session 9) converts to WebP.
 */
export const meterZuFuss: ConverterConfig = {
  id: 'meter-to-feet',
  type: 'converter',
  categoryId: 'laengen',
  iconPrompt:
    'Pencil-sketch icon of a retractable measuring tape partially extended toward ' +
    'a bare human footprint outline, both elements drawn in monochrome graphite gray ' +
    '(#6B7280), single-weight hand-drawn strokes, no shading, no fill, transparent ' +
    'background, minimalist line art, square aspect, balanced composition with tape ' +
    'on the left and footprint on the right, small measurement ticks visible on the ' +
    'tape surface.',
  units: {
    from: { id: 'm', label: 'Meter' },
    to: { id: 'ft', label: 'Fuß' },
  },
  convert: (m: number) => m * 3.28084,
  convertInverse: (ft: number) => ft / 3.28084,
  decimals: 4,
  examples: [1, 10, 100, 1000],
};
