# TOOLS — SEO-Auditor

## Allowed — Read

| Tool | Scope | Warum |
|---|---|---|
| Read | Rulebooks, `public/llms.txt`, `public/robots.txt` (read) | Referenz-Docs |
| Glob | `dist/**` (read) | Build-Output-Fallback-Inspect |
| Grep | `dist/**` (read) | JSON-LD-Fallback-Parse wenn Live-URL 404 |

## Allowed — Write

| Tool | Scope | Warum |
|---|---|---|
| Write | `tasks/awaiting-critics/<id>/seo-auditor.md` | Evidence-Report |
| Write | `tasks/awaiting-critics/<id>/seo-auditor.lock` | Lock |
| Write | `memory/seo-auditor-log.md` (append) | Regressions-Log |
| Write | `inbox/to-ceo/sitemap-missing-<slug>.md` | Sitemap-Fehler |
| Write | `inbox/to-ceo/indexation-delay-<slug>.md` | GSC-Status |
| Write | `inbox/to-user/gsc-oauth-refresh.md` | OAuth-Expiry |

## Allowed — Bash / Network

| Command | Zweck |
|---|---|
| `bash evals/seo-auditor/run-smoke.sh` | Pre-Review |
| `curl -s https://konverter-7qc.pages.dev/**` | Live-URL-Fetch |
| `WebFetch` to validator.schema.org | Schema-Validation |
| `WebFetch` to search.google.com (Rich-Results-Test API) | SE9 |
| `node scripts/jsonld-extract.mjs` | JSON-LD aus HTML |
| `node scripts/hreflang-validate-live.mjs` | SE5 |
| `node scripts/rich-results-test.mjs` | SE9 |
| `node scripts/gsc-index-status.mjs` | SE10 |
| `grep`, `jq`, `yq`, `xmllint` | Parse |

## Forbidden

| Action | Warum |
|---|---|
| `git *` | Audit-only |
| Write in `src/**`, `dist/**`, `public/**`, `scripts/**` | Kein Code |
| Write in Rulebooks | User-only |
| Search-Console-API-Submit | User-OAuth, nur Read |
| Google-API-Writes | — |
| Pre-Ship-Checks ausführen (Pflicht = Strategist) | Scope-Bruch |
| Sitemap editieren | Astro-auto-gen |

## Read-Only-Referenzen

- `docs/paperclip/SEO-GEO-GUIDE.md` §1
- Schema.org Validator, Google Rich-Results-Test
- Google Search-Console-API-Docs
