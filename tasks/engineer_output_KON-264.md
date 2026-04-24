---
ticket: KON-264
type: tool-build-rework
slug: zinsrechner
tool_id: interest-calculator
round: 2
agent: tool-builder (deea8a61-3c70-4d41-b43a-bc104b9b45ac)
date: 2026-04-24
verdict: rework_complete
blockers_resolved: 4
---

# Engineer Output — KON-264 (zinsrechner Round-2 Rework)

## Blocker Resolution

### B1 — headingHtml `<em>` on verb (content-critic C1 / CONTENT.md §13.5 Regel 2)

**File:** `src/content/tools/zinsrechner/de.md`

- Before: `headingHtml: "Zinsen <em>berechnen</em>"`
- After:  `headingHtml: "<em>Zinsen</em> berechnen"`

Rule: `<em>` wraps the target noun (the thing the tool manipulates), not the verb.

---

### B2 — relatedTools count < 2 (merged #19)

**File:** `src/content/tools/zinsrechner/de.md`

- Before: `relatedTools: ['mehrwertsteuer-rechner']`
- After:  `relatedTools: ['mehrwertsteuer-rechner', 'kreditrechner']`

Also updated the `## Verwandte Finanz-Tools` body section to replace non-finance links
(unix-timestamp, zeitzonen-rechner) with finance-adjacent tools:
- [Mehrwertsteuer-Rechner](/de/mehrwertsteuer-rechner)
- [Kreditrechner](/de/kreditrechner)
- [Rabatt-Rechner](/de/rabatt-rechner)

---

### B3 — dark-mode `--color-error` fails AAA (a11y-auditor A12)

**File:** `src/styles/tokens.css`

- Before: `--color-error: #C67373;` (5.27:1 on #1A1917 — FAIL AAA)
- After:  `--color-error: #EC9898;`

Contrast ratios for `#EC9898`:
- On `--color-bg #1A1917`:   ~7.96:1 ✓ AAA
- On `--color-surface #252320`: ~7.11:1 ✓ AAA

Cross-tool note: this is a global token change affecting all tools that use `--color-error`
in dark mode. Per meta-reviewer recommendation (KON-254), a sibling ticket should be opened
to track the cross-tool ripple audit.

---

### B4 — tap targets < 44px on inputs + reset (conversion-critic C6)

**File:** `src/components/tools/ZinsrechnerTool.svelte`

Added `min-height: 2.75rem; /* WCAG 2.5.5 — 44px touch target */` to:
- `.input-field__wrap` (all 6 input wrappers inherit via class)
- `.reset-btn`

---

## Items Not Resolved (deferred per meta-reviewer)

- **C5 copy-to-clipboard** — not a Phase-1 ship-blocker for a Calculator; backlog.
- **P2 TBT=283ms** — performance optimization; not a content/UX blocker; backlog.
- **security-auditor / platform-engineer** — coverage gap; CEO to dispatch separately per KON-254 §Coverage-Gap.

---

## Test Gate

- `npm test`: 1269/1269 passed (90 test files)
- `bash scripts/paperclip/verify-tool-build.sh zinsrechner zinsrechner`: PASS
- `bash scripts/check-git-account.sh`: ✓ pkcut-lab
