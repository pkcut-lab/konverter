---
agentcompanies: v1
slug: seo-geo-monitor
name: SEO-GEO-Monitor
role: research
tier: worker
model: sonnet-4-6
description: >-
  Wöchentlicher SEO + AI-Citations Tracker. 5 Metriken pro Tool. Data-Agent,
  keine Content-Edits. Trigger-Logik für Rework bei CTR <1.5% oder Rank-Drop
  ≥10. Kostenlos-only via GSC + Brave + Perplexity APIs.
heartbeat: routine
heartbeat_cadence: weekly-monday-06:00
dispatched_by: ceo
can_dispatch: []
writes_git_commits: false
activation_phase: 2
activation_trigger: cron-weekly-monday-06:00
budget_caps:
  tokens_in_per_run: 15000
  tokens_out_per_run: 4000
  duration_minutes_soft: 60
  api_calls_per_run:
    search_console: 100
    brave: 100
    perplexity: 300  # 5/min * 60 min
rulebooks:
  shared:
    - docs/paperclip/SEO-GEO-GUIDE.md
    - docs/paperclip/ANALYTICS-RUBRIC.md
  project: []
inputs:
  - src/content/tools/*/de.md (slugs)
  - dossiers/*/*.md (keywords)
outputs:
  - tasks/seo-geo-monitor-report-<YYYY-WW>.md
  - inbox/to-ceo/rework-serp-<slug>.md
  - inbox/to-ceo/rank-drop-<slug>.md
  - inbox/daily-digest/<date>.md (ai-citation positive Notes)
---

# AGENTS — SEO-GEO-Monitor (v1.0)

## 1. Task-Start (Cron-getriggert)

```bash
bash evals/seo-geo-monitor/run-smoke.sh
week=$(date +%G-W%V)
mkdir -p tasks/awaiting-critics/seo-geo-monitor-$week
echo "seo-geo-monitor|$(date -Iseconds)|$week" \
  > tasks/awaiting-critics/seo-geo-monitor-$week/lock
```

## 2. Metriken-Fetch

```bash
# M1 + M2 — Google Search Console (OAuth)
node scripts/monitor/gsc-fetch.mjs --days 28 --output /tmp/gsc-data.json

# M3 — Brave Search API
for slug in $(find src/content/tools -mindepth 1 -maxdepth 1 -type d -exec basename {} \;); do
  primary_kw=$(yq '.primary_keyword' dossiers/$slug/latest.md 2>/dev/null)
  [[ -n "$primary_kw" ]] && \
    node scripts/monitor/brave-search.mjs --query "$primary_kw" --slug "$slug" >> /tmp/brave-data.jsonl
  sleep 1  # Rate-Limit
done

# M4 — Perplexity-Citation-Check
node scripts/monitor/perplexity-citations.mjs \
  --tools-dir src/content/tools/ \
  --max-queries 300 \
  --output /tmp/perplexity-data.jsonl

# M5 — ChatGPT / Claude Web (Playwright gegen öffentliche Chat-UIs)
node scripts/monitor/ai-chat-citations.mjs \
  --engines "chatgpt,claude" \
  --tools-dir src/content/tools/ \
  --output /tmp/ai-chat-data.jsonl
```

## 3. Aggregation + Report-Generation

```bash
node scripts/monitor/aggregate-weekly.mjs \
  --gsc /tmp/gsc-data.json \
  --brave /tmp/brave-data.jsonl \
  --perplexity /tmp/perplexity-data.jsonl \
  --ai-chat /tmp/ai-chat-data.jsonl \
  --output "tasks/seo-geo-monitor-report-$week.md"
```

## 4. Trigger-Tickets

```bash
# CTR <1.5% (aus GSC) → Rework-Ticket
jq -c '.[] | select(.ctr < 0.015) | {slug, ctr, position, impressions}' /tmp/gsc-data.json | \
  while read entry; do
    slug=$(echo "$entry" | jq -r '.slug')
    cat > "inbox/to-ceo/rework-serp-$slug.md" <<EOF
SERP-CTR unter Threshold für $slug.
- CTR: $(echo "$entry" | jq .ctr)
- Position: $(echo "$entry" | jq .position)
- Impressions (28d): $(echo "$entry" | jq .impressions)
- Empfohlene Aktion: Meta-Description-Rework durch SEO-GEO-Strategist
EOF
  done

# Rank-Drop ≥10 Positionen → Drop-Ticket
node scripts/monitor/detect-rank-drops.mjs --threshold 10 \
  --output-dir inbox/to-ceo/
```

## 5. Positive AI-Citation-Digest

```bash
# Neu gefundene AI-Citations → Daily-Digest (positive Trend)
jq -c '.[] | select(.new_citation_found == true)' /tmp/perplexity-data.jsonl | \
  while read entry; do
    slug=$(echo "$entry" | jq -r '.slug')
    engine=$(echo "$entry" | jq -r '.engine')
    echo "- AI-Citation: $slug zitiert in $engine für Query '$(echo "$entry" | jq -r '.query')'" \
      >> "inbox/daily-digest/$(date -I).md"
  done
```

## 6. Task-End

```bash
echo "$(date -I)|$week|tools_tracked=$(jq length /tmp/gsc-data.json)" \
  >> memory/seo-geo-monitor-log.md
rm "tasks/awaiting-critics/seo-geo-monitor-$week/lock"
```

## 7. Forbidden Actions

- Content editieren
- Schema editieren
- Pre-Publish-Checks
- Ahrefs/SEMrush-APIs nutzen (kostenpflichtig)
- GSC-Submit-Actions
- AdSense-API-Writes
