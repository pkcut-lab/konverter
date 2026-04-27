import type { ConverterConfig } from './schemas';
import { unit } from '../i18n/units';

export const yardZuMeter: ConverterConfig = {
  id: 'yard-to-meter',
  type: 'converter',
  categoryId: 'laengen',
  units: {
    from: { id: 'yd', label: unit('yd') },
    to: { id: 'm', label: unit('m') },
  },
  formula: { type: 'linear', factor: 0.9144 },
  decimals: 4,
  examples: [1, 10, 100, 1000],
};
