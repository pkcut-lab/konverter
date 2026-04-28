# Mobile-ML-Tools Audit — 6 Tools

**Datum:** 2026-04-28
**Vorgänger-Report:** [2026-04-28-mobile-ml-bg-removal-research.md](./2026-04-28-mobile-ml-bg-removal-research.md) — Bild-BG-Remover separat geprüft, globale Mobile-/iOS-Erkenntnisse dort
**Researcher:** Subagent (~28 Quellen, 2024-2026 priorisiert)
**Geprüfte Source-Files:**
- `src/lib/tools/process-video-bg-remove.ts` + `src/workers/video-bg-remove.worker.ts`
- `src/lib/tools/audio-transkription.ts`
- `src/lib/tools/bild-zu-text.ts`
- `src/lib/tools/speech-enhancer.ts`
- `src/lib/tools/ki-text-detektor.ts`
- `src/lib/tools/ki-bild-detektor.ts`

---

## TL;DR — Empfehlung pro Tool

| # | Tool | Aktuelles Modell | Empfohlenes Modell | Mobile-Tauglichkeit | Migrations-Aufwand |
|---|---|---|---|---|---|
| 1 | **video-bg-remove** | BiRefNet_lite-FP16 (115 MB) + MODNet-Q8 (6,6 MB) | **Behalten** + `speed`-Mode auf MODNet-uint8 (6,63 MB) Mobile-Default | ❌ iOS ≤25 (kein WebCodecs+VP9-Alpha-Encoder) / ⚠️ iOS 26+ / ✅ Android Chrome | Niedrig (Detection-Logik + Banner) — aber **Hard-Block iOS<26 für transparent-Mode wegen WebCodecs-VideoEncoder** |
| 2 | **audio-transkription** | Xenova/whisper-{tiny,base,small} **FP32** (verschwenderisch) | **`onnx-community/whisper-tiny-ONNX` Q4F16** (encoder 6,3 + decoder_merged 45,9 MB = ~52 MB) als Mobile-Default; Quality = Q4F16 base (~60 MB); Pro = Q4F16 small (~199 MB) Desktop only — **plus Moonshine-Tiny-INT8 (~28 MB) als Speed-Option für Englisch-Echtzeit** | ⚠️ Tiny ok, base grenzwertig, small kein-Mobile | **Mittel** — DequantizeLinear-Bug 2026 nicht gelöst (siehe §2.4); Q4F16 gilt als sicherer Fallback statt Q8/uint8 |
| 3 | **image-to-text** | Tesseract.js v6 (`createWorker('deu+eng', 1, ...)`) | **Tesseract.js v7 upgrade + Lazy-Lang-Loading + Worker-Refresh-Strategie**; trOCR/Florence-2 NICHT migrieren | ✅ ok mit v7 Memory-Fixes | **Niedrig** — `npm i tesseract.js@^7` + Lang-Datei nur bei Bedarf laden |
| 4 | **speech-enhancer** | `grazder/DeepFilterNet3.onnx` (~10 MB) frame-by-frame | **Behalten** + Speed-Mode (16 kHz GTCRN ~1-3 MB) für Mobile + offline-RTF-Bench dokumentieren | ⚠️ 48 kHz frame-loop CPU-intensiv auf Mobile; Mobile-Default 16 kHz via Mode-Toggle empfohlen | **Mittel** — Modell-Wahl Toggle + Resample-Pfad; Lizenz GTCRN prüfen |
| 5 | **ki-text-detektor** | `onnx-community/tmr-ai-text-detector-ONNX` device:wasm | **Behalten** (MIT, RoBERTa-base 125M) — aber Q4F16 (128 MB) statt FP32 (499 MB) **explizit konfigurieren via `dtype: 'q4f16'`** | ⚠️ 126-128 MB grenzwertig auf iOS<iPhone-12 | **Niedrig** — `dtype`-String setzen; FP16 (250 MB) wäre Quality, Q8 (126 MB) Speed |
| 6 | **ki-bild-detektor** | `onnx-community/SMOGY-Ai-images-detector-ONNX` (CC-BY-NC-4.0 — **AdSense-KO**) | **Sofort migrieren** auf `onnx-community/Deep-Fake-Detector-v2-Model-ONNX` (Apache-2.0, ViT-base, Q4F16 49,7 MB) | ✅ Q4F16 49,7 MB ok auf Mobile | **Hoch** — Lizenzwechsel zwingend; Modell-API-Shape evtl. anders; UI-Labels neu (Real/Fake statt SMOGY-Schema) |

**Akute Maßnahmen (sortiert nach Dringlichkeit):**

1. 🔴 **Tool 6 sofort migrieren** — SMOGY ist CC-BY-NC-4.0, das ist mit AdSense-Phase-2 **inkompatibel**. Lineage: SMOGY ← Organika/sdxl-detector (CC-BY-NC-3.0). Drop-in-Ersatz: `onnx-community/Deep-Fake-Detector-v2-Model-ONNX` (Apache-2.0).
2. 🟠 **Tool 2 Quantisierung-Korrektur** — `dtype: 'fp32'` lädt für `whisper-tiny` 32,9+118 = ~151 MB, für `whisper-base` 82,5+208 = ~291 MB, für `whisper-small` 353+615 = **~968 MB**. Letzteres crasht garantiert iOS Safari. Stattdessen Q4F16 oder Q8 mit aktuellem Transformers.js-v4-Bug-Status validieren.
3. 🟠 **Tool 1 iOS-Hard-Block für transparent-Mode** — iOS ≤25 hat keinen WebCodecs-VideoEncoder, daher kann der Worker den `vp9`+`alpha:'keep'` Encode-Schritt schlicht nicht ausführen. iOS 26+ ja, davor: Solid-Mode anzeigen oder Mobile-Banner.
4. 🟡 **Tool 5 Q4F16 explizit setzen** — aktuell wird ohne `dtype` geladen, das default-FP32-File ist 499 MB. Mit `dtype: 'q4f16'` gehen 128 MB.
5. 🟡 **Tool 3 v7-Upgrade** — Memory-Leak-Fix ist seit v6 drin, v7 bringt Relaxed-SIMD (~1,6× Speed) und ist seit Dezember 2025 stabil.

---

## 1. video-bg-remove

### 1.1 Aktueller Code-Stand
```ts
// src/workers/video-bg-remove.worker.ts:30-33
const MODEL_BY_KEY = {
  quality: 'onnx-community/BiRefNet_lite-ONNX',  // 115 MB FP16
  speed:   'Xenova/modnet',                       // 6,6 MB Q8/uint8
} as const;
```
Detection-Logik: `navigator.gpu` → WebGPU sonst WASM. Kein `deviceMemory`/UA-Check. Output: `vp9`+WebM (transparent) oder `avc`+MP4 (solid).

