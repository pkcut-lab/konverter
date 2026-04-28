import type { FileToolConfig } from './schemas';

export const heicZuPng: FileToolConfig = {
  id: 'heic-to-png',
  type: 'file-tool',
  categoryId: 'image',
  accept: ['image/heic', 'image/heif', '.heic', '.heif'],
  maxSizeMb: 50,
  filenameSuffix: '.png',
  defaultFormat: 'png',
  cameraCapture: false,
  process: async () => {
    throw new Error('heic-to-png: routed to HeicKonverterTool, not generic FileTool');
  },
};
