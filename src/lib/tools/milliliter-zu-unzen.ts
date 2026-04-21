import type { ConverterConfig } from './schemas';

export const milliliterZuUnzen: ConverterConfig = {
  id: 'ml-to-floz',
  type: 'converter',
  categoryId: 'volumen',
  units: {
    from: { id: 'ml', label: 'Milliliter' },
    to: { id: 'fl oz', label: 'Flüssigunze (US)' },
  },
  formula: { type: 'linear', factor: 0.033814 },
  decimals: 4,
  examples: [1, 50, 250, 500],
};
