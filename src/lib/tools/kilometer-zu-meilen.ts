import type { ConverterConfig } from './schemas';

export const kilometerZuMeilen: ConverterConfig = {
  id: 'km-to-mile',
  type: 'converter',
  categoryId: 'laengen',
  units: {
    from: { id: 'km', label: 'Kilometer' },
    to: { id: 'mi', label: 'Meilen' },
  },
  formula: { type: 'linear', factor: 0.6213711922 },
  decimals: 4,
  examples: [1, 5, 42.195, 100],
};
