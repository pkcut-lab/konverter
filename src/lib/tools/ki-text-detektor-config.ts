import type { FormatterConfig } from './schemas';

export const kiTextDetektor: FormatterConfig = {
  type: 'formatter',
  id: 'ki-text-detektor',
  categoryId: 'text',
  mode: 'custom',
  format: (t: string) => t,
};
