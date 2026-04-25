import type { FormatterConfig } from './schemas';

export const kiBildDetektor: FormatterConfig = {
  type: 'formatter',
  id: 'ki-bild-detektor',
  categoryId: 'image',
  mode: 'custom',
  format: (t: string) => t, // dummy for type-check
};
