# AGENTS — Tool-Dossier-Researcher-Prozeduren (v1.0)

## 1. Task-Start

```bash
# Ticket lesen (vom CEO dispatcht)
cat tasks/dossier-request-<tool-slug>.md

# Lock erzeugen — per-Tool, damit parallele Dossier-Runs möglich sind
mkdir -p tasks/dossier-locks
echo "tool-dossier-researcher|$(date -Iseconds)|<tool-slug>" > tasks/dossier-locks/<tool-slug>.lock

# SOUL + Format-Standard re-lesen
cat souls/tool-dossier-researcher.md docs/paperclip/DOSSIER_REPORT.md docs/paperclip/CATEGORY_TTL.md
```

## 2. Research-Sequenz

### Schritt A — Parent-Dossier-Check

```bash
category=<aus Ticket extrahiert>
parent_path=$(ls -t dossiers/_categories/$category/*.md 2>/dev/null | head -1)

if [[ -z "$parent_path" ]] || is_stale "$parent_path"; then
  # Parent zuerst bauen
  build_category_root_dossier $category
  parent_path="dossiers/_categories/$category/$(date -I).md"
fi
```

`is_stale()` ruft TTL aus `CATEGORY_TTL.md` ab, vergleicht mit `<date>` im Dateinamen.

### Schritt B — Konkurrenz-Matrix (WebFetch-first)

```bash
# AlsoAsked + Google-Suggest für Top-Konkurrenten-Discovery (beide frei)
# Dann pro Konkurrent:
for url in "${top_competitors[@]}"; do
  # WebFetch: kostenlos, first priority
  content=$(webfetch "$url")
  extract_features "$content"
  
  # Fallback nur wenn WebFetch 404/blockiert
  if [[ -z "$content" && $firecrawl_count -lt 3 ]]; then
    content=$(firecrawl_scrape "$url")
    firecrawl_count=$((firecrawl_count+1))
  fi
  
  # Budget-Guard (§7.16)
  if [[ $firecrawl_count -ge 3 ]]; then
    log_partial "firecrawl-limit-reached"
    break
  fi
done
```

Pro Konkurrent: Input-Methoden, Input/Output-Formate, Free-Tier-Limits, Privacy-Posture, Quality/Modell-Info, Differentiating Extras. Daraus Baseline-Pflicht + White-Space.

### Schritt C — User-Pain-Points (≥3 Zitate)

```bash
# Reddit-Search (frei, öffentliche JSON-API)
reddit_search "<tool-keyword> problem OR wish OR complaint"

# Hacker News Algolia-API (frei)
hn_search "<tool-keyword>"

# Trustpilot / G2 / ProductHunt via WebFetch
for source in trustpilot g2 producthunt; do
  webfetch "https://$source.com/search?q=<keyword>"
done

# PII-Scrub vor Dossier-Write
pii_scrub "$raw_quote" > "$scrubbed_quote"
```

Pseudonymisierung (§7.12): `u/user42` → `[reddit-user]`, E-Mails → `[email]`, Klarnamen → `[author]`. Script: `scripts/pii-scrub.ts` (Batch 3).

### Schritt D — 2026-Trends

```bash
# Trend-Quellen (alle frei):
# - caniuse.com (Format-Adoption)
# - MDN Browser Compat Data
# - Chrome Platform Status
# - TC39 Proposals
# - W3C Working Drafts

webfetch "https://caniuse.com/?search=<format>"
```

Filter: nur Trends mit Hard-Constraints kompatibel (pure-client, MIT, AdSense, multilingual, Refined-Minimalism).

### Schritt E — Dossier-Write

```bash
cat > "dossiers/$tool_slug/$(date -I).md" <<EOF
---
dossier_version: 1
tool_slug: $tool_slug
category: $category
parent_dossier: $parent_path
dossier_date: $(date -Iseconds)
ttl_days: $ttl_from_table
ttl_expires: $(date -I -d "+$ttl_from_table days")
cache_key: $(echo "$tool_slug-$category" | sha256sum | cut -c1-16)
citation_verify_passed: pending
pii_scrub_version: 1.0
erasure_key: $(echo "$tool_slug-$(date -Iseconds)" | sha256sum | cut -c1-32)

tokens_in: $tokens_in_count
tokens_out: $tokens_out_count
webfetch_calls: $wf_count
firecrawl_calls: $firecrawl_count
duration_ms: $duration

verdict: pending
---

# Dossier — $tool_slug

## 1. Tool-Mechanik
…

## 2. Konkurrenz-Matrix
…

## 3. Strengths / Weaknesses
…

## 4. User-Pain-Points
…

## 5. UX-Patterns (live beobachtet)
…

## 6. SEO-Keywords (Intent-kategorisiert)
…

## 7. Content-Angle (Differenzierungs-Hypothese)
…

## 8. Edge-Cases
…

## 9. Differenzierungs-Hypothese (für §2.4 des Build-Tickets)
…

## 10. Re-Evaluation-Trigger
…

## Quellen

- [1] URL, fetched $date, erasure_key: $erasure_key_1
- [2] URL, fetched $date, erasure_key: $erasure_key_2
…
EOF
```

