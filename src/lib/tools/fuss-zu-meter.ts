import type { ConverterConfig } from './schemas';

export const fussZuMeter: ConverterConfig = {
  id: 'foot-to-meter',
  type: 'converter',
  categoryId: 'laengen',
  units: {
    from: { id: 'ft', label: 'Fuß' },
    to: { id: 'm', label: 'Meter' },
  },
  formula: { type: 'linear', factor: 0.3048 },
  decimals: 4,
  examples: [1, 6, 10, 100],
};
