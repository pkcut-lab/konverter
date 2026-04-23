# Heartbeat — A11y-Auditor (v1.0)

Event-driven: wach wenn CEO `reviewers: [a11y-auditor]`. Ein Tick = ein Review. Dauer: 10–15 min (Playwright-Runs brauchen länger).

## Tick-Procedure (5 Steps)

1. **Identity + Eval-Smoke** — `SOUL.md`, drei Werte (Tool-ohne-Maus, Screen-Reader-Parität, Color-Independence). `bash evals/a11y-auditor/run-smoke.sh` — F1 ≥ 0.85.
2. **Build + Preview-Start** — `npm run build && npx astro preview --port 4321` als Background-Prozess.
3. **Lock + 12-Check-Sequenz** — A1–A12 seriell (Playwright-Specs sind unabhängig, aber sequentiell ausgeführt um Port-Konflikte zu vermeiden). Details in `AGENTS.md §2`.
4. **Evidence-Report + Task-End** — Format in `AGENTS.md §3`. Log appenden, Lock entfernen, Preview-Prozess killen.
5. **Infra-Alarm** — wenn Playwright / axe-core nicht verfügbar: `verdict: timeout`, `inbox/to-ceo/a11y-infra-missing.md`, kein self-disabled (ist kein Critic-Drift, sondern Infra-Problem).

## Verdict-Matrix

| Passed | Failed-Severity | Verdict |
|---|---|---|
| 12/12 | — | `pass` |
| 11/12 minor | 0 blocker, 0 major | `partial` |
| ≥1 major, 0 blocker | — | `partial` |
| ≥1 blocker | — | `fail` |
| Playwright unreachable | — | `timeout` |
| Eval-F1 <0.85 | — | `self-disabled` |

## Blocker-Recovery

| Typ | Trigger | Reaktion |
|---|---|---|
| A | Playwright Port 4321 belegt | Kill & Retry 1× |
| B | axe-core-Rule veraltet (False-Positive bekannt) | `warning` + `override_rationale` |
| C | Screen-Reader-Test flaky (Live-Region-Timing) | 3× rennen, median |
| D | Build fail (dist/ leer) | `verdict: timeout`, `inbox/to-ceo/build-fail-<id>.md` |

## Cross-Checks mit Merged-Critic

- A1 ≈ Merged-Critic #10 axe-Smoke — Merged-Critic bleibt primary im 4-Rollen-Start. A11y-Auditor übernimmt komplett ab Split (Checks #10, #11 NBSP, W1–W5 a11y-soft-warnings).
- A12 ≈ Design-Critic D10 Contrast-Stichprobe — koordiniert: A12 ist full-scan, D10 ist Stichprobe. Bei parallelem Run: Design-Critic skipt D10, verweist auf A12.

## PII / Halluzinations-Guards

- Playwright-Artifacts referenzieren (keine Binary-Blobs in Report, nur Pfade)
- axe-Violation-Selectors trim-escape (`>` in Selectors escapen für YAML-Safety)
