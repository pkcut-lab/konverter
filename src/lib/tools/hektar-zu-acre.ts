import type { ConverterConfig } from './schemas';
import { unit } from '../i18n/units';

export const hektarZuAcre: ConverterConfig = {
  id: 'hectare-to-acre',
  type: 'converter',
  categoryId: 'flaeche',
  units: {
    from: { id: 'ha', label: unit('ha') },
    to: { id: 'ac', label: unit('ac') },
  },
  formula: { type: 'linear', factor: 2.47105 },
  decimals: 4,
  examples: [1, 10, 100, 1000],
};
