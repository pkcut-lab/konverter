# HEVC → H.264 Konverter — Design Spec

**Status:** Draft v1 (2026-04-20, nach Deep-Research Subagent-Trio vom 2026-04-19/20)
**Slug (DE):** `/de/hevc-zu-h264`
**Tool-ID:** `hevc-to-h264`
**Tool-Type:** `file-tool`
**Phase-Zuordnung:** Phase 1 (erstes Video-Tool, führt `categoryId: 'video'` ein)
**Spec-Author:** Claude (Opus 4.7)
**Brainstorming-Skill:** `superpowers:brainstorming` (Q1–Q6 in Research-Synthese abgedeckt; User-Approval des Research-Outputs 2026-04-20 erfolgt, bevor diese Spec geschrieben wurde)

---

## 1. Zweck und Kontext

### 1.1 Die User-Pain in einem Satz

> *„Mein iPhone-Video spielt nicht auf dem Windows-Rechner / der Photoshop-Version / dem Samsung-Fernseher meiner Eltern. Ich will es nicht hochladen und ich will keine 30 €/Monat-Software."*

Das ist ein evergreen DE-Suchvolumen (`mov in mp4 umwandeln`, `iphone video in mp4`, `hevc zu h264`), das 2026 **wächst**, weil iOS 11+ HEVC als Default-Codec schreibt, aber das Windows-/Consumer-Ökosystem H.264 als Universal-Baseline weiter verlangt.

### 1.2 Spec-Kontext (Konverter-Webseite)

Multilinguale Astro-5-SSG, AdSense ab Phase 2, Karpathy-Disziplin. Vollständige Parent-Spec: `docs/superpowers/specs/2026-04-17-konverter-webseite-design.md` v1.1.

