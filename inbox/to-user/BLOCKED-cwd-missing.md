---
from: launch-coordinator
at: 2026-04-26T05:31 UTC+2
subject: Sprint BLOCKED (Schritt 2/2) — cwd fehlt in Worker-AdapterConfig
---

# Ein letzter fehlender Schritt: `cwd` in Worker-Adapter-Config

## Fortschritt ✅

Danke — model, effort, heartbeat und instructionsFilePath sind jetzt gesetzt.
Workers haben ihren ersten Heartbeat gefeuert (~03:28 UTC).

## Noch fehlt ❌

**`cwd` ist nicht gesetzt.** Ohne `cwd` starten die Worker-Agents in ihren
eigenen leeren Workspace-Verzeichnissen statt im Konverter-Webseite-Repo.
Die Dispatch-Files, Source-Code und Tests sind alle im Repo — Workers finden
sie nicht.

Aktuell laufender Beweis: JSON-LD-Enricher hat soeben einen Heartbeat gefeuert
(status=running) aber sein Workspace-Verzeichnis ist leer — kein `src/`, kein
`tasks/dispatch/`.

## Was du tun musst

Für **jeden der 9 Worker-Agents** im Paperclip-Dashboard (http://localhost:3101):

Füge in `adapterConfig` hinzu:

```json
"cwd": "C:\\Users\\carin\\.gemini\\Konverter Webseite"
```

### Die 9 Agents

| Agent-Name | Agent-ID |
|------------|----------|
| Cookie-Consent-Builder | 3ea6e86c-2b29-474b-896b-0febf974d46d |
| JSON-LD-Enricher | dad462b2-862d-4fe7-a4aa-99ade3b3531e |
| Performance-Auditor | 121bfc18-5cf0-4d49-9e45-0fb49df8575b |
| A11y-Auditor (WCAG 2.2 AAA) | d5ce894b-b1a8-440f-96bb-bca4d7e33086 |
| Error-Pages-Builder | 9bc2b90c-011b-456f-ba3b-a645660c7e5a |
| Cloudflare-Infra-Engineer | 2d263380-6538-4080-b425-649fcabcbd1d |
| OG-Image-Generator | 33c1c372-1682-4ba2-9305-6d66de7b9589 |
| AdSense-Prep-Checker | e87a3625-c8fb-46a3-bea6-8d5704dba56c |
| Quality-Reviewer | b0dbb363-989b-4dde-9338-7a8353c21492 |

### Via API (falls Dashboard unbequem)

```bash
for AGENT_ID in \
  3ea6e86c-2b29-474b-896b-0febf974d46d \
  dad462b2-862d-4fe7-a4aa-99ade3b3531e \
  121bfc18-5cf0-4d49-9e45-0fb49df8575b \
  d5ce894b-b1a8-440f-96bb-bca4d7e33086 \
  9bc2b90c-011b-456f-ba3b-a645660c7e5a \
  2d263380-6538-4080-b425-649fcabcbd1d \
  33c1c372-1682-4ba2-9305-6d66de7b9589 \
  e87a3625-c8fb-46a3-bea6-8d5704dba56c \
  b0dbb363-989b-4dde-9338-7a8353c21492; do
  curl -s -X PATCH \
    -H "Authorization: Bearer $PAPERCLIP_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"adapterConfig": {"cwd": "C:\\Users\\carin\\.gemini\\Konverter Webseite"}}' \
    "http://127.0.0.1:3101/api/agents/$AGENT_ID"
  echo " → $AGENT_ID patched"
done
```

**Achtung:** PATCH auf `adapterConfig` könnte die bestehenden Felder (model,
effort, instructionsFilePath) überschreiben — vorher prüfen ob Paperclip
merge-patcht oder replace-patcht.

## Nach Fix

Sobald `cwd` gesetzt ist, werden Workers beim nächsten Heartbeat automatisch:
1. `tasks/dispatch/<agent>-T<N>.md` finden
2. Task ausführen
3. Ergebnis nach `tasks/awaiting-review/T<N>/` schreiben
4. quality-reviewer wird reviewen + Verdict in LAUNCH_REPORT.md schreiben

---
_launch-coordinator — Heartbeat-3_
