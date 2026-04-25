---
title: Speech-Enhancement-Tool Deep-Research (Adobe-Podcast-Enhancer-Äquivalent)
tool_slug: sprache-verbessern
enum: audio (mit video-Input-Support)
tier: 8g
status: research-complete (2026-04-22) — dispatch-ready
researcher: Agent (subagent a2668e230e313f0b1)
duration_ms: 239956
---

# Speech-Enhancement / Audio-Verbesserung Research

**Kontext.** User-Anfrage: pure-client-Tool äquivalent zu Adobe Podcast Enhancer (Background-Noise-Removal + Speech-Clarity + Strength-Slider). Video- oder Audio-Input, verbesserter Audio-Output. Kein Upload, keine Paywall, kein Watermark.

## §1 TL;DR

- **Primary:** **DeepFilterNet3** — MIT OR Apache-2.0 Dual-License (Code + Weights im selben Repo), 2.3M Params, ~10 MB ONNX, full-band 48 kHz, offizieller ONNX-Export (`DeepFilterNet3_onnx.tar.gz`), browser-ready via onnxruntime-web WASM-EP single-thread.
- **Fallback:** **DeepFilterNet2** (gleiche Lizenz, HF Space live) falls v3-Kompat-Probleme.
- **Speed-Toggle:** **GTCRN** (MIT, 48k Params, ~200 KB ONNX, in sherpa-onnx integriert) — für schwache Geräte / Mobile / Low-End.
- **Phase-2-Quality-Toggle (optional):** **ClearerVoice MossFormer2_SE_48K** (Apache-2.0, SOTA 2024), aber ONNX-Export ist Community-Effort → nicht V1.
- **Ausgeschlossen:** Resemble Enhance (ONNX fehlt, Weights-Lizenz unklar, Vocoder → EU-AI-Act-Grenzfall) · VoiceFixer (kein ONNX, >100 MB) · Facebook Denoiser (CC-BY-NC = KO) · Miipher/Miipher-2 (Google proprietär) · NVIDIA Maxine/Krisp (proprietär).

**Schlüssel-Erkenntnis:** Das qualitativ beste Modell (Resemble Enhance / Adobe-Internal) ist für uns nicht verfügbar. **DeepFilterNet3 ist das beste MIT/Apache-lizenzierte Modell** — State-of-the-Art 2023, deterministischer Filter-Ansatz (Time-Frequency-Mask), kein Vocoder → EU-AI-Act-sauber.

## §2 Modell-Matrix

