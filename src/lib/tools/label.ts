import type { Lang } from '../i18n/lang';
import { DEFAULT_LANGUAGE } from '../i18n/lang';
import type { LocalizableLabel } from './schemas';

/**
 * Resolve a `LocalizableLabel` (string OR Record<Lang,string>) to a single
 * string for the given language.
 *
 * - `string` legacy values are returned unchanged. They are typically German
 *   (the default language); the lint guard prevents NEW string literals from
 *   slipping into components, so this branch only handles already-checked-in
 *   tool-configs awaiting migration.
 * - `LocalizedString` values are looked up by `lang` with a fallback to the
 *   default language. Strict `LocalizedString` enforcement at the Zod schema
 *   guarantees the fallback is always populated.
 */
export function resolveLabel(value: LocalizableLabel, lang: Lang): string {
  if (typeof value === 'string') return value;
  return value[lang] ?? value[DEFAULT_LANGUAGE] ?? '';
}
