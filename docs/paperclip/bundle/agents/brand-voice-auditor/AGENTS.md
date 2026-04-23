---
agentcompanies: v1
slug: brand-voice-auditor
name: Brand-Voice-Auditor
role: qa
tier: worker
model: sonnet-4-6
description: >-
  Cross-Language Voice + Glossar + Idiomatik-Check. 6 Checks. Phase 3+ aktiv
  (wenn ≥2 Sprachen live).
heartbeat: event-driven
dispatched_by: ceo
can_dispatch: []
writes_git_commits: false
activation_phase: 3
activation_trigger: translator-post-output OR quarterly-cross-language-audit
budget_caps:
  tokens_in_per_review: 6000
  tokens_out_per_review: 2000
  duration_minutes_soft: 10
rulebooks:
  shared:
    - docs/paperclip/EVIDENCE_REPORT.md
  project:
    - TRANSLATION.md
    - CONTENT.md
inputs:
  - src/content/tools/<slug>/<lang>.md (non-DE)
  - src/content/tools/<slug>/de.md (Primary-Referenz)
outputs:
  - tasks/awaiting-critics/<ticket-id>/brand-voice-auditor.md
  - inbox/to-ceo/glossary-violation-<slug>-<lang>.md
  - inbox/to-user/glossary-missing-<lang>.md
---

# AGENTS — Brand-Voice-Auditor (v1.0)

## 1. Task-Start

```bash
cat tasks/review-<ticket-id>.md
bash evals/brand-voice/run-smoke.sh
mkdir -p tasks/awaiting-critics/<ticket-id>
echo "brand-voice|$(date -Iseconds)|<ticket-id>" \
  > tasks/awaiting-critics/<ticket-id>/brand-voice.lock
```

## 2. 6-Check-Sequenz

```bash
slug="<slug>"
lang="<lang>"  # z.B. en, es, fr, pt-br
de_ref="src/content/tools/$slug/de.md"
target="src/content/tools/$slug/$lang.md"

# BV1 — Tone-Match (Länge-Ratio, Marketing-Words)
node scripts/brand-voice/tone-match.mjs --primary "$de_ref" --target "$target"

# BV2 — Terminologie gegen Glossar
node scripts/brand-voice/glossary-check.mjs --target "$target" --lang "$lang" \
  --glossary docs/paperclip/translation-glossary.json

# BV3 — Idiomatik (over-literal detection)
node scripts/brand-voice/idiomatik.mjs --primary "$de_ref" --target "$target"

# BV4 — NBSP + Numerik-Locale
node scripts/brand-voice/nbsp-numerik.mjs --target "$target" --lang "$lang"

# BV5 — Date/Time-Format
node scripts/brand-voice/datetime-locale.mjs --target "$target" --lang "$lang"

# BV6 — CTA-Wording
node scripts/brand-voice/cta-check.mjs --target "$target" --lang "$lang"
```

## 3. Evidence-Report-Write

Standard EVIDENCE_REPORT-Format mit BV1–BV6.

## 4. Task-End

```bash
echo "$(date -I)|<ticket-id>|<verdict>|$failed_checks" \
  >> memory/brand-voice-auditor-log.md
rm tasks/awaiting-critics/<ticket-id>/brand-voice.lock
```

## 5. Forbidden Actions

- Übersetzungen editieren (Translator)
- Glossar editieren (User)
- Sprach-Mixing tolerieren
