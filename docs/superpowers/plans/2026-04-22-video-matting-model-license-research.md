---
title: Video-Matting Model License + Quality Deep-Research
tool_slug: video-hintergrund-entfernen
enum: video
tier: 8f
status: research-complete (2026-04-22) — architecture unblocked
researcher: Agent (subagent ab44ae8fb66ba2aae)
duration_ms: 211781
related: 2026-04-21-video-bg-remover-differenzierungs-check.md
decision: BiRefNet_lite primary + BEN2 fallback + MODNet speed-toggle
---

# Video-Matting Model License + Quality Research

**Kontext.** Nach Runde-1-Research war RVM (GPL-3.0) als KO-Kriterium bestätigt. Diese Runde musste (a) BiRefNet-Weights-Lizenz verifizieren, (b) permissive-lizenzierte Alternativen durchkämmen, (c) Browser-Ready-Beweis finden.

## §1 BiRefNet-Lizenz-Urteil: ✓ USABLE (lückenlos MIT)

**Code:** `ZhengPeng7/BiRefNet/LICENSE` = MIT (Copyright 2024 ZhengPeng). Grants „rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies" ohne Commercial-Restriction.

**Weights (Hugging Face Model-Cards, wörtlich verifiziert):**
- `huggingface.co/ZhengPeng7/BiRefNet` → `license: mit`
- `huggingface.co/ZhengPeng7/BiRefNet_HR` → MIT
- `huggingface.co/ZhengPeng7/BiRefNet_lite` → MIT
- `huggingface.co/onnx-community/BiRefNet_lite-ONNX` → **MIT** (ONNX-Mirror, production-ready)

**Training-Daten:** DIS5K (MIT), DUTS, HRSOD, UHRSD, HRS10K — keine viralen/NC-Lizenzen sickern durch.

**Warnung:** Third-Party-Forks (z.B. `aigchacker/*`) können DIS-Task-Only-NC-Restriktionen tragen → **nur offizielle `ZhengPeng7/*` und `onnx-community/BiRefNet_lite-ONNX` nutzen.**

**Urteil:** AdSense-commercial + Closed-Source-JS-Bundle = **green-lit**, keine Ambiguität.

## §2 Alternativ-Tabelle

