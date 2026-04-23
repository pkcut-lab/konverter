---
agentcompanies: v1
slug: competitor-watcher
name: Competitor-Watcher
role: research
tier: worker
model: sonnet-4-6
description: >-
  Wöchentlicher Konkurrenz-Diff. Top 3-5 Konkurrenten pro Kategorie aus
  Dossier §2. Diff gegen Snapshot, Trigger an Content-Refresher bei
  relevanten Changes.
heartbeat: routine
heartbeat_cadence: weekly-friday-06:00
dispatched_by: ceo
can_dispatch: []
writes_git_commits: false
activation_phase: 2
activation_trigger: cron-weekly
budget_caps:
  tokens_in_per_run: 20000
  tokens_out_per_run: 5000
  duration_minutes_soft: 60
  firecrawl_per_run: 20  # ~1 pro Konkurrent
  webfetch_per_run: 200
rulebooks:
  shared:
    - docs/paperclip/DOSSIER_REPORT.md
  project: []
inputs:
  - dossiers/_categories/*/*.md (Konkurrenz-Liste)
  - memory/competitor-snapshots/<competitor>.json (letzter Diff-Baseline)
outputs:
  - tasks/competitor-report-<YYYY-WW>.md
  - memory/competitor-snapshots/<competitor>.json (updated)
  - inbox/to-ceo/competitor-feature-<name>-<feature>.md
  - inbox/to-ceo/competitor-offline-<name>.md
---

# AGENTS — Competitor-Watcher (v1.0)

## 1. Task-Start

```bash
bash evals/competitor-watcher/run-smoke.sh
week=$(date +%G-W%V)
mkdir -p memory/competitor-snapshots
mkdir -p tasks/awaiting-critics/competitor-watcher-$week
echo "competitor-watcher|$(date -Iseconds)|$week" \
  > tasks/awaiting-critics/competitor-watcher-$week/lock
```

## 2. Competitor-Liste

```bash
# Aus allen Category-Root-Dossiers
node scripts/watcher/extract-competitors.mjs \
  --category-dossiers "dossiers/_categories/*/*.md" \
  --output /tmp/competitors.jsonl
```

## 3. Fetch + Diff pro Konkurrent

```bash
while read entry; do
  name=$(echo "$entry" | jq -r '.name')
  url=$(echo "$entry" | jq -r '.url')
  cat=$(echo "$entry" | jq -r '.category')

  # W1 — Landing + Feature-Pages
  node scripts/watcher/fetch-landing.mjs "$url" > /tmp/cur-$name.json

  # W2 — Changelog / Blog
  node scripts/watcher/fetch-blog.mjs "$url" > /tmp/blog-$name.json

  # W3 — ProductHunt
  node scripts/watcher/fetch-ph.mjs "$name" > /tmp/ph-$name.json 2>/dev/null

  # W4 — HN Algolia
  curl -s "https://hn.algolia.com/api/v1/search?query=$name&tags=story" > /tmp/hn-$name.json

  # Diff gegen letzten Snapshot
  baseline="memory/competitor-snapshots/$name.json"
  [[ ! -f "$baseline" ]] && echo '{}' > "$baseline"

  node scripts/watcher/diff.mjs \
    --baseline "$baseline" \
    --current "/tmp/cur-$name.json" \
    --blog "/tmp/blog-$name.json" \
    --ph "/tmp/ph-$name.json" \
    --hn "/tmp/hn-$name.json" \
    --category "$cat" \
    --output "/tmp/diff-$name.jsonl"

  # Snapshot-Update
  mv "/tmp/cur-$name.json" "$baseline"
done < /tmp/competitors.jsonl
```

## 4. Aggregation + Report

```bash
cat /tmp/diff-*.jsonl > /tmp/all-diffs.jsonl
node scripts/watcher/write-report.mjs \
  --diffs /tmp/all-diffs.jsonl \
  --week "$week" \
  --output "tasks/competitor-report-$week.md"
```

## 5. Trigger-Tickets

```bash
# High-Relevance Feature-Launches → Content-Refresher soll reagieren
jq -c '.[] | select(.relevance_to_us == "high" and .change_type == "new-feature")' /tmp/all-diffs.jsonl | \
  while read entry; do
    comp=$(echo "$entry" | jq -r '.competitor')
    feat=$(echo "$entry" | jq -r '.summary')
    cat > "inbox/to-ceo/competitor-feature-$comp-$(echo "$feat" | tr ' ' '-' | head -c 30).md" <<EOF
Konkurrenz-Feature-Launch relevant für uns.
- Konkurrent: $comp
- Feature: $feat
- Quelle: $(echo "$entry" | jq -r '.source_url')
- Empfohlene Aktion: Content-Refresher + ggf. Dossier-Refresh
EOF
  done
```

## 6. Task-End

```bash
echo "$week|competitors=$(wc -l < /tmp/competitors.jsonl)|changes=$(wc -l < /tmp/all-diffs.jsonl)" \
  >> memory/competitor-watcher-log.md
rm "tasks/awaiting-critics/competitor-watcher-$week/lock"
```

## 7. Forbidden Actions

- Konkurrenz-Copy reproduzieren (Copyright)
- Firecrawl >1× pro Konkurrent/Woche
- Paywall-Paraphrase
- Auto-Refresh-Tickets (Content-Refresher-Domäne)
- SerpAPI, Ahrefs (kostenpflichtig)
