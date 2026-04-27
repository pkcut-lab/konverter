import type { FileToolConfig } from './schemas';

export const hevcZuH264: FileToolConfig = {
  id: 'hevc-to-h264',
  type: 'file-tool',
  categoryId: 'video',
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
      { id: 'original', label: { de: 'Original', en: 'Original' }, subLabel: { de: 'CRF 18 · größte Datei', en: 'CRF 18 · largest file' } },
      { id: 'balanced', label: { de: 'Ausgewogen', en: 'Balanced' }, subLabel: { de: 'CRF 23 · empfohlen', en: 'CRF 23 · recommended' } },
      { id: 'small', label: { de: 'Klein', en: 'Small' }, subLabel: { de: 'CRF 28 · kleinste Datei', en: 'CRF 28 · smallest file' } },
    ],
    default: 'balanced',
  },
  toggles: [
    {
      id: 'downscaleTo1080p',
      label: { de: 'Auf 1080p verkleinern', en: 'Downscale to 1080p' },
      visibleIf: 'source-gt-1080p',
    },
  ],
  process: () => {
    throw new Error(
      'hevc-to-h264 is runtime-only — handled by tool-runtime-registry.',
    );
  },
};
