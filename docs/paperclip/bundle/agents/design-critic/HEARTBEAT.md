# Heartbeat — Design-Critic (v1.0)

Event-driven: wach wenn CEO `reviewers: [design-critic]` setzt, oder bei Custom-Component-Ticket (neue generische Komponente). Ein Tick = ein Review. Dauer: 5–10 min.

## Tick-Procedure (4 Steps)

1. **Identity + Eval-Smoke** — `SOUL.md`, drei Werte (Hard-Caps-Gesetz, Forbidden-Pattern-Detection, Primary-bleibt-Graphit). `bash evals/design-critic/run-smoke.sh` — F1 ≥ 0.85.
2. **Ticket laden + Lock** — `tasks/review-<ticket-id>.md` lesen, `files_changed` aus `engineer_output_<id>.md` extrahieren. Lock setzen.
3. **10-Check-Sequenz** — D1 Hex, D2 px, D3 rounded-full, D4 Gradient-Mesh, D5 Emojis, D6 Primary-Button-Farbe, D7 Orange-Accent-Scope, D8 Animation-Tokens, D9 Reduced-Motion, D10 Contrast-AAA. Alle durchlaufen.
4. **Evidence-Report + Task-End** — `tasks/awaiting-critics/<ticket-id>/design-critic.md` schreiben, Log, Lock.

## Verdict-Matrix

| Passed | Failed-Severity | Verdict |
|---|---|---|
| 10/10 | — | `pass` |
| 9/10 minor | 0 blocker, 0 major | `partial` |
| ≥1 major, 0 blocker | — | `partial` |
| ≥1 blocker | — | `fail` |
| Eval-F1 <0.85 | — | `self-disabled` |

## Blocker-Recovery

| Typ | Trigger | Reaktion |
|---|---|---|
| A | Playwright-Artifact unreachable | D10 = `warning` soft |
| B | Skill-Hit von minimalist-ui/frontend-design missverstanden vom Builder (→ Hard-Cap-Verletzung) | `fail` + Note „Builder hat Skill-Empfehlung mit Hard-Cap verwechselt" |
| C | Ambiguität bei D7 (Orange-Tint-Edge-Case) | `warning` + `contradiction_note` |

## Cross-Checks mit Merged-Critic

- D1 und Merged-Critic Check #3 sind IDENTISCH — aber Merged-Critic bleibt primary; Design-Critic prüft NUR wenn aktiv (post-Split oder unique-Tool-Parallel-Run). Keine Doppelauditierung bei Standard-Run.
- D10 und Merged-Critic Check #10 teilen axe-core — koordiniert via CEO-Dispatch-Logik (CEO skipt Merged-Critic-#10, wenn Design-Critic aktiv).

## Forbidden

- Code fixen, Form reviewen, Skills aufrufen, Rubrik-Freestyle, Halluzinations-Zitate
