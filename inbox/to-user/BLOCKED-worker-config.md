---
from: launch-coordinator
at: 2026-04-26T05:21 UTC+2
subject: Sprint BLOCKED — Worker-Agents nicht konfiguriert
---

# Sprint BLOCKED: Worker-Adapter-Konfiguration fehlt

## Problem

Alle 9 Worker-Agents haben in der Paperclip-API:
- `adapterConfig: {}` (kein `model`, kein `effort`, kein `cwd`, kein `instructionsFilePath`)
- `runtimeConfig: {}` (kein `heartbeat.intervalSec`, kein `heartbeat.enabled`)
- `lastHeartbeatAt: null` (nie gelaufen)

Die Dispatch-Files liegen bereit (`tasks/dispatch/`), werden aber nicht gepickt,
weil die Agents nicht starten können.

## Betroffene Agents (alle 9)

| Agent | ID |
|-------|----|
| cookie-consent-builder | 3ea6e86c-2b29-474b-896b-0febf974d46d |
| jsonld-enricher (JSON-LD-Enricher) | dad462b2-862d-4fe7-a4aa-99ade3b3531e |
| perf-auditor (Performance-Auditor) | 121bfc18-5cf0-4d49-9e45-0fb49df8575b |
| a11y-auditor (A11y-Auditor) | d5ce894b-b1a8-440f-96bb-bca4d7e33086 |
| error-pages-builder (Error-Pages-Builder) | 9bc2b90c-011b-456f-ba3b-a645660c7e5a |
| cf-infra-engineer (Cloudflare-Infra-Engineer) | 2d263380-6538-4080-b425-649fcabcbd1d |
| og-image-generator (OG-Image-Generator) | 33c1c372-1682-4ba2-9305-6d66de7b9589 |
| adsense-prep-checker (AdSense-Prep-Checker) | e87a3625-c8fb-46a3-bea6-8d5704dba56c |
| quality-reviewer (Quality-Reviewer) | b0dbb363-989b-4dde-9338-7a8353c21492 |

## Was gebraucht wird

Jeder Worker braucht im Paperclip-Dashboard (http://localhost:3101) oder per API:

**adapterConfig:**
```json
{
  "model": "claude-sonnet-4-6",
  "effort": "max",
  "cwd": "C:\\Users\\carin\\.gemini\\Konverter Webseite",
  "instructionsFilePath": "C:\\Users\\carin\\.paperclip-worktrees\\instances\\konverter\\companies\\a1d7d1ea-7e43-46aa-92a7-27640c113577\\agents\\<agent-id>\\instructions\\AGENTS.md"
}
```

**runtimeConfig:**
```json
{
  "heartbeat": { "enabled": true, "intervalSec": 1800, "maxConcurrentRuns": 1 }
}
```

(quality-reviewer: intervalSec 900; launch-coordinator: intervalSec 600 — bereits konfiguriert)

## Alternativer schneller Weg

Das Bundle `.paperclip.yaml` in `docs/paperclip-launch/bundle/` enthält alle
Konfigurationen. Falls Paperclip ein Re-Import aus diesem Bundle unterstützt,
kann das die schnellste Lösung sein.

## Nach Fix

Sobald die Workers konfiguriert sind und ihr erster Heartbeat feuert,
werden sie die Dispatch-Files in `tasks/dispatch/` automatisch picken
und mit der Arbeit beginnen. Kein weiterer manueller Eingriff nötig.

---
_launch-coordinator — Heartbeat-2_
