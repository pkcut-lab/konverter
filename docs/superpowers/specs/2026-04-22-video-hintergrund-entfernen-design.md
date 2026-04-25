# Video-Hintergrund entfernen — Design Spec

**Status:** Draft v1 (2026-04-22, nach Deep-Research Subagent-Duo 2026-04-21/22)
**Slug (DE):** `/de/video-hintergrund-entfernen`
**Tool-ID:** `video-hintergrund-entfernen`
**Tool-Type:** `file-tool` (§7a-Ausnahme)
**Enum:** `video`
**Tier:** 8f
**Phase-Zuordnung:** Phase 2 (zweites Video-Tool nach `hevc-zu-h264`, erstes ML-File-Video-Tool — §7a-Template-Lock)
**Spec-Author:** Claude (Opus 4.7)
**Research-Quellen:**
- `docs/superpowers/plans/2026-04-21-video-bg-remover-differenzierungs-check.md` (Markt + User-Wishes + Trends)
- `docs/superpowers/plans/2026-04-22-video-matting-model-license-research.md` (Lizenz + Qualitäts-Benchmark)

---

## 1. Zweck und Kontext

### 1.1 Die User-Pain in einem Satz

> *„Unscreen ist tot (01.12.2025), Kapwing und VEED wollen Login + Watermark + Upload, Runway kostet $12/mo, und ich will mein Baby-Video nicht auf einen US-Server schieben."*

Das ist ein DE-SEO-Evergreen (`video hintergrund entfernen`, `unscreen alternative`, `video transparent machen`) mit **strukturellem Nachfrage-Peak seit Unscreen-Shutdown**. Jeder Mainstream-Konkurrent setzt auf Cloud-Upload + Paywall + Watermark + Login. Das White-Space-Fenster „100 % pure-client, kein Login, kein Watermark, DSGVO-by-design" ist bewiesen offen (Research-Report §2).

### 1.2 Spec-Kontext

Multilinguale Astro-5-SSG, AdSense ab Phase 2, Karpathy-Disziplin. Parent-Spec: `docs/superpowers/specs/2026-04-17-konverter-webseite-design.md` v1.1.

