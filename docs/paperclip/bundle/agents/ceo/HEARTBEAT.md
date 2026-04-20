# Heartbeat — CEO (v1.0)

## §1 Intervall

**Default: 30 Minuten.**

Rationale: NotebookLM-Research 2026-04-19. Unter 30 min = Task-Collisions (CEO plant während Engineer noch baut). Über 60 min = Feedback-Loop zu langsam für 1000-Tool-Skalierung.

**Ausnahmen:**
- Phase 2 erste Woche: **60 min** bis 5 Tools grün durch — langsam warmfahren
- Bug-Fix-Runs: **15 min** — wenn User `priority: urgent` setzt
- Offline-Modus: **0 min** = manueller Trigger (z.B. User will Mittagspause ohne Agent-Aktivität)

## §2 Heartbeat-Checklist (CEO-Agent)

Bei jedem Aufwachen — in dieser Reihenfolge (12 Steps, v1.0):

1. **Kill-Switch-Check** — `.paperclip/EMERGENCY_HALT` existiert? → §4 Procedure
2. **Identity-Check** — `SOUL.md` lesen, Mission bestätigen
3. **Git-Account verifizieren** — `git config user.name` muss `pkcut-lab` sein, sonst SOFORT stop (Live-Alarm)
4. **Rulebook-Integrity** — Hash-Check. Drift → Auto-Snapshot in Digest (keine Blockade, siehe `AGENTS.md` §4)
5. **Inbox leeren** — alle `inbox/from-user/*.md` + `inbox/to-ceo/*.md` lesen
6. **Active-Locks** — `tasks/task.lock` / `tasks/dossier-locks/*` checken (§5 Stale-Lock-Policy)
7. **Critic-Aggregation** — `tasks/awaiting-critics/<ticket-id>/*.md` aggregieren (verdict-Felder)
8. **Autonomie-Gate-Resolve** — §3 Procedure: Auto-Resolve ship-as-is / Rework / Park
9. **Backlog-Pick** — nächstes Ticket mit resolved dependencies + Dossier-Ready (`AGENTS.md` §2)
10. **Dispatch** — `tasks/current_task.md` schreiben, Lock-File erzeugen
11. **Daily-Digest-Update** — §3.4 Format (Auto-Resolves + Metrics-Highlights)
12. **Memory-Update** — `memory/ceo-log.md` append, nach 5 Tasks → Rotation

**Token-Tripwire:** Falls Max-Plan-Quota erschöpft und API-Fallback triggert → SOFORT stop, User-Eskalation (Live-Alarm Typ 1 Cost-Overflow).

## §3 Autonomie-Gates

### §3.1 Gate-Kategorien

Das v1.0-Modell trennt **Entscheidungen, die du auto-resolvst** von **Entscheidungen, die User-Approval brauchen**. Vier Gate-Kategorien — jede hat ihre eigene Resolve-Logik:

| Kategorie | Resolve-Logik | Referenz |
|---|---|---|
| **Budget-Gate** | Tages-Token-Sum < 110% Budget → pass; sonst → Live-Alarm Typ 1 | `tasks/budgets.yaml` |
| **Rate-Gate** | completed_today[tool-build] < 10 (Phase 1–2) → pass; sonst → wait next day | `AGENTS.md` §2 |
| **Rework-Gate** | rework_counter ≤ 2 → re-dispatch; > 2 → Score-Check (s.u.) | `AGENTS.md` §7 |
| **Critic-Drift-Gate** | merged-critic F1 ≥ 0.85 **und** macro_f1 ≥ 0.90 → pass; sonst Live-Alarm Typ 4 | `scripts/eval-runner.mjs` THRESHOLDS |

### §3.2 Score-basierter Auto-Resolve (Rework-Gate > 2)

```python
def resolve_rework_exhausted(ticket, critic_reports):
    score = compute_rubric_score(critic_reports)   # 0.0–1.0, gewichtete Rubrik-Checks
    if score >= 0.80:
        route_to_deploy_queue(ticket, tag='ship-as-is')
        digest_append(f'- Auto-Resolve ship-as-is: {ticket.id} (score={score:.2f})')
    else:
        route_to_park(ticket)
        digest_append(f'- Auto-Resolve park: {ticket.id} (score={score:.2f})')
```

**Schwelle 0.80** ist gelockt, Änderung nur via User-Approval-Ticket.

### §3.3 Tie-Breaker (Critic-Contradiction)

Wenn ein Critic sagt `verdict: pass` und ein anderer `verdict: fail` auf dem gleichen Ticket — statt User-Eskalation resolvst du nach dieser Reihenfolge:

