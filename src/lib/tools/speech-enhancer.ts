/**
 * Speech Enhancement pure module — DeepFilterNet3 ONNX.
 *
 * Uses DeepFilterNet3 (MIT OR Apache-2.0) for broadband speech denoising and
 * dereverberation. The ONNX model operates at 48 kHz on mono audio.
 *
 * 7a-Exception: ML model download from HuggingFace is an approved network
 * dependency for ML-file-tools (CLAUDE.md §18 Non-Negotiable #7a).
 *
 * D2 (EU-AI-Act Art. 50): Output WAV carries an INFO/SOFTWARE metadata tag
 * (`kittokit.de AI-processed`) written into the WAV LIST-INFO chunk.
 *
 * Lazy-loaded via tool-runtime-registry.ts — static imports from onnxruntime-web
 * are safe here because the whole module is behind a dynamic-import thunk in the
 * registry and never ships to pages that do not use this tool.
 *
 * TODO (model verification needed before ship):
 *   The ONNX input/output tensor names and shapes below are based on community
 *   SpeechDenoiser ports (github.com/yuyun2000/SpeechDenoiser). Validate against
 *   the actual downloaded model via `Object.keys(session.inputNames)` before
 *   claiming correct inference.
 */

import * as ort from 'onnxruntime-web';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Primary quality model — DeepFilterNet3, ~10 MB ONNX, MIT/Apache-2.0.
 * Community ONNX export via grazder/DeepFilterNet3 (HuggingFace).
 */
const DFN3_MODEL_URL =
  'https://huggingface.co/grazder/DeepFilterNet3/resolve/main/DeepFilterNet3.onnx';

/** Target sample rate (full-band, DFN3 specification). */
const SAMPLE_RATE = 48_000;

/** Frame size: 20 ms at 48 kHz. Each ONNX inference call processes one frame. */
const FRAME_SAMPLES = 960;

/** Hop size: 10 ms at 48 kHz (50 % overlap for smooth reconstruction). */
const HOP_SAMPLES = 480;

// ---------------------------------------------------------------------------
// Module-level singletons (live for the browser session lifetime)
// ---------------------------------------------------------------------------

let sessionPromise: Promise<ort.InferenceSession> | null = null;
let session: ort.InferenceSession | null = null;
let sessionReady = false;

// ---------------------------------------------------------------------------
// Public types  (mirror remove-background.ts for FileTool compatibility)
// ---------------------------------------------------------------------------

export interface ProgressEvent {
  loaded: number;
  total: number;
}

export interface PrepareOpts {
  /**
   * Watchdog timeout in ms. Stall fires if no progress event arrives within
   * this window. Defaults to 120 000.
   */
  stallTimeoutMs?: number;
}

export class StallError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StallError';
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function isPrepared(): boolean {
  return sessionReady;
}

/**
 * Download and initialise the DeepFilterNet3 ONNX model.
 * Subsequent calls are no-ops if the model is already loaded.
 */
export async function prepareSpeechEnhancementModel(
  onProgress: (e: ProgressEvent) => void,
  opts: PrepareOpts = {},
): Promise<void> {
  if (sessionReady) return;
  if (sessionPromise) {
    await sessionPromise;
    return;
  }

  const stallTimeoutMs = opts.stallTimeoutMs ?? 120_000;
  let watchdog: ReturnType<typeof setTimeout> | null = null;
  let stallReject: ((err: Error) => void) | null = null;
  let settled = false;

  const fireStall = () => {
    if (settled) return;
    settled = true;
    stallReject?.(
      new StallError(`Model download stalled — no progress for ${stallTimeoutMs} ms.`),
    );
  };

  const resetWatchdog = () => {
    if (watchdog) clearTimeout(watchdog);
    watchdog = setTimeout(fireStall, stallTimeoutMs);
  };

  resetWatchdog();

  sessionPromise = new Promise<ort.InferenceSession>((resolve, reject) => {
    stallReject = (err) => {
      if (watchdog) clearTimeout(watchdog);
      reject(err);
    };

    (async () => {
      // Configure ort WASM backend — use CDN until self-hosted (7a exception).
      ort.env.wasm.wasmPaths =
        'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.18.0/dist/';

      // Stream-download with progress tracking.
      const response = await fetch(DFN3_MODEL_URL);
      if (!response.ok) {
        throw new Error(`Model download failed: HTTP ${response.status}`);
      }

      const contentLength = parseInt(response.headers.get('content-length') ?? '0', 10);
      const reader = response.body?.getReader();
      if (!reader) throw new Error('ReadableStream unavailable — browser too old?');

      const chunks: Uint8Array[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        resetWatchdog();
        onProgress({ loaded, total: contentLength });
      }

      const modelBuffer = mergeChunks(chunks, loaded);

      const newSession = await ort.InferenceSession.create(modelBuffer, {
        executionProviders: ['webgpu', 'wasm'],
      });

      if (!settled) {
        settled = true;
        if (watchdog) clearTimeout(watchdog);
        resolve(newSession);
      }
    })().catch((err: unknown) => {
      if (!settled) {
        settled = true;
        if (watchdog) clearTimeout(watchdog);
        reject(err);
      }
    });
  });

  // Suppress transient unhandled-rejection in test environments (same pattern
  // as remove-background.ts).
  sessionPromise.catch(() => { /* re-thrown in the awaiter below */ });

  try {
    session = await sessionPromise;
    sessionReady = true;
  } catch (err) {
    sessionPromise = null;
    session = null;
    sessionReady = false;
    throw err;
  }
}

