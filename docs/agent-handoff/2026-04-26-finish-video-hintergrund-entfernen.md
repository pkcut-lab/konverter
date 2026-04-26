---
title: Agent-Handoff — video-hintergrund-entfernen fertig bauen (4 Spikes + Full Build)
created: 2026-04-26
created_by: claude (CEO-Handoff-Brief nach Phase-2-Sonderdelegation + PdfZusammenfuehren-Session)
target_agent: separate-session-tool-builder
quality_bar: paperclip-equivalent (gleicher Standard wie Handoff 1+2 2026-04-25/26)
status: ready-for-handoff
verification_after: report nach Vorlage am Ende, User gibt Report an Claude zurück
predecessor: 2026-04-26-finish-parked-pdf-tools.md (2 PDF-Tools — pdf-zusammenfuehren + pdf-aufteilen)
ship_block_reason: process() + prepare() in tool-runtime-registry.ts lines 152-171 werfen beide Errors — Spike-Tasks fehlen
---

# Auftrag — video-hintergrund-entfernen fertig bauen

## Kontext (in 30 Sekunden)

`video-hintergrund-entfernen` ist das **erste ML-File-Video-Tool** der Plattform — ein §7a-Ausnahme-Tool
(NN #7a: ML-File-Tool mit Worker-Fallback, rein client-seitig, kein Upload). Es ist **CEO-ship-blocked**
weil `process()` und `prepare()` im Runtime-Registry-Eintrag beide `throw new Error()` sind — bewusste
Stub-Marker die auf fehlende Spike-Task-Verification warten.

Der restliche Scaffold ist fertig: Config-File vorhanden, Slug-Map registriert, Tool-Registry registriert,
Content-DE fertig, 16 Config-Tests grün. Es fehlt **nur die ML-Pipeline-Implementierung**.

Warum blockiert? Das Tool braucht **4 kurze Spike-Verifikationen** bevor gebaut werden darf:
1. Mediabunny `WebMOutputFormat({ alpha: true })` — VP9+Alpha-Mux-API existiert und funktioniert?
2. `@huggingface/transformers` pipeline mit `onnx-community/BiRefNet_lite` — tensor shapes OK?
3. Safari `VideoFrame` + OffscreenCanvas-Composition — kompatibel?
4. CONVENTIONS.md MLFileTool-Template-Draft — Lifecycle-Schnittstelle dokumentiert bevor Code

Du verifizierst die Spikes, dann baust du das Tool vollständig durch alle 6 Phasen.

## Wer du bist

Eigenständiger Tool-Builder-Agent in einer **separaten Session**. Du baust `video-hintergrund-entfernen`
vollständig von der Spike-Verification bis zum Ship. Wenn du fertig bist: Report nach Vorlage am Ende.
User leitet an Claude weiter, Claude verifiziert am Code per 8-Phasen-Checkliste.

## Pflichtlektüre (in dieser Reihenfolge)

Bevor du ANFANGST, lies diese Files VOLLSTÄNDIG:

1. `CLAUDE.md` — Hard-Caps + Arbeitsprinzipien + Non-Negotiables (NN #7a ist hier definiert)
2. `docs/paperclip/bundle/agents/ceo/AGENTS.md §0` (inkl. §0.1 Sequential, §0.7 NO-ESCALATION-LOCK)
3. `CONVENTIONS.md` — Code-Regeln, Performance-Mandate §9.1, MLFileTool-Section (wird von dir in Task 1.3 angelegt)
4. `STYLE.md` — Visual-Tokens + SEO-Schema
5. `CONTENT.md` — Frontmatter-Schema + H2-Pattern
6. `DESIGN.md` — Tool-Detail-Layout + Komponenten-Conventions
7. `PROJECT.md` — gelockte Tech-Stack-Versionen
8. `docs/completed-tools.md` — Schema (CEO-Notes-Spalte) + Liste shipped Tools
9. `docs/ceo-decisions-log.md` — kürzliche autonome Entscheidungen
10. `src/content/tools.schema.ts` — Zod-Schema Content-md
11. `src/lib/tools/schemas.ts` — Zod-Schema Tool-Config
12. `docs/superpowers/specs/2026-04-22-video-hintergrund-entfernen-design.md` — Design-Spec (KOMPLETT lesen, §9 Spike-Tasks ist dein Ausgangspunkt)

Reference-Implementations zum Abgucken:

- **`src/lib/tools/remove-background.ts`** — etabliertes ML-Inferenz-Pattern im Projekt:
  `@huggingface/transformers` `pipeline()` + WebGPU-Device-Detection + Singleton-Cache + Stall-Timeout.
  Das ist dein **primäres Referenz-Muster** für BiRefNet_lite-Inferenz (nicht direkte onnxruntime-web-Calls
  wie der Spec-Pseudo-Code zeigt — transformers.js wraps onnxruntime intern, Pattern schon erprobt).
- **`src/lib/tools/process-hevc-to-h264.ts`** — Mediabunny `BufferSource` + `Input` + `Output` + 
  `Mp4OutputFormat` Pattern mit `(mb as any)`-Cast (Mediabunny hat keine vollständigen TS-Typen).
  Dein VP9+Alpha-Output braucht `WebMOutputFormat({ alpha: true })` statt `Mp4OutputFormat()`.
- **`src/lib/tools/tool-runtime-registry.ts`** — `toolRuntimeRegistry` Eintrags-Format: `process`, 
  `prepare`, `isPrepared`, `clearLastResult`, `preflightCheck`. Du ersetzt den Stub-Eintrag `'video-bg-remove'`
  (lines 152-171) mit der echten Implementierung.
- **`src/components/tools/FileTool.svelte`** + Dispatch in `src/pages/[lang]/[slug].astro` — Du baust
  `VideoHintergrundEntfernenTool.svelte` als Custom-Component (analog zu KiBildDetektorTool, AudioTranskriptionTool).

## Sequential-Pipeline (Pflicht-Workflow, identisch zu vorherigen Handoffs)

```
Phase 0 — Spike-Verification (NUR dieses Tool, kein Standard-Pipeline-Step)
  → 4 Spikes verifikziert → Spike-Report im Commit-Body

Phase A — Vorbereitung (Dossier + Content + Config vorhanden — CHECK bevor du baust)
  → CEO-Gate-1: pass / reject

Phase B — Build
  Worker + Processing-Modul + Custom-Component + Runtime-Registry-Eintrag
  Tests (≥20, realistisch wegen Worker-Komplexität)
  Build grün → CEO-Gate-2

Phase C — Pre-Publish (Meta + FAQ — schon vorhanden, validieren)
  → CEO-Gate-3

Phase D — Critics (Self-Review aller Dimensionen)
  Bei Issues: scoped Fix → max 2 Reworks → ggf. CEO-Hotfix-by-Self

Phase E — End-Review (3-Pass-Pflicht)
  Pass 1: Full-Tool-Review (gerendertes HTML aus dist/)
  Pass 2: Verifiziert Pass-1-Fixes
  Pass 3: Final-Sanity-Check

Phase F — Ship
  Append in docs/completed-tools.md mit CEO-Notes
  Eintrag in tasks/.ceo-tmp/completed.txt
  Commit feat(tools/video): ship video-hintergrund-entfernen
```

**EISERNE REGELN:**

- **3-Pass-End-Review ist Pflicht** — auch bei clean Pass 1.
- **Eigener Commit** mit Phase-0–F-Body. Trailer `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.
- **NO-ESCALATION-LOCK §0.7:** kein File in `inbox/to-user/` außer den 5 Live-Alarm-Typen.
  Bei Hard-Cases: autonom entscheiden + in `docs/ceo-decisions-log.md` loggen.
- **Vor jedem Commit:** `bash scripts/check-git-account.sh` — muss `pkcut-lab` zeigen.

---

## Phase 0 — Spike-Verification (Pflicht, vor jeder Build-Arbeit)

Diese 4 Spikes sind kurz (30–90 Min gesamt) aber Pflicht. Ohne sie weißt du nicht ob die Kernarchitektur
funktioniert. Wenn ein Spike scheitert → autonom entscheiden (Fallback oder Park), in CEO-Log loggen.

### Spike 1.0 — Mediabunny VP9+Alpha Mux (30–60 Min)

**Was zu testen:** `WebMOutputFormat({ alpha: true })` — existiert und muxed VP9+Alpha korrekt?

Das `hevc-zu-h264`-Tool benutzt nur `Mp4OutputFormat()`. VP9+Alpha-WebM ist ungetestet.

```ts
// Minimal-Probe (Node-Script oder Vitest-Test):
import mb from 'mediabunny';
// Kann mediabunny ein VP9+Alpha-WebM mit BufferSource erzeugen?
// Prüfe: (mb as any).WebMOutputFormat existiert UND akzeptiert { alpha: true }
// Wenn nicht: Fallback-Plan (webm-muxer Paket, MIT, ~15KB)
```

**Entscheid-Kriterien:**
- `WebMOutputFormat({ alpha: true })` vorhanden und funktionstüchtig → GRÜN, weiterfahren
- API existiert aber Alpha-Flag hat keine Wirkung → GELB, probiere `webm-muxer` als Fallback
- Komplett nicht vorhanden → ROT, Park-Decision (VP9+Alpha-Output auf Phase 2 verschieben,
  Safari-Greenscreen als einzigen Transparent-Output für V1 dokumentieren)

### Spike 1.1 — BiRefNet_lite via Transformers.js pipeline() (30 Min)

**Was zu testen:** Kann `@huggingface/transformers` `pipeline('image-segmentation', 'onnx-community/BiRefNet_lite')`
importiert und auf einem Test-Frame aufgerufen werden?

Das Projekt nutzt bereits `@huggingface/transformers` für `remove-background.ts` (BEN2-Modell). BiRefNet_lite
ist ein anderes Modell, braucht aber denselben Pipeline-Typ (`image-segmentation`).

```ts
// Pattern aus remove-background.ts übernehmen:
import { pipeline, RawImage } from '@huggingface/transformers';
const pipe = await pipeline('image-segmentation', 'onnx-community/BiRefNet_lite', {
  device: 'webgpu',  // mit 'wasm'-Fallback bei Nicht-Support
  dtype: 'fp32',
});
// Prüfe: mask.data shape, mask.data range (0–255), mask.width, mask.height
```

**Entscheid-Kriterien:**
- `pipeline()` mit BiRefNet_lite funktioniert + Mask-Output hat gleiche Form wie BEN2 → GRÜN
- BiRefNet_lite-Output unterscheidet sich von BEN2 (andere Normierung, anderes Label) → GELB,
  patch `applyAlphaMask()` entsprechend, dokumentiere im Code-Kommentar
- Modell nicht über `onnx-community`-Mirror verfügbar oder falscher Output-Shape → ROT,
  fallback auf `Xenova/modnet` (kleineres MODNet, auch Apache-2.0, speed-Preset-Kandidat),
  CEO-Log-Eintrag

### Spike 1.2 — Safari VideoFrame + OffscreenCanvas (20 Min)

**Was zu testen:** `VideoFrame` → `OffscreenCanvas`-Draw → `RawImage`-Konvertierung auf Safari 17.4+.

Das `hintergrund-entfernen`-Tool (Bild-BG-Remover) benutzt `RawImage.fromURL()`. Für Videos
müssen wir `VideoFrame`-Daten manuell über `OffscreenCanvas.drawImage()` extrahieren.

```ts
// In Chrome/Firefox problemlos. Safari: prüfe ob VideoFrame.copyTo() verfügbar
// oder ob OffscreenCanvas.getContext('2d').drawImage(videoFrame) reicht
```

**Entscheid-Kriterien:**
- `OffscreenCanvas.drawImage(videoFrame)` funktioniert auf Safari 17.4+ → GRÜN
- `VideoFrame.copyTo()` als Alternative vorhanden → GRÜN (nutze das)
- Keines funktioniert auf Safari → GELB, Main-Canvas-Fallback (UI-Warning),
  dokumentiere als bekannte Einschränkung in FAQ-Antwort §5

### Spike 1.3 — CONVENTIONS.md MLFileTool-Template-Draft (30 Min)

**Was zu tun:** Append einen neuen Abschnitt `## §10 MLFileTool-Template (§7a-Ausnahme-Tools)` in
`CONVENTIONS.md`. Dieser dokumentiert das Lifecycle-Muster für alle zukünftigen ML-File-Tools
(Video-Upscaler, Motion-Blur-Remove, etc.) bevor der erste Code geschrieben wird.

Mindest-Inhalt:
- Worker-Pattern (Web Worker mandatory für ML-Inferenz, kein Main-Thread-Blockieren)
- State-Machine der Custom-Component: `idle → preparing → model-loading → converting → done → idle`
- Progress-API: zweistufig (Model-Download-Phase + Frame-Encoding-Phase)
- `prepare()` / `process()` Signatur in `tool-runtime-registry.ts`
- `isPrepared()` / `clearLastResult()` / `preflightCheck()` Contracts
- Worker-Abort-Pattern (`postMessage({ type: 'abort' })` + `clearInterval`)
- Cache-API für Modell-Weights (First-Load vs. Cache-Hit)
- WebGPU-Preflight mit WASM-Fallback
- Verweis auf `video-hintergrund-entfernen` als Referenz-Implementierung

**Warum vor dem Code:** Wenn die Template-Spec erst nach der Implementierung entsteht, kodifiziert
sie zufällige Entscheidungen statt durchdachte Entscheidungen. §1.3 CONVENTIONS.md: „dokumentiere
die Architektur bevor du sie baust".

---

## Phase B im Detail — Was konkret zu bauen ist

### Was schon existiert (NICHT nochmal bauen)

- `src/lib/tools/video-hintergrund-entfernen.ts` — Config-Stub existiert, validiert gegen `FileToolConfig`.
  **Nicht anfassen** außer du brauchst ein neues Feld.
- `tests/lib/tools/video-hintergrund-entfernen.test.ts` — 16 Config-Tests, alle grün. **Nicht löschen**.
  Neue Worker-Tests in eine separate Datei `tests/lib/tools/process-video-bg-remove.test.ts`.
- `src/content/tools/video-hintergrund-entfernen/de.md` — vollständig (Frontmatter + Body schon da).
  **Lesen und validieren**, nicht neu schreiben außer du findest Schema-Fehler.
- `src/lib/slug-map.ts` + `src/lib/tool-registry.ts` — `video-bg-remove` schon registriert.
- `src/lib/tools/tool-runtime-registry.ts:152-171` — Stub-Eintrag schon da, **nur die throw-Stubs ersetzen**.

### Was zu bauen ist

#### 1. `src/workers/video-bg-remove.worker.ts` (Kern-Implementierung)

Web Worker der die gesamte ML-Pipeline übernimmt (siehe Design-Spec §3.3 Pseudo-Code als Vorlage).
Pattern: `self.onmessage` empfängt `{ type: 'process', payload: { input, config } }` und postet
`{ type: 'progress', phase, value }` + `{ type: 'done', output }` + `{ type: 'error', message }`.

Abort-Path: empfängt `{ type: 'abort' }`, stoppt Frame-Loop, räumt auf.

```
Pipeline-Schritte (aus Design-Spec §3.3 adaptiert):
1. BiRefNet_lite-Modell laden (via @huggingface/transformers pipeline(), nutzt intern onnxruntime-web)
   → Progress 'model' 0→1
2. Input dekodieren (Mediabunny BufferSource + Input.getPrimaryVideoTrack())
3. Output vorbereiten (WebMOutputFormat({ alpha: true }) für Chrome/Firefox/Edge)
   → Safari-Fallback: Mp4OutputFormat + Greenscreen #00FF00 (via preflightCheck aus config)
4. Frame-Loop: VideoFrame → OffscreenCanvas → RawImage → pipeline() → applyAlphaMask → encodeFrame
   → Progress 'frame' frameIdx/totalFrames
5. Audio-Track durchreichen (Copy, kein Re-Encode) wenn Modus != 'transparent'
6. Output finalisieren + als Uint8Array zurückposten
```

**Key Design-Entscheidung:** Nutze `@huggingface/transformers` `pipeline()` (schon installiert,
Pattern aus `remove-background.ts` bekannt) STATT direktem `onnxruntime-web` `InferenceSession.create()`.
Die Spec zeigt `onnxruntime-web` direkt — aber das transformers.js-Wrapper-Pattern ist im Projekt
erprobt und erspart dir NCHW/NHWC-Tensor-Layout-Magie. Wenn der Spike (1.1) zeigt dass BiRefNet_lite
kein passender Kandidat für die pipeline()-API ist, dokumentiere das in CEO-Log und nutze Fallback.

#### 2. `src/lib/tools/process-video-bg-remove.ts` (Main-Thread-Interface)

Thin Wrapper der den Worker instanziiert und die postMessage-Kommunikation kapselt.
Exportiert eine Funktion die das `ToolRuntime.process` / `ToolRuntime.prepare` Interface erfüllt.

```ts
// Öffentliche API (wird in tool-runtime-registry.ts konsumiert):
export async function processVideoBgRemove(
  input: Uint8Array,
  config?: Record<string, unknown>,
  onProgress?: (progress: number) => void,
): Promise<Uint8Array>

export async function prepareVideoBgRemoveModel(
  onProgress: (e: { loaded: number; total: number }) => void,
): Promise<void>

export function isVideoBgRemovePrepared(): boolean
export function clearVideoBgRemoveLastResult(): void
```

Lazy-Singleton-Worker-Pattern: Worker-Instanz einmalig erstellen, wiederverwenden.
Abort-Handle: `clearVideoBgRemoveLastResult()` ruft Worker `abort`-Message, räumt auf.

#### 3. `src/components/tools/VideoHintergrundEntfernenTool.svelte` (Custom-Component)

Analog zu `KiBildDetektorTool.svelte` / `AudioTranskriptionTool.svelte` — Custom-Component die
`FileTool.svelte` ergänzt (oder direkt in `[slug].astro` als Custom-Dispatch geladen wird).

State-Machine (aus Design-Spec §3.1, adaptiert):
```
idle → preparing → model-loading → converting → done
              ↘               ↘           ↘
              error          error       error
```

UI-Pflicht-Features:
- **Modell-Lade-Progress** (Step 1): Progress-Bar mit Label *„Modell wird geladen… 42 %"*.
  Erster Load ~4s (50 MB BiRefNet_lite), danach gecacht → instant.
- **Frame-Encoding-Progress** (Step 2): *„Frame 128 / 2400 · ETA 03:24"*.
- **WebGPU-Warning** falls CPU-Fallback aktiv: *„Kein WebGPU — CPU-Modus aktiv (deutlich langsamer)"*.
- **Abort-Button** während `converting` (langer Prozess, User-Kontrolle Pflicht).
- **Output-Modus-Radio** im `idle`/`ready`-State: Transparent · Einfarbig · Bild · Video.
  (V1: mindestens Transparent + Einfarbig; Bild+Video können CEO-Notes als Phase-2-cut erhalten)
- **Done-State:** Download-Button + PNG-Sequenz-ZIP-Button (Differenzierungs-Feature §2.4.B#4).
- **EU-AI-Act-Disclaimer** im Done-State: *„Dieses Video wurde mit KI bearbeitet (Hintergrund entfernt/ersetzt)."*
  Als subtile Zeile, kein Modal.
- **prefers-reduced-motion Block** (Lessons-Learned Handoff 1+2): alle Selektoren mit
  `transition`, `animation`, `transform` — global.css killt nur `transition-duration`, nicht `transform`.

```css
@media (prefers-reduced-motion: reduce) {
  .progress-bar, .abort-btn, .download-btn, .download-btn:hover {
    transition: none;
    transform: none;  /* transform separat, nicht von global.css abgedeckt */
  }
}
```

**Scope-Call für V1:** Die Output-Modi Bild und Video (BG-Image-Replace, BG-Video-Replace) sind
aufwändig (zusätzliche File-Inputs, Canvas-Composition mit zweitem Asset). Du darfst autonomous
entscheiden ob V1 nur `Transparent` + `Einfarbig` liefert und Bild+Video als CEO-Notes-Phase-2-cut
logst. Klar dokumentiert in `docs/ceo-decisions-log.md`.

#### 4. Update `tool-runtime-registry.ts` (lines 152-171)

Ersetze die `throw`-Stubs mit echten Calls aus `process-video-bg-remove.ts`:

```ts
'video-bg-remove': {
  process: async (input, config, onProgress) => {
    const m = await import('./process-video-bg-remove');
    return m.processVideoBgRemove(input, config, onProgress);
  },
  prepare: async (onProgress) => {
    const m = await import('./process-video-bg-remove');
    return m.prepareVideoBgRemoveModel(onProgress);
  },
  isPrepared: () => { /* sync check via module-level variable */ },
  clearLastResult: () => { /* cleanup */ },
  preflightCheck: () => {
    // Schon vorhanden (WebCodecs-Check) — ggf. WebGPU-Check ergänzen
    if (typeof VideoEncoder === 'undefined' || typeof VideoDecoder === 'undefined') {
      return 'Dein Browser unterstützt kein WebCodecs…';
    }
    return null;
  },
},
```

Lazy-Singleton-Pattern wie `loadRemoveBg()` / `loadSpeechEnhancer()` weiter oben im gleichen File.

#### 5. Custom-Component-Dispatch in `[slug].astro`

Analog zu `KiBildDetektorTool` / `AudioTranskriptionTool` — Guard:
```
config.type === 'file-tool' && config.id === 'video-bg-remove'
```
(Lessons-Learned Handoff 1: `config.type === 'formatter'` Guard war beim ersten Handoff
für 2 ML-Tools vergessen worden — **nicht wiederholen**.)

---

## Quality-Bar (alles Pflicht)

### Code

- [ ] Pure-Client — kein Server-Upload, kein Tracking-Ping, kein Telemetrie. Worker-Files bleiben lokal.
- [ ] `@huggingface/transformers` + `mediabunny` — beide schon installiert, **keine neuen Dependencies**
  ohne CEO-Log-Eintrag (MIT oder Apache-2.0 Pflicht, ≤2 MB gzipped, client-only).
- [ ] Keine Hex-Codes in Components — nur Tokens aus `tokens.css`.
- [ ] Keine arbitrary px-Werte in Components — nur Tokens.
- [ ] Keine Emojis in UI-Strings.
- [ ] Lazy-Import-Pflicht (Performance-Mandate §9.1): Worker + ML-Module nie als static import in
  `tool-runtime-registry.ts`. Jeder Import muss hinter `() => import()` leben.
- [ ] `prefers-reduced-motion` Block mit `transition: none` **UND** `transform: none` (global.css
  deckt `transform` nicht ab — Third-Pass-Befund aus Handoff 1).
- [ ] Abort-Path implementiert (Worker `{ type: 'abort' }` + Cleanup).
- [ ] `isPrepared()` korrekt (true nur wenn Modell geladen + gecacht).
- [ ] §7a-6-Bedingungen-Checkliste (aus Design-Spec §3.4) alle erfüllt:
  1. WASM oder WebGPU (keine Server-Inferenz)
  2. Modell lazy-load mit Progress
  3. Worker-Thread (kein Main-Thread-Freeze)
  4. Offline nach First-Load (Cache-API)
  5. Kein Server-Roundtrip
  6. Self-hosted Modelle (kein externer CDN-Runtime-Ping während V1-Dev — beim R2-Prod-Setup Phase 2)

### Tests (`tests/lib/tools/process-video-bg-remove.test.ts`)

- [ ] ≥20 Tests gesamt (die 16 Config-Tests bestehen bereits, 4+ neue für Worker/Runtime)
- [ ] `processVideoBgRemove()` mit Mock-Frame gibt `Uint8Array` zurück (kein throw)
- [ ] `prepareVideoBgRemoveModel()` löst Progress-Callback aus
- [ ] `isVideoBgRemovePrepared()` startet auf `false`
- [ ] `clearVideoBgRemoveLastResult()` resettet State (kein throw)
- [ ] Worker-Abort-Path (simuliert): Worker-Message `{ type: 'abort' }` stoppt Loop
- [ ] preflightCheck returnt string wenn `VideoEncoder` fehlt
- [ ] preflightCheck returnt null wenn `VideoEncoder` + `VideoDecoder` vorhanden
- [ ] Config-Tests (16 bestehende) **weiterhin grün** — nicht brechen!
- [ ] `npx vitest run video-hintergrund-entfernen` → 100 % pass

### Content (`src/content/tools/video-hintergrund-entfernen/de.md`)

Content-File ist schon vorhanden. Vor dem Ship:
- [ ] Frontmatter validiert gegen `tools.schema.ts` (parseDE-Gate)
- [ ] title 30–60 Zeichen: aktuell „Video Hintergrund entfernen — KI, kein Upload" (43 Zeichen) ✓
- [ ] metaDescription 140–160 Zeichen: aktuell 158 Zeichen — prüfen ob noch stimmt
- [ ] headingHtml hat ≤1 `<em>`: aktuell `"Video-<em>Hintergrund</em> entfernen"` ✓
- [ ] howToUse 3–5 Schritte: aktuell 5 ✓
- [ ] faq 4–6 Q/A: aktuell 6 ✓
- [ ] relatedTools kebab-case Slugs: `['hevc-zu-h264', 'hintergrund-entfernen']` — prüfe ob diese Slugs auflösbar sind
- [ ] category: `video` ✓
- [ ] Body: Intro + H2-Sektionen + ≥300 Wörter — schon da (prüfen nicht neu schreiben)

**Wichtig:** Wenn du Diskrepanzen zwischen Content und Spec findest (z.B. Content sagt FullHD-Limit,
Spec §2.2 sagt 4K-Passthrough), **folge dem Content-File** (V1-Scope-Entscheidung) und dokumentiere
die Abweichung vom Spec als CEO-Log-Eintrag.

### Build + Render

- [ ] `npx astro build` durch — Tool unter `/de/video-hintergrund-entfernen/` mit ≥30 KB HTML
- [ ] HTML enthält JSON-LD x4: SoftwareApplication + BreadcrumbList + FAQPage + HowTo
- [ ] Italic-accent H1 mit `<em>` rendert
- [ ] Eyebrow-Pill „Läuft lokal · kein Upload" sichtbar
- [ ] Related-Bar resolvt `hevc-zu-h264` + `hintergrund-entfernen`
- [ ] Astro check — KEINE NEUEN TS-Errors (Baseline: 5 pre-existing in `[slug].astro`)

### Sequential-Pipeline-Compliance

- [ ] Slug-Map registriert (schon vorhanden: `'video-bg-remove': { de: 'video-hintergrund-entfernen' }`)
- [ ] Tool-Registry registriert (schon vorhanden)
- [ ] Custom-Component-Dispatch in `[slug].astro` mit `config.type === 'file-tool' && config.id === 'video-bg-remove'` Guard
- [ ] Append in `docs/completed-tools.md` mit CEO-Notes-Spalte ausgefüllt
- [ ] Append in `tasks/.ceo-tmp/completed.txt`
- [ ] Commit `feat(tools/video): ship video-hintergrund-entfernen` mit Phase-0–F-Body
- [ ] CEO-Decisions-Log-Einträge für Spike-Ergebnisse + alle autonomen Entscheidungen
- [ ] `CONVENTIONS.md §10 MLFileTool-Template` appended (Spike 1.3)

---

## Bekannte Risiken + Fallback-Entscheide (vorab dokumentiert)

### R1 — Mediabunny WebMOutputFormat({ alpha: true }) fehlt

Fallback: `webm-muxer` Paket (MIT, ~15 KB minzipped, pure-client). Die Bibliothek ist ein direkter
Drop-in-Ersatz für VP9+Alpha-WebM-Muxing ohne Mediabunny. CEO-Log-Eintrag erforderlich.
Alternativ: V1 liefert nur Safari-Greenscreen als Transparent-Output, echter VP9-Alpha für Phase 2.

### R2 — BiRefNet_lite nicht via pipeline() erreichbar

Fallback: `Xenova/modnet` (Apache-2.0, ~25 MB, das ist bereits der `speed`-Toggle-Kandidat).
Beide Modelle auf `quality` + `speed` mit MODNet als einzigem Modell shippen, BiRefNet_lite als
Phase-2-Upgrade wenn R2/CDN-Hosting klar ist. CEO-Log.

### R3 — Worker-Overhead zu hoch für kurze Videos

Für Videos < 30 Frames (< 1 s bei 30 fps) ist der Worker-Startup-Overhead größer als die Verarbeitung.
In dem Fall: kein Fallback nötig (Startup ist einmalig, dann persistent). CEO-Log wenn User-Feedback
die 1-Sekunden-Grenze als Problem zeigt.

### R4 — ONNX-Modell-Dateien nicht in /public/models/

V1-Development: Modelle werden zur Runtime von der `onnx-community`-Mirror-URL via
`@huggingface/transformers` geladen (das ist das Standardverhalten von transformers.js).
Explizit kein Self-Hosting-Setup in V1 (das kommt mit R2-CDN in Phase 2).
Kein Blocker für Ship — dokumentiere in CEO-Notes als „Modell-CDN: transformers.js default für V1,
R2-Self-Hosted Phase 2".

---

## Verbotene Aktionen

- Niemals `git push --force`, `git reset --hard`, oder DennisJedlicka-Account.
- Niemals in `.paperclip/work-snapshots/` löschen.
- Niemals File in `inbox/to-user/` schreiben (§0.7 NO-ESCALATION-LOCK).
- Niemals AGPL/GPL/NC-Bibliotheken als Dependencies (`@imgly/*`, `ffmpeg.wasm`, RVM, RMBG-2.0/1.4).
- Niemals COOP/COEP-Header einführen — AdSense-Kompatibilität bricht (Design-Spec §1.2, §4.6).
- Niemals SharedArrayBuffer nutzen — gleicher Grund.
- Niemals das bestehende Config-File (`video-hintergrund-entfernen.ts`) löschen oder umbenennen.
- Niemals die bestehenden 16 Config-Tests löschen oder neu schreiben (sie validieren den Scaffold).
- Niemals `tool-runtime-registry.ts` statische Imports einführen (Lazy-Only — jeder FileToolPage
  würde sonst alle ML-Pakete laden).

## Erlaubte autonome Decisions (mit CEO-Log-Eintrag)

- **Spike-Fallback-Entscheide** (R1–R4 oben) — sofort loggen.
- **V1-Scope-Cut Output-Modi** (Bild+Video auf Phase 2 verschieben wenn Aufwand zu groß).
- **Modell-Toggle-Simplifikation** (nur MODNet wenn BiRefNet_lite-Spike scheitert).
- **Test-Strategy** (Worker-Tests als Mock-Worker statt echter Worker-Instanz, wenn Vitest-Worker-Support Probleme macht).
- **§7.15-Override** wenn rework_counter 2/2 erschöpft → ship-as-is mit Phase-2-Backlog-Eintrag.
- **Park-Decision** falls fundamentale Architektur-Blocker (z.B. beide Spike R1+R2 gleichzeitig rot → Tool braucht andere Tech-Basis).

Niemals stille Aufgabe — entweder ship oder explicit park mit Begründung.

---

## Report-Format (am Ende deiner Session)

Schreibe deinen Report nach `docs/agent-handoff/2026-04-26-finish-video-hintergrund-entfernen-REPORT.md`:

```markdown
---
report_for: 2026-04-26-finish-video-hintergrund-entfernen.md
agent_session: <timestamp_start> bis <timestamp_end>
tools_attempted: 1
tools_shipped: <0 oder 1>
tools_parked: <0 oder 1>
total_commits: <count>
session_duration_minutes: <int>
---

# Report — video-hintergrund-entfernen Session

## Zusammenfassung
<2–3 Sätze: was geschafft, was nicht, ungewöhnliche Entscheidungen>

## Spike-Phase-Bilanz

### Spike 1.0 — Mediabunny VP9+Alpha
- **Ergebnis:** GRÜN | GELB (Fallback: <was>) | ROT (Park: <was>)
- **Details:** <was genau getestet, was gefunden>

### Spike 1.1 — BiRefNet_lite via transformers.js
- **Ergebnis:** GRÜN | GELB | ROT
- **Details:** <Tensor-Shape-Befund, Pipeline-API-Kompatibilität>

### Spike 1.2 — Safari VideoFrame + OffscreenCanvas
- **Ergebnis:** GRÜN | GELB | ROT
- **Details:** <API-Verfügbarkeit, Fallback falls nötig>

### Spike 1.3 — CONVENTIONS.md MLFileTool-Template-Draft
- **Ergebnis:** DONE | SKIPPED (Begründung)
- **Commit-SHA:** <abbreviated>

## Tool-Bilanz

### video-hintergrund-entfernen
- **Status:** shipped | parked | failed
- **Commit-SHA:** <abbreviated>
- **Tests:** <passed>/<total> grün (davon 16 Config-Tests + neue Worker-Tests)
- **Phasen-Bilanz:** Phase-0 (<Spikes-Summary>) / A clean / B clean / C clean / D <details> / E <Pass-1/2/3> / F shipped
- **Quality-Bar:** alle Checkboxen grün? Wenn nein, welche?
- **CEO-Decisions:** keine | <list>
- **Reworks:** 0 | 1 | 2
- **Scope-Cuts für V1:** <z.B. „Bild+Video-BG-Modi auf Phase 2 verschoben">
- **Auffälligkeiten:** <z.B. „BiRefNet_lite-Spike gelb — MODNet als Fallback, CEO-Log">

## Kumulierte Metriken

- **Build-Status final:** `npx astro build` → <pages> Pages
- **Test-Status final:** `npx vitest run` → <passed>/<total>
- **Astro check Delta:** TS-Errors vor vs nach
- **CONVENTIONS.md MLFileTool-Section:** ja / nein

## CEO-Decisions-Log Diff
<welche Einträge ergänzt>

## Was offen blieb (falls etwas)
<Liste mit Begründung>

## Verifikation (für Claude/CEO)

```bash
git log --oneline <handoff-base-sha>..HEAD
npx vitest run --reporter=basic 2>&1 | tail -3
npx astro build 2>&1 | tail -3
grep -c "^| \[" docs/completed-tools.md
test -f dist/de/video-hintergrund-entfernen/index.html && echo "page built"
grep "video-bg-remove" src/lib/tools/tool-runtime-registry.ts | grep -v throw
```
```

---

## Wenn du fertig bist

1. Letzten Commit nicht pushen (User entscheidet wann)
2. Report-Datei schreiben unter dem Pfad oben
3. Dem User mitteilen: „Report fertig unter `docs/agent-handoff/2026-04-26-finish-video-hintergrund-entfernen-REPORT.md`. Bitte an Claude weiterleiten zur Verifikation."
4. Session beenden

## Wenn du blockiert bist

- **Spike R1+R2 beide ROT** → Park-Decision (Tool braucht andere Tech-Basis), Report schreiben,
  Session beenden. Keine guessing-Implementierung.
- **3+ Reworks in Phase D** → §7.15-Override ship-as-is + Phase-2-Backlog, nicht weiter reworken.
- **Worker-API in Vitest nicht verfügbar** → Mock-Worker-Pattern (Web Worker Class-Mock), dokumentieren.
- **Build-Regression** → `git revert <sha>`, dokumentieren, Tool ggf. parken.

---

**Start-Befehl an dich:** „Lies diesen Brief vollständig + die 12 Pflicht-Files. Beginne mit Phase 0
(4 Spike-Verifikationen, ~90 Min). Nach allen GRÜN-Spikes: Phase A–F. Liefer am Ende den Report."

— Claude (CEO-Handoff, post Phase-2-Sonderdelegation 2026-04-26)