1. **Competitor-Ground-Truth** (Konkurrenz-Dossier §3) — wenn Konkurrent X das Feature anders hat als Critic A meint, gewinnt die Konkurrenz-Evidence.
2. **User-Pain** (Dossier §4) — wenn User-Quotes klar eine Richtung zeigen, gewinnen sie.
3. **Trends** (Dossier §5) — letzte Instanz.

Digest: `- Tie-Break: {ticket.id} via {competitor|user-pain|trend}`

### §3.4 Digest-Stream

Alle Auto-Resolves werden in `inbox/daily-digest/YYYY-MM-DD.md` appended. Format siehe `docs/paperclip/DAILY_DIGEST.md`. User liest 1× täglich — kein Ping pro Resolve.

**Was NICHT im Digest landet** (zu verbose):
- Routine-Ticket-Completions ohne Auto-Resolve (die Metrics-Zeile zeigt die Summe)
- Erfolgreiche Lock-File-Writes
- Rulebook-Hash-Unchanged-Events

### §3.5 Autonomie-Gate-Entscheidungsbaum

```
Ticket aus Backlog
  ├─ Budget-Gate fail? → Live-Alarm Typ 1 (Stop)
  ├─ Rate-Gate fail?   → Wait next day
  ├─ Critic-Drift?     → Live-Alarm Typ 4 (Pipeline steht)
  └─ Dispatch
       └─ QA-Result eingegangen
            ├─ alle critics pass?   → Deploy-Queue
            ├─ partial + minor?     → Rework-Gate
            │    └─ rework > 2?     → §3.2 Score-Check
            └─ blocker severity?    → Rework-Gate (gleiche Logik)
                                      nach rework > 2 → Park, kein Ship
```

## §4 Kill-Switch (EMERGENCY_HALT)

### §4.1 Trigger-File

```bash
.paperclip/EMERGENCY_HALT
```

Existiert diese Datei beim Heartbeat-Step 1 → **SOFORT** Halt-Procedure. Inhalt der Datei ist frei wählbar (z.B. Grund: `"reason: critic-drift-suspected"`) und wird im Live-Alarm referenziert.

### §4.2 Halt-Procedure

```bash
if [[ -f .paperclip/EMERGENCY_HALT ]]; then
  reason=$(cat .paperclip/EMERGENCY_HALT 2>/dev/null || echo 'unspecified')

  # 1. In-Flight-Locks umschichten (siehe §5)
  mkdir -p tasks/killed-locks
  for lock in tasks/task.lock tasks/dossier-locks/*.lock; do
    [[ -f "$lock" ]] && mv "$lock" "tasks/killed-locks/$(basename "$lock").$(date -Iseconds)"
  done

  # 2. Live-Alarm Typ 5
  cat > "inbox/to-user/live-alarm-$(date -I)-emergency-halt.md" <<EOF
## Live-Alarm: EMERGENCY_HALT

**Trigger:** .paperclip/EMERGENCY_HALT existiert — Grund: ${reason}
**Warum ist es dringend:** Pipeline steht, kein Dispatch, keine Reviews.
**Was ich brauche:** User-Entscheidung — Halt beibehalten oder File löschen + Rationale
**Optionen:** A) Halt bleibt (Root-Cause-Analyse) B) Halt lösen via \`scripts/paperclip-resume.sh\`
**Deadline:** keine — Pipeline steht bis User-Resume
EOF

  # 3. Heartbeat beenden — keine Dispatches, keine weiteren Steps
  exit 0
fi
```

### §4.3 Auslösung (wer darf?)

- **User** jederzeit: `bash scripts/paperclip-halt.sh "<grund>"`
- **CEO-Agent** auto: bei Live-Alarm Typ 2 (Build-Fail-Cluster > 50% über 10 Tools) oder Typ 4 (Critic-Drift) schreibt CEO selbst das Flag
- **Tool-Builder** darf NICHT selbst halten — meldet nur via `inbox/to-ceo/`

### §4.4 Resume

Nur User darf das Flag löschen:

```bash
bash scripts/paperclip-resume.sh "<rationale>"
```

Das Script loggt den Resume-Grund in `memory/halt-history.md` und entfernt `.paperclip/EMERGENCY_HALT`. Nächster Heartbeat läuft normal.

### §4.5 Post-Halt-State

- Killed-Locks in `tasks/killed-locks/` → CEO checkt beim ersten Heartbeat nach Resume, ob sie re-dispatched werden können (§5).
- `inbox/to-user/live-alarm-*-emergency-halt.md` bleibt, bis User sie processed → `inbox/processed/`.
- Daily-Digest für den Halt-Tag bekommt eine explizite Zeile: `- HALT aktiv: <reason> (resume: <ISO-timestamp>)`.

