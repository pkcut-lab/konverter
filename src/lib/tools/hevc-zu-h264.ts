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
      { id: 'original', label: 'Original', subLabel: 'CRF 18 · größte Datei' },
      { id: 'balanced', label: 'Balanced', subLabel: 'CRF 23 · empfohlen' },
      { id: 'small', label: 'Klein', subLabel: 'CRF 28 · kleinste Datei' },
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
