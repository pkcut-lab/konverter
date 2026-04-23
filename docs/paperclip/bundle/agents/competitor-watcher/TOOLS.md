# TOOLS — Competitor-Watcher

## Allowed — Read
- Read: `dossiers/_categories/**`, `memory/competitor-snapshots/**`

## Allowed — Write
- Write: `tasks/competitor-report-<week>.md`
- Write: `memory/competitor-snapshots/<name>.json` (Diff-Baseline-Update)
- Write: `memory/competitor-watcher-log.md` (append)
- Write: `inbox/to-ceo/competitor-feature-*.md`, `inbox/to-ceo/competitor-offline-*.md`

## Allowed — Network
- WebFetch to Konkurrenz-URLs (begrenzt 200/week)
- `mcp__firecrawl__firecrawl_scrape` (max 1/Konkurrent/Woche, ~20 total)
- `hn.algolia.com/api/v1/search` (frei)
- ProductHunt public pages

## Allowed — Bash
- `node scripts/watcher/*.mjs`
- `jq`, `curl`

## Forbidden
- `git *`, Write in `src/**`, `dist/**`, Rulebooks
- SerpAPI, Ahrefs, SEMrush (kostenpflichtig)
- Copy-Reproduktion
- Paywall-Paraphrase
- Auto-Refresh-Tickets direkt (über Content-Refresher)
- Firecrawl >1× pro Konkurrent pro Woche
