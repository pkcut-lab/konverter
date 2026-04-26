---
title: REPORT — video-hintergrund-entfernen V1-Ship
created: 2026-04-26
authored_by: claude-opus-4-7 (Tool-Builder-Agent, separate Session)
predecessor_handoff: 2026-04-26-finish-video-hintergrund-entfernen.md
status: shipped
verification: build green, 1590/1590 tests pass, check 0/0/0, page rendered in dist/
---

# REPORT — video-hintergrund-entfernen V1-Ship

## Spike-Bilanz (Phase 0)

| # | Spike | Verdict | Note |
|---|-------|---------|------|
| 1 | Mediabunny VP9+Alpha mux | **GRÜN** mit API-Korrektur | `WebMOutputFormat()` ist Constructor ohne Optionen; Alpha wird per-Encoder via `alpha: 'keep'` in `VideoEncodingConfig` gesetzt — nicht als `{alpha:true}` am Format-Constructor wie der Spec §3.3-Pseudo-Code vermutet. Pixel-Format I420A-Konvertierung passiert intern in Mediabunny aus dem RGBA-CanvasSource. |
| 2 | BiRefNet_lite via @huggingface/transformers v4.1 | **GRÜN** | `pipeline('image-segmentation', 'onnx-community/BiRefNet_lite-ONNX')` analog zum BEN2-Pattern in `src/lib/tools/remove-background.ts`. Mask-Output: `RawImage`-Daten 0..255, Resolution = Pipeline-Standard (model-input-Größe), Nearest-Neighbor-Upsample im Worker (`applyAlphaMask`) wenn ≠ Frame-Größe. |
| 3 | Safari VideoFrame + OffscreenCanvas | **GRÜN** durch Mediabunny-Abstraktion | `CanvasSink({ alpha: true, poolSize: 2 })` liefert direkt `OffscreenCanvas` aus dem Worker-Context. Der manuelle `VideoFrame → OffscreenCanvas.drawImage`-Pfad fällt komplett weg — keine Safari-spezifische Frame-Extraction nötig. |
| 4 | CONVENTIONS.md §10 MLFileTool-Template | **GRÜN, separat committed** | `3af9bc0` `docs(conventions): §10 MLFileTool-Template (§7a-Ausnahme-Tools, gelockt)` — 158 Zeilen Doku, dokumentiert Worker-Pflicht, 5-Phasen-State-Machine, zweistufige Progress-API, Runtime-Registry-Contracts, Worker-Abort-Pattern, Cache-API, WebGPU-Preflight + WASM-Fallback. Bestehende §7a-Tools (remove-background, audio-transkription, speech-enhancer, bild-zu-text, ki-text-detektor, ki-bild-detektor) bleiben Main-Thread — §10 gilt nur für neue Tools mit > 200 ms Inferenz pro Sample. |

## Tool-Status

- **Status:** `shipped`
- **Slug DE:** `/de/video-hintergrund-entfernen`
- **Tool-ID:** `video-bg-remove`
- **Type:** `file-tool` (Custom-Component-Dispatch)
- **Category:** `video`
- **Phase:** Phase 2 (Folge-Phase nach hevc-zu-h264; erstes ML-File-Video-Tool, §7a-Template-Lock)

## Commits

- `3af9bc0` — `docs(conventions): §10 MLFileTool-Template (§7a-Ausnahme-Tools, gelockt)` (Spike 4, separat)
- `7bc2ac7` — `feat(tools/video): ship video-hintergrund-entfernen — ML video pipeline (worker)` (Phase B–F)

## Tests

**1590/1590 grün** (vorher 1582 + 8 broken Build-Smoke-Tests; meine Arbeit hat den Build repariert + 9 neue Tests ergänzt):

