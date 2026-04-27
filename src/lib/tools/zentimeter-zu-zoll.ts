import type { ConverterConfig } from './schemas';
import { unit } from '../i18n/units';

export const zentimeterZuZoll: ConverterConfig = {
  id: 'cm-to-inch',
  type: 'converter',
  categoryId: 'laengen',
  units: {
    from: { id: 'cm', label: unit('cm') },
    to: { id: 'in', label: unit('in') },
  },
  formula: { type: 'linear', factor: 0.3937007874 },
  decimals: 4,
  examples: [1, 10, 30, 100],
};
