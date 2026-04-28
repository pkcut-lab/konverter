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
  /** Optional dtype for Transformers.js v4 — e.g. `q8`, `fp16`, `fp32`. */
  dtype?: 'fp32' | 'fp16' | 'q8' | 'q4';
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
