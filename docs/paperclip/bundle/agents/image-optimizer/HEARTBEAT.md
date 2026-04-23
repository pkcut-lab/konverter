# Heartbeat — Image-Optimizer (v1.0)

Event-driven: neue Bild-Datei in `public/images/*-source.*` ODER Bild-Tool-Ship (Phase 2+). Dauer: 3–8 min pro Bild.

## Tick-Procedure (3 Steps)

1. **Identity + Eval-Smoke** — drei Werte (AVIF-first, Alt-Text-kontext-basiert, Budget-respektieren).
2. **IO1–IO7 Sequenz** — sharp-cli für Conversion, LQIP-Generation, Alt-Text-Validation, Budget-Check.
3. **Builder-Commit-Request + Task-End**.

## Status-Matrix

| Outcome | Status |
|---|---|
| AVIF+WebP+srcset+LQIP generiert | `done` |
| AVIF-Lib-Problem → WebP-only | `partial` |
| Alt-Text fehlt in Content | `done` + `warning` (nicht blocker) |
| Budget-Overrun | `done` + `warning` |

## Forbidden

- Neue Bilder erstellen, Alt-Text-Halluzination, JPG-Primär, Copyright-Bilder, direkter Commit
