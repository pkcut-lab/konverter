# AGENTS-SCHEMA (v1.0, 2026-04-23)

> **Zweck:** Frontmatter-Schema-Standard für alle Agenten-`AGENTS.md`-Files. Dieses Dokument fixiert, welche Keys erlaubt sind und wie sie semantisch belegt werden.
>
> **Status:** binding. Agenten-Frontmatter das hier nicht validiert wird, blockt `paperclipai company import --dry-run`.
>
> **Migration-Notiz:** v2.0-Agenten wurden mit inkonsistenten `budget_caps.*`-Keys geschrieben (`tokens_in_per_review`, `_per_run`, `_per_ticket`, `_per_audit`, `_per_decision`). Dieses Doc definiert den kanonischen Schlüssel; Agenten werden in Tranche B harmonisiert.

## §1. Pflicht-Keys

| Key | Typ | Werte / Format |
|---|---|---|
| `agentcompanies` | string | `v1` (fixiert) |
| `slug` | string | lowercase, `a-z0-9-`, matcht Directory-Name |
| `name` | string | Human-readable |
| `role` | enum | `coordinator` · `worker` · `qa` · `research` |
| `tier` | enum | `primary` · `worker` |
| `model` | enum | `opus-4-7` · `sonnet-4-6` · `haiku-4-5` |
| `description` | string | 1-3 Sätze |
| `heartbeat` | enum | `30m` · `event-driven` · `routine` |

## §2. Optional-Keys

### §2.1 Heartbeat-Varianten

| Key | Wann | Format |
|---|---|---|
| `heartbeat_cadence` | nur wenn `heartbeat: routine` | `daily` · `weekly-<day>-<HH:MM>` · `monthly-<day-of-month>-<HH:MM>` · Cron-Expression |
| `heartbeat_cadence_alt` | Zweit-Cadence (z.B. daily + weekly) | wie oben |

**Override-Protokoll:** Agenten mit `heartbeat: routine` werden von `.paperclip.yaml heartbeat.per_agent_override[]` erfasst. Sie laufen NICHT im Default-30m-Loop, sondern via Cron (Registration in `.paperclip.yaml routines[]`).

Beispiele:
```yaml
heartbeat: routine
heartbeat_cadence: "weekly-monday-06:00"
```
```yaml
heartbeat: routine
heartbeat_cadence: "daily-05:00"
heartbeat_cadence_alt: "weekly-sunday-04:00"
```

### §2.2 Dispatch

| Key | Semantik |
|---|---|
| `dispatched_by` | Slug des Koordinators (meist `ceo`) |
| `can_dispatch` | Array der Slugs, die dieser Agent dispatchen darf (nur für coordinator-Tier) |
| `writes_git_commits` | bool — default `false`; nur tool-builder ist `true` |

### §2.3 Activation

| Key | Semantik |
|---|---|
| `activation_phase` | int: 1 / 2 / 3 — ab welcher Phase der Agent hired werden darf |
| `activation_trigger` | string-array ODER strukturierter OR-Expression (siehe §4) |

### §2.4 Budget-Caps (VEREINHEITLICHT v1.0 — GEÄNDERT gegenüber v2.0-Agenten!)

**Kanonischer Schlüssel:** `budget_caps.tokens_in_per_invocation` + `budget_caps.tokens_out_per_invocation` + `budget_caps.duration_minutes_soft`.

Eine "Invocation" ist ein Tick des Agents — ein Ticket, ein Review, ein Routine-Run. Die semantische Unterscheidung (Ticket vs. Run vs. Audit vs. Decision) gehört in `description`, NICHT in den Key-Namen.

**Zusätzliche API-Caps (flach, gleiche Struktur pro API):**

```yaml
budget_caps:
  tokens_in_per_invocation: <int>
  tokens_out_per_invocation: <int>
  duration_minutes_soft: <int>
  # optional API-spezifisch
  api_calls_per_invocation:
    firecrawl: <int>
    webfetch: <int>
    brave_search: <int>
    perplexity: <int>
    google_search_console: <int>
```

**Migration (v2.0 → Tranche B):** alle bestehenden Varianten werden gemappt:
- `tokens_in_per_review` → `tokens_in_per_invocation`
- `tokens_in_per_run` → `tokens_in_per_invocation`
- `tokens_in_per_ticket` → `tokens_in_per_invocation`
- `tokens_in_per_audit` → `tokens_in_per_invocation`
- `tokens_in_per_decision` → `tokens_in_per_invocation`
- `tokens_in_per_tool` → `tokens_in_per_invocation`
- `tokens_in_per_research` → `tokens_in_per_invocation`

