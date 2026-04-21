import type { ConverterConfig } from './schemas';

export const yardZuMeter: ConverterConfig = {
  id: 'yard-to-meter',
  type: 'converter',
  categoryId: 'laengen',
  units: {
    from: { id: 'yd', label: 'Yard' },
    to: { id: 'm', label: 'Meter' },
  },
  formula: { type: 'linear', factor: 0.9144 },
  decimals: 4,
  examples: [1, 10, 100, 1000],
};