| Modell | Code-Lizenz | Weights | Qualität | ONNX/Größe | Browser-Ready | Urteil |
|---|---|---|---|---|---|---|
| **DeepFilterNet3** | MIT OR Apache-2.0 | MIT OR Apache-2.0 (same repo) | Hoch (SOTA 2023, full-band 48k) | ✓ offiziell, ~10 MB | ✓ Community-Demos (grazder/samejs, SpeechDenoiser) | ✓ **Primary** |
| **DeepFilterNet2** | MIT OR Apache-2.0 | MIT OR Apache-2.0 | Sehr gut | ✓ | ✓ HF Space live | ✓ Fallback |
| **GTCRN** | MIT | MIT | Gut (light, 16k) | ✓ `gtcrn_simple.onnx` in sherpa-onnx; ~200 KB | ✓ ultra-light | ✓ **Speed-Toggle** |
| **ClearerVoice MossFormer2_SE_48K** | Apache-2.0 | Apache-2.0 | SOTA 2024 (48k SR+SE) | ⚠ Community-Effort, kein offizielles ONNX | ⚠ noch nicht | ⚠ **Phase 2** |
| **SpeechBrain MetricGAN+** | Apache-2.0 | Apache-2.0 | Gut (voicebank-trained, 16k) | ⚠ Community-Export | ⚠ nicht out-of-box | ⚠ |
| **RNNoise** (xiph) | BSD-3-Clause + CC0 | BSD | Okay, schmal-band-voice | ✓ WASM | ✓ trivial | ⚠ zu schwach vs. Adobe |
| **VoiceFixer** | MIT | MIT | Hoch (Super-Res + Denoise) | ✗ kein ONNX, PyTorch-only, >100 MB | ✗ | ✗ zu heavy |
| **Resemble Enhance** | MIT (Code) | **Weights-Lizenz nicht explizit** auf HF | SOTA | ✗ kein ONNX (Issue #39 offen) | ✗ | ⚠ Risiko |
| **Facebook Denoiser** | **CC-BY-NC 4.0** | CC-BY-NC 4.0 | Gut | — | — | ✗ **KO** (AdSense commercial) |
| **NVIDIA NeMo SE** | Apache-2.0 | ⚠ Mixed — NVIDIA-internal-research-only bei vielen | SOTA | ✓ teilweise | ⚠ nicht pur | ⚠ Einzel-prüfen |
| **NVIDIA Maxine / Krisp SDK** | Proprietär | Proprietär | SOTA | ✗ | ✗ | ✗ |
| **Adobe Podcast Enhancer** | Closed-SaaS | Proprietär | Marktführer | ✗ | ✗ | ✗ (ist die Baseline) |
| **Miipher / Miipher-2** (Google) | Nicht veröffentlicht | — | SOTA research | ✗ | ✗ | ✗ keine offiziellen Weights |
| **DCUnet / DCCRN / Asteroid** | MIT | MIT | Gut | Community-ONNX | ⚠ | ⚠ Exotics |
| **SEMamba / CMGAN / MetricGAN+** | Research (teilw. MIT/NC) | — | SOTA-Research | Einzel-prüfen | — | ⚠ |
| **Silero VAD** | MIT | MIT | VAD (kein SE) | ✓ ONNX | ✓ | ✓ als Pre-Processing (Segment-Erkennung für Chunking) |

## §3 Konkurrenz-Matrix

| Tool | USP | Free-Tier | Paywall | Privacy | Schwäche |
|---|---|---|---|---|---|
| **Adobe Podcast Enhancer** | Marktführer, „Enhance Strength"-Slider | Free, aber 4h/Tag + Upload-Quota + Login-Pflicht | 9.99/mo oder 99.99/J | Cloud-Upload Pflicht | V2 „roboterhaft", over-processing; paywalled |
| **Auphonic** | Full-Post-Production (Loudness, MP3-Tags) | 2 h/Monat | 11–99/mo | Cloud | Teuer, kein reines SE |
| **Cleanvoice AI** | Filler-Words + Noise | 30 Min Trial | 11–90/mo | Cloud | Trustpilot: Upload-Verlust, Audio-Cuts |
| **Descript Studio Sound** | In-Editor integriert | Gratis mit Limits | 12–24/mo | Cloud | Nur in Descript-App |
| **Krisp.ai** | Echtzeit-Call-Noise | 60 Min/Tag | 8–16/mo | Cloud/SDK | Call-Focus, nicht Post |
| **Riverside Magic Audio** | In Recording-App | — | Paid | Cloud | Vendor-Lock |
| **Kapwing Clean Audio** | Video-Editor | Free mit Watermark | 16–24/mo | Cloud | Watermark free |
| **VEED Audio Cleaner** | Editor | Free mit Limits | 12–59/mo | Cloud | Export-Watermark |
| **Clipchamp Audio Clean** | MS-SaaS | In Win | MS-365 | Cloud | Win-Lock |
| **Podcastle Magic Dust** | All-in-One Podcast | 3h/mo | 14.99/mo | Cloud | — |
| **Supertone Clear** | VST-Plugin + SaaS | Trial | Paid | Desktop | Nicht browser |
| **Audo Studio** | One-Click-Cleanup | Free-Tier | Paid | Cloud | — |
| **AudioCleaner AI** | Web | „Free" | Upsell | Cloud (laut Site „stores nothing") | Closed-Source |

**White-Space:** KEIN Konkurrent ist pure-client + no-login + no-upload + no-watermark + mit Strength-Slider + DE-native.

## §4 User-Wishes (wörtliche Pain-Points)

