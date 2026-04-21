import type { ConverterConfig } from './schemas';

export const millimeterZuZoll: ConverterConfig = {
  id: 'mm-to-inch',
  type: 'converter',
  categoryId: 'laengen',
  units: {
    from: { id: 'mm', label: 'Millimeter' },
    to: { id: 'in', label: 'Zoll' },
  },
  formula: { type: 'linear', factor: 0.0393701 },
  decimals: 4,
  examples: [1, 10, 25.4, 100, 500, 1000],
};