/**
 * Enhance speech in an audio file.
 *
 * @param input   Raw bytes of the audio file (WAV / MP3 / OGG / AAC / FLAC /
 *                WebM Opus). Validated via `AudioContext.decodeAudioData`.
 * @param opts    `attenLimDb` maps the UI Strength-slider to DeepFilterNet3's
 *                `atten_lim_db` parameter:
 *                  0 dB = bypass (pass-through, no model call)
 *                  20 dB = dezent (default)
 *                  40 dB = mittel
 *                  100 dB = maximal
 */
export async function enhanceSpeech(
  input: Uint8Array,
  opts: { attenLimDb: number },
): Promise<Uint8Array> {
  // ------------------------------------------------------------------ decode
  const { samples: rawSamples, sampleRate: srcRate } = await decodeAudio(input);

  // ---------------------------------------------------------------- resample
  const samples48k =
    srcRate === SAMPLE_RATE
      ? rawSamples
      : await resampleAudio(rawSamples, srcRate, SAMPLE_RATE);

  // ------------------------------------------------------------------ bypass
  if (opts.attenLimDb === 0) {
    return encodeWav(samples48k, SAMPLE_RATE);
  }

  // ----------------------------------------------------------- guard: model
  if (!session) {
    throw new Error(
      'DeepFilterNet3 model not loaded — call prepareSpeechEnhancementModel() first.',
    );
  }

  // ----------------------------------------------------------- ort inference
  const enhanced = await runDeepFilter(session, samples48k, opts.attenLimDb);

  // ----------------------------------------------------------------- encode
  return encodeWav(enhanced, SAMPLE_RATE);
}

/** No persistent result cache for audio (stream-processed). No-op, kept for
 *  FileTool interface symmetry with remove-background. */
export function clearLastResult(): void {
  // intentional no-op
}

// ---------------------------------------------------------------------------
// Internal — audio decode / resample
// ---------------------------------------------------------------------------

async function decodeAudio(
  input: Uint8Array,
): Promise<{ samples: Float32Array; sampleRate: number }> {
  // Copy into a plain ArrayBuffer (required by decodeAudioData).
  const buffer = input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);

  // AudioContext accepts any format the browser supports: WAV, MP3, OGG, AAC,
  // FLAC, WebM Opus.
  const ctx = new AudioContext();
  try {
    const audioBuffer = await ctx.decodeAudioData(buffer as ArrayBuffer);
    // Downmix to mono by averaging all channels.
    const mono = downmixToMono(audioBuffer);
    return { samples: mono, sampleRate: audioBuffer.sampleRate };
  } catch (err) {
    throw new Error(
      `Audio-Dekodierung fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`,
    );
  } finally {
    await ctx.close().catch(() => { /* ignore */ });
  }
}

function downmixToMono(audioBuffer: AudioBuffer): Float32Array {
  const { numberOfChannels, length } = audioBuffer;
  if (numberOfChannels === 1) {
    return audioBuffer.getChannelData(0).slice();
  }
  const mono = new Float32Array(length);
  for (let c = 0; c < numberOfChannels; c++) {
    const ch = audioBuffer.getChannelData(c);
    for (let i = 0; i < length; i++) {
      mono[i] = (mono[i] ?? 0) + (ch[i] ?? 0) / numberOfChannels;
    }
  }
  return mono;
}

