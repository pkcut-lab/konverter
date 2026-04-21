import type { ConverterConfig } from './schemas';

export const quadratkilometerZuQuadratmeile: ConverterConfig = {
  id: 'km2-to-mi2',
  type: 'converter',
  categoryId: 'flaeche',
  units: {
    from: { id: 'km²', label: 'Quadratkilometer' },
    to: { id: 'mi²', label: 'Quadratmeile' },
  },
  formula: { type: 'linear', factor: 0.386102 },
  decimals: 4,
  examples: [1, 10, 100, 1000],
};
