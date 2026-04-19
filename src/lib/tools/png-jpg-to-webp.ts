import type { FileToolConfig } from './schemas';
import { processWebp } from './process-webp';

/**
 * Recraft.ai icon prompt (Primary — locked with icon-prompt draft).
 * Status: [ ] Pending  [ ] Generated  [ ] Delivered
 *
 * Target: public/icons/tools/png-jpg-to-webp.webp (160x160, CSS 80x80).
 * After PNG generation: drop 512x512 source into pending-icons/png-jpg-to-webp.png.
 * Build-Script (Session 9) converts to WebP.
 */
export const pngJpgToWebp: FileToolConfig = {
  id: 'png-jpg-to-webp',
  type: 'file-tool',
  categoryId: 'bilder',
  iconPrompt:
    'Pencil-sketch icon of a stylized image file transforming into a smaller ' +
    'compressed file, both drawn in monochrome graphite gray (#6B7280), ' +
    'single-weight hand-drawn strokes, no shading, no fill, transparent ' +
    'background, minimalist line art, square aspect, balanced composition with ' +
    'a right-arrow between source and target, small dot-pattern suggesting ' +
    'pixel compression on the right file.',
  accept: ['image/png', 'image/jpeg'],
  maxSizeMb: 10,
  process: (input, config) =>
    processWebp(input, {
      quality: typeof config?.quality === 'number' ? config.quality : 85,
    }),
};
