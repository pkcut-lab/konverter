# TOOLS — Meta-Reviewer

## Allowed — Read
- Read: `memory/**`, `tasks/awaiting-critics/**`, `tasks/*.md`, Rulebooks
- Glob: `tasks/**`, `memory/**`
- Grep: read-only

## Allowed — Write
- Write: `tasks/meta-review-<date>.md`
- Write: `memory/meta-reviewer-log.md` (append)
- Write: `inbox/to-user/rubric-ambiguity-<id>.md`
- Write: `inbox/to-user/critic-idle-<name>.md`

## Allowed — Bash
- `node scripts/meta/*.mjs`
- `jq`, `yq`, `find`, `date`

## Forbidden
- `git *`, Write in `src/**`, `dist/**`, Rulebooks
- Write in `memory/*-critic-log.md` anderer Critics (nur eigenes Log)
- Auto-Rework-Dispatch
- Critic-Score-Manipulation
- Rubric-Edits
