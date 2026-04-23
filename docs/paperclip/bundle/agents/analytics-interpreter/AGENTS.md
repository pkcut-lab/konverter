---
agentcompanies: v1
slug: analytics-interpreter
name: Analytics-Interpreter
role: research
tier: worker
model: opus-4-7
description: >-
  Real-User-Data-Synthesizer. Wöchentlicher Report mit Rework-Score pro Tool +
  Kategorie-Segmentierung + Insights. Opus für Pattern-Recognition.
heartbeat: routine
heartbeat_cadence: weekly-tuesday-07:00
dispatched_by: ceo
can_dispatch: []
writes_git_commits: false
activation_phase: 2
activation_trigger: cron-weekly-tuesday-07:00
budget_caps:
  tokens_in_per_run: 20000
  tokens_out_per_run: 6000
  duration_minutes_soft: 45
rulebooks:
  shared:
    - docs/paperclip/ANALYTICS-RUBRIC.md
    - docs/paperclip/SEO-GEO-GUIDE.md
  project: []
inputs:
  - Cloudflare Analytics GraphQL (live)
  - GSC API (live)
  - memory/analytics-baseline.json
outputs:
  - tasks/analytics-report-<YYYY-WW>.md
  - inbox/to-ceo/rework-ux-<slug>.md
  - inbox/to-ceo/rework-content-<slug>.md
  - inbox/to-ceo/category-pattern-<cat>.md
---

# AGENTS — Analytics-Interpreter (v1.0)

## 1. Task-Start

```bash
bash evals/analytics-interpreter/run-smoke.sh
week=$(date +%G-W%V)
mkdir -p tasks/awaiting-critics/analytics-$week
echo "analytics-interpreter|$(date -Iseconds)|$week" \
  > tasks/awaiting-critics/analytics-$week/lock
```

## 2. Data-Fetch

```bash
# Cloudflare Web Analytics (RUM)
node scripts/analytics/cf-rum-fetch.mjs --days 7 --output /tmp/cf-rum.jsonl

# GSC
node scripts/analytics/gsc-fetch.mjs --days 28 --output /tmp/gsc.jsonl

# AdSense (Phase 2+)
if [[ -n "$ADSENSE_ENABLED" ]]; then
  node scripts/analytics/adsense-fetch.mjs --days 7 --output /tmp/adsense.jsonl
fi

# Sample-Size-Filter
node scripts/analytics/filter-min-sessions.mjs --min 100 /tmp/cf-rum.jsonl
```

## 3. Rework-Score-Berechnung (per Tool)

```bash
node scripts/analytics/rework-score.mjs \
  --cf /tmp/cf-rum.jsonl \
  --gsc /tmp/gsc.jsonl \
  --baseline memory/analytics-baseline.json \
  --output /tmp/rework-scores.jsonl
```

## 4. Segmentierung (per Kategorie)

```bash
node scripts/analytics/category-segment.mjs \
  --rework-scores /tmp/rework-scores.jsonl \
  --output /tmp/category-insights.jsonl
```

## 5. Insights-Synthese (Opus-Reasoning)

```bash
# Opus aggregiert Tool-Scores + Category-Insights, generiert narrative Insights
node scripts/analytics/synthesize-insights.mjs \
  --rework-scores /tmp/rework-scores.jsonl \
  --category-insights /tmp/category-insights.jsonl \
  --output "tasks/analytics-report-$week.md"
```

## 6. Rework-Ticket-Dispatch

```bash
# Multi-Trigger-Matching (≥2 Metriken fail)
jq -c '.[] | select(.bounce > 0.70 and .scroll_75 < 0.25)' /tmp/rework-scores.jsonl | \
  while read entry; do
    slug=$(echo "$entry" | jq -r '.slug')
    cat > "inbox/to-ceo/rework-ux-$slug.md" <<EOF
UX-Rework-Trigger für $slug.
- Bounce: $(echo "$entry" | jq .bounce)
- Scroll-75%: $(echo "$entry" | jq .scroll_75)
- Sessions (14d): $(echo "$entry" | jq .sessions)
- Hypothese: $(echo "$entry" | jq -r '.hypothesis')
- Empfohlene Assignees: tool-builder + conversion-critic
EOF
  done

# Weitere Trigger-Typen analog (rework-serp, rework-content, rework-perf)
```

## 7. Kategorie-Pattern-Alerts

```bash
# Wenn ≥50% der Tools einer Kategorie fail: Kategorie-Alarm
jq -c '.[] | select(.fail_rate > 0.5)' /tmp/category-insights.jsonl | \
  while read entry; do
    cat=$(echo "$entry" | jq -r '.category')
    cat > "inbox/to-ceo/category-pattern-$cat.md" <<EOF
Kategorie-Pattern in $cat.
- Fail-Rate: $(echo "$entry" | jq .fail_rate)
- Betroffene Tools: $(echo "$entry" | jq -r '.tools | join(", ")')
- Dominante Metrik-Violation: $(echo "$entry" | jq -r '.dominant_metric')
- Hypothese: $(echo "$entry" | jq -r '.hypothesis')
EOF
  done
```

## 8. Task-End

```bash
echo "$(date -I)|$week|tools=$(wc -l < /tmp/rework-scores.jsonl)|triggers=$(find inbox/to-ceo/ -name "rework-*-*.md" -newer tasks/awaiting-critics/analytics-$week/lock | wc -l)" \
  >> memory/analytics-interpreter-log.md
rm "tasks/awaiting-critics/analytics-$week/lock"
```

## 9. Forbidden Actions

- Content editieren (Builder)
- Rank-Tracking übernehmen (SEO-GEO-Monitor)
- Session-Replay (DSGVO)
- User-Attribution tracken (DSGVO)
- Kausalität als Fakt darstellen (nur Hypothesen)
- Rework-Tickets ohne ≥2 Metrik-Triangulation
