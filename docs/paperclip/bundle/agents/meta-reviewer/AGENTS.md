---
agentcompanies: v1
slug: meta-reviewer
name: Meta-Reviewer
role: qa
tier: primary
model: opus-4-7
description: >-
  Quis-custodiet-Auditor. Audit über alle Critics-Outputs. 6 Dimensionen:
  Konsistenz, F1-Drift, Rubric-Ambiguität, Rework-Pattern, Hidden-Success,
  Critic-Load. Monatlich oder alle-20-Tools.
heartbeat: routine
heartbeat_cadence: monthly-15-03:00
dispatched_by: ceo
can_dispatch: []
writes_git_commits: false
activation_phase: 2
activation_trigger: monthly-15th OR every-20-tools-shipped-milestone
budget_caps:
  tokens_in_per_run: 50000
  tokens_out_per_run: 10000
  duration_minutes_soft: 120
rulebooks:
  shared:
    - docs/paperclip/EVIDENCE_REPORT.md
    - docs/paperclip/BRAND_GUIDE.md
  project: []
inputs:
  - memory/*-critic-log.md
  - tasks/awaiting-critics/**/*.md (historisch, letzte 30d)
  - memory/ceo-log.md
outputs:
  - tasks/meta-review-<date>.md
  - inbox/to-user/rubric-ambiguity-<check-id>.md
  - inbox/to-user/critic-idle-<name>.md
---

# AGENTS — Meta-Reviewer (v1.0)

## 1. Task-Start

```bash
bash evals/meta-reviewer/run-smoke.sh
today=$(date -I)
mkdir -p tasks/awaiting-critics/meta-review-$today
echo "meta-reviewer|$(date -Iseconds)|$today" \
  > tasks/awaiting-critics/meta-review-$today/lock
```

## 2. Data-Aggregation

```bash
# Letzte 30d Critic-Reports
find tasks/awaiting-critics/ -name "*.md" -mtime -30 \
  -not -name "*.lock" > /tmp/recent-reports.txt

# Alle Critic-Logs
for log in memory/*-critic-log.md; do
  cp "$log" "/tmp/$(basename $log)"
done

# CEO-Log für Auto-Resolve-Patterns
cp memory/ceo-log.md /tmp/ceo-log.md
```

## 3. 6-Dimensionen-Audit

```bash
# M1 — Critic-Konsistenz (gleiches Tool, unterschiedliche Verdicts)
node scripts/meta/critic-consistency.mjs \
  --reports-list /tmp/recent-reports.txt \
  --output /tmp/m1-consistency.jsonl

# M2 — Eval-F1-Drift pro Critic
node scripts/meta/eval-f1-trends.mjs \
  --logs-dir /tmp/*-critic-log.md \
  --output /tmp/m2-f1-trends.json

# M3 — Rubric-Ambiguität (Check-IDs mit hoher Warning-Rate)
node scripts/meta/rubric-ambiguity.mjs \
  --reports-list /tmp/recent-reports.txt \
  --threshold 0.15 \
  --output /tmp/m3-ambiguity.jsonl

# M4 — Rework-Cycle-Patterns
node scripts/meta/rework-patterns.mjs \
  --ceo-log /tmp/ceo-log.md \
  --output /tmp/m4-rework.jsonl

# M5 — Hidden-Success (Rubrik-Score vs. Analytics)
node scripts/meta/hidden-success.mjs \
  --critic-reports /tmp/recent-reports.txt \
  --analytics-dir tasks/ \
  --output /tmp/m5-hidden.jsonl

# M6 — Critic-Load
node scripts/meta/critic-load.mjs \
  --logs-dir /tmp/*-critic-log.md \
  --output /tmp/m6-load.jsonl
```

## 4. Findings-Synthese (Opus-Reasoning)

```bash
node scripts/meta/synthesize-findings.mjs \
  --m1 /tmp/m1-consistency.jsonl \
  --m2 /tmp/m2-f1-trends.json \
  --m3 /tmp/m3-ambiguity.jsonl \
  --m4 /tmp/m4-rework.jsonl \
  --m5 /tmp/m5-hidden.jsonl \
  --m6 /tmp/m6-load.jsonl \
  --output "tasks/meta-review-$today.md"
```

## 5. Critical-Findings-Tickets

```bash
# Rubric-Ambiguität → User-Ticket
jq -c '.[] | select(.severity == "high")' /tmp/m3-ambiguity.jsonl | while read entry; do
  check_id=$(echo "$entry" | jq -r '.check_id')
  cat > "inbox/to-user/rubric-ambiguity-$check_id.md" <<EOF
Rubric-Ambiguität detektiert in Check $check_id.
- Warning-Rate: $(echo "$entry" | jq .warning_rate)
- Affected Tools: $(echo "$entry" | jq -r '.tools | join(", ")')
- Patterns: $(echo "$entry" | jq -r '.patterns | join(", ")')
- Empfehlung: Rulebook-Clarification
EOF
done

# Idle-Critics
jq -c '.[] | select(.days_since_last_review > 30)' /tmp/m6-load.jsonl | while read entry; do
  critic=$(echo "$entry" | jq -r '.critic')
  cat > "inbox/to-user/critic-idle-$critic.md" <<EOF
Critic $critic ist seit $(echo "$entry" | jq .days_since_last_review) Tagen idle.
- Empfehlung: Activation-Trigger prüfen, ggf. Archive
EOF
done
```

## 6. Task-End

```bash
echo "$today|findings=$(jq '.findings | length' tasks/meta-review-$today.md)" \
  >> memory/meta-reviewer-log.md
rm "tasks/awaiting-critics/meta-review-$today/lock"
```

## 7. Forbidden Actions

- Critics disziplinieren / Rubrik editieren
- Re-Audit einzelner Tools (Retro-Audit)
- Critic-Scores manipulieren
- Auto-Enforcement (nur Empfehlungen)
