import type { FormatterConfig } from './schemas';

/**
 * JSON Formatter — beautifies raw JSON with configurable indentation.
 * Pure client-side, no server contact. Supports standard JSON (RFC 8259).
 */

function formatJson(input: string): string {
  const trimmed = input.trim();
  if (trimmed === '') {
    throw new Error('Bitte JSON eingeben oder eine Datei laden.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (e) {
    const msg = e instanceof SyntaxError ? e.message : 'Unbekannter Fehler';
    throw new Error(`Syntaxfehler: ${msg}`);
  }

  return JSON.stringify(parsed, null, 2);
}

export const jsonFormatter: FormatterConfig = {
  id: 'json-formatter',
  type: 'formatter',
  categoryId: 'dev',
  mode: 'pretty',
  format: formatJson,
  placeholder: '{"name":"Ada","role":"dev","tags":["astro","svelte"]}',
};
