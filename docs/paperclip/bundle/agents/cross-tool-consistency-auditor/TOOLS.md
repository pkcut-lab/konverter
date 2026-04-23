# TOOLS — Cross-Tool-Consistency-Auditor

## Allowed — Read
- Read: `src/content/tools/**`, `dossiers/**`, Rulebooks
- Glob: `src/content/tools/**`
- Grep: `src/content/tools/**` (read)

## Allowed — Write
- Write: `tasks/consistency-audit-<cat>-<date>.md`
- Write: `inbox/to-ceo/category-drift-<cat>.md`
- Write: `inbox/to-ceo/missing-divergence-rationale-<slug>.md`
- Write: `memory/consistency-auditor-log.md` (append)

## Allowed — Bash
- `bash evals/consistency-auditor/run-smoke.sh`
- `node scripts/consistency/*.mjs`
- `jq`, `yq`, `find`, `grep` (read)

## Forbidden
- `git *`, Write in `src/**`, `dist/**`, Rulebooks
- Cross-Category-Audits
- Unique-Tool-Drift ohne Dossier-§9-Check
- Style-Opinion (Rubrik-gebunden)
