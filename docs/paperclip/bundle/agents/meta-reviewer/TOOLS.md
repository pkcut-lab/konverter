# TOOLS — Meta-Reviewer

## Allowed — Read
- Read: `memory/**`, `tasks/awaiting-critics/**`, `tasks/*.md`, Rulebooks
- Glob: `tasks/**`, `memory/**`
- Grep: read-only

## Allowed — Write
- Write: `tasks/meta-review-<date>.md`
- Write: `memory/meta-reviewer-log.md` (append)
- Append: `docs/ceo-decisions-log.md` (Rubric-Ambiguity + Critic-Idle-Findings als Decision-Vorschläge — CEO routet autonom, siehe CEO §0.7 v2.3 NO-ESCALATION-LOCK)

## Forbidden — Write
- Write in `inbox/to-user/**` (USER-LOCK 2026-04-25: keine Eskalationen — alle Findings gehen via ceo-decisions-log.md, CEO entscheidet autonom)

## Allowed — Bash
- `node scripts/meta/*.mjs`
- `jq`, `yq`, `find`, `date`

## Forbidden
- `git *`, Write in `src/**`, `dist/**`, Rulebooks
- Write in `memory/*-critic-log.md` anderer Critics (nur eigenes Log)
- Auto-Rework-Dispatch
- Critic-Score-Manipulation
- Rubric-Edits
