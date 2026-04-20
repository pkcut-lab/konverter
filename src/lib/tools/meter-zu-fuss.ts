import type { ConverterConfig } from './schemas';

export const meterZuFuss: ConverterConfig = {
  id: 'meter-to-feet',
  type: 'converter',
  categoryId: 'laengen',
  units: {
    from: { id: 'm', label: 'Meter' },
    to: { id: 'ft', label: 'Fuß' },
  },
  formula: { type: 'linear', factor: 3.28084 },
  decimals: 4,
  examples: [1, 10, 100, 1000],
};
