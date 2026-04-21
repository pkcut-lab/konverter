import type { ConverterConfig } from './schemas';

export const literZuGallonen: ConverterConfig = {
  id: 'liter-to-gallon',
  type: 'converter',
  categoryId: 'volumen',
  units: {
    from: { id: 'l', label: 'Liter' },
    to: { id: 'gal', label: 'Gallone (US)' },
  },
  formula: { type: 'linear', factor: 0.264172 },
  decimals: 4,
  examples: [1, 5, 20, 100],
};
