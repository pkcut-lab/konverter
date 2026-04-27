import type { ConverterConfig } from './schemas';
import { unit } from '../i18n/units';

export const literZuGallonen: ConverterConfig = {
  id: 'liter-to-gallon',
  type: 'converter',
  categoryId: 'volumen',
  units: {
    from: { id: 'l', label: unit('l') },
    to: { id: 'gal', label: unit('gal') },
  },
  formula: { type: 'linear', factor: 0.264172 },
  decimals: 4,
  examples: [1, 5, 20, 100],
};
