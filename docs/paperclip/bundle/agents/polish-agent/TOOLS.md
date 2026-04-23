# TOOLS — Polish-Agent

## Allowed — Read
- Read: `src/content/tools/**`, `dossiers/**`, `tasks/awaiting-critics/**`, Rulebooks
- Glob, Grep: read-only

## Allowed — Write
- Write: `tasks/polish-suggestions-<slug>-<date>.md`
- Write: `memory/polish-agent-log.md` (append)

## Allowed — Bash
- `node scripts/polish/*.mjs`
- `jq`, `yq`

## Forbidden
- `git *`, Write in `src/**`, `dist/**`, Rulebooks
- Content-Edits (nur Suggestions)
- Rework-Ticket-Dispatch
- Analytics-Writes
- Ship-Status-Änderungen
