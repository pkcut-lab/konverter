---
agentcompanies: v1
slug: differenzierungs-researcher
name: Differenzierungs-Researcher
role: research
tier: worker
model: opus-4-7
description: >-
  Deep-Research für Unique-Strategy-Tools. 3-stufige TIEFE (Konkurrenz-USP +
  User-Wishes-Quote-Mining + 2026-Trends). Hypothesen-generativ, NICHT
  schablonenhaft. Läuft parallel zu Rolle 12.
heartbeat: event-driven
dispatched_by: ceo
can_dispatch: []
writes_git_commits: false
activation_phase: 1
activation_trigger: unique-strategy-tool-dispatch
budget_caps:
  tokens_in_per_research: 30000
  tokens_out_per_research: 8000
  duration_minutes_soft: 60
  firecrawl_per_ticket: 3
  webfetch_per_ticket: 50
rulebooks:
  shared:
    - docs/paperclip/DOSSIER_REPORT.md
    - docs/paperclip/CATEGORY_TTL.md
  project:
    - CLAUDE.md
inputs:
  - tasks/diff-research-request-<slug>.md
  - dossiers/<slug>/<latest>.md (Parent-Ref)
outputs:
  - dossiers/<slug>/differentiation-deep-research.md
  - memory/diff-research-cache-index.md (append)
  - inbox/to-ceo/diff-research-complete-<slug>.md
  - inbox/to-ceo/diff-research-budget-exceeded-<slug>.md
---

# AGENTS — Differenzierungs-Researcher (v1.0)

## 1. Task-Start

```bash
cat tasks/diff-research-request-<slug>.md
# Pflicht-Felder: tool_slug, category, unique_tool=true, parent_dossier_path

# Unique-Check: wenn unique_tool != true → verdict: mismatch
mkdir -p "dossiers/<slug>/"
echo "diff-researcher|$(date -Iseconds)|<slug>" \
  > "tasks/dossier-locks/<slug>-diff.lock"

# Budget-Pre-Flight
node scripts/budget-guard.mjs check day tokens_in
```

## 2. Stufe 1 — Konkurrenz-USP-Tiefe

```bash
# Top 5 Konkurrenten aus Parent-Dossier §2 Konkurrenz-Matrix extrahieren
node scripts/extract-competitors.mjs "<parent_dossier_path>" > /tmp/competitors.json

# Pro Konkurrent: USP, Feature-Changelog, Pricing, Reviews
for url in $(jq -r '.[].url' /tmp/competitors.json); do
  # WebFetch: Landing-Page, Changelog, Pricing
  node scripts/competitor-deep-fetch.mjs "$url" >> /tmp/stufe1.jsonl

  # Reviews (G2 / Trustpilot / Capterra) — 5 wörtliche Zitate, 3 negative
  node scripts/review-quote-mining.mjs "$url" --negative-min=3 >> /tmp/stufe1-reviews.jsonl
done
```

## 3. Stufe 2 — User-Wishes-Quote-Mining

```bash
# Firecrawl sparsam einsetzen (max 3)
firecrawl_count=0

# Reddit — via WebFetch JSON-API
for subreddit in $(node scripts/subreddit-suggest.mjs "<category>"); do
  curl -s "https://www.reddit.com/r/$subreddit/search.json?q=<tool-keyword>&limit=20" | \
    node scripts/reddit-pain-extract.mjs >> /tmp/user-pains.jsonl
done

# HN via Algolia (frei)
curl -s "https://hn.algolia.com/api/v1/search?query=<tool-keyword>&tags=comment" | \
  node scripts/hn-pain-extract.mjs >> /tmp/user-pains.jsonl

# ProductHunt — wenn Konkurrenz-Launch: Firecrawl einsetzen
if [[ -n "$producthunt_launch_url" && $firecrawl_count -lt 3 ]]; then
  mcp__firecrawl__firecrawl_scrape "$producthunt_launch_url" >> /tmp/user-pains.jsonl
  firecrawl_count=$((firecrawl_count + 1))
fi

# PII-Scrub
node scripts/pii-scrub.mjs /tmp/user-pains.jsonl > /tmp/user-pains-scrubbed.jsonl
```

## 4. Stufe 3 — 2026-Trend-Hypothesen

```bash
# Trend-Sources (alle frei via WebFetch)
node scripts/trend-fetch.mjs \
  --sources "chrome-platform-status,caniuse,web.dev,mozilla-hacks" \
  --category "<category>" \
  --since "2025-06" \
  > /tmp/trends.jsonl

# Filter gegen Hard-Constraints (pure-client, MIT, Refined-Minimalism)
node scripts/trend-filter-constraints.mjs /tmp/trends.jsonl > /tmp/trends-filtered.jsonl
```

## 5. Hypothesen-Synthese (Opus-Reasoning)

```bash
# Aggregiere alle drei Stufen-Outputs, generiere Hypothesen
# Dies ist der Opus-Reasoning-Teil — nutzt Agent-LLM-Context
node scripts/diff-research-synthesize.mjs \
  --stufe1 /tmp/stufe1.jsonl /tmp/stufe1-reviews.jsonl \
  --stufe2 /tmp/user-pains-scrubbed.jsonl \
  --stufe3 /tmp/trends-filtered.jsonl \
  --output dossiers/<slug>/differentiation-deep-research.md
```

## 6. Citation-Verify

```bash
node scripts/citation-verify.mjs dossiers/<slug>/differentiation-deep-research.md
# Bei fail: inbox/to-ceo/diff-research-citation-fail-<slug>.md, retry max 1
```

## 7. Cache-Index + Task-End

```bash
echo "<slug> | $(date -I) | $(wc -l < /tmp/stufe2.jsonl) pains | $(jq length < /tmp/trends-filtered.jsonl) trends" \
  >> memory/diff-research-cache-index.md

# CEO informieren, dass Deep-Research ready für Tool-Dossier §9 Patch
cat > "inbox/to-ceo/diff-research-complete-<slug>.md" <<EOF
Differenzierungs-Deep-Research komplett für <slug>.
- Output: dossiers/<slug>/differentiation-deep-research.md
- Hypothesen: $(jq '.hypotheses | length' /tmp/synthesis-meta.json)
- User-Pains gesammelt: $(wc -l < /tmp/user-pains-scrubbed.jsonl)
- Trends identifiziert: $(jq 'length' /tmp/trends-filtered.jsonl)
- Firecrawl-Calls: $firecrawl_count/3
EOF

rm "tasks/dossier-locks/<slug>-diff.lock"
```

## 8. Forbidden Actions

- Standard-Tools researchen (nur Unique-Strategy-Tools)
- 10-Sektionen-Schablone ausfüllen
- `git *`, Code-Edits
- Firecrawl >3×
- Paywall-Content paraphrasieren
- Hypothesen ohne ≥2 Primärquellen
- PII ohne Scrub in File