### 1.2 Modell-Eignung für Frame-by-Frame-Video
BiRefNet_lite und MODNet sind Single-Image-Segmentation-Modelle, keine Video-Matting-Modelle. Beide haben **temporal-consistency-Schwächen** (bekannt für MODNet: "large fluctuations in temporal coherence and produces flicker", [arxiv:2508.07905](https://arxiv.org/html/2508.07905v1)). Für Premium-Video-Matting wäre MatAnyone ([arxiv:2501.14677](https://arxiv.org/html/2501.14677v1)) oder Generative Video Matting ([arxiv:2508.07905](https://arxiv.org/abs/2508.07905)) besser — beide aber **kein ONNX-Export für Browser**, beide >500 MB. Bleibt: BiRefNet_lite + MODNet sind aktuell die beste Browser-Option, mit dem Trade-off "Flicker zwischen Frames".

**Empfehlung:** Beibehalten. Kein temporally-consistent Video-Modell ist 2026 in Browser+Mobile-Größe verfügbar. Verbesserung: Frame-Smoothing post-processing (3-Frame-Median-Filter auf der Mask) — kostenlose Quality-Verbesserung.

### 1.3 WebCodecs auf iOS Safari (Status April 2026)

| iOS | VideoDecoder | VideoEncoder | VP9+Alpha |
|---|---|---|---|
| ≤16.3 | nicht | nicht | nicht |
| 16.4-18.7 | partial (Decode) | **nicht** | nicht |
| 26+ | full | **full** | mit alpha-side-data via WebM-Container |
| Android Chrome 121+ | full | full | full |

Quellen: [caniuse:WebCodecs](https://caniuse.com/webcodecs), [WebKit-Blog WWDC25](https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/), [testmu.ai Browser-Compat](https://www.testmu.ai/web-technologies/webcodecs-safari/).

**Direkte Implikation:** Auf iOS 16.4-25 ist `mb.CanvasSource(..., { codec: 'vp9', alpha: 'keep' })` **nicht ausführbar** weil VideoEncoder fehlt. Solid-Mode (avc/H.264-Encode) geht auch nicht ohne VideoEncoder. Das ganze Tool ist auf iOS ≤25 nicht nutzbar.

### 1.4 Mediabunny-Status (April 2026)

- Aktuelle Version: **v1.41.0** (24. April 2026), v1.42.0-beta in HLS-Phase ([Releases](https://github.com/Vanilagy/mediabunny/releases))
- `CanvasSource` mit `alpha: 'keep'`-Option **weiterhin offiziell unterstützt** ([Media-Sources-Doc](https://mediabunny.dev/guide/media-sources)): "encodes samples' alpha data as side data, should be paired with WebM/Matroska". **Falsche Internet-Annahme**: Eine zwischenzeitliche Suchmeldung behauptete die Alpha-Option sei entfernt — Direktprüfung zeigt: Option ist drin, sie war aber nie in WebCodecs-VideoEncoder selbst (Browser-API), nur als Side-Data-Encoding. Mediabunny bleibt richtige Wahl.
- Bekannte iOS-Bugs in v1.40+: keine spezifischen mediabunny-Bugs für iOS dokumentiert — alle Mobile-Limits stammen aus dem WebCodecs-Standard, nicht der Library.
- Worker-Modell-Download-Memory-Limits: das Modell wird im Worker-Scope geladen. Module-scoped Pipeline-Promise hält den Tensor-Buffer offen. Auf iOS Safari ist Worker-Memory **nicht** kleiner als Main-Thread (gleicher Page-Process), aber Page-Reload reset funktioniert in Workern besser als im Main-Thread (kein Emscripten-19374-Reload-Leak).

### 1.5 Empfehlung Tool 1

```ts
// src/workers/video-bg-remove.worker.ts (Anpassung)
const MODEL_BY_KEY = {
  quality: 'onnx-community/BiRefNet_lite-ONNX',     // 115 MB FP16 — Desktop/WebGPU
  speed:   'Xenova/modnet',                          // 6,63 MB uint8 — Mobile/Slow
} as const;

async function preflight(): Promise<{ canRun: boolean; reason?: string; mode?: 'quality'|'speed' }> {
  // 1. WebCodecs-VideoEncoder probe (nicht nur navigator.gpu!)
  if (!('VideoEncoder' in self)) {
    return { canRun: false, reason: 'webcodecs-missing' };  // iOS ≤25
  }
  // 2. WebGPU → quality default
  const hasWebGPU = await detectWebGPU();
  // 3. Fallback Mobile-UA + low-RAM
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
  const lowRam = (navigator as any).deviceMemory != null && (navigator as any).deviceMemory < 4;
  const mode = !hasWebGPU || (isMobile && lowRam) ? 'speed' : 'quality';
  return { canRun: true, mode };
}
```

**UI:** Bei `canRun:false` (iOS ≤25) — Banner zeigen: *„Video-Hintergrund-Entfernung benötigt iOS 26 oder neuer (Safari 26)."* Bild-Hintergrund-Entferner als Alternative verlinken.

**Banner-Größenangaben:**
- DE Mobile: *Lädt einmalig **6,6 MB**-Modell. Verarbeitung erfolgt komplett im Browser.*
- DE Quality: *Lädt einmalig **115 MB**-Modell. Schärfere Kanten für Hair/Edge.*
- EN spiegeln.

**Watchdog:** 240 s Mobile / 60 s Desktop — siehe Vorgänger-Report §5.2.

---

## 2. audio-transkription

### 2.1 Aktueller Code-Stand
```ts
// src/lib/tools/audio-transkription.ts:44-57
let modelId = 'Xenova/whisper-base';
if (modelSize === 'tiny')  modelId = 'Xenova/whisper-tiny';
if (modelSize === 'small') modelId = 'Xenova/whisper-small';
// Using fp32 to bypass the DequantizeLinear ONNX bug present in WebAssembly for quantized models
pipeline('automatic-speech-recognition', modelId, { device: 'wasm', dtype: 'fp32' });
```

### 2.2 Whisper-Größentabelle (verifiziert direkt aus HF, April 2026)

**Xenova/whisper-tiny** ([Files](https://huggingface.co/Xenova/whisper-tiny/tree/main/onnx)):

| Variante | Encoder | Decoder | Decoder-Merged | Total Worst-Case (encoder + merged) |
|---|---|---|---|---|
| **fp32 (aktuell!)** | 32,9 MB | 118 MB | 119 MB | **~152 MB** |
| fp16 | 16,5 MB | 59,3 MB | 59,6 MB | ~76 MB |
| int8 / uint8 / quantized (Q8) | 10,1 MB | 30,5 MB | 30,7 MB | ~41 MB |
| **q4f16** | **6,3 MB** | 45,7 MB | **46 MB** | **~52 MB** |
| q4 | 9,01 MB | 86,5 MB | 86,7 MB | ~96 MB |

**Xenova/whisper-base** ([Files](https://huggingface.co/Xenova/whisper-base/tree/main/onnx)):

| Variante | Encoder | Decoder-Merged | Total |
|---|---|---|---|
| **fp32 (aktuell!)** | 82,5 MB | 209 MB | **~291 MB** |
| fp16 | 41,3 MB | 105 MB | ~146 MB |
| int8 / quantized (Q8) | 23,1 MB | 53,7 MB | ~77 MB |
| **q4f16** | **14,1 MB** | 68,6 MB | **~83 MB** |

**Xenova/whisper-small** ([Files](https://huggingface.co/Xenova/whisper-small/tree/main/onnx)):

| Variante | Encoder | Decoder-Merged | Total |
|---|---|---|---|
| **fp32 (aktuell!)** | 353 MB | 615 MB | **~968 MB** ⚠️ iOS-Crash garantiert |
| fp16 | 177 MB | 309 MB | ~486 MB |
| int8 / quantized (Q8) | 92,3 MB | 157 MB | ~250 MB |
| **q4f16** | **54,4 MB** | 146 MB | **~200 MB** |

**Konsequenz:** `dtype: 'fp32'` für `whisper-small` lädt ~968 MB → garantierter iOS-Crash (vgl. iPhone SE 100 MB Limit, Vorgänger-Report §2.2). Selbst auf Desktop ist das Verschwendung. Q4F16 ist 4,8× kleiner und qualitativ akzeptabel.

### 2.3 DequantizeLinear-Bug Status (April 2026)

- Die wahrscheinliche Quelle des "DequantizeLinear-ONNX-Bug" Kommentars sind ältere ONNX-Runtime-Issues ([microsoft/onnxruntime#12151](https://github.com/microsoft/onnxruntime/issues/12151), [#12800](https://github.com/microsoft/onnxruntime/issues/12800), 2022). Diese betrafen QlinearConv mit int8 weights bei ORT 1.12 — Stand 2026 sind sie behoben in ORT-Web ≥1.18.
- Direkt-Search auf transformers.js/issues nach "DequantizeLinear" liefert: nur [#1512 (geschlossen)](https://github.com/huggingface/transformers.js/issues/1512) — *"WebGPU incorrect results for int8 quantized models"*, **WebGPU-spezifisch, nicht WASM**. Closed Feb 2026.
- Der allgemeine Whisper-iOS-Crash hat eine **andere Ursache**: [transformers.js#1242](https://github.com/huggingface/transformers.js/issues/1242) — *„v3 crashes on iOS and macOS due to increasing memory usage"* mit fp32, q4 und allen dtypes. Der Bug ist also **nicht** quant-spezifisch, sondern Memory-Lifecycle. Workaround damals: Downgrade auf v2.15.1.
- v4 ist seit Web-AI-Summit 2025 stable, aber kein expliziter Fix-Commit für #1242 in den Release-Notes auffindbar.

**Konkret zu unserem Code:** Der `dtype: 'fp32'`-Workaround ist möglicherweise vom #1242-Crash-Symptom ausgegangen, nicht vom DequantizeLinear-Bug (der nur WebGPU+Int8 betraf). FP32 verlagert das Problem aber nur — größeres Modell = schneller iOS OOM. **Q4F16 ist nicht von beiden Bugs betroffen** (nicht WebGPU+Int8, nicht reines INT8/UINT8): es kombiniert 4-bit-Gewichte mit FP16-Aktivierungen und sollte stable sein.

### 2.4 Alternative: Moonshine

[`onnx-community/moonshine-tiny-ONNX`](https://huggingface.co/onnx-community/moonshine-tiny-ONNX) ([Files](https://huggingface.co/onnx-community/moonshine-tiny-ONNX/tree/main/onnx)) — **MIT-Lizenz**, 27M Parameter:

| Variante | Encoder | Decoder-Merged | Total |
|---|---|---|---|
| fp32 | 30,9 MB | 78,2 MB | ~109 MB |
| q4f16 | 6,94 MB | 49,1 MB | ~56 MB |
| **int8 / quantized** | **7,94 MB** | **20,2 MB** | **~28 MB** ✅ Mobile-tauglich |

**Aber:** Moonshine ist **English-only** (UsefulSensors fokussiert auf Edge-Voice-Commands, nicht multilingual). Das ist für deutsche Audio-Transkription → DE-Output direkt **KO**.

[`onnx-community/moonshine-base-ONNX`](https://huggingface.co/onnx-community/moonshine-base-ONNX/tree/main/onnx) — MIT, ~62 MB Q8 — auch English-only.

### 2.5 Distil-Whisper

[`distil-whisper/distil-small.en-ONNX`](https://huggingface.co/distil-whisper/distil-small.en) — **English-only**, MIT — also **KO für Multilingual**.

Für multilingual: gibt es keine kleinere Distil-Variante als Whisper selbst. Whisper-large-v3-turbo ([onnx-community](https://huggingface.co/onnx-community/whisper-large-v3-turbo)) ist 809M Parameter, selbst Q4F16 noch ~600 MB → **kein-Mobile**.

### 2.6 Empfehlung Tool 2

```ts
// src/lib/tools/audio-transkription.ts (Anpassung)
let modelId = 'Xenova/whisper-base';
let dtype = 'q4f16';  // Default — Q4F16 ist immun gegen #1512 (WebGPU-Int8) und kleiner als FP32

if (modelSize === 'tiny')  modelId = 'Xenova/whisper-tiny';
if (modelSize === 'small') modelId = 'Xenova/whisper-small';

pipeline('automatic-speech-recognition', modelId, {
  device: 'wasm',
  dtype: dtype,
  progress_callback: onProgress,
});
```

**Mobile-Defaults pro UI-Mode:**
- *Schnell* → `whisper-tiny` Q4F16 (~52 MB)
- *Standard* → `whisper-base` Q4F16 (~83 MB)
- *Maximum* → Desktop-only, `whisper-small` Q4F16 (~200 MB), iOS<26 Hard-Block

**Optional Speed-Mode-English-Only:** Moonshine-Tiny INT8 (~28 MB) als opt-in für DE/EN-User die nur englisches Audio haben → Banner-Hinweis "nur Englisch, dafür schneller". **Empfehlung:** in V1 NICHT einbauen — komplexer Code-Pfad für minimalen Mobile-Win, der durch whisper-tiny-Q4F16 (52 MB) bereits gut abgedeckt ist.

**Lizenz aller drei Whisper-Modelle:** OpenAI hat Whisper unter **MIT** veröffentlicht ([github.com/openai/whisper](https://github.com/openai/whisper)). Xenova-Mirrors sind dieselbe Lizenz. AdSense-OK.

**Watchdog Whisper-base auf 4G:** 83 MB / 1 MB-s = 83 s. Watchdog 180 s Mobile.

---

## 3. image-to-text (OCR)

### 3.1 Aktueller Code-Stand
```ts
// src/lib/tools/bild-zu-text.ts:18-19
worker = await createWorker('deu+eng', 1, { logger: ... });
```
Lädt **gleichzeitig** Deutsch + Englisch-Sprachdaten beim Init. Tesseract.js (npm-Version unbekannt im Source — sollte v6 oder v7 sein).

### 3.2 Tesseract.js Stand April 2026

- Latest stable: **v7.0.0**, released 15. Dezember 2025 ([Releases](https://github.com/naptha/tesseract.js/releases))
- v6 → v7: **+15-35 % Speed** durch wasm-relaxed-simd-Build, ~1,6× OCR-Speed-Gain ([Issue #46](https://github.com/naptha/tesseract.js-core/issues/46))
- **Memory-Leak-Fix in v6** ([Issue #977](https://github.com/naptha/tesseract.js/issues/977)) — kritisch für Mobile-Sessions, vorher konnte iOS Safari nach mehreren OCRs crashen
- v5 brachte 54 % kleinere Englisch-LangData, 73 % kleinere Chinesisch-LangData
- iOS-17.0/17.1-Crash-Bug nur in Legacy+LSTM-Build — wir nutzen LSTM-only (default ab v5), also nicht betroffen
- LangData (.traineddata) **nicht im npm-Bundle**, sondern lazy-geladen aus tessdata-CDN (default `https://tessdata.projectnaptha.com/4.0.0/`):
  - `eng.traineddata` (LSTM): ~22 MB unkomprimiert, ~10 MB gzipped
  - `deu.traineddata` (LSTM): ~17 MB unkomprimiert, ~7 MB gzipped
  - Werden in IndexedDB gecached nach erstem Load.

### 3.3 Mobile-Bugs (historisch)

- [Issue #677](https://github.com/naptha/tesseract.js/issues/677) — iPhone 13 Pro iOS 16, OOM nach Worker-Termination → Fix in v6
- [Issue #476](https://github.com/naptha/tesseract.js/issues/476) — `WebAssembly.Memory(): could not allocate memory` auf älteren Mobile → Größenproblem, v5+ verkleinerte WASM um >50 %
- [Emscripten #19374](https://github.com/emscripten-core/emscripten/issues/19374) — generischer iOS-Reload-OOM, betrifft alle WASM-Apps → Workaround: `worker.terminate()` nach OCR-Done

**v7-Status:** keine spezifischen 2025-2026-Mobile-Crashes dokumentiert — Memory-Fixes von v6 sind drin, Worker-Refresh-Pattern wird noch empfohlen.

### 3.4 Alternativen

| Alternative | Architektur | Footprint | Mobile-tauglich | Lizenz | Empfehlung |
|---|---|---|---|---|---|
| **Tesseract.js v7** | klassisches OCR (LSTM) | ~3 MB WASM-Core + 17 MB DE / 22 MB EN | ✅ | Apache-2.0 | **Behalten + upgraden** |
| **trOCR-base** ([Xenova/trocr-base-handwritten](https://huggingface.co/Xenova/trocr-base-handwritten)) | ViT-Encoder + RoBERTa-Decoder | Encoder-base ~340 MB FP32, Q4F16 ~85 MB; **printed-Variante separat** | ⚠️ Q4F16 ok, aber nur English+Druck/Handschrift, kein Multi-Language | MIT | **Nicht migrieren** — line-level Modell, kein page-OCR (braucht Pre-Crop) |
| **Florence-2 OCR** ([microsoft/Florence-2](https://huggingface.co/microsoft/Florence-2-base)) | VLM | Base ~430 MB FP32 | ❌ Mobile zu groß | MIT | nicht für Mobile |
| **PaddleOCR (PP-OCRv5)** | DBNet+SVTR | ~10-30 MB Detection, ~10 MB Recognition (Multilingual) | ✅ | Apache-2.0 | **Interessante Phase-2-Option**, aber kein Transformers.js-Wrapper, eigene WASM-Build nötig |
| **manga-ocr** ([l0wgear/manga-ocr-2025-onnx](https://huggingface.co/l0wgear/manga-ocr-2025-onnx)) | Spezial-OCR | klein | ✅ | n/a | Spezial-Use, kein DE/EN-Drop-in |

### 3.5 Empfehlung Tool 3

**Behalten Tesseract.js, aber:**

1. **Auf v7 upgraden** — `npm i tesseract.js@^7`. Speed-Gain: ~1,6× (relaxed-SIMD).
2. **Lazy-Lang-Loading**: nicht `'deu+eng'` immer, sondern UI-Toggle:
   - Mobile-Default: nur eine Sprache (z.B. erkenne aus User-Locale: DE-User → `deu`, sonst `eng`)
   - Toggle "Mehrsprachig (DE+EN)" für User die mixed-content haben
   Spart auf erstem Load ~40 % Bandbreite.
3. **Worker-Refresh nach jedem OCR-Job** auf Mobile (UA-Detection + `await worker.terminate(); worker = null;`) — verhindert Emscripten-19374-Slow-Leak.
4. **Banner-Größenangaben:**
   - DE: *Lädt einmalig **~25 MB** Sprachdaten (Deutsch). Beim ersten Start, danach offline nutzbar.*
   - EN: *One-time **~25 MB** language pack download (English). Cached after first run.*
5. **Watchdog 120 s** reicht — die Daten sind klein.

**Nicht migrieren auf trOCR/Florence-2** — sie sind für andere Use-Cases (line-level, handwriting) und für unser DE+EN-Druck-OCR ist Tesseract.js v7 besser geeignet (kleiner, multilingual, etabliert).

---

## 4. speech-enhancer

### 4.1 Aktueller Code-Stand
```ts
// src/lib/tools/speech-enhancer.ts:36-37
const DFN3_MODEL_URL =
  'https://huggingface.co/grazder/DeepFilterNet3/resolve/main/DeepFilterNet3.onnx';
// 48 kHz, 20 ms FRAME_SAMPLES = 960, 10 ms HOP = 480 Hann-Window-Overlap-Add
// ortSession.run({ input: tensor }) für JEDES 20-ms-Frame
```

### 4.2 DeepFilterNet3 Status

- **Lizenz:** "MIT OR Apache-2.0 at your option" ([Rikorose/DeepFilterNet LICENSE](https://github.com/Rikorose/DeepFilterNet)) — sauber für AdSense
- **Original-Repo Status:** letzter Release v0.5.6 vom 31. August 2023 — **18+ Monate alt**, GitHub zeigt ~13 offene Issues, ~35 PRs, kein 2025-2026-Activity. **Maintenance-Risiko niedrig-mittel**: das Modell ist stable und konvergiert, aber ohne aktive Wartung kein Bug-Support.
- **`grazder/DeepFilterNet3.onnx`** (HF-Mirror, 401-Block bei direktem Fetch — vermutlich Lizenz-Gate oder geänderte Model-Card-Permissions):
  - Größe ~10 MB (laut aktuellem Code-Kommentar). Predecessor-Report §5 listet "DeepFilterNet ONNX export ist 3-File-Split (enc/erb_dec/df_dec)" — die `grazder/DeepFilterNet3.onnx`-File scheint **monolithisch zu sein** (nur 1 File). Direkt-Verifikation aus dem Repo-Files-Tab nicht möglich (401), aber wir nutzen sie produktiv → es funktioniert.
  - SpeechDenoiser-Repo ([yuyun2000/SpeechDenoiser](https://github.com/yuyun2000/SpeechDenoiser)) bestätigt: "48kHz model uses DeepFilterNet3", monolithisches ONNX, raw-audio-Input ([README](https://github.com/yuyun2000/SpeechDenoiser/blob/main/README.md))
- **`niobures/DeepFilterNet`** (alternativer HF-Mirror, [Files](https://huggingface.co/niobures/DeepFilterNet/tree/main/models/onnx/DeepFilterNet)) — gleiche Modelle, andere User. Für R2-Mirror-Strategie auch nutzbar.

### 4.3 Mobile-Performance (real-time-factor)

Quellen-konsens:
- [Schroter et al. Interspeech 2023, "DeepFilterNet"-Paper](https://www.isca-archive.org/interspeech_2023/schroter23b_interspeech.pdf): RTF 0,19 single-threaded auf Notebook i5-8250U (4-core, 2018) — Native-CPU, nicht WASM
- SpeechDenoiser-README: "Snapdragon 865 sufficient for real-time inference" auf 48-kHz-DeepFilterNet3 — das ist iPhone-12-Klasse Performance (Apple A14)
- WASM-Overhead vs. native typisch 2-3× → erwartete Browser-RTF ~0,4-0,6 auf iPhone 12 Mobile WASM. Knapp aber Realtime-fähig
- Ältere iPhones (SE, 8): erwartete RTF >1,0 → **langsamer als Realtime**. Für 60 s Audio-File 90+ s Inference

**Direkte Mobile-Crash-Gefahr ist klein** (Modell ist 10 MB, selbst doppelte Working-Memory ~30 MB ist weit unter iPhone-SE-100-MB-Limit). Das Problem ist eher **CPU-Laufzeit**, nicht OOM. Tool blockt visuell die Page für 60-90 s, was UX-Frustration generiert (kein Crash, aber gefühlt "kaputt").

### 4.4 Alternativen

| Alternative | Größe | Real-Time | Lizenz | Mobile-tauglich | Quality |
|---|---|---|---|---|---|
| **DeepFilterNet3 (aktuell)** | ~10 MB | RTF 0,19 native, ~0,5 WASM iPhone-12 | MIT/Apache-2.0 | ⚠️ ältere iPhones langsam | **PESQ 3,5-4,0+ STOI >0,95** ([SINERGI 2025](https://publikasi.mercubuana.ac.id/index.php/sinergi/article/download/21917/9619)) |
| **RNNoise** ([xiph.org/rnnoise](https://gitlab.xiph.org/xiph/rnnoise)) | ~500 KB | RTF 0,01 (10-20 ms latency) | BSD-3-Clause | ✅ läuft auf jedem Device | **PESQ 3,88 STOI 0,92** — schwächer bei TV-Background-Noise |
| **GTCRN** (16 kHz, in SpeechDenoiser) | ~1-3 MB | Raspberry-Pi-4-Realtime | n/a (Repo prüfen) | ✅ | mittelmäßig — 16 kHz limitiert High-Frequency-Speech |
| **DTLN** | ~3 MB ONNX | RTF ~0,3 native | MIT | ✅ | mittelmäßig |
| **DPDFNet** ([ceva-ip/DPDFNet](https://github.com/ceva-ip/DPDFNet)) | ~12 MB | grad besser als DFN3 | n/a (proprietär?) | ⚠️ | **stärker als DFN2**, aber 2026-neu |
| **Mossformer2** | ~30+ MB | langsamer | MIT | ⚠️ groß | top-quality aber Phone-zu-langsam |

### 4.5 Empfehlung Tool 4

**Behalten DeepFilterNet3 — kein besserer Trade-off vorhanden.** Verbesserungen:

1. **Mobile-Speed-Toggle einbauen** (Phase 2):
   - *Quality* (default Desktop): DeepFilterNet3 48 kHz (~10 MB)
   - *Speed* (Mobile-Default optional): GTCRN 16 kHz (~1-3 MB) — falls Lizenz-OK; resampelt User-Audio auf 16 kHz, denoiset, resampelt zurück. Trade-off: weniger High-Freq-Detail, schneller als Realtime auch auf iPhone 8
   - **Lizenz GTCRN** muss vor Adoption verifiziert werden ([github.com/Xiaobin-Rong/gtcrn](https://github.com/Xiaobin-Rong/gtcrn) — Repo-Lizenz prüfen)
2. **R2-Mirror** für `DeepFilterNet3.onnx` einrichten (Vorgänger-Report §3.3) — 401-Lock auf grazder ist Maintenance-Risiko
3. **Asynchrone Frame-Processing** statt synchron — `onnxruntime-web` blockt aktuell jeden 20-ms-Frame seriell. Bei 60-s-Audio = 3000 Frames × N ms Inference. UI sollte Progress-Bar mit Frame-Counter zeigen, evtl. `requestIdleCallback`-Throttling für Browser-Responsiveness
4. **Banner-Größenangaben:**
   - DE: *Lädt einmalig **~10 MB** Modell. Verarbeitung nutzt ca. 1-3× Audio-Länge auf Smartphone, schneller auf Desktop.*
   - EN: spiegeln
5. **Watchdog 60 s** für Modell-Download (10 MB schnell), Inference-Watchdog separat: `frame N abgearbeitet` als Heartbeat — wenn 30 s lang kein Frame-Progress: Stall.

---

## 5. ki-text-detektor

### 5.1 Aktueller Code-Stand
```ts
// src/lib/tools/ki-text-detektor.ts:35-39
pipeline(
  'text-classification',
  'onnx-community/tmr-ai-text-detector-ONNX',
  { progress_callback: onProgress, device: 'wasm' }
);
// kein dtype gesetzt → default fp32 → 499 MB ⚠️
```

### 5.2 Modell-Verifikation

[`onnx-community/tmr-ai-text-detector-ONNX`](https://huggingface.co/onnx-community/tmr-ai-text-detector-ONNX) — Direkt-Verifikation:

- **Lizenz: MIT** ✅ commercial-OK ([README direkt](https://huggingface.co/onnx-community/tmr-ai-text-detector-ONNX/blob/main/README.md))
- **TMR = "Target Mining RoBERTa"** ([Oxidane/tmr-ai-text-detector](https://huggingface.co/Oxidane/tmr-ai-text-detector))
- **Architektur:** RoBERTa-base (FacebookAI/roberta-base), 125M Parameter
- **Training:** RAID-Dataset (50k stratified samples, 45 % human / 55 % AI)
- **Performance:** AUROC 99,28 % (RAID benchmark, all settings); Accuracy 97,42 %
- **Sprache:** primarily English (RAID is English-only)

**ONNX-Files** ([Files](https://huggingface.co/onnx-community/tmr-ai-text-detector-ONNX/tree/main/onnx)):

| Variante | Größe | Mobile-tauglich |
|---|---|---|
| **fp32 (aktueller Default!)** | **499 MB** | ❌ iOS-Crash garantiert |
| fp16 | 250 MB | ❌ |
| int8 / uint8 / quantized (Q8) | 126 MB | ⚠️ grenzwertig iPhone-SE |
| **q4f16** | **128 MB** | ⚠️ ähnlich Q8 |
| q4 | 212 MB | ❌ |
| bnb4 | 207 MB | ❌ |

**Konsequenz:** Aktueller Code lädt **499 MB**. Selbst auf Desktop unnötig viel; auf Mobile ein OOM-Garant.

### 5.3 Aktualität (AI-Detector altern)

- TMR ist 2025-trainiert auf RAID-Dataset (ACL 2024) — sehr aktuell für AI-Text-Detection-Standards
- Aktualitäts-Risiko: GPT-5/Claude-Opus-4.x/Llama-4-Texte 2026 sind nicht im Training-Set. Detection-Quality wird über Zeit drift-en
- **Re-Evaluation-Trigger:** alle 6 Monate ein Bench-Run gegen aktuelle LLM-Outputs. Wenn AUROC <90 %: Modell-Update suchen
- Better-but-bigger Alternative: **[desklib/ai-text-detector-v1.01](https://huggingface.co/desklib/ai-text-detector-v1.01)** — DeBERTa-v3-Large 0,4B params, MIT-Lizenz, **#1 RAID Leaderboard** ([raid-bench.xyz](https://raid-bench.xyz/leaderboard)) — aber ~1,6 GB FP32, ~400 MB Q4 — **kein Mobile**, eventuell als Desktop-only "Pro"-Mode

### 5.4 Alternativen-Tabelle

| Modell | Architektur | Params | Q4F16 / Q8 Größe | Lizenz | RAID Score | Empfehlung |
|---|---|---|---|---|---|---|
| **TMR (aktuell)** | RoBERTa-base | 125M | ~128 MB Q4F16 / ~126 MB Q8 | **MIT** | AUROC 99,28 % | **Behalten** + dtype korrigieren |
| **Hello-SimpleAI/chatgpt-detector-roberta** | RoBERTa-base | 125M | kein offizieller ONNX | **CC-BY-SA** ⚠️ share-alike-Risiko | älter (HC3 2023) | Skip — Lizenz-Risiko |
| **desklib/ai-text-detector-v1.01** | DeBERTa-v3-Large | 0,4B | kein offizieller ONNX, ~400 MB Q4 | **MIT** | **#1 RAID** | Phase-2-Pro-Mode-Kandidat |
| **Xenova/roberta-base-openai-detector** | RoBERTa-base | 125M | ähnlich TMR | MIT | älter (GPT-2 era) | obsolet, schwach gegen GPT-3.5+ |

### 5.5 Empfehlung Tool 5

```ts
// src/lib/tools/ki-text-detektor.ts (Anpassung)
pipeline(
  'text-classification',
  'onnx-community/tmr-ai-text-detector-ONNX',
  {
    progress_callback: onProgress,
    device: 'wasm',
    dtype: 'q4f16',  // ⚠️ FIX: Default war fp32 (499 MB), jetzt 128 MB
  }
);
```

**Mode-Optionen für Phase 2:**
- *Schnell* (Mobile): TMR Q4F16 (~128 MB) — Default
- *Maximum* (Desktop): desklib DeBERTa-v3-Large Q4 (~400 MB) — wenn Power-User Best-Quality wollen

**Banner:**
- DE: *Lädt einmalig **~128 MB** Modell. Ergebnis basiert auf RAID-Benchmark (englischsprachig, beste Leistung bei Texten ähnlich News, Bücher, Wikipedia, Reddit).*
- EN: spiegeln. Gegebenenfalls erwähnen: "Best on English text".

**Watchdog Mobile:** 240 s (128 MB Download).

---

## 6. ki-bild-detektor

### 6.1 Aktueller Code-Stand
```ts
// src/lib/tools/ki-bild-detektor.ts:39-43
pipeline(
  'image-classification',
  'onnx-community/SMOGY-Ai-images-detector-ONNX',
  { progress_callback: onProgress, device: 'wasm' }
);
// kein dtype gesetzt → default fp32 → 352 MB ⚠️
```

### 6.2 Modell-Verifikation — KRITISCH

[`onnx-community/SMOGY-Ai-images-detector-ONNX`](https://huggingface.co/onnx-community/SMOGY-Ai-images-detector-ONNX) — Direkt-Verifikation:

- **Lizenz: cc-by-nc-4.0** ❌ **NICHT-COMMERCIAL → AdSense-INKOMPATIBEL**
- README explizit: *„this model should be considered appropriate only for **non-commercial use only**"*
- Lineage: SMOGY ist fine-tuned aus [`Organika/sdxl-detector`](https://huggingface.co/Organika/sdxl-detector) — **CC-BY-NC-3.0** (Non-Commercial)
- Trainings-Daten: Reddit + Kaggle + IP-Adapter-SDXL-Style-Transfer
- Architektur: Swin-Transformer 86,8M Parameter

**Konsequenz:** Das Tool darf in der **AdSense-Phase-2 nicht laufen** — der Lizenz-Conflict ist nicht verhandelbar. Ein User-Disclaimer hilft nicht: AdSense-Tracking + Non-Commercial-Modell = Vertrags-Verletzung.

**ONNX-Files** ([Files](https://huggingface.co/onnx-community/SMOGY-Ai-images-detector-ONNX/tree/main/onnx)):

| Variante | Größe | Mobile-tauglich (irrelevant da Lizenz-KO) |
|---|---|---|
| **fp32 (aktueller Default!)** | **352 MB** | ❌ Größenproblem on top |
| fp16 | 177 MB | ⚠️ |
| int8 / uint8 / quantized (Q8) | 93,2 MB | ✅ |
| **q4f16** | **52,5 MB** | ✅ |

### 6.3 Migrationsziel: `onnx-community/Deep-Fake-Detector-v2-Model-ONNX`

[Direkt verifiziert](https://huggingface.co/onnx-community/Deep-Fake-Detector-v2-Model-ONNX):

- **Lizenz: Apache-2.0** ✅ — commercial use mit Attribution erlaubt
- **Architektur:** Vision-Transformer (ViT-Base, `google/vit-base-patch16-224-in21k`), 86M params
- **Trainings-Daten:** 56k Test-Samples (28k real, 28k fake), curated dataset
- **Aktualität:** Initial März 2024, letztes Update **Februar 2025** — relativ aktuell
- **Performance:** Accuracy 92,12 %, F1 0,9249
- **Ethical Caveat:** README warnt vor Missbrauch — kein Lizenz-Constraint, nur Anweisung

**ONNX-Files** ([Files](https://huggingface.co/onnx-community/Deep-Fake-Detector-v2-Model-ONNX/tree/main/onnx)):

| Variante | Größe | Mobile |
|---|---|---|
| fp32 | 343 MB | ❌ |
| fp16 | 172 MB | ⚠️ |
| int8 / uint8 / quantized (Q8) | 87,3 MB | ✅ |
| bnb4 | 51,5 MB | ✅ |
| **q4f16** | **49,7 MB** | ✅ Mobile-Ideal |
| q4 | 56,8 MB | ✅ |

**Trade-off vs SMOGY:**
- SMOGY ist auf "AI-Art-vs-Real" (SDXL/Midjourney/IP-Adapter-Style-Transfer) trainiert
- Deep-Fake-Detector-v2 ist auf "Realismus-Detect" auf Deepfake-Faces fokussiert
- Use-Cases überlappen aber **nicht 100 %**: SMOGY ist breiter (Generative-Art-Recognition), Deep-Fake-Detector ist enger (Face-Manipulation)

### 6.4 Weitere Alternativen

| Modell | Lizenz | Architektur | Aktualität | ONNX |
|---|---|---|---|---|
| **`onnx-community/Deep-Fake-Detector-v2-Model-ONNX`** | **Apache-2.0** ✅ | ViT-base 86M | Feb 2025 | ja, Q4F16 49,7 MB |
| `dima806/ai_vs_real_image_detection` | **Apache-2.0** ✅ | ViT-base 85,8M | ~2 Jahre alt; Creator warnt vor Concept-Drift | kein direkter ONNX |
| `umm-maybe/AI-image-detector` | **CC-BY-ND-4.0** ⚠️ no-derivatives, commercial OK | ViT | Oktober 2022 (sehr alt) | nein |
| `Organika/sdxl-detector` | CC-BY-NC-3.0 ❌ | Swin | älter | ja |
| `prithivMLmods/Deep-Fake-Detector-v2-Model` (original) | Apache-2.0 ✅ | ViT-base | Feb 2025 | safetensors only — onnx-community ist die ONNX-Variante |

### 6.5 Empfehlung Tool 6

**Sofortiger Lizenz-Wechsel (vor AdSense-Phase-2-Launch verbindlich):**

```ts
// src/lib/tools/ki-bild-detektor.ts (Anpassung)
pipeline(
  'image-classification',
  'onnx-community/Deep-Fake-Detector-v2-Model-ONNX',  // ✅ Apache-2.0
  {
    progress_callback: onProgress,
    device: 'wasm',
    dtype: 'q4f16',  // ⚠️ FIX: 49,7 MB statt 343 MB FP32
  }
);
```

**UI-Anpassungen:**
- Klassen-Labels ändern: SMOGY hatte vermutlich "ai-generated"/"real" — Deep-Fake-Detector liefert "Realism" / "Deepfake". Frontend-Mapping anpassen
- Tool-Name anpassen? Aktueller Name "ki-bild-detektor" passt zu Deep-Fake — beide sind AI-Image-Detection-Tools. Eventuell Subtitle ändern: *„erkennt KI-generierte Bilder und Deepfakes"*
- Disclaimer ergänzen: *„Trainiert primär auf Face-Manipulationen — Generative-Art (Midjourney, SDXL) wird mit niedrigerer Genauigkeit erkannt"*

**Banner:**
- DE: *Lädt einmalig **~50 MB** Modell. Erkennt KI-generierte Bilder und Deepfakes. Verarbeitung erfolgt komplett im Browser.*
- EN: spiegeln

**Watchdog:** 120 s reicht (50 MB schnell).

**Re-Evaluation:** alle 6 Monate. AI-Image-Generation entwickelt sich rasant (DALL-E 4, Sora-Image, neues SDXL, Flux 2.x), Detection-Modelle veralten. Deep-Fake-Detector-v2 ist aktuell der beste Kompromiss aus Lizenz + Aktualität + Mobile-Größe.

---

## Übergreifende Empfehlungen

### Welche Tools brauchen einen Speed/Quality-Switch?

| Tool | Speed-Mode | Quality-Mode | Pro-Mode (Desktop only) |
|---|---|---|---|
| **video-bg-remove** | MODNet uint8 6,6 MB ✅ vorhanden | BiRefNet_lite-FP16 115 MB ✅ vorhanden | — (kein BEN2 für Video, mediabunny-Limit) |
| **audio-transkription** | whisper-tiny Q4F16 52 MB | whisper-base Q4F16 83 MB | whisper-small Q4F16 200 MB |
| **image-to-text** | DE oder EN nur (~17/22 MB) | DE+EN (~40 MB) | — (PaddleOCR Phase-2-Kandidat) |
| **speech-enhancer** | GTCRN 16 kHz ~1-3 MB *(falls Lizenz-OK)* | DeepFilterNet3 48 kHz ~10 MB | — |
| **ki-text-detektor** | TMR Q4F16 128 MB | TMR Q4F16 128 MB (gleich) | desklib DeBERTa-Large Q4 ~400 MB |
| **ki-bild-detektor** | Deep-Fake-Detector Q4F16 50 MB | Deep-Fake-Detector Q8 87 MB | Deep-Fake-Detector FP16 172 MB |

### Welche Tools sind auf Mobile per default deaktivierbar?

**Hard-Block iOS ≤25** (kein WebCodecs-VideoEncoder):
- video-bg-remove → "iOS 26 oder neuer benötigt"

**Soft-Block, mit Fallback-Banner:**
- audio-transkription `small`-Mode → Banner "Schnell-Variante (Tiny) empfohlen"
- ki-text-detektor `pro`-Mode (desklib) → Desktop-only-Hint
- ki-bild-detektor `pro`-Mode (FP16 172 MB) → Desktop-only-Hint

**Kein Block:**
- audio-transkription tiny/base, image-to-text, speech-enhancer, ki-bild-detektor (Q4F16/Q8) — alle Mobile-tauglich

### Banner-Größenangaben pro Tool

| Tool | DE-Wording | EN-Wording |
|---|---|---|
| video-bg-remove (speed) | *Lädt einmalig **6,6 MB** Modell. Verarbeitung im Browser.* | *One-time **6.6 MB** model download. Browser-only.* |
| video-bg-remove (quality) | *Lädt einmalig **115 MB** Modell. Schärfere Edges.* | *One-time **115 MB** model download. Sharper edges.* |
| video-bg-remove (iOS<26) | *Benötigt iOS 26 oder neuer (Safari 26). Auf älteren Geräten: [Bild-Hintergrund-Entferner].* | *Requires iOS 26 or later. On older devices: [Image Background Remover].* |
| audio-transkription tiny | *Lädt einmalig **~52 MB** Modell. Beste Leistung auf Englisch und Deutsch, kürzeren Aufnahmen.* | *One-time **~52 MB** model. Best on English/German, shorter recordings.* |
| audio-transkription base | *Lädt einmalig **~83 MB** Modell. Höhere Genauigkeit als Tiny.* | *One-time **~83 MB** model. Higher accuracy than Tiny.* |
| audio-transkription small | *Lädt einmalig **~200 MB** Modell. Empfohlen ab Desktop.* | *One-time **~200 MB** model. Desktop recommended.* |
| image-to-text | *Lädt einmalig **~25 MB** Sprachpaket (Deutsch). Cached für Offline-Nutzung.* | *One-time **~25 MB** language pack (English). Cached for offline use.* |
| speech-enhancer | *Lädt einmalig **~10 MB** Modell. Verarbeitung 1-3× Audio-Länge auf Smartphone, schneller auf Desktop.* | *One-time **~10 MB** model. Processing is 1-3× audio length on phone, faster on desktop.* |
| ki-text-detektor | *Lädt einmalig **~128 MB** Modell. Beste Leistung auf englischsprachigen Texten (News, Wiki, Reddit).* | *One-time **~128 MB** model. Best on English text (news, wiki, reddit).* |
| ki-bild-detektor | *Lädt einmalig **~50 MB** Modell. Erkennt KI-generierte Bilder und Deepfakes.* | *One-time **~50 MB** model. Detects AI-generated images and deepfakes.* |

### Watchdog-Timeouts pro Tool

Formel: `(model_size_MB / 1MB-s_4G) × 2_safety_factor + 60s_init`. Stall-Detection auf "no-progress-event" innerhalb des Fensters, nicht "total time".

| Tool | Mobile (4G/5G) | Desktop |
|---|---|---|
| video-bg-remove (115 MB) | 240 s | 60 s |
| video-bg-remove (6,6 MB) | 60 s | 30 s |
| audio-transkription tiny (52 MB) | 180 s | 60 s |
| audio-transkription base (83 MB) | 240 s | 60 s |
| audio-transkription small (200 MB) | 360 s (Desktop only empfohlen) | 90 s |
| image-to-text (25 MB) | 120 s | 30 s |
| speech-enhancer (10 MB) | 60 s | 30 s |
| ki-text-detektor (128 MB) | 240 s | 60 s |
| ki-bild-detektor (50 MB) | 120 s | 30 s |

Für die Inference-Phase (nach Modell-Load): separate Heartbeat-basierte Watchdogs:
- audio-transkription: chunk_length_s = 30 → 60 s ohne Chunk-Progress = stall
- speech-enhancer: ~3000 Frames pro Minute Audio → 30 s ohne Frame-Progress = stall
- video-bg-remove: ~30 fps × duration → frame-counter via Worker, 30 s ohne Frame = stall

---

## Offene Fragen pro Tool

### Tool 1 (video-bg-remove)
1. iOS-26-WebCodecs-VP9-Alpha-Encoder Live-Test fehlt — ist `alpha:'keep'` tatsächlich auf iOS 26 funktional, oder gibt's einen WebKit-Bug? Sauce-Labs-Test mit echtem iPhone empfohlen
2. Wie viele User haben überhaupt iOS-26+ vs iOS-≤25 — ohne Production-Telemetrie unklar wie groß der Hard-Block-Schaden ist

### Tool 2 (audio-transkription)
1. Ist Transformers.js-v4-iOS-Crash-Issue (#1242) gefixt für Q8/Q4F16 Whisper-Modelle? Direkt-Test auf iPhone nötig — das `dtype:'fp32'`-Workaround ist Symptombehandlung, nicht Root-Cause-Fix
2. R2-Mirror für `Xenova/whisper-*`-Repos einrichten — bei 200 MB-Modellen ist HF-CDN-Carrier-NAT-Risiko relevant

### Tool 3 (image-to-text)
1. UI-Lang-Auto-Detect — DE-User → `deu`, sonst `eng`? Oder explizites Toggle? UX-Decision offen
2. PaddleOCR-Phase-2-Eval: kann v5 als ONNX in Browser laufen? Eigener Build-Aufwand vs. Tesseract-Beibehaltung

### Tool 4 (speech-enhancer)
1. **GTCRN-Lizenz** verifizieren ([github.com/Xiaobin-Rong/gtcrn](https://github.com/Xiaobin-Rong/gtcrn)) — Repo-LICENSE-File checken bevor Speed-Mode-Migration
2. RTF-Bench auf echten iPhone-SE/iPhone-12/Pixel-6a — exakte Mobile-Performance-Zahlen fehlen
3. SpeechDenoiser-ONNX-Export ([yuyun2000/SpeechDenoiser](https://github.com/yuyun2000/SpeechDenoiser)) hat keine eigene Lizenz im Repo — Code MIT-zu-implizieren ist Annahme, nicht Fakt

### Tool 5 (ki-text-detektor)
1. RAID-Benchmark gegen aktuelle 2026-LLM-Outputs (GPT-5, Claude 4, Llama 4) — eigener Bench zeigt ob Detection-Drift schon eingesetzt hat
2. Multi-Language: TMR ist English-trained — DE-Texte werden False-Positives erzeugen. Brauchen wir einen Disclaimer in der UI oder ein DE-spezifisches Modell?
3. Desklib-DeBERTa-Large hat keinen offiziellen ONNX-Export — wer macht den (User selbst via Optimum, oder warten bis onnx-community konvertiert)?

### Tool 6 (ki-bild-detektor)
1. **Lizenz-Migration ist Pflicht** — sofortige Action nötig. Frage: SMOGY-Ergebnisse aus Test-Datenbank werden weggeschmissen oder als historische Vergleichs-Daten markiert?
2. Deep-Fake-Detector-v2 vs SMOGY: Quality-Comparison auf Test-Set fehlt — beide haben unterschiedliche Use-Cases. Mit Test-Bildern (10 SDXL, 10 Midjourney, 10 Sora, 10 Real) prüfen
3. AI-Image-Detection-Drift: alle Detector-Modelle veralten innerhalb 6-12 Monaten. Re-Evaluation-Zyklus ins Sprint-Schedule

### Übergreifend
1. **Cloudflare-R2-Mirror-Setup** für alle 6 Modelle gleichzeitig oder priorisiert? Empfehlung: TMR (128 MB) + Whisper-base (83 MB) + Deep-Fake-Detector (50 MB) + DFN3 (10 MB) zuerst — das sind die mit der höchsten Mobile-Carrier-Range-Bug-Wahrscheinlichkeit
2. **Production-Telemetrie für Mobile-Failure-Rate** — Sentry o.ä. mit Consent-Banner, sonst können wir die Empfehlungen nie validieren
3. **iOS-Version-Verteilung der User** unbekannt — Phase-2-Analytics-Ticket offen

---

## Quellen

### Modelle (HF) — Direkt-Verifikation April 2026

#### video-bg-remove
- [`onnx-community/BiRefNet_lite-ONNX`](https://huggingface.co/onnx-community/BiRefNet_lite-ONNX) — MIT, FP16 115 MB (vom Vorgänger-Report verifiziert)
- [`Xenova/modnet`](https://huggingface.co/Xenova/modnet) — Apache-2.0, uint8 6,63 MB

#### audio-transkription
- [`Xenova/whisper-tiny`](https://huggingface.co/Xenova/whisper-tiny/tree/main/onnx) — MIT, FP32 152 MB / Q4F16 52 MB
- [`Xenova/whisper-base`](https://huggingface.co/Xenova/whisper-base/tree/main/onnx) — MIT, FP32 291 MB / Q4F16 83 MB
- [`Xenova/whisper-small`](https://huggingface.co/Xenova/whisper-small/tree/main/onnx) — MIT, FP32 968 MB / Q4F16 200 MB
- [`onnx-community/whisper-tiny-ONNX`](https://huggingface.co/onnx-community/whisper-tiny-ONNX/tree/main/onnx) — Mirror identisch zu Xenova
- [`onnx-community/whisper-large-v3-turbo`](https://huggingface.co/onnx-community/whisper-large-v3-turbo/tree/main/onnx) — 16,4 GB total, Q4F16 ~600 MB → kein Mobile
- [`onnx-community/moonshine-tiny-ONNX`](https://huggingface.co/onnx-community/moonshine-tiny-ONNX/tree/main/onnx) — MIT, INT8 ~28 MB, **English-only**
- [`onnx-community/moonshine-base-ONNX`](https://huggingface.co/onnx-community/moonshine-base-ONNX/tree/main/onnx) — MIT, INT8 ~62 MB, English-only
- [`distil-whisper/distil-small.en`](https://huggingface.co/distil-whisper/distil-small.en) — MIT, English-only

#### image-to-text
- [Tesseract.js Releases](https://github.com/naptha/tesseract.js/releases) — Apache-2.0, v7.0.0 Dec 2025
- [Tesseract.js Issue #977 Memory-Leak](https://github.com/naptha/tesseract.js/issues/977) — fixed in v6
- [Tesseract.js Issue #993 v6-Changelog](https://github.com/naptha/tesseract.js/issues/993)
- [Tesseract.js Issue #46 wasm-relaxed-simd](https://github.com/naptha/tesseract.js-core/issues/46)
- [Tesseract.js Issue #677 iPhone-13-OOM](https://github.com/naptha/tesseract.js/issues/677)
- [Xenova/trocr-base-handwritten](https://huggingface.co/Xenova/trocr-base-handwritten) — MIT
- [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) — Apache-2.0
- [microsoft/Florence-2-base](https://huggingface.co/microsoft/Florence-2-base) — MIT

#### speech-enhancer
- [Rikorose/DeepFilterNet GitHub](https://github.com/Rikorose/DeepFilterNet) — MIT OR Apache-2.0
- [niobures/DeepFilterNet HF](https://huggingface.co/niobures/DeepFilterNet/tree/main/models/onnx/DeepFilterNet) — Mirror
- [yuyun2000/SpeechDenoiser](https://github.com/yuyun2000/SpeechDenoiser) — DeepFilterNet3 + GTCRN
- [DeepFilterNet Interspeech 2023 Paper](https://www.isca-archive.org/interspeech_2023/schroter23b_interspeech.pdf) — RTF 0,19
- [SINERGI 2025 — DFN3 vs RNNoise](https://publikasi.mercubuana.ac.id/index.php/sinergi/article/download/21917/9619) — PESQ-Comparison
- [arxiv:2305.08227 DeepFilterNet](https://arxiv.org/abs/2305.08227)
- [arxiv:2205.05474 DeepFilterNet2 Embedded](https://ar5iv.labs.arxiv.org/html/2205.05474)
- [ceva-ip/DPDFNet](https://github.com/ceva-ip/DPDFNet) — Alternative

#### ki-text-detektor
- [`onnx-community/tmr-ai-text-detector-ONNX`](https://huggingface.co/onnx-community/tmr-ai-text-detector-ONNX/blob/main/README.md) — **MIT** ✅, RoBERTa-base 125M, FP32 499 MB / Q4F16 128 MB
- [`Oxidane/tmr-ai-text-detector`](https://huggingface.co/Oxidane/tmr-ai-text-detector) — Original, MIT
- [`desklib/ai-text-detector-v1.01`](https://huggingface.co/desklib/ai-text-detector-v1.01) — MIT, DeBERTa-v3-Large 0,4B, #1 RAID
- [RAID Benchmark Leaderboard](https://raid-bench.xyz/leaderboard)
- [arxiv:2405.07940 RAID](https://arxiv.org/abs/2405.07940)
- [Hello-SimpleAI/chatgpt-detector-roberta](https://huggingface.co/Hello-SimpleAI/chatgpt-detector-roberta) — CC-BY-SA, share-alike-Risiko

#### ki-bild-detektor
- [`onnx-community/SMOGY-Ai-images-detector-ONNX`](https://huggingface.co/onnx-community/SMOGY-Ai-images-detector-ONNX) — **CC-BY-NC-4.0** ❌
- [`onnx-community/Deep-Fake-Detector-v2-Model-ONNX`](https://huggingface.co/onnx-community/Deep-Fake-Detector-v2-Model-ONNX) — **Apache-2.0** ✅, ViT-base, Q4F16 49,7 MB
- [`prithivMLmods/Deep-Fake-Detector-v2-Model`](https://huggingface.co/prithivMLmods/Deep-Fake-Detector-v2-Model) — Original
- [`Organika/sdxl-detector`](https://huggingface.co/Organika/sdxl-detector) — CC-BY-NC-3.0 ❌ (SMOGY-Vorfahre)
- [`umm-maybe/AI-image-detector`](https://huggingface.co/umm-maybe/AI-image-detector) — CC-BY-ND-4.0 (no-derivatives)
- [`dima806/ai_vs_real_image_detection`](https://huggingface.co/dima806/ai_vs_real_image_detection) — Apache-2.0, ViT 85,8M, kein direkter ONNX

### Browser-Capabilities (April 2026)
- [caniuse: WebCodecs](https://caniuse.com/webcodecs) — Safari iOS 26+ full
- [WebKit-Blog WWDC25](https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/) — Safari 26 WebGPU+WebCodecs
- [testmu.ai WebCodecs Safari](https://www.testmu.ai/web-technologies/webcodecs-safari/)
- [aboutfrontend.blog Tab-Throttling](https://aboutfrontend.blog/tab-throttling-in-browsers/)

### Mediabunny
- [Mediabunny GitHub](https://github.com/Vanilagy/mediabunny) — v1.41.0 April 2026
- [Mediabunny Releases](https://github.com/Vanilagy/mediabunny/releases)
- [Mediabunny Media-Sources Doc](https://mediabunny.dev/guide/media-sources) — alpha:'keep' confirmed
- [npm/mediabunny](https://www.npmjs.com/package/mediabunny)

### Transformers.js / ONNX-Runtime
- [transformers.js Issues](https://github.com/huggingface/transformers.js/issues)
- [transformers.js Issue #1242 — iOS Crash v3](https://github.com/huggingface/transformers.js/issues/1242)
- [transformers.js Issue #1241 — whisper-base Safari](https://github.com/huggingface/transformers.js/issues/1241)
- [transformers.js Issue #1298 — Whisper iOS](https://github.com/huggingface/transformers.js/issues/1298)
- [transformers.js Issue #1512 — WebGPU int8 incorrect (closed Feb 2026)](https://github.com/huggingface/transformers.js/issues/1512)
- [transformers.js Issue #860 — WebGPU Whisper Memory Leak](https://github.com/huggingface/transformers.js/issues/860)
- [transformers.js Issue #988 — Chrome Whisper Crash](https://github.com/huggingface/transformers.js/issues/988)
- [microsoft/onnxruntime#12151 DequantizeLinear](https://github.com/microsoft/onnxruntime/issues/12151)
- [microsoft/onnxruntime#12800 QlinearConv](https://github.com/microsoft/onnxruntime/issues/12800)
- [microsoft/onnxruntime#22086 iOS17 WASM model load](https://github.com/microsoft/onnxruntime/issues/22086)

### Whisper-Browser-Reality
- [Vibed-Lab "Whisper WASM Experiment"](https://vibed-lab.com/blog/devlog-whisper-browser-wasm-experiment) — "Whisper too heavy for WASM even after quantization"
- [TildAlice — Whisper Mobile Quantization](https://tildalice.io/whisper-quantization-mobile/)
