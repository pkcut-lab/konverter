# Heartbeat-Konfiguration

## Intervall: 30 Minuten

Rationale: NotebookLM-Research 2026-04-19. Unter 30 min = Task-Collisions (CEO plant während Engineer noch baut). Über 60 min = Feedback-Loop zu langsam für 1000-Tool-Skalierung.

**Ausnahmen:**
- Phase 2 erste Woche: **60 min** bis 5 Tools grün durch — langsam warmfahren
- Bug-Fix-Runs: **15 min** — wenn User `priority: urgent` setzt
- Offline-Modus: **0 min** = manueller Trigger (z.B. User will Mittagspause ohne Agent-Aktivität)

## Heartbeat-Checklist (CEO-Agent)

Bei jedem Aufwachen — in dieser Reihenfolge:

1. **Identity-Check** — `souls/ceo.md` lesen, Mission bestätigen
2. **Git-Account verifizieren** — `git config user.name` muss `pkcut-lab` sein, sonst SOFORT stop
3. **Rulebook-Integrity** — Hash-Check von PROJECT/CONVENTIONS/STYLE/CONTENT/TRANSLATION.md; bei Änderung ohne User-Approval-Ticket → Stop + Eskalation
4. **Inbox leeren** — alle `inbox/*.md` lesen, auf User-Anweisungen reagieren bevor Backlog
5. **Active Tasks checken** — `tasks/task.lock` existiert? → Tool-Builder läuft noch → nicht neue Task starten
6. **QA-Ergebnisse prüfen** — `tasks/qa_results.md` seit letztem Heartbeat neu? → Follow-up (Ship oder Rework)
7. **Backlog lesen** — `tasks/backlog.md` → nächstes Ticket mit resolved dependencies
8. **Rate-Limit check** — max 10 neue Tool-Tickets/Tag (bis erste 100 live sind)
9. **Ticket assignen** — `tasks/current_task.md` schreiben
10. **Memory-Update** — Abschluss in `memory/ceo-log.md`

**Token-Tripwire:** Falls Max-Plan-Quota erschöpft und API-Fallback triggert → SOFORT stop, User-Eskalation.

## Lock-File-Mechanik

```bash
# Tool-Builder SOLL bei Task-Start:
echo "tool-builder|$(date -Iseconds)|<ticket-id>" > tasks/task.lock

# Nach Fertigstellung (PASS oder FAIL):
rm tasks/task.lock
```

**CEO-Verhalten** wenn `task.lock` existiert:
- Age < 2h: warten bis nächster Heartbeat
- Age ≥ 2h: Stale-Lock annehmen → `task.lock` in `tasks/stale-locks/` verschieben → Ticket re-openen mit rework counter +1
- Age ≥ 4h: User-Eskalation statt auto-recovery

## Idle-Behavior

`idle_behavior: wait` — CEO dreht keine leeren Zyklen wenn Backlog leer. Wartet auf User-Input oder neues Backlog-Import.

## Context-Window-Management

Aus NotebookLM-Research (Citation 43): Nach 5 completed Tasks → CEO schreibt Summary in `memory/changelog-YYYY-MM-DD.md` und truncatet `tasks/backlog.md` um archived Einträge. Hält CEO-Context lean.

## Failure-Modes & Recovery

| Symptom | Ursache | Recovery |
|---------|---------|----------|
| CEO plant neuen Cycle während Engineer läuft | Lock-File fehlt oder wird ignoriert | Engineer-AGENTS-md Step 1 prüfen; Lock-File-Write verbindlich |
| Agents in Endlos-Loop auf gleichem Ticket | `reworks` Counter steigt nicht | Config: counter = hard fail after 2 → User-Inbox |
| QA-False-Positives | Eval-Rubrik-Kriterium zu strikt | BRAND_GUIDE.md §4 Kriterium mit User revisen |
| Context-Drift nach 30+ Cycles | Summary-Schritt aus | Manuell Summary triggern, heartbeat-checklist.step-10 prüfen |
| Agent commits als DennisJedlicka | Git-Hook umgangen | SOFORT stop Paperclip, Husky-Hook reparieren, git reset |
