import type { ConverterConfig } from './schemas';

export const pfundZuKilogramm: ConverterConfig = {
  id: 'lb-to-kg',
  type: 'converter',
  categoryId: 'gewicht',
  units: {
    from: { id: 'lb', label: 'Pfund' },
    to: { id: 'kg', label: 'Kilogramm' },
  },
  formula: { type: 'linear', factor: 0.453592 },
  decimals: 4,
  examples: [1, 5, 150, 200],
};
