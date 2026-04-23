# TOOLS — Brand-Voice-Auditor

## Allowed — Read
- Read: `src/content/tools/**`, `docs/paperclip/translation-glossary.json`, Rulebooks

## Allowed — Write
- Write: `tasks/awaiting-critics/<id>/brand-voice-auditor.md`
- Write: `memory/brand-voice-auditor-log.md` (append)
- Write: `inbox/to-ceo/glossary-violation-<slug>-<lang>.md`
- Write: `inbox/to-user/glossary-missing-<lang>.md`

## Allowed — Bash
- `node scripts/brand-voice/*.mjs`
- `jq`, `yq`

## Forbidden
- `git *`, Write in `src/**`, Rulebooks, `docs/paperclip/translation-glossary.json`
- Translator-Output editieren
