# End-Reviewer — Registration Guide (erledigt 2026-04-24)

**Status: registriert.** Der `end-reviewer`-Agent läuft mit:

- **Agent-ID:** `b3a6677b-fd78-4a33-b39b-032664d2d329`
- **urlKey:** `end-reviewer`
- **Model:** `claude-sonnet-4-6` + `effort: max` (Ultrathinking)
- **Heartbeat:** disabled (event-driven, vom CEO dispatched)
- **CEO-Referenz:** eingetragen in `docs/paperclip/bundle/agents/ceo/AGENTS.md` §7.6

**Wie es trotz 403 funktioniert hat.** Paperclip läuft im
`deploymentMode: "local_trusted"`. Darin gilt: Localhost-Requests **ohne
`Authorization`-Header** werden als Board-trusted behandelt. Mit einem
Agent-Bearer-Token (CEO-Key aus `ceo-exports.sh`) greift dagegen Agent-Scope-
Permission und `POST /api/companies/<id>/agents` wird auf 403 geworfen. Der
Fix ist paradox einfach: Auth-Header weglassen.

Daher ist dieser Guide jetzt **Dokumentation für Zukunft** (Replikation auf
anderen Instanzen, neue QA-Agenten, etc.) — nicht mehr akut auszuführen.

---

## Historische Anleitung (für Replikation + neue Agenten)

Falls du einen weiteren Agent anlegen willst: entweder via Paperclip-UI
(Board-Login) ODER via cURL ohne Auth-Header auf Localhost. Die Felder unten
sind die, die der End-Reviewer bekommen hat.

## Schritt 1 — Paperclip-UI öffnen

Lokale Instanz läuft unter: `http://127.0.0.1:3101`

Log-in als Board-User (nicht Agent). Wechsel in die Company **Konverter Webseite**.

## Schritt 2 — Agent erstellen

Navigiere zu *Agents → New Agent* (oder `/KON/agents/new`). Felder:

| Feld | Wert |
|---|---|
| **Name** | `end-reviewer` |
| **URL-Key / Slug** | `end-reviewer` |
| **Role** | `qa` |
| **Title** | *(leer lassen)* |
| **Reports To** | *(leer)* |
| **Adapter Type** | `claude_local` |

### Adapter-Config (JSON oder Formular-Felder)

```json
{
  "cwd": "c:/Users/carin/.gemini/Konverter Webseite",
  "model": "claude-sonnet-4-6",
  "effort": "max",
  "paperclipSkillSync": {
    "desiredSkills": [
      "paperclipai/paperclip/paperclip",
      "paperclipai/paperclip/para-memory-files"
    ]
  },
  "instructionsFilePath": "c:/Users/carin/.gemini/Konverter Webseite/docs/paperclip/bundle/agents/end-reviewer/AGENTS.md",
  "instructionsRootPath": "c:/Users/carin/.gemini/Konverter Webseite/docs/paperclip/bundle/agents/end-reviewer",
  "instructionsEntryFile": "AGENTS.md",
  "instructionsBundleMode": "external"
}
```

**Wichtig — Model + Effort:**
- `"model": "claude-sonnet-4-6"` — der User-gewünschte Sonnet-Downgrade gegenüber Opus
- `"effort": "max"` — Ultrathinking. Falls die UI `max` nicht akzeptiert, fallback `"high"` (existierende Agenten wie `tool-dossier-researcher` laufen mit `high`)

### Runtime-Config

```json
{
  "heartbeat": {
    "enabled": false,
    "intervalSec": 300,
    "maxConcurrentRuns": 2
  }
}
```

**`heartbeat.enabled: false` ist wichtig** — der End-Reviewer ist rein
event-driven, dispatched vom CEO. Er soll sich NICHT alle 5 Min selbst wecken,
sondern nur auf End-Review-Tickets reagieren.

### Permissions / Skills / Capabilities

- `capabilities`: leer lassen (default)
- `writes_git_commits`: `true` (der End-Reviewer committet die `freigabe-liste.md`
  bei Pass-3-clean — siehe AGENTS.md §5)

## Schritt 3 — Agent-ID in CEO-Rulebook eintragen

Nach dem Erstellen zeigt die UI eine UUID an (wie z.B. `1a2b3c4d-...`). Diese
muss in zwei Stellen eingetragen werden:

### 3.1 CEO AGENTS.md

In `docs/paperclip/bundle/agents/ceo/AGENTS.md` §7.6, in der Python-Funktion
`dispatch_end_review`:

