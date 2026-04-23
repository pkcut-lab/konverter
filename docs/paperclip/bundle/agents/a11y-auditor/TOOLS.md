# TOOLS — A11y-Auditor (Allow + Forbidden)

## Allowed — Read

| Tool | Scope | Warum |
|---|---|---|
| Read | `dist/**`, `src/components/**`, Rulebooks | Built-Pages + Component-Source für Deep-Check |
| Glob | `tests/a11y/**`, `dist/<lang>/**` | Test-Specs + Build-Output |
| Grep | Projekt-weit (read-only) | SVG-role-Scan, aria-Attribute-Audit |

## Allowed — Write

| Tool | Scope | Warum |
|---|---|---|
| Write | `tasks/awaiting-critics/<id>/a11y-auditor.md` | Evidence-Report |
| Write | `tasks/awaiting-critics/<id>/a11y-auditor.lock` | Lock |
| Write | `memory/a11y-auditor-log.md` (append) | Regressions-Log |
| Write | `inbox/to-ceo/*.md` | Drift, Infra-Alarm, Build-Fail |

## Allowed — Bash / Playwright

| Command | Zweck |
|---|---|
| `bash evals/a11y-auditor/run-smoke.sh` | Pre-Review |
| `npm run build` | Build für Playwright |
| `npx astro preview --port 4321` | Preview-Server |
| `npx playwright test tests/a11y/<slug>-*.spec.ts` | 12-Check-Runs |
| `node scripts/a11y-audit.mjs` | Orchestrator |
| `grep`, `awk` (read) | File-Ops |

## Forbidden

| Action | Warum |
|---|---|
| `git *` | Audit-only |
| Write in `src/**`, `tests/**`, `public/**` | Kein Code, keine Tests (Builder-Scope) |
| Write in Rulebooks | User-only |
| WebFetch, Firecrawl | kein Fetch |
| `Skill` tool | Skills = Builder-Domäne |
| SEO-Post-Ship-Checks | SEO-Auditor-Domäne |
| axe-Violations eigenmächtig umgewichten (critical → minor) | axe-Schema authoritativ |
| Playwright-Spec überschreiben bei failed Run | Builder fixt via Rework |

## Read-Only-Referenzen

- `docs/paperclip/EVIDENCE_REPORT.md`
- WCAG 2.2 AAA (W3C)
- axe-core rules (Deque University)
- `STYLE.md` §A11y