Bis Tranche-B-Migration durchgeführt ist, toleriert der Parser alle Varianten (lenient mode).

### §2.5 Rulebooks + I/O

```yaml
rulebooks:
  shared:
    - docs/paperclip/BRAND_GUIDE.md
  project:
    - CONTENT.md
inputs:
  - <path or glob>
outputs:
  - <path or glob>
```

### §2.5a Pfad-Konventionen pro Ebene (authoritativ v1.1)

Die drei verschiedenen Rulebook-Pfad-Formen im Bundle sind INTENTIONAL, nicht Inkonsistenz. Jede Ebene nutzt die Konvention für ihren Loader-Context:

| Ebene | File | Konvention | Beispiel |
|---|---|---|---|
| 1 | `bundle/.paperclip.yaml` rulebooks.shared[] | **Filename only** (Base-Prefix via `rulebooks.base`) | `- BRAND_GUIDE.md` |
| 2 | `bundle/COMPANY.md` rulebooks[] | **Bundle-relativ** (`../../FILE.md`) | `- path: ../../BRAND_GUIDE.md` |
| 3 | `bundle/agents/<slug>/AGENTS.md` rulebooks.shared[] | **Projekt-relativ** (`docs/paperclip/FILE.md`) | `- docs/paperclip/BRAND_GUIDE.md` |

**Normierungs-Regel:** Jeder Eintrag MUSS das Format seiner Ebene befolgen. Paperclip-Loader erwartet an jeder Ebene ein bestimmtes Format und joint entsprechend.

**Validation-Gate** (Tranche B): `scripts/validate-rulebook-refs.mjs` prüft alle drei Ebenen separat. Fehlformat = Import-Block.

## §3. Erlaubte Tools-Listen (für `TOOLS.md`)

Nicht im AGENTS.md-Frontmatter — separate `TOOLS.md`-File. Aber:

```yaml
# In SOUL.md-Frontmatter (optional)
tools_policy: strict   # strict | lenient
```

## §4. activation_trigger-Grammatik

Freier String aktuell (v2.0), aber folgendes Parser-Schema für Tranche B:

```
trigger      := atom | trigger "OR" trigger | trigger "AND" trigger
atom         := event | cron | milestone | condition
event        := "unique-tool-dispatch" | "shared-component-change" | "dep-change" | "release" | …
cron         := "cron:<schedule>"
milestone    := "every-<n>-<unit>" | "phase-<n>-gate"
condition    := "if-score-<op>-<value>" | "if-reject-rate-<op>-<value>"
```

Beispiele (v2.0-Agenten, lenient):
- `"every-tool-ship-pre-publish"` → `event:every-tool-ship-pre-publish`
- `"cron-weekly-monday-06:00"` → `cron:0 6 * * 1`
- `"every-20-tools OR monthly-1st"` → `milestone:every-20-tools OR cron:0 0 1 * *`

## §5. heartbeat_cadence ↔ .paperclip.yaml routines[] — Conflict-Resolution

Wenn Agent `heartbeat_cadence: "weekly-monday-06:00"` hat, MUSS `.paperclip.yaml routines[]` einen Eintrag mit demselben Cron haben UND der Agent MUSS in `heartbeat.per_agent_override[]` stehen.

Paperclip-Runtime-Precedence:
1. `.paperclip.yaml routines[]` ist authoritativ (startet den Run)
2. Agent-Frontmatter `heartbeat_cadence` ist Dokumentation (human-readable)
3. Divergenz → Import-Warning, aber kein Abbruch

## §6. Self-Validation-Gate

Vor `paperclipai company import` MUSS `scripts/validate-agent-schema.mjs` rennen (Tranche B zu bauen). Prüft:
- Alle Pflicht-Keys vorhanden
- `model` aus Enum
- `slug` = Directory-Name
- `heartbeat: routine` → `heartbeat_cadence` + `routines[]`-Entry
- `activation_phase` ∈ {1,2,3}
- Alle referenzierten Rulebooks existieren

Exit-Code 1 bei jedem Fail, blockiert Import.

## §7. Referenz

- `.paperclip.yaml` — Runtime-Config, authoritativ für models/activation/routines
- `COMPANY.md` — Agent-Inventar
- `AGENTS.md` pro Agent — Frontmatter + Procedure