async function resampleAudio(
  samples: Float32Array,
  fromRate: number,
  toRate: number,
): Promise<Float32Array> {
  const duration = samples.length / fromRate;
  const outLength = Math.ceil(duration * toRate);

  const offCtx = new OfflineAudioContext(1, outLength, toRate);
  const srcBuffer = offCtx.createBuffer(1, samples.length, fromRate);
  srcBuffer.copyToChannel(samples, 0);

  const src = offCtx.createBufferSource();
  src.buffer = srcBuffer;
  src.connect(offCtx.destination);
  src.start(0);

  const rendered = await offCtx.startRendering();
  return rendered.getChannelData(0).slice();
}

// ---------------------------------------------------------------------------
// Internal — DeepFilterNet3 ONNX inference
// ---------------------------------------------------------------------------

/**
 * Run DeepFilterNet3 on a mono 48 kHz Float32Array.
 *
 * Frame-by-frame processing with overlap-add reconstruction.
 * `attenLimDb` is applied as a wet/dry mix post-inference:
 *   wet  = min(1, attenLimDb / 100)
 *   dry  = 1 - wet
 * This matches the user-intent of "strength" control even if the underlying
 * model does not expose `atten_lim_db` as a named ONNX input.
 *
 * NOTE: The ONNX input/output tensor names ('input', 'output') are based on
 * the community SpeechDenoiser port. Verify with:
 *   console.log(session.inputNames, session.outputNames)
 * after model load and adjust here if needed.
 */
async function runDeepFilter(
  ortSession: ort.InferenceSession,
  samples: Float32Array,
  attenLimDb: number,
): Promise<Float32Array> {
  const totalFrames = Math.ceil(samples.length / HOP_SAMPLES);
  const outputLength = samples.length;
  const accumulator = new Float32Array(outputLength + FRAME_SAMPLES);
  const normWindow = new Float32Array(outputLength + FRAME_SAMPLES);

  // Hann window for smooth overlap-add.
  const hannWindow = buildHannWindow(FRAME_SAMPLES);

  // Wet/dry strength from atten_lim_db (0 = bypass, 100 = full).
  const wet = Math.min(1, Math.max(0, attenLimDb / 100));
  const dry = 1 - wet;

  for (let f = 0; f < totalFrames; f++) {
    const start = f * HOP_SAMPLES;
    const frame = new Float32Array(FRAME_SAMPLES);
    const srcSlice = samples.slice(start, start + FRAME_SAMPLES);
    frame.set(srcSlice);
    // Remainder is zero-padded by Float32Array initialisation.

    // Apply Hann window before ONNX.
    for (let i = 0; i < FRAME_SAMPLES; i++) {
      frame[i] = (frame[i] ?? 0) * (hannWindow[i] ?? 1);
    }

    let enhanced: Float32Array;
    try {
      const inputTensor = new ort.Tensor('float32', frame, [1, FRAME_SAMPLES]);
      // TODO: verify input name against session.inputNames after first model load.
      const feeds: Record<string, ort.Tensor> = { input: inputTensor };
      const results = await ortSession.run(feeds);
      // TODO: verify output name against session.outputNames after first model load.
      const outData = results['output']?.data;
      enhanced = outData instanceof Float32Array ? outData : frame.slice();
    } catch {
      // On ONNX error, fall back to dry (original) frame for this chunk.
      enhanced = frame.slice();
    }

    // Overlap-add with wet/dry mixing.
    for (let i = 0; i < FRAME_SAMPLES; i++) {
      const idx = start + i;
      const orig = samples[idx] ?? 0;
      const enh = enhanced[i] ?? 0;
      accumulator[idx] = (accumulator[idx] ?? 0) + (orig * dry + enh * wet) * (hannWindow[i] ?? 1);
      normWindow[idx] = (normWindow[idx] ?? 0) + (hannWindow[i] ?? 1) * (hannWindow[i] ?? 1);
    }
  }

  // Normalise overlap-add.
  const result = new Float32Array(outputLength);
  for (let i = 0; i < outputLength; i++) {
    const norm = normWindow[i];
    result[i] = norm && norm > 1e-8 ? (accumulator[i] ?? 0) / norm : 0;
  }
  return result;
}

