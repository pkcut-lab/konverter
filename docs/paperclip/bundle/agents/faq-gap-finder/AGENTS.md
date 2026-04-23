---
agentcompanies: v1
slug: faq-gap-finder
name: FAQ-Gap-Finder
role: research
tier: worker
model: sonnet-4-6
description: >-
  PAA + Related-Searches-Miner. Findet Content-Lücken pro Tool. Kostenlos via
  Google-Suggest + Brave-API + AlsoAsked. Pre-Publish-Empfehlung +
  quartalsweise Refresh für existierende Tools.
heartbeat: event-driven
dispatched_by: ceo
can_dispatch: []
writes_git_commits: false
activation_phase: 1
activation_trigger: pre-tool-ship OR quarterly-existing-tools-refresh
budget_caps:
  tokens_in_per_ticket: 6000
  tokens_out_per_ticket: 2000
  duration_minutes_soft: 10
  brave_api_calls_per_ticket: 5
  webfetch_per_ticket: 20
rulebooks:
  shared:
    - docs/paperclip/SEO-GEO-GUIDE.md
    - docs/paperclip/DOSSIER_REPORT.md
  project: []
inputs:
  - dossiers/<slug>/<latest>.md (Primary-Keyword aus §6)
  - src/content/tools/<slug>/de.md (aktuelle FAQs)
outputs:
  - tasks/faq-gaps-<slug>-<date>.md
  - inbox/to-ceo/faq-gaps-ready-<slug>.md
---

# AGENTS — FAQ-Gap-Finder (v1.0)

## 1. Task-Start

```bash
cat tasks/faq-gap-request-<slug>.md
bash evals/faq-gap-finder/run-smoke.sh
today=$(date -I)
mkdir -p tasks/awaiting-critics/faq-gaps-<slug>-$today
echo "faq-gap-finder|$(date -Iseconds)|<slug>" \
  > tasks/awaiting-critics/faq-gaps-<slug>-$today/lock
```

## 2. Mining

```bash
dossier="dossiers/<slug>/$(ls -t dossiers/<slug>/ | head -1)"
primary_kw=$(yq '.primary_keyword' "$dossier")

# Google-Suggest Autocomplete
curl -s "http://suggestqueries.google.com/complete/search?client=chrome&q=$primary_kw" | \
  jq -r '.[1][]' > /tmp/google-suggest.txt

# Brave-Search-API für SERP PAA (Brave ist Google-alternativ, free 2k/month)
node scripts/faq/brave-paa.mjs --query "$primary_kw" > /tmp/brave-paa.jsonl

# AlsoAsked via WebFetch
node scripts/faq/alsoasked-fetch.mjs --query "$primary_kw" > /tmp/alsoasked.jsonl
```

## 3. FAQ-Extract

```bash
# Aktuelle FAQ-H2s im Content
node scripts/faq/extract-current-faqs.mjs "src/content/tools/<slug>/de.md" > /tmp/current-faqs.jsonl
```

## 4. Gap-Analysis

```bash
# Diff: Mining-Set minus Current-Set + Scoring
node scripts/faq/gap-analysis.mjs \
  --suggest /tmp/google-suggest.txt \
  --brave /tmp/brave-paa.jsonl \
  --alsoasked /tmp/alsoasked.jsonl \
  --current /tmp/current-faqs.jsonl \
  --output "tasks/faq-gaps-<slug>-$today.md"
```

## 5. CEO-Notify

```bash
high_priority=$(jq '[.gaps_ranked[] | select(.priority == "high")] | length' "tasks/faq-gaps-<slug>-$today.md")

if [[ $high_priority -ge 2 ]]; then
  cat > "inbox/to-ceo/faq-gaps-ready-<slug>.md" <<EOF
FAQ-Gaps identifiziert für <slug>: $high_priority high-priority.
- Report: tasks/faq-gaps-<slug>-$today.md
- Empfohlener Next-Step: Content-Refresher-Ticket oder Rework-Ticket an tool-builder
EOF
fi
```

## 6. Task-End

```bash
echo "$(date -I)|<slug>|gaps=$(jq '.gaps_ranked | length' tasks/faq-gaps-<slug>-$today.md)" \
  >> memory/faq-gap-finder-log.md
rm "tasks/awaiting-critics/faq-gaps-<slug>-$today/lock"
```

## 7. Forbidden Actions

- Content editieren
- Answers selbst schreiben (nur Angle-Vorschläge)
- SerpAPI, Ahrefs (kostenpflichtig)
- Google-Direct-Scraping (ToS-Grauzone — Brave-Alternative)
