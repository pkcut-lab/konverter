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
9.5. **Pre-Dispatch-Invariant-Gate** — §7 Procedure: blockt Dispatch bei Meta-Tag-
     oder CSP-Drift in globalen Files (BaseLayout, _headers). Audit 2026-04-21: ohne
     diesen Gate wurden 18 Tools mit fehlenden canonical/og/twitter-Tags geshipped.
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

## §6 Auto-Refill-Rule (Backlog-Driven Throughput)

### §6.1 Zweck

Wenn die active queue leer ist, aber Kandidaten auf der Roadmap warten, füllt
der CEO autonom nach — statt idle zu gehen. So läuft Phase 1 über Nacht durch,
ohne dass User morgens manuell 15 Tickets nachkippt. Hart gedeckelt, damit ein
bug-infected Run nicht 30 schlechte Tools produziert, bevor der User aufwacht.

**Prio-Quelle (v1.2, 2026-04-23):**
- **`docs/superpowers/plans/2026-04-23-tool-priority-masterplan.md`** — verbindliche Dispatch-Reihenfolge.
  Extraktions-Muster: Zeilen mit `| **N** | \`slug\``, N aufsteigend (Prio 1 → 789).
- **`tasks/backlog/differenzierung-queue.md`** — Lookup-Tabelle für Metadata
  (category, label, parent_hint) pro Slug. Die Tier-Struktur der Queue ist
  **NICHT mehr Dispatch-Order** — die Tiers gelten nur als grobe Kategorisierung
  fürs Nachschlagen.

### §6.2 Trigger-Gate (alle vier müssen grün sein)

1. **Active queue leer** — keine offenen Tickets mit `status: todo|in_progress`
   unter `in_flight`-Cap.
2. **Masterplan verfügbar** — `docs/superpowers/plans/2026-04-23-tool-priority-masterplan.md`
   existiert und hat ≥1 Prio-Zeile mit nicht-schon-gebauten Slug
   (Dedup gegen `src/content/tools/`).
3. **Tripwires green** — `tasks/tripwires.yaml`: keines der 5 Tripwires fired
   (`critic_reject_rate_rolling_10`, `build_fail_cluster`, `design_score_min`,
   `rate_limit_exhaustion`, `rulebook_drift_check`).
4. **Konservativer Refill-Stop** — `critic_reject_rate_rolling_10 ≤ 0.20`.
   Das ist strenger als der gleichnamige Haupt-Tripwire (`>0.30`). Rationale:
   Refill soll FRÜHER pausieren, damit User morgens nicht 15 rejecteten
   Tools gegenübersteht. Zwischen 0.20 und 0.30 läuft die Pipeline normal
   weiter, aber OHNE Auto-Refill.

### §6.3 Dispatch-Logic (Masterplan-Priority-Driven, v1.2)