1. **Adobe V2 Over-Processing:** *"V2 sounds less natural, aggressively cutting off the ends of words, performing poorly on recordings with multiple speakers."* (Podcast-Consultant 2026)
2. **Robotic Voice + Slider-Hack:** *"voices sounding robotic or artificial compared to the original V1 algorithm"* (Adobe-Community 2025). Mitigation-Hack: *"adjust the enhancement slider to a lower setting (around 30-50%) rather than maximum"* → **Slider ist Pflicht.**
3. **English-Bias:** *"the AI model appears to be heavily optimized for standard American English … can struggle to accurately process other strong accents or different languages."* → **Chance für DE-native Ansatz.**
4. **Paywall-Frust:** *"purchased a premium license … unable to use it for two weeks, tool continuously prompting them to buy a new license"* (Adobe-Community 15159562)
5. **4h/Day-Cap:** *"4-hour daily limit on the enhancer feature … even with a premium subscription, there seemed to be no way to pay for increased limits"* → **Unlimited-Local ist Differenzierungs-Feature.**
6. **Upload-Verlust (Cleanvoice, Trustpilot):** *"after uploading for about 30 minutes … their upload suddenly disappeared and they had to start from scratch."*
7. **Audio-Cuts:** *"during sound restoration, small pieces of audio were cut out, with several seconds being lost."*

**Kategorisiert:** Quality (over-processing, robotic, cuts) · UX (Slider fehlt, Caps) · Privacy (Cloud-Zwang) · Language (EN-Bias).

## §5 Trends 2026