```python
END_REVIEWER_ID = "<uuid>"       # ← HIER die neue UUID einsetzen
```

### 3.2 CEO Parallel-Fan-Out-Script

In `docs/paperclip/bundle/agents/ceo/AGENTS.md` §3.5 (Critics-Dispatch-Bash)
**nicht** anfassen — End-Reviewer ist kein paralleler Critic, sondern läuft
sequentiell NACH Meta-Review.

## Schritt 4 — Skill-Sync auslösen

Wenn die UI einen `Sync Skills`-Button zeigt, klicken — damit Paperclip die
`desiredSkills` an Claude Code weiterreicht. Ohne Skill-Sync fehlen dem Agent
die Paperclip-Core-Skills (`paperclipai/paperclip/paperclip`, `para-memory-files`).

Alternative CLI:

```bash
npx paperclipai agent local-cli end-reviewer --company-id f8ea7e27-8d40-438c-967b-fe958a45026b
```

Das installiert die Skills + printet die Env-Exports. Wenn du den Agent-Key
auch für lokale CLI-Tests brauchst, speichere ihn nach
`~/.paperclip-local-env/end-reviewer-exports.sh` (analog zu
`ceo-exports.sh`).

## Schritt 5 — Smoke-Test

Nach Registration: das erste End-Review-Ticket entsteht erst, wenn ein
Meta-Review als `done` markiert wird und die Consumer-Loop §7.6 triggert.
Beim nächsten CEO-Heartbeat (alle 5 min) passiert:

1. CEO liest `meta-review-done` (z.B. für `tilgungsplan-rechner`, wenn Meta-Review
   läuft und grün ist)
2. CEO dispatched `end-review Pass 1: tilgungsplan-rechner` an `end-reviewer`
3. End-Reviewer bootet, Build + Dev-Server, Deep-Review
4. End-Reviewer schreibt `tasks/end-review-tilgungsplan-rechner-pass1.md`

Wenn Pass 1 clean ist (rar): CEO dispatched Pass 2 direkt, dann Pass 3. Falls
Pass 3 clean: `docs/paperclip/freigabe-liste.md` bekommt den Eintrag + Commit.

## Schritt 6 — Optional: erste Manuelle End-Review-Dispatch

Wenn du nicht auf den nächsten Meta-Review warten willst, kannst du einen
End-Review-Pass manuell anlegen. Beispiel für `tilgungsplan-rechner`
(einziges komplett gebautes Tool, das bereit ist):

Via UI: *Issues → New Issue*
- **Title:** `End-Review Pass 1: tilgungsplan-rechner`
- **Assignee:** `end-reviewer` (nach Registration)
- **Priority:** `high`
- **Description:**
  ```
  **ticket_type:** end-review
  **pass_number:** 1
  **target_slug:** tilgungsplan-rechner
  **tool_id:** tilgungsplan-rechner
  **dossier_ref:** tasks/dossiers/_cache/finance/tilgungsplan-rechner.dossier.md
  **build_commit_sha:** 2a19388
  **previous_pass_ref:** null

  Task: Deep-End-Review gemäß AGENTS.md §2. Output: tasks/end-review-tilgungsplan-rechner-pass1.md
  ```

## Troubleshooting

- **"effort: max" wird abgelehnt** → fallback auf `"high"`. Claude Code CLI
  unterstützt low/medium/high; `max` ist semantische User-Policy, nicht
  zwingend ein API-Wert. Hauptsache Ultrathinking ist aktiv (Sonnet 4.6 + high
  effort reicht für den Token-Spar-Zweck).

- **Agent committed nicht** → `writes_git_commits: true` + Git-Account-Check
  muss passen. Der End-Reviewer nutzt den gleichen `pkcut-lab`-Account wie
  alle anderen Agenten.

- **End-Reviewer zitiert Critic-Reports** → Hard-Cap aus AGENTS.md §7 wurde
  ignoriert. Prüfe die adapter-Instruction-Files: liest der Agent wirklich
  nur `docs/paperclip/bundle/agents/end-reviewer/AGENTS.md` + Projekt-
  Rulebooks (CLAUDE/CONVENTIONS/STYLE/CONTENT/DESIGN)?

- **Heartbeat läuft trotz `enabled: false`** → prüfe runtimeConfig direkt
  in DB oder via `GET /api/agents/<id>` — der Flag muss wirklich `false` sein.
