import type { ConverterConfig } from './schemas';
import { unit } from '../i18n/units';

export const grammZuUnzen: ConverterConfig = {
  id: 'gram-to-ounce',
  type: 'converter',
  categoryId: 'gewicht',
  units: {
    from: { id: 'g', label: unit('g') },
    to: { id: 'oz', label: unit('oz') },
  },
  formula: { type: 'linear', factor: 0.035274 },
  decimals: 4,
  examples: [1, 100, 250, 500],
};
