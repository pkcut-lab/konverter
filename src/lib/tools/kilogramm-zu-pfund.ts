import type { ConverterConfig } from './schemas';

export const kilogrammZuPfund: ConverterConfig = {
  id: 'kg-to-lb',
  type: 'converter',
  categoryId: 'gewicht',
  units: {
    from: { id: 'kg', label: 'Kilogramm' },
    to: { id: 'lb', label: 'Pfund' },
  },
  formula: { type: 'linear', factor: 2.20462262185 },
  decimals: 4,
  examples: [1, 5, 70, 100],
};
