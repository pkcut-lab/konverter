# EMERGENCY_HALT — Kill-Switch-Prozedur

## Zweck

Ein globaler Stop-Schalter für die gesamte Paperclip-Pipeline. Kein Dispatch, keine Reviews, keine Deploys — bis der User den Halt manuell aufhebt. Ist sowohl vom User als auch vom CEO-Agent selbst auslösbar.

## Trigger-Datei

```
.paperclip/EMERGENCY_HALT
```

**Semantik:**
- Existiert die Datei → Pipeline halted.
- Der Dateiinhalt ist ein frei-formatierter Grund (1–3 Zeilen). Wird in allen Live-Alarmen referenziert.
- Die Datei MUSS im Working-Tree liegen (nicht `.git/`), damit Tool-Builder + Merged-Critic + Dossier-Researcher sie unabhängig voneinander sehen können.

## Auslösung — 3 Wege

### 1. User-initiiert

```bash
bash scripts/paperclip-halt.sh "<grund>"
```

Beispiele:
```bash
bash scripts/paperclip-halt.sh "critic-drift-suspected"
bash scripts/paperclip-halt.sh "manual-intervention-needed — investigating tool X"
bash scripts/paperclip-halt.sh "vacation"
```

### 2. CEO-Agent-initiiert

Zwei Fälle sind gelockt:

| Auslöser | Bedingung | Automatischer Grund-String |
|---|---|---|
| **Build-Fail-Cluster** | > 50% Fails über 10 konsekutive Tools | `auto-halt: build-fail-cluster (≥50% fail rate, 10-ticket window)` |
| **Critic-Drift** | merged-critic binary_f1 < 0.85 **oder** macro_f1 < 0.90 | `auto-halt: critic-drift (binary=X.XX macro=X.XX)` |

CEO schreibt die Datei selbst + sendet Live-Alarm Typ 4 (Critic-Drift) oder Typ 2 (Build-Fail-Cluster).

### 3. Worker-initiiert (NICHT erlaubt)

Tool-Builder, Merged-Critic, Dossier-Researcher dürfen **nicht** selbst halten. Sie melden Probleme via `inbox/to-ceo/<typ>-<ticket-id>.md` — der CEO entscheidet, ob ein Halt gerechtfertigt ist.

## Halt-Procedure (automatisch beim Heartbeat)

HEARTBEAT.md §4.2 definiert den exakten Flow. Zusammengefasst:

1. **Check:** `.paperclip/EMERGENCY_HALT` existiert → Procedure starten
2. **Locks umschichten:** Alle laufenden `tasks/task.lock` + `tasks/dossier-locks/*.lock` → `tasks/killed-locks/<timestamp>/`
3. **Live-Alarm:** `inbox/to-user/live-alarm-YYYY-MM-DD-emergency-halt.md` schreiben (max 5 Sätze, siehe Format in `agents/ceo.md` §12)
4. **Exit:** Heartbeat ohne weiteren Step beenden. Keine Backlog-Picks, keine Dispatches, keine Digest-Updates.

## Resume — Nur User

```bash
bash scripts/paperclip-resume.sh "<rationale>"
```

Beispiele:
```bash
bash scripts/paperclip-resume.sh "critic-rerun passed after regex fix (commit abc1234)"
bash scripts/paperclip-resume.sh "investigation complete, no systemic issue"
bash scripts/paperclip-resume.sh "back from vacation"
```

Das Script:

1. Loggt `"<ISO-timestamp> | resume | <rationale>"` in `memory/halt-history.md`
2. Entfernt `.paperclip/EMERGENCY_HALT`
3. Gibt aus: `Paperclip resumed. Next heartbeat will process killed-locks/.`

## Post-Resume-Verhalten (erster Heartbeat nach Resume)

HEARTBEAT.md §5.4 beschreibt den Re-Dispatch:

- `tasks/killed-locks/` durchgehen
- Für jedes Lock-File: Ticket-ID extrahieren, Ticket-YAML-Snapshot aus `current_task.md` lesen (vor Halt gespeichert)
- **Tool-Build-Ticket** war in Progress → `rework_counter += 1`, Backlog-Re-Insert mit Tag `halt-recovery`
- **Dossier-Request** war in Progress → Backlog-Re-Insert mit Tag `halt-recovery-dossier`
- Nicht mitten im Step wiederaufnehmen — immer vom Workflow-Start

## Log-File `memory/halt-history.md`

Append-only, strukturiert:

```markdown
# Paperclip Halt-History

## 2026-04-21T08:14:23+02:00 | halt | critic-drift-suspected
Initiator: user (manual)
Killed-Locks: tasks/killed-locks/task.lock.2026-04-21T08:14:23/
Live-Alarm: inbox/to-user/live-alarm-2026-04-21-emergency-halt.md

## 2026-04-21T09:47:11+02:00 | resume | critic-rerun passed after regex fix
Initiator: user (manual)
Re-Dispatched: T-2026-0420 (rework_counter=1, tag=halt-recovery)
```

Jede halt/resume-Paarung wird so dokumentiert. Das File bleibt ewig — Audit-Trail für "wann hat die Pipeline gestanden und warum".

## Edge-Cases

### Halt während eines halb-committeten Tools

Wenn der Tool-Builder bereits `src/lib/tools/<id>.ts` geschrieben hat, aber `src/content/tools/<slug>/de.md` noch nicht: Halt triggert **kein** git-rollback. Die halb-committeten Files bleiben im Working-Tree. Nach Resume entscheidet der CEO:

- Bei `halt-recovery`-Tag: Builder fängt von vorne an — halb-fertige Files werden von seinem workflow-start überschrieben oder als Start-Template verwendet (Builder-Discretion).
- Bei Zweifelsfall: User-Escalation via `inbox/to-user/halt-recovery-review-<ticket-id>.md`.

### Halt während Critic-Review

Merged-Critic's Output-File in `tasks/awaiting-critics/<ticket-id>/merged-critic.md` bleibt erhalten. Nach Resume wird es beim nächsten Heartbeat-Step 7 re-aggregiert — keine doppelte Critic-Runde, da das File bereits ein `verdict`-Feld hat.

### Mehrere Halts an einem Tag

Jedes halt + resume-Paar bekommt eigenen Log-Eintrag. Im Daily-Digest werden sie als Range aufgelistet: `HALT 08:14–09:47, HALT 14:22–14:35`. Wenn > 3 Halts an einem Tag → Digest-Notiz signalisiert Kalibrierungs-Problem.

## Non-Goals

- **Kein** Rollback von bereits gemergtem Code. Halt stoppt nur weitere Aktionen.
- **Kein** Stop von manuell vom User initiierten Commits. Der User kann jederzeit committen — Halt betrifft nur Paperclip-Dispatches.
- **Kein** Flag für einzelne Agenten ("nur Tool-Builder stoppen"). Wenn Granularität gebraucht wird → separates Ticket.
- **Kein** Auto-Resume. Selbst wenn der Halt-Grund sich klärt, bleibt Halt bis User-Resume.

## Referenzen

- `HEARTBEAT.md` §4 (Halt-Procedure), §5 (Post-Halt Rollback)
- `agents/ceo.md` §13 (Kill-Switch-Procedure im Detail)
- `souls/ceo.md` "Kill-Switch" (Wert-Statement)
- `scripts/paperclip-halt.sh` + `scripts/paperclip-resume.sh`
