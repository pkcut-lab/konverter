# TOOLS — Differenzierungs-Researcher

## Rationale

Deep-Research für Unique-Tools. Opus-4-7 weil Synthese + Hypothesen-Generierung braucht Deep-Reasoning. WebFetch first, Firecrawl max 3×. Keine Commits, keine Code-Edits.

## Allowed — Read

| Tool | Scope | Warum |
|---|---|---|
| Read | Parent-Dossier, Rulebooks, `memory/diff-research-cache-index.md` | Start-Kontext |
| Glob | `dossiers/**`, `memory/**` | Cache-Discovery |
| Grep | `dossiers/**` (read) | Konkurrenz-Anchor-Lookup |

## Allowed — Write

| Tool | Scope | Warum |
|---|---|---|
| Write | `dossiers/<slug>/differentiation-deep-research.md` | Deep-Research-Output |
| Write | `memory/diff-research-cache-index.md` (append) | Index |
| Write | `tasks/dossier-locks/<slug>-diff.lock` | Lock |
| Write | `inbox/to-ceo/diff-research-*.md` | Complete, Budget-Exceeded, Citation-Fail |
| Write | `tasks/metrics.jsonl` (append) | Budget-Log |
| Edit | Dossier-Frontmatter (`hypotheses_count`, `sources_count`) | Meta-Update |

## Allowed — Network (mit Budget-Gate)

| Tool | Policy | Budget |
|---|---|---|
| WebFetch | First-choice | `webfetch_per_ticket: 50` |
| `mcp__firecrawl__firecrawl_scrape` | Fallback | `firecrawl_per_ticket: 3`, `firecrawl_monthly_usd_cap: 0` |
| Reddit JSON-API via WebFetch | Frei | ~20/ticket |
| HN Algolia via WebFetch | Frei | ~10/ticket |
| Chrome Platform Status, caniuse, web.dev, Mozilla Hacks | Frei | ~15/ticket |
| MIT Tech Review (kuratiert) | einmalig Cached | 1/monat |

**Pflicht vor JEDEM Netzwerk-Call:**
```bash
node scripts/budget-guard.mjs check <scope> <action> [ticket-id]
```

## Allowed — Bash / Scripts

| Command | Zweck |
|---|---|
| `node scripts/extract-competitors.mjs` | Stufe 1 |
| `node scripts/competitor-deep-fetch.mjs` | Stufe 1 |
| `node scripts/review-quote-mining.mjs` | Stufe 1 |
| `node scripts/reddit-pain-extract.mjs` | Stufe 2 |
| `node scripts/hn-pain-extract.mjs` | Stufe 2 |
| `node scripts/pii-scrub.mjs` | Pre-Write |
| `node scripts/trend-fetch.mjs` | Stufe 3 |
| `node scripts/trend-filter-constraints.mjs` | Stufe 3 |
| `node scripts/diff-research-synthesize.mjs` | Stufe 4 (Opus-Reasoning) |
| `node scripts/citation-verify.mjs` | Post-Write |
| `jq`, `yq`, `grep`, `sha256sum`, `date` | Utils |

## Forbidden

| Action | Warum |
|---|---|
| `git *` | Audit-only, keine Commits |
| Write in `src/**`, `tests/**`, `public/**` | Kein Code |
| Write in Rulebooks | User-only |
| SerpAPI, Ahrefs, SEMrush, Google Search API | §7.16 Kostenlos-Policy |
| Firecrawl >3× pro Ticket | Budget-Break |
| Paywall-Paraphrase | Audit-Integrity |
| PII-Writes ohne Scrub | DSGVO |
| Standard-Tool-Research (non-unique) | Scope-Bruch |
| Schablonen-Format (10 Sektionen) | Falscher Output-Typ |
| Hypothesen ohne ≥2 Primärquellen | Evidence-Wert |

## Read-Only-Referenzen

- `docs/paperclip/DOSSIER_REPORT.md` §9 (Hypothesen-Integration)
- `docs/paperclip/CATEGORY_TTL.md` (TTL für Deep-Research = 180d)
- `CLAUDE.md` §6 (§2.4 Differenzierungs-Check)
- `docs/paperclip/research/2026-04-20-multi-agent-role-matrix.md` §2.7
