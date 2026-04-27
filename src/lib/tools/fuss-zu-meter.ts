import type { ConverterConfig } from './schemas';
import { unit } from '../i18n/units';

export const fussZuMeter: ConverterConfig = {
  id: 'foot-to-meter',
  type: 'converter',
  categoryId: 'laengen',
  units: {
    from: { id: 'ft', label: unit('ft') },
    to: { id: 'm', label: unit('m') },
  },
  formula: { type: 'linear', factor: 0.3048 },
  decimals: 4,
  examples: [1, 6, 10, 100],
};
