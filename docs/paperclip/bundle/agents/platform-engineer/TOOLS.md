# TOOLS — Platform-Engineer

## Allowed — Read

| Tool | Scope | Warum |
|---|---|---|
| Read | Projekt-weit (read) | Full-Repo-Context für Shared-File-Analyse |
| Glob | `src/content/tools/**`, `dist/**`, `tests/visual/baselines/**` | Tool-Enumeration |
| Grep | Projekt-weit (read) | Shared-Component-Usage-Scan |

## Allowed — Write

| Tool | Scope | Warum |
|---|---|---|
| Write | `tasks/awaiting-critics/<id>/platform-engineer.md` | Evidence-Report |
| Write | `tasks/awaiting-critics/<id>/platform-engineer.lock` | Lock |
| Write | `memory/platform-engineer-log.md` (append) | Regressions-Log |
| Write | `tests/visual/baselines/<slug>-<date>.png` (auto-create only) | Neue Baselines NUR für neue Tools |
| Write | `inbox/to-ceo/platform-regression-<sha>.md` | Regression-Report |
| Write | `inbox/to-user/live-alarm-systemic-drift-<date>.md` | Systemic-Drift |
| Write | `inbox/to-user/baseline-update-request-<slug>.md` | Legitimate-Diff-Approval |

## Allowed — Bash / Playwright

| Command | Zweck |
|---|---|
| `bash evals/platform-engineer/run-smoke.sh` | Pre-Review |
| `npm run build`, `npm test`, `npm run astro -- check` | Core-Gates |
| `npx playwright test tests/visual/*.spec.ts --update-snapshots=false` | PE3 |
| `npx playwright test tests/a11y/*.spec.ts` | PE5 |
| `npx lhci autorun` | PE7 |
| `node scripts/console-error-check.mjs` | PE6 |
| `git diff-tree`, `git rev-parse` | Commit-Inspect |
| `du`, `find`, `gzip`, `awk`, `jq`, `bc` | Utils |

## Forbidden

| Action | Warum |
|---|---|
| `git add`, `git commit`, `git push` | Audit-only |
| `git checkout <branch>`, `git merge` | nicht dein Scope |
| Write in `src/**`, `dist/**`, `public/**`, `scripts/**`, `tests/**` (außer `tests/visual/baselines/` auto-create) | Kein Code |
| Write in Rulebooks | User-only |
| Baselines updaten ohne User-Approval (außer Auto-Create für neue Tools) | Audit-Integrity |
| `--update-snapshots=true` | Baseline-Reset = User |
| Shared-Component-Edits | Builder-Scope (mit User-Approval) |
| `npm install`, `npm update` | Dep-Change = User |

## Read-Only-Referenzen

- `docs/paperclip/PERFORMANCE-BUDGET.md`
- `STYLE.md` §Visual-Regression
- `BRAND_GUIDE.md` §4
- `tests/bundle-baselines.json`, `tests/lighthouse-baselines.json`
