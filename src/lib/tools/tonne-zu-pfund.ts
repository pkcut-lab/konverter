import type { ConverterConfig } from './schemas';
import { unit } from '../i18n/units';

export const tonneZuPfund: ConverterConfig = {
  id: 'tonne-to-pound',
  type: 'converter',
  categoryId: 'gewicht',
  units: {
    from: { id: 't', label: unit('t') },
    to: { id: 'lb', label: unit('lb') },
  },
  formula: { type: 'linear', factor: 2204.62 },
  decimals: 2,
  examples: [0.5, 1, 5, 10],
};
