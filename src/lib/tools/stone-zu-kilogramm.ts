import type { ConverterConfig } from './schemas';

export const stoneZuKilogramm: ConverterConfig = {
  id: 'stone-to-kg',
  type: 'converter',
  categoryId: 'gewicht',
  units: {
    from: { id: 'st', label: 'Stone' },
    to: { id: 'kg', label: 'Kilogramm' },
  },
  formula: { type: 'linear', factor: 6.35029 },
  decimals: 4,
  examples: [1, 5, 10, 15],
};
