import type { ConverterConfig } from './schemas';

/**
 * Unix Timestamp — converts between seconds (POSIX/Unix) and
 * milliseconds (JavaScript Date.now()). Linear factor 1000.
 * Pure client-side, no server contact.
 */

export const unixTimestamp: ConverterConfig = {
  id: 'unix-timestamp',
  type: 'converter',
  categoryId: 'time',
  units: {
    from: { id: 's', label: 'Sekunden (Unix)' },
    to: { id: 'ms', label: 'Millisekunden (JS)' },
  },
  formula: { type: 'linear', factor: 1000 },
  decimals: 0,
  examples: [0, 86400, 1745230000, 2147483647],
};
