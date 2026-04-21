import type { ConverterConfig } from './schemas';

export const zollZuZentimeter: ConverterConfig = {
  id: 'inch-to-cm',
  type: 'converter',
  categoryId: 'laengen',
  units: {
    from: { id: 'in', label: 'Zoll' },
    to: { id: 'cm', label: 'Zentimeter' },
  },
  formula: { type: 'linear', factor: 2.54 },
  decimals: 4,
  examples: [1, 5, 10, 55],
};