```bash
# Hard-Caps (gelockt, User-Approval-Ticket für Änderung)
MAX_TICKETS_PER_HEARTBEAT=3
MAX_IN_FLIGHT=10

# Pre-Flight
in_flight=$(count_issues_status "todo,in_progress")
(( in_flight >= MAX_IN_FLIGHT )) && { log "refill-skip: in_flight=$in_flight >= cap"; return; }

# Refill-Stop (konservativ 0.20)
reject_rate=$(compute_critic_reject_rate_rolling_10)
awk -v r="$reject_rate" 'BEGIN{exit !(r > 0.20)}' && {
  digest_append "- Auto-Refill paused: critic_reject_rate_rolling_10=$reject_rate > 0.20 (Threshold konservativer als Tripwire)"
  return
}

slots=$(( MAX_TICKETS_PER_HEARTBEAT - (in_flight - prev_in_flight) ))
(( slots <= 0 )) && return

# 1. Masterplan-Extraktion: Prio-Reihenfolge (N=1..788)
masterplan="docs/superpowers/plans/2026-04-23-tool-priority-masterplan.md"
[[ ! -f "$masterplan" ]] && {
  live_alarm "masterplan-missing" "$masterplan nicht gefunden — Dispatch blockiert"
  return
}

# Extrahiert aus "| **42** | `mehrwertsteuer-rechner` | ..." → "42|mehrwertsteuer-rechner"
# Dann numerisch sort nach Prio-Nummer (aufsteigend: 1 → 788).
grep -oE '^\| \*\*[0-9]+\*\* \| `[a-z0-9-]+`' "$masterplan" | \
  sed -E 's/^\| \*\*([0-9]+)\*\* \| `([a-z0-9-]+)`/\1|\2/' | \
  sort -t '|' -k1 -n -u > /tmp/prio-order.txt

# Sanity-Check: Extraktion muss plausible Zeilenzahl liefern, sonst Format-Drift.
# Erwartet: ~788 Einträge (Stand 2026-04-23). Toleranz: ±20% (630..950).
# Außerhalb = vermutlich Format-Änderung (z.B. extra Space, Emphasis) oder File-Edit-Bug.
prio_count=$(wc -l < /tmp/prio-order.txt)
if (( prio_count < 100 )); then
  live_alarm "masterplan-regex-broken" "Nur $prio_count Prio-Zeilen extrahiert (erwartet ~788). Format-Drift in $masterplan? — Dispatch blockiert"
  return
fi
if (( prio_count < 630 || prio_count > 950 )); then
  # Soft-Warning, nicht blockieren — aber Digest-Notiz für User
  digest_append "- Masterplan-Regex: $prio_count Prios extrahiert (erwartet 630-950). Format-Drift prüfen."
fi

# Dedup-Guard: doppelte Slugs im Masterplan = User-Edit-Bug
unique_slugs=$(awk -F'|' '{print $2}' /tmp/prio-order.txt | sort -u | wc -l)
if (( unique_slugs != prio_count )); then
  digest_append "- Masterplan-Dedup: $prio_count Zeilen / $unique_slugs unique Slugs. Duplikat-Prios?"
fi

# 2. Pro Slug in Prio-Reihenfolge: Queue-Lookup für Metadata + Dedup + Enum + Dispatch
queue="tasks/backlog/differenzierung-queue.md"
picked=0

while IFS='|' read -r prio slug; do
  [[ -z "$slug" ]] && continue

  # Dedup: skip wenn schon gebaut
  [[ -d "src/content/tools/$slug" ]] && continue

  # Queue-Lookup: grep die Zeile mit diesem Slug (Format "| `slug` | category | label | parent_hint")
  queue_line=$(grep -E "^\| +\`${slug}\` +\|" "$queue" | head -1)
  if [[ -z "$queue_line" ]]; then
    # Slug in Masterplan aber nicht in Queue — skip mit Digest-Note
    digest_append "- Auto-Refill skip: prio=$prio slug=$slug nicht in differenzierung-queue.md"
    continue
  fi

  # Metadata aus Queue-Zeile extrahieren (Pipe-separated)
  category=$(echo "$queue_line" | awk -F'|' '{print $3}' | xargs)
  label=$(echo "$queue_line"    | awk -F'|' '{print $4}' | xargs)
  parent_hint=$(echo "$queue_line" | awk -F'|' '{print $5}' | xargs)

  # Enum-Check: Category muss in TOOL_CATEGORIES stehen
  node -e "process.exit(require('./src/lib/tools/categories.ts').TOOL_CATEGORIES.includes('$category')?0:1)" \
    || { digest_append "- Auto-Refill skip: prio=$prio slug=$slug category=$category not in TOOL_CATEGORIES"; continue; }

  # Dispatch in Prio-Reihenfolge
  dispatch_ticket "$slug" "$category" "$label" "$parent_hint" "prio=$prio"
  append_refill_log "$slug" "$in_flight" "$reject_rate" "prio=$prio"
  (( ++picked >= slots )) && break
done < /tmp/prio-order.txt

(( picked > 0 )) && digest_append "- Auto-Refill: ${picked} ticket(s) dispatched in Masterplan-Prio-Reihenfolge"
```

**Kritische Invariante:** CEO dispatcht IMMER Prio 1 vor Prio 2 vor Prio 3 —
unabhängig von dem Tier, in dem der Slug in `differenzierung-queue.md` steht.
Die Queue-Reihenfolge ist für den Dispatch irrelevant.

### §6.4 Hard-Caps (gelockt)

| Parameter | Wert | Rationale |
|---|---|---|
| `max_tickets_per_heartbeat` | **3** | Genug für 5-min-Cadence-Throughput, nicht genug um einen Bug zu replizieren |
| `max_in_flight` | **10** | Grobes Limit gegen Runaway (Rework-Stau + Critic-Queue); greift vor Tripwire |
| `refill_pause_reject_rate` | **0.20** | Konservativer als Tripwire (`0.30`); schützt User-Morning-Surface |
| `queue_order` | **FIFO top→bottom** | Deterministisch; User kann manuell reordern, Z.1 ist next |

Änderung nur über User-Approval-Ticket (`inbox/from-user/refill-cap-change.md`).

### §6.5 Idle-Fallback

Wenn §6.2 fail (z.B. Backlog leer **oder** reject-rate > 0.20 **oder** in_flight
am Cap) → CEO geht idle: kein Dispatch, kein Digest-Eintrag für den Idle-Tick
(sonst rauscht der Digest voll). Wartet auf User-Input oder nächsten Heartbeat.

### §6.6 Digest-Visibility

Jeder Auto-Refill-Dispatch kommt in den Daily-Digest:

```markdown
## Auto-Refill (2026-04-22)
- 02:40 — 3 tickets dispatched (millimeter-zu-zoll, yard-zu-meter, fuss-zu-meter); in_flight=5, reject_rate_10=0.08
- 03:10 — refill paused: reject_rate_10=0.22 > 0.20 threshold
- 03:40 — 2 tickets dispatched (seemeile-zu-kilometer, gramm-zu-unzen); in_flight=7, reject_rate_10=0.15
```

