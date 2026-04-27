import type { ConverterConfig } from './schemas';
import { unit } from '../i18n/units';

export const quadratkilometerZuQuadratmeile: ConverterConfig = {
  id: 'km2-to-mi2',
  type: 'converter',
  categoryId: 'flaeche',
  units: {
    from: { id: 'km²', label: unit('km²') },
    to: { id: 'mi²', label: unit('mi²') },
  },
  formula: { type: 'linear', factor: 0.386102 },
  decimals: 4,
  examples: [1, 10, 100, 1000],
};
