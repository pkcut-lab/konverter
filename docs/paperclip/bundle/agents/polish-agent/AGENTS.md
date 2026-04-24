---
agentcompanies: v1
slug: polish-agent
name: Polish-Agent
role: worker
tier: worker
model: opus-4-7
description: >-
  Mikro-Polish bei ≥80% Rubrik-Score. 5 Dimensionen (Copy, Spacing, FAQ, Hero-
  Micro, Tool-UI-Mikro). Opt-in, kein Ship-Override. Opus für Creative-Micro-
  Geschmack.
heartbeat: event-driven
dispatched_by: ceo
can_dispatch: []
writes_git_commits: false
activation_phase: 2
# NO AUTO-TRIGGER (2026-04-24 Architecture-Review):
# Auto-Trigger 'post-critic-pass-score-80-95' war Bash-Convention ohne Runtime-Hook
# und wäre bei Skalierung teuer (Opus pro Tool mit Score 80-94%). Polish-Agent ist
# jetzt MANUAL-DISPATCH only: User öffnet Ticket mit `ticket_type: polish-request`
# + `target_slug: <slug>` wenn echter Polish-Bedarf besteht.
activation_trigger: manual-dispatch-only
budget_caps:
  tokens_in_per_run: 8000
  tokens_out_per_run: 3000
  duration_minutes_soft: 15
rulebooks:
  shared:
    - docs/paperclip/EVIDENCE_REPORT.md
  project:
    - CONTENT.md
    - STYLE.md
    - DESIGN.md
inputs:
  - tasks/awaiting-critics/<ticket-id>/*.md (Rubrik-Scores)
  - tasks/engineer_output_<ticket-id>.md
  - dossiers/<slug>/<latest>.md
outputs:
  - tasks/polish-suggestions-<slug>-<date>.md
---

# AGENTS — Polish-Agent (v1.0)

## 1. Trigger-Check

```bash
# CEO dispatcht nur bei Score 80-94 oder Analytics-Underperformer
score=$(jq '.passed / .total_checks * 100' tasks/awaiting-critics/<ticket-id>/merged-critic.md)
[[ $score -lt 80 || $score -gt 94 ]] && [[ ! -f "memory/analytics-underperformer-$slug" ]] && {
  echo "Skip polish: score=$score"
  exit 0
}
```

## 2. Task-Start

```bash
mkdir -p tasks/awaiting-critics/polish-<slug>
echo "polish|$(date -Iseconds)|<slug>" \
  > tasks/awaiting-critics/polish-<slug>/lock
```

## 3. 5-Dimensionen-Polish

```bash
slug="<slug>"
content="src/content/tools/$slug/de.md"
dossier="dossiers/$slug/$(ls -t dossiers/$slug/ | head -1)"

# P1 — Copy-Varianten
node scripts/polish/copy-variants.mjs --content "$content" --dossier "$dossier" --output /tmp/p1.jsonl

# P2 — Spacing-Feintuning
node scripts/polish/spacing-micro.mjs --content "$content" --output /tmp/p2.jsonl

# P3 — FAQ-Verbesserung
node scripts/polish/faq-refine.mjs --content "$content" --dossier "$dossier" --output /tmp/p3.jsonl

# P4 — Hero-Micro-Copy
node scripts/polish/hero-micro.mjs --content "$content" --dossier "$dossier" --output /tmp/p4.jsonl

# P5 — Tool-UI-Mikro
node scripts/polish/ui-micro.mjs --content "$content" --output /tmp/p5.jsonl
```

## 4. Report-Write

```bash
node scripts/polish/write-suggestions.mjs \
  --p1 /tmp/p1.jsonl --p2 /tmp/p2.jsonl --p3 /tmp/p3.jsonl \
  --p4 /tmp/p4.jsonl --p5 /tmp/p5.jsonl \
  --slug "$slug" \
  --output "tasks/polish-suggestions-$slug-$(date -I).md"
```

## 5. Task-End

```bash
echo "$(date -I)|$slug|suggestions=$(yq '.suggestions | length' tasks/polish-suggestions-$slug-$(date -I).md)" \
  >> memory/polish-agent-log.md
rm "tasks/awaiting-critics/polish-<slug>/lock"
```

## 6. Forbidden Actions

- Content selbst editieren (nur Vorschläge)
- Ship-Status ändern
- Architektur-Änderungen
- Neue Features
- Rework-Tickets dispatch
