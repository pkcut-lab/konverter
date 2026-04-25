/**
 * Audio Transkription module.
 * Uses Transformers.js with Whisper models.
 */
import { pipeline } from '@huggingface/transformers';

export type ModelSize = 'tiny' | 'base' | 'small';


export interface ProgressEvent {
  status: string;
  name: string;
  file: string;
  progress: number;
  loaded: number;
  total: number;
}

export interface TranscriptionResult {
  text: string;
  chunks?: Array<{
    text: string;
    timestamp: [number, number];
  }>;
}

let pipelinePromise: Promise<any> | null = null;
let pipelineReady = false;
let currentModelSize: ModelSize | null = null;

export function isPrepared(): boolean {
  return pipelineReady;
}

export async function prepareModel(modelSize: ModelSize, onProgress: (e: any) => void): Promise<void> {
  if (pipelinePromise && currentModelSize === modelSize) {
    await pipelinePromise;
    return;
  }
  
  pipelineReady = false;
  currentModelSize = modelSize;
  
  let modelId = 'Xenova/whisper-base';
  if (modelSize === 'tiny') modelId = 'Xenova/whisper-tiny';
  if (modelSize === 'small') modelId = 'Xenova/whisper-small';

  // Using fp32 to bypass the DequantizeLinear ONNX bug present in WebAssembly for quantized models
  pipelinePromise = pipeline(
    'automatic-speech-recognition',
    modelId,
    {
      progress_callback: onProgress,
      device: 'wasm',
      dtype: 'fp32'
    }
  );
  
  try {
    await pipelinePromise;
    pipelineReady = true;
  } catch (err) {
    pipelinePromise = null;
    pipelineReady = false;
    currentModelSize = null;
    throw err;
  }
}

/**
 * Transcribes audio.
 * @param audio The audio data (URL, Blob, or Float32Array)
 * @param options Transcription options (language, task, etc.)
 */
export async function transcribe(audio: any, options: any = {}): Promise<TranscriptionResult> {
  if (!pipelinePromise) throw new Error("Pipeline not prepared");
  const pipe = await pipelinePromise;
  
  return await pipe(audio, {
    chunk_length_s: 30,
    stride_length_s: 5,
    return_timestamps: true, // Prevents repetitive hallucination loops
    task: 'transcribe',
    ...options
  });
}
