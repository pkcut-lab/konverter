# TOOLS — Content-Refresher

## Allowed — Read
- Read: `memory/dossier-cache-index.md`, `tasks/**`, `inbox/**`, Rulebooks
- Glob: `tasks/**`, `inbox/**`

## Allowed — Write
- Write: `tasks/refresh-request-<slug>-<date>.md`
- Write: `memory/content-refresher-log.md` (append)

## Allowed — Network
- WebFetch to `developers.google.com/search/blog` (Algorithm-Updates)

## Allowed — Bash
- `node scripts/refresh/*.mjs`
- `jq`, `yq`, `find`, `date`

## Forbidden
- `git *`, Write in `src/**`, `dist/**`, Rulebooks
- Content-Edits, Rewrite-Tickets, Dossier-Refresh-Dispatch direkt
- Mehrere Refresh-Tickets pro Tool/Woche
