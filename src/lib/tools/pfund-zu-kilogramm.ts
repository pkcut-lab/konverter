import type { ConverterConfig } from './schemas';
import { unit } from '../i18n/units';

export const pfundZuKilogramm: ConverterConfig = {
  id: 'lb-to-kg',
  type: 'converter',
  categoryId: 'gewicht',
  units: {
    from: { id: 'lb', label: unit('lb') },
    to: { id: 'kg', label: unit('kg') },
  },
  formula: { type: 'linear', factor: 0.453592 },
  decimals: 4,
  examples: [1, 5, 150, 200],
};
