# TOOLS — Analytics-Interpreter

## Allowed — Read

| Tool | Scope | Warum |
|---|---|---|
| Read | `src/content/tools/**`, Rulebooks, `memory/analytics-baseline.json` | Tools + Baseline |
| Glob | `src/content/tools/**` | Tool-Enumeration |

## Allowed — Write

| Tool | Scope | Warum |
|---|---|---|
| Write | `tasks/analytics-report-<YYYY-WW>.md` | Weekly-Report |
| Write | `memory/analytics-interpreter-log.md` (append) | Log |
| Write | `memory/analytics-baseline.json` (update) | Baseline-Drift |
| Write | `inbox/to-ceo/rework-ux-<slug>.md` | UX-Trigger |
| Write | `inbox/to-ceo/rework-content-<slug>.md` | Content-Trigger |
| Write | `inbox/to-ceo/rework-serp-<slug>.md` | SERP-Trigger (shared with SEO-GEO-Monitor) |
| Write | `inbox/to-ceo/rework-perf-<slug>.md` | Perf-Trigger |
| Write | `inbox/to-ceo/category-pattern-<cat>.md` | Category-Pattern-Alert |
| Write | `inbox/to-user/gsc-oauth-refresh.md` | OAuth-Expiry |

## Allowed — Network / API

| Tool | Budget |
|---|---|
| Cloudflare Web Analytics GraphQL | 1× täglich Cache |
| Google Search Console API (OAuth) | 1× täglich Cache |
| AdSense API (OAuth, Phase 2+) | 1× wöchentlich |
| Plausible API (optional, falls Second-Analytics) | täglich |

## Allowed — Bash / Scripts

| Command | Zweck |
|---|---|
| `bash evals/analytics-interpreter/run-smoke.sh` | Pre-Run |
| `node scripts/analytics/cf-rum-fetch.mjs` | CF-RUM |
| `node scripts/analytics/gsc-fetch.mjs` | GSC |
| `node scripts/analytics/adsense-fetch.mjs` | AdSense |
| `node scripts/analytics/filter-min-sessions.mjs` | Sample-Size |
| `node scripts/analytics/rework-score.mjs` | Score-Compute |
| `node scripts/analytics/category-segment.mjs` | Segmentierung |
| `node scripts/analytics/synthesize-insights.mjs` | Opus-Reasoning |
| `jq`, `yq`, `awk`, `date` | Utils |

## Forbidden

| Action | Warum |
|---|---|
| `git *` | Data-only |
| Write in `src/**`, `dist/**`, `public/**`, `scripts/**` | Kein Code |
| Write in Rulebooks | User-only |
| Session-Replay-Tools (Hotjar/FullStory) | DSGVO + §7.16 |
| User-Fingerprinting | DSGVO |
| Ahrefs/SEMrush | §7.16 |
| AdSense-Writes (Ad-Slot-Changes) | User-Territorium |
| Einzel-Metrik-Rework-Trigger | Triangulation-Pflicht |

## Read-Only-Referenzen

- `docs/paperclip/ANALYTICS-RUBRIC.md` (authoritativ)
- `docs/paperclip/SEO-GEO-GUIDE.md` §2.4
- Cloudflare Analytics GraphQL Docs, GSC API Docs, AdSense API Docs
