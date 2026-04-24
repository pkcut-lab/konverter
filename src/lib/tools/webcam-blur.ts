import type { InteractiveConfig } from './schemas';

export const webcamHintergrundUnschaerfe: InteractiveConfig = {
  id: 'webcam-blur',
  type: 'interactive',
  categoryId: 'video',
  canvasKind: 'canvas',
  exportFormats: ['png'],
};
