/**
 * Variant-Map for mobile-aware ML-tools.
 *
 * Each ML tool that supports model-switching declares its variants here:
 * `fast` (Mobile-default), `quality` (Desktop-default), `pro` (opt-in maximum).
 * `FileTool.svelte` reads `runtime.variants` to render the variant-switcher
 * banner; `tool-runtime-registry.ts` reads it to dispatch the correct model
 * load on `prepare()`.
 *
 * **Sizes are verified against the upstream Hugging Face repo.** When you
 * add a variant, open the HF Files-tab and copy the actual ONNX file size —
 * do not estimate. A wrong size in the banner is a trust-breaker.
 *
 * **License gate:** every variant must have an AdSense-compatible license
 * (MIT / Apache-2.0 / BSD / CC-BY). AGPL, CC-BY-NC, custom-non-commercial
 * are KOs. The `license` field is the source-of-truth — if you cannot
 * find the license on the model card, do not add the variant.
 */

import type { DeviceClass, DeviceProbe } from './ml-device-detect';

export type VariantId = 'fast' | 'quality' | 'pro';

export interface MlVariant {
  /** Stable id used in URLs / config. */
  id: VariantId;
  /** Hugging Face repo id, e.g. `Xenova/modnet`. */
  modelId: string;
  /**
   * Optional dtype for Transformers.js v4. Common values:
   * - `fp32` — full precision (largest, most accurate, mobile-incompatible >100 MB)
   * - `fp16` — half precision
   * - `q8` / `int8` / `uint8` — 8-bit quantized
   * - `q4` — 4-bit quantized (default Q4F16 mapping in Transformers.js)
   * - `q4f16` — 4-bit weights + FP16 activations (immune to WebGPU-int8 issue #1512)
   * - `bnb4` — bitsandbytes 4-bit
   */
  dtype?: 'fp32' | 'fp16' | 'q8' | 'int8' | 'uint8' | 'q4' | 'q4f16' | 'bnb4';
  /** Total bytes downloaded on first run. Verified against HF Files-tab. */
  sizeBytes: number;
  /** SPDX license string. AGPL / non-commercial KO. */
  license: 'MIT' | 'Apache-2.0' | 'BSD-3-Clause' | 'CC-BY-4.0';
  /** Which device classes are allowed to auto-pick this variant. */
  allowedFor: DeviceClass[];
}

/**
 * Variant-Map per tool-id. A tool without an entry here is **not**
 * mobile-aware — it works the same on all devices (e.g. `speech-enhancer`
 * with a 10 MB DeepFilterNet3 doesn't benefit from a switch).
 *
 * Source-of-truth for sizes: `inbox/to-claude/2026-04-28-mobile-ml-bg-removal-research.md`
 * §1 (Modell-Matrix), verified 2026-04-28 against the HF repos.
 */
