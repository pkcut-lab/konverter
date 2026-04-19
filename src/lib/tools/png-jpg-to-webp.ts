import type { FileToolConfig } from './schemas';
import { processWebp } from './process-webp';

/**
 * Recraft.ai icon prompt — "premium editorial pencil sketch" template
 * (gelockt 2026-04-19 nach Session-7-Smoke-Test). Subjekt-Block + Layout-Satz
 * werden pro Tool ausgetauscht; alle Stil-Sätze bleiben WORTGLEICH zwischen
 * Tools, damit die Icon-Familie visuell kohärent ist.
 *
 * Status: [ ] Generated  [ ] Background-Removed  [ ] Delivered
 *
 * Target: public/icons/tools/png-jpg-to-webp.webp (160x160, CSS 80x80).
 * Pipeline: Recraft → BG-Remover-Tool (Session 9/10) → pending-icons/png-jpg-to-webp.png
 *           → Build-Script konvertiert zu WebP.
 */
export const pngJpgToWebp: FileToolConfig = {
  id: 'png-jpg-to-webp',
  type: 'file-tool',
  categoryId: 'bilder',
  iconPrompt:
    'A premium editorial pencil sketch of two stylized image-file shapes side by ' +
    'side, the left file larger and the right file noticeably smaller and more ' +
    'compact. Minimalist line drawing featuring beautifully textured, bold and ' +
    'expressive graphite strokes. Very clean composition on a pure white ' +
    'background, high contrast monochromatic. No heavy shading, focusing on the ' +
    'raw, authentic texture of a soft graphite pencil. Centered, modern artistic ' +
    'execution, bespoke and unique appearance. A simple right-arrow between the ' +
    'two files, subtle dot-pattern on the smaller file suggesting pixel ' +
    'compression, balanced symmetrical composition.',
  accept: ['image/png', 'image/jpeg'],
  maxSizeMb: 10,
  process: (input, config) =>
    processWebp(input, {
      quality: typeof config?.quality === 'number' ? config.quality : 85,
    }),
};