1. **WebGPU cross-browser shipped** (Nov 2025, 82.7% Coverage). Transformers.js v4 (Feb 2026) = 3-10× Speed vs. WASM. → Reif für Audio-Inferenz.
2. **Universal Speech Restoration** (Miipher-2, Resemble Enhance): Diffusion/SSL-basiert, „studio-like"-Output, aber **nicht browser-ready 2026**. → Wir bleiben deterministisch (DeepFilterNet).
3. **Local-First Agentic Audio** (MS Ankündigung „on-device AI podcast studio"): Big-Tech bewirbt „kein Upload" 2026 selbst. → Rückenwind.
4. **EU-AI-Act Art. 50** (wirksam 02.08.2025): Synthetic Audio muss gekennzeichnet werden. **SE-Tools (Denoising/Super-Resolution) fallen NICHT unter Art. 50** weil keine Synthese. **DeepFilterNet3 filtert (Time-Frequency-Mask), synthetisiert nicht** → sauber. Resemble Enhance/VoiceFixer = Vocoder = Grenzfall.
5. **ffmpeg.wasm single-threaded** (nicht `-mt`) ist unsere einzige Option (multi-threaded bricht AdSense wegen COOP/COEP). Reicht für typische Podcast-Längen, CPU-blocking → Web-Worker Pflicht.

## §6 Browser-Demo-Belege

- **DeepFilterNet2 HF Space (live):** https://huggingface.co/spaces/hshr/DeepFilterNet2
- **DeepFilterNet3 Browser Demo (Community):** https://github.com/grazder/samejs/tree/first_demo/deepfilternet3
- **SpeechDenoiser (DeepFilterNet3 + GTCRN ONNX):** https://github.com/yuyun2000/SpeechDenoiser — belegt ONNX-Pipeline produktiv
- **sherpa-onnx Speech-Enhancement-Module:** https://github.com/k2-fsa/sherpa-onnx (NPM-Paket `sherpa-onnx`)
- **Transformers.js v4 WebGPU:** https://blog.worldline.tech/2026/01/13/transformersjs-intro.html

**Performance-Erwartung** (aus SpeechDenoiser + Valin W3C): DeepFilterNet3 bei 2.3M Params, 48 kHz, WASM-EP single-thread ≈ 0.3-0.5× Realtime auf typischem Desktop-CPU → 10 Min Audio = 20-30 Min Processing. WebGPU-EP schätzungsweise 2-5× schneller. → **Progress-Bar + Chunked-Processing + „Tab nicht schließen"-Hinweis Pflicht.**

## §7 FINAL RECOMMENDATION

### Primary: DeepFilterNet3

**Lizenz-Zitat (LICENSE-Datei):** *"Licensed under either of Apache License, Version 2.0 or MIT license at your option."* Code + Weights im selben Repo unter derselben Dual-License — keine Weights-Separation, keine NC-Klausel. AdSense/Closed-Bundle safe.

**Warum:** 2.3M Params, ~10 MB ONNX, offizieller ONNX-Export, full-band 48 kHz, deterministischer Filter-Ansatz (Mask auf Spektrum), kein Vocoder → EU-AI-Act unproblematisch. Browser-Demos existieren, onnxruntime-web WASM-EP single-thread-fähig.

**Strength-Slider:** DeepFilterNet3 hat nativ `atten_lim_db`-Parameter (Attenuation-Limit in dB) — mapbar auf UI-Slider 0-100%. Löst genau den Adobe-V2-Robotik-Pain.

### Fallback: DeepFilterNet2
Gleiche Lizenz, HF Space live, falls v3 Kompat-Probleme im Browser.

### Speed-Toggle: GTCRN
48K Params, ~200 KB ONNX, MIT, in sherpa-onnx integriert. Für Low-End-Devices / Mobile.

### Phase-2-Quality-Toggle (optional): ClearerVoice MossFormer2_SE_48K
Apache-2.0 Code+Weights, SOTA 2024, aber ONNX-Export Community-Effort → Phase 2 evaluieren wenn Analytics zeigen dass DeepFilterNet3 nicht reicht.

### Architektur-Stack

| Layer | Choice | Lizenz | Begründung |
|---|---|---|---|
| Audio-/Video-Dekodierung | **ffmpeg.wasm** (`@ffmpeg/core`, **single-threaded**, NICHT `-mt`) | LGPL-2.1 Dynamic-Link (npm-Dep) | Input MP4/MOV/MP3/WAV/M4A/OGG; kein COOP/COEP → AdSense bleibt safe |
| ML-Runtime | **onnxruntime-web 1.23+** (`numThreads: 1`, WebGPU-EP primary, WASM-EP Fallback) | MIT | Browser-native Audio-ML |
| Default-Modell | **DeepFilterNet3** | MIT OR Apache-2.0 | SOTA permissiv, Strength-Slider nativ |
| Speed-Modell | **GTCRN** | MIT | Low-End |
| Audio-Pipeline | Web Audio API → Resample 48 kHz → Chunk-Processing (~10 s Blöcke) im Worker → DeepFilterNet3 → Concat | — | Kein Full-File-Load, konstanter RAM |
| Output-Encoding | WAV via `wavefile` (oder ffmpeg.wasm für MP3) | MIT / LGPL | V1: WAV; MP3 erst wenn lame.js-Overhead gerechtfertigt |
| A/B-Playback | 2× `<audio>`-Elemente mit sync-Scrub | — | Vertrauens-Feature, Konkurrenten haben das nicht |
| Model-Delivery | `/public/models/deepfilternet3.onnx` | — | ~10 MB, lazy-load mit Progress-Bar |

### Was NICHT bauen (Scope-Cuts)

- **Keine Voice-Cloning / TTS** — EU-AI-Act Art. 50 Sprengstoff, Scope-Creep
- **Keine Music-Separation** (LaLaLa/Moises) — separates Tool, andere Modelle
- **Keine Filler-Word-Removal** (Cleanvoice-Feature) — braucht ASR (Whisper), separates Tool
- **Keine Real-Time-Mic-Denoising** — Krisp-Territorium, andere Use-Case-Optimierung
- **Kein Batch** (10+ Dateien) — Auphonic-Territorium, V1.1
- **Kein MP3-Encoding V1** — WAV reicht; MP3 erst wenn lame.js-Size-Overhead gerechtfertigt

### EU-AI-Act-Risiko: minimal
DeepFilterNet3 = Filter (Mask-basiert), kein generatives Modell. Kein Art. 50-Trigger. Footer/FAQ-Disclaimer: *„Tool verbessert Audio durch Rausch-Entfernung; es generiert keine synthetische Sprache."*

### Offene Punkte vor Spec-Lock
- DeepFilterNet3 nicht offiziell „produktions-ready-in-browser" (Community-Code only) → **Prototyp-Validierung vor Spec-Lock**
- WebGPU-EP für Audio-Models noch nicht breit benchmarked → **WASM-EP Primary, WebGPU Enhancement**
- ffmpeg.wasm single-threaded CPU-blocking → **Web-Worker + OffscreenCanvas für Progress**

## §8 Quellen

**DeepFilterNet:**
- [GitHub Rikorose/DeepFilterNet (MIT OR Apache-2.0)](https://github.com/Rikorose/DeepFilterNet)
- [LICENSE](https://github.com/Rikorose/DeepFilterNet/blob/main/LICENSE)
- [Browser Demo Issue #472](https://github.com/Rikorose/DeepFilterNet/issues/472)
- [samejs Web-Demo Branch](https://github.com/grazder/samejs/tree/first_demo/deepfilternet3)
- [Intel/deepfilternet-openvino HF](https://huggingface.co/Intel/deepfilternet-openvino)
- [SpeechDenoiser (DFN3 + GTCRN ONNX)](https://github.com/yuyun2000/SpeechDenoiser)

**Alternativen (mit Lizenz-Check):**
- [GTCRN (MIT)](https://github.com/Xiaobin-Rong/gtcrn)
- [sherpa-onnx SE-Module](https://github.com/k2-fsa/sherpa-onnx)
- [ClearerVoice-Studio (Apache-2.0)](https://github.com/modelscope/ClearerVoice-Studio)
- [MossFormer2_SE_48K HF](https://huggingface.co/alibabasglab/MossFormer2_SE_48K)
- [SpeechBrain MetricGAN+ (Apache)](https://huggingface.co/speechbrain/metricgan-plus-voicebank)
- [RNNoise xiph (BSD+CC0)](https://github.com/xiph/rnnoise)
- [Resemble Enhance (MIT Code, Weights ⚠)](https://github.com/resemble-ai/resemble-enhance/blob/main/LICENSE)
- [Resemble Enhance ONNX Issue #39](https://github.com/resemble-ai/resemble-enhance/issues/39)
- [VoiceFixer (MIT)](https://github.com/haoheliu/voicefixer/blob/main/LICENSE)
- [Silero VAD (MIT)](https://github.com/snakers4/silero-vad)

**Negative KO:**
- [Facebook Denoiser README (CC-BY-NC)](https://github.com/facebookresearch/denoiser/blob/main/README.md)
- [Miipher-2 Paper (Google proprietär)](https://arxiv.org/html/2505.04457)

**Konkurrenten + User-Wishes:**
- [Adobe Podcast V2 Robotic (ThePodcastConsultant)](https://thepodcastconsultant.com/blog/adobe-podcast-enhance)
- [Adobe Podcast 4h/Day + Paywall (Community)](https://community.adobe.com/t5/adobe-podcast-discussions/no-access-to-adobe-podcast-premium/td-p/15159562)
- [Cleanvoice Trustpilot](https://www.trustpilot.com/review/cleanvoice.ai)
- [Cleanvoice Pricing](https://cleanvoice.ai/pricing/)
- [Auphonic Pricing](https://auphonic.com/)

**Trends + Recht:**
- [EU AI Act Article 50](https://artificialintelligenceact.eu/article/50/)
- [EU AI Act Deepfake Rules Aug 2025](https://www.realitydefender.com/insights/which-companies-must-comply-with-the-eu-ai-acts-deepfake-requirements)
- [ffmpeg.wasm Multi-threading](https://deepwiki.com/ffmpegwasm/ffmpeg.wasm/4.4-multi-threading)
- [Transformers.js v4 WebGPU](https://blog.worldline.tech/2026/01/13/transformersjs-intro.html)
- [Valin W3C RNNoise-in-Browser (2020)](https://www.w3.org/2020/Talks/mlws/jmv_rnnoise.pdf)

---

**Recherche-Dauer:** 240s · **Tool-Uses:** 30
