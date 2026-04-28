/**
 * KI Bild Detector module.
 *
 * Migrated 2026-04-28 from `onnx-community/SMOGY-Ai-images-detector-ONNX`
 * (CC-BY-NC-4.0 — incompatible with AdSense Phase 2) to
 * `onnx-community/Deep-Fake-Detector-v2-Model-ONNX` (Apache-2.0,
 * ViT-base, Q4F16 49.7 MB).
 *
 * The new model is trained on a curated 56k face-manipulation dataset
 * (28k real + 28k fake) and reports 92.12 % accuracy / F1 0.9249. Use-case
 * coverage shifts slightly: SMOGY was tuned for AI-art detection
 * (SDXL/Midjourney style transfer), Deep-Fake-Detector-v2 is tuned for
 * realism manipulation including faces and synthetic photos. Both are
 * acceptable as "AI-image-detector" — surface UI label as such.
 *
 * Audit: inbox/to-claude/2026-04-28-mobile-ml-tools-audit.md §6.5
 */
import { pipeline, type RawImage } from '@huggingface/transformers';

export interface ProgressEvent {
  status: string;
  name: string;
  file: string;
  progress: number;
  loaded: number;
  total: number;
}

export interface KiImageResult {
  label: string; 
  score: number; 
}

type Pipe = (image: string | URL | RawImage | Uint8Array) => Promise<Array<KiImageResult>>;

let pipelinePromise: Promise<Pipe> | null = null;
let pipelineReady = false;

export function isPrepared(): boolean {
  return pipelineReady;
}

export async function prepareModel(onProgress: (e: any) => void): Promise<void> {
  if (pipelinePromise) {
    await pipelinePromise;
    return;
  }
  
  pipelinePromise = new Promise<Pipe>((resolve, reject) => {
    pipeline(
      'image-classification',
      'onnx-community/Deep-Fake-Detector-v2-Model-ONNX',
      {
        progress_callback: onProgress,
        device: 'wasm',
        dtype: 'q4f16',
      }
    ).then(pipe => resolve(pipe as unknown as Pipe)).catch(reject);
  });
  
  try {
    await pipelinePromise;
    pipelineReady = true;
  } catch (err) {
    pipelinePromise = null;
    pipelineReady = false;
    throw err;
  }
}

export async function analyzeImage(input: string | URL | RawImage | Uint8Array): Promise<KiImageResult[]> {
  if (!pipelinePromise) throw new Error("Pipeline not prepared");
  const pipe = await pipelinePromise;
  return await pipe(input);
}
