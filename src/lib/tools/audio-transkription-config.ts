import type { FormatterConfig } from './schemas';

export const audioTranskriptionConfig: FormatterConfig = {
  type: 'formatter',
  id: 'audio-transkription',
  categoryId: 'audio',
  mode: 'custom',
  format: (t: string) => t,
};
