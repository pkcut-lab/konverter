# TOOLS — SEO-GEO-Strategist

## Allowed — Read

| Tool | Scope | Warum |
|---|---|---|
| Read | `src/content/**`, `dist/**`, `dossiers/**`, `public/llms.txt`, Rulebooks | Full-Context |
| Glob | `src/content/tools/**`, `dossiers/**` | Pillar-Discovery, Keyword-Cluster-Scan |
| Grep | Projekt-weit (read) | Anchor-Text-Diversity-Scan, E-E-A-T-Signal-Scan |

## Allowed — Write

| Tool | Scope | Warum |
|---|---|---|
| Write | `tasks/awaiting-critics/<id>/seo-geo-strategist.md` | Evidence-Report |
| Write | `tasks/awaiting-critics/<id>/seo-geo-strategist.lock` | Lock |
| Write | `memory/seo-geo-strategist-log.md` (append) | Regressions-Log |
| Write | `inbox/to-ceo/pillar-article-missing-<category>.md` | Pillar-Gap |
| Write | `inbox/to-ceo/keyword-conflict-<slugs>.md` | Keyword-Cluster-Konflikt |

## Allowed — Bash / Scripts

| Command | Zweck |
|---|---|
| `bash evals/seo-geo-strategist/run-smoke.sh` | Pre-Review |
| `node scripts/seo/*.mjs` | SG1–SG15 |
| `node scripts/geo/*.mjs` | SG16–SG24 |
| `grep`, `awk`, `jq`, `yq`, `curl` (read-only Prod) | Utils |

## Forbidden

| Action | Warum |
|---|---|
| `git *` | Audit-only |
| Write in `src/**`, `dist/**`, `public/**`, `scripts/**` | Kein Code |
| Write in Rulebooks | User-only |
| Schema-JSON-LD generieren (Enricher-Domäne) | Scope-Bruch |
| Post-Ship-Validation (SEO-Auditor-Domäne) | Scope-Bruch |
| llms.txt editieren | Builder-Scope via Ticket |
| Analytics-API-Calls | Analytics-Interpreter-Domäne |
| `Skill` tool | Skills sind Builder-exklusiv |

## Read-Only-Referenzen

- `docs/paperclip/SEO-GEO-GUIDE.md` (authoritativ, §1 + §2 + §3 + §4)
- `CONTENT.md` §13.5 (Forbidden-Patterns)
- `STYLE.md` §SEO-Schema
- Google Search Central, Perplexity Publisher Guidelines
