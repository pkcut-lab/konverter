import type { ConverterConfig } from './schemas';
import { unit } from '../i18n/units';

export const meterZuFuss: ConverterConfig = {
  id: 'meter-to-feet',
  type: 'converter',
  categoryId: 'laengen',
  units: {
    from: { id: 'm', label: unit('m') },
    to: { id: 'ft', label: unit('ft') },
  },
  formula: { type: 'linear', factor: 3.28084 },
  decimals: 4,
  examples: [1, 10, 100, 1000],
};