**Relevante Constraints:**
- **Privacy-First** (Non-Negotiable #2): kein Server-Upload.
- **Non-Negotiable #7:** keine externen Network-Dependencies zur Runtime. **Ausnahme 7a** (ML-File-Tools mit Worker-Fallback, 6 Bedingungen) greift hier **NICHT** — wir brauchen keinen Worker-Fallback, weil WebCodecs nativ verfügbar ist. Die Mediabunny-Library wird als **statischer Bundle-Chunk** (Lazy-Import, kein CDN) ausgeliefert.
- **Non-Negotiable #5 (AdSense ab Phase 2):** wir müssen **kompatibel mit AdSense** bleiben → **kein SharedArrayBuffer**, **kein COOP/COEP-Header**. Das schließt `ffmpeg.wasm` als Default-Engine aus (siehe §2.3).
- **Refined-Minimalism-Aesthetic:** Graphit-Tokens, Inter + JetBrains Mono, Hard-Caps (CLAUDE.md §5).

### 1.3 Doppelter Hebel

1. **User-Traffic:** deutsche iPhone-Besitzer, die Videos mit Nicht-Apple-Ökosystemen teilen.
2. **Template-Validator:** das FileTool-Template (Session 7 + 9) wurde für Bilder (≤15 MB, ≤5 s Prozess) gelockt. Video ist die **nächste Härtestufe** — ≤500 MB, Minuten-Dauer, Progress-Reporting, Memory-Limits. Was wir hier lernen, fließt als Template-Erweiterung in `FileTool.svelte` zurück (für spätere Tools: MP4→WebM, Video→GIF, Discord-Compressor).

---

## 2. User-Story und MVP-Scope

### 2.1 Primary User Story

> **Als** iPhone-Besitzer mit einem HEVC-Video, das auf einem anderen Gerät nicht läuft,
> **möchte ich** es in ein H.264-MP4 umwandeln, ohne es hochzuladen und ohne eine App zu installieren,
> **damit** es universell abspielbar ist und meine Daten meinen Rechner nie verlassen.

### 2.2 MVP-Scope (V1)

**Drin:**
- **Single-File-Drop** (eine Datei pro Konvertierung).
- **Input-Formate:** `video/quicktime` (MOV), `video/mp4` (falls intern HEVC-codiert), `video/hevc` (Chrome), plus Endungs-Fallback `.mov`, `.mp4`, `.m4v`, `.hevc` — weil iPhones MOV-Container mit HEVC-Video-Spur + AAC-Audio-Spur liefern.
- **Output:** `video/mp4` mit H.264-Video (Baseline/Main-Profile je nach Browser-Support) + AAC-Audio (kopiert falls möglich, sonst transcodiert).
- **Max File-Size:** **500 MB Hard-Cap** (Safari iOS OOM-Guard, siehe §4.3). UI-Messaging empfiehlt ≤250 MB für iOS.
- **Progress-Reporting:** Prozentsatz + ETA während Encoding.
- **Metadata-Preservation:** Creation-Date + Recording-Location (sofern in Source vorhanden) werden in den MP4-Output übernommen (Differenzierung, §2.4).
- **Audio beibehalten:** AAC-Spur wird ohne Re-Encode durchgereicht, wenn Bitrate ≤192 kbps (spart Zeit + Qualität).
- **Single-Download** via `<a download>` (Blob-URL).
- **Inline-Pattern:** eine Box, Inhalt morpht zwischen `idle` / `preparing` / `converting` / `done` / `error` — analog BG-Remover.
- **Quality-Preset-Chooser:** drei Buttons `Original-Qualität` (CRF ≈20 / Bitrate = Source) · `Balanced` (CRF ≈23, Default) · `Klein` (CRF ≈28, ~50 % Größe).
- **Resolution-Passthrough (Default):** 4K-Input → 4K-Output. 1080p-Downscale ist **User-Opt-In** über einen separaten Toggle *„Auf 1080p verkleinern"*, der nur erscheint, wenn die Source-Auflösung >1920×1080 ist. Begründung siehe §4.3. **Das ist ein Differenzierungs-Feature** (§2.4 B) — kein Konkurrent behält 4K bei.

**Explizit aus V1 gestrichen:**
- Multi-File-Batch-Queue (V1.1, eigene Session).
- Target-File-Size-Slider (Discord-Compressor-Pattern — eigenes Tool in Phase 1.5).
- Resolution-Downscale unter 1080p (720p, 480p etc.) — nur das 1080p-Opt-In-Toggle ist drin, kein Free-Form-Resize.
- Clip-Trim (Start/End-Zeit).
- **Aktive HDR-Warnung:** wir warnen NICHT aktiv vor dem Encode. Stattdessen: dezenter FAQ-Eintrag („Was passiert mit HDR/Dolby-Vision?"), nüchtern erklärt. Grund: >90 % der iPhone-Videos sind SDR-Rec.709 — eine Pre-Encode-Warnung wäre für die Mehrheit Friktion ohne Nutzen. Detail-Erklärung siehe §4.7.
- Stumm-Option / Audio-Remove.
- Subtitle/Caption-Embedding.
- Web-Worker — Mediabunny läuft auf dem Main-Thread in V1 (siehe §2.3 Begründung).

**Begründung Scope-Cut:** Surgical-Changes-Prinzip (CLAUDE.md §3). V1-Ziel = **Single-Happy-Path validiert**, Template-Erweiterung dokumentiert. Danach in eigenen Sessions skalieren.

### 2.3 Tech-Choice-Entscheidung (HART)

**Entscheidung:** **Mediabunny (MPL-2.0, Vanilagy) als Primär-Engine**, nicht `ffmpeg.wasm`.

**Begründung (aus Deep-Research 2026-04-19/20):**

| Kriterium | Mediabunny | ffmpeg.wasm |
|-----------|------------|-------------|
| Bundle-Size (tree-shakeable) | 5–70 kB | 20–22 MB |
| Engine | WebCodecs (native, hardware-accelerated) | WASM-CPU-Transcode |
| Speed (1080p H.264 encode) | ~200 fps | ~25 fps |
| Streaming (kein Full-File-Load) | ✅ | ❌ |
| **COOP/COEP-Header nötig** | ❌ | ✅ (SharedArrayBuffer) |
| **AdSense-kompatibel (NN #5)** | ✅ | ❌ (COEP bricht Ads) |
| **Patent-Exposure (x264-Encode monetarisiert)** | Codec-Routing via Browser-Nativ (MPEG-LA-Lizenz liegt beim Browser-Hersteller) | Applikations-Ebene = wir sind Lizenznehmer |
| Browser-Support (DE-Markt-gewichtet) | 94 % (Firefox-Android Gap bis ~Q3/2026 erwartet) | ~99 % |
| Maintainer-Bus-Faktor | 1 (Vanilagy, aktive Entwicklung 2025–2026) | 1 (lucasgelfond, Solo) |
| MIT/MPL-Kompatibilität mit AdSense-Monetarisierung | ✅ MPL-2.0 | ✅ LGPL-2.1 (Dynamic-Link) |

**`ffmpeg.wasm` wird NICHT gebundled.** Falls später ein Tool einen Codec braucht, den WebCodecs nicht kennt (z. B. Opus-Audio in MKV oder AV1-Legacy-Browser), wird `ffmpeg.wasm` **pro Tool** als Fallback-Chunk nachgeladen — mit eigener Landing-Route ohne AdSense und expliziter COOP/COEP-Aktivierung. Das ist ein **Non-V1-Problem**.

**WebCodecs-Verfügbarkeit** (`VideoEncoder` + `VideoDecoder`):
- Chrome 94+ ✅ · Edge 94+ ✅ · Safari 16.4+ ✅ · Opera 80+ ✅
- Firefox 130+ Desktop ✅ · **Firefox Android: ⚠️** (teilweise experimentell bis Q3/2026)

Pre-flight-Check: `if (typeof VideoEncoder === 'undefined') → state=error` mit Message *„Dein Browser unterstützt kein WebCodecs (nötig für Video-Konvertierung ohne Upload). Desktop-Firefox, Chrome, Edge oder Safari 16+ funktionieren."*

**Begründung Main-Thread statt Worker in V1:**
- Mediabunny-Streaming gibt den Main-Thread häufig frei (Frame-by-Frame-Queuing). Lags beobachtbar, aber nicht freeze-haft.
- Worker-Setup (Mediabunny in Worker + `postMessage` + Transfer-Streams) ist eine zusätzliche Abstraktionsebene. Wir messen in V1 die Main-Thread-Realität, ziehen Worker erst nach, wenn User-Smoke-Test bestätigt, dass es wehtut.
- `prefers-reduced-motion` ↔ UI-Freeze-Wahrnehmung: unsere Progress-Anzeige (Zahl + ETA, keine Animation) kommuniziert Fortschritt auch wenn das Main-Thread-Event-Loop stottert.

### 2.4 Differenzierung (HART, gemäß CLAUDE.md §6)

> **Recherche-Quellen:** Deep-Research Subagent-Trio 2026-04-19/20 (Capability-Analyse, Competitor-Matrix, User-Pain-Citations aus Reddit/HN/Medium/Trustpilot 2023–2026). Vollständige Reports extern dokumentiert (nicht committed — sind Arbeitsmaterial, kein Referenz-Artifact).

#### Wettbewerbs-Befund (Kurz)

| Konkurrent | URL | USP | Privacy | Schwäche |
|------------|-----|-----|---------|----------|
| [online-umwandeln.de](https://www.online-umwandeln.de) | DE-SEO-König | DE-Firma, breite Format-Liste | Server-Upload | Upload-Limits, Ads-Wall, alt-wirkende UI |
| [CloudConvert](https://cloudconvert.com) | DE-Firma, API-First | GDPR-claim, 2FA | Server-Upload | Paywall ab 25 Files/Tag |
| [Convertio](https://convertio.co) | Breite Format-Liste | — | Server-Upload | File-Limits free, Paywall |
| [FreeConvert](https://www.freeconvert.com) | Ähnlich Convertio | — | Server-Upload | Preset-Paywall, Watermark auf Premium |
| [VEED](https://www.veed.io/tools/video-compressor) | Premium-Editor-UX | GDPR-claim | Server-Upload | Watermark free, Account-Push |
| [Clideo](https://clideo.com) | Editor + Tools | — | Server-Upload | Watermark free |
| [123apps](https://123apps.com) | Suite | — | Server-Upload | Ad-Heavy |
| [Ezgif](https://ezgif.com/video-to-mp4) | Pure-Client (teilweise) | Einzige relevante Pure-Client-Option | Client-side für GIFs, Server für Video | 90er-Look, kein MP4-Output-Quality-Preset |
| [Zamzar](https://www.zamzar.com) | Breite Format-Liste | — | Server-Upload, Email-Delivery | Veraltet |

**Schlüsselbefund:** **Alle Top-DE-Ranker sind cloud-based.** Pure-Client-Space ist „besetzt aber unprofessionell" (Ezgif). Das ist unser **White-Space-Window für Video-Tools** — dieselbe Strategie, die BG-Remover im Bild-Space genutzt hat.

#### A. Baseline-Features (Mindest-Scope — was JEDER Konkurrent hat)

1. Drag-&-Drop + Click-Browse-Upload.
2. MP4-Output (H.264).
3. Progress-Indikator.
4. Direct-Download ohne Reload.
5. Mobile-fähige Touch-Drop-Zone.
6. Dateigrößen-Anzeige Vorher/Nachher.

→ Alle in V1 (§2.2).

#### B. Differenzierungs-Features (Hebel — was KEINER der 9 Konkurrenten gut macht)

1. **100 % client-side, kein Server-Upload** — Privacy-as-a-Feature. Subagent-Quote (Reddit DE, Januar 2026): *„Ich hab Hochzeitsvideos von meiner Tochter, die will ich garantiert nicht auf irgendeinen Server schieben, nur damit Opa sie angucken kann."* Das ist eine **emotionale Privacy-Achse**, nicht nur Daten-Hygiene.
2. **Keine Upload-/Time-/Size-Limits** (bis zum 500-MB-Hardware-Cap, der beim Klient-Encode technisch bedingt ist) — Konkurrenten haben Free-Tier-Pain-Points in 3 von 10 Top-Trustpilot-1★-Reviews.
3. **Metadaten-Preservation** — iPhone-Creation-Date + GPS-Coords werden übernommen. Konkurrenten strippen Metadaten entweder still (VEED, Convertio) oder gar nicht (Privacy-Vorwurf in HN 2025-12). Unser Feature: **explizite Opt-Out-Checkbox** (Default = übernehmen, weil User das *erwarten*; Advanced-Toggle für Paranoide).
4. **DSGVO-native DE-Firma** — Impressum + echte Privacy-Policy + deutsche Betreiber-Entität. VEED/Convertio sind US/UK; CloudConvert ist DE, aber Server-Upload.
5. **Refined-Minimalism-UI** — Graphit-Monochrom, keine Ad-Banner über dem Tool, keine Watermarks, keine „Upgrade"-CTAs. Direkter Kontrast zu Ezgif-90er-Look und VEED/Clideo-Premium-Pressure.
6. **H.264-Preset-Copy in Alltagssprache** (`Original-Qualität` / `Balanced` / `Klein`) statt CRF-Zahlen. Das adressiert den HN-Pain-Point *„HandBrake ist mächtig aber die UI macht mir Angst"*.
7. **Tool-Chain-Hint im Done-State:** Link zu `/de/video-zu-gif` (Phase 1.5, geplant) und `/de/discord-compressor` (Phase 1.5, geplant). Ökosystem-Moat analog BG-Remover → WebP-Konverter.
8. **Schema.org-Markup** (`SoftwareApplication` + `HowTo` + `FAQPage`) mit expliziter *„kein Upload"*-Antwort-String. AEO-Optimierung für Perplexity/ChatGPT-Citations (`wie iphone video in mp4 umwandeln ohne upload`).
9. **4K-Passthrough per Default** — iPhone 12 Pro + neuer nehmen 4K auf; Konkurrenten downscalen still auf 1080p (VEED, Clideo, Convertio bestätigt). Wir behalten 4K, machen 1080p zum Opt-In-Toggle. Moderne User erwarten 4K — die 4K-Fähigkeit ist ein unerwartetes „geht doch!"-Signal.
10. **Nutzer-Sprache in SEO + Slug-Strategie:** Tool-Seite antwortet auf `/de/hevc-zu-h264` (Präzisions-Slug für Kenner), H1 + MetaDescription + Body adressieren *„iPhone-Video in MP4 umwandeln"* (Laien-Sprache, hohes DE-Suchvolumen). Optional in Phase 1.5: zweite Content-Page `/de/iphone-video-in-mp4` als eigener SEO-Landing mit Canonical auf die Hauptseite, falls AEO-Signale das rechtfertigen.

#### C. Bewusste Lücken (NICHT bauen + Begründung)

| Feature | Warum NICHT in V1 |
|---------|-------------------|
| Batch-Queue (mehrere Files) | Trustpilot-Pain-Point bestätigt, aber V1-Scope-Schutz. **Re-evaluiert Phase 1.5.** |
| Target-Size-Slider (Discord-Compressor) | Eigenes Tool in Phase 1.5 (`/de/discord-video-komprimieren`). Hier Scope-verwirrend. |
| Resolution-Downscale | Nicht HEVC→H.264-spezifisch. Eigenes Tool. |
| Clip-Trim (Start/End) | Editor-Feature. Eigenes Tool oder V2. |
| HDR → SDR-Tone-Mapping (aktiv) | Keine Pre-Encode-Warnung, kein UI-Toggle. H.264 ist 8-bit-SDR-Baseline — Dolby-Vision/HDR10-Metadaten werden beim Encode stillschweigend fallen gelassen. Realität: auf SDR-Displays identischer Eindruck, auf HDR-Displays flachere Farben + möglicher Highlight-Clip. Betrifft <10 % realer iPhone-Inputs (nur mit aktiv eingestellter Dolby-Vision-Aufnahme). Dezent in der FAQ dokumentiert (§3.6, §4.7). **Re-evaluiert, sobald >5 % Upload-Versuche HDR sind** — dann evtl. AV1-Output-Preset mit HDR-Erhalt. |
| Aktives HDR-Warnmodal vor Encode | Mehr Friktion als Wert für 90 % der User. Die „HDR leidet"-Fakten stehen in der FAQ; User, der recherchiert, findet sie. |
| Free-Form-Resize (720p, 480p) | Eigenes Tool („Video verkleinern"). Preset-Chooser regelt Bitrate, Opt-In-Toggle regelt 1080p-Downscale — mehr Resize-Granularität bricht das Refined-Minimalism-UI. |
| Worker-Fallback (server-side) | NN #7 Ausnahme 7a nicht nötig, weil WebCodecs client-side reicht. **Re-evaluiert, falls Firefox-Android >10 % DE-Share hat UND noch kein WebCodecs.** |
| ffmpeg.wasm als Fallback in V1 | Kollidiert mit AdSense-Kompatibilität (COOP/COEP). Nur wenn ein *spezifischer* Input-Codec ausfällt, bauen wir später eine **dedizierte Sub-Seite** mit COOP/COEP und ohne AdSense. |

#### D. Re-Evaluation-Trigger

- **Phase 2 Analytics (1 Monat nach Launch):** Conversion-Rate pro Preset, Drop-off-Point (Upload → Start → Download), Fehler-Quote pro Browser.
- **WebCodecs-Firefox-Android-Share:** wenn >10 % DE-Firefox-Android-User und Encoding failen → Worker-Fallback evaluieren.
- **User-Feedback-Threshold:** ≥5 unabhängige Anfragen nach Batch / Trim / Target-Size → Feature in eigene Phase-1.5-Session.
- **Codec-Landschaft:** AV1-Adoption in Browsern; wenn WebCodecs-AV1-Encode auf >80 % Desktop läuft → AV1-Preset evaluieren (smaller files).

---

## 3. Komponenten

### 3.1 `src/components/tools/FileTool.svelte` *(erweitert)*

FileTool-Template wurde in Session 7 + 9 gelockt. Für dieses Tool brauchen wir **zwei Erweiterungen**, die generisch in die Template fließen (kein Konverter-spezifischer Code in FileTool):

1. **Progress-Reporting während `converting`:** aktuell zeigt der `converting`-State nur einen Text. Erweiterung: wenn der `process`-Callback ein optionales drittes Argument `onProgress: (progress: number) => void` akzeptiert (Mediabunny-Signatur: einzige Zahl 0–1), rendert die Box eine Progress-Text-Zeile `42 % · ~01:23 verbleibend`. Die ETA wird im FileTool selbst aus Elapsed-Time + aktuellem Percent berechnet (`etaSeconds = elapsedSeconds * (1 - progress) / progress`), sobald `progress > 0.05` (davor rendert nur `42 %` ohne ETA). Keine Balken-Animation (Refined-Minimalism).
2. **Preflight-Check-Plug:** FileTool hat in Session 7 `OffscreenCanvas`-Check. Wir erweitern das zu einer `config.preflightCheck?: () => string | null`-Option, die pro Tool eigene Browser-API-Checks melden darf. Default = `null` (kein Check). Für dieses Tool: `() => typeof VideoEncoder === 'undefined' ? 'WebCodecs nicht unterstützt. Nutze Desktop-Chrome/Firefox/Edge oder Safari 16+.' : null`.

State-Machine (erweitert um `preparing` analog BG-Remover):
```
idle ──drop──> preparing ──ok──> converting ──ok──> done ──reset──> idle
                  │                  │              │
                  └──fail──> error   └──fail──> error
```

`preparing` = Lazy-Import der Mediabunny-Library (~70 kB gzip). Im schnellen Netz <200 ms, im langsamen bis 2 s. Nicht unsichtbar, aber kein dedizierter Progress (Binärgröße klein genug).

**Template-Lock-Update:** Nach User-Smoke-Test wird `CONVENTIONS.md` Section „FileTool-Template" um die zwei Erweiterungen ergänzt.

### 3.2 `src/lib/tools/hevc-to-h264.ts` *(neu — Tool-Config)*

```ts
import type { FileToolConfig } from './schemas';
// process + prepare liefert das Runtime-Registry (siehe 3.3/3.4), nicht die Config.

export const hevcToH264: FileToolConfig = {
  id: 'hevc-to-h264',
  type: 'file-tool',
  categoryId: 'video', // neu — bisher: 'laengen' (Session 5), 'bilder' (Session 7), 'bilder' (Session 9)
  iconPrompt:
    'Pencil-sketch icon of a smartphone on the left and a desktop monitor on the right, ' +
    'a small video-play-triangle flowing between them through an arrow, all drawn in ' +
    'monochrome graphite gray, single-weight hand-drawn strokes, no shading, no fill, ' +
    'transparent background, minimalist line art, square aspect, balanced composition.',
  accept: [
    'video/quicktime',
    'video/mp4',
    'video/hevc',
    'video/h265',
    // Endungs-Fallback ergänzt FileTool durch Extension-Check, wenn MIME leer/generisch ist.
  ],
  maxSizeMb: 500,
  filenameSuffix: '_h264',
  defaultFormat: 'mp4',
  showQuality: false, // wir nutzen Preset-Buttons statt Slider
  process: () => { throw new Error('runtime-only'); }, // echte Logik in tool-runtime-registry
};
```

### 3.3 `src/lib/tools/process-hevc-to-h264.ts` *(neu — Pure-Function-Modul)*

Trennt Encoding-Logik von Komponente. Unit-testbar mit Mediabunny-Mocks.

```ts
import type { Input, Output, Conversion } from 'mediabunny';
// Imports sind lazy — dieses Modul wird selbst lazy-geladen via prepare().

export type ProcessHevcConfig = {
  preset: 'original' | 'balanced' | 'small';
};

export type ProgressCallback = (progress: number) => void; // Mediabunny: 0–1

export async function processHevcToH264(
  input: Uint8Array,
  config: ProcessHevcConfig & { downscaleTo1080p?: boolean },
  onProgress?: ProgressCallback,
): Promise<Uint8Array> {
  const mb = await import('mediabunny'); // Lazy-Chunk

  const source = new mb.BufferSource(input);
  const inputFile = new mb.Input({ source, formats: mb.ALL_FORMATS });

  const videoTrack = await inputFile.getPrimaryVideoTrack();
  const audioTrack = await inputFile.getPrimaryAudioTrack();

  const target = new mb.BufferTarget();
  const output = new mb.Output({
    target,
    format: new mb.Mp4OutputFormat(),
  });

  const videoBitrate = selectBitrate(videoTrack, config.preset);

  const videoOpts: Record<string, unknown> = { codec: 'h264', bitrate: videoBitrate };
  if (config.downscaleTo1080p) {
    videoOpts.width = 1920;
    videoOpts.height = 1080;
    videoOpts.fit = 'contain';
  }

  const conversion = await mb.Conversion.init({
    input: inputFile,
    output,
    video: videoOpts,
    audio: audioTrack
      ? (audioTrack.codec === 'aac' && audioTrack.bitrate <= 192_000
          ? { copy: true } // TASK-1.0-VERIFY: Stream-Copy-Support prüfen; Fallback = immer transcoden
          : { codec: 'aac', bitrate: 128_000 })
      : undefined,
    tags: (inputTags: Record<string, unknown>) => ({ ...inputTags }), // Metadaten durchreichen
  });

  if (onProgress) {
    conversion.onProgress = (p: number) => onProgress(p);
  }

  await conversion.execute();
  return target.buffer;
}

function selectBitrate(track: { width: number; height: number; bitrate?: number }, preset: 'original' | 'balanced' | 'small'): number {
  const source = track.bitrate ?? estimateBitrate(track.width, track.height);
  switch (preset) {
    case 'original': return source;
    case 'balanced': return Math.round(source * 0.6);
    case 'small':    return Math.round(source * 0.35);
  }
}

function estimateBitrate(w: number, h: number): number {
  const pixels = w * h;
  if (pixels >= 1920 * 1080) return 8_000_000;
  if (pixels >= 1280 * 720)  return 4_000_000;
  return 2_000_000;
}
```

> **Task-1.0-Spike-Ergebnis (2026-04-20):** Mediabunny-API verifiziert gegen https://mediabunny.dev/guide/converting-media-files. Divergenzen zur initialen Spec-Annahme und hier bereits gepatcht:
> - Video-Codec-String: **`'h264'`** (nicht `'avc'`).
> - Resize-Option: **`width` / `height` + `fit: 'contain'`** (nicht `maxWidth` / `maxHeight`).
> - Metadaten: **`tags: (inputTags) => ({ ...inputTags })`** als Funktion (nicht `metadata: 'preserve'` als String).
> - Progress-Callback-Signatur: **`(progress: number) => void`** mit 0–1 (Mediabunny liefert keine ETA — die wird im FileTool aus Elapsed-Time berechnet).
> - Audio-`{ copy: true }` ist in der Haupt-Doku **nicht explizit bestätigt**; wird in Task 1.0 gegen das Mediabunny-API-Reference final geprüft. Fallback bei Nicht-Support: AAC-Input immer mit `{ codec: 'aac', bitrate: audioTrack.bitrate }` durchreichen, spart trotzdem das Re-Encoding bei passender Bitrate.

### 3.4 `src/lib/tools/tool-runtime-registry.ts` *(erweitert)*

Neuer Eintrag:
```ts
'hevc-to-h264': {
  process: async (input, config, onProgress) => {
    const { processHevcToH264 } = await import('./process-hevc-to-h264');
    const preset =
      typeof config?.preset === 'string' &&
      (config.preset === 'original' || config.preset === 'balanced' || config.preset === 'small')
        ? config.preset
        : 'balanced';
    return processHevcToH264(input, { preset }, onProgress);
  },
  preflightCheck: () =>
    typeof VideoEncoder === 'undefined' || typeof VideoDecoder === 'undefined'
      ? 'Dein Browser unterstützt kein WebCodecs. Desktop-Chrome/Firefox/Edge oder Safari 16.4+ funktionieren.'
      : null,
},
```

**Hinweis:** `ProcessFn` im Registry-Typ bekommt ein **optionales drittes Argument** `onProgress`. Das bricht nichts am `png-jpg-to-webp`- und `remove-background`-Eintrag (bei denen `onProgress` einfach ignoriert wird). Die Type-Signatur in `tool-runtime-registry.ts` wird in Task 2 aktualisiert.

### 3.5 `src/lib/slug-map.ts` *(erweitert)*

```ts
'hevc-to-h264': { de: 'hevc-zu-h264' },
```

### 3.6 `src/content/tools/hevc-zu-h264/de.md` *(neu — SEO-Content)*

Directory-Name = DE-Slug (Konvention seit `meter-zu-fuss/`, `webp-konverter/`, `hintergrund-entfernen/`).

**Locked H2-Liste (Body):**
1. `## Warum spielt mein iPhone-Video nicht überall?`
2. `## HEVC vs. H.264 — was ist der Unterschied?`
3. `## Anwendungsbeispiele`
4. `## Datenschutz — dein Video verlässt nie deinen Browser`
5. `## Grenzen dieses Tools` *(ehrliche Erwartungsführung: 500 MB Cap · 4K bleibt 4K, 1080p-Downscale per Toggle · HDR/Dolby-Vision geht verloren)*
6. `## Häufige Fragen`
7. `## Verwandte Video-Tools`

**Frontmatter-Pflichtfelder** (aus `toolContentFrontmatterSchema`):
- `toolId: hevc-to-h264`
- `language: de`
- `title: 'iPhone-Video in MP4 umwandeln — HEVC zu H.264 Konverter'` (53 Zeichen, im 30–60-Range)
- `metaDescription`: 140–160 Zeichen, enthält „kein Upload", „kostenlos", „im Browser".
- `tagline`: ≤200 Zeichen, Privacy-Lead-Headline.
- `intro`: ≥1 Zeichen (Pflicht).
- `howToUse`: 3–5 Schritte unter dem Layout-H2 „Wie benutzt du den Konverter?".
- `faq`: 4–6 Q/A.
- `relatedTools`: 3–5 kebab-case Slugs — Stubs für Phase-1.5 sind erlaubt (`discord-video-komprimieren`, `mp4-zu-webm`, `video-zu-gif`, `video-audio-extrahieren`). Link-Validator ist Phase-2-Concern.
- `contentVersion: 1`.

Body ≥300 Wörter. Kein H1 (kommt aus Layout).

### 3.7 Icon

- **Pfad:** `public/icons/tools/hevc-to-h264.webp` (160×160, CSS 80×80).
- **Pipeline:** Recraft → BG-Remover → WebP-Konverter (unsere interne Doppel-Hebel-Pipeline).
- **Status zum Spec-Approval:** `⬜ Pending` — wird in der Phase-1-Icon-Batch generiert, nicht in dieser Session.

---

## 4. Architektur-Entscheidungen (locked)

### 4.1 Lazy-Import-Strategie

Mediabunny (~70 kB gzip für Video-Encode-Pfad, tree-shakeable) wird **nicht** im initialen Bundle von `/de/hevc-zu-h264` geladen. Lazy-Import erst, wenn `config.process` aufgerufen wird (= User hat eine Datei gedroppt). Das hält die Seite für AEO/Performance-Signals schlank.

Preload-Hint via `<link rel="modulepreload">` wird **nicht** gesetzt in V1 — Mobile-Data-Hygiene. Re-evaluiert, wenn Analytics zeigt, dass >30 % der Visits im 2-s-Preparing-State hängen bleiben.

### 4.2 Memory- und OOM-Strategie

**Praktisches Hard-Cap 500 MB.** Darüber hinaus:
- iOS Safari OOM ab ~380 MB Heap bei 1080p-Decode. Wir fangen das **vor** dem Start ab, indem wir bei `file.size > 250 * 1024 * 1024` UND `navigator.userAgent.includes('iPhone|iPad')` einen Warn-Zwischenschritt einbauen: *„Diese Datei könnte für dein iPhone-Safari zu groß sein. Wir versuchen es trotzdem — falls der Browser abstürzt, nutze einen Desktop-Browser."* + Continue-Button. Kein harter Block, weil iPhones mit neueren Chips (A17+) es oft schaffen.
- `createImageBitmap` wird nicht verwendet (Video-Frames kommen aus `VideoDecoder`-Outputs, die wir per `.close()` sofort nach Transfer freigeben).
- Bei `RangeError` / `OutOfMemoryError` → `state=error` mit Message *„Dein Gerät hat nicht genug Speicher für diese Datei. Versuche ein kleineres Video oder einen Desktop-Browser."*

### 4.3 Resolution-Handling (4K-Passthrough-Default)

**Default: Resolution wird beibehalten.** 4K-Input → 4K-H.264-Output. Begründung:
- iPhone 12 Pro+ nimmt 4K in HEVC auf. User erwarten, dass das Zielvideo die gleiche Qualität hat wie das Original.
- Konkurrenten (VEED, Clideo, Convertio) downscalen still auf 1080p — unser 4K-Passthrough ist ein Differenzierungs-Signal.
- 4K-H.264-Encode in WebCodecs ist in Chrome/Edge/Safari produktionsreif. Firefox-Desktop klappt; Firefox-Android bleibt preflight-blockiert (§2.3).

**Opt-In-Toggle „Auf 1080p verkleinern":**
- UI: erscheint **nur**, wenn Source-Auflösung >1920×1080. Platz: direkt neben den Preset-Buttons, eigener Checkbox-Stil. Default: aus.
- Begründung: User, der 4K-Source hat und kleinere Datei will, greift zuerst zum „Klein"-Preset (bitrate-basiert). Wer explizit 1080p-Auflösung will (z. B. weil Ziel-Device kein 4K kann), bekommt den dedizierten Opt-In.
- Config-Knob: `downscaleTo1080p: boolean` im `process`-Config. Implementiert via Mediabunny `width: 1920, height: 1080, fit: 'contain'` nur wenn `true`, sonst weder `width` noch `height` setzen (Original-Auflösung passiert ungedrosselt durch).
- Nicht im preparing/converting-Lifecycle verschoben: User sieht den Toggle vor dem Drop, ändert ihn falls nötig, Drop triggert Encode mit dem aktuellen Wert.

**Messaging im Done-State bei 4K-Passthrough:** schlicht, kein Alarm — *„Original-Auflösung beibehalten: 3840×2160"*. Bei Opt-In-Downscale: *„Auf 1080p verkleinert (von 3840×2160)."*

**Safety-Net:** bei iPhone-Safari + 4K-Input + File-Size >150 MB → weichen Warnschritt vor Encode einblenden (*„4K-Videos sind speicherintensiv. Falls der Browser abstürzt, aktiviere das 1080p-Toggle oder nutze Desktop."*). Warnung ist Hinweis, kein Block.

### 4.4 Audio-Passthrough-Logik

AAC-Spur ≤192 kbps → `{ copy: true }` (Stream-Copy, wenn Container + Codec identisch bleiben). Andere Audio-Codecs (Opus, MP3 in MOV-Containern) → `{ codec: 'aac', bitrate: 128_000 }` re-encode. Das spart 10–30 % Encode-Zeit für typische iPhone-Inputs. **Task-1.0-Hinweis:** `{ copy: true }` ist in der Mediabunny-Haupt-Doku nicht explizit dokumentiert und wird im Implementation-Spike (Plan Task 1) gegen die API-Reference final geprüft. Fallback bei Nicht-Support: AAC-Input mit `{ codec: 'aac', bitrate: audioTrack.bitrate }` durchreichen.

### 4.5 Metadata-Preservation

Mediabunny Conversion-Option `tags: (inputTags) => ({ ...inputTags })` — die Funktions-Form liest die Input-Tags und gibt sie unverändert zurück, wodurch Creation-Date, Rotation-Flags, GPS-Coords (EXIF-Subset in MP4-Container-Box) übernommen werden. Default-ON, weil User das *erwarten*. Opt-Out-Checkbox im `done`-State (NICHT im `idle`-State — User sieht erst nach Encode, was drin ist, und kann dann neu rendern).

> **Scope-Hinweis:** Opt-Out-Checkbox-Re-Render-Flow ist **aus V1 gestrichen** — siehe §2.2 Out-of-Scope. Default-Preserve bleibt, Toggle kommt in V1.1 (nach User-Smoke-Test). Für V1 lautet der Done-State-Hinweis: *„Erstellungsdatum und Aufnahmeort wurden übernommen."*

### 4.7 HDR- / Dolby-Vision-Handling

**Policy: still konvertieren, in der FAQ dokumentieren. Keine Pre-Encode-Warnung, kein UI-Toggle.**

**Warum HDR beim H.264-Output leidet:**
- H.264 Main/High-Profile ist 8-bit SDR (Rec.709). HDR10 und Dolby-Vision sind 10/12-bit mit erweiterten Color-Primaries (Rec.2020) und Transfer-Kurven (PQ / HLG).
- Mediabunny / WebCodecs führen bei HDR→SDR typischerweise eine naive Range-Kompression durch (keine echte Tonkurven-Kurve wie Hable, Reinhard, ACES). Resultat: Highlights clippen, Farben wirken flacher, Schatten bleiben meist intakt.
- Echte HDR-Erhaltung bräuchte H.265/HEVC-Output oder AV1 — beides WIDERSPRICHT dem Tool-Zweck (HEVC ist der Input).
- Browser-Color-Management ist lückenhaft: auf SDR-Displays (Mehrheit) sieht das konvertierte SDR-H.264 identisch zum nativen SDR-Playback des HEVC-Originals aus. Der Unterschied wird nur auf HDR-Displays sichtbar.

**Praxis:**
- <10 % der iPhone-Videos sind aktiv Dolby-Vision (Einstellung „HDR-Video" muss AN sein, oft deaktiviert wegen Kompatibilitätsproblemen).
- Die restlichen 90 % sind Rec.709-SDR — keine Qualitätsverluste.
- Unser Tool erkennt HDR-Metadaten nicht proaktiv (keine Detection in V1, das würde Decode-Overhead bedeuten).

**FAQ-Eintrag (locked, in `hevc-zu-h264/de.md`):**
> **Was passiert mit HDR- oder Dolby-Vision-Videos?**
> HDR-Metadaten (Dolby Vision, HDR10) gehen bei der Konvertierung zu H.264 verloren, weil das H.264-Format kein HDR unterstützt. Auf normalen SDR-Bildschirmen sieht dein Video danach unverändert aus. Auf HDR-Bildschirmen wirken Farben und Kontraste etwas flacher als im Original. Betroffen sind nur iPhones mit aktiver „HDR-Video"-Einstellung — die meisten Aufnahmen sind normales SDR und verlieren nichts.

**Re-Evaluation:** wenn >5 % der Uploads HDR-Flags tragen oder User-Beschwerden über Farb-Qualität kommen → AV1-Output-Preset evaluieren (WebCodecs AV1-Encode-Adoption checken).

### 4.6 Browser-Baseline

- Chrome 99+ / Edge 99+ / Safari 16.4+ / Firefox 130+ (Desktop).
- Firefox-Android: Error-State mit klarem Fallback-Hinweis.
- iOS Safari 16.4+ **aktiv getestet** in Smoke-Test (echtes iPhone oder responsive-mode reicht nicht).

---

## 5. Test-Strategie

### 5.1 Unit-Tests (jsdom + Vitest)

jsdom hat **kein** WebCodecs, **kein** Mediabunny. Strategie analog `process-webp.test.ts` (Session 7): **Mediabunny-Module mocken via `vi.mock('mediabunny', () => ({ ... }))`**, Tests validieren Orchestration + Error-Branches + Preset-Bitrate-Mapping.

**Testfälle:**
1. `processHevcToH264` passt `preset: balanced` zu Bitrate-0.6× des Source durch.
2. `preset: small` = 0.35× Source.
3. `preset: original` = 1.0× Source.
4. Audio ≤192 kbps AAC → `{ copy: true }` (Task-1.0-Verify; bei Nicht-Support: `{ codec: 'aac', bitrate: audioTrack.bitrate }`).
5. Audio Opus → `{ codec: 'aac', bitrate: 128_000 }`.
6a. Bei `downscaleTo1080p: true` werden `width: 1920`, `height: 1080`, `fit: 'contain'` an Mediabunny übergeben.
6b. Bei `downscaleTo1080p: false` (Default) werden `width` / `height` **nicht** gesetzt — 4K-Passthrough.
7. `onProgress`-Callback wird mit einer Zahl 0–1 aufgerufen (ETA wird im FileTool aus Elapsed berechnet).
8. `tags: (inputTags) => ({ ...inputTags })` wird in Conversion-Options übergeben.
9. Mediabunny-Init-Reject → wirft (Error-Branch).
10. Mediabunny-Execute-Reject → wirft.

### 5.2 Component-Tests (FileTool-Erweiterung)

- Progress-Text rendert beim onProgress-Callback.
- `preflightCheck` triggered Initial-Error-State, wenn VideoEncoder fehlt (stub `globalThis.VideoEncoder = undefined`).
- 1080p-Opt-In-Toggle ist sichtbar, wenn Source-Auflösung >1920×1080, sonst nicht.
- Toggle-Wert wird als `downscaleTo1080p` in den `process`-Config-Aufruf weitergereicht.

### 5.3 Manual Smoke-Test (Session-Ende, Browser)

| Case | Expected |
|------|----------|
| Drop 50 MB iPhone MOV (HEVC + AAC) | `preparing` 1–2 s → `converting` mit Progress → `done` mit MP4-Download, spielt in VLC + Windows Media |
| Drop 300 MB MOV auf Desktop-Chrome | Gleiches Ergebnis, Progress monoton steigend, keine UI-Freeze (oder tolerierbares Stottern) |
| Drop 50 MB auf iPhone-Safari | Erfolg oder graceful OOM-Error |
| Drop 50 MB auf Firefox-Android | Preflight-Error mit klarem Fallback-Text |
| Drop .jpg | Format-Error, `process` nie aufgerufen |
| Drop 600 MB MP4 | Oversize-Error vor dem `process` |
| Drop 4K MOV (Default, kein Toggle) | Output bleibt 3840×2160; done-state sagt *„Original-Auflösung beibehalten: 3840×2160"*. `ffprobe` confirms 4K-Output. |
| Drop 4K MOV + Toggle *„Auf 1080p verkleinern"* aktiv | Output ist 1920×1080; done-state sagt *„Auf 1080p verkleinert (von 3840×2160)"*. `ffprobe` confirms 1080p. |
| HDR-Source (iPhone mit aktivem Dolby-Vision) | Encode läuft durch, keine Pre-Encode-Warnung, kein Error. Output ist SDR-H.264. FAQ dokumentiert den Qualitätsverlust. |
| Reset nach `done` | State zurück zu `idle`, Blob-URL revoked, Toggle-Wert bleibt (User-Setting). |
| Preset-Wechsel nach `done` | **NICHT implementiert in V1** (Scope-Cut — Video-Re-Encode auf dem gleichen File-Blob ist 30–120 s, anders als Bild 100 ms; User akzeptiert Re-Drop). Done-State zeigt Hinweis: *„Anderes Preset? Datei erneut ablegen."* |
| Preserve-Metadata in Output | `ffprobe` auf der heruntergeladenen Datei zeigt `creation_time` und `location` |
| Dark-Mode + Mobile-375px | Layout clean, Progress-Text lesbar |

---

## 6. Content-Richtlinien (SEO, gemäß CONTENT.md)

- **H1 (Layout-gerendert):** „iPhone-Video in MP4 umwandeln (HEVC → H.264)"
- **Tagline-Pattern:** „Konvertiere HEVC/MOV in universelles MP4 — direkt im Browser, ohne Upload, ohne Anmeldung."
- **Privacy-Lead:** in den ersten 100 Wörtern mindestens einmal *„verlässt deinen Browser nicht"* oder Variante.
- **AEO-Hook:** eine FAQ-Frage lautet wörtlich *„Wie wandle ich ein iPhone-Video in MP4 um ohne es hochzuladen?"* — Antwort ≤2 Sätze, Tool-verlinkt.
- **Keine Marketing-Superlative** (kein „beste", „schnellste", „kostenlos für immer"). Nüchterne DE-Sachlichkeit.
- **Related-Tools** (Stubs akzeptabel): `discord-video-komprimieren`, `mp4-zu-webm`, `video-zu-gif`, `video-audio-extrahieren`, `webp-konverter` (cross-category als Hebel-Anker).

---

## 7. Definition of Done (Spec-Level)

- [ ] Spec approved by User (Brainstorming-Round abgeschlossen — diese Sektion als Gate).
- [ ] Plan abgeleitet (`docs/superpowers/plans/2026-04-20-hevc-zu-h264-implementation.md`).
- [ ] Subagent-Research-Output archiviert (nicht committed, aber im Spec-Prozess-Log).
- [ ] Mediabunny-API-Namen durch Docs-Spike verifiziert (Plan-Task 1.0).
- [ ] Icon-Prompt in `hevc-to-h264.ts` als JSDoc-Block (analog `png-jpg-to-webp.ts`).

---

## 8. Offene Fragen — Entscheidungen (2026-04-20, User-Lock)

1. **Slug-Name:** ✅ **`/de/hevc-zu-h264`** als technischer Haupt-Slug. SEO-Hook über Nutzer-Sprache im H1/MetaDescription/Body (*„iPhone-Video in MP4 umwandeln"*). Optional: zweiter Content-Landing-Slug `/de/iphone-video-in-mp4` in Phase 1.5 mit Canonical.
2. **Preset-Namen:** ✅ **`Original-Qualität` / `Balanced` / `Klein`**. Keine Superlative.
3. **Auflösungs-Verhalten:** ✅ **4K-Passthrough per Default** (Differenzierungs-Feature — siehe §2.4 B #9). 1080p-Downscale als **User-Opt-In-Toggle**, erscheint nur bei >1920×1080-Source. Config-Knob `downscaleTo1080p: boolean`. Details §4.3.
4. **HDR-Policy:** ✅ **Keine aktive Warnung vor dem Encode**. Dezenter FAQ-Eintrag dokumentiert den Qualitätsverlust ehrlich. Tool erkennt HDR nicht proaktiv (kein Decode-Overhead). Technische Realität + FAQ-Wortlaut in §4.7.
5. **Spec-Review-Loop vor Plan-Start:** ✅ **Skip**. Research-Tiefe ist ausreichend, die echte Unsicherheit ist die Mediabunny-API — dafür ist Task 1.0 im Plan ein gezielter 5-Min-Spike. Weitere Review findet während der Implementierung statt (Test-Red-Green-Refactor).

**Nicht geschlossen, nur dokumentiert:**
- **AdSense-Phase-2-Kompatibilität** (§1.2, §2.3): Spec-Annahme *„Mediabunny braucht kein COOP/COEP"* stimmt technisch, aber der echte AdSense-Load-Test steht erst in Phase 2 an. Kein V1-Blocker.
- **WebCodecs-AV1-Encode-Adoption** (§4.7): wenn Browser-Support >80 % → AV1-Preset evaluieren als HDR-Rettung. Frühester Check: Phase 2 Analytics.

---

## 9. Nächster Schritt

Nach User-Approval dieser Spec → Plan-File (`docs/superpowers/plans/2026-04-20-hevc-zu-h264-implementation.md`) step-by-step durcharbeiten, beginnend mit dem **5-Min-Mediabunny-API-Spike** (Task 1.0 im Plan), damit der `processHevcToH264`-Codeblock oben finalisiert werden kann.
