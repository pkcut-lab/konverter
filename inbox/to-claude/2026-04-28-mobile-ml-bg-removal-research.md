# Mobile-ML-BG-Removal Deep-Research-Report

**Datum:** 2026-04-28
**Auslöser:** "Failed to fetch" auf Handy bei Bild-Hintergrund-entferner (BEN2-FP16 219 MB via HF-CDN, Transformers.js v4)
**Researcher:** Subagent (~30 Quellen, 2024-2026 priorisiert)

---

## TL;DR Empfehlung

**Wechsle weg von BEN2-FP16 (219 MB, Mobile-Crash-Garant) zu einem Zwei-Modell-Switch: MODNet-Q8 (6,6 MB) als Mobile-Default und BiRefNet_lite-FP16 (115 MB) als Quality-Mode auf Desktop/WebGPU-fähigen Mobile-Geräten.** BEN2-FP16 ist objektiv unbrauchbar auf älteren iPhones (iOS-Safari crasht consistent bei ~100-200 MB Allokation, [bug 199614](https://bugs.webkit.org/show_bug.cgi?id=199614), [Hacker News 2024](https://news.ycombinator.com/item?id=39039593)) — das Modell hat zudem keine Quantisierung-Variante in `onnx-community/BEN2-ONNX`. Hosting bleibt **HF-CDN als Default + Cloudflare R2 als europäischer Mirror via `env.remoteHost`-Switch** (R2-Egress kostenlos, [R2 docs](https://developers.cloudflare.com/r2/)). Preflight-Logik: WebGPU-Detection → Quality-Mode default; sonst Mobile-Detection (UA + `deviceMemory <4GB`) → Mobile-Default mit transparentem Banner ("~7 MB Modell-Download"). Kein Hard-Block auf Mobile — Refined-Minimalism-Ton bleibt.

---

## 1. Modell-Matrix 2026

### Tabelle: Bild-BG-Removal-Modelle für Browser-Inferenz

| Modell | HF-Repo | Größen (Total) | FP32 | FP16 | Q8/uint8 | Q4 | Lizenz | Hair/Edge-Qualität | Mobile-tauglich |
|---|---|---|---|---|---|---|---|---|---|
| **BEN2** | [`onnx-community/BEN2-ONNX`](https://huggingface.co/onnx-community/BEN2-ONNX) | 219 MB | n/a | **219 MB** (nur Variante!) | n/a | n/a | **MIT** ([README](https://huggingface.co/PramaLLC/BEN2/blob/main/README.md)) | ⭐⭐⭐⭐⭐ Hair top, edge refinement state-of-the-art ([Code Canvas review](https://medium.com/code-canvas/background-removal-in-comfyui-just-got-really-really-good-2a12717ff0db)) | ❌ Crasht iOS Safari (>100MB) |
| **RMBG-2.0** | [`briaai/RMBG-2.0`](https://huggingface.co/briaai/RMBG-2.0) | ~440 MB | model.onnx | model_fp16.onnx | model_int8.onnx | model_q4.onnx, model_bnb4.onnx | **CC BY-NC 4.0** — KO für AdSense ([model card](https://huggingface.co/briaai/RMBG-2.0)) | ⭐⭐⭐⭐ Solide all-around | KO durch Lizenz |
| **BiRefNet** | [`onnx-community/BiRefNet-ONNX`](https://huggingface.co/onnx-community/BiRefNet-ONNX) | 880+ MB | ~880 MB | ~440 MB | n/a | n/a | MIT (onnx-community wrapper) | ⭐⭐⭐⭐⭐ Hair excellent, kann over-correct | ❌ Zu groß |
| **BiRefNet_lite** | [`onnx-community/BiRefNet_lite-ONNX`](https://huggingface.co/onnx-community/BiRefNet_lite-ONNX) | 339 MB | **224 MB** | **115 MB** | nicht verfügbar | nicht verfügbar | **MIT** | ⭐⭐⭐⭐ tiny-backbone, ~5× kleiner als full BiRefNet | ⚠️ FP16 möglich auf Mobile mit WebGPU |
| **RMBG-1.4** | [`briaai/RMBG-1.4`](https://huggingface.co/briaai/RMBG-1.4) | ~310 MB | 176 MB | 88,2 MB | **44,4 MB** | n/a | **`bria-rmbg-1.4`** custom (non-commercial) — KO | ⭐⭐⭐ älter, dafür diverses | KO durch Lizenz |
| **MODNet (Xenova mirror)** | [`Xenova/modnet`](https://huggingface.co/Xenova/modnet) | 110 MB | 25,9 MB | **13 MB** | **model_quantized.onnx 6,63 MB** / **model_uint8.onnx 6,63 MB** | model_q4.onnx 23,1 MB / model_q4f16.onnx 11,8 MB / model_bnb4.onnx 23,1 MB | **Apache 2.0** ([README](https://huggingface.co/Xenova/modnet)) | ⭐⭐⭐ Portrait-only-Bias (Mensch-trained); allgemeine Objekte schlechter | ✅ Beste Mobile-Option |
| **U2Net (full)** | div. mirrors | 176 MB | ja | n/a | n/a | n/a | Apache 2.0 | ⭐⭐⭐ veraltet, halo-prone | ❌ zu groß |
| **U2NetP** | div. mirrors | 4,57 MB | ja | n/a | n/a | n/a | Apache 2.0 ([learnopencv](https://learnopencv.com/u2-net-image-segmentation/)) | ⭐⭐ rough edges | ✅ aber zu schlecht |
| **ISNet-general-use** | [`Trendyol/background-removal`](https://huggingface.co/Trendyol/background-removal) | 176 MB | ja | n/a | n/a | n/a | **CC BY-SA 4.0** (share-alike — riskant, prüfen) | ⭐⭐⭐ general-purpose | ❌ zu groß |
| **InSPyReNet** | [transparent-background](https://github.com/plemeri/transparent-background) | 350+ MB | ja | n/a | n/a | n/a | MIT (code), Modell-Lizenz prüfen | ⭐⭐⭐⭐ pyramid-strong, hair gut | ❌ zu groß, kein offizieller Transformers.js-Path |
| **Silueta** | div. mirrors | 43 MB | ja | n/a | n/a | n/a | Apache 2.0 (U2Net-Derivat) | ⭐⭐⭐ U2Net-Trim | ⚠️ marginal Mobile-tauglich |

**Hinweis BEN2:** Trotz "Upload highly-optimized version (#4)"-Commit (laut README-Aussage Xenova HF Staff vor ca. 2 Monaten) ist im `onnx/`-Ordner aktuell **nur `model_fp16.onnx` mit 219 MB** sichtbar. Das ist der zentrale Defekt: kein Q8/Q4-Pfad für Mobile.

### Top-3 Empfehlung

1. **MODNet-Q8/uint8 (6,63 MB)** — *Mobile-Default*. Apache-2.0 ist wasserdicht für AdSense. Xenova hostet ein offizielles, Transformers.js-getestetes Mirror. Schwäche: portrait-trained, nicht-Personen-Bilder schlechter. Das ist der Trade-off für ein 6,63-MB-Footprint.
2. **BiRefNet_lite-FP16 (115 MB)** — *Quality-Default für Desktop und WebGPU-Mobile*. MIT-Lizenz, swin-tiny backbone, x4+ schneller als full BiRefNet. Funktioniert auf iOS 26 mit WebGPU; auf älteren iOS marginale Crash-Gefahr.
3. **BEN2-FP16 (219 MB)** — *Optionale "Pro"-Stufe nur Desktop*. Beste Hair-Qualität laut Reviews ([Innovate Futures](https://www.patreon.com/posts/comfyui-with-not-122122962)). Auf Mobile **nicht laden**. Wenn man Storage-Budget hat: behalten als opt-in-Toggle für Desktop-User die maximale Edge-Qualität wollen.

**KOs**: RMBG-2.0 (CC-BY-NC), RMBG-1.4 (custom non-commercial), `@imgly/background-removal` (AGPL — explizit verworfen, korrekt).

---

## 2. Mobile-Browser-Realität

### 2.1 WebGPU-Support 2026 (Stand 2026-04-28)

| Browser | WebGPU | Quelle |
|---|---|---|
| **iOS Safari 26+** (iOS 26+, released Sept 2025) | ✅ default-on, full | [WebKit Blog WWDC25](https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/), [Releasebot Apr 2026](https://releasebot.io/updates/apple/safari) |
| **iOS Safari ≤25** | ❌ | ältere iOS-Geräte ohne iOS-26-Update |
| **Android Chrome 121+** | ✅ default-on bei Qualcomm/ARM, Android 12+ | [web.dev WebGPU](https://web.dev/blog/webgpu-supported-major-browsers) |
| **Samsung Internet** | ✅ neuere Versionen | [WebGPU.com](https://www.webgpu.com/news/webgpu-hits-critical-mass-all-major-browsers/) |
| **Firefox Mobile** | ❌ Android-Arbeit für 2026 angekündigt | [GPUweb wiki](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status) |

**Konsequenz:** Auf modernem iPhone/iPad (iOS 26+) läuft WebGPU. Auf iPhone 6/7/8/SE (alt) und älteren iOS-Versionen: WASM-Fallback erzwungen.

### 2.2 WebAssembly-Memory-Limits

- **iOS Safari (mobile, 2026):** Crashes consistent bei **~100 MB auf iPhone SE und ~200 MB auf iPad** unter iOS 26.2 ([lapcatsoftware.com Jan 2026](https://lapcatsoftware.com/articles/2026/1/7.html)). Memory64 (>4 GB) noch **nicht** in Safari ([Platform.uno State of WASM 2024-2025](https://platform.uno/blog/state-of-webassembly-2024-2025/)). 2-GB-WASM-Limit triggert OOM auf iOS 16.2 ([Godot Issue #70621](https://github.com/godotengine/godot/issues/70621)).
- **Page-Reload-Bug:** Auf Mobile Safari werden Resources beim Reload nicht immer befreit → OOM beim zweiten Load ([Emscripten Issue #19374](https://github.com/emscripten-core/emscripten/issues/19374)). Relevant für Tool-Wiederbenutzung.
- **Android Chrome:** weniger restriktiv. WebLLM crasht aber Pixel 6a (6 GB RAM) bei größeren LLMs ([web-llm Issue #524](https://github.com/mlc-ai/web-llm/issues/524)).
- **Tatsächliche Konsequenz für 219-MB-BEN2:** Modell-Download + ONNX-Runtime-Init + Image-Buffer + Pipeline-Working-Memory ≈ leicht 400-600 MB Peak. Garantiert iOS-Crash auf <iPhone-12-Klasse.

### 2.3 Background-Throttling (Tab inaktiv / Lock-Screen)

- iOS Safari throttelt CPU/Network bei inaktiven Tabs hart, **Fetch-Requests können abgebrochen werden** ([aboutfrontend.blog](https://aboutfrontend.blog/tab-throttling-in-browsers/)). Bekannt: Safari 26 + iOS 26 — Background-Downloads schlagen sogar bei aktivem Download fehl ([Apple Discussions Sept 2025](https://discussions.apple.com/thread/256160022)).
- **Direkte Implikation für `prepareBackgroundRemovalModel`:** Während des 219-MB-Downloads darf der User nicht den Tab wechseln oder Bildschirm sperren — sonst killt iOS das Fetch. Watchdog 120 s (aktuell) sieht das nicht als Stall, sondern als finalen Fail.

### 2.4 Mobile-Detection-APIs

| API | iOS Safari | Android Chrome | Verlässlichkeit |
|---|---|---|---|
| `navigator.deviceMemory` | ❌ undefined | ✅ Chromium | nur Chromium ([caniuse](https://caniuse.com/mdn-api_navigator_devicememory)) |
| `navigator.connection.effectiveType` | ❌ | ✅ Chromium | nur Chromium ([WICG netinfo](https://wicg.github.io/netinfo/)) |
| `navigator.connection.saveData` | ❌ | ✅ Chromium | nur Chromium |
| `navigator.userAgentData` | ❌ explizit nicht in iOS Chrome ([Issue #21308](https://github.com/mdn/browser-compat-data/issues/21308)) | ✅ Chromium | nicht-Baseline |
| `navigator.gpu` (WebGPU) | ✅ ab iOS 26 | ✅ Chrome 121+ | beste Cross-Browser-Probe |

**Robuste Strategie:** Feature-Detection statt UA-Sniffing. Konkrete Reihenfolge:
1. `'gpu' in navigator && await navigator.gpu.requestAdapter()` → WebGPU-Pfad
2. `navigator.deviceMemory` falls vorhanden und `< 4` → Low-RAM-Pfad
3. `navigator.connection.effectiveType` falls vorhanden und `'slow-2g' | '2g' | '3g'` → Mobile-Default + Banner mit Größe
4. UA-String als letzter Fallback (`/iPhone|iPad|Android/i`)
Achtung: Step 2-3 fallen auf iOS Safari leise weg → dort UA-Fallback aktiv. Das ist ok, denn iOS 26+ hat WebGPU (Step 1 fängt ab); ältere iOS triggern UA → Mobile-Default.

### 2.5 iOS-Safari-Stolperfallen

- **`createImageBitmap`:** Memory-Leak in Safari 15 ([WebKit bug 229825](https://bugs.webkit.org/show_bug.cgi?id=229825)). Image-Resource-Limit ~5 MP bei <256 MB RAM, ~5 MP bei ≥256 MB RAM. Mobile Safari stoppt Bild-Display bei 8-10 MB Image-Total.
- **IndexedDB:** **500 MB Default-Limit** auf iOS Safari (oder die Hälfte des freien Speichers, wenn <1 GB frei) — [WebKit bug 199614](https://bugs.webkit.org/show_bug.cgi?id=199614). Ab Safari 17 (iOS 17+) **80 % des Disk-Space** für Browser-Apps ([WebKit Storage Policy](https://webkit.org/blog/14403/updates-to-storage-policy/)). **Eviction nach 7 Tagen Inaktivität** — Modell-Cache verschwindet → Re-Download Pflicht.
- **Float32-vs-Float16:** iOS Safari hatte Probleme mit float32 ONNX, float16 stabiler ([transformers.js Issue #1242](https://github.com/huggingface/transformers.js/issues/1242)). Daher wirkt FP16 als Default vernünftig — passt zu BEN2-FP16 und MODNet-FP16.
- **Transformers.js v3+ crasht iOS** explizit ([Issue #1242](https://github.com/huggingface/transformers.js/issues/1242)) — Workaround: Downgrade auf 2.15.1 oder Modell wechseln. **Aktuell läuft kittokit auf v4** → muss validiert werden, ob v4 das v3-Issue gefixt hat.
- **OffscreenCanvas:** in Safari ab 16.4 verfügbar — sollte mit aktueller Codebase funktionieren.

---

## 3. Hosting / CDN-Strategie

### 3.1 Hugging-Face-CDN (aktuelle Default-Config)

- **Backbone:** AWS CloudFront mit 400+ Edge-Locations, inklusive Frankfurt (FRA60) ([HF Blog: Rearchitecting Uploads](https://huggingface.co/blog/rearchitecting-uploads-and-downloads)).
- **Bekannte DE-Probleme:** 503/504 von Frankfurt-Edge dokumentiert ([HF Forums](https://discuss.huggingface.co/t/hfhubhttperror-503-server-error/151000), [HF Issue #1903](https://github.com/huggingface/huggingface_hub/issues/1903)). Range-Request-Support: ja (CloudFront-Standard).
- **Mobile-Carrier-Risiko:** Carrier-NAT/Proxy auf 4G/5G kann CloudFront-Range-Requests umordnen → unvollständiger Download ohne Resume → "Failed to fetch". Kein dedizierter Statuspage-Eintrag, aber Forum-Hinweise.

### 3.2 jsDelivr als HF-Mirror

- jsDelivr spiegelt **npm-Pakete** wie `@huggingface/transformers` (lib selbst), **nicht aber HF-Modell-Repos** automatisch. Der `cdn.jsdelivr.net/npm/@huggingface/transformers@4.x.x/...`-Pfad liefert nur die Library, nicht die Gewichte.
- **Konsequenz:** jsDelivr ist KEIN Modell-Host-Drop-in-Ersatz. Modell-Mirror muss über `env.remoteHost` auf einen eigenen CDN gezeigt werden.

### 3.3 Cloudflare R2 als Modell-Mirror

- **Egress:** kostenlos beim Lesen (zentraler R2-USP, [R2 product page](https://www.cloudflare.com/developer-platform/products/r2/)).
- **Free-Tier:** 10 GB Storage, 1 M Class-A-Operations/Monat, 10 M Class-B-Operations/Monat. 150 MB × 1000 DL/Monat = 150 GB Egress = **0 €**, Storage-Kosten 0,015 USD/GB/Monat = **~0,002 USD/Monat** für ein Modell.
- **CORS:** Public Bucket + CORS-Policy via Dashboard oder AWS-CLI mit `--endpoint-url` ([R2 CORS docs](https://developers.cloudflare.com/r2/buckets/cors/)). `AllowedOrigins: ["https://kittokit.tld"]`, `AllowedMethods: ["GET","HEAD"]`. Nötig für Browser-Fetch.
- **Range-Requests:** R2 unterstützt sie nativ (S3-API-kompatibel).
- **Realistische Setup-Zeit:** ~30 min wenn Cloudflare-Account schon steht. Wrangler-CLI-Upload-Skript schreibt der Hauptagent in <2 h.
- **Custom-Domain:** R2 unterstützt Public-Bucket-Custom-Domains (`models.kittokit.tld`) — nimmt das Cookie/CORS-Risiko aus dem Spiel.

### 3.4 Cloudflare Pages Static (KO für Modelle)

- **Asset-Limit:** 25 MiB pro File ist als Limit auf Cloudflare Pages 2025 weiterhin aktiv ([Pages Limits docs](https://developers.cloudflare.com/pages/platform/limits/)). 219 MB BEN2 = **direkt KO** für Pages-Static. **Beachte:** Workers (das neuere Cloudflare-Static-Asset-Modell) hat seit 2025-09-02 erhöhte Limits — aber Pages alleine bleibt bei 25 MiB.
- Selbst MODNet-Q8 mit 6,63 MB würde reinpassen, aber: Modelle gehören architekturell zu R2, nicht zum Pages-Bundle (Sonderbehandlung in Build-Pipeline, Cache-Headers etc.).

### 3.5 Modell-Splitting / Streaming

- ONNX selbst unterstützt **External Data Format** für Modelle >2 GB. Der Loader kann mehrere Files lesen (z.B. `model.onnx` + `model.onnx_data`) — Transformers.js handhabt das transparent, aber: bekannter Failure-Mode war "deserialization failed when loading external data files" ([Issue #1194](https://github.com/huggingface/transformers.js/issues/1194)).
- **Praktisch:** Splitting bringt für 219 MB nichts. Quantisierung (FP16 → Q8 → Q4) ist der bessere Hebel. Modell-Chunking ist relevant erst bei >2 GB.

### 3.6 Empfohlene Konfiguration

```ts
import { env } from '@huggingface/transformers';

// Default: HF (es funktioniert für 90% der Fälle)
// Switch via Feature-Flag oder Geo-Detection auf R2-Mirror:
if (shouldUseR2Mirror()) {
  env.remoteHost = 'https://models.kittokit.tld';
  env.remotePathTemplate = '{model}/';
}
env.useBrowserCache = true; // IndexedDB-Cache aktiv (default true)
```

`env.remoteHost` und `env.remotePathTemplate` sind in der offiziellen [`env`-API-Doku](https://huggingface.co/docs/transformers.js/en/api/env) explizit dokumentiert. Beide sind String-Properties auf `TransformersEnvironment`.

---

## 4. Konkurrenz-Mobile-Strategie

### 4.1 Architektur-Vergleich

| Konkurrent | Architektur | Mobile-UX | Modellgröße offengelegt | Ladestrategie |
|---|---|---|---|---|
| **remove.bg** | server-side ([API docs](https://www.remove.bg/api)) | Web + native iOS/Android-Apps | nicht offengelegt | API-Call (12 MB Upload-Limit) |
| **PhotoRoom** | server-side mit Mobile-First-Architektur ([Photoroom blog](https://www.photoroom.com/api/photoroom-vs-removebg)) | native Apps primär; Web als Companion | nicht offengelegt | Cloud-Upload + Sync |
| **Pixelcut/Pixa** | server-side mit Privacy-Statement "nicht gespeichert" ([Pixa docs](https://www.pixa.com/background-remover)) | Web + Apps; 20 MB Upload-Limit | nicht offengelegt | Cloud-Process |
| **Erase.bg / cleanup.pictures (ClipDrop)** | server-side | Web + Apps | nicht offengelegt | Cloud |
| **`@imgly/background-removal`** (npm) | **client-side** (WASM+WebGPU) | Web only | ~140 MB ([package readme](https://www.npmjs.com/package/@imgly/background-removal)) | Lazy-Load, IndexedDB-Cache |
| **Xenova HF Spaces (Remove Background Web)** | **client-side** ([HF Space](https://huggingface.co/spaces/Xenova/remove-background-web)) | Web | ~45 MB (RMBG-1.4 Q8) | "even works on mobile" — explizit |
| **Trendyol/background-removal HF Space** | client-side ONNX | Web | 176 MB IS-Net | Eager-Load |

**Marktkonsens:** Die *kommerziellen* Player (remove.bg, PhotoRoom, Pixelcut) sind **alle server-side**, weil sie Mobile-Stabilität nicht riskieren wollen. Client-side BG-Removal ist 2026 eine **Open-Source-/Demo-/Privacy-Fokus-Nische**, nicht der Mainstream. Xenova selbst optimierte sein Spaces-Demo auf 45 MB Q8 explizit "for in-browser usage and even works on mobile" — sie wussten, dass FP16 auf Mobile bricht.

### 4.2 User-Beschwerden (Trustpilot, G2, Reddit)

- **PhotoRoom:** "if your photo has something tricky—hair, fur, glass, or shadows—Photoroom starts to struggle, with edges that can look rough or have weird white halos around your subject" ([gstory.ai review](https://www.gstory.ai/blog/photoroom-bg-remover/))
- **PhotoRoom:** "the app is more 'glitchy' than ever with more 'fix it' work required on photos than before. Upon removing the background it often removes parts of the item photographed as well" ([G2 reviews](https://www.g2.com/products/photoroom/reviews?qs=pros-and-cons))
- **PhotoRoom:** "experiencing issues on a daily basis with the app crashing, not being able to upload, and if they do upload, not being able to export" ([Trustpilot](https://www.trustpilot.com/review/www.photoroom.com))
- **iOS-Native-Background-Remover (iOS 16+):** "iOS 16 gets confused" wenn Bild nicht in Portrait-Mode aufgenommen oder Subjekt teilweise verdeckt ([Digital Trends](https://www.digitaltrends.com/phones/apple-ios-16-background-remover-iphone-hands-on/))

**Pain-Points kategorisiert:**
- **Quality:** Halos, hair-edge-Artefakte, Subjekt-Cropping-Fehler.
- **UX:** Subscription-Friction, App-Crashes, schlechter Support.
- **Privacy:** kaum Beschwerden — User akzeptieren server-Upload meistens, aber das ist für kittokit's Privacy-First-USP irrelevant.
- **Missing-Features:** kein Mass-Process, kein Edit-after-Removal in den meisten Free-Tiers.

### 4.3 Trend-Analyse

Client-side BG-Removal ist 2026 **Nische, aber wachsend** durch:
1. **Privacy-as-a-Feature** — Trustpilot-Reviews mit Datenschutz-Lob nehmen zu.
2. **WebGPU-Reife** — Safari 26 schließt das Apple-Loch (Sept 2025).
3. **Modell-Quantisierung** — uint8/Q4-Varianten machen Mobile-Inferenz realistisch.
4. **AdSense-Modelle** — Privacy-First + AdSense funktionieren zusammen, weil keine User-Daten zur Server-Inferenz gehen, nur Anzeigen-Impressions.

**Marktlücke** für kittokit: kostenfreies, multilinguales, **client-side** BG-Removal mit **Quality/Speed-Switch** und transparenter Modell-Größe. Niemand kommuniziert das Modell-Größen-Trade-off offen — alle versuchen es zu kaschieren.

---

## 5. Preflight-Patterns aus erfolgreichen ML-im-Browser-Apps

### 5.1 Patterns-Audit

| App | Mobile-Behavior | Banner-Copy / Warning | Retry-Pattern |
|---|---|---|---|
| **Whisper Web (Xenova)** | wird Mobile **nicht blockiert**, aber crasht iOS Safari ([Issue #1298](https://github.com/huggingface/transformers.js/issues/1298)) — User merkt's selbst | keine explizite Banner-Warnung, nur Loading-Bar | kein Retry |
| **Xenova Remove-Background-Web** | erlaubt, läuft auf Mobile mit Q8-Modell (~45 MB) | minimaler Loading-State | kein Retry |
| **Xenova Remove-Background-WebGPU** | erlaubt, fällt zurück bei kein-WebGPU | minimaler Loading-State | kein Retry |
| **WebLLM (mlc-ai)** | crasht Mobile, kein expliziter Block ([Issue #524](https://github.com/mlc-ai/web-llm/issues/524)) | kein Banner, User-Diskussion in Issues über "Mobile-Roadmap" | kein Retry |
| **Pose-Detection (TF.js)** | Mobile ok mit kleinen Modellen | keine Banner | kein Retry |
| **`@imgly/background-removal`** | erlaubt aber 140 MB Sprung | keine Modell-Größen-Anzeige | kein Retry |

**Beobachtung:** Die meisten ML-Web-Demos kommunizieren **nicht** transparent, was geladen wird. User sehen einen Lade-Balken, nicht ein "200 MB werden gerade aus den USA gestreamt"-Hinweis. Das ist eine Lücke, die kittokit füllen kann ohne Anti-Mobile zu wirken.

### 5.2 Retry-Pattern Best-Practice

Aus der allgemeinen Web-Literatur ([Advanced Web Machinery](https://advancedweb.hu/how-to-implement-an-exponential-backoff-retry-strategy-in-javascript/)):

```ts
async function fetchWithRetry(url: string, opts = {}, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const r = await fetch(url, opts);
      if (r.ok) return r;
      if (attempt === retries) throw new Error(`HTTP ${r.status}`);
    } catch (err) {
      if (attempt === retries) throw err;
      const delay = Math.min(500 * 2 ** attempt + Math.random() * 100, 8000);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}
```

**Konkret für Modell-Download:** Transformers.js fetcht die Gewichte selbst — Retry muss über `env.fetch`-Override eingehängt werden (existiert in der API). 3 Retries × 0,5/1/2 s + Jitter ist Standard.

### 5.3 Banner-Copy-Vorschläge

**DE (Mobile, mit Modell-Größen-Disclosure, nicht-bevormundend):**

> Lädt einmalig ein **6,6 MB**-Modell. Datenverbrauch nur beim ersten Mal — danach offline nutzbar. Auf langsamem Mobilfunk dauert der Download wenige Sekunden.

**EN (mirror):**

> One-time **6.6 MB** model download. Mobile data only on the first run; after that the tool works offline. On slow connections this takes a few seconds.

**Quality-Mode-Toggle (Desktop / WebGPU-Mobile):**

DE: *Schärfere Kanten — lädt **115 MB** statt 6,6 MB. Empfohlen ab Desktop oder iPhone-12-Klasse.*
EN: *Sharper edges — downloads **115 MB** instead of 6.6 MB. Recommended on desktop or iPhone-12-class devices.*

**Stall/Fail-Banner (nach 120 s ohne Progress):**

DE: *Download stockt. **Erneut versuchen** oder zur **Schnell-Variante** (6,6 MB) wechseln.*
EN: *Download stalled. **Retry** or switch to the **fast variant** (6.6 MB).*

Refined-Minimalism-Ton: keine Emojis, keine Ausrufezeichen, keine "Oh nein" Verzweiflung, kein "Stark!" Marketing. Numerik direkt, Optionen klar, User entscheidet.

---

## Konkrete Empfehlung für kittokit

### Modell-Strategie

- **Mobile-Default** (`!WebGPU && (deviceMemory<4 || mobileUA)`): **MODNet uint8/q8 (6,63 MB)** aus `Xenova/modnet`. Apache-2.0, getestet, Transformers.js-officially-supported.
- **Quality-Mode** (Desktop oder WebGPU-Mobile mit deviceMemory ≥4 oder unbekannt): **BiRefNet_lite-FP16 (115 MB)** aus `onnx-community/BiRefNet_lite-ONNX`. MIT-Lizenz.
- **Pro-Mode** (opt-in Toggle, Desktop only): **BEN2-FP16 (219 MB)** aus `onnx-community/BEN2-ONNX`. MIT, beste Hair-Qualität — aber NIEMALS auf Mobile. Idealerweise hinter einem expliziten "Maximale Qualität (Desktop empfohlen)"-Toggle.

### Hosting

- **Default:** HF-CDN (`huggingface.co/{repo}/resolve/main/...`) — funktioniert für 90 % der User.
- **Fallback:** **Cloudflare R2** unter `models.kittokit.tld` mit Custom-Domain + Public-Bucket + CORS auf `kittokit.tld`. Aktiviert via `env.remoteHost`-Switch entweder permanent (Phase 2) oder als Retry-Path nach erstem HF-Fail. R2-Free-Tier reicht für die ersten Monate locker.
- **Cloudflare Pages Static:** ❌ wegen 25-MiB-Limit. Modelle bleiben in R2.

### Preflight-Logik (Pseudo-Code)

```ts
async function chooseModelVariant(): Promise<{
  variant: 'fast' | 'quality' | 'pro';
  showBanner: BannerKind;
}> {
  const hasWebGPU = await detectWebGPU();
  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
  const lowRam = (navigator as any).deviceMemory != null && (navigator as any).deviceMemory < 4;
  const slowNet = (navigator as any).connection?.effectiveType?.match(/slow-2g|2g|3g/);
  const saveData = (navigator as any).connection?.saveData === true;

  // Pro: nur Desktop, nicht low-ram, nicht save-data
  if (!isMobile && !lowRam && !saveData && userTogglePro) {
    return { variant: 'pro', showBanner: 'pro-info-219mb' };
  }

  // Mobile: hartes Mobile-Default außer WebGPU+genug-RAM
  if (isMobile && (!hasWebGPU || lowRam || slowNet || saveData)) {
    return { variant: 'fast', showBanner: 'mobile-info-7mb' };
  }

  // Default: Quality
  return { variant: 'quality', showBanner: 'quality-info-115mb' };
}
```

**Watchdog:** aktuell 120 s — auf Mobile-Cellular zu kurz. **Vorschlag: 240 s auf Mobile, 60 s auf Desktop.** 219 MB über 4G mit 5 MB/s = 44 s; bei 1 MB/s = 220 s. Watchdog auf "no progress event for X seconds" statt "total time" lassen, aber X mobile-aware.

**Retry-UI:** beim StallError den User explizit fragen: "Erneut versuchen" / "Schnell-Variante (6,6 MB) laden". Das ist die fehlende UX-Verbesserung gegenüber dem heutigen Code.

### Quality/Speed-Switch — sinnvoll?

**Ja, klar.** Drei Modi:
- *Schnell* (6,6 MB MODNet) — Mobile-Default, Portraits ok, allgemeine Objekte mittel.
- *Qualität* (115 MB BiRefNet_lite-FP16) — Desktop-Default, alle Objekte gut, Hair gut.
- *Maximum* (219 MB BEN2) — Desktop-opt-in, Hair-Edge state-of-the-art.

Jeder Modus mit Modell-Größe in der UI sichtbar — das ist der Differenzierungs-Hebel ggü. Konkurrenz (die zeigen es nicht).

### Was wir NICHT bauen

- **Kein server-side Fallback.** Privacy-First-USP bleibt. Alle drei Modi sind client-side.
- **Kein eigenes Modell-Training.** MIT/Apache-Modelle reichen.
- **Kein Mobile-Hard-Block** ("Diese App funktioniert nicht auf Mobile") — das wäre Feature-Verzicht. Stattdessen: kleineres Modell + Banner.
- **Kein Auto-Quality-Upgrade auf Mobile** ohne explizites User-Opt-in. iOS-Crash-Risiko zu hoch.
- **Kein iOS-Safari-Hard-Block** — selbst ältere iOS-Geräte bekommen das 6,6-MB-MODNet sauber durch.
- **Keine RMBG-2.0/RMBG-1.4-Integration** — Lizenzen schließen AdSense-Phase aus.
- **Kein `@imgly/background-removal`** — AGPL-Risiko bestätigt.

### Was wir bewusst offen lassen

- Lighthouse/Web-Vitals für 219-MB-Pro-Mode-Hydration — wahrscheinlich CLS/LCP-Hit. Daher Pro-Mode hinter `<details>`-Accordion oder separater Settings-Toggle, nicht im First-Paint-Bundle.
- Ob Transformers.js v4 die in v3 dokumentierten iOS-Crashes ([Issue #1242](https://github.com/huggingface/transformers.js/issues/1242)) gefixt hat — der Issue ist offen geblieben. Empfehlung: vor Phase-2-Launch eine echte iPhone-SE-Smoke-Test-Runde (Sauce Labs / BrowserStack).

---

## Offene Fragen

1. **BEN2 echte Q8-Variante?** Auf der `onnx-community/BEN2-ONNX`-Seite war heute (2026-04-28) **nur `model_fp16.onnx` 219 MB sichtbar**, kein Q8/Q4. Der README-Commit "Upload highly-optimized version (#4)" deutet auf Optimization-Arbeit hin, aber eine Quantisierung-Variante fehlt im Public-Repo. Falls Xenova auf Anfrage einen Q8-Build pusht: 50-60 MB BEN2 wäre die ideale Mobile-Lösung, da Hair-Qualität BEN2 > MODNet. Issue dort öffnen.
2. **Aktuelle Carrier-CDN-Failure-Rate aus DE auf HF-CloudFront** — keine harte Statistik gefunden. Nur anekdotische Forum-Reports von 503/504 aus FRA60. Production-Telemetrie nach Phase-2-Launch klären.
3. **Transformers.js v4 + iOS Safari 26.x Live-Test** — bekannt ist v3-iOS-Crash-Issue; v4 nicht explizit als gefixt dokumentiert. Manueller Test auf iPhone (alt) + iPad nötig.
4. **MODNet vs MODNet-Mobile (Q4 vs Q8) — Qualitäts-Trade-off** — `model_q4f16.onnx` (11,8 MB) und `model_quantized.onnx` (6,63 MB) sind beide in Xenova/modnet-Repo. Welcher hat besseres Quality/Size-Verhältnis? Eigener Bench mit 10 Test-Bildern empfohlen.
5. **DeepFilterNet-Mobile-Speech-Enhancer-Größe** — ONNX-Export ist 3-File-Split (enc/erb_dec/df_dec). Genaue Sizes nicht aus DeepWiki klar. Eigenes Repo prüfen, eigene Spec-Sektion.

---

## Quellen

### Modelle (HF)
- [PramaLLC/BEN2 (README + License)](https://huggingface.co/PramaLLC/BEN2) — Zugriff 2026-04-28
- [PramaLLC/BEN2 README.md](https://huggingface.co/PramaLLC/BEN2/blob/main/README.md) — MIT-Lizenz, Commercial Hint
- [onnx-community/BEN2-ONNX](https://huggingface.co/onnx-community/BEN2-ONNX) — 219 MB FP16, MIT
- [onnx-community/BiRefNet_lite-ONNX](https://huggingface.co/onnx-community/BiRefNet_lite-ONNX) — 224 MB / 115 MB FP16
- [onnx-community/BiRefNet-ONNX](https://huggingface.co/onnx-community/BiRefNet-ONNX) — Full-size variant
- [Xenova/modnet (ONNX-Variants)](https://huggingface.co/Xenova/modnet) — Apache 2.0, 6,63-25,9 MB
- [briaai/RMBG-2.0](https://huggingface.co/briaai/RMBG-2.0) — CC BY-NC 4.0
- [briaai/RMBG-1.4](https://huggingface.co/briaai/RMBG-1.4) — bria-rmbg-1.4 custom NC
- [Trendyol/background-removal](https://huggingface.co/Trendyol/background-removal) — CC BY-SA 4.0
- [ZhengPeng7/BiRefNet GitHub](https://github.com/ZhengPeng7/BiRefNet) — CAAI AIR 2024 paper
- [PramaLLC/BEN2 GitHub](https://github.com/PramaLLC/BEN2/) — MIT, BEN2-Architektur

### Hugging Face Spaces (Demos)
- [Xenova/remove-background-web](https://huggingface.co/spaces/Xenova/remove-background-web) — RMBG-1.4 Q8 ~45 MB
- [Xenova/remove-background-webgpu](https://huggingface.co/spaces/Xenova/remove-background-webgpu)
- [Xenova/webgpu-video-background-removal](https://huggingface.co/spaces/Xenova/webgpu-video-background-removal)
- [@Xenova HF post](https://huggingface.co/posts/Xenova/262978955052408) — "8-bit quantized version… even works on mobile"

### Transformers.js
- [transformers.js GitHub](https://github.com/huggingface/transformers.js/) — Library
- [transformers.js env API](https://huggingface.co/docs/transformers.js/en/api/env) — `remoteHost`, `useBrowserCache` u.a.
- [transformers.js Custom Usage](https://huggingface.co/docs/transformers.js/en/custom_usage) — env.remoteHost example
- [transformers.js Issue #1242 (iOS crash)](https://github.com/huggingface/transformers.js/issues/1242)
- [transformers.js Issue #1298 (Whisper iOS)](https://github.com/huggingface/transformers.js/issues/1298)
- [transformers.js Issue #801 (segment-anything iOS)](https://github.com/huggingface/transformers.js/issues/801)
- [transformers.js Issue #432 (cannot download model)](https://github.com/huggingface/transformers.js/issues/432)
- [transformers.js Issue #1194 (CDN external data)](https://github.com/huggingface/transformers.js/issues/1194)
- [transformers.js Issue #748 (Failed to fetch dynamic import)](https://github.com/huggingface/transformers.js/issues/748)

### Browser Capabilities
- [caniuse: WebGPU](https://caniuse.com/webgpu)
- [caniuse: navigator.deviceMemory](https://caniuse.com/mdn-api_navigator_devicememory) — Chromium-only
- [caniuse: navigator.userAgentData](https://caniuse.com/mdn-api_navigator_useragentdata) — limited Safari
- [caniuse: createImageBitmap](https://caniuse.com/createimagebitmap)
- [WebKit blog WWDC25 — WebGPU iOS 26](https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/)
- [WebKit blog Storage Policy iOS 17+](https://webkit.org/blog/14403/updates-to-storage-policy/)
- [WebKit bug 199614 — IndexedDB 500 MB](https://bugs.webkit.org/show_bug.cgi?id=199614)
- [WebKit bug 229825 — createImageBitmap memory leak](https://bugs.webkit.org/show_bug.cgi?id=229825)
- [WebGPU.com — Critical Mass news](https://www.webgpu.com/news/webgpu-hits-critical-mass-all-major-browsers/)
- [GPUweb wiki — Implementation Status](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status)
- [web.dev — WebGPU all major browsers](https://web.dev/blog/webgpu-supported-major-browsers)
- [Releasebot — Safari April 2026](https://releasebot.io/updates/apple/safari)
- [Apple Discussions — Safari 26 background download fail](https://discussions.apple.com/thread/256160022)
- [aboutfrontend.blog — Inactive Tab Throttling](https://aboutfrontend.blog/tab-throttling-in-browsers/)

### Memory / WASM
- [Platform.uno State of WebAssembly 2024-2025](https://platform.uno/blog/state-of-webassembly-2024-2025/) — Memory64 not in Safari
- [lapcatsoftware.com — Mobile Safari pages limited by memory (Jan 2026)](https://lapcatsoftware.com/articles/2026/1/7.html) — 100 MB iPhone SE / 200 MB iPad crashes
- [Hacker News thread iOS Safari memory limit](https://news.ycombinator.com/item?id=39039593)
- [Emscripten Issue #19374 — iOS OOM on reload](https://github.com/emscripten-core/emscripten/issues/19374)
- [Godot Issue #70621 — WASM 2 GB OOM iOS Safari 16.2](https://github.com/godotengine/godot/issues/70621)

### Hosting / CDN
- [Cloudflare R2 — product](https://www.cloudflare.com/developer-platform/products/r2/)
- [Cloudflare R2 docs](https://developers.cloudflare.com/r2/)
- [R2 CORS](https://developers.cloudflare.com/r2/buckets/cors/)
- [R2 Public Buckets](https://developers.cloudflare.com/r2/buckets/public-buckets/)
- [Cloudflare Pages limits — 25 MiB asset](https://developers.cloudflare.com/pages/platform/limits/)
- [Cloudflare Workers static-asset increase 2025-09-02](https://developers.cloudflare.com/changelog/2025-09-02-increased-static-asset-limits/)
- [HF Blog — Rearchitecting Uploads/Downloads](https://huggingface.co/blog/rearchitecting-uploads-and-downloads)
- [HF Forum — 503 Server Error](https://discuss.huggingface.co/t/hfhubhttperror-503-server-error/151000)
- [HF Hub Issue #1903 — snapshot_download timeout no resume](https://github.com/huggingface/huggingface_hub/issues/1903)
- [HF Hub Issue #2581 — 504 Gateway Timeout](https://github.com/huggingface/huggingface_hub/issues/2581)
- [jsDelivr @huggingface/transformers](https://www.jsdelivr.com/package/npm/@huggingface/transformers)

### Konkurrenz
- [remove.bg API docs](https://www.remove.bg/api)
- [PhotoRoom API docs](https://docs.photoroom.com/)
- [PhotoRoom vs remove.bg comparison](https://www.photoroom.com/api/photoroom-vs-removebg)
- [PhotoRoom Trustpilot](https://www.trustpilot.com/review/www.photoroom.com)
- [PhotoRoom G2 reviews](https://www.g2.com/products/photoroom/reviews?qs=pros-and-cons)
- [eesel.ai Photoroom review 2025](https://www.eesel.ai/blog/photoroom-reviews)
- [Pixa (Pixelcut) Background Remover](https://www.pixa.com/background-remover)
- [@imgly/background-removal-js GitHub](https://github.com/imgly/background-removal-js) — AGPL
- [@imgly/background-removal LICENSE](https://github.com/imgly/background-removal-js/blob/main/LICENSE.md)

### Reviews / Benchmarks
- [Code Canvas — Background Removal in ComfyUI review](https://medium.com/code-canvas/background-removal-in-comfyui-just-got-really-really-good-2a12717ff0db) — Modell-Vergleich
- [briaai/RMBG-2.0 discussion: difference vs BiRefNet](https://huggingface.co/briaai/RMBG-2.0/discussions/9)
- [ComfyUI-RMBG project](https://github.com/1038lab/ComfyUI-RMBG)
- [Innovate Futures — BEN2 ComfyUI review](https://www.patreon.com/posts/comfyui-with-not-122122962)
- [IMG.LY — 20x Faster Browser BG Removal](https://img.ly/blog/browser-background-removal-using-onnx-runtime-webgpu/)
- [LearnOpenCV — U2-Net intro](https://learnopencv.com/u2-net-image-segmentation/)

### Patterns
- [Advanced Web Machinery — exponential backoff JS](https://advancedweb.hu/how-to-implement-an-exponential-backoff-retry-strategy-in-javascript/)
- [exponential-backoff npm](https://www.npmjs.com/package/exponential-backoff)
- [WICG netinfo — connection effectiveType](https://wicg.github.io/netinfo/)
- [MDN navigator.connection NetworkInformation](https://developer.mozilla.org/en-US/docs/Web/API/NetworkInformation/effectiveType)
- [MDN navigator.userAgentData](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgentData)

### DeepFilterNet (für separate Tool-Spec)
- [DeepFilterNet GitHub](https://github.com/Rikorose/DeepFilterNet)
- [DeepFilterNet Deployment Options DeepWiki](https://deepwiki.com/Rikorose/DeepFilterNet/7-deployment-options)
- [Intel/deepfilternet-openvino](https://huggingface.co/Intel/deepfilternet-openvino)
