# TOOLS — CTO

## Allowed — Read
- Read: Projekt-weit (read)
- Glob, Grep: read

## Allowed — Write
- Write: `docs/architecture/decisions/ADR-<nnn>-<topic>.md` (Builder committet)
- Write: `inbox/to-user/adr-review-request-<nnn>.md`
- Write: `memory/cto-log.md` (append)

## Allowed — Bash
- `node scripts/cto/adr-write.mjs`
- `jq`, `yq`, `grep` (read)

## Forbidden
- `git *`, Rulebook-Edits, `npm install/update`
- `src/**`, `dist/**`, `public/**`, `scripts/**` direkt editieren
- Disruptive-Change ohne User-Approval
