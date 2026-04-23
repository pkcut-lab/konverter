# Heartbeat — Conversion-Critic (v1.0)

Event-driven: pro Tool-Ship Phase 2+. Dauer: 10–15 min wegen Playwright-Viewport-Emulation.

## Tick-Procedure (4 Steps)

1. **Identity + Eval-Smoke** — drei Werte (Tool-vor-Ad, Above-Fold-Pflicht, Ad-CLS-Zero).
2. **Build + Preview-Start**.
3. **8-Check-Sequenz** — C1–C8. Details `AGENTS.md §2`.
4. **Evidence-Report + Task-End**.

## Verdict-Matrix

| Passed | Failed-Severity | Verdict |
|---|---|---|
| 8/8 | — | `pass` |
| 7/8 minor | 0 blocker | `partial` |
| ≥1 blocker | — | `fail` |
| Phase-1 (Ad deaktiviert) | C3/C4 n/a | `pass` wenn 6/6 andere grün |

## Cross-Checks

- C1/C2 + Performance-Auditor LCP — überlappen (Above-Fold Content ist LCP-Kandidat)
- C4 + Performance-Auditor CLS — Conversion-Critic prüft Delta durch AdSense, Performance-Auditor prüft absolute CLS

## Forbidden

- AdSense-Config-Edits, UI-Layout-Edits, CTA-Copy-Edits, A/B-Dispatch
