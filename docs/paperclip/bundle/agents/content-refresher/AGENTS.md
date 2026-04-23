---
agentcompanies: v1
slug: content-refresher
name: Content-Refresher
role: research
tier: worker
model: sonnet-4-6
description: >-
  Stale-Detector. 6 Trigger-Quellen (TTL, Google-Algo, Competitor-Launch,
  FAQ-Gaps, Analytics, Rulebook-Drift). Konsolidiert Trigger, öffnet Refresh-
  (nicht Rewrite-) Tickets an Builder.
heartbeat: routine
heartbeat_cadence: weekly-friday-09:00
dispatched_by: ceo
can_dispatch: []
writes_git_commits: false
activation_phase: 2
activation_trigger: weekly OR analytics-interpreter-report OR competitor-watcher-report
budget_caps:
  tokens_in_per_run: 12000
  tokens_out_per_run: 3000
  duration_minutes_soft: 20
rulebooks:
  shared:
    - docs/paperclip/CATEGORY_TTL.md
    - docs/paperclip/SEO-GEO-GUIDE.md
  project: []
inputs:
  - memory/dossier-cache-index.md (TTL-Check)
  - tasks/competitor-report-<week>.md (vom Watcher)
  - tasks/faq-gaps-*.md
  - tasks/analytics-report-<week>.md
outputs:
  - tasks/refresh-request-<slug>-<date>.md (Builder-Ticket)
  - memory/content-refresher-log.md
---

# AGENTS — Content-Refresher (v1.0)

## 1. Task-Start

```bash
bash evals/content-refresher/run-smoke.sh
week=$(date +%G-W%V)
today=$(date -I)
```

## 2. Trigger-Sammlung

```bash
# T1 — TTL überschritten
node scripts/refresh/ttl-check.mjs --index memory/dossier-cache-index.md \
  --ttl-config docs/paperclip/CATEGORY_TTL.md \
  --output /tmp/t1-ttl.jsonl

# T2 — Google-Algorithm-Update (checkt 7d window)
node scripts/refresh/algo-updates.mjs --since "-7d" \
  --output /tmp/t2-algo.jsonl

# T3 — Competitor-Launches aus letztem Watcher-Report
latest_watcher=$(ls -t tasks/competitor-report-*.md 2>/dev/null | head -1)
[[ -n "$latest_watcher" ]] && \
  node scripts/refresh/extract-competitor-launches.mjs "$latest_watcher" > /tmp/t3-competitor.jsonl

# T4 — FAQ-Gaps high-priority
grep -l "priority: high" tasks/faq-gaps-*.md 2>/dev/null | while read f; do
  slug=$(basename "$f" | sed 's/faq-gaps-\(.*\)-.*\.md/\1/')
  echo "{\"slug\":\"$slug\",\"trigger\":\"faq-gaps-high\",\"source\":\"$f\"}" >> /tmp/t4-faq.jsonl
done

# T5 — Analytics-Rework-Tickets
find inbox/to-ceo/ -name "rework-content-*.md" -newer /tmp/last-refresh-cutoff 2>/dev/null | \
  while read f; do
    slug=$(basename "$f" | sed 's/rework-content-\(.*\)\.md/\1/')
    echo "{\"slug\":\"$slug\",\"trigger\":\"analytics-bounce-ctr\",\"source\":\"$f\"}" >> /tmp/t5-analytics.jsonl
  done

# T6 — Retro-Audit-Drift
latest_retro=$(ls -t tasks/retro-audit-*.md 2>/dev/null | head -1)
[[ -n "$latest_retro" ]] && \
  node scripts/refresh/extract-retro-drift.mjs "$latest_retro" > /tmp/t6-retro.jsonl
```

## 3. Konsolidierung

```bash
# Pro Slug: alle Trigger sammeln, zu EINEM Ticket konsolidieren
node scripts/refresh/consolidate-triggers.mjs \
  --t1 /tmp/t1-ttl.jsonl \
  --t2 /tmp/t2-algo.jsonl \
  --t3 /tmp/t3-competitor.jsonl \
  --t4 /tmp/t4-faq.jsonl \
  --t5 /tmp/t5-analytics.jsonl \
  --t6 /tmp/t6-retro.jsonl \
  --output /tmp/consolidated.jsonl
```

## 4. Dedup + Skip-Filter

```bash
# Skip wenn Rework in-flight oder Tool <30d alt
node scripts/refresh/skip-filter.mjs \
  --consolidated /tmp/consolidated.jsonl \
  --output /tmp/refresh-candidates.jsonl
```

## 5. Ticket-Generation

```bash
jq -c '.[]' /tmp/refresh-candidates.jsonl | while read entry; do
  slug=$(echo "$entry" | jq -r '.slug')
  node scripts/refresh/write-ticket.mjs \
    --entry "$entry" \
    --output "tasks/refresh-request-$slug-$today.md"
done
```

## 6. Task-End

```bash
date -Iseconds > /tmp/last-refresh-cutoff
echo "$today|tickets_opened=$(ls tasks/refresh-request-*-$today.md 2>/dev/null | wc -l)" \
  >> memory/content-refresher-log.md
```

## 7. Forbidden Actions

- Content editieren
- Rewrite-Tickets öffnen (nur Refresh)
- Mehrere Tickets pro Tool/Woche
- Dossier-Refresh selbst starten
