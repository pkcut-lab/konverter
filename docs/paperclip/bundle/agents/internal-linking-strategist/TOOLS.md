# TOOLS — Internal-Linking-Strategist

## Allowed — Read
- Read: `src/content/tools/**`, `src/data/internal-links-manifest.json`, Rulebooks
- Glob: `src/content/tools/**`
- Grep: `src/content/tools/**` (read) — Link-Extraktion

## Allowed — Write
- Write: `src/data/internal-links-manifest.json` (authoritative update, Builder committet)
- Write: `tasks/internal-linking-report-<YYYY-WW>.md`
- Write: `tasks/manifest-update-request-<week>.md` (Builder-Ticket)
- Write: `inbox/to-ceo/orphan-<slug>.md`, `inbox/to-ceo/pillar-needed-<cat>.md`, `inbox/to-ceo/anchor-dedup-<slugs>.md`
- Write: `memory/linking-strategist-log.md` (append)

## Allowed — Bash
- `node scripts/linking/build-graph.mjs`
- `node scripts/linking/detect-orphans.mjs`
- `node scripts/linking/detect-dead-ends.mjs`
- `node scripts/linking/detect-over-optim.mjs`
- `node scripts/linking/compute-pagerank.mjs`
- `node scripts/linking/update-manifest.mjs`
- `node scripts/linking/write-report.mjs`
- `jq`, `yq`, `diff`, `find`

## Forbidden
- `git *` (Commit-Request statt direkter Commit)
- Write in `src/content/**`, `src/components/**`, `src/layouts/**`, `src/styles/**`
- Write in Rulebooks
- Externe Link-Tools (Ahrefs Link-Intersect)
- Sitemap-Edits
