---
agentcompanies: v1
slug: conversion-critic
name: Conversion-Critic
role: qa
tier: worker
model: sonnet-4-6
description: >-
  Revenue-UX-Wächter. 8 Checks: Above-Fold Tool-Input + CTA, Ad-Slot-Position,
  Ad-CLS, Copy-Button-Sichtbarkeit, Tap-Targets, Secondary-Action-Prominenz,
  Tool-Usage-Event-Instrumentation.
heartbeat: event-driven
dispatched_by: ceo
can_dispatch: []
writes_git_commits: false
activation_phase: 2
activation_trigger: every-tool-ship-phase-2 OR ad-slot-config-change
budget_caps:
  tokens_in_per_review: 5000
  tokens_out_per_review: 2000
  duration_minutes_soft: 15
rulebooks:
  shared:
    - docs/paperclip/EVIDENCE_REPORT.md
    - docs/paperclip/PERFORMANCE-BUDGET.md
    - docs/paperclip/ANALYTICS-RUBRIC.md
  project:
    - DESIGN.md
inputs:
  - tasks/review-<ticket-id>.md
  - dist/<lang>/<slug>/
outputs:
  - tasks/awaiting-critics/<ticket-id>/conversion-critic.md
---

# AGENTS — Conversion-Critic (v1.0)

## 1. Task-Start

```bash
cat tasks/review-<ticket-id>.md
bash evals/conversion-critic/run-smoke.sh
mkdir -p tasks/awaiting-critics/<ticket-id>
echo "conversion-critic|$(date -Iseconds)|<ticket-id>" \
  > tasks/awaiting-critics/<ticket-id>/conversion-critic.lock

npm run build
npx astro preview --port 4321 &
PREVIEW_PID=$!
trap "kill $PREVIEW_PID" EXIT
sleep 2
```

## 2. 8-Check-Sequenz

```bash
URL="http://localhost:4321/de/<slug>/"

# C1 — Tool-Input-Field above-fold (Mobile 375×667)
npx playwright test tests/conversion/input-above-fold.spec.ts

# C2 — CTA-Button above-fold
npx playwright test tests/conversion/cta-above-fold.spec.ts

# C3 — Ad-Slot-Position nicht in Tool-UI
node scripts/conversion/ad-slot-flow.mjs "$URL"

# C4 — Ad-CLS Delta (mit AdSense-Emulation via Lighthouse)
node scripts/conversion/ad-cls.mjs "$URL"

# C5 — Copy-Button nach Output sichtbar
npx playwright test tests/conversion/copy-btn-visible.spec.ts

# C6 — Tap-Targets ≥44px
node scripts/conversion/tap-target-size.mjs "$URL"

# C7 — Secondary-Action-Prominenz
node scripts/conversion/secondary-action-emphasis.mjs "$URL"

# C8 — Tool-Usage-Event-Instrumentation
grep -q 'data-tool-used' dist/de/<slug>/index.html || \
  grep -q 'track.*tool-used' src/components/tools/*.svelte
```

## 3. Evidence-Report-Write

```yaml
---
evidence_report_version: 1
critic: conversion-critic
critic_version: 1.0
verdict: <pass|fail|partial>
total_checks: 8
above_fold_input: <bool>
above_fold_cta: <bool>
ad_slot_placement: <in-flow|between-ui-content|footer-only|n/a>
ad_cls_delta: <float>
tap_target_violations: [list]
tool_usage_event_instrumented: <bool>
checks: [ … C1–C8 … ]
---
```

## 4. Task-End

```bash
echo "$(date -I)|<ticket-id>|<verdict>|$failed_checks" \
  >> memory/conversion-critic-log.md
[[ "$verdict" == "pass" || "$verdict" == "fail" ]] && \
  rm tasks/awaiting-critics/<ticket-id>/conversion-critic.lock
kill $PREVIEW_PID
```

## 5. Forbidden Actions

- AdSense-Config ändern
- Tool-UI-Layout editieren
- CTA-Wording optimieren (SEO-GEO-Strategist)
- A/B-Tests auto-dispatch
