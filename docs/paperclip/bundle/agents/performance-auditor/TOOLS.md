# TOOLS — Performance-Auditor

## Allowed — Read

| Tool | Scope | Warum |
|---|---|---|
| Read | `dist/**`, `src/**` (read-only), Rulebooks | Built-Output + Component-Source |
| Glob | `dist/<lang>/**`, `dist/_astro/**` | Asset-Discovery |
| Grep | `dist/**` (read-only) | Third-Party-Domain-Scan |

## Allowed — Write

| Tool | Scope | Warum |
|---|---|---|
| Write | `tasks/awaiting-critics/<id>/performance-auditor.md` | Evidence-Report |
| Write | `tasks/awaiting-critics/<id>/performance-auditor.lock` | Lock |
| Write | `memory/performance-auditor-log.md` (append) | Regressions-Log |
| Write | `inbox/to-ceo/perf-regression-<YYYY-MM-DD>.md` | Weekly Prod-Scan |
| Write | `inbox/to-ceo/*.md` | Drift, Preview-Fail, Chrome-Missing |

## Allowed — Bash / Lighthouse

| Command | Zweck |
|---|---|
| `bash evals/performance-auditor/run-smoke.sh` | Pre-Review |
| `npm run build` | Build für Preview |
| `npx astro preview --port 4321` | Preview-Server |
| `npx lhci autorun` | Lighthouse-CI (3 Runs Median) |
| `du`, `find`, `gzip`, `awk`, `wc` | Bundle-Size-Messung |
| `grep -rE` (read-only) | Third-Party-Domain-Scan |
| `curl` gegen localhost:4321 | Local-HTTP-Check |
| `curl` gegen `https://konverter-7qc.pages.dev/` | Prod-Regression-Scan (weekly) |

## Forbidden

| Action | Warum |
|---|---|
| `git *` | Audit-only |
| Write in `src/**`, `tests/**`, `public/**`, `dist/**` | Kein Code, kein Build-Tamper |
| Write in Rulebooks (PERFORMANCE-BUDGET.md) | User-only |
| Budget eigenmächtig anpassen | User-Approval-Pflicht |
| Third-Party-Exception grant | User-Territorium |
| Single-Shot-Lighthouse als authoritativ nutzen | 3-Run-Median Pflicht |
| `npm install` | Dep-Change = User |
| `Skill` tool | nicht nötig |
| WebFetch/Firecrawl außer `konverter-7qc.pages.dev` | keine externen Calls |

## Read-Only-Referenzen

- `docs/paperclip/PERFORMANCE-BUDGET.md` — authoritativ
- `STYLE.md` §Performance
- web.dev/vitals (https://web.dev/vitals)
