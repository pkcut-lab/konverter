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
- id: err-2026-04-24-004
  type: validation
  severity: high
  first_seen: 2026-04-24T08:30:00Z
  last_seen: 2026-04-24T08:30:00Z
  count: 1
  agents: [tool-builder, end-reviewer]
  evidence: [KON-86, KON-127, KON-130]
  source: inbox/to-ceo/locale-parser-bug-brutto-netto-2026-04-24.md
  root_cause: "parseDE() in src/lib/tools/brutto-netto-rechner.ts:101-108 accepts dot-only input (e.g. `3.000`) as decimal instead of DE thousand separator — parseFloat(\"3.000\") === 3. Inline copies in zinsrechner.ts, rabatt-rechner.ts, tilgungsplan-rechner.ts, KreditrechnerTool.svelte share the same bug."
  fix: "Canonical parser src/lib/tools/parse-de.ts (segment-3-digit detection); all 5 affected tools migrated to import shared parseDE; 17/17 vitest cases green in tests/lib/tools/parse-de.test.ts"
  status: fixed
  fix_commit: null
  escalated_ticket: KON-130
  closed_at: 2026-04-25

- id: err-2026-04-24-005
  type: validation
  severity: high
  first_seen: 2026-04-24T12:49:53Z
  last_seen: 2026-04-24T16:10:07Z
  count: 18
  agents: [merged-critic, content-critic, design-critic, a11y-auditor, performance-auditor, security-auditor, conversion-critic, platform-engineer]
  evidence: [KON-218, KON-219, KON-125, KON-217, KON-215, KON-220, KON-211, KON-213, KON-223, KON-212, KON-226, KON-222, KON-227, KON-214, KON-231, KON-224, KON-229, KON-228]
  source: heartbeat-run
  root_cause: "Critic agents post Review-Round-1 verdict comments but fail to PATCH ticket status to `done`. Tickets remain in_progress/blocked even though reports are written and comments posted. Blocks Consumer-Loop C aggregation. Pattern observed across all 8 critic types for 4 slugs (zinsrechner, zinseszins-rechner, stundenlohn-jahresgehalt, rabatt-rechner)."
  fix: "CEO heartbeat self-heal: advanced 18 tickets to done. Systemic fix needs Critic AGENTS.md §Task-End enforcement — each critic must PATCH status=done after posting verdict comment (analog to Tool-Builder §3.3.1)."
  status: fixed
  fix_commit: null
  escalated_ticket: KON-260

- id: err-2026-04-25-001
  type: end-review-exhausted
  severity: high
  first_seen: 2026-04-24T22:20:00Z
  last_seen: 2026-04-25T02:10:00Z
  count: 1
  agents: [end-reviewer]
  evidence: [KON-268, KON-312, brutto-netto-rechner]
  source: tasks/end-review-brutto-netto-rechner-pass3.md
  root_cause: "Pass-3 reviewte Build-Snapshot cce3dd9 (stale); tool-builder hatte den Fix bereits 2026-04-24T20:26Z in commit 9186eab über §7.15 rework_counter-Cap-Override gepatcht. End-Reviewer holt Build-SHA aus Rework-Pass-2-Header, lädt aber Filesystem-Snapshot zum Review-Zeitpunkt — wenn Build-SHA nicht ge-checkt-out wird, sieht Reviewer den HEAD und sollte den Fix sehen. Hier hat Reviewer offenbar Filesystem-Stand vor 9186eab gelesen (Caching oder Worktree-Mismatch). Sekundär: §7-Flow erlaubte deploy trotz Pass-3-Blocker."
  fix: "FAQ-Wert in src/content/tools/brutto-netto-rechner/de.md:18 jetzt korrekt 'ca. 2.141 €' (commit 9186eab); KON-312 als done geschlossen mit Hinweis auf existierenden Commit; Live-Alarm in inbox/processed/2026-04-25/ archiviert"
  status: fixed
  fix_commit: 9186eab
  escalated_ticket: KON-312

- id: err-2026-04-25-002
  type: race-condition
  severity: high
  first_seen: 2026-04-25T08:00:00Z
  last_seen: 2026-04-25T08:32:00Z
  count: 14
  agents: [ceo]
  evidence: [KON-329, KON-330, KON-338, KON-348, KON-336, KON-341, KON-349, KON-337, KON-342, KON-350, KON-340, KON-344, KON-339, KON-343]
  source: heartbeat-run
  root_cause: "Loop E (§3.4.5) + Loop F (§3.4.6) idempotency check is title-scan against issues snapshot read at heartbeat-start. Burst-heartbeats (multiple CEO ticks within seconds) each see 'no End-Review Pass N exists' and dispatch — peer ticket created in parallel run is invisible. Same root pattern as err-2026-04-24-001 (Loop A) but on the End-Review chain. 5 slugs affected: zinsrechner P3 (×4 dups + 1 keeper), kreditrechner P3 (×3+1), rabatt-rechner P3 (×3+1), stundenlohn-jahresgehalt P1 (×2+1), zinseszins-rechner P1 (×2+1)."
  fix: "CEO cancelled 14 duplicates via PATCH (this heartbeat, keepers KON-328/331/332/334/333). Systemic fix needs anti-burst guard analogous to §3.4.1 v1.5: skip Loop E/F dispatch if any End-Review Pass N: <slug> ticket was created in last 90s, even if cancelled. Should be added to AGENTS.md §3.4.5 + §3.4.6 next rulebook update."
  status: fixed
  fix_commit: null
  escalated_ticket: null
