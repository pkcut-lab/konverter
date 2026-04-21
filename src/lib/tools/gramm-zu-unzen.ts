import type { ConverterConfig } from './schemas';

export const grammZuUnzen: ConverterConfig = {
  id: 'gram-to-ounce',
  type: 'converter',
  categoryId: 'gewicht',
  units: {
    from: { id: 'g', label: 'Gramm' },
    to: { id: 'oz', label: 'Unzen' },
  },
  formula: { type: 'linear', factor: 0.035274 },
  decimals: 4,
  examples: [1, 100, 250, 500],
};
