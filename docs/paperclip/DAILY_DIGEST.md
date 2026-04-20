# Daily-Digest — Format-Spec

## Zweck

Ein File pro Tag, vom CEO-Agent geschrieben (Heartbeat-Step 11), gelesen vom User **1× täglich**. Ersetzt viele kleine User-Pings durch einen kuratierten Tages-Report. Live-Alarme (die 3+2 Typen in `agents/ceo.md` §6) bleiben separat — sie landen in `inbox/to-user/`, nicht im Digest.

**Pfad:** `inbox/daily-digest/YYYY-MM-DD.md`

## Schreib-Verhalten

- **Append-only** während des Tages — CEO schreibt nach jedem Auto-Resolve / Rulebook-Snapshot / Stale-Lock-Release eine Zeile an.
- **Rotation:** Um 00:00 UTC (oder beim ersten Heartbeat nach Datumswechsel) wird ein neues File angelegt.
- **Nicht-Editieren:** Digest-Files sind immutable nach Tageswechsel. Korrekturen gehen in das nächste File.
- **Leerer Tag:** Wenn nichts zu berichten ist, wird KEIN Digest geschrieben. Kein "no activity"-Rauschen.

## Sections (in dieser Reihenfolge)

```markdown
# Daily-Digest — YYYY-MM-DD

## 1. Completed Tickets
| ticket-id | tool-slug | ship-state | rework-counter |
|-----------|-----------|------------|----------------|
| T-2026-0412 | meter-zu-fuss | shipped   | 0 |
| T-2026-0413 | celsius-zu-fahrenheit | shipped | 1 |

## 2. Auto-Resolves (letzten 24h)
- Auto-Resolve ship-as-is: T-2026-0414 (score=0.83) — c11-nbsp fail nach 3 Reworks, Score > 0.80
- Park: T-2026-0415 (score=0.71) — headingHtml + category beide fail, Score < 0.80
- Tie-Break: T-2026-0416 via competitor-ground-truth — Critic A sagte FAQ-Count fail, Critic B pass; Konkurrent-Beispiele zeigten 4 FAQs = valid

## 3. Rulebook-Snapshots
- CONTENT.md sha256: f4a2...8c1b (changed 14:22 UTC)
- CONVENTIONS.md sha256: 9e3d...2a7f (changed 14:22 UTC)

## 4. Metrics-Highlights
- Rework-Rate (7d rolling): 18% (threshold 20%)
- Partial-Rate (7d rolling): 11%
- Token-Kosten heute: $0.42 (Budget: $1.50 → 28%)
- Merged-Critic F1: binary=1.00 micro=1.00 macro=1.00
- Dossier-Researcher Citation-Verify-Pass-Rate: 100% (3/3)

## 5. Offene Blocker
- T-2026-0417 parked: headingHtml-Generator drafted no <em>, Rubrik c-meta fail — needs rubric-clarification ticket
- Dossier stale: weight-category parent-dossier (TTL 30d expired, refresh-request enqueued)

## 6. HALT-State
- (leer wenn keine Halts; sonst: "HALT aktiv 08:14–09:47 UTC, reason: critic-drift-suspected, resume-rationale: manual-rerun-passed")
```

## Feld-Semantik

### Section 1 — Completed Tickets

Jeder Ticket-Workflow-Abschluss mit `ship-state ∈ {shipped, parked, ship-as-is, halted}`. Re-Work-Counter am Zeitpunkt des Abschlusses (nicht current).

### Section 2 — Auto-Resolves

Nur v1.0-Autonomie-Gates (nicht routine-ship). Drei Varianten:

- `Auto-Resolve ship-as-is: <id> (score=X.XX)` — Rubrik-Bestand ≥ 0.80 nach > 2 Reworks
- `Park: <id> (score=X.XX)` — Rubrik-Bestand < 0.80 nach > 2 Reworks
- `Tie-Break: <id> via {competitor|user-pain|trend}` — Critic-Contradiction resolved

### Section 3 — Rulebook-Snapshots

Nur geänderte Files. Format: `<filename> sha256: <prefix>...<suffix> (changed <HH:MM UTC>)`. Referenz auf full hash in `memory/rulebook-hashes.json`.

### Section 4 — Metrics-Highlights

Fünf Pflicht-Metriken:

1. **Rework-Rate (7d)** — `reworks / total_tickets` rollend 7 Tage
2. **Partial-Rate (7d)** — `partial_verdicts / total_critic_outputs` rollend 7 Tage
3. **Token-Kosten heute** — absolute $ + % vom Tages-Budget
4. **Merged-Critic F1** — `binary | micro | macro` vom letzten smoke (siehe `evals/merged-critic/last-smoke-result.txt`)
5. **Dossier-Citation-Verify-Pass-Rate** — nur Phase 2+, skippbar in Phase 1

Weitere Metrics (optional): Lighthouse-Score-Median, Astro-Check-Errors, Pagefind-Index-Size.

### Section 5 — Offene Blocker

Nur Blocker, die du (CEO) **noch nicht** auto-resolven konntest und die **kein** Live-Alarm sind. Typische Einträge:

- Tickets gepkt nach > 2 Reworks mit Score < 0.80 → User-Review
- Dossier stale ohne Refresh-Kandidat
- Ticket warten auf externes Signal (z.B. npm-Package-Release)

### Section 6 — HALT-State

Nur falls an diesem Tag EMERGENCY_HALT aktiv war oder ist. Format siehe Beispiel oben — muss Start-Time, End-Time, reason, resume-rationale enthalten.

## Was NICHT in den Digest gehört

- Live-Alarme — die sind separater Kanal (`inbox/to-user/live-alarm-*.md`)
- Debug-Logs
- Agent-Interne-Konversationen
- Einzelne Tool-Config-Commits (nur Completed-Ticket-Zeile)
- Rulebook-Unchanged-Events (Step 4 kein No-Op-Log)
- Idle-Heartbeats (§6 HEARTBEAT.md)

## Reading-Contract (User-Seite)

Der User liest den Digest 1× täglich, scrollt Section 1–5 linear, Section 6 wenn HALT. **Er rescannt nicht Live-Alarme** — die hat er bereits im to-user-Inbox gesehen. Wenn Digest länger als eine Bildschirmseite wird → Signal, dass die Auto-Resolve-Schwellen falsch kalibriert sind (Ticket `paperclip-tune-thresholds` öffnen).

## Beispiel: minimaler Digest-Tag

Wenn nur 2 Tools shippen und sonst nichts passiert:

```markdown
# Daily-Digest — 2026-04-21

## 1. Completed Tickets
| ticket-id | tool-slug | ship-state | rework-counter |
|-----------|-----------|------------|----------------|
| T-2026-0418 | liter-zu-gallone | shipped | 0 |
| T-2026-0419 | grad-zu-bogenmass | shipped | 0 |

## 4. Metrics-Highlights
- Rework-Rate (7d rolling): 12%
- Token-Kosten heute: $0.18 (Budget: $1.50 → 12%)
- Merged-Critic F1: binary=1.00 micro=1.00 macro=1.00
```

Sections 2 / 3 / 5 / 6 fehlen = keine Auto-Resolves, keine Rulebook-Drifts, keine offenen Blocker, kein HALT. Das ist der gewünschte Alltag.
