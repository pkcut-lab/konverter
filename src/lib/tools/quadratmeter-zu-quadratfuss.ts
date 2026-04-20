import type { ConverterConfig } from './schemas';

/**
 * Note on formula: 1 m² = 10.7639 ft² is the already-squared linear factor
 * (3.28084² = 10.7639). Using `linear` works correctly because the user
 * enters m² and receives ft² directly — no live squaring needed at runtime.
 * The schemas.ts comment mentions `power` as a future extension; not required here.
 */
export const quadratmeterZuQuadratfuss: ConverterConfig = {
  id: 'sqm-to-sqft',
  type: 'converter',
  categoryId: 'flaeche',
  units: {
    from: { id: 'm2', label: 'Quadratmeter' },
    to: { id: 'ft2', label: 'Quadratfuß' },
  },
  formula: { type: 'linear', factor: 10.7639104 },
  decimals: 4,
  examples: [1, 10, 50, 100],
};