| Modell | Code-Lizenz | Weights | Qualität (Haar/Fell) | Browser-Ready | Empfehlung |
|---|---|---|---|---|---|
| **BiRefNet** (ZhengPeng7) | MIT | MIT | SOTA Haar-Matting (ACCV 2024 / CAAI AIR'24) | ✓ ONNX + transformers.js v3 | ✓ **Primary** |
| **BEN2 Base** (PramaLLC) | MIT | MIT | Eigenwerbung „superior hair matting, 4K", native Video-API, Confidence-Guided-Refiner | ✓ ONNX auf HF, onnxruntime-web kompatibel | ✓ **Fallback** |
| **MODNet** (ZHKKKe) | Apache-2.0 | Apache-2.0 | Gut für Portrait, schwächer Haar | ✓ `Xenova/modnet` + WebGPU-Demo | ✓ **Speed-Toggle** |
| **U²-Net** (xuebinqin) | Apache-2.0 | Apache-2.0 | Älter 2020, schwächer vs. BiRefNet | ✓ rembg default | ⚠ Legacy |
| **IS-Net / DIS** (xuebinqin) | Apache-2.0 | Apache-2.0 | Gut, Vorgänger BiRefNet | ✓ ONNX | ⚠ BiRefNet direkt besser |
| **InSPyReNet** (plemeri) | MIT | MIT | Sehr gut, ACCV 2022 | ⚠ Kein offizieller Browser-Port | ⚠ Kein Ecosystem-Rückenwind |
| **TRACER** (Karel911) | MIT | MIT | Salient-Object | ⚠ Kein Browser-Port | ⚠ Nische |
| **PP-HumanSegV2** (PaddleSeg) | Apache-2.0 | Apache-2.0 | Nur Person-Silhouette | ⚠ Paddle→ONNX, kein Ecosystem | ⚠ Nische |
| **BackgroundMattingV2** (PeterL1n) | MIT | MIT | Gut, braucht Referenz-BG-Frame | ⚠ UX-ungeeignet | ⚠ UX-Blocker |
| **MediaPipe Selfie Segmentation** | Apache-2.0 | Apache-2.0 | Schwach bei Haar (binary mask) | ✓ Native WASM | ⚠ Zu grob |
| **Sapiens** (Meta) | **CC-BY-NC 4.0** | CC-BY-NC 4.0 | SOTA Human-Tasks | — | ✗ **KO: NC** |
| **SAM 2 / 2.1** | Apache-2.0 | Apache-2.0 | Braucht Prompts | ✓ webgpu-sam2 | ⚠ Falsches Tool (interactive) |
| **SAM 3** (Meta, Nov 2025) | **Custom „SAM License"** | Custom | Beste Concept-Seg | ✓ sam3.ai | ⚠ **Redistributions-Pflicht, copyleft-ähnlich** — flag, nicht empfohlen |
| **RMBG-2.0** (BRIA) | **CC-BY-NC 4.0** | CC-BY-NC 4.0 | SOTA | ✓ ONNX | ✗ **KO: NC** (Commercial nur via kostenpflichtigem BRIA-Vertrag) |
| **RMBG-1.4** (BRIA) | **CC-BY-NC 4.0** | CC-BY-NC 4.0 | Gut | ✓ Xenova-Demo (ToS-grau) | ✗ **KO** |
| **RVM** (PeterL1n) | GPL-3.0 | GPL-3.0 | SOTA Video | ✓ | ✗ **KO** |
| **MatAnyone 2** | NTU S-Lab 1.0 | NTU S-Lab 1.0 | SOTA 2025/26 | — | ✗ **KO: NC** |
| **@imgly/background-removal** | **AGPL-3.0** | AGPL-3.0 | Gut (ISNet-basiert) | ✓ npm | ✗ **KO: AGPL viral** — Commercial nur via img.ly-Vertrag |

## §3 Browser-Demo-Belege

- **Xenova/remove-background-webgpu** (HF Space) — 100% client-side, transformers.js v3 + WebGPU, MODNet/RMBG-1.4 Variante (RMBG = ToS-grau, MODNet-Variante sauber Apache-2.0).
- **addyosmani/bg-remove** — Transformers.js + WebGPU, model-agnostic.
- **lucasgelfond/webgpu-sam2** — Beweis dass mehrstufige ONNX-Pipelines in WebGPU performant laufen.
- **img.ly Blog „20× Faster Browser BG Removal with ONNX + WebGPU"** (2024) — ONNX-Runtime-Web + WebGPU-EP ~20× über Multi-thread-CPU, ~550× über Single-thread. RMBG-1.4 @ 1024px: ~300-800 ms/Frame auf M-Series/RTX. **Nicht real-time 30 fps**, aber für Offline-Video-Export akzeptabel.
- **PramaLLC/BEN2** — ONNX-Weights + standard Encoder-Decoder-Architektur, portierbar (kein offizieller Browser-Demo, aber technisch kein Blocker).
- **wesbos/bg-remove, ryoid/web-removebg, Remove-Background-ai/rembg-webgpu** — production-ready transformers.js+WebGPU-Repos.

**Stand April 2026:** WebCodecs + onnxruntime-web (WebGPU-EP) + Frame-für-Frame ONNX-Inference + Mediabunny-Encoder ist das belastbare Pattern. Keine bekannte Open-Source-Repo liefert das end-to-end für BiRefNet/BEN2 — **das ist unser Differenzierungs-Raum.**

## §4 FINAL RECOMMENDATION

### Primary: **BiRefNet_lite** (`onnx-community/BiRefNet_lite-ONNX`)
- MIT Code + MIT Weights + MIT Training-Data (DIS5K) — lückenlos permissiv
- SOTA Haar/Fell-Qualität (ACCV 2024), `_lite` ~50 MB ONNX browser-deployment-realistisch
- Transformers.js v3 + WebGPU dokumentiert, ONNX-Community-Mirror production-ready
- Einschränkung: Image-Modell → Frame-Loop, kein Temporal-Memory wie RVM → Edge-Smoothing-Post-Filter gegen Flicker (Exponential Moving Average der Alpha-Masken über 3-5 Frames)

### Fallback: **BEN2 Base** (`PramaLLC/BEN2`)
- MIT Code + MIT Weights — ebenso sauber
- Explizit mit **Video-API** designed (`segment_video()`), eigenwerblich „superior hair matting, 4K, edge refinement"
- Confidence-Guided-Matting-Refiner adressiert Kanten-Schwächen von Single-Pass-Modellen
- Plan B wenn BiRefNet-Flicker in User-Feedback auftaucht
- Flag: PramaLLC bewirbt kostenpflichtiges „Full Model" — **Base-Variante explizit „fine for commercial use"**, kein Bait-and-Switch

### Speed-Toggle: **MODNet** (`Xenova/modnet` / ZHKKKe Original)
- Apache-2.0 Code + Weights
- Einzige Option mit **bewiesener real-time WebGPU-Performance** in produktiven Demos
- ~25 MB, deutlich schneller als BiRefNet
- Portrait-optimiert → User-Wahl „Schnell für Personen" vs „Langsam für alles" positionierbar

## §5 Quellen

**BiRefNet:** [GH LICENSE MIT](https://github.com/ZhengPeng7/BiRefNet/blob/main/LICENSE) · [HF Model Card](https://huggingface.co/ZhengPeng7/BiRefNet) · [HF _HR](https://huggingface.co/ZhengPeng7/BiRefNet_HR) · [HF _lite](https://huggingface.co/ZhengPeng7/BiRefNet_lite) · [HF onnx-community _lite-ONNX](https://huggingface.co/onnx-community/BiRefNet_lite-ONNX) · [arXiv 2401.03407](https://arxiv.org/html/2401.03407v5)

**BEN2:** [GH LICENSE MIT](https://github.com/PramaLLC/BEN2/blob/main/LICENSE) · [HF Model Card](https://huggingface.co/PramaLLC/BEN2)

**MODNet:** [GH LICENSE Apache-2.0](https://github.com/ZHKKKe/MODNet/blob/master/LICENSE) · [HF Xenova/modnet](https://huggingface.co/Xenova/modnet)

**Negative (KO dokumentiert):** [imgly AGPL](https://github.com/imgly/background-removal-js/blob/main/LICENSE.md) · [BRIA RMBG-2.0 NC](https://huggingface.co/briaai/RMBG-2.0) · [SAM 3 Custom](https://github.com/facebookresearch/sam3/blob/main/LICENSE) · [Sapiens NC](https://huggingface.co/facebook/sapiens) · [MatAnyone2 NTU](https://github.com/pq-yang/MatAnyone2)

**Positiv (nicht gewählt aber kein Blocker):** [InSPyReNet MIT](https://github.com/plemeri/transparent-background/blob/main/LICENSE) · [TRACER MIT](https://github.com/Karel911/TRACER) · [U²-Net Apache](https://github.com/xuebinqin/U-2-Net/blob/master/LICENSE) · [DIS Apache](https://github.com/xuebinqin/DIS/blob/main/LICENSE.md) · [PaddleSeg Apache](https://github.com/PaddlePaddle/PaddleSeg/blob/develop/LICENSE) · [BGMv2 MIT](https://github.com/PeterL1n/BackgroundMattingV2/blob/master/LICENSE) · [SAM 2 Apache](https://github.com/facebookresearch/sam2/blob/main/LICENSE)

**Browser-Demos:** [img.ly ONNX+WebGPU Blog](https://img.ly/blog/browser-background-removal-using-onnx-runtime-webgpu/) · [Xenova HF Space](https://huggingface.co/spaces/Xenova/remove-background-webgpu) · [webgpu-sam2](https://github.com/lucasgelfond/webgpu-sam2) · [addyosmani/bg-remove](https://github.com/addyosmani/bg-remove) · [Remove-Background-ai/rembg-webgpu](https://github.com/Remove-Background-ai/rembg-webgpu) · [Transformers.js v3 Blog](https://huggingface.co/blog/transformersjs-v3)

---

**Recherche-Dauer:** 212s · **Tool-Uses:** 36
