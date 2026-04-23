# TOOLS — SEO-GEO-Monitor

## Allowed — Read

| Tool | Scope | Warum |
|---|---|---|
| Read | `src/content/tools/**`, `dossiers/**`, Rulebooks | Tools + Keywords |
| Glob | `src/content/tools/**` | Slug-Enumeration |
| Grep | `dossiers/**` (read) | Primary-Keyword-Lookup |

## Allowed — Write

| Tool | Scope | Warum |
|---|---|---|
| Write | `tasks/seo-geo-monitor-report-<YYYY-WW>.md` | Weekly-Report |
| Write | `memory/seo-geo-monitor-log.md` (append) | Log |
| Write | `inbox/to-ceo/rework-serp-<slug>.md` | CTR-Trigger |
| Write | `inbox/to-ceo/rank-drop-<slug>.md` | Rank-Drop-Alert |
| Write | `inbox/daily-digest/<date>.md` (append) | Positive AI-Citations |
| Write | `inbox/to-user/gsc-oauth-refresh.md` | OAuth-Expiry |

## Allowed — Network (mit Budget-Gate)

| Tool | Budget |
|---|---|
| Google Search Console API (OAuth) | 100 calls/week |
| Brave Search API | 100 calls/week (2k/month frei) |
| Perplexity API (free-tier 5/min) | 300 calls/week |
| Playwright gegen ChatGPT/Claude/You.com (öffentliche Chat-UIs) | 50 Queries/week |
| WebFetch für llms.txt-Discovery bei Konkurrenten | 20/week |

## Allowed — Bash / Scripts

| Command | Zweck |
|---|---|
| `bash evals/seo-geo-monitor/run-smoke.sh` | Pre-Run |
| `node scripts/monitor/gsc-fetch.mjs` | M1/M2 |
| `node scripts/monitor/brave-search.mjs` | M3 |
| `node scripts/monitor/perplexity-citations.mjs` | M4 |
| `node scripts/monitor/ai-chat-citations.mjs` | M5 (Playwright) |
| `node scripts/monitor/aggregate-weekly.mjs` | Report |
| `node scripts/monitor/detect-rank-drops.mjs` | Trigger-Logik |
| `jq`, `yq`, `awk`, `date` | Utils |

## Forbidden

| Action | Warum |
|---|---|
| `git *` | Data-only |
| Write in `src/**`, `dist/**`, `public/**`, `scripts/**` | Kein Code |
| Write in Rulebooks | User-only |
| Ahrefs, SEMrush, Moz-API (kostenpflichtig) | §7.16 |
| GSC-Submit-Actions | User-OAuth |
| AdSense-Writes | User-Territorium |
| llms.txt-Edits | Builder-Scope |
| Content-Rewrites | Strategist-Domäne |

## Read-Only-Referenzen

- `docs/paperclip/SEO-GEO-GUIDE.md` §2.4 (AI-SERP-Targets)
- `docs/paperclip/ANALYTICS-RUBRIC.md` §1 (geteilte Thresholds)
- GSC API, Brave API, Perplexity API (Docs)
