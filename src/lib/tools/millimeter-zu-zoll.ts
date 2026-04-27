import type { ConverterConfig } from './schemas';
import { unit } from '../i18n/units';

export const millimeterZuZoll: ConverterConfig = {
  id: 'mm-to-inch',
  type: 'converter',
  categoryId: 'laengen',
  units: {
    from: { id: 'mm', label: unit('mm') },
    to: { id: 'in', label: unit('in') },
  },
  formula: { type: 'linear', factor: 0.0393701 },
  decimals: 4,
  examples: [1, 10, 25.4, 100, 500, 1000],
};
