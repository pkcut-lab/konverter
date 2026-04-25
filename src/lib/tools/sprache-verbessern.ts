import type { FileToolConfig } from './schemas';
import { prepareSpeechEnhancementModel, enhanceSpeech } from './speech-enhancer';

export const spracheVerbessern: FileToolConfig = {
  id: 'speech-enhancer',
  type: 'file-tool',
  categoryId: 'audio',
  /**
   * Audio-only input for V1. Video extraction (MP4/MOV → audio track) requires
   * ffmpeg.wasm which is not yet a project dependency. Tracked as V1.1.
   */
  accept: [
    'audio/wav',
    'audio/mpeg',         // MP3
    'audio/mp4',          // M4A / AAC
    'audio/ogg',          // OGG Vorbis
    'audio/flac',
    'audio/webm',         // WebM Opus
  ],
  maxSizeMb: 500,
  filenameSuffix: '_enhanced',
  showQuality: false,
  cameraCapture: false,
  resetLabel: 'Neue Aufnahme',
  /**
   * Strength-presets — map to `atten_lim_db` in DeepFilterNet3.
   * Default 20 dB (Dezent) — matches §4 user-pain mitigation: natural sound
   * at 30 % intensity per ThePodcastConsultant 2026 recommendation.
   */
  presets: {
    id: 'strength',
    options: [
      { id: '0',   label: 'Bypass',  subLabel: 'kein Filter' },
      { id: '20',  label: 'Dezent',  subLabel: '20 dB · empfohlen' },
      { id: '40',  label: 'Mittel',  subLabel: '40 dB' },
      { id: '100', label: 'Maximal', subLabel: '100 dB · kann robotisch klingen' },
    ],
    default: '20',
  },
  prepare: (onProgress) => prepareSpeechEnhancementModel(onProgress),
  process: (input, config) =>
    enhanceSpeech(input, {
      attenLimDb:
        typeof config?.strength === 'string'
          ? parseInt(config.strength, 10)
          : 20,
    }),
};
