import type { ConverterConfig } from './schemas';
import { unit } from '../i18n/units';

export const seemeileZuKilometer: ConverterConfig = {
  id: 'nautical-mile-to-km',
  type: 'converter',
  categoryId: 'laengen',
  units: {
    from: { id: 'nmi', label: unit('nmi') },
    to: { id: 'km', label: unit('km') },
  },
  formula: { type: 'linear', factor: 1.852 },
  decimals: 4,
  examples: [1, 10, 100, 1000],
};
