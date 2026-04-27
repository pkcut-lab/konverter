/**
 * Re-export of language primitives so the i18n module is self-contained.
 * The canonical single-source-of-truth lives in `../hreflang.ts` (which is also
 * imported by `astro.config.mjs`).
 */
export {
  ACTIVE_LANGUAGES,
  DEFAULT_LANGUAGE,
  type ActiveLanguage as Lang,
} from '../hreflang';
