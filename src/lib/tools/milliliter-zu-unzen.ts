import type { ConverterConfig } from './schemas';
import { unit } from '../i18n/units';

export const milliliterZuUnzen: ConverterConfig = {
  id: 'ml-to-floz',
  type: 'converter',
  categoryId: 'volumen',
  units: {
    from: { id: 'ml', label: unit('ml') },
    to: { id: 'fl oz', label: unit('fl oz') },
  },
  formula: { type: 'linear', factor: 0.033814 },
  decimals: 4,
  examples: [1, 50, 250, 500],
};
