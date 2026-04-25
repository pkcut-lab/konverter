---
filed_by: meta-reviewer
filed_at: 2026-04-25
context_meta_review: tasks/meta-review-skonto-rechner-r1-2026-04-25.md
target_ticket: KON-401 (skonto-rechner R1)
severity: high
type: rubric-ambiguity
related_prior: inbox/processed/rubric-ambiguity-merged-3-vs-design-D1.md (2026-04-24, NOT YET PATCHED)
---

# Rubric-Ambiguity — merged-critic Severity-Aggregation

## Detected in skonto-rechner R1

- merged-critic: `verdict: partial`, `rework_severity: minor`, "1 actionable Fix"
- design-critic: `verdict: fail`, **D1 = blocker**
- performance-auditor: `verdict: fail`, **P5 + P6 = 2× blocker**
- conversion-critic: `verdict: fail`, **C6 + C8 = 2× blocker**

→ merged-critic charakterisiert die Tool-Nacharbeit als "minor" mit
1 Fix, während drei Specialist-Critics zusammen **5 Blocker** melden.

## Mechanik des Severity-Drifts

merged-critic-Rubric (BRAND_GUIDE §4 #1–#19) deckt mehrere Specialist-
Domänen entweder gar nicht oder als `not_tested` ab:

| merged-Behandlung | Specialist-Befund |
|---|---|
| Check #14 Performance: `not_tested` | performance-auditor: 2 Blockers (P5/P6) |
| Tap-Targets: nicht in Rubrik | conversion-critic C6: Blocker |
| Tool-Usage-Analytics: nicht in Rubrik | conversion-critic C8: Blocker |

`rework_severity` wird ausschließlich aus merged-internen Fails
aggregiert. Die Specialist-Blocker fließen NICHT ein. Folge:
`rework_severity: minor` ist mathematisch korrekt für die merged-Rubric,
aber funktional irreführend für den Ship-Gate.

## Warum §0-Divergence-Check NICHT greift

§0 prüft nur:
- hard-divergence: `merged.verdict == pass AND ∃ critic.verdict == fail`
- soft-divergence: `merged.verdict == pass AND ∃ critic.partial AND rework_required`

merged.verdict ist hier `partial` — beide Bedingungen unerfüllt,
`divergence_flagged: false`. §0 fängt also Verdict-Konflikte, **nicht**
Severity-Konflikte.

## Konkrete Verbindung zu nicht-gepatchtem Vorgänger

`inbox/processed/rubric-ambiguity-merged-3-vs-design-D1.md` (2026-04-24)
hat die SELBE Defekt-Klasse für stundenlohn-jahresgehalt gemeldet
(`var(--color-warn, #d97706)` × 4). Der dort vorgeschlagene
Rulebook-Patch ist nicht eingespielt — und genau diese Lücke schlägt
heute bei skonto-rechner wieder auf (`var(--color-warning, #c08000)`).

Der Vorschlag von 2026-04-24 ist **fall-spezifisch** (Hex+Contrast-
Aggregation). Der vorliegende Vorschlag ist **strukturell**
(Severity-Aggregation generisch).

## Empfehlung — Rulebook-Patch (BRAND_GUIDE.md §Ship-Gate-Rules)

Erweitere die Ship-Gate-Logik so, dass merged-critic NICHT mehr alleine
als severity-Quelle dient:

```
ship_gate_blocked := (merged.verdict in {fail}) OR
                     (∃ critic.verdict == fail) OR
                     (∃ critic.severity == blocker AND status == fail) OR
                     (merged.rework_required == true AND
                      ∃ critic.severity in {blocker, major})
```

Effekt:
- Verdict-Konsistenz wie heute (kein Regress).
- Plus: ein einziges Specialist-Blocker reicht, um den fast-track
  zu verhindern, auch wenn merged sagt "minor".

## Impact-Schätzung

Anwendung dieser Regel rückwirkend auf die letzten 5 Meta-Reviews:

| Tool | merged.severity | Specialist-Blocker | unter neuer Regel ship-blocked? |
|---|---|---|---|
| zinsrechner R1 (KON-245) | minor | a11y A12 + content C1 = blocker | ja (heute: ja per anderer Regel) |
| zinseszins-rechner R1 | major | P1+P6+P9+C8+D5 = 5 blocker | ja |
| stundenlohn-jahresgehalt R2 | minor | a11y A12-R2-01 = blocker | ja |
| zinsrechner R2 | (kein severity-feld) | C5+C8 = minor (Phase-2 deferred) | nein |
| skonto-rechner R1 | minor | D1+P5+P6+C6+C8 = 5 blocker | ja |

Konsistent zu allen bisherigen CEO-Entscheidungen. Macht die Regel
explizit statt implizit.

## Nicht zu ändern

- §0-Divergence-Check bleibt wie er ist (nur Verdict-Konsistenz).
- merged-critic-Rubric bleibt wie sie ist (19 Checks, eigene Severity).
- Specialist-Critics bleiben autoritativ in ihrer Domäne.

Nur die Aggregation am Ship-Gate ändert sich.
