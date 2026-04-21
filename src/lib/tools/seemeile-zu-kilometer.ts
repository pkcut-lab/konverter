import type { ConverterConfig } from './schemas';

export const seemeileZuKilometer: ConverterConfig = {
  id: 'nautical-mile-to-km',
  type: 'converter',
  categoryId: 'laengen',
  units: {
    from: { id: 'nmi', label: 'Seemeile' },
    to: { id: 'km', label: 'Kilometer' },
  },
  formula: { type: 'linear', factor: 1.852 },
  decimals: 4,
  examples: [1, 10, 100, 1000],
};
