# Sprache verbessern — Design Spec

**Status:** Draft v1 (2026-04-22, nach Deep-Research Subagent a2668e230e313f0b1)
**Slug (DE):** `/de/sprache-verbessern`
**Tool-ID:** `sprache-verbessern`
**Tool-Type:** `ml-file-tool` (§7a-Ausnahme)
**Enum:** `audio` (mit Video-Input-Support via ffmpeg.wasm-Audio-Extraktion)
**Tier:** 8g
**Phase-Zuordnung:** Phase 2 (zweites ML-File-Tool nach `video-hintergrund-entfernen`, erstes Audio-ML-Tool — `MLFileTool.svelte`-Template wird hier auf Audio-Pipeline erweitert)
**Spec-Author:** Claude (Opus 4.7)
**Research-Quelle:**
- `docs/superpowers/plans/2026-04-22-audio-enhancement-research.md` (Lizenz + Modell-Matrix + Konkurrenz + User-Wishes + Trends)

---

## 1. Zweck und Kontext

### 1.1 Die User-Pain in einem Satz

> *„Adobe Podcast klingt roboterhaft, hat 4-Stunden-Tages-Limit trotz Premium, verlangt Login + Upload, und bei Cleanvoice verschwinden 30-Min-Uploads — aber ich will nur schnell den Hall aus meinem Podcast-Take ziehen, ohne mein Stimm-Material auf einen US-Server zu schieben."*

Das adressiert mehrere überlappende DE-SEO-Keywords (`sprache verbessern`, `audio ton verbessern`, `podcast ton verbessern`, `adobe podcast alternative kostenlos`, `hintergrundgeräusche entfernen`, `hall entfernen`) mit **hohem, evergreen Such-Volumen**. Jeder Mainstream-Konkurrent setzt auf Cloud-Upload + Login + Paywall + Nutzungs-Cap. Das White-Space-Fenster „100 % pure-client, kein Login, kein Watermark, kein Cap, mit Strength-Slider, DE-native" ist **leer** — im 13-Konkurrenten-Sample erfüllt **kein einziger** alle fünf Achsen (Research §3).

### 1.2 Spec-Kontext

Multilinguale Astro-5-SSG, AdSense ab Phase 2, Karpathy-Disziplin. Parent-Spec: `docs/superpowers/specs/2026-04-17-konverter-webseite-design.md` v1.1. Teilt den `MLFileTool.svelte`-Wrapper mit `video-hintergrund-entfernen` (Template-Lock nach V1-Smoke).