So sieht der User morgens sofort, welche Tools er zum Testen hat, ohne dass
der CEO jeden einzelnen Pick pingt.

## §7 Pre-Dispatch-Invariant-Gate (Per-Deploy, NICHT Weekly)

Audit 2026-04-21 Lessons-Learned (M-7-01, M-7-02, M-7-03, M-5-02): globale
SEO- und Security-Invarianten in `BaseLayout.astro` und `public/_headers` sind
beim Tool-Bau nicht geprüft worden. Ergebnis: 18 Tools ohne canonical-URL,
ohne og:/twitter:-Meta, ohne CSP — alle live.

**Prinzip:** Diese Invarianten müssen BEI JEDEM Heartbeat-Dispatch grün sein,
nicht wöchentlich. Wenn sie fail → kein weiteres Tool wird gebaut, bis User
den globalen Fix mergt. Lieber pausieren als kaputte Tools stapeln.

### §7.1 Invariant-Checks

Step 9.5 führt folgende Checks VOR jedem Dispatch aus:

```bash
invariant_fail=0
invariant_reasons=()

# I-1: BaseLayout hat canonical
grep -q 'rel="canonical"' src/layouts/BaseLayout.astro || {
  invariant_fail=1
  invariant_reasons+=("I-1: canonical missing in BaseLayout")
}

# I-2: BaseLayout hat og: + twitter: Kernfelder
for tag in 'property="og:title"' 'property="og:description"' 'name="twitter:card"'; do
  grep -q "$tag" src/layouts/BaseLayout.astro || {
    invariant_fail=1
    invariant_reasons+=("I-2: $tag missing in BaseLayout")
  }
done

# I-3: _headers hat Content-Security-Policy
if [[ -f public/_headers ]]; then
  grep -q "Content-Security-Policy" public/_headers || {
    invariant_fail=1
    invariant_reasons+=("I-3: CSP missing in public/_headers")
  }
else
  invariant_fail=1
  invariant_reasons+=("I-3: public/_headers file not found")
fi

# I-4: npm audit high/critical — redundant zu Pre-Commit-Gate 5b beim Builder,
#      aber CEO-Snapshot vor Dispatch fängt Drift durch externe Änderungen
#      (User hat Dep geupdated, Pre-Commit-Gate noch nicht gelaufen).
npm audit --audit-level=high --production --json 2>/dev/null | \
  node -e 'let s=""; process.stdin.on("data",d=>s+=d).on("end",()=>{
    const r=JSON.parse(s); const c=r.metadata?.vulnerabilities||{};
    if((c.high||0)+(c.critical||0)>0) process.exit(1);
  })' || {
  invariant_fail=1
  invariant_reasons+=("I-4: npm audit high/critical > 0")
}
```

### §7.2 Block-Action bei fail

```bash
if (( invariant_fail )); then
  # Fix-Ticket an User schreiben
  cat > "inbox/to-user/invariant-fail-$(date -I).md" <<EOF
## Pre-Dispatch-Invariant-Gate FAIL

**Zeitpunkt:** $(date -Iseconds)
**Betroffen:** globale Files (BaseLayout.astro, _headers, deps)
**Warum dringend:** Pipeline steht. Alle neuen Tools würden mit diesem Fehler shippen.

### Fails
$(printf '- %s\n' "${invariant_reasons[@]}")

### Empfehlung
Fix zuerst die Invarianten (entweder selbst oder via Fix-Agent).
Nach Fix: Heartbeat läuft auto weiter beim nächsten Tick.

### Keine Tools werden dispatched, bis Gate grün.
EOF

  # Digest-Entry
  digest_append "- BLOCKED invariant-gate: ${#invariant_reasons[@]} fails — dispatch paused"

  # Heartbeat endet HIER, kein Step 10 (Dispatch)
  exit 0
fi
```

### §7.3 Warum nicht Weekly

Weekly-Sweeps akkumulieren 7 Tage Bugs, bevor jemand sie bemerkt. Per-Dispatch-
Gate findet den Drift im selben Tick, in dem er entstanden ist. User-Cost:
0 zusätzliche Token (Checks sind Grep + 1× `npm audit`), Time-Cost: ~3s.

### §7.4 Resume-Path

Sobald der Fix-Agent (oder User) den Invariant-Fail behoben hat und committed:
- Nächster Heartbeat-Tick fährt §7.1 automatisch erneut
- Grün → Step 10 Dispatch läuft wie gewohnt
- Kein manueller Resume nötig (im Gegensatz zu §4 EMERGENCY_HALT)

## §8 Context-Window-Management

NotebookLM-Research (Citation 43): Nach 5 completed Tasks → CEO schreibt Summary in `memory/changelog-YYYY-MM-DD.md` und truncatet `tasks/backlog.md` um archived Einträge. Hält CEO-Context lean.

## §9 Failure-Modes & Recovery

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
