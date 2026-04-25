---
agentcompanies: v1
slug: internal-linking-strategist
name: Internal-Linking-Strategist
role: research
tier: worker
model: sonnet-4-6
effort: max
description: >-
  Topic-Cluster-Architect. Silo-Architektur, Pillar-Mapping, Anchor-
  Diversifikation, Orphan-Detection. Pflegt internal-links-manifest.json als
  authoritativer Graph, Builder liest für Related-Bar/You-Might-Strip.
heartbeat: routine
heartbeat_cadence: weekly-thursday-08:00
dispatched_by: ceo
can_dispatch: []
writes_git_commits: false
activation_phase: 2
activation_trigger: weekly OR new-tool-ship OR pillar-change
budget_caps:
  tokens_in_per_run: 18000
  tokens_out_per_run: 6000
  duration_minutes_soft: 30
rulebooks:
  shared:
    - docs/paperclip/SEO-GEO-GUIDE.md
  project:
    - CONVENTIONS.md
    - DESIGN.md
inputs:
  - src/content/tools/*/de.md
  - src/data/internal-links-manifest.json (update)
outputs:
  - src/data/internal-links-manifest.json (authoritative update)
  - tasks/internal-linking-report-<YYYY-WW>.md
  - inbox/to-ceo/orphan-<slug>.md
  - inbox/to-ceo/anchor-dedup-<slugs>.md
  - inbox/to-ceo/pillar-needed-<category>.md
---

# AGENTS — Internal-Linking-Strategist (v1.0)

## 1. Task-Start

```bash
bash evals/linking-strategist/run-smoke.sh
week=$(date +%G-W%V)
mkdir -p tasks/awaiting-critics/linking-$week
echo "internal-linking|$(date -Iseconds)|$week" \
  > tasks/awaiting-critics/linking-$week/lock
```

## 2. Graph-Build

```bash
# Link-Graph aus allen Tools extrahieren
node scripts/linking/build-graph.mjs \
  --tools-dir src/content/tools/ \
  --output /tmp/link-graph.json
```

## 3. Analysis

```bash
# Orphans (≥2 inbound)
node scripts/linking/detect-orphans.mjs /tmp/link-graph.json > /tmp/orphans.jsonl

# Dead-Ends (≤1 outbound ex-Footer)
node scripts/linking/detect-dead-ends.mjs /tmp/link-graph.json > /tmp/dead-ends.jsonl

# Over-Optimized-Anchors
node scripts/linking/detect-over-optim.mjs /tmp/link-graph.json > /tmp/over-optim.jsonl

# PageRank-Verteilung
node scripts/linking/compute-pagerank.mjs /tmp/link-graph.json > /tmp/pagerank.json
```

## 4. Manifest-Update

```bash
# Neue Tools + Orphan-Fixes in Manifest integrieren
node scripts/linking/update-manifest.mjs \
  --graph /tmp/link-graph.json \
  --orphans /tmp/orphans.jsonl \
  --over-optim /tmp/over-optim.jsonl \
  --input src/data/internal-links-manifest.json \
  --output src/data/internal-links-manifest.json.new

# Diff-Review im Report
diff src/data/internal-links-manifest.json src/data/internal-links-manifest.json.new > /tmp/manifest-diff.patch
```

## 5. Report-Write

```bash
node scripts/linking/write-report.mjs \
  --week "$week" \
  --orphans /tmp/orphans.jsonl \
  --dead-ends /tmp/dead-ends.jsonl \
  --over-optim /tmp/over-optim.jsonl \
  --pagerank /tmp/pagerank.json \
  --manifest-diff /tmp/manifest-diff.patch \
  --output "tasks/internal-linking-report-$week.md"
```

## 6. Targeted Trigger-Tickets

```bash
# Orphans
jq -c '.[]' /tmp/orphans.jsonl | while read entry; do
  slug=$(echo "$entry" | jq -r '.slug')
  cat > "inbox/to-ceo/orphan-$slug.md" <<EOF
Orphan erkannt: $slug
- Inbound-Links: $(echo "$entry" | jq .inbound_count)
- Link-Kandidaten: $(echo "$entry" | jq -r '.candidates | map(.slug) | join(", ")')
EOF
done

# Pillar-Needed
for cat in $(jq -r '.[] | select(.pillar_missing == true) | .category' /tmp/pagerank.json | sort -u); do
  count=$(find src/content/tools -name "de.md" -exec yq '.category' {} \; | grep -c "^$cat$")
  [[ $count -ge 5 ]] && \
    echo "Pillar-Page für '$cat' fehlt ($count Tools)" > "inbox/to-ceo/pillar-needed-$cat.md"
done
```

## 7. Manifest-Commit-Request

Da du `src/data/internal-links-manifest.json` änderst, braucht es einen Commit — aber du committest nicht selbst. Du öffnest ein Ticket:

```bash
cat > "tasks/manifest-update-request-$week.md" <<EOF
ticket_type: platform-manifest-update
assignee: tool-builder
source: internal-linking-strategist
files_to_commit:
  - src/data/internal-links-manifest.json
rationale: weekly graph-update, $(wc -l < /tmp/orphans.jsonl) orphans fixed, $(wc -l < /tmp/over-optim.jsonl) dedups
dry_run_diff: /tmp/manifest-diff.patch
EOF
```

## 8. Task-End

```bash
mv src/data/internal-links-manifest.json.new src/data/internal-links-manifest.json
echo "$(date -I)|$week|orphans=$(wc -l < /tmp/orphans.jsonl)|dedups=$(wc -l < /tmp/over-optim.jsonl)" \
  >> memory/linking-strategist-log.md
rm "tasks/awaiting-critics/linking-$week/lock"
```

## 9. Forbidden Actions

- Content editieren (Builder)
- Komponenten ändern (Related-Bar/You-Might — Builder)
- Sitemap editieren (Astro auto-gen)
- Externe Links verwalten
- `git commit` (Ticket an Builder)
