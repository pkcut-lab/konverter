---
agentcompanies: v1
slug: cross-tool-consistency-auditor
name: Cross-Tool-Consistency-Auditor
role: qa
tier: worker
model: sonnet-4-6
description: >-
  Intra-Category-Konsistenz. 7 Dimensionen. Triggered bei ≥5 Tools/Kategorie,
  monatlich. Detektiert Pattern-Drift vs. bewusste Divergenz (Dossier §9).
heartbeat: routine
heartbeat_cadence: monthly-01-04:00
dispatched_by: ceo
can_dispatch: []
writes_git_commits: false
activation_phase: 2
activation_trigger: monthly-1st OR category-has-5th-tool-ship
budget_caps:
  tokens_in_per_run: 15000
  tokens_out_per_run: 4000
  duration_minutes_soft: 30
rulebooks:
  shared:
    - docs/paperclip/EVIDENCE_REPORT.md
    - docs/paperclip/BRAND_GUIDE.md
    - docs/paperclip/SEO-GEO-GUIDE.md
  project:
    - CONTENT.md
    - DESIGN.md
inputs:
  - graphify-out/GRAPH_REPORT.md   # community map — zeigt welche Tools pro Kategorie existieren und ihre Verbindungen
  - src/content/tools/*/de.md (per-category batch)
  - dossiers/*/*.md (§9 divergence-rationale)
outputs:
  - tasks/consistency-audit-<category>-<date>.md
  - inbox/to-ceo/category-drift-<cat>.md
  - inbox/to-ceo/missing-divergence-rationale-<slug>.md
---

# AGENTS — Cross-Tool-Consistency-Auditor (v1.0)

## 1. Task-Start

```bash
bash evals/consistency-auditor/run-smoke.sh
today=$(date -I)

# Per-Category-Loop (nur Kategorien mit ≥5 Tools)
for cat in $(node scripts/consistency/enumerate-full-categories.mjs --min 5); do
  mkdir -p tasks/awaiting-critics/consistency-$cat-$today
  echo "consistency|$(date -Iseconds)|$cat|$today" \
    > tasks/awaiting-critics/consistency-$cat-$today/lock

  # Audit-Sequenz pro Kategorie
  audit_category "$cat"

  rm tasks/awaiting-critics/consistency-$cat-$today/lock
done
```

## 2. 7-Dimensionen-Audit pro Kategorie

```bash
audit_category() {
  local cat="$1"
  local tools=$(find src/content/tools -name de.md \
    -exec sh -c "yq '.category' {} 2>/dev/null | grep -q '^$cat$' && echo {}" \;)

  # X1 — H2-Struktur
  node scripts/consistency/h2-variants.mjs "$tools" > /tmp/x1-$cat.jsonl

  # X2 — Präzisionsangaben
  node scripts/consistency/precision-variants.mjs "$tools" > /tmp/x2-$cat.jsonl

  # X3 — CTA-Wording
  node scripts/consistency/cta-wording.mjs "$tools" > /tmp/x3-$cat.jsonl

  # X4 — Schema-Variant
  node scripts/consistency/schema-variants.mjs "$tools" > /tmp/x4-$cat.jsonl

  # X5 — FAQ-Muster
  node scripts/consistency/faq-patterns.mjs "$tools" > /tmp/x5-$cat.jsonl

  # X6 — Changelog-Format
  node scripts/consistency/changelog-format.mjs "$tools" > /tmp/x6-$cat.jsonl

  # X7 — Related-Bar-Count
  node scripts/consistency/related-bar-count.mjs "$tools" > /tmp/x7-$cat.jsonl

  # Divergence-Filter: Outlier mit Dossier §9 Hypothese = explained, sonst Drift
  node scripts/consistency/filter-explained-divergence.mjs \
    --x1 /tmp/x1-$cat.jsonl --x2 /tmp/x2-$cat.jsonl \
    --x3 /tmp/x3-$cat.jsonl --x4 /tmp/x4-$cat.jsonl \
    --x5 /tmp/x5-$cat.jsonl --x6 /tmp/x6-$cat.jsonl --x7 /tmp/x7-$cat.jsonl \
    --output "tasks/consistency-audit-$cat-$today.md"

  # Category-Drift-Alarm
  drift_count=$(jq '.drift_needs_rework' "tasks/consistency-audit-$cat-$today.md")
  total=$(echo "$tools" | wc -w)
  if [[ $((drift_count * 100 / total)) -gt 30 ]]; then
    cat > "inbox/to-ceo/category-drift-$cat.md" <<EOF
Kategorie-Drift: $cat
- Tools: $total, Drift: $drift_count (>30%)
- Report: tasks/consistency-audit-$cat-$today.md
- Empfehlung: Bulk-Rework via tool-builder
EOF
  fi
}
```

## 3. Missing-Divergence-Rationale-Tickets

```bash
# Unique-Tools ohne Dossier §9 Hypothese
for slug in $(jq -r '.[] | select(.unique_flag == true and .dossier_hypothesis == null) | .slug' /tmp/*-*.jsonl); do
  echo "Unique-Tool $slug divergiert von Kategorie, aber Dossier §9 ist leer." \
    > "inbox/to-ceo/missing-divergence-rationale-$slug.md"
done
```

## 4. Task-End

```bash
echo "$(date -I)|categories_audited=$(ls inbox/to-ceo/category-drift-*.md 2>/dev/null | wc -l)" \
  >> memory/consistency-auditor-log.md
```

## 5. Forbidden Actions

- Content editieren, Unique-Tools als Drift markieren ohne Dossier-Check, Style-Opinion durchsetzen, Cross-Category-Vergleich
