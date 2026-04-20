import type { FileToolConfig } from './schemas';

/**
 * Recraft.ai icon prompt — "premium editorial pencil sketch" template
 * (gelockt 2026-04-19). Subjekt-Block + Layout-Satz pro Tool, Stil-Sätze
 * bleiben WORTGLEICH zu den anderen Pencil-Sketch-Icons.
 *
 * Status: [ ] Generated  [ ] Background-Removed  [ ] Delivered
 *
 * Target: public/icons/tools/hevc-to-h264.webp (160x160, CSS 80x80).
 */
export const hevcZuH264: FileToolConfig = {
  id: 'hevc-to-h264',
  type: 'file-tool',
  categoryId: 'video',
  iconPrompt:
    'A premium editorial pencil sketch of a smartphone on the left and a desktop ' +
    'monitor on the right, with a small video-play-triangle flowing between them ' +
    'along a curved arrow. Minimalist line drawing featuring beautifully textured, ' +
    'bold and expressive graphite strokes. Very clean composition on a pure white ' +
    'background, high contrast monochromatic. No heavy shading, focusing on the ' +
    'raw, authentic texture of a soft graphite pencil. Centered, modern artistic ' +
    'execution, bespoke and unique appearance. Balanced composition with the ' +
    'play-triangle emphasised mid-flow between the two devices.',
  accept: [
    'video/quicktime',
    'video/mp4',
    'video/hevc',
    'video/h265',
  ],
  maxSizeMb: 500,
  defaultFormat: 'mp4',
  filenameSuffix: '_h264',
  showQuality: false,
  presets: {
    id: 'preset',
    options: [
      { id: 'original', label: 'Original-Qualität' },
      { id: 'balanced', label: 'Balanced' },
      { id: 'small', label: 'Klein' },
    ],
    default: 'balanced',
  },
  toggles: [
    {
      id: 'downscaleTo1080p',
      label: 'Auf 1080p verkleinern',
      visibleIf: 'source-gt-1080p',
    },
  ],
  process: () => {
    throw new Error(
      'hevc-to-h264 is runtime-only — handled by tool-runtime-registry.',
    );
  },
};
