import type { ConverterConfig } from './schemas';
import { unit } from '../i18n/units';

export const stoneZuKilogramm: ConverterConfig = {
  id: 'stone-to-kg',
  type: 'converter',
  categoryId: 'gewicht',
  units: {
    from: { id: 'st', label: unit('st') },
    to: { id: 'kg', label: unit('kg') },
  },
  formula: { type: 'linear', factor: 6.35029 },
  decimals: 4,
  examples: [1, 5, 10, 15],
};
