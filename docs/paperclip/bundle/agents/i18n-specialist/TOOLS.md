# TOOLS — I18n-Specialist

## Allowed — Read
- Read: `dist/**`, `src/content/tools/**`, `astro.config.mjs`, Rulebooks
- Glob, Grep: read

## Allowed — Write
- Write: `tasks/i18n-audit-<date>.md`
- Write: `memory/i18n-specialist-log.md` (append)

## Allowed — Bash
- `node scripts/i18n/*.mjs`
- `jq`, `yq`, `grep`

## Forbidden
- `git *`, Write in `src/**`, `dist/**`, Rulebooks
- Translator-Content-Edits, hreflang-manual (Astro auto-gen)