export const ML_VARIANTS: Record<string, MlVariant[]> = {
  'remove-background': [
    {
      id: 'fast',
      modelId: 'Xenova/modnet',
      dtype: 'q8',
      sizeBytes: 6_630_000, // model_quantized.onnx 6.63 MB
      license: 'Apache-2.0',
      allowedFor: ['fast-mobile', 'capable-mobile', 'desktop'],
    },
    {
      id: 'quality',
      modelId: 'onnx-community/BiRefNet_lite-ONNX',
      dtype: 'fp16',
      sizeBytes: 115_000_000, // model_fp16.onnx 115 MB
      license: 'MIT',
      allowedFor: ['capable-mobile', 'desktop'],
    },
    {
      id: 'pro',
      modelId: 'onnx-community/BEN2-ONNX',
      dtype: 'fp16',
      sizeBytes: 219_000_000, // model_fp16.onnx 219 MB — ONLY desktop, opt-in
      license: 'MIT',
      allowedFor: ['desktop'],
    },
  ],

  // video-bg-remove: existing worker maps modelKey 'speed' → MODNet, 'quality' →
  // BiRefNet_lite. We expose the same two as 'fast' / 'quality' here so the UI
  // banner can show transparent sizes; the runtime translates back to modelKey.
  // Note: WebCodecs-VideoEncoder requires iOS 26+ — preflightCheck blocks older.
  'video-bg-remove': [
    {
      id: 'fast',
      modelId: 'Xenova/modnet',
      dtype: 'q8',
      sizeBytes: 6_630_000,
      license: 'Apache-2.0',
      allowedFor: ['fast-mobile', 'capable-mobile', 'desktop'],
    },
    {
      id: 'quality',
      modelId: 'onnx-community/BiRefNet_lite-ONNX',
      dtype: 'fp16',
      sizeBytes: 115_000_000,
      license: 'MIT',
      allowedFor: ['capable-mobile', 'desktop'],
    },
  ],

  // audio-transkription: Whisper Q4F16 (CRITICAL — current FP32 default loads
  // 152/291/968 MB which crashes iOS Safari). Q4F16 is immune to the closed
  // Issue #1512 (which only affected WebGPU+Int8). Tiny is mobile-default,
  // base is the standard quality, small is desktop-only opt-in.
  'audio-transkription': [
    {
      id: 'fast',
      modelId: 'Xenova/whisper-tiny',
      dtype: 'q4f16',
      sizeBytes: 52_000_000, // encoder 6.3 + decoder_merged 46 = ~52 MB Q4F16
      license: 'MIT',
      allowedFor: ['fast-mobile', 'capable-mobile', 'desktop'],
    },
    {
      id: 'quality',
      modelId: 'Xenova/whisper-base',
      dtype: 'q4f16',
      sizeBytes: 83_000_000, // encoder 14.1 + decoder_merged 68.6 = ~83 MB Q4F16
      license: 'MIT',
      allowedFor: ['capable-mobile', 'desktop'],
    },
    {
      id: 'pro',
      modelId: 'Xenova/whisper-small',
      dtype: 'q4f16',
      sizeBytes: 200_000_000, // encoder 54.4 + decoder_merged 146 = ~200 MB Q4F16
      license: 'MIT',
      allowedFor: ['desktop'],
    },
  ],

  // image-to-text (Tesseract.js): different runtime (not Transformers.js),
  // but the size disclosure pattern still applies. We declare two variants:
  // single-language (mobile, ~17-22 MB depending on choice) and DE+EN
  // (~39 MB total). The runtime maps the variant id to a Tesseract lang string.
  'image-to-text': [
    {
      id: 'fast',
      modelId: 'tesseract.js:single-lang',
      sizeBytes: 22_000_000, // ~22 MB EN OR ~17 MB DE
      license: 'Apache-2.0',
      allowedFor: ['fast-mobile', 'capable-mobile', 'desktop'],
    },
    {
      id: 'quality',
      modelId: 'tesseract.js:deu+eng',
      sizeBytes: 39_000_000, // ~17 MB DE + ~22 MB EN
      license: 'Apache-2.0',
      allowedFor: ['capable-mobile', 'desktop'],
    },
  ],

  // speech-enhancer: single model. DeepFilterNet3 ONNX is ~10 MB, well under
  // any mobile memory limit — no need for a switch, but the banner-disclosure
  // pattern still benefits the user.
  'speech-enhancer': [
    {
      id: 'fast',
      modelId: 'grazder/DeepFilterNet3',
      sizeBytes: 10_000_000,
      license: 'MIT',
      allowedFor: ['fast-mobile', 'capable-mobile', 'desktop'],
    },
  ],

  // ki-text-detektor: TMR (Target Mining RoBERTa) base 125M. FP32 is 499 MB
  // (current default, mobile-crash); Q4F16 is 128 MB. Single Q4F16 variant —
  // even on desktop the FP32 is wasted bandwidth.
  'ki-text-detektor': [
    {
      id: 'quality',
      modelId: 'onnx-community/tmr-ai-text-detector-ONNX',
      dtype: 'q4f16',
      sizeBytes: 128_000_000,
      license: 'MIT',
      allowedFor: ['capable-mobile', 'desktop'],
    },
  ],

  // ki-bild-detektor: SMOGY is CC-BY-NC-4.0 (AdSense-incompatible). Migration
  // target: Deep-Fake-Detector-v2 (Apache-2.0, ViT-base, Q4F16 49.7 MB).
  // Q4F16 fits easily on mobile; desktop opt-in for higher quality not needed
  // because the accuracy gap between Q4F16 and FP16 is small for ViT.
  'ki-bild-detektor': [
    {
      id: 'fast',
      modelId: 'onnx-community/Deep-Fake-Detector-v2-Model-ONNX',
      dtype: 'q4f16',
      sizeBytes: 49_700_000,
      license: 'Apache-2.0',
      allowedFor: ['fast-mobile', 'capable-mobile', 'desktop'],
    },
  ],
};

/**
 * Pick the default variant for a device probe. Returns the first variant
 * whose `allowedFor` matches the probe's class — variants are declared in
 * preference order (fast → quality → pro), so on a low-end mobile the
 * first match is always `fast`.
 *
 * Throws if no variant matches (mis-configured tool — every tool should
 * have at least one variant valid for every device class).
 */
export function pickDefaultVariant(
  toolId: string,
  probe: DeviceProbe,
): VariantId {
  const variants = ML_VARIANTS[toolId];
  if (!variants || variants.length === 0) {
    throw new Error(`No variants registered for tool "${toolId}"`);
  }

  // For mobile classes prefer the smallest variant.
  if (probe.class === 'fast-mobile' || probe.class === 'capable-mobile') {
    const mobileFirst = variants.find((v) => v.allowedFor.includes(probe.class));
    if (mobileFirst) return mobileFirst.id;
  }

  // For desktop prefer `quality` (middle option) — `pro` requires explicit opt-in.
  const quality = variants.find((v) => v.id === 'quality' && v.allowedFor.includes(probe.class));
  if (quality) return quality.id;

  // Fallback: any allowed variant.
  const any = variants.find((v) => v.allowedFor.includes(probe.class));
  if (any) return any.id;

  throw new Error(
    `No variant of "${toolId}" is allowed for device class "${probe.class}"`,
  );
}

/** Look up a specific variant. Returns `undefined` if not registered. */
export function getVariant(toolId: string, variantId: VariantId): MlVariant | undefined {
  return ML_VARIANTS[toolId]?.find((v) => v.id === variantId);
}

/**
 * Format `sizeBytes` for display. "6.6 MB" / "115 MB" / "1.2 GB". Uses
 * U+00A0 NO-BREAK SPACE between number and unit per project typography
 * convention (matches FileTool `formatBytes`).
 */
export function formatVariantSize(sizeBytes: number): string {
  const mb = sizeBytes / 1_000_000;
  if (mb < 1) return `${(sizeBytes / 1024).toFixed(0)} KB`;
  if (mb < 100) return `${mb.toFixed(1)} MB`;
  if (mb < 1000) return `${Math.round(mb)} MB`;
  return `${(mb / 1000).toFixed(1)} GB`;
}
