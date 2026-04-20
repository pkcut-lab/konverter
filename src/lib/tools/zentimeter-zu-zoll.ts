import type { ConverterConfig } from './schemas';

export const zentimeterZuZoll: ConverterConfig = {
  id: 'cm-to-inch',
  type: 'converter',
  categoryId: 'laengen',
  units: {
    from: { id: 'cm', label: 'Zentimeter' },
    to: { id: 'in', label: 'Zoll' },
  },
  formula: { type: 'linear', factor: 0.3937007874 },
  decimals: 4,
  examples: [1, 10, 30, 100],
};
