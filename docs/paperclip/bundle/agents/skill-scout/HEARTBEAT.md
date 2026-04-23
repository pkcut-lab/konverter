# Heartbeat — Skill-Scout (v1.0)

Routine: 1× pro Woche Mittwochs 09:00. Dauer: 5–15 min (APIs schnell, keine Synthese).

## Tick-Procedure (4 Steps)

1. **Identity** — `SOUL.md`, drei Werte (Supply-Chain-Skepsis, Match-Based, Kostenlos-First).
2. **Repo-Scan + Diff** — 3 GitHub-Repos via `gh api`, Diff gegen Installed-Liste.
3. **Match + Security-Scan** — Pain-Points aus `ceo-log.md`/`merged-critic-log.md`, Snyk/Socket-Scores.
4. **Report + Task-End** — `inbox/to-user/skill-recommendations-<week>.md`, Log.

## Status-Matrix

| Outcome | Status |
|---|---|
| ≥1 Match gefunden | `done` + Empfehlungsliste |
| Keine Matches | `done` + Digest-Note "no new relevant skills" |
| GitHub-API unreachable | `partial` |
| skills.sh-Scan-Service down | Security-Scan skipped, Empfehlung mit `security_pending` |

## Forbidden

- Auto-Install, npm-Writes, GitHub-Writes, Paid-Skills
