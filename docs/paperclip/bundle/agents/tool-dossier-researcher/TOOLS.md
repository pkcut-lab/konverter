# TOOLS — Tool-Dossier-Researcher (Allow-List + Forbidden-List)

## Rationale

Research-Worker. Fetcht + aggregiert + schreibt Dossiers. KEIN Code, KEIN
Commit. WebFetch ist first-choice (unbegrenzt/200-budget), Firecrawl nur
Fallback max 3/Ticket. PII-Scrub in-memory VOR Dossier-Write. Jeder
kostenpflichtige Call durchläuft pre-flight `budget-guard.mjs`.

## Allowed — Read

| Tool | Scope | Warum |
|---|---|---|
| Read | Projekt-weit | Rulebooks, existierende Dossiers (Parent-Check), TICKET_TEMPLATE |
| Glob | `dossiers/**`, `memory/**` | Dossier-Cache-Lookup, Parent-Discovery |
| Grep | `dossiers/**` | Erasure-Key-Lookup, Quellen-Duplikat-Check |

## Allowed — Write / Edit

| Tool | Scope | Warum |
|---|---|---|
| Write | `dossiers/<slug>/<YYYY-MM-DD>.md` | Tool-Dossier |
| Write | `dossiers/_categories/<category>/<YYYY-MM-DD>.md` | Category-Root-Dossier |
| Write | `tasks/dossier-output-<slug>.md` | Output-Contract |
| Write | `tasks/dossier-locks/<slug>.lock` | Lock-Management |
| Write | `tasks/metrics.jsonl` (append) | Budget-Metrics-Log |
| Write | `inbox/to-ceo/*.md` | Blocker, Citation-Fails, Erasure-Requests, Clarifications |
| Edit | Dossier-Frontmatter | `verdict: pending → ready`, `citation_verify_passed: pending → true` |

## Allowed — Network (mit Budget-Gate)

| Tool | Policy | Budget |
|---|---|---|
| WebFetch | First-choice | `webfetch_per_ticket: 200` (Budget-Guard) |
| `mcp__firecrawl__firecrawl_scrape` | Fallback nur | `firecrawl_per_ticket: 3`, `firecrawl_monthly_usd_cap: 0` (free-tier) |
| Reddit JSON-API (via WebFetch) | Frei | ~10 queries/ticket |
| HN Algolia (via WebFetch) | Frei | ~5 queries/ticket |
| Google-Suggest-Autocomplete | Frei | unbegrenzt |
| AlsoAsked (scrape via WebFetch) | Frei | ~3 queries/ticket |
| caniuse.com, MDN BCD, Chrome Platform Status, W3C Drafts (WebFetch) | Frei | unbegrenzt |

**Hart vor JEDEM kostenpflichtigen Call:**

```bash
node ../../../../scripts/budget-guard.mjs check <scope> <action> [ticket-id]
# Exit 0 = proceed, Exit 1 = Call NICHT ausführen (fail-secure)
```

## Allowed — Bash / Scripts

| Command | Zweck |
|---|---|
| `npm run citation-verify -- <dossier-path>` | Post-Write-Guard |
| `bash ../../../../scripts/pii-scrub.mjs` (oder Inline-Aufruf) | In-memory Scrub VOR Write |
| `node ../../../../scripts/budget-guard.mjs check …` | Pre-Tool-Call-Wrapper |
| `sha256sum`, `date`, `jq`, `grep`, `awk`, `wc` | File-Ops |

## Forbidden — Network

| Tool | Warum |
|---|---|
| SerpAPI | Kostenpflichtig, §7.16 verboten |
| Ahrefs API | Kostenpflichtig |
| SEMrush API | Kostenpflichtig |
| Google Search API | Kostenpflichtig |
| Paywall-Content paraphrasieren | `quelle: paywalled` + skip |
| Firecrawl-Call ohne pre-flight Budget-Guard | Fail-secure-Bruch |

## Forbidden — Code / Commit

| Action | Warum |
|---|---|
| `git add`, `git commit`, `git push` | Keine Commits — Research-only |
| Write in `src/**`, `tests/**`, `public/**`, `scripts/**` | Kein Code |
| Write in Rulebooks | User-only |
| Write in `package.json`, `*.config.*`, `.github/workflows/**` | Infra-only |

## Forbidden — Policy

| Action | Warum |
|---|---|
| Dossier-Eintrag ohne Quellen-URL | Evidence-over-Opinion-Wert |
| PII in Dossier-Body ohne Scrub | DSGVO §7.12 |
| Write → scrub-on-disk (reihenfolge-vertauscht) | PII liegt kurzzeitig auf Disk — hebelt Scrub aus |
| Dossier-Erstellen ohne Parent-Category-Check | §5.5 Inheritance-Integrity |
| TTL eigenmächtig vergeben | `../../../CATEGORY_TTL.md` authoritativ |
| Neue Category ohne User-Approval | Enum-Expansion = User-Territorium |
| Erasure selbst ausführen | User-Bestätigung Pflicht |
| User direkt kontaktieren (inbox/to-user/*) außer `category-new-*` | Alles sonst über CEO |

## Read-Only-Referenzen

- `../../../DOSSIER_REPORT.md` — Format-Standard (10 Sektionen + Frontmatter)
- `../../../CATEGORY_TTL.md` — TTL-authoritative (14-Enum-Mapping)
- `../../../research/2026-04-20-multi-agent-role-matrix.md` §5.5 + §7.12 + §7.13 + §7.16
- `../../../../CLAUDE.md` §6 — Differenzierungs-Check

## Erasure-Key-Generierung (Rezept)

```bash
erasure_key=$(echo "<url>-$(date -Iseconds)" | sha256sum | cut -c1-32)
```

Dieser 32-Zeichen-Hash landet im `quellen[].erasure_key`-Feld + Dossier-
Frontmatter. Right-to-Erasure-Requests vom User kommen mit Key und werden per
`grep -l "erasure_key: <key>" dossiers/**/*.md` gefunden.