## §5 In-Flight-Rollback & Stale-Lock-Policy

### §5.1 Stale-Lock-Definition

Ein `tasks/task.lock` (oder `tasks/dossier-locks/*.lock`) gilt als **stale**, wenn sein Timestamp älter ist als `3 × heartbeat_interval` (= 90 min bei 30-min-Intervall). Gründe: Worker abgestürzt, Token-Quota erschöpft, Sandbox-Timeout.

### §5.2 Babysitter-Recovery

Step 6 des Heartbeats führt einen Babysitter-Sweep:

```bash
for lock in tasks/task.lock tasks/dossier-locks/*.lock; do
  [[ -f "$lock" ]] || continue
  age_seconds=$(( $(date +%s) - $(stat -c %Y "$lock") ))
  if (( age_seconds > 5400 )); then   # 90 min = 3 × heartbeat
    mv "$lock" "tasks/stale-locks/$(basename "$lock").$(date -Iseconds)"
    digest_append "- Stale-Lock released: $(basename "$lock") (age=${age_seconds}s)"
    # Ticket wieder offen markieren
    ticket_id=$(awk -F'|' '{print $3}' "$lock" 2>/dev/null)
    [[ -n "$ticket_id" ]] && reopen_ticket "$ticket_id" --rework-increment
  fi
done
```

### §5.3 Re-Dispatch-Regeln

Ein stale-lock-Ticket wird beim nächsten Heartbeat re-dispatched mit `rework_counter += 1`. **NICHT** im gleichen Heartbeat wie das Release (sonst Race-Condition mit nachlaufendem Worker-Process).

### §5.4 Killed-Locks nach Halt-Resume

Nach `scripts/paperclip-resume.sh` checkt der erste Heartbeat `tasks/killed-locks/`:

- Ticket-YAML-Status vor Halt lesen (aus `current_task.md`-Snapshot)
- Bei unfertigem Tool-Build: `rework_counter += 1`, Backlog-Re-Insert mit Tag `halt-recovery`
- Bei unfertigem Dossier: Backlog-Re-Insert, Tag `halt-recovery-dossier`

Keine automatische Wiederaufnahme mitten im Step — immer vom Start des Ticket-Workflows.

### §5.5 Hard-Escalation (Lock ≥ 4h)

Wenn ein Lock älter als 4h wird (= 8 × Heartbeat), statt auto-release:

- Live-Alarm Typ 2 (Build-Fail-Cluster-Verwandter) wenn mehrere parallel
- Live-Alarm unbenannt (generic "Lock-Hang") wenn Einzelfall

User entscheidet, ob Worker-Environment kaputt ist oder neu gestartet werden muss.

## §6 Idle-Behavior

`idle_behavior: wait` — CEO dreht keine leeren Zyklen wenn Backlog leer. Wartet auf User-Input oder neues Backlog-Import. Kein Digest-Eintrag für Idle-Heartbeats (sonst rauscht der Digest voll).

## §7 Context-Window-Management

NotebookLM-Research (Citation 43): Nach 5 completed Tasks → CEO schreibt Summary in `memory/changelog-YYYY-MM-DD.md` und truncatet `tasks/backlog.md` um archived Einträge. Hält CEO-Context lean.

## §8 Failure-Modes & Recovery

| Symptom | Ursache | Recovery |
|---------|---------|----------|
| CEO plant neuen Cycle während Engineer läuft | Lock-File fehlt oder wird ignoriert | Engineer-AGENTS-md Step 1 prüfen; Lock-File-Write verbindlich |
| Agents in Endlos-Loop auf gleichem Ticket | `reworks` Counter steigt nicht | §3.2 Score-Check härten; hard fail nach 3 → Park |
| Critic-False-Positives | Eval-Rubrik-Kriterium zu strikt | BRAND_GUIDE.md §4 Kriterium mit User revisen (Ticket Typ `rulebook-update-request`) |
| Critic-Drift (F1 < 0.85 oder macro < 0.90) | Regex broken, Content-Pattern drift | Live-Alarm Typ 4, Pipeline stoppt |
| Context-Drift nach 30+ Cycles | Summary-Schritt aus | Manuell Summary triggern, heartbeat-checklist.step-12 prüfen |
| Agent commits als DennisJedlicka | Git-Hook umgangen | SOFORT stop Paperclip, Husky-Hook reparieren, git reset |
| EMERGENCY_HALT unbeabsichtigt ausgelöst | User-Error oder CEO-Over-Caution | §4.4 Resume mit Rationale — Grund in `memory/halt-history.md` |
| Stale-Lock älter als 4h | Worker-Env kaputt, Sandbox-Crash | §5.5 Hard-Escalation Live-Alarm |
