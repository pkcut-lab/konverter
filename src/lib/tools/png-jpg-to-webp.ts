import type { FileToolConfig } from './schemas';
import { processWebp } from './process-webp';

export const pngJpgToWebp: FileToolConfig = {
  id: 'png-jpg-to-webp',
  type: 'file-tool',
  categoryId: 'bilder',
  accept: ['image/png', 'image/jpeg'],
  maxSizeMb: 10,
  process: (input, config) =>
    processWebp(input, {
      quality: typeof config?.quality === 'number' ? config.quality : 85,
    }),
};
