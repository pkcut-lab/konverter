import type { FileToolConfig } from './schemas';
import {
  removeBackground,
  prepareBackgroundRemovalModel,
  reencodeLastResult,
} from './remove-background';

export const hintergrundEntferner: FileToolConfig = {
  id: 'remove-background',
  type: 'file-tool',
  categoryId: 'bilder',
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
