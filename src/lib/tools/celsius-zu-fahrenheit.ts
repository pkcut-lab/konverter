import type { ConverterConfig } from './schemas';

/**
 * Formula is affine because temperature conversions require both scale and
 * offset: °F = °C × 1.8 + 32. The schemas.ts formula union already supports
 * `affine` for exactly this case.
 */
export const celsiusZuFahrenheit: ConverterConfig = {
  id: 'celsius-to-fahrenheit',
  type: 'converter',
  categoryId: 'temperatur',
  units: {
    from: { id: 'c', label: 'Celsius' },
    to: { id: 'f', label: 'Fahrenheit' },
  },
  formula: { type: 'affine', factor: 1.8, offset: 32 },
  decimals: 2,
  examples: [-40, 0, 20, 37, 100],
};