function buildHannWindow(size: number): Float32Array {
  const w = new Float32Array(size);
  for (let i = 0; i < size; i++) {
    w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (size - 1)));
  }
  return w;
}

// ---------------------------------------------------------------------------
// Internal — WAV encode (16-bit PCM mono, with D2 INFO/LIST chunk)
// ---------------------------------------------------------------------------

/**
 * Encode a Float32Array of mono PCM samples to a 16-bit PCM WAV Uint8Array.
 * Includes a LIST-INFO chunk with `ISFT` = `kittokit.de AI-processed`
 * as required by EU-AI-Act Art. 50 (D2 default from ml-tool-defaults.md).
 */
export function encodeWav(samples: Float32Array, sampleRate: number): Uint8Array {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const pcmLength = samples.length * blockAlign;

  // LIST-INFO chunk for D2 (EU-AI-Act Art. 50 metadata).
  const softwareTag = 'kittokit.de AI-processed (model=DeepFilterNet3)';
  const tagBytes = encodeNullTerminated(softwareTag);
  // INFO sub-chunk: 'ISFT' + 4-byte size + tag bytes (padded to even).
  const tagPadded = tagBytes.length % 2 === 0 ? tagBytes : appendByte(tagBytes, 0);
  const infoChunkSize = 4 /* 'INFO' */ + 4 /* 'ISFT' */ + 4 /* size */ + tagPadded.length;
  const listChunkSize = 4 /* 'LIST' */ + 4 /* size */ + infoChunkSize;

  // RIFF header size = 4 ('WAVE') + fmt-chunk (24) + data-chunk header (8) +
  //                    pcmLength + listChunkSize
  const riffSize = 4 + 24 + 8 + pcmLength + listChunkSize;
  const totalBytes = 8 + riffSize; // 'RIFF' + size + payload
  const buf = new ArrayBuffer(totalBytes);
  const view = new DataView(buf);
  let offset = 0;

  // RIFF chunk descriptor
  writeStr(view, offset, 'RIFF'); offset += 4;
  view.setUint32(offset, riffSize, true); offset += 4;
  writeStr(view, offset, 'WAVE'); offset += 4;

  // fmt sub-chunk (PCM = 1)
  writeStr(view, offset, 'fmt '); offset += 4;
  view.setUint32(offset, 16, true); offset += 4;          // sub-chunk size
  view.setUint16(offset, 1, true); offset += 2;           // PCM format
  view.setUint16(offset, numChannels, true); offset += 2;
  view.setUint32(offset, sampleRate, true); offset += 4;
  view.setUint32(offset, byteRate, true); offset += 4;
  view.setUint16(offset, blockAlign, true); offset += 2;
  view.setUint16(offset, bitsPerSample, true); offset += 2;

  // data sub-chunk
  writeStr(view, offset, 'data'); offset += 4;
  view.setUint32(offset, pcmLength, true); offset += 4;
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i] ?? 0;
    const clamped = Math.max(-1, Math.min(1, s));
    view.setInt16(offset, Math.round(clamped * 32767), true);
    offset += 2;
  }

  // LIST-INFO sub-chunk (D2 metadata)
  writeStr(view, offset, 'LIST'); offset += 4;
  view.setUint32(offset, infoChunkSize, true); offset += 4;
  writeStr(view, offset, 'INFO'); offset += 4;
  writeStr(view, offset, 'ISFT'); offset += 4;
  view.setUint32(offset, tagPadded.length, true); offset += 4;
  for (let i = 0; i < tagPadded.length; i++) {
    view.setUint8(offset + i, tagPadded[i] ?? 0);
  }

  return new Uint8Array(buf);
}

function writeStr(view: DataView, offset: number, str: string): void {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function encodeNullTerminated(str: string): Uint8Array {
  const bytes = new Uint8Array(str.length + 1);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i) & 0xff;
  }
  bytes[str.length] = 0;
  return bytes;
}

function appendByte(arr: Uint8Array, byte: number): Uint8Array {
  const out = new Uint8Array(arr.length + 1);
  out.set(arr);
  out[arr.length] = byte;
  return out;
}

// ---------------------------------------------------------------------------
// Internal — utilities
// ---------------------------------------------------------------------------

function mergeChunks(chunks: Uint8Array[], totalBytes: number): Uint8Array {
  const merged = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}
