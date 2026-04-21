import type { ValidatorConfig } from './schemas';

/**
 * Regex Tester — validates whether a given string is a syntactically valid
 * JavaScript regular expression pattern.
 * Pure client-side, no server contact.
 */

function validateRegex(input: string): boolean {
  try {
    new RegExp(input);
    return true;
  } catch {
    return false;
  }
}

export const regexTester: ValidatorConfig = {
  id: 'regex-tester',
  type: 'validator',
  categoryId: 'dev',
  rule: 'Valid JavaScript RegExp syntax',
  validate: validateRegex,
};
