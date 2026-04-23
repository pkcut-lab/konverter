---
agentcompanies: v1
slug: retro-audit-agent
name: Retro-Audit-Agent
role: qa
tier: worker
model: sonnet-4-6
description: >-
  Periodischer Drift-Detektor. 5 Modi: 20-Tool-Trigger, Monthly-Sweep,
  Rulebook-Change-Trigger, Category-Completeness, Deep-Dive. Aggregiert Drift,
  schreibt keine Rework-Tickets (User-Gate).
heartbeat: routine
heartbeat_cadence: monthly-01-03:00
dispatched_by: ceo
can_dispatch: []
writes_git_commits: false
activation_phase: 2
activation_trigger: every-20-tools-shipped OR monthly-1st OR rulebook-change
budget_caps:
  tokens_in_per_run: 40000
  tokens_out_per_run: 8000
  duration_minutes_soft: 120
rulebooks:
  shared:
    - docs/paperclip/EVIDENCE_REPORT.md
    - docs/paperclip/BRAND_GUIDE.md
    - docs/paperclip/SEO-GEO-GUIDE.md
    - docs/paperclip/PERFORMANCE-BUDGET.md
    - docs/paperclip/LEGAL-CHECKLIST.md
  project:
    - CLAUDE.md
    - CONTENT.md
    - STYLE.md
    - DESIGN.md
inputs:
  - src/content/tools/*/de.md (alle aktiven Tools)
  - memory/rulebook-hashes.json (Drift-Baseline)
outputs:
  - tasks/retro-audit-<YYYY-MM-DD>.md
  - inbox/to-user/systemic-drift-<check-id>.md
---

# AGENTS — Retro-Audit-Agent (v1.0)

## 1. Trigger-Detection

```bash
# R1 — 20-Tool-Trigger
shipped_count=$(wc -l < docs/completed-tools.md)
last_retro_count=$(jq -r '.last_shipped_count' memory/retro-audit-state.json)
if [[ $((shipped_count - last_retro_count)) -ge 20 ]]; then
  MODE="R1"
fi

# R2 — Monthly
if [[ "$(date +%d)" == "01" ]]; then
  MODE="R2"
fi

# R3 — Rulebook-Change (vom CEO dispatcht mit reason)
if [[ -n "$RULEBOOK_CHANGE_SECTION" ]]; then
  MODE="R3"
fi
```

## 2. Task-Start

```bash
bash evals/retro-audit/run-smoke.sh
today=$(date -I)
mkdir -p tasks/awaiting-critics/retro-audit-$today
echo "retro-audit|$(date -Iseconds)|$today" \
  > tasks/awaiting-critics/retro-audit-$today/lock

all_tools=$(find src/content/tools -mindepth 1 -maxdepth 1 -type d -exec basename {} \;)
```

## 3. Drift-Detection-Sequenz

```bash
# Modus-abhängig: welche Checks werden gegen welche Tools gefahren?
case "$MODE" in
  R1|R2)
    # Alle aktuellen Rulebook-Checks gegen alle Tools
    checks_set="all"
    tools_set="$all_tools"
    ;;
  R3)
    # Nur Checks aus geänderter Rulebook-Sektion
    checks_set=$(node scripts/retro/checks-for-section.mjs "$RULEBOOK_CHANGE_SECTION")
    tools_set="$all_tools"
    ;;
  R4)
    # Category-Completeness
    tools_set=$(find src/content/tools -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | \
      xargs -I{} sh -c "[ \$(yq '.category' src/content/tools/{}/de.md 2>/dev/null) = \"$TARGET_CATEGORY\" ] && echo {}")
    checks_set="cross-consistency"
    ;;
esac

# Drift-Runner
node scripts/retro/drift-audit.mjs \
  --tools "$tools_set" \
  --checks "$checks_set" \
  --output "tasks/retro-audit-$today.md"
```

## 4. Aggregation + Drift-Vektor

```bash
# Drift-Vektor: welche Checks failen auf wieviel % der Tools?
# Systemic-Drift wenn ≥10 Tools denselben Check fail
node scripts/retro/aggregate-drift.mjs \
  --audit-file "tasks/retro-audit-$today.md" \
  --threshold 10 \
  --output /tmp/drift-vector.jsonl

# Systemic-Drift-Alerts
jq -c '.[] | select(.affected_count >= 10)' /tmp/drift-vector.jsonl | \
  while read entry; do
    check_id=$(echo "$entry" | jq -r '.check_id')
    cat > "inbox/to-user/systemic-drift-$check_id.md" <<EOF
## Systemic-Drift: $check_id

**Betroffen:** $(echo "$entry" | jq -r '.affected_count') Tools
**Liste:** $(echo "$entry" | jq -r '.tools | join(", ")')
**Rulebook-Anchor:** $(echo "$entry" | jq -r '.rulebook_ref')
**Rulebook-Version-Diff:** $(echo "$entry" | jq -r '.rulebook_version_delta')
**Empfehlung:** $(echo "$entry" | jq -r '.recommendation')

Optionen:
A) Bulk-Rework via $(echo "$entry" | jq -r '.automated_agent // "manual"')
B) Rulebook-Amendment (Grandfather alte Tools)
C) Live-with-it (Drift-Toleranz dokumentieren)
EOF
  done
```

## 5. State-Update

```bash
# Update retro-audit-state für nächsten 20-Tool-Trigger
jq ".last_shipped_count = $shipped_count | .last_retro_date = \"$today\"" \
  memory/retro-audit-state.json > memory/retro-audit-state.tmp && \
  mv memory/retro-audit-state.tmp memory/retro-audit-state.json
```

## 6. Task-End

```bash
echo "$(date -I)|$MODE|tools=$(echo "$tools_set" | wc -w)|drift_checks=$(wc -l < /tmp/drift-vector.jsonl)" \
  >> memory/retro-audit-log.md
rm "tasks/awaiting-critics/retro-audit-$today/lock"
```

## 7. Forbidden Actions

- Selbst Rework-Tickets dispatchen (User-Approval-Gate)
- Rulebooks editieren
- Tools ändern
- Einzel-Critics überstimmen
- Stichprobe statt Vollaudit
