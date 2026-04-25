/**
 * KI Bild Detector module.
 * Uses Transformers.js with onnx-community/SMOGY-Ai-images-detector-ONNX.
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
      'onnx-community/SMOGY-Ai-images-detector-ONNX',
      {
        progress_callback: onProgress,
        device: 'wasm',
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
