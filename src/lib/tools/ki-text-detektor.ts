/**
 * KI Text Detector module.
 * Uses Transformers.js with Xenova/roberta-base-openai-detector.
 */
import { pipeline, env } from '@huggingface/transformers';
import { applyOrtSelfHost } from './ml-mirror';

let envConfigured = false;

export interface ProgressEvent {
  loaded: number;
  total: number;
}

export interface KiTextResult {
  label: string; // usually 'Real' or 'Fake'
  score: number; // 0.0 - 1.0
}

type Pipe = (input: string) => Promise<Array<KiTextResult>>;

let pipelinePromise: Promise<Pipe> | null = null;
let pipelineReady = false;

export function isPrepared(): boolean {
  return pipelineReady;
}

export async function prepareModel(onProgress: (e: ProgressEvent) => void): Promise<void> {
  if (pipelinePromise) {
    await pipelinePromise;
    return;
  }

  if (!envConfigured) {
    applyOrtSelfHost(env as unknown as Parameters<typeof applyOrtSelfHost>[0]);
    envConfigured = true;
  }

  // Without an explicit `dtype` Transformers.js loads the default ONNX file
  // for the repo, which is FP32 = 499 MB for tmr-ai-text-detector-ONNX.
  // Q4F16 is 128 MB — still meaningful on mobile but fits within iOS-Safari
  // memory limits. Audit: inbox/to-claude/2026-04-28-mobile-ml-tools-audit.md §5.5
  pipelinePromise = new Promise<Pipe>((resolve, reject) => {
    pipeline(
      'text-classification',
      'onnx-community/tmr-ai-text-detector-ONNX',
      {
        progress_callback: onProgress as unknown as (info: unknown) => void,
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

export async function analyzeText(text: string): Promise<KiTextResult[]> {
  if (!pipelinePromise) throw new Error("Pipeline not prepared");
  const pipe = await pipelinePromise;
  // RoBERTa models usually take max 512 tokens. 
  // We truncate the input text to prevent overflow.
  const truncatedText = text.slice(0, 2000); 
  return await pipe(truncatedText);
}
