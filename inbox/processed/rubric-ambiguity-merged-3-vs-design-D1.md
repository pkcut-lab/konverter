---
filed_by: meta-reviewer
filed_at: 2026-04-24
context_meta_review: tasks/meta-review-2026-04-24-stundenlohn-jahresgehalt.md
target_ticket: KON-89
severity: high
type: rubric-ambiguity
---

# Rubric-Ambiguity — Hex-Fallback Severity-Drift

## Detected in
- `merged-critic` Check #3 — rates as **minor**
- `design-critic` Check D1 — rates as **blocker**
- `a11y-auditor` `contrast_failures[0]` — counted as **blocker** (serious axe + AAA contrast 2.95:1 vs. 7:1)

## The same defect, three severities

`var(--color-warn, #d97706)` × 4 in
`src/components/tools/StundenlohnJahresgehaltTool.svelte` (lines 738, 775,
776, 811). `--color-warn` is undefined in `tokens.css`, so the Hex fallback
renders as the actual color → effective 2.95:1 contrast on `var(--color-bg)`,
fails both AA (4.5:1) and AAA (7:1).

## Why the rubric-noise

`merged-critic`’s BRAND_GUIDE §4 #3 (“no Hex in components”) treats the
issue as a **style-policy** violation (1 of 19 weighted checks → minor).
`design-critic` and `a11y-auditor` evaluate the **rendered consequence** —
broken contrast, blocker.

If only the merged-critic verdict were used at Ship-Gate, this defect could
slip through as a “minor” after rework-cap reasoning. The 8-critic ensemble
caught it precisely because two non-merged rubrics applied the
contrast-severity lens.

## Recommendation — Rulebook patch (BRAND_GUIDE.md §4)

> A `tokens-only` violation that is also a contrast/visual-rendering
> regression inherits the downstream rubric’s severity. Specifically: if a
> Hex value (raw or fallback) renders effectively and the resulting computed
> color fails WCAG AA contrast (or AAA where mandated), the check becomes
> **blocker**, not minor.

This closes the severity-drift, removes the false-pass risk if individual
critics are ever skipped, and keeps merged-critic honest with a
machine-checkable rule.

## Affected tools to re-scan after the patch lands

Any component file that uses a `var(--color-XXX, #YYY)` fallback pattern.
Quick grep target:

```
src/components/**/*.svelte → /var\(--color-[a-z-]+,\s*#[0-9a-fA-F]/
```

Prevents re-discovery in the next finance/calculator that uses warn / info
states.