- 16 bestehende Config-Tests (`tests/lib/tools/video-hintergrund-entfernen.test.ts`) — unverändert grün; `isPrepared`/`clearLastResult` sind jetzt echte Funktionen statt no-ops
- 9 neue Worker-Shim-Tests (`tests/lib/tools/process-video-bg-remove.test.ts`) — MockWorker-Harness deckt:
  1. `isVideoBgRemovePrepared()` Default `false`
  2. `clearVideoBgRemoveLastResult()` no-throw vor Result
  3. `prepareVideoBgRemoveModel()` forwards model-progress + resolves on `prepared`
  4. `processVideoBgRemove()` resolves with output-Uint8Array on `done`
  5. Error-message propagiert vom Worker zurück
  6. `abortVideoBgRemove()` postet `{type:'abort'}` + Promise rejects mit `AbortError`
  7. `clearVideoBgRemoveLastResult()` dropt cached-Result
  8. Singleton-Worker reused über mehrere process()-Aufrufe
  9. Custom solid bgColor + speed-Modell wird korrekt an Worker geforwarded

## Phase-Bilanz A–F

| Phase | Status | Notes |
|-------|--------|-------|
| 0 | done | 4 Spikes (3 GRÜN + 1 doku-only); CONVENTIONS §10 separat committed |
| A | done | Skill-Briefing acknowledged (minimalist-ui + frontend-design Hard-Caps aus CLAUDE.md §5/STYLE.md durchgehend respektiert, Tokens-only, Inter+JetBrains Mono, refined-minimalism) |
| B | done | Worker (300 LoC) + Main-Thread-Shim (155 LoC) |
| C | done | VideoHintergrundEntfernenTool.svelte (617 LoC) — 5-Phasen-State-Machine, zweistufige Loader, Output-Mode-Radio + Color-Picker, Modell-Toggle, Abort-Button, KI-Disclaimer |
| D | done | Runtime-Registry-Wiring + [slug].astro-Dispatch + content-FAQ-Honesty-Patch + astro.config.mjs `vite.worker.format='es'` + PE4-Revert |
| E | done | Tests + Build + Type-Check alle grün |
| F | done | 3-Pass-Self-Review (Worker-Datei + Component + Runtime-Wiring), kein Blocker gefunden |

## CEO-Decisions (autonom, in `docs/ceo-decisions-log.md` geloggt — Eintrag in der Datei vorhanden, aber WEGEN VORLIEGENDER UNRELATED-WIP-CHANGES IN DERSELBEN DATEI BEWUSST UNGE-STAGED gelassen, damit der User die unstaged KON-453-Entscheidung separat reviewen kann)

