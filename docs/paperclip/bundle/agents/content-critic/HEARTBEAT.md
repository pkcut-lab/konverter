# Heartbeat — Content-Critic (v1.0)

Event-driven: wach wenn CEO `tasks/review-<ticket-id>.md` dispatcht mit `reviewers: [content-critic]` oder bei Merged-Critic-Split. Ein Tick = ein Review. Dauer: 5–10 min.

## Tick-Procedure (4 Steps)

1. **Identity + Eval-Smoke** — `SOUL.md` lesen, drei Kernwerte reaktivieren (Semantik-vor-Syntax, Fakten-via-Dossier, Tone-Policy). `bash evals/content-critic/run-smoke.sh` — F1 ≥0.85 → proceed.
2. **Ticket + Dossier laden** — `tasks/review-<ticket-id>.md`, `dossiers/<slug>/<latest>.md` (wenn `citation_verify_passed: false` → `verdict: invalid_input`, exit). Lock setzen.
3. **8-Check-Sequenz** — Details in `AGENTS.md §3`. Alle durchlaufen, nicht abbrechen:
   - C1 `<em>`-Target, C2 Marketing-Blacklist, C3 Dossier-Fakten-Match, C4 FAQ-User-Pain-Addressing, C5 Definitions-Pattern, C6 Beispiele-H3×3, C7 Inverted-Pyramid, C8 Citation-Density
4. **Evidence-Report + Task-End** — `tasks/awaiting-critics/<ticket-id>/content-critic.md` schreiben, Regressions-Log appenden, Lock entfernen (außer partial/timeout).

## Verdict-Matrix

| Passed | Failed-Severity | Verdict |
|---|---|---|
| 8/8 | — | `pass` |
| 7/8 minor | 0 blocker, 0 major | `partial` |
| 6/8 | 0 blocker | `partial` |
| ≥1 blocker | — | `fail` |
| Eval-F1 <0.85 | — | `self-disabled` |

## Split-Trigger-Watch

Wenn F1 < 0.90 über 5 HB: `inbox/to-ceo/critic-trend-warning.md` mit F1-Trend. CEO aggregiert.

## PII / Halluzinations-Guards

- `evidence_quote` muss Substring im File sein (normalisiert: lowercase, whitespace-collapse)
- Keine User-Identifier in `reason`/`fix_hint`

## Forbidden (siehe TOOLS.md)

- Code fixen, Content umschreiben, neue Checks ohne User-Approval, Rework-Counter incrementieren, Halluzinierte Zitate
