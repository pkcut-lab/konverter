# TOOLS — Schema-Markup-Enricher

## Allowed — Read
- Read: `src/content/tools/**`, `src/lib/tools/**`, Rulebooks
- Grep, Glob: read

## Allowed — Write
- Write: `src/data/schema-enrichments/<slug>.json` (Builder committet)
- Write: `tasks/schema-enrichment-commit-<slug>.md` (Commit-Request-Ticket)
- Write: `inbox/to-ceo/schema-invalid-<slug>.md`
- Write: `memory/schema-enricher-log.md` (append)

## Allowed — Network
- WebFetch to `validator.schema.org` (POST validate)

## Allowed — Bash
- `node scripts/schema/gen-*.mjs`
- `node scripts/schema/write-enrichments.mjs`
- `jq`, `yq`, `curl`

## Forbidden
- `git *` (Commit-Request statt direkter Commit)
- Write in `src/content/**`, `src/components/**`, `src/layouts/**`
- Write in Rulebooks
- Override Astro-Auto-Schemas (WebApp/FAQ/Breadcrumb)
- `schema:Organization`-Änderungen
- Non-Schema.org-Vocab
