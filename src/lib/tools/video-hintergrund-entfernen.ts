import type { FileToolConfig } from './schemas';

/**
 * Video-Hintergrund-Entferner — ML-File-Tool (§7a-Ausnahme).
 *
 * Config-only. Actual ML pipeline runs in tool-runtime-registry via a
 * Web-Worker (onnxruntime-web WebGPU-EP + Mediabunny VideoDecoder/Encoder).
 * Spike tasks documented in:
 *   docs/superpowers/specs/2026-04-22-video-hintergrund-entfernen-design.md §9
 *
 * Model toggle:
 *   quality = BiRefNet_lite (MIT, ~50 MB, SOTA hair matting)
 *   speed   = MODNet (Apache-2.0, ~25 MB, real-time WebGPU)
 *
 * Output:
 *   Transparent → WebM+VP9+Alpha (Chrome/Firefox/Edge)
 *                 MP4+Greenscreen #00FF00 (Safari — WebCodecs Issue #377)
 *   Solid color → MP4+H.264
 */
export const videoBgRemove: FileToolConfig = {
  id: 'video-bg-remove',
  type: 'file-tool',
  categoryId: 'video',
  accept: ['video/mp4', 'video/quicktime', 'video/webm'],
  maxSizeMb: 500,
  filenameSuffix: '_no_bg',
  defaultFormat: 'webm',
  showQuality: false,
  presets: {
    id: 'model',
    options: [
      {
        id: 'quality',
        label: { de: 'Qualität', en: 'Quality' },
        subLabel: { de: 'beste Haarkanten', en: 'best hair edges' },
      },
      {
        id: 'speed',
        label: { de: 'Schnell', en: 'Fast' },
        subLabel: { de: 'nahezu Echtzeit', en: 'near real-time' },
      },
    ],
    default: 'quality',
  },
  process: () => {
    throw new Error(
      'video-bg-remove is runtime-only — handled by tool-runtime-registry.',
    );
  },
};
