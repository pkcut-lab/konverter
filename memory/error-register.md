# Error-Register — Strukturierter Append-Log

> Format: YAML-Blöcke, append-only. CEO schreibt bei jedem Heartbeat neue
> Einträge per §8.5 Error-Pattern-Detection. Nie manuell editieren — nur
> CEO-Agent darf appenden.

## Schema

```yaml
- id: err-YYYY-MM-DD-NNN          # fortlaufend pro Tag
  type: <error-type>               # Enum: race-condition | timeout | validation |
                                   #   dossier-fail | adapter-crash | token-limit |
                                   #   dedup-fail | consumer-loop-orphan |
                                   #   git-account | invariant-gate | critic-drift |
                                   #   umbrella-orphan | lock-stale | unknown
  severity: critical | high | medium | low
  first_seen: <ISO-8601>
  last_seen: <ISO-8601>
  count: <N>                       # wie oft in letzten 24h
  agents: [<agent-slug>, ...]      # betroffene Agenten
  evidence: [<ticket-ids>, ...]    # Paperclip-Ticket-IDs oder KON-Nummern
  source: <log-source>             # ceo-log | server-log | critic-report |
                                   #   digest | agent-log | heartbeat-run
  root_cause: "<1-Satz>"
  fix: "<1-Satz oder null>"
  status: open | investigating | fixed | wontfix
  fix_commit: <sha oder null>
  escalated_ticket: <KON-NNN oder null>  # Paperclip-Ticket wenn auto-erstellt
```

---

<!-- ERROR-REGISTER-APPEND-ANCHOR — CEO §8.5 appended unterhalb -->

## 2026-04-24 — Initial Seed (retroaktiv aus ceo-log.md)

- id: err-2026-04-24-001
  type: race-condition
  severity: high
  first_seen: 2026-04-24T02:08:04Z
  last_seen: 2026-04-24T02:08:43Z
  count: 14
  agents: [tool-builder, tool-dossier-researcher]
  evidence: [KON-71, KON-72, KON-73, KON-74, KON-75, KON-76, KON-77, KON-78, KON-79, KON-80, KON-81, KON-82, KON-83, KON-84]
  source: ceo-log
  root_cause: "3 parallel heartbeats raced past dedup check in Consumer-Loop A §3.4.1"
  fix: "CEO cancelled 14 duplicates via PATCH; systemic fix needs lock-file in tasks/consumer-loops/lock-<slug>.lock with TTL 60s"
  status: fixed
  fix_commit: null
  escalated_ticket: null

- id: err-2026-04-24-002
  type: umbrella-orphan
  severity: high
  first_seen: 2026-04-24T03:22:00Z
  last_seen: 2026-04-24T03:22:00Z
  count: 9
  agents: [tool-dossier-researcher]
  evidence: [pipeline-gap-overnight-build-tickets-2026-04-24-0322]
  source: ceo-log
  root_cause: "Umbrella-Tickets assigned to researcher; researcher closes umbrella after dossier-phase without spawning downstream tool-build/critic-audit tickets"
  fix: "§3.4.5 Umbrella-Ticket-Legacy-Handling added to CEO; Consumer-Loop A self-heals orphans"
  status: fixed
  fix_commit: null
  escalated_ticket: null

- id: err-2026-04-24-003
  type: token-limit
  severity: medium
  first_seen: 2026-04-24T04:35:00Z
  last_seen: 2026-04-24T04:37:00Z
  count: 7
  agents: [performance-auditor, merged-critic, tool-builder, platform-engineer, design-critic, a11y-auditor, content-critic, security-auditor, conversion-critic]
  evidence: []
  source: heartbeat-run
  root_cause: "Anthropic API token limit hit — resets 06:50 Europe/Berlin"
  fix: "Auto-resume scheduled via Windows Task Scheduler at 07:05"
  status: open
  fix_commit: null
  escalated_ticket: null
