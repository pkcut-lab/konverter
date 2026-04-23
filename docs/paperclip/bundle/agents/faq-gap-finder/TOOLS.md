# TOOLS — FAQ-Gap-Finder

## Allowed — Read
- Read: `dossiers/**`, `src/content/tools/**`, Rulebooks
- Glob, Grep: read

## Allowed — Write
- Write: `tasks/faq-gaps-<slug>-<date>.md`
- Write: `inbox/to-ceo/faq-gaps-ready-<slug>.md`
- Write: `memory/faq-gap-finder-log.md` (append)

## Allowed — Network
- WebFetch to `suggestqueries.google.com` (Autocomplete, free)
- Brave Search API (free 2k/month)
- WebFetch to `alsoasked.com` (free tier)

## Allowed — Bash
- `node scripts/faq/*.mjs`
- `jq`, `yq`, `curl`

## Forbidden
- `git *`, Write in `src/**`, `dist/**`, Rulebooks
- SerpAPI, Ahrefs, SEMrush
- Direct Google-SERP-Scraping via Headless-Browser
- Content-Rewrites
