# Heartbeat — Tool-Dossier-Researcher (v1.0)

Event-driven: wach wenn CEO ein `tasks/dossier-request-<slug>.md`-Ticket
dispatcht. Ein Tick = ein Tool-Dossier (oder ein Category-Root, falls
stale/fehlend). Typische Dauer: 10–30 min, budget-gated durch max 3
Firecrawl-Calls + ~200 WebFetch-Calls.

## Tick-Procedure (6 Steps)

1. **Identity-Check + Budget-Gate** — `SOUL.md` lesen, drei Kernwerte
   reaktivieren (Evidence-over-Opinion, Kostenlos-First §7.16, DSGVO-Pseudonym
   §7.12). Budget-Guard pre-flight:
   ```bash
   node scripts/budget-guard.mjs check day tokens_in
   node scripts/budget-guard.mjs check ticket firecrawl <slug>
   ```
   Exit 1 → Lock nicht anlegen, `inbox/to-ceo/dossier-blocked-<slug>.md` Typ A
   "budget exhausted", exit. Fail-secure hard-bound.

2. **Ticket lesen + Lock setzen** — `cat tasks/dossier-request-<slug>.md`,
   extrahiere `tool_slug`, `category`, `parent_hint`. Lock anlegen:
   ```bash
   mkdir -p tasks/dossier-locks
   echo "tool-dossier-researcher|$(date -Iseconds)|<slug>" > tasks/dossier-locks/<slug>.lock
   ```
   Parallel-Dossiers sind erlaubt (unterschiedliche Slugs, unterschiedliche
   Lock-Files).

3. **Parent-Check + evtl. Root-Build** — `dossiers/_categories/<category>/*.md`
   prüfen: neueste Date, TTL aus `docs/paperclip/CATEGORY_TTL.md` vergleichen. Wenn
   stale oder fehlend → ZUERST Parent bauen (Schritt B–F für Category-Root),
   dann Tool-Dossier. Citation-Verify auf Parent MUSS grün sein, bevor Tool-
   Dossier davon erben darf (§5.5-Guard).

4. **Research-Sequenz B→C→D** (Details `AGENTS.md` §2):
   - B: Konkurrenz-Matrix (WebFetch first, Firecrawl max 3 Fallback, Budget-
     Guard pre-call)
   - C: User-Pain (Reddit JSON / HN Algolia / Trustpilot / G2 / ProductHunt
     WebFetch), ≥3 wörtliche Zitate, **PII-Scrub in-memory VOR Write**
   - D: 2026-Trends (caniuse, MDN BCD, Chrome Platform Status, W3C Drafts),
     gefiltert auf Hard-Constraints-Kompatibilität

5. **Dossier-Write + Citation-Verify** — YAML-Frontmatter (`dossier_version: 1`,
   `citation_verify_passed: pending`, `pii_scrub_version: 1.0`, `erasure_key`,
   `tokens_in/out`, `firecrawl_calls`) + 10 Sektionen Body. Dann:
   ```bash
   npm run citation-verify -- "dossiers/<slug>/$(date -I).md"
   ```
   Exit 0 → Frontmatter-Update `citation_verify_passed: true`, `verdict: ready`.
   Exit 1 → `verdict: citation_fail`, `inbox/to-ceo/dossier-citation-fail-<slug>.md`,
   CEO entscheidet Retry (max 1) oder Park.

6. **Index-Update + Task-End** — `memory/dossier-cache-index.md` appenden:
   `- <slug> | <date> | parent=<parent> | expires=<ttl-date>`. Output-File:
   `tasks/dossier-output-<slug>.md` mit YAML-Stats (tokens, calls, counts).
   Lock entfernen: `rm tasks/dossier-locks/<slug>.lock`. Exit.

## Blocker-Recovery

| Typ | Trigger | Reaktion |
|---|---|---|
| A | Budget exhausted (Firecrawl 3/3, tokens daily cap) | Lock nicht angelegt, CEO-Ticket "budget exhausted" |
| B | WebFetch 3× 429 trotz Backoff | `verdict: partial`, `rate_limited_sources[]` + CEO-Ticket Typ B |
| C | Citation-Verify failed (Zitat nicht im Quellentext) | `verdict: citation_fail` + CEO-Ticket, Retry-Entscheidung bei CEO |
| D | Category nicht in CATEGORY_TTL.md | STOP, `inbox/to-user/category-new-<name>.md` (via CEO) |
| E | Parent-Dossier-Build rekursiv blockiert | CEO-Ticket Typ D, Lock entfernen |

## Budget-Guard (Pre-Tool-Call-Wrapper, hart)

**Vor jedem kostenpflichtigen Call:**

```bash
# Firecrawl
node scripts/budget-guard.mjs check ticket firecrawl <slug>
# WebFetch (bei gebudgetierter Variante)
node scripts/budget-guard.mjs check ticket webfetch <slug>
# Anthropic-Tokens (für LLM-Extract, falls LLM-assisted)
node scripts/budget-guard.mjs check day tokens_in
```

Exit 0 = proceed, Exit 1 = Call wird NICHT ausgeführt. Log-Zeile nach
`tasks/metrics.jsonl`:

```json
{"timestamp":"<ISO>","ticket_id":"<id>","tool_slug":"<slug>","firecrawl":1,"webfetch":3,"tokens_in":4500,"tokens_out":800}
```

Post-hoc-Audit wäre wertlos — Budget wäre dann schon verbrannt.

## PII-Scrub (Pipeline-Order hart)

```
fetch raw text → pii-scrub(in-memory) → writeFile(scrubbed)
```

NIEMALS `writeFile(raw) → scrub-on-disk`. Patterns in
`scripts/pii-scrub.mjs` (`u/<user>` → `[reddit-user]`, E-Mail →
`[email]`, "posted by FirstName LastName" → `[author]`, etc.). Version-Stamp
`pii_scrub_version: 1.0` im Frontmatter — bei Pattern-Update Version bumpen,
alte Dossiers beim TTL-Refresh re-scrubben.

## Right-to-Erasure (§7.12)

User schreibt `inbox/from-user/erasure-<key>.md`. Du:

1. `grep -l "erasure_key: <key>" dossiers/**/*.md` — alle betroffenen Files
2. `inbox/to-ceo/erasure-request-<key>.md` schreiben mit File-Liste +
   Empfehlung `scripts/erasure-execute.mjs --key <key>`
3. **Du löschst NICHT selbst.** CEO triggert das Script nach User-Bestätigung.

## Memory-Update

`memory/dossier-cache-index.md` ist dein Lean-Index. Kein eigenes Log-File.
CEO aggregiert Metriken aus `tasks/metrics.jsonl` + `tasks/dossier-output-<slug>.md`.
