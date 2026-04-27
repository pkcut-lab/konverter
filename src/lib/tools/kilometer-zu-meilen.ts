import type { ConverterConfig } from './schemas';
import { unit } from '../i18n/units';

export const kilometerZuMeilen: ConverterConfig = {
  id: 'km-to-mile',
  type: 'converter',
  categoryId: 'laengen',
  units: {
    from: { id: 'km', label: unit('km') },
    to: { id: 'mi', label: unit('mi') },
  },
  formula: { type: 'linear', factor: 0.6213711922 },
  decimals: 4,
  examples: [1, 5, 42.195, 100],
};
