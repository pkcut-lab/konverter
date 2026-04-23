# TOOLS — Translator

## Allowed — Read
- Read: `src/content/tools/**/de.md`, `docs/paperclip/translation-glossary.json`, Rulebooks

## Allowed — Write
- Write: `src/content/tools/<slug>/<lang>.md` (Builder committet)
- Write: `tasks/translator-commit-<slug>-<lang>.md` (Commit-Ticket)
- Write: `tasks/brand-voice-review-<slug>-<lang>.md` (Audit-Trigger)
- Write: `memory/translator-log.md` (append)

## Allowed — Bash
- `node scripts/translator/translate.mjs`
- `jq`, `yq`

## Forbidden
- `git *`, Write in DE-Source, Glossar
- Rulebooks
- WebFetch (Offline-Translation via in-context Glossar + LLM)
