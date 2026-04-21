import type { ConverterConfig } from './schemas';

export const hektarZuAcre: ConverterConfig = {
  id: 'hectare-to-acre',
  type: 'converter',
  categoryId: 'flaeche',
  units: {
    from: { id: 'ha', label: 'Hektar' },
    to: { id: 'ac', label: 'Acre' },
  },
  formula: { type: 'linear', factor: 2.47105 },
  decimals: 4,
  examples: [1, 10, 100, 1000],
};
