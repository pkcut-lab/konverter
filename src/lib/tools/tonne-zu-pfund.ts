import type { ConverterConfig } from './schemas';

export const tonneZuPfund: ConverterConfig = {
  id: 'tonne-to-pound',
  type: 'converter',
  categoryId: 'gewicht',
  units: {
    from: { id: 't', label: 'Tonne' },
    to: { id: 'lb', label: 'Pfund' },
  },
  formula: { type: 'linear', factor: 2204.62 },
  decimals: 2,
  examples: [0.5, 1, 5, 10],
};
