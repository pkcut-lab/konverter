import type { ConverterConfig } from './schemas';
import { unit } from '../i18n/units';

export const kilogrammZuPfund: ConverterConfig = {
  id: 'kg-to-lb',
  type: 'converter',
  categoryId: 'gewicht',
  units: {
    from: { id: 'kg', label: unit('kg') },
    to: { id: 'lb', label: unit('lb') },
  },
  formula: { type: 'linear', factor: 2.20462262185 },
  decimals: 4,
  examples: [1, 5, 70, 100],
};