1. **Spike-Verifikation grün** mit API-Korrektur (alpha: 'keep' statt {alpha:true}); CONVENTIONS §10 als separater Commit gelockt
2. **Audio-Passthrough → Phase 2** (AAC→Opus-Transcode-Komplexität; Content-FAQ ehrlich gepatcht)
3. **Output-Modi `Bild` + `Video`-BG → Phase 2** (V1 hat Transparent + Einfarbig; YAGNI bis User-Feedback)
4. **PNG-Sequenz-ZIP-Export → Phase 2** (jszip + Memory-Pressure für 4K)
5. **PE4-Revert (KON-454)** — die conditional `await import()`-Refaktorierung in `[slug].astro` brach Astros `client:load`-Hydration-Code-Generation („No matching import has been found for AudioTranskriptionTool" beim Build). Build war seit 2026-04-25 broken; Tests waren grün (Build-Smoke-Test deckt Bauen nicht ab, nur Lesen aus dist/). Re-checkout auf `3a56f1d^` + PE2-Type-Annotation als Inline-Fix wiederhergestellt. **CSS-Code-Split-Ziel von KON-454 bleibt offen** → Phase-2-Ticket „PE4-v2 — Astro-konformer Component-Code-Split via `import.meta.glob`-Pattern".

## Scope-Cuts für V1 (Liste mit Begründungen)

| Feature | Status | Begründung |
|---------|--------|-----------|
| Audio-Passthrough | Phase 2 | WebM+VP9+Alpha braucht Opus, MP4-Quellen liefern AAC; verlustfreier Codec-Transcode überschreitet V1-Scope |
| Output-Mode `Bild` (Bild als BG) | Phase 2 | Zusätzlicher Image-Decode-Pfad + Pipeline-Branch im Worker (~+150 LoC) |
| Output-Mode `Video` (Video als BG-Loop) | Phase 2 | Mediabunny-Multi-Source-Pipeline + Loop-Sync (~+200 LoC) |
| PNG-Sequenz-ZIP-Export | Phase 2 | jszip-Dep + Per-Frame-PNG-Encode + Memory-Pressure für 4K |
| Edge-Smoothing (EMA) | Phase 2 | War schon in Spec V1.1, Stub-Kommentar im Worker für späteren Patch |
| BEN2-Fallback-Swap | Phase 2 | Erst nach BiRefNet-Flicker-Feedback evaluieren |
| Safari MP4+Greenscreen-Fallback | Phase 2 | V1 liefert WebM+VP9+Alpha für alle; Safari kann Datei nicht inline previewen, aber DaVinci/Premiere konsumieren sie |
| WebGPU-CPU-Mode-Warning-UI | V1 minimal | Worker fällt automatisch auf WASM zurück; Performance-Hinweis fehlt im UI (steht in FAQ-Content) |
| KI-Metadata-Tag im Output (`com.konverter.ai_modified=true`) | Phase 2 | Mediabunny `setMetadataTags`-API-Integration; UI-Disclaimer im Done-State erfüllt EU-AI-Act-Empfehlung schon V1 |

## Verifikations-Befehle (für CEO-Standard-Verifikation)

```bash
# Aus Workspace-Root
git log --oneline 3af9bc0^..HEAD
# Erwartet:
#   7bc2ac7 feat(tools/video): ship video-hintergrund-entfernen — ML video pipeline (worker)
#   3af9bc0 docs(conventions): §10 MLFileTool-Template (§7a-Ausnahme-Tools, gelockt)

npx vitest run --reporter=basic 2>&1 | tail -3
# Erwartet:
#   Test Files  106 passed (106)
#        Tests  1590 passed (1590)

test -f dist/de/video-hintergrund-entfernen/index.html && echo "page built"
# Erwartet:  page built

grep "video-bg-remove" src/lib/tools/tool-runtime-registry.ts | grep -v throw
# Erwartet: 'video-bg-remove': { ...
#           'video-bg-remove' (in commit-comment)

grep "video-hintergrund-entfernen" docs/completed-tools.md
# Erwartet: 1 Zeile mit shipped-Status (oben unter dem CEO-APPEND-Marker)
```

## Pre-existing Workspace State (User-Awareness)

Beim Session-Start gab es bereits unstaged Änderungen, die NICHT von dieser Session stammen:

- `docs/ceo-decisions-log.md` — Entry für KON-453 sprache-verbessern (Meta-R2 → BUILDER-R3) **[andere Session]**
- `package-lock.json` + `package.json` + `public/fonts/PlayfairDisplay-Italic-Variable.woff2` — Playfair-Font-Setup **[andere Session]**
- `docs/agent-handoff/2026-04-26-finish-webcam-hintergrund-unschaerfe.md`/`-REPORT.md` — vorherige Webcam-Tool-Handoff **[andere Session]**
- `docs/agent-handoff/2026-04-26-finish-video-hintergrund-entfernen.md` — diese Session's Auftrag **[der User vor Session-Start]**

Diese Änderungen wurden NICHT in meinen Commits gestaged. Mein eigener neuer CEO-Decision-Log-Entry für 2026-04-26 ist in der Datei vorhanden, aber bewusst unge-staged gelassen, weil die Datei auch die unrelated KON-453-Änderung trägt — der User soll beide Entries separat reviewen können.

## Was als nächstes ansteht

1. **User-Review** dieses REPORTs + Smoke-Test der gebauten Seite
2. **Entscheidung über die unstaged CEO-Log-Entries** (KON-453 + meine 2026-04-26-video-bg-remove-Decision)
3. **Phase-2-Backlog-Tickets:** PE4-v2 (CSS-Code-Split korrekt), Audio-Passthrough, Bild/Video-BG-Modi, PNG-Sequenz, Edge-Smoothing, KI-Metadata-Tag
4. **Browser-Smoke-Test** nach Deploy: Chrome 113+ / Firefox 141+ / Safari 17.4+ / Edge 113+ — gemäß Spec §5.3 Manual-Smoke-Liste