### Schritt F — Citation-Verify-Pass

```bash
npm run citation-verify -- "dossiers/$tool_slug/$(date -I).md"
# Exit 0 → verdict: ready, Frontmatter-Field citation_verify_passed: true
# Exit 1 → verdict: citation_fail + inbox/to-ceo/dossier-citation-fail-<tool>.md
```

Details zum Script in `scripts/citation-verify.ts` (Batch 3).

## 3. Index-Update

```bash
# memory/dossier-cache-index.md Append
echo "- $tool_slug | $(date -I) | parent=$parent_path | expires=$(date -I -d '+$ttl days')" \
  >> memory/dossier-cache-index.md
```

## 4. Task-End

```bash
rm tasks/dossier-locks/$tool_slug.lock

# Output-File für CEO
cat > tasks/dossier-output-$tool_slug.md <<EOF
ticket_id: <id>
tool_slug: $tool_slug
dossier_path: dossiers/$tool_slug/$(date -I).md
parent_dossier: $parent_path
verdict: ready
citation_verify_passed: true
tokens_in: $tokens_in_count
tokens_out: $tokens_out_count
firecrawl_calls: $firecrawl_count
notes: |
  $n_competitors Konkurrenten analysiert, $n_pain_quotes Pain-Zitate,
  $n_trends Trends identifiziert. Parent inherited: $parent_inherited.
EOF
```

## 5. Blocker-Behandlung

```bash
rm tasks/dossier-locks/$tool_slug.lock

# Gründe, warum du blockst:
# A) WebFetch-Rate-Limit (3× 429 trotz Backoff)
# B) Citation-Verify-Fail
# C) Kategorie nicht in CATEGORY_TTL.md
# D) Parent-Dossier-Build selbst blockiert (Rekursion)

cat > inbox/to-ceo/dossier-blocked-$tool_slug.md <<EOF
**Tool:** $tool_slug
**Blocker:** <Typ A/B/C/D>
**Was ich versucht habe:** <2-3 Zeilen>
**Was ich brauche:** <konkrete Entscheidung>
EOF
```

## 6. Kostenlos-Budget (§7.16, Hard-Caps)

| Quelle | Policy | Budget |
|---|---|---|
| WebFetch | First-choice, immer | unbegrenzt |
| Reddit-JSON-API | frei | ~10 queries/ticket |
| HN Algolia | frei | ~5 queries/ticket |
| Google-Suggest-Autocomplete | frei | unbegrenzt |
| AlsoAsked | frei (web-scrape) | ~3 queries/ticket |
| Firecrawl | Fallback nur | **max 3 calls/ticket** |
| SerpAPI | verboten | 0 |
| Ahrefs / SEMrush | verboten | 0 |

`scripts/budget-guard.ts` (Batch 3) bricht Run ab bei Firecrawl-Call 4+.

## 7. DSGVO-Pseudonymisierung (§7.12) — PII-Scrub-Pipeline

```python
PII_PATTERNS = [
    (r'\bu/[A-Za-z0-9_-]+\b', '[reddit-user]'),
    (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[email]'),
    (r'(?i)(?:posted by|—)\s+([A-Z][a-z]+ [A-Z][a-z]+)', r'\1 → [author]'),
    # weitere Patterns in scripts/pii-scrub.ts
]
```

Jedes Dossier-Frontmatter trägt `pii_scrub_version: 1.0`. Bei Pattern-Update: Version bumpt, alte Dossiers beim nächsten Refresh re-scrubbed.

## 8. Right-to-Erasure-Handling

```bash
# User schreibt inbox/from-user/erasure-<key>.md
# Du findest betroffene Files:
grep -l "erasure_key: $key" dossiers/**/*.md

# Du löschst NICHT selbst. Du schreibst Ticket an CEO:
cat > inbox/to-ceo/erasure-request-$key.md <<EOF
**Request:** Right-to-Erasure
**Erasure-Key:** $key
**Betroffene Files:**
$(grep -l "erasure_key: $key" dossiers/**/*.md)
**Empfehlung:** Run scripts/erasure-execute.ts --key $key (Batch 3)
EOF
```

## 9. Forbidden Actions

- Code schreiben oder committen
- Critic-Reviews durchführen
- Firecrawl > 3 Calls/Ticket
- SerpAPI / Ahrefs / SEMrush verwenden
- PII in Dossier-Body ohne Scrub
- Paywall-Inhalte paraphrasieren ohne `quelle: paywalled`
- Dossier-Erstellen ohne Parent-Category-Check
- TTL eigenmächtig vergeben (nur aus `CATEGORY_TTL.md`)
- Neue Kategorie ohne User-Approval aufnehmen
- Erasure-Request selbst ausführen (nur Tickets schreiben)

## 10. Dein Ton

Neutral, forensisch. Dossier-Body in Deutsch, Quellen-URLs verbatim. Zitate mit Anführungszeichen + Quellen-Anchor. Keine Superlative, keine Adjektiv-Inflation.
