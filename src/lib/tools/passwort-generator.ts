import type { GeneratorConfig } from './schemas';

/**
 * Password generator — pure client-side via Web Crypto API.
 * Supports random character passwords with configurable character sets.
 */

const CHARS_LOWER = 'abcdefghijklmnopqrstuvwxyz';
const CHARS_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CHARS_DIGITS = '0123456789';
const CHARS_SPECIAL = '!@#$%^&*()-_=+[]{}|;:,.<>?';

function generatePassword(config?: Record<string, unknown>): string {
  const length = typeof config?.length === 'number' ? config.length : 16;
  const useLower = config?.lower !== false;
  const useUpper = config?.upper !== false;
  const useDigits = config?.digits !== false;
  const useSpecial = config?.special !== false;

  let pool = '';
  if (useLower) pool += CHARS_LOWER;
  if (useUpper) pool += CHARS_UPPER;
  if (useDigits) pool += CHARS_DIGITS;
  if (useSpecial) pool += CHARS_SPECIAL;

  if (pool.length === 0) pool = CHARS_LOWER + CHARS_UPPER + CHARS_DIGITS;

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  let result = '';
  for (let i = 0; i < length; i++) {
    result += pool.charAt(array[i]! % pool.length);
  }
  return result;
}

export const passwortGenerator: GeneratorConfig = {
  id: 'password-generator',
  type: 'generator',
  categoryId: 'dev',
  generate: generatePassword,
  defaultCount: 1,
};
