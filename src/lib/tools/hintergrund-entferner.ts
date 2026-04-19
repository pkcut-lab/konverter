import type { FileToolConfig } from './schemas';
import {
  removeBackground,
  prepareBackgroundRemovalModel,
  reencodeLastResult,
} from './remove-background';

/**
 * Recraft.ai icon prompt — "premium editorial pencil sketch" template
 * (gelockt 2026-04-19). Subjekt-Block + Layout-Satz werden pro Tool
 * ausgetauscht; alle Stil-Sätze bleiben WORTGLEICH.
 *
 * Status: [ ] Generated  [ ] Background-Removed  [ ] Delivered
 *
 * Target: public/icons/tools/remove-background.webp (160x160, CSS 80x80).
 * Pipeline: Recraft -> dieses Tool selbst (Doppel-Hebel!) -> WebP-Konverter.
 */
export const hintergrundEntferner: FileToolConfig = {
  id: 'remove-background',
  type: 'file-tool',
  categoryId: 'bilder',
  iconPrompt:
    'A premium editorial pencil sketch of a portrait silhouette being lifted ' +
    'cleanly off a textured background square, the silhouette floating slightly ' +
    'above with the background fading at the edges. Minimalist line drawing ' +
    'featuring beautifully textured, bold and expressive graphite strokes. Very ' +
    'clean composition on a pure white background, high contrast monochromatic. ' +
    'No heavy shading, focusing on the raw, authentic texture of a soft graphite ' +
    'pencil. Centered, modern artistic execution, bespoke and unique appearance. ' +
    'Subtle dotted outline around the silhouette indicating selection, ' +
    'background square anchored at the bottom, balanced asymmetrical composition.',
  accept: ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/heic', 'image/heif'],
  maxSizeMb: 15,
  defaultFormat: 'png',
  filenameSuffix: '_no-bg',
  showQuality: false,
  prepare: (onProgress) => prepareBackgroundRemovalModel(onProgress),
  process: (input, config) =>
    removeBackground(input, {
      format:
        typeof config?.format === 'string' &&
        (config.format === 'png' || config.format === 'webp' || config.format === 'jpg')
          ? config.format
          : 'png',
    }),
};

/** Re-export for runtime-registry consumption. */
export { reencodeLastResult };
