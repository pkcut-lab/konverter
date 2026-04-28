import type { FileToolConfig } from './schemas';

export const heicZuJpg: FileToolConfig = {
  id: 'heic-to-jpg',
  type: 'file-tool',
  categoryId: 'image',
  accept: ['image/heic', 'image/heif', '.heic', '.heif'],
  maxSizeMb: 50,
  filenameSuffix: '.jpg',
  defaultFormat: 'jpg',
  cameraCapture: false,
  // HeicKonverterTool.svelte calls convertOne/convertBatch directly — this stub
  // satisfies the FileToolConfig schema but is never invoked at runtime.
  process: async () => {
    throw new Error('heic-to-jpg: routed to HeicKonverterTool, not generic FileTool');
  },
};
