import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { parseToolConfig } from '../../../src/lib/tools/schemas';
import { spracheVerbessern } from '../../../src/lib/tools/sprache-verbessern';
import {
  isPrepared,
  enhanceSpeech,
  encodeWav,
  StallError,
} from '../../../src/lib/tools/speech-enhancer';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal valid WAV Uint8Array for testing audio decode. */
function makeSilentWav(sampleRate = 48_000, durationSeconds = 0.1): Uint8Array {
  const numSamples = Math.ceil(sampleRate * durationSeconds);
  const samples = new Float32Array(numSamples); // all zeros = silence
  return encodeWav(samples, sampleRate);
}

/** Stub AudioContext so tests run in jsdom without real audio APIs. */
function makeAudioContextStub(sampleRate: number, samples: Float32Array) {
  const audioBuffer = {
    numberOfChannels: 1,
    length: samples.length,
    sampleRate,
    getChannelData: vi.fn(() => samples.slice()),
  };
  return {
    decodeAudioData: vi.fn(() => Promise.resolve(audioBuffer)),
    close: vi.fn(() => Promise.resolve()),
  };
}

// ---------------------------------------------------------------------------
// Config validation
// ---------------------------------------------------------------------------

describe('sprache-verbessern config', () => {
  it('parses as valid FileToolConfig', () => {
    const r = parseToolConfig(spracheVerbessern);
    expect(r.ok).toBe(true);
  });

  it('has correct tool id', () => {
    expect(spracheVerbessern.id).toBe('speech-enhancer');
  });

  it('has correct type', () => {
    expect(spracheVerbessern.type).toBe('file-tool');
  });

  it('has audio category', () => {
    expect(spracheVerbessern.categoryId).toBe('audio');
  });

  it('accepts at least 6 audio MIME types', () => {
    expect(spracheVerbessern.accept.length).toBeGreaterThanOrEqual(6);
  });

  it('rejects invalid category (empty string)', () => {
    const broken = { ...spracheVerbessern, categoryId: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });

  it('has strength presets with correct default', () => {
    const { presets } = spracheVerbessern;
    expect(presets).toBeDefined();
    expect(presets?.default).toBe('20');
  });

  it('has bypass preset (id 0)', () => {
    const ids = spracheVerbessern.presets?.options.map((o) => o.id) ?? [];
    expect(ids).toContain('0');
  });

  it('has maximal preset (id 100)', () => {
    const ids = spracheVerbessern.presets?.options.map((o) => o.id) ?? [];
    expect(ids).toContain('100');
  });

  it('has prepare function', () => {
    expect(typeof spracheVerbessern.prepare).toBe('function');
  });

  it('has process function', () => {
    expect(typeof spracheVerbessern.process).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// WAV encoder
// ---------------------------------------------------------------------------

describe('encodeWav', () => {
  it('outputs RIFF WAV header magic bytes', () => {
    const samples = new Float32Array(480);
    const wav = encodeWav(samples, 48_000);
    expect(wav[0]).toBe(0x52); // R
    expect(wav[1]).toBe(0x49); // I
    expect(wav[2]).toBe(0x46); // F
    expect(wav[3]).toBe(0x46); // F
    expect(wav[8]).toBe(0x57); // W
    expect(wav[9]).toBe(0x41); // A
    expect(wav[10]).toBe(0x56); // V
    expect(wav[11]).toBe(0x45); // E
  });

  it('encodes sample rate 48000 at bytes 24-27', () => {
    const samples = new Float32Array(480);
    const wav = encodeWav(samples, 48_000);
    const view = new DataView(wav.buffer);
    // fmt chunk starts at byte 12, sample rate at offset +12 within fmt chunk = byte 24
    expect(view.getUint32(24, true)).toBe(48_000);
  });

  it('encodes 1 channel (mono)', () => {
    const samples = new Float32Array(480);
    const wav = encodeWav(samples, 48_000);
    const view = new DataView(wav.buffer);
    // numChannels at offset 22
    expect(view.getUint16(22, true)).toBe(1);
  });

  it('encodes 16-bit PCM (format tag = 1)', () => {
    const samples = new Float32Array(480);
    const wav = encodeWav(samples, 48_000);
    const view = new DataView(wav.buffer);
    // audio format at offset 20
    expect(view.getUint16(20, true)).toBe(1); // PCM
  });

  it('includes D2 LIST-INFO chunk with ISFT tag', () => {
    const samples = new Float32Array(480);
    const wav = encodeWav(samples, 48_000);
    const text = new TextDecoder().decode(wav);
    expect(text).toContain('LIST');
    expect(text).toContain('INFO');
    expect(text).toContain('ISFT');
    expect(text).toContain('kittokit.de');
  });

  it('clamps +/- overflow samples to 16-bit range', () => {
    const samples = new Float32Array([2.0, -2.0]); // OOB
    const wav = encodeWav(samples, 48_000);
    const view = new DataView(wav.buffer);
    // data starts at byte 44
    const s0 = view.getInt16(44, true);
    const s1 = view.getInt16(46, true);
    expect(s0).toBe(32767);
    expect(s1).toBe(-32767);
  });

  it('produces correct total byte size', () => {
    const numSamples = 960;
    const samples = new Float32Array(numSamples);
    const wav = encodeWav(samples, 48_000);
    // Minimum size = RIFF header (8) + fmt (24) + data header (8) + PCM (numSamples * 2) + LIST chunk
    expect(wav.byteLength).toBeGreaterThan(8 + 24 + 8 + numSamples * 2);
  });
});

// ---------------------------------------------------------------------------
// isPrepared / model lifecycle
// ---------------------------------------------------------------------------

describe('isPrepared', () => {
  it('returns false before model is loaded', () => {
    expect(isPrepared()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// enhanceSpeech — bypass mode (no model required)
// ---------------------------------------------------------------------------

describe('enhanceSpeech', () => {
  beforeEach(() => {
    // Stub AudioContext for jsdom (AudioContext is not implemented in jsdom 25).
    const silentSamples = new Float32Array(4_800); // 0.1s at 48kHz
    vi.stubGlobal('AudioContext', vi.fn(() => makeAudioContextStub(48_000, silentSamples)));
    vi.stubGlobal('OfflineAudioContext', vi.fn((_channels: number, length: number, rate: number) => ({
      createBuffer: vi.fn((_ch: number, len: number, sr: number) => ({
        copyToChannel: vi.fn(),
        getChannelData: vi.fn(() => new Float32Array(Math.ceil(len * 48_000 / sr))),
        length: Math.ceil(len * 48_000 / rate),
        sampleRate: rate,
        numberOfChannels: 1,
      })),
      createBufferSource: vi.fn(() => ({
        buffer: null,
        connect: vi.fn(),
        start: vi.fn(),
      })),
      destination: {},
      startRendering: vi.fn(() => {
        const outLen = length;
        return Promise.resolve({
          getChannelData: vi.fn(() => new Float32Array(outLen)),
          length: outLen,
          sampleRate: 48_000,
          numberOfChannels: 1,
        });
      }),
    })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('bypass (attenLimDb=0) returns a valid WAV without needing model', async () => {
    const wav = makeSilentWav(48_000, 0.05);
    const result = await enhanceSpeech(wav, { attenLimDb: 0 });
    // Check RIFF header
    expect(result[0]).toBe(0x52); // R
    expect(result[1]).toBe(0x49); // I
    expect(result[2]).toBe(0x46); // F
    expect(result[3]).toBe(0x46); // F
  });

  it('bypass returns a Uint8Array', async () => {
    const wav = makeSilentWav(48_000, 0.05);
    const result = await enhanceSpeech(wav, { attenLimDb: 0 });
    expect(result).toBeInstanceOf(Uint8Array);
  });

  it('throws when model not prepared and attenLimDb > 0', async () => {
    const wav = makeSilentWav(48_000, 0.05);
    await expect(enhanceSpeech(wav, { attenLimDb: 20 })).rejects.toThrow(
      /model not loaded/i,
    );
  });
});

// ---------------------------------------------------------------------------
// StallError
// ---------------------------------------------------------------------------

describe('StallError', () => {
  it('has name StallError', () => {
    const err = new StallError('timeout');
    expect(err.name).toBe('StallError');
  });

  it('is instanceof Error', () => {
    const err = new StallError('timeout');
    expect(err).toBeInstanceOf(Error);
  });
});