**Relevante Constraints:**
- **Privacy-First** (NN #2): kein Server-Upload, kein Telemetrie-Ping. Das ist hier **besonders sensibel** — Stimm-Material ist biometrisches Datum iSd. Art. 9 DSGVO.
- **NN #7 / Ausnahme 7a:** ML-File-Tool mit Worker-Fallback — alle 6 Sub-Bedingungen müssen erfüllt sein (§3.4 Checkliste).
- **NN #5 (AdSense-kompatibel):** kein SharedArrayBuffer, kein COOP/COEP-Header. Das schließt `ffmpeg.wasm` **multi-threaded** aus — wir nutzen die **single-threaded**-Variante (`@ffmpeg/core` ohne `-mt`). Performance-Einbuße akzeptiert (Web-Worker-Offload gleicht Main-Thread-Freeze aus).
- **EU-AI-Act Art. 50 (wirksam 02.08.2025):** Synthetische Sprache muss gekennzeichnet werden. **DeepFilterNet3 ist Time-Frequency-Mask-Filter (keine Synthese, kein Vocoder) → nicht von Art. 50 betroffen** (Research §5). Trotzdem FAQ-Disclaimer zur Rechts-Konservativität.
- **Refined-Minimalism-Aesthetic:** Graphit-Tokens, Inter + JetBrains Mono, Hard-Caps (CLAUDE.md §5).

### 1.3 Doppelter Hebel

1. **User-Traffic:** Adobe-Podcast-Refugees (4h-Cap-Opfer + V2-Robotik-Geschädigte) + Podcaster + YouTuber + Lehrer (Unterrichts-Aufnahmen) + Journalisten (Interview-Redaktion) + deutschsprachige Daten-sensitive Power-User. Subagent-Zitate §4: Adobe-V2 *„roboterhaft"*, *„4-hour daily limit … even with a premium subscription"*, *„upload suddenly disappeared"* — alles Pain-Points, die wir strukturell lösen.
2. **Template-Evolution:** `MLFileTool.svelte` wurde für Video gebaut, bekommt hier Audio-Pipeline-Erweiterung. Nach diesem Tool ist das Template **audio+video-belastbar** und für zukünftige Tools (`auto-untertitel`, `audio-normalisieren`, `stimme-auto-tune`) vorbereitet.

---

## 2. User-Story und MVP-Scope

### 2.1 Primary User Story

> **Als** Podcaster/YouTuber/Lehrer mit einer Sprach-Aufnahme (Audio oder Video),
> **möchte ich** Hintergrundgeräusche + Hall entfernen und die Stimme klarer machen,
> **ohne** Upload, Login, Watermark, Nutzungs-Limit oder Paywall,
> **und mit einem Regler**, damit ich zwischen „dezent natürlich" und „maximal sauber" wählen kann,
> **damit** das Ergebnis in meine Schnitt-Software passt und meine Stimme meinen Rechner nie verlässt.

### 2.2 MVP-Scope (V1)

**Drin:**
- **Single-File-Drop** (eine Datei pro Durchlauf).
- **Input-Formate:**
  - Audio: `audio/wav`, `audio/mpeg` (MP3), `audio/mp4` (M4A/AAC), `audio/ogg`, `audio/flac`, `audio/webm`.
  - Video: `video/mp4`, `video/quicktime` (MOV), `video/webm` → Audio-Spur wird via ffmpeg.wasm extrahiert, Video-Spur verworfen (V1-Output ist **reines Audio**).
  - Endungs-Fallback wie bei bestehenden File-Tools.
- **Output:** **WAV 48 kHz, 16 bit, mono**. Kein MP3 in V1 (lame.js-Overhead ~300 KB nicht gerechtfertigt bis User-Feedback triggert).
- **Max File-Size:** **soft-limit 200 MB, hard-warn ab 500 MB** (entspricht ~3 h WAV / ~7 h MP3). UI kommuniziert ehrlich: *„ca. 30 Min Audio → 60-90 Min Verarbeitung auf mittlerem Laptop"*.
- **Strength-Slider (Hauptbedienelement):** UI-Slider 0-100 %, mapped auf DeepFilterNet3-nativen `atten_lim_db`-Parameter:
  - 0 % → `atten_lim_db = 0` (Bypass, nur Original)
  - 30 % → `atten_lim_db = 20` (dezent, empfohlener Default)
  - 50 % → `atten_lim_db = 40` (mittel)
  - 100 % → `atten_lim_db = 100` (maximal, Adobe-V2-Äquivalent — mit Warning *„Kann robotisch klingen"*)
  - Default-Position: **30 %** (basierend auf User-Wishes §4#2: *„adjust to a lower setting (around 30-50%) rather than maximum"*).
- **Modell-Toggle:** `Qualität` (DeepFilterNet3, Default) · `Schnell` (GTCRN, für schwache Geräte / lange Aufnahmen). Single-Radio-Button, nicht Advanced-Panel.
- **A/B-Playback im `done`-State:** zwei `<audio>`-Elemente (Original + Enhanced) mit **sync-scrub** (Play-Position zwischen beiden gekoppelt). Differenzierungs-Feature — kein Konkurrent hat das öffentlich.
- **Progress-Reporting:** dreistufig:
  - `Audio wird extrahiert… 42 %` (ffmpeg.wasm-Decode, nur bei Video-Input).
  - `Modell wird geladen… 68 %` (Weights-Download + Cache, nur bei First-Load).
  - `Chunk 12 / 45 · ETA 03:24` (Inferenz-Phase, Chunked).
- **WebGPU-Preflight:** bei Nicht-Support → automatischer Fallback auf onnxruntime-web WASM-EP `numThreads: 1`, Warning-Zeile *„WebGPU nicht verfügbar — CPU-Modus ist aktiv, Verarbeitung dauert 2-5× länger."*.
- **Single-Download** via `<a download>` (Blob-URL), Dateiname: `originalname_enhanced.wav`.
- **Abort-Button** während `converting` (Worker-postMessage-Abort, User-Kontrolle bei langen Prozessen Pflicht).
- **„Tab nicht schließen"-Hinweis** im UI während `converting` (Research-§6 Performance-Erwartung: 10 Min Audio = 20-30 Min Processing auf WASM-EP). Transparenz > Überraschung.

**Explizit aus V1 gestrichen:**
- **Voice-Cloning / TTS** — EU-AI-Act Art. 50 Sprengstoff, fundamentaler Scope-Bruch (Synthese vs. Filter).
- **Music-Separation** (Vocals aus Musik isolieren) — separates Tool, andere Modelle (Demucs, Spleeter), eigene Spec.
- **Filler-Word-Removal** (*„ähm", „also"* raus) — braucht ASR (Whisper), separates Tool (eigene Spec).
- **Real-Time-Mic-Denoising** (Live während Call) — Krisp-Territorium, anderer Use-Case (Stream vs. Post), eigene Spec falls später.
- **Batch-Upload** (>1 Datei) — V1.1-Kandidat falls User-Feedback triggert.
- **MP3-Output** — V1.1-Kandidat (lame.js-Overhead-Analyse nötig).
- **Loudness-Normalisierung / EBU-R128** — separates Tool `audio-normalisieren`, nicht in SE-Scope.
- **Auto-Untertitel / Transkription** — separates Tool `auto-untertitel` (Whisper-basiert).
- **Video-Output** (Audio-Spur tauschen und Video behalten) — V1.1-Kandidat, braucht Re-Mux-Pipeline mit Mediabunny. V1 liefert nur WAV, User re-muxed selbst mit Schnittsoftware.
- **Strength-Slider-Presets** („Stimme Indoor", „Stimme Outdoor", etc.) — Scope-Inflation, Single-Slider reicht.
- **Stimm-Klangfarbe-Equalizer** — kein SE-Feature, separates Tool.
- **Mehrere Sprecher-Trennung (Speaker-Diarisation)** — separates Tool, andere Modelle.

**Begründung Scope-Cut:** Surgical-Changes + YAGNI. V1-Ziel = **Happy-Path Denoise + Dereverb + Strength-Slider + A/B-Playback validiert**. Alles andere wartet auf echte User-Requests.

### 2.3 Tech-Choice-Entscheidung (HART)

**Entscheidung (gelockt 2026-04-22, lückenlos permissiv):**

| Layer | Choice | Lizenz | Begründung |
|---|---|---|---|
| Audio-/Video-Dekodierung | **ffmpeg.wasm** (`@ffmpeg/core`, **single-threaded**, NICHT `-mt`) | LGPL-2.1 Dynamic-Link (npm-Dep) | MP4/MOV/MP3/WAV/M4A/OGG/WebM Input. Single-Thread = kein COOP/COEP → AdSense safe. |
| ML-Inferenz | **onnxruntime-web 1.23+** (`numThreads: 1`, WebGPU-EP primary, WASM-EP Fallback) | MIT | Browser-native Audio-ML |
| Default-Modell | **DeepFilterNet3** (`deepfilternet3.onnx`, offizieller ONNX-Export) | MIT OR Apache-2.0 Dual (Code + Weights same repo) | SOTA permissiv, 2.3M Params, ~10 MB, full-band 48 kHz, deterministischer Filter, `atten_lim_db` nativ |
| Fallback-Modell (V1.1 falls v3-Kompat) | **DeepFilterNet2** | MIT OR Apache-2.0 | HF Space live, identisches Interface |
| Speed-Toggle-Modell | **GTCRN** (`gtcrn_simple.onnx`, in sherpa-onnx) | MIT | 48K Params, ~200 KB, 16 kHz Low-End-optimiert |
| Audio-Resample | Web Audio API `OfflineAudioContext` | — | Browser-nativ 48 kHz Target-Rate |
| Chunk-Pipeline | Custom Worker-Code, ~10 s Chunks, Overlap-Add 0.5 s | — | Konstanter RAM, keine Full-File-Load-Spike |
| WAV-Export | `wavefile` | MIT | 23 KB, stabil, 48 kHz 16 bit PCM |
| A/B-Playback | 2× `<audio>` mit sync `timeupdate`-Listener | — | Vertrauens-Feature |
| Model-Delivery | `/public/models/deepfilternet3.onnx` + R2-CDN als Static-Asset | — | ~10 MB, lazy-load + Cache-API |

**Ausgeschlossen (Research-Report dokumentiert):**
- **Facebook Denoiser** (CC-BY-NC = Commercial KO)
- **Resemble Enhance** (Weights-Lizenz unklar + kein offizielles ONNX + Vocoder → EU-AI-Act-Grenzfall)
- **VoiceFixer** (kein ONNX, >100 MB, PyTorch-only)
- **Miipher / Miipher-2** (Google proprietär, keine Weights)
- **NVIDIA Maxine / Krisp SDK** (proprietär)
- **NVIDIA NeMo SE** (Weights-Lizenz gemischt, Einzel-Check ergab NC-Restriktionen bei relevanten Checkpoints)
- **ClearerVoice MossFormer2_SE_48K** (Apache-2.0 ✅, **aber** kein offizielles ONNX-Export → Phase 2 re-evaluieren wenn Community-Port stable)

**Self-Hosted-Pfad (§7a-konform):**
- Modelle in `/public/models/deepfilternet3.onnx` + `/public/models/gtcrn_simple.onnx`, bundled im Build-Output.
- CDN: Cloudflare R2 (`models.konverter.…/…`), kein externer Hugging-Face-Runtime-Ping.
- First-Load: Model lazy via `fetch()` + Cache-API → offline nach First-Use.

**Main-Thread vs. Worker:** Die ML-Inferenz + ffmpeg.wasm-Decode laufen **zwingend im Web-Worker** (`src/workers/sprache-verbessern.worker.ts`). DeepFilterNet3 WASM-EP single-thread blockiert den Main-Thread 200-800 ms pro Chunk → bei 30 Min Audio = 180 Chunks = potenziell 30 min UI-Freeze. Worker ist nicht optional.

### 2.4 Differenzierung (HART, gemäß CLAUDE.md §6)

> **Recherche-Quelle:** Subagent-Report 2026-04-22. 13-Konkurrenten-Matrix, 7 wörtlich zitierte User-Pain-Points aus Adobe-Community + Trustpilot + PodcastConsultant-Blog + Cleanvoice-Reviews, 5 2026-Trends (WebGPU-Mainstream, EU-AI-Act Art. 50, Local-First-Tide, Universal-SR nicht browser-ready, ffmpeg.wasm single-threaded Realität), 16 Modelle evaluiert.

#### Wettbewerbs-Befund (Kurz)

| Konkurrent | URL | USP | Privacy | Schwäche |
|---|---|---|---|---|
| [Adobe Podcast Enhancer](https://podcast.adobe.com/enhance) | Marktführer, „Strength"-Slider, Browser-basiert | GDPR-Claim, aber Cloud-Upload Pflicht | US-Cloud-Upload | 4h/Tag-Cap trotz Premium, V2 robotisch, Login-Pflicht, EN-Bias |
| [Auphonic](https://auphonic.com) | Full-Post (Loudness, MP3-Tags) | Cloud | EU-Server-Option (Pro) | 2h/mo free, 11-99€/mo Pro, kein pures SE |
| [Cleanvoice AI](https://cleanvoice.ai) | Filler-Words + Noise | Cloud | 30-Min Trial | Trustpilot: *„upload suddenly disappeared"*, Audio-Cuts, 11-90€/mo |
| [Descript Studio Sound](https://www.descript.com) | In-Editor integriert | Cloud | — | Nur in Descript-App, Vendor-Lock, 12-24$/mo |
| [Krisp.ai](https://krisp.ai) | Echtzeit-Call-Noise | SDK + Cloud | — | Call-Focus, nicht Post-Production, 8-16$/mo |
| [Riverside Magic Audio](https://riverside.fm) | In Recording-App | Cloud | — | Vendor-Lock, Paid |
| [Kapwing Clean Audio](https://www.kapwing.com) | Video-Editor | Cloud | — | Watermark free, 16-24$/mo |
| [VEED Audio Cleaner](https://www.veed.io/tools/audio-enhancer) | Editor | Cloud | GDPR-Claim | Export-Watermark free, 12-59$/mo |
| [Clipchamp Audio Clean](https://clipchamp.com) | MS-SaaS | Cloud | MS-365-bundled | Win-Lock |
| [Podcastle Magic Dust](https://podcastle.ai) | All-in-One Podcast | Cloud | — | 3h/mo free, 14.99$/mo |
| [Supertone Clear](https://supertone.ai/clear) | VST-Plugin + SaaS | Desktop-App | — | Nicht browser, Paid |
| [Audo Studio](https://audo.ai) | One-Click-Cleanup | Cloud | — | Free-Tier mit Upsell |
| [AudioCleaner AI](https://audiocleaner.ai) | Web | Cloud (*„stores nothing"*, unverifizierbar) | — | Closed-Source, kein Proof |

**Schlüsselbefund:** Alle 13 Konkurrenten sind cloud-based. Pure-Client-Space ist **leer**. Adobe V1 → V2 Downgrade hat einen großen Refugee-Pool erzeugt (siehe §4#2 Community-Frust). Traffic-Momentum ist offen.

#### A. Baseline-Features (Mindest-Scope)

1. Noise-Removal (Tastatur, Lüfter, Straßenlärm, Atem-Artefakte).
2. Dereverb (Echo/Hall reduzieren).
3. Speech-Clarity (Stimm-Frequenzen priorisieren).
4. Input Audio + Video (via Extraktion).
5. Output WAV (pro-workflow-kompatibel).
6. Drag-&-Drop + File-Input.

→ Alle in V1 (§2.2).

#### B. Differenzierungs-Features

1. **100 % pure-client, null Upload** — **kein einziger** der 13 Konkurrenten schafft das. Biometrisches Datum (Stimme, Art. 9 DSGVO) bleibt auf User-Gerät. HN/Reddit-Hebel 2026: *„doesn't upload your audio"* ist der stärkste Vertrauens-Claim für sensible Aufnahmen (Anwalts-Interviews, Therapie-Gespräche, Unterrichts-Aufnahmen mit Minderjährigen).
2. **Kein Login, kein Watermark, keine Paywall, kein Nutzungs-Cap** — alle 13 Konkurrenten verletzen mindestens eine dieser vier Achsen. Adobe-4h/Tag-Cap (auch für Premium-Nutzer, User-Wish §4#5) ist strukturell nicht lösbar solange Server-Compute bezahlt werden muss. Wir haben das Problem nicht.
3. **Strength-Slider mit ehrlichen Presets (0/30/50/100 %)** — Default 30 % weil Adobe-Community selbst empfiehlt *„around 30-50% rather than maximum"* (User-Wish §4#2). Konkurrenten liefern entweder Black-Box-Auto oder maximieren Default (→ Robotik).
4. **A/B-Playback mit sync-scrub** — öffentliche Konkurrenten haben das nicht. User hört Original und Enhanced mit identischer Play-Position → Vertrauens-Signal statt Wundertrommel.
5. **DSGVO-by-design + DE-nativ** — EU-AI-Act-Rückenwind + deutscher Markt ernster Hebel: *„Stimme ist biometrisch"* + *„keine US-Cloud-Upload"* resoniert bei Anwälten/Therapeuten/Lehrern ungewöhnlich stark. Konkurrenten sind strukturell US-Cloud, können DSGVO-Auftragsverarbeiter-Verträge nicht wegzaubern.
6. **Keine English-Bias** — Adobe V2 *„heavily optimized for standard American English"* (User-Wish §4#3). DeepFilterNet3 ist auf MUSDB + DNS-Challenge + VCTK (mehrsprachig) trainiert → vergleichbare DE-Qualität. Expliziter FAQ-Entry *„Funktioniert auch auf Deutsch ohne Qualitätsverlust?"*.
7. **Modell-Toggle (Qualität / Schnell)** — DeepFilterNet3 (SOTA, langsam) vs. GTCRN (schnell, Low-End). Konkurrenten haben keine Modell-Wahl, nur Black-Box.
8. **Unbegrenzte Aufnahme-Länge** — kein 4h-Cap (Adobe), kein 30-Min-Trial (Cleanvoice), kein 2h-Monat (Auphonic). Soft-Limit 200 MB / 500 MB ist Hardware-realistisch, nicht geschäftsmotiviert.
9. **Tool-Chain-Hint im `done`-State:** Links zu `/de/hevc-zu-h264` (iPhone-Audio-extraction nach Video-Recorder), `/de/video-hintergrund-entfernen` (visuelles BG), zukünftig `/de/auto-untertitel` (Whisper-Transkription). Ökosystem-Moat.
10. **Schema.org-Markup** (`SoftwareApplication` + `HowTo` + `FAQPage`) mit expliziter *„kein Upload"* + *„DeepFilterNet3 MIT"* + *„WebGPU empfohlen"*-Answer-Strings. AEO-Optimierung für Perplexity/ChatGPT-Citations.
11. **EU-AI-Act-konform from Day 1** — Footer/FAQ-Disclaimer: *„Tool verbessert Audio durch Rausch-Entfernung; es generiert keine synthetische Sprache."* Filter-Approach (Time-Frequency-Mask) ist dokumentiert → kein Art. 50-Trigger. Resemble-Enhance / VoiceFixer / Adobe-V2 (Vocoder-basiert) könnten ab 08/2026 labeling-pflichtig werden — wir nicht.
12. **Transparenter Modell-Footprint im FAQ** — Konkurrenten verstecken Modell-Namen ("proprietary AI"). Wir zeigen: *„Nutzt DeepFilterNet3 (MIT License), Open Source seit 2023."* Trust-Signal für technische Podcast/YouTube-Zielgruppe.

#### C. Bewusste Lücken (NICHT bauen + Begründung)

| Feature | Warum NICHT in V1 |
|---|---|
| Voice-Cloning / TTS | EU-AI-Act Art. 50 Sprengstoff, Scope-Bruch (Synthese vs. Filter). Niemals im SE-Tool. |
| Music-Separation (Demucs) | Separates Tool, andere Modelle. V2-Kandidat nach `sprache-verbessern`-Launch. |
| Filler-Word-Removal | Braucht ASR (Whisper). Separates Tool (`filler-words-entfernen` V2-Kandidat). |
| Real-Time-Mic-Denoising | Krisp-Territorium. Anderer Use-Case (Stream vs. Post). Separate Spec falls später. |
| Batch-Upload (>1 Datei) | V1-Scope-Schutz. Re-evaluiert Phase 2 nach User-Feedback. |
| MP3-Output | lame.js ~300 KB Overhead V1 nicht gerechtfertigt. User-Tools konvertieren WAV→MP3 trivial. V1.1-Kandidat. |
| Video-Output (Audio-Swap in Source-Video) | Braucht Re-Mux mit Mediabunny, Scope-Doppel. V1 liefert WAV, User re-muxed selbst. |
| Loudness-Normalisierung (EBU-R128) | Separates Tool `audio-normalisieren`. Nicht SE-Scope. |
| Auto-Untertitel / Transkription | Separates Tool `auto-untertitel` (Whisper). Nicht SE-Scope. |
| Speaker-Diarisation | Separates Tool, andere Modelle. Scope-Inflation. |
| Equalizer / Klangfarbe-Regler | Kein SE-Feature. DAW-Territorium. |
| Preset-Auswahl (Indoor/Outdoor/Interview) | Single-Slider reicht. Preset-Explosion ist Komplexitäts-Falle. |
| Offline-PWA-Modus V1 | Cache-API reicht für Second-Load-Offline. Full-PWA-Support V2. |

#### D. Re-Evaluation-Trigger

- **Phase 2 Analytics (1 Monat nach Launch):** Conversion pro Modell-Toggle (Qualität vs. Schnell), Strength-Slider-Median-Value (Default-Tuning), Drop-off bei Chunk 5/10/20 (OOM / UI-Freeze-Indikator), Browser-Support-Quote.
- **User-Feedback-Threshold:**
  - >5 unabhängige Requests *„Batch"* → V1.1-Session.
  - >5 unabhängige Requests *„MP3"* → lame.js integrieren.
  - >5 unabhängige Requests *„Video-Output mit neuem Audio"* → Re-Mux-Pipeline mit Mediabunny.
  - >5 unabhängige Reports *„klingt trotzdem robotisch"* → Default-Slider auf 20 % senken oder DeepFilterNet2-Swap evaluieren.
- **Modell-Landschaft Q4 2026 / Q1 2027:**
  - ClearerVoice MossFormer2_SE_48K mit offiziellem ONNX? → Phase-2-Quality-Toggle-Kandidat.
  - DeepFilterNet4 erscheint? → Swap evaluieren.
  - Browser-Ready Universal-SR (Resemble-Enhance-Klasse, permissiv)? → neuer Quality-Tier.
- **EU-AI-Act 02.08.2025/2026 In-Kraft:** Labeling-Anforderungen konkret? Unsere Filter-Klassifikation muss juristisch noch validiert werden. Wenn SE-Tools doch labeling-pflichtig werden → Disclaimer von „optional" zu „prominent + Metadata-Tag Pflicht".
- **AdSense-Revenue:** wenn Tool Top-20 Traffic-Ranker wird → A/B-Test Ad-Positionierung (nur NACH `done`-State, nie während `converting`).

---

## 3. Komponenten

### 3.1 `src/components/tools/MLFileTool.svelte` *(bereits von `video-hintergrund-entfernen` angelegt — Audio-Erweiterung hier)*

Der MLFileTool-Wrapper aus §3.1 der Video-BG-Spec wird um folgende Audio-spezifische Slots erweitert:

- **Input-Preview:** bei Audio-Files `<audio controls src={blobUrl}>` vor Start (User kann Input prüfen), bei Video-Files nur Dateiname + Duration.
- **Strength-Slider-Slot:** Range-Input 0-100, Step 5, mit Label-Tick-Marks an 0/30/50/100 %. Tooltip bei >70 %: *„Kann bei Stimmen robotisch klingen."*.
- **A/B-Playback-Slot** (nur im `done`-State): zwei `<audio>`-Elemente (Original + Enhanced) mit gemeinsamem Play/Pause-State und sync `timeupdate`-Listener für Position-Sync. Umschalt-Button *„Vergleichen"* togglet zwischen beiden bei gedrückter Taste (Push-to-A/B).
- **„Tab nicht schließen"-Banner:** dezenter Warnhinweis unterhalb Progress-Bar, nur während `converting`. Copy: *„Bitte Tab offen lassen. Verarbeitung läuft lokal."*.

State-Machine bleibt identisch zum Video-Tool (§3.1 der Video-Spec):
```
idle ──drop──> preparing ──ok──> model-loading ──ok──> converting ──ok──> done ──reset──> idle
                  │                    │                  │              │
                  └──fail──> error     └──fail──> error   └──fail──> error
                                       │
                                       └──cache-hit──skip──> converting
```

**Neu bei Audio:** der `preparing`-State enthält für Video-Inputs zusätzlich den ffmpeg.wasm-Audio-Extraktions-Step, der separat gemessen wird (`Audio wird extrahiert… N %`).

### 3.2 `src/lib/tools/sprache-verbessern.ts` *(neu — Tool-Config)*

```ts
import type { MLFileToolConfig } from './schemas';

export const spracheVerbessern: MLFileToolConfig = {
  id: 'sprache-verbessern',
  type: 'ml-file-tool',
  categoryId: 'audio',
  iconPrompt:
    'Pencil-sketch icon of a sound-wave getting visually clearer (noisy chaotic ' +
    'strokes transitioning to clean sinusoidal curve), single-weight hand-drawn ' +
    'strokes in monochrome graphite gray, no shading, no fill, transparent ' +
    'background, minimalist line art, square aspect.',
  accept: [
    'audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/flac', 'audio/webm',
    'video/mp4', 'video/quicktime', 'video/webm',
  ],
  maxSizeMb: 200,
  softLimitMb: 500,
  filenameSuffix: '_enhanced',
  defaultFormat: 'wav',
  models: {
    quality: {
      url: '/models/deepfilternet3.onnx',
      sizeMb: 10,
      name: 'DeepFilterNet3',
      license: 'MIT OR Apache-2.0',
    },
    speed: {
      url: '/models/gtcrn_simple.onnx',
      sizeMb: 0.2,
      name: 'GTCRN',
      license: 'MIT',
    },
  },
  defaultModel: 'quality',
  strengthSlider: {
    enabled: true,
    min: 0,
    max: 100,
    default: 30,
    step: 5,
    ticks: [0, 30, 50, 100],
    warningThreshold: 70,
    warningText: 'Kann bei Stimmen robotisch klingen.',
    mapToParam: 'atten_lim_db',
    mapping: [
      { ui: 0, param: 0 },
      { ui: 30, param: 20 },
      { ui: 50, param: 40 },
      { ui: 100, param: 100 },
    ],
  },
  process: () => { throw new Error('runtime-only'); },
};
```

**Schema-Erweiterung nötig:** `MLFileToolConfig` aus der Video-Spec braucht optionalen `strengthSlider`-Block. In `src/lib/tools/schemas.ts` ergänzen:

```ts
strengthSlider: z.object({
  enabled: z.boolean(),
  min: z.number(),
  max: z.number(),
  default: z.number(),
  step: z.number(),
  ticks: z.array(z.number()),
  warningThreshold: z.number().optional(),
  warningText: z.string().optional(),
  mapToParam: z.string(),
  mapping: z.array(z.object({ ui: z.number(), param: z.number() })),
}).optional(),
```

### 3.3 `src/lib/tools/process-sprache-verbessern.ts` *(neu — Worker-Modul)*

Läuft **zwingend im Web-Worker** (`src/workers/sprache-verbessern.worker.ts`). Main-Thread postMessaged File + Config, Worker streamt Progress + Output-Chunks zurück.

**Pipeline-Skizze (Pseudo-Code, genaue API in Task 1.0/1.1-Spike):**
```ts
// Worker-Context
import { FFmpeg } from '@ffmpeg/ffmpeg';
import * as ort from 'onnxruntime-web/webgpu';
import wavefile from 'wavefile';

export async function processSpracheVerbessern(
  input: Uint8Array,
  inputMime: string,
  config: {
    modelUrl: string;
    attenLimDb: number; // von Strength-Slider gemappt
    modelChoice: 'quality' | 'speed';
  },
  onProgress: (
    phase: 'extract' | 'model' | 'infer',
    value: number,
    meta?: { chunkIdx: number; totalChunks: number }
  ) => void,
): Promise<{ audio: Uint8Array; mime: 'audio/wav' }> {
  // 1. Audio extrahieren (nur wenn Video-Input)
  let pcmInput: Float32Array;
  let sampleRate: number;

  if (inputMime.startsWith('video/')) {
    onProgress('extract', 0);
    const ffmpeg = new FFmpeg();
    await ffmpeg.load({ coreURL: '/ffmpeg/ffmpeg-core.js' }); // single-threaded
    await ffmpeg.writeFile('input.bin', input);
    await ffmpeg.exec(['-i', 'input.bin', '-ac', '1', '-ar', '48000', '-c:a', 'pcm_s16le', 'output.wav']);
    const wavBuffer = await ffmpeg.readFile('output.wav');
    const wav = new wavefile.WaveFile(wavBuffer);
    pcmInput = wav.getSamples(false, Float32Array) as Float32Array;
    sampleRate = 48000;
    onProgress('extract', 1);
  } else {
    // Audio-Input: Web Audio API Decode + Resample
    const audioCtx = new OfflineAudioContext(1, 48000 * 60 * 60, 48000);
    const decoded = await audioCtx.decodeAudioData(input.buffer);
    // ... resample logic to 48 kHz mono ...
    pcmInput = /* resampled Float32Array */;
    sampleRate = 48000;
  }

  // 2. Modell laden (aus Cache oder fetch)
  onProgress('model', 0);
  const session = await ort.InferenceSession.create(config.modelUrl, {
    executionProviders: ['webgpu', 'wasm'],
    intraOpNumThreads: 1, // AdSense-safe
  });
  onProgress('model', 1);

  // 3. Chunk-Pipeline (10 s Chunks mit 0.5 s Overlap-Add)
  const chunkSize = sampleRate * 10;
  const overlap = sampleRate * 0.5;
  const totalChunks = Math.ceil(pcmInput.length / (chunkSize - overlap));
  const output = new Float32Array(pcmInput.length);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * (chunkSize - overlap);
    const end = Math.min(start + chunkSize, pcmInput.length);
    const chunk = pcmInput.subarray(start, end);

    const inputTensor = new ort.Tensor('float32', chunk, [1, chunk.length]);
    const attenTensor = new ort.Tensor('float32', new Float32Array([config.attenLimDb]), [1]);
    const result = await session.run({ audio: inputTensor, atten_lim_db: attenTensor });
    const denoised = result.enhanced.data as Float32Array;

    // Overlap-Add
    for (let j = 0; j < denoised.length; j++) {
      const targetIdx = start + j;
      if (targetIdx >= output.length) break;
      if (j < overlap && i > 0) {
        const fade = j / overlap;
        output[targetIdx] = output[targetIdx] * (1 - fade) + denoised[j] * fade;
      } else {
        output[targetIdx] = denoised[j];
      }
    }

    onProgress('infer', (i + 1) / totalChunks, { chunkIdx: i + 1, totalChunks });
  }

  // 4. WAV-Export
  const wav = new wavefile.WaveFile();
  wav.fromScratch(1, 48000, '16', output);
  return { audio: wav.toBuffer(), mime: 'audio/wav' };
}
```

**Kritische Implementierungs-Details:**
- **ffmpeg.wasm single-threaded**: `/public/ffmpeg/ffmpeg-core.js` (NICHT `ffmpeg-core-mt.js`). Kein `SharedArrayBuffer`, kein COOP/COEP. Performance-Einbuße ~2-3× vs. multi-threaded, aber AdSense-safe.
- **Chunked-Processing**: verhindert OOM bei langen Audios. 10 s Chunks bei 48 kHz mono = 960 KB Float32 pro Chunk. Overlap-Add-Crossfade 0.5 s verhindert hörbare Chunk-Grenzen (Artefakt-Klick).
- **Sample-Rate-Lock auf 48 kHz**: DeepFilterNet3 wurde auf 48 kHz trainiert. Input in anderer SR → OfflineAudioContext-Resample in Worker. GTCRN speichert intern 16 kHz → Upsample-Down-Upsample-Pfad, automatisch.
- **`atten_lim_db`-Binding**: DeepFilterNet3 ONNX akzeptiert den Parameter als separaten Input-Tensor (muss in Task 1.1-Spike verifiziert werden — Fallback: Parameter hardcoded in ONNX-Graph, dann Modell-Varianten pro Slider-Stop).

### 3.4 §7a-6-Bedingungen-Checkliste

Aus CLAUDE.md Non-Negotiable #7a (ML-File-Tools mit Worker-Fallback):

| # | Bedingung | Erfüllung |
|---|---|---|
| 1 | WASM oder WebGPU (keine Server-Inferenz) | ✅ onnxruntime-web WebGPU-EP + WASM-CPU-Fallback |
| 2 | Modell <50 MB **ODER** lazy-load mit Progress | ✅ DeepFilterNet3 ~10 MB + GTCRN ~200 KB, beide lazy-load mit Progress-UI |
| 3 | Worker-Thread (kein Main-Thread-Freeze) | ✅ `src/workers/sprache-verbessern.worker.ts` Pflicht — ffmpeg.wasm single-threaded + onnxruntime-web beide im Worker |
| 4 | Offline nach First-Load (Cache-API) | ✅ Model + ffmpeg-core via `caches.match()` gecacht, alle Libs offline-fähig |
| 5 | Kein Server-Roundtrip zur Runtime | ✅ 100 % pure-client, keine Telemetrie, keine externen API-Calls |
| 6 | Self-hosted Modelle (keine CDN-Runtime-Pings) | ✅ `/public/models/*.onnx` + R2-CDN als Static-Asset, kein HuggingFace-Runtime |

---

## 4. Bekannte Risiken / Hardware-Grenzen

### 4.1 Performance (Realität-Check)

DeepFilterNet3 bei 2.3M Params, 48 kHz, WASM-EP single-thread ≈ **0.3-0.5× Realtime** auf typischem Desktop-CPU (Research §6). Konkret:
- 10 Min Audio → 20-30 Min Verarbeitung (CPU)
- 10 Min Audio → 4-7 Min Verarbeitung (WebGPU-EP, 2-5× faster)
- 1 h Podcast → 2-3 h Verarbeitung (CPU)

**Mitigation:**
- Ehrliche ETA im Progress-UI mit Kalibrierung pro Modell + EP (nach ersten 3 Chunks wird restliche Zeit extrapoliert).
- „Tab nicht schließen"-Banner während `converting`.
- Abort-Button always-visible.
- Speed-Toggle (GTCRN) als Ausweg für lange Aufnahmen: ~5× schneller als DeepFilterNet3, Qualitäts-Trade-off dokumentiert.

### 4.2 Memory (lange Audios)

- WAV 48 kHz 16-bit mono = 96 KB/s = 5.8 MB/Min = 350 MB/h.
- Float32-Working-Memory verdoppelt das → 700 MB für 1 h Audio im RAM.

**Mitigation:** Chunk-Pipeline hält nur das aktive 10-s-Chunk + Overlap-Puffer im Worker-RAM. Input und Output werden als Streams im Worker gehalten und erst am Ende an Main-Thread transferiert (`postMessage` mit Transfer-List). Peak-RAM konstant ~50 MB unabhängig von Audio-Länge.

### 4.3 WebGPU-Browser-Support

- Chrome 113+ · Edge 113+ · Safari 17.4+ · Opera 99+ ✅
- Firefox 130+ Desktop ✅
- Firefox Android ⚠ (experimentell bis Q4 2026)
- iOS Safari < 17.4 ✗ → WASM-CPU-Fallback + Warning

### 4.4 ffmpeg.wasm single-threaded Bottleneck

- Multi-threaded ffmpeg.wasm wäre ~2-3× schneller, braucht aber COOP/COEP-Header → AdSense-KO.
- Single-threaded ffmpeg.wasm-Decode für 1 h MP4 ≈ 60-120 s im Worker.
- Acceptable: Decode-Phase ist nur ~5 % der Gesamt-Pipeline-Zeit (Inferenz dominiert).

**Mitigation:** Audio-Decode-Phase wird separat angezeigt (`Audio wird extrahiert… N %`) damit User versteht wo die Zeit bleibt.

### 4.5 Chunk-Boundary-Artefakte

Chunk-Processing mit festen Grenzen kann **Klick-Artefakte** an Chunk-Übergängen erzeugen. Mitigation:
- **Overlap-Add-Crossfade** 0.5 s: die letzten 0.5 s eines Chunks und die ersten 0.5 s des nächsten werden linear gekreuzblendet.
- **Task 1.2-Spike:** Overlap-Länge und Crossfade-Kurve (linear vs. Hann vs. raised-cosine) gegen reales Audio validieren. Ziel: hörbare Tests auf Podcast-Material.
- V1.1-Candidate falls weiterhin Artefakte: Overlap-Save statt Overlap-Add, oder Modell-Input-Window vergrößern auf 30 s.

### 4.6 `atten_lim_db` ONNX-Parameter-Binding

DeepFilterNet3 hat in der PyTorch-Implementation `atten_lim_db` als Runtime-Parameter. Ob der offizielle ONNX-Export diesen Parameter als separaten Input-Tensor exponiert oder im Graph hardcoded ist, **muss Task 1.1-Spike** klären.

**Mitigation-Pfade:**
- **Best-Case:** Parameter ist Input-Tensor → UI-Slider 1:1 mapped.
- **Fallback-A:** Parameter hardcoded → 4 ONNX-Varianten bundlen (0/20/40/100 dB), Slider wählt Variante (+20 MB Total-Download statt 10).
- **Fallback-B:** Parameter nicht exponiert → Post-Processing-Mix im Worker: `output = wet * strength + dry * (1 - strength)`. Weniger akkurat (Adobe-Style-Intensity statt echte Modell-Kontrolle), aber funktioniert ohne Modell-Varianten.

### 4.7 AdSense-Kompatibilität

Kein SharedArrayBuffer, kein COOP/COEP.
- onnxruntime-web mit `numThreads: 1` (WASM-Threads off) ✅
- WebGPU-EP braucht keine COOP/COEP ✅
- ffmpeg.wasm `@ffmpeg/core` (single-threaded) ohne `-mt`-Suffix ✅

### 4.8 EU-AI-Act-Grenzfall

DeepFilterNet3 ist deterministischer Filter (Time-Frequency-Mask auf Spektrum) — **keine Synthese, kein Vocoder**. Der Output ist nicht „synthetische Sprache" iSd. Art. 50 EU-AI-Act (Research §5). Trotzdem:
- FAQ-Entry *„Ist das ein Deepfake?"* / *„Muss ich das Ergebnis kennzeichnen?"* mit juristisch konservativer Antwort.
- Footer-Zeile auf Tool-Seite: *„Verbessert Audio durch Rausch-Entfernung. Generiert keine synthetische Sprache."*.
- **Re-Evaluation 02.08.2026** nach In-Kraft-Treten der Art. 50-Labeling-Pflicht: wenn Rechts-Auslegung SE-Tools doch einbezieht → prominent-Disclaimer + Metadata-Tag nachziehen.

### 4.9 `@ffmpeg/core` LGPL-2.1-Ambiguität

`@ffmpeg/core` ist LGPL-2.1. Das ist **dynamic-link-konform** (npm-Dep, nicht static-linked). Wir sind safe solange wir:
- Ihren Build nicht patchen (wir verlinken nur).
- Attribution im FAQ + Imprint aufführen.
- User können's theoretisch gegen eigenen Fork austauschen (dynamic-replaceable-Anforderung der LGPL).

Gleiches Vorgehen wie bei `hevc-zu-h264` (dort bereits approved). Kein AGPL-Risiko.

---

## 5. Testing

### 5.1 Unit

- `mapSliderToAttenDb(uiValue)`-Tests (Interpolation an Stop-Punkten 0/30/50/100).
- `selectModel(config)`-Tests (Quality/Speed-Toggle, Model-URL-Resolver).
- `overlapAddCrossfade(chunkA, chunkB, overlap)`-Tests (hörbar-artefakt-frei bei synthetischem Sinus-Input).
- `extractAudioFromVideo(file, mime)`-Tests (MP4/MOV/WebM → PCM mit korrekter SR).
- `estimateTotalTime(audioLength, model, gpu?)`-Tests (ETA-Kalibrierung nach ersten 3 Chunks).

### 5.2 Integration

- ffmpeg.wasm + onnxruntime-web WebGPU mit Mock-ONNX-Session.
- Worker-postMessage-Abort-Path (User klickt Stop mitten im Chunk 20).
- Cache-API-Hit vs. Miss (First- vs. Second-Load).
- Chunk-Boundary-Test mit 23.7 s Audio (ungerades Vielfaches von Chunk-Size-overlap-offset).

### 5.3 Manual Smoke

- **Browser:** Chrome 113+ Desktop · Safari 17.4+ · Firefox 141+ · Edge 113+ · iOS Safari 17.4+ · Android Chrome
- **Audio-Material:**
  - Podcast-Take 5 Min (Raum-Hall) → Dereverb-Quality
  - Tastatur-Click-Recording 2 Min (typisch Remote-Interview) → Denoise-Quality
  - Lüfter-Aufnahme 10 Min (Streaming-Mikro) → Broadband-Noise-Quality
  - Straßenlärm-Take 3 Min (Outdoor-Reporter) → Impulse-Noise-Quality
  - Deutsches Material mit Dialekt (Bayrisch/Sächsisch) → EN-Bias-Test
  - 60 Min Endurance-Take → Memory-Stability + Chunk-Boundary-Audibility
- **Video-Input:**
  - MP4 iPhone-Recording 5 Min → Audio-Extraktion + Enhance round-trip
  - MOV ProRes 2 Min → Codec-Compat
- **Slider-Sweep:** Tests bei 0/15/30/50/70/100 % mit derselben Input-Datei, subjektive Bewertung Klangfarbe + Artefakt-Neigung.
- **Modell-Toggle:** Qualität ↔ Schnell mit identischem Input, Laufzeit + SNR-Vergleich.
- **A/B-Playback:** Sync-Scrub-Präzision (≤50 ms Drift bei 1 h Material).
- **Abort mitten im Chunk 20** → Memory-Release-Verifikation.
- **Cache-Eviction-Simulation** → Re-Download-UI.

### 5.4 License-Audit (one-shot vor Release)

- `npm ls --prod` — keine AGPL/GPL/NC-Transitives.
- Verify `/public/models/deepfilternet3.onnx` + `gtcrn_simple.onnx` SHA256 gegen offizielle Release-Hashes.
- Verify FAQ-Page listet Modell-Namen + Lizenz-Strings + Links zu Repos.
- Verify `@ffmpeg/core`-Version ist single-threaded-Variante (nicht `-mt`).

---

## 6. Release-Kriterien

**Pflicht für V1-Release:**
- [ ] §7a-6-Bedingungen-Checkliste alle ✅ (§3.4)
- [ ] 5 Browser-Smoke-Tests grün (Chrome/Safari/Firefox/Edge + iOS Safari)
- [ ] 60 Min Endurance-Take erfolgreich (≤2 h Verarbeitung auf M2/RTX 3060-Klasse mit WebGPU, ≤4 h ohne)
- [ ] Slider-Sweep-Test: keine hörbaren Chunk-Boundary-Artefakte bei Stop 30 %
- [ ] DeepFilterNet3-Output gegen Adobe-V1/V2-Reference subjektiv *„gleichwertig oder besser"* auf 3 DE-Testsamples (nicht EN-Bias)
- [ ] A/B-Playback-Sync <50 ms Drift bei 1 h Material
- [ ] Video-Input (MP4/MOV/WebM) → Audio-Extraktion → Enhance round-trip funktioniert
- [ ] EU-AI-Act-Disclaimer (Footer + FAQ) live
- [ ] Abort-Button funktioniert + Memory-Release verifiziert
- [ ] License-Audit grün
- [ ] AdSense-Kompatibilitäts-Check: Slot rendert ohne COOP/COEP-Blockade
- [ ] FAQ + Schema.org-Markup live (inkl. DeepFilterNet3-MIT-Attribution)
- [ ] Tool-Config + `MLFileToolConfig`-Schema-Erweiterung (`strengthSlider`) in Zod validiert
- [ ] `MLFileTool.svelte`-Audio-Erweiterungen (Input-Preview, A/B-Playback-Slot, Strength-Slider-Slot) integriert
- [ ] PROGRESS.md updated
- [ ] CONVENTIONS.md `MLFileTool-Template`-Section um Audio-Pipeline-Erweiterung ergänzt

**Nicht-Pflicht (V1.1-Kandidaten):**
- MP3-Output (lame.js)
- Video-Output (Audio-Spur-Swap via Mediabunny-Remux)
- Batch-Upload
- Preset-Auswahl (Indoor/Outdoor/Interview)
- DeepFilterNet2-Fallback-Swap
- ClearerVoice MossFormer2_SE_48K Phase-2-Quality-Toggle (wartet auf Community-ONNX)

---

## 7. Aus Scope (V1)

Siehe §2.2 Scope-Cut + §2.4 C. Wichtigste Ausschlüsse zur Erinnerung:
- Kein Voice-Cloning / TTS (Art. 50-Sprengstoff)
- Keine Music-Separation (separates Tool)
- Keine Filler-Word-Removal (braucht Whisper, separates Tool)
- Kein Real-Time-Mic-Denoising (Krisp-Territorium)
- Kein Batch-Upload
- Kein MP3-Output V1
- Kein Video-Output V1 (nur Audio-WAV)
- Keine Loudness-Normalisierung (separates Tool)
- Keine Auto-Untertitel (separates Tool)
- Keine Speaker-Diarisation (separates Tool)
- Keine CC-BY-NC / AGPL / GPL-Modelle (Facebook Denoiser, proprietäre Maxine/Krisp)

---

## 8. Datenschutz / Recht

### 8.1 DSGVO

- **Keine personenbezogenen Daten auf Server.** Audio-Datei bleibt im Browser-RAM + Worker. Output-File lokal via Blob-URL.
- **Biometrie-Sensibilität:** Stimme ist biometrisches Datum iSd. Art. 9 DSGVO. Unser pure-client-Ansatz vermeidet den Rechtsrahmen vollständig — keine Verarbeitung auf unseren Servern, keine Auftragsverarbeiter-Verträge nötig.
- **Keine Cookies** außer Tool-State (`localStorage` für Modell-Toggle + Strength-Slider-Last-Value als Convenience, opt-in, kein Tracking).
- **AdSense ab Phase 2:** Consent-Banner regelt. Ohne Consent keine Ads, Tool funktioniert voll.
- **Datenschutzerklärung-Anker** auf Tool-Seite: *„Dieses Tool verarbeitet deine Audio- oder Video-Datei ausschließlich in deinem Browser. Es wird nichts hochgeladen."*

### 8.2 EU-AI-Act (Art. 50, 02.08.2025/2026 Labeling-Pflicht)

- **Klassifikation (unsere Einschätzung):** DeepFilterNet3 = Time-Frequency-Mask-Filter, keine Sprachsynthese, keine Sprach-Generierung. **Nicht von Art. 50 betroffen** (Research §5: *„SE-Tools mit deterministischem Filter-Ansatz fallen NICHT unter Art. 50 weil keine Synthese"*).
- **Disclaimer im Tool-Footer + FAQ:** *„Dieses Tool verbessert Audio durch Rausch-Entfernung (Time-Frequency-Mask-Filter). Es generiert keine synthetische Sprache. DeepFilterNet3 ist ein deterministischer Filter, kein generatives Modell."*
- **FAQ-Entry** *„Muss ich das Ergebnis kennzeichnen?"* mit juristisch konservativer Antwort (Empfehlung auf freiwillige Kennzeichnung hinweisen, wenn substantielle Änderung am Original).
- **Re-Evaluation 02.08.2026** nach finaler Rechts-Auslegung: wenn SE-Tools doch einbezogen werden → Metadata-Tag `com.konverter.audio_enhanced=true` im WAV-`bext`-Chunk schreiben + prominenter UI-Disclaimer.

### 8.3 Modell-Lizenzen (Transparenz)

FAQ-Entry *„Welche Modelle nutzt ihr?"*:
- **DeepFilterNet3** (MIT OR Apache-2.0 Dual-License, Rikorose 2023) — [GitHub](https://github.com/Rikorose/DeepFilterNet)
- **GTCRN** (MIT License, Xiaobin-Rong 2024) — [GitHub](https://github.com/Xiaobin-Rong/gtcrn)
- **onnxruntime-web** (MIT License, Microsoft) — [GitHub](https://github.com/microsoft/onnxruntime)
- **ffmpeg.wasm** (LGPL-2.1, ffmpegwasm) — [GitHub](https://github.com/ffmpegwasm/ffmpeg.wasm)
- **wavefile** (MIT License, rochars) — [GitHub](https://github.com/rochars/wavefile)

### 8.4 Patent-Exposure

- **AAC/MP3-Decode via ffmpeg.wasm:** AAC-Patente laufen 2027+ aus, MP3-Patente bereits Public-Domain seit 2017. Für Decode keine eigene Lizenz-Pflicht.
- **WAV-Output:** royalty-free.
- **AAC-Encode-Output ist ausgeschlossen** (V1 nur WAV, MP3 V1.1 via lame.js = Public-Domain).
- **DeepFilterNet3 / GTCRN:** keine bekannten Patent-Claims, MIT bzw. MIT OR Apache-2.0 = Patent-Grant implizit (Apache-2.0 explizit).

---

## 9. Offene Tasks vor Dispatch

1. **Task 1.0 — DeepFilterNet3-Browser-Validation-Spike** (2-3 h): DeepFilterNet3 ONNX-Export (`deepfilternet3.onnx` aus offiziellem Release) in onnxruntime-web WASM-EP `numThreads: 1` laden + Inference auf synthetischem 10 s Sinus-Test-Audio. Baseline: Community-Demo `github.com/grazder/samejs/tree/first_demo/deepfilternet3` funktioniert → Port auf unser Setup validieren. **Abbruch-Kriterium:** wenn Inference-Zeit >2× Realtime oder Output-Audio korrupt → DeepFilterNet2 als Primary evaluieren.
2. **Task 1.1 — `atten_lim_db` ONNX-Parameter-Spike** (1 h): Prüfen ob der offizielle DeepFilterNet3 ONNX-Export den `atten_lim_db`-Parameter als Input-Tensor exponiert. Wenn ja → direkt binden. Wenn nein → Entscheidung Fallback-A (Modell-Varianten bundlen) vs. Fallback-B (Wet/Dry-Mix im Post).
3. **Task 1.2 — Chunk-Boundary-Artefact-Audibility-Spike** (1-2 h): Overlap-Add mit 0.25/0.5/1.0 s Overlap gegen synthetisches + reales Podcast-Material testen. Hörbar-Test von 3 unabhängigen Personen. Ziel: keine Klick-Artefakte bei Slider-Stop 30 %. Fallback: Overlap-Save oder Window-Kurven-Anpassung.
4. **Task 1.3 — ffmpeg.wasm-Audio-Extraktion-Spike** (1 h): MP4/MOV/WebM-Input → Audio-Extraktion auf single-threaded ffmpeg.wasm in Worker validieren. Performance + Memory-Footprint pro 10 Min Video-Input messen. Sanity-Check gegen aktuelle `hevc-zu-h264`-Implementation.
5. **Task 1.4 — `MLFileToolConfig`-Schema-Erweiterung** (30 Min): `strengthSlider`-Block in `src/lib/tools/schemas.ts` ergänzen + Zod-Tests. Nicht-Breaking-Change für bestehende Video-BG-Config (optionales Feld).
6. **Task 1.5 — CONVENTIONS.md Audio-Erweiterung des MLFileTool-Template** (1 h): Dokumentieren wie Audio-Tools das MLFileTool-Wrapper nutzen, speziell die zusätzlichen Slots (Input-Preview, Strength-Slider, A/B-Playback). Vor Implementierung committed.

---

**Version:** Draft v1 · 2026-04-22
**Next:** User-Approval des Scope § und Spike-Tasks → Implementation-Branch `feat/sprache-verbessern` (nach `video-hintergrund-entfernen`-Launch, damit `MLFileTool.svelte` als Basis bereits gelockt ist)