**Relevante Constraints:**
- **Privacy-First** (NN #2): kein Server-Upload, kein Telemetrie-Ping.
- **NN #7 / Ausnahme 7a:** ML-File-Tool mit Worker-Fallback — greift hier **aktiv**. Alle 6 Sub-Bedingungen müssen erfüllt sein (siehe §4.1 Checkliste).
- **NN #5 (AdSense-kompatibel):** kein SharedArrayBuffer, kein COOP/COEP-Header. Das schließt `ffmpeg.wasm` aus (wie bei `hevc-zu-h264`). Mediabunny + WebCodecs + WebGPU kommen ohne COOP/COEP aus.
- **EU-AI-Act ab 02.08.2026:** KI-manipulierte Videos müssen gekennzeichnet werden (§8). Unser Tool manipuliert Frames → UI-Disclaimer + optionales Metadata-Tag im Output.
- **Refined-Minimalism-Aesthetic:** Graphit-Tokens, Inter + JetBrains Mono, Hard-Caps (CLAUDE.md §5).

### 1.3 Doppelter Hebel

1. **User-Traffic:** Unscreen-Refugees + YouTube/TikTok/Instagram-Creator + deutsche Datenschutz-sensitive Power-User. Subagent-Quote (HN, April 2026, VidStudio-Thread): *"doesn't upload your files"* ist der Traffic-Hebel 2026.
2. **§7a-Template-Lock:** dies ist das **erste ML-File-Video-Tool**. Die Architektur (Lazy-Model-Download + Progress + WebGPU-Pipeline + Mediabunny-Encoder) wird in `FileTool.svelte` + neuem `MLFileTool.svelte`-Wrapper gelockt, damit spätere Tools (Video-Upscaler, Motion-Blur-Remove, etc.) auf demselben Fundament bauen.

---

## 2. User-Story und MVP-Scope

### 2.1 Primary User Story

> **Als** Content-Creator mit einem Person-Video,
> **möchte ich** den Hintergrund entfernen oder durch Farbe/Bild/Video ersetzen,
> **ohne** Upload, Login, Watermark oder Paywall,
> **damit** das Ergebnis in mein Compositing-Workflow passt und meine Daten meinen Rechner nie verlassen.

### 2.2 MVP-Scope (V1)

**Drin:**
- **Single-File-Drop** (eine Datei pro Konvertierung).
- **Input-Formate:** `video/mp4`, `video/quicktime` (MOV), `video/webm`, plus Endungs-Fallback. Vor-Encoding als H.264/HEVC/VP9/AV1 egal — WebCodecs dekodiert das browser-nativ.
- **Output-Modi (Radio-Buttons):**
  - `Transparent` → WebM+VP9+Alpha (Chrome/Firefox/Edge) · MP4+Greenscreen-Key `#00FF00` (Safari/iOS Fallback). Browser-Detect im Preflight.
  - `Einfarbig` → User wählt Farbe (Color-Picker, Default Weiß), Background wird mit Farbe gefüllt, MP4-H.264-Output.
  - `Bild` → User wählt JPG/PNG als BG, wird auf Video-Auflösung gefittet (`cover`), MP4-Output.
  - `Video` → User wählt zweites Video als BG, geloopt auf Source-Dauer, MP4-Output.
- **Max File-Size:** **soft-limit 500 MB, hard-warn ab 1 GB** (mit Soft-Warning bei langer Dauer statt Hard-Cap — User-Wishes §B). UI: transparente Zeit-Schätzung *„ca. 4-8 Min Verarbeitung auf mittlerem Laptop"*.
- **Resolution-Passthrough:** 4K-Input → 4K-Output. Kein Downscale-Default (Differenzierung — Konkurrenten downscalen still auf 720p).
- **Modell-Toggle:** `Qualität` (BiRefNet_lite, Default) · `Schnell` (MODNet, für schwache Geräte/lange Videos). Single-Radio-Button, nicht Advanced-Panel.
- **Progress-Reporting:** zweistufig — `Modell wird geladen… 42 %` (First-Load Weights-Download) · `Frame 128 / 2400 · ETA 03:24` (Encoding-Phase).
- **WebGPU-Preflight:** bei Nicht-Support → CPU-Fallback (onnxruntime-web WASM, Warning *„deutlich langsamer"*).
- **Single-Download** via `<a download>` (Blob-URL).
- **EU-AI-Act-Disclaimer** als subtile Zeile im `done`-State: *„Dieses Video wurde mit KI bearbeitet (Hintergrund entfernt/ersetzt)."* Kein Modal, keine Checkbox-Pflicht — als Info-Zeile neben Download-Button.
- **PNG-Sequenz-Export** als Zweit-Button im `done`-State (Differenzierung §B#4): ZIP mit Einzelframes `frame_0001.png` etc. für Post-Production-Workflows.

**Explizit aus V1 gestrichen:**
- Multi-File-Batch (V1.1).
- Clip-Trim / Start-End-Cut (eigenes Tool).
- Multi-Object-Tracking (Prompts / Clicks) — SAM-3-Pfad erst Phase 5 falls Lizenz-Landschaft sich ändert.
- KI-generierter Hintergrund (Deepfake-Labeling-Risiko + Refined-Minimalism-Break).
- Audio-Denoise / Auto-Captions (Scope-Creep, separate Tools).
- Chroma-Key-Manual-Tuning (Farbe/Schwelle picken) — das ist „Chroma-Key-Tool", nicht „KI-BG-Remove".
- Live-Webcam-Eingabe — das ist `webcam-hintergrund-unschaerfe` (Tier 8f, separate Spec).
- Edge-Feather/Matte-Refinement-Slider — Post-Processing-Feature, V1.1 falls User-Feedback triggert.

**Begründung Scope-Cut:** Surgical-Changes + YAGNI. V1-Ziel = **Happy-Path Transparent-Export + Image-BG-Replace validiert**, §7a-Template-Lock dokumentiert.

### 2.3 Tech-Choice-Entscheidung (HART)

**Entscheidung (gelockt 2026-04-22, lückenlos MIT/Apache):**

| Layer | Choice | Lizenz | Begründung |
|---|---|---|---|
| Encoding/Decoding | **Mediabunny** | MPL-2.0 | Bewiesen funktionierend aus `hevc-zu-h264`-Session, streaming, WebCodecs-nativ, AdSense-kompatibel |
| ML-Inferenz | **onnxruntime-web 1.23+** | MIT | WebGPU-EP + WASM-CPU-Fallback, Transformers.js v3 dokumentiert |
| Default-Modell | **BiRefNet_lite** (`onnx-community/BiRefNet_lite-ONNX`) | MIT Code + MIT Weights + MIT Training-Data | SOTA Haar/Fell-Matting ACCV 2024, ~50 MB ONNX |
| Speed-Toggle-Modell | **MODNet** (`Xenova/modnet`) | Apache-2.0 | Real-time WebGPU-Performance bewiesen, ~25 MB |
| Fallback-Modell (V1.1 falls Flicker) | **BEN2 Base** | MIT | Native Video-API + Confidence-Refiner |
| Alpha-Export Chrome/FF | WebCodecs `VideoEncoder` VP9+Alpha → WebM-Muxer | — | Browser-nativ, kein COOP/COEP |
| Alpha-Export Safari | H.264 + Greenscreen-Key `#00FF00` → MP4 | — | Safari kennt kein VP9-Alpha (WebCodecs Issue #377) |

**Ausgeschlossen (Research-Report dokumentiert):**
- RVM (GPL-3.0) · MatAnyone 2 (NTU S-Lab NC) · Sapiens (CC-BY-NC) · RMBG-2.0/1.4 (CC-BY-NC) · `@imgly/background-removal` (AGPL viral) · SAM 3 (Custom License Redistributions-Pflicht).

**Self-Hosted-Pfad (§7a-konform):**
- Modelle in `/public/models/birefnet_lite.onnx` + `/public/models/modnet.onnx`, bundled in Build-Output.
- CDN: Cloudflare R2 (`models.konverter.…/…`), kein externer Hugging-Face-Runtime-Ping.
- First-Load: Model lazy via `fetch()` + Cache-API → offline nach First-Use.

**Main-Thread vs. Worker:** Im Gegensatz zu `hevc-zu-h264` (V1 Main-Thread) läuft die ML-Inferenz **zwingend im Web-Worker** — onnxruntime-web-WebGPU-EP kann den Main-Thread für 200-800 ms pro Frame blockieren, was bei 2400-Frames-Video zu 20+ Min UI-Freeze führen würde. Worker-Setup ist hier nicht optional.

### 2.4 Differenzierung (HART, gemäß CLAUDE.md §6)

> **Recherche-Quellen:** Zwei Subagent-Reports 2026-04-21/22. Competitor-Matrix (9 Konkurrenten), User-Wishes aus HN/Reddit/Trustpilot 2024-2026, 2026-Trends (WebGPU-Mainstream, SAM-3, EU-AI-Act, Unscreen-Shutdown), Lizenz-Landschaft 17 Modelle geprüft.

#### Wettbewerbs-Befund (Kurz)

| Konkurrent | URL | USP | Privacy | Schwäche |
|---|---|---|---|---|
| [Kapwing](https://www.kapwing.com/tools/remove-background) | Team-Editor + BG-Modul | GDPR-Claim | US-Server-Upload | Watermark free, $24/mo Pro für 1080p + no-WM, 3-Tage-Retention |
| [Runway](https://runwayml.com) Green Screen | Gen-3/4 „Magic Tool" | — | US-Server | Watermark + $12/mo Standard, 125 Credits |
| [VEED](https://www.veed.io/tools/video-background-remover) | Full-Editor | GDPR-Claim | UK/US-Upload | Watermark free, Login-Push |
| [Vidnoz](https://www.vidnoz.com/ai-solutions/video-background-remover.html) | "Kostenlos & unbegrenzt" | — | China-HQ-Upload | 5-Sek-Preview only, Sign-up für mehr |
| [videobgremover.com](https://videobgremover.com) | PAYG Long-Video | — | Cloud | $2.50-$4.80/min |
| [removebgvideo.com](https://removebgvideo.com) | Schlank PAYG | — | Cloud | $1.50/min |
| [Flixier](https://flixier.com) | Cloud-Editor | — | Cloud | 10-Min-Monat-Cap, Watermark |
| [CapCut Web](https://www.capcut.com/tools/video-background-remover) | Template-Bibliothek | — | ByteDance-Cloud (Datenfluss-Risiko) | Pro-only erweiterte BG, Login-Pflicht |
| ~~Unscreen~~ | geschlossen 01.12.2025 | — | — | **Hinterlässt die Lücke, die wir füllen** |

**Schlüsselbefund:** Alle Top-Ranker sind cloud-based. Pure-Client-Space ist **leer** (keine spezialisierten BG-Video-Tools, nur generische Editor-Frameworks wie Klippy/Omniclip). Unscreen-Shutdown hat Traffic-Verteilung in Bewegung gebracht — jetzt ist der Moment.

#### A. Baseline-Features (Mindest-Scope)

1. Auto-Person-BG-Remove ohne Greenscreen.
2. Transparenter Output (WebM+Alpha oder MP4+Greenscreen).
3. BG-Replace: Farbe · Bild · Video.
4. Preview-Canvas vor Export.
5. 1080p + 4K-Support.
6. Drag-&-Drop + File-Input.

→ Alle in V1 (§2.2).

#### B. Differenzierungs-Features

1. **100 % pure-client, null Upload** — kein einziger spezialisierter Konkurrent tut es (nur generische Editor-Frameworks wie Klippy/Omniclip). HN-VidStudio-Thread April 2026 belegt: *"doesn't upload your files"* ist der dominante Traffic-Hebel.
2. **Kein Login, kein Watermark, kein Paywall, kein Credit-System** — alle 8 aktiven Konkurrenten verletzen mindestens eine dieser vier Achsen. User-Wishes-Zitat (Digen.ai 2026): *"many tools claim to be 'free,' but then limit uploads or force logins for credits"*.
3. **Ehrliche Zeit-Schätzung + Soft-Warning statt Hard-Limit** — Konkurrenten nutzen intransparente Credit-Systeme oder Hidden-Preview-Traps. Wir kommunizieren offen: *„4K × 90 s dauert ca. 8-12 Min. Okay, los?"* (Info-Zeile, kein Modal).
4. **PNG-Sequenz-ZIP-Export** — nur videobgremover.com hat's (proprietär, Cloud). Wir liefern es als zweiten Download-Button, ohne zusätzliche Wartezeit (Frames fallen während der Inferenz eh an).
5. **DSGVO-by-design + „Dein Video verlässt nicht dein Gerät"-Marketing** — unter EU-AI-Act ab 08/2026 + deutschem Markt maximaler Trust-Hebel. Konkurrenten können Cloud-Dependency strukturell nicht loswerden.
6. **4K-Passthrough + MIT-Weights-Transparenz** — Konkurrenten downscalen still auf 720p/1080p. Wir behalten 4K + dokumentieren die Modell-Lizenz (BiRefNet MIT) in der FAQ als Trust-Signal.
7. **Zwei-Modus-Toggle (Qualität/Schnell)** — User darf zwischen BiRefNet (SOTA Haar) und MODNet (real-time, weniger Haar-Detail) wählen. Konkurrenten bieten keine Modell-Wahl, nur Black-Box-Auto.
8. **Tool-Chain-Hint im Done-State:** Link zu `/de/hevc-zu-h264` (für iPhone-Output-Fixing) und `/de/webcam-hintergrund-unschaerfe` (für Live-Zoom-Calls). Ökosystem-Moat analog BG-Remover → WebP-Konverter → HEVC.
9. **Schema.org-Markup** (`SoftwareApplication` + `HowTo` + `FAQPage`) mit expliziter *„kein Upload"* + *„WebGPU erforderlich"*-Answer-Strings. AEO-Optimierung für Perplexity/ChatGPT-Citations.
10. **EU-AI-Act-Compliance von Tag 1** — subtile KI-Kennzeichnung im `done`-State + optionales Metadata-Tag `com.konverter.ai_modified=true` im Output. Konkurrenten reden über AI-Act, labeln aber nicht. Wir sind rechts-konform **bevor** die Pflicht (02.08.2026) greift.

#### C. Bewusste Lücken (NICHT bauen + Begründung)

| Feature | Warum NICHT in V1 |
|---|---|
| Multi-File-Batch | V1-Scope-Schutz. Re-evaluiert Phase 2 nach User-Feedback. |
| Clip-Trim (Start/End) | Editor-Feature. Eigenes Tool oder V2. |
| SAM-3-Multi-Object-Prompts | Lizenz-Ambiguität (Custom-License Redistributions-Pflicht) + YAGNI für Launch. Re-evaluiert Phase 5 falls Meta-Lizenz-Update. |
| KI-generierter Hintergrund | Deepfake-Labeling-Risiko + Refined-Minimalism-Break. Nicht unser Spiel. |
| Team/Collab-Mode | AdSense-nicht-SaaS-Monetarisierung. |
| Audio-Denoise / Auto-Captions | Scope-Creep, separate Tools. |
| Mobile-App-Wrapper | Web-only Strategie. Progressive-Web-App via existing PWA-Manifest reicht. |
| Edge-Feather-Slider / Matte-Refinement | Post-Processing-UI-Inflation. V1.1 falls User-Feedback >5 unabhängige Requests. |
| Chroma-Key-Manual-Tuning | Separates Tool („Chroma-Key"), nicht „KI-BG-Remove". |
| Aktive Quality-Warnung bei Haaren/Transparenz | User-Wahl (Qualität/Schnell-Toggle) regelt das — keine Pre-Encode-Friktion. |

#### D. Re-Evaluation-Trigger

- **Phase 2 Analytics (1 Monat nach Launch):** Conversion pro Modus (Transparent/Farbe/Bild/Video), Drop-off-Point, Fehler-Quote pro Browser, WebGPU-Support-Quote.
- **Safari-Export-Share:** wenn >20 % Safari-Nutzer und Greenscreen-Fallback als Qualitäts-Problem auftaucht → AV1+Alpha-Landschaft prüfen (Ende 2026).
- **User-Feedback-Threshold:** >5 unabhängige Requests nach Batch / Trim / Edge-Refinement → eigene Phase-2.x-Session.
- **Modell-Landschaft Q4 2026:** MatAnyone-3 oder SAM-4 mit permissiver Lizenz? BiRefNet-Video-Variante? → Modell-Swap evaluieren.
- **EU-AI-Act 08/2026 In-Kraft:** Labeling-Anforderungen konkret geworden → UI-Disclaimer + Metadata-Tag nachziehen falls strenger.
- **BiRefNet-Flicker-Rate:** wenn >5 % Export-Failures oder User-Feedback-Cluster *„flimmert"* → BEN2-Swap oder Edge-Smoothing-Post-Filter implementieren.

---

## 3. Komponenten

### 3.1 `src/components/tools/MLFileTool.svelte` *(neu — Wrapper über `FileTool`)*

Neue Template-Schicht für §7a-ML-File-Tools. Wrappt `FileTool.svelte` und fügt hinzu:
- **Zweistufiger Progress:** `model-loading` (Weights-Download + Cache) vor `converting` (Frame-Inferenz).
- **WebGPU-Preflight:** `navigator.gpu?.requestAdapter()` mit Timeout 3 s. Bei Nicht-Support → Warning-Zeile + Fallback auf WASM-CPU-EP (onnxruntime-web).
- **Model-Cache-Check:** `caches.match(modelUrl)` — wenn schon gecacht, skip `model-loading`-State direkt zu `converting`.
- **Abort-Button** während `converting` (lange Prozesse → User-Kontrolle Pflicht, Worker-postMessage-Abort).

State-Machine:
```
idle ──drop──> preparing ──ok──> model-loading ──ok──> converting ──ok──> done ──reset──> idle
                  │                    │                  │              │
                  └──fail──> error     └──fail──> error   └──fail──> error
                                       │
                                       └──cache-hit──skip──> converting
```

**Template-Lock-Candidate:** nach User-Smoke-Test → `CONVENTIONS.md` Section „MLFileTool-Template" als Parent für `video-upscaler`, `motion-blur-remove`, etc.

### 3.2 `src/lib/tools/video-hintergrund-entfernen.ts` *(neu — Tool-Config)*

```ts
import type { MLFileToolConfig } from './schemas';

export const videoHintergrundEntfernen: MLFileToolConfig = {
  id: 'video-hintergrund-entfernen',
  type: 'ml-file-tool',
  categoryId: 'video',
  iconPrompt:
    'Pencil-sketch icon of a person-silhouette on a striped checkered-transparency ' +
    'background, single-weight hand-drawn strokes in monochrome graphite gray, ' +
    'no shading, no fill, transparent background, minimalist line art, square aspect.',
  accept: ['video/mp4', 'video/quicktime', 'video/webm'],
  maxSizeMb: 500,
  softLimitMb: 1000,
  filenameSuffix: '_no_bg',
  defaultFormat: 'webm', // VP9+Alpha; Safari-Fallback via preflight
  models: {
    quality: {
      url: '/models/birefnet_lite.onnx',
      sizeMb: 50,
      name: 'BiRefNet_lite',
      license: 'MIT',
    },
    speed: {
      url: '/models/modnet.onnx',
      sizeMb: 25,
      name: 'MODNet',
      license: 'Apache-2.0',
    },
  },
  defaultModel: 'quality',
  process: () => { throw new Error('runtime-only'); },
};
```

### 3.3 `src/lib/tools/process-video-bg-remove.ts` *(neu — Worker-Modul)*

Läuft **zwingend im Web-Worker** (`src/workers/video-bg-remove.worker.ts`). Main-Thread postMessaged File + Config, Worker streamt Progress + Output-Chunks zurück.

**Pipeline-Skizze (Pseudo-Code, genaue API in Task 1.0-Spike):**
```ts
// Worker-Context
import * as mb from 'mediabunny';
import * as ort from 'onnxruntime-web/webgpu';

export async function processVideoBgRemove(
  input: Uint8Array,
  config: { modelUrl: string; outputMode: OutputMode; bgColor?: string; bgImage?: Uint8Array; bgVideo?: Uint8Array },
  onProgress: (phase: 'model' | 'frame', value: number, meta?: { frameIdx: number; totalFrames: number }) => void,
): Promise<{ video: Uint8Array; pngSequence?: Blob[] }> {
  // 1. Modell laden (aus Cache oder fetch)
  onProgress('model', 0);
  const session = await ort.InferenceSession.create(config.modelUrl, { executionProviders: ['webgpu', 'wasm'] });
  onProgress('model', 1);

  // 2. Input dekodieren (Frame-Stream)
  const source = new mb.BufferSource(input);
  const inputFile = new mb.Input({ source, formats: mb.ALL_FORMATS });
  const videoTrack = await inputFile.getPrimaryVideoTrack();
  const audioTrack = await inputFile.getPrimaryAudioTrack();
  const totalFrames = videoTrack.frameCount;

  // 3. Output vorbereiten (Transparent = WebM+VP9+Alpha; sonst MP4+H.264)
  const target = new mb.BufferTarget();
  const output = new mb.Output({
    target,
    format: config.outputMode === 'transparent'
      ? new mb.WebMOutputFormat({ alpha: true })
      : new mb.Mp4OutputFormat(),
  });

  // 4. Frame-Loop: decode → inference → compose → encode
  const pngSequence: Blob[] = [];
  let frameIdx = 0;
  for await (const frame of videoTrack.framesIterator()) {
    const alphaMask = await runInference(session, frame); // ONNX
    const composedFrame = composeFrame(frame, alphaMask, config); // Canvas-Composite
    await output.encodeFrame(composedFrame);
    if (config.exportPngSequence) {
      pngSequence.push(await frameToPng(composedFrame));
    }
    frameIdx++;
    onProgress('frame', frameIdx / totalFrames, { frameIdx, totalFrames });
    frame.close();
  }

  // 5. Audio durchreichen (Copy, kein Re-Encode)
  if (audioTrack && config.outputMode !== 'transparent') {
    await output.copyAudioTrack(audioTrack);
  }

  await output.finalize();
  return { video: target.buffer, pngSequence: config.exportPngSequence ? pngSequence : undefined };
}
```

**Edge-Smoothing (V1.1-Ready, nicht V1):** Exponential Moving Average der Alpha-Masken über letzte 3 Frames (`alpha[t] = 0.7 * current + 0.3 * alpha[t-1]`). Stub-Kommentar im Code, Default-off.

### 3.4 §7a-6-Bedingungen-Checkliste

Aus CLAUDE.md Non-Negotiable #7a (ML-File-Tools mit Worker-Fallback):

| # | Bedingung | Erfüllung |
|---|---|---|
| 1 | WASM oder WebGPU (keine Server-Inferenz) | ✅ onnxruntime-web WebGPU-EP + WASM-CPU-Fallback |
| 2 | Modell <50 MB **ODER** lazy-load mit Progress | ✅ BiRefNet_lite ~50 MB lazy-load mit Progress-UI · MODNet ~25 MB |
| 3 | Worker-Thread (kein Main-Thread-Freeze) | ✅ `src/workers/video-bg-remove.worker.ts` Pflicht |
| 4 | Offline nach First-Load (Cache-API) | ✅ Model via `caches.match()` gecacht, WebCodecs + ort offline |
| 5 | Kein Server-Roundtrip zur Runtime | ✅ 100 % pure-client, keine Telemetrie, keine externen API-Calls |
| 6 | Self-hosted Modelle (keine CDN-Runtime-Pings) | ✅ `/public/models/*.onnx` + R2-CDN als Static-Asset, kein HuggingFace-Runtime |

---

## 4. Bekannte Risiken / Hardware-Grenzen

### 4.1 Memory (4K × lange Videos)

4K-Frames in RGBA = 33 MB pro Frame. Batch-Load von 67 Frames (~2 s 30 fps) = 2.2 GB RAM → OOM auf Safari/iOS.

**Mitigation:** **Streaming-Pipeline** (Frame-by-Frame via `framesIterator()`), max 2 Frames gleichzeitig im Speicher (current + previous für potential edge-smoothing). RAM-Footprint konstant ~80 MB über alle Video-Längen.

### 4.2 WebGPU-Browser-Support

- Chrome 113+ · Edge 113+ · Safari 17.4+ · Opera 99+ ✅
- Firefox 130+ Desktop (WebGPU-Flag seit 141 default) ✅
- Firefox Android ⚠ (experimentell bis Q4 2026 erwartet)
- iOS Safari < 17.4 ✗ → CPU-Fallback mit Warning *„Dein Browser unterstützt kein WebGPU. CPU-Modus ist aktiv — Verarbeitung dauert 3-5× länger."*

### 4.3 VP9+Alpha Browser-Gap (Safari)

Safari dekodiert kein VP9-Alpha (WebCodecs Issue #377, Stand April 2026). Safari-Nutzer bekommen **MP4 + Greenscreen-Key `#00FF00`** statt echter Alpha. UI-Copy im Output-Mode-Selector: *„Transparent (WebM+Alpha) — Safari erhält Greenscreen-Fallback"*.

### 4.4 BiRefNet-Flicker (Haar-Grenzen)

Image-Modelle haben keine Temporal-Consistency. Haar-Grenzen können zwischen Frames um 1-2 Pixel wackeln. V1: **dokumentiert in FAQ + Modell-Toggle `Qualität`/`Schnell`** als User-Wahl. V1.1-Candidate (falls User-Feedback triggert):
- Edge-Smoothing-Filter (EMA über 3 Frames)
- BEN2-Swap (native Video-API + Confidence-Refiner)
- MatAnyone-Wrapper (falls Lizenz-Landschaft sich ändert)

### 4.5 Model-Weights-Download-Verhalten

First-Load: ~50 MB (BiRefNet_lite) oder ~25 MB (MODNet). Auf 100 Mbit Leitung ~4 s / 2 s — **nicht unsichtbar**. UI Pflicht: Progress-Bar mit MB-Zahl + ETA-Schätzung. Cache-API sorgt dafür, dass Second-Load instant ist. Cache-Miss-Recovery: bei Cache-Eviction re-download mit selber UI.

### 4.6 AdSense-Kompatibilität

Kein SharedArrayBuffer, kein COOP/COEP. onnxruntime-web läuft mit `wasm`-EP ohne COOP/COEP (WASM-Threads werden mit `numThreads=1` gestartet — Performance-Einbuße vs. multi-threaded, aber AdSense-kompatibel). WebGPU-EP braucht keine COOP/COEP. ✅ Ad-Revenue in Phase 2 möglich.

### 4.7 EU-AI-Act-Grenzfall

„Background replaced" ist **Grenzfall zu „deepfake"**. Nicht eindeutig klassifiziert. Mitigation:
- Subtile KI-Kennzeichnung im `done`-State: *„Dieses Video wurde mit KI bearbeitet."*
- Optionales Metadata-Tag `com.konverter.ai_modified=true` im Output (User kann's in Export-Settings deaktivieren für eigene Kenntlichmachung).
- FAQ-Entry *„Ist das ein Deepfake?"* mit juristisch konservativer Antwort.
- **Re-evaluation 02.08.2026** nach In-Kraft-Treten der AI-Act-Labeling-Pflicht.

---

## 5. Testing

### 5.1 Unit

- `composeFrame()`-Tests (RGBA-Alpha-Mixing, BG-Modi, Greenscreen-Fallback-Farbe).
- `selectOutputFormat(userAgent, mode)`-Tests (Safari→MP4, Chrome→WebM, Edge-Cases).
- `estimateTotalTime(frameCount, modelChoice, gpu?)`-Tests (ETA-Kalibrierung).

### 5.2 Integration

- Mediabunny + onnxruntime-web WebGPU mit Mock-ONNX-Session.
- Worker-postMessage-Abort-Path (User klickt Stop).
- Cache-API-Hit vs. Miss (First- vs. Second-Load).

### 5.3 Manual Smoke

- Chrome 113+ Desktop · Safari 17.4+ · Firefox 141+ · Edge 113+
- 720p × 10 s (Sanity) · 1080p × 30 s (Realität) · 4K × 60 s (Stress) · 4K × 5 min (Endurance)
- Transparent + Farbe + Bild + Video BG-Modi
- Modell-Toggle Qualität ↔ Schnell
- Abort während Encoding
- PNG-Sequenz-Export
- Mobile: iOS Safari 17.4 + Android Chrome (WebGPU) + Android Firefox (CPU-Fallback-Path)

### 5.4 License-Audit (one-shot vor Release)

- `npm ls --prod` — keine AGPL/GPL/NC-Transitives.
- Verify `/public/models/*.onnx` SHA256 matched HF-Mirror-Hash.
- Verify FAQ-Page listet Modell-Namen + Lizenz-Strings.

---

## 6. Release-Kriterien

**Pflicht für V1-Release:**
- [ ] §7a-6-Bedingungen-Checkliste alle ✅ (§3.4)
- [ ] 4 Browser-Smoke-Tests grün (Chrome/Safari/Firefox/Edge)
- [ ] 4K × 60 s Durchlauf erfolgreich (≤12 Min Verarbeitung auf M2/RTX 3060-Klasse)
- [ ] Transparent-Output (WebM+Alpha) validiert in Chrome + DaVinci Resolve (Round-Trip)
- [ ] Safari-Greenscreen-Fallback validiert mit Chroma-Key-Removal in FCP/Premiere
- [ ] EU-AI-Act-Disclaimer + Metadata-Tag funktionsfähig
- [ ] Abort-Button funktioniert
- [ ] License-Audit grün
- [ ] AdSense-Kompatibilitäts-Check: `navigator.userAgent`-probe + AdSense-Slot rendert in Dev-Build ohne COOP/COEP-Blockade
- [ ] FAQ + Schema.org-Markup live
- [ ] PROGRESS.md updated
- [ ] CONVENTIONS.md `MLFileTool-Template`-Section appended

**Nicht-Pflicht (V1.1-Kandidaten):**
- Edge-Smoothing-EMA-Filter
- BEN2-Fallback-Swap
- Batch-Upload
- Clip-Trim

---

## 7. Aus Scope (V1)

Siehe §2.2 Scope-Cut + §2.4 C. Wichtigste Ausschlüsse zur Erinnerung:
- Kein Multi-File-Batch
- Kein Clip-Trim
- Kein SAM-3-Multi-Object (Lizenz)
- Kein KI-generierter BG (Deepfake-Risiko + Aesthetic-Break)
- Keine Live-Webcam-Eingabe (→ `webcam-hintergrund-unschaerfe`, separate Spec)
- Keine AGPL/GPL-Bibliotheken (`@imgly/*`, RVM)

---

## 8. Datenschutz / Recht

### 8.1 DSGVO

- **Keine personenbezogenen Daten auf Server.** Video-Datei bleibt im Browser-RAM + Worker. Output-File lokal via Blob-URL.
- **Keine Cookies** außer Tool-State (`localStorage` für Modell-Toggle-Präferenz, opt-in, kein Tracking).
- **AdSense ab Phase 2:** Consent-Banner regelt. Ohne Consent keine Ads, Tool funktioniert voll.
- **Datenschutzerklärung-Anker** auf Tool-Seite: *„Dieses Tool verarbeitet dein Video ausschließlich in deinem Browser. Es wird nichts hochgeladen."*

### 8.2 EU-AI-Act (02.08.2026 Labeling-Pflicht)

- **Im `done`-State:** Subtile Zeile *„Dieses Video wurde mit KI bearbeitet (Hintergrund entfernt/ersetzt)."*
- **Im Output-File (optional, Default on):** Metadata-Tag `com.konverter.ai_modified=true` (MP4: `udta` Box, WebM: `Tags` Element). User kann's deaktivieren (→ Selbstverantwortung für Kenntlichmachung).
- **FAQ-Entry** *„Muss ich das Video kennzeichnen?"* mit juristisch konservativer Antwort (Hinweis auf EU-AI-Act + Empfehlung zur sichtbaren Kennzeichnung).

### 8.3 Modell-Lizenzen (Transparenz)

FAQ-Entry *„Welche Modelle nutzt ihr?"*:
- **BiRefNet_lite** (MIT License, ZhengPeng 2024) — [GitHub](https://github.com/ZhengPeng7/BiRefNet)
- **MODNet** (Apache License 2.0, ZHKKKe 2020) — [GitHub](https://github.com/ZHKKKe/MODNet)
- **onnxruntime-web** (MIT License, Microsoft) — [GitHub](https://github.com/microsoft/onnxruntime)
- **Mediabunny** (Mozilla Public License 2.0, Vanilagy) — [GitHub](https://github.com/Vanilagy/mediabunny)

### 8.4 Patent-Exposure

- **H.264-Encode via WebCodecs:** MPEG-LA-Lizenz liegt beim Browser-Hersteller (wie bei `hevc-zu-h264`).
- **VP9-Encode:** royalty-free.
- **WebM-Container:** royalty-free.
- **Keine eigene Lizenz-Pflicht unsererseits.**

---

## 9. Offene Tasks vor Dispatch

1. **Task 1.0 — Mediabunny-Video-BG-API-Spike** (1-2 h): verifizieren dass `Output.encodeFrame()` + `WebMOutputFormat({ alpha: true })` wie geplant funktioniert. Fallback: manuelle VP9-Alpha-Muxing via `webm-muxer`.
2. **Task 1.1 — BiRefNet_lite ONNX-Shape-Spike** (30 Min): Input-Tensor-Layout (NCHW vs. NHWC), Output-Mask-Range (0-1 oder 0-255) gegen `onnx-community`-Mirror verifizieren.
3. **Task 1.2 — Safari VideoFrame-Compat-Test** (30 Min): `VideoFrame` + Canvas-Composition auf Safari 17.4 testen.
4. **Task 1.3 — CONVENTIONS.md MLFileTool-Template-Draft** (1 h): Wrapper-Schnittstelle + Lifecycle dokumentieren, bevor Implementation startet.

---

**Version:** Draft v1 · 2026-04-22
**Next:** User-Approval des Scope § und Spike-Tasks → Implementation-Branch `feat/video-hintergrund-entfernen`
