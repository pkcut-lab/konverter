import type { ConverterConfig } from './schemas';
import { unit } from '../i18n/units';

export const zollZuZentimeter: ConverterConfig = {
  id: 'inch-to-cm',
  type: 'converter',
  categoryId: 'laengen',
  units: {
    from: { id: 'in', label: unit('in') },
    to: { id: 'cm', label: unit('cm') },
  },
  formula: { type: 'linear', factor: 2.54 },
  decimals: 4,
  examples: [1, 5, 10, 55],
};
