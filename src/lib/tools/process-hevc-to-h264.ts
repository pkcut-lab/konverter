export type ProcessHevcConfig = {
  preset: 'original' | 'balanced' | 'small';
  downscaleTo1080p?: boolean;
};

export type ProgressCallback = (progress: number) => void;

type VideoTrack = { width: number; height: number; bitrate?: number };
type AudioTrack = { codec: string; bitrate: number } | null;

export async function processHevcToH264(
  input: Uint8Array,
  config: ProcessHevcConfig,
  onProgress?: ProgressCallback,
): Promise<Uint8Array> {
  const mb = await import('mediabunny');

  const source = new (mb as any).BufferSource(input);
  const inputFile = new (mb as any).Input({ source, formats: (mb as any).ALL_FORMATS });

  const videoTrack = (await inputFile.getPrimaryVideoTrack()) as VideoTrack;
  const audioTrack = (await inputFile.getPrimaryAudioTrack()) as AudioTrack;

  const target = new (mb as any).BufferTarget();
  const output = new (mb as any).Output({
    target,
    format: new (mb as any).Mp4OutputFormat(),
  });

  const videoBitrate = selectBitrate(videoTrack, config.preset);

  const videoOptions: Record<string, unknown> = { codec: 'h264', bitrate: videoBitrate };
  if (config.downscaleTo1080p) {
    videoOptions.width = 1920;
    videoOptions.height = 1080;
    videoOptions.fit = 'contain';
  }

  let audioOptions: Record<string, unknown> | undefined;
  if (audioTrack) {
    audioOptions =
      audioTrack.codec === 'aac' && audioTrack.bitrate <= 192_000
        ? { copy: true }
        : { codec: 'aac', bitrate: 128_000 };
  }

  const conversion = await (mb as any).Conversion.init({
    input: inputFile,
    output,
    video: videoOptions,
    audio: audioOptions,
    tags: (inputTags: Record<string, unknown>) => ({ ...inputTags }),
  });

  if (onProgress) {
    conversion.onProgress = (progress: number) => onProgress(progress);
  }

  await conversion.execute();
  return target.buffer;
}

function selectBitrate(track: VideoTrack, preset: ProcessHevcConfig['preset']): number {
  const source = track.bitrate ?? estimateBitrate(track.width, track.height);
  switch (preset) {
    case 'original':
      return source;
    case 'balanced':
      return Math.round(source * 0.6);
    case 'small':
      return Math.round(source * 0.35);
  }
}

function estimateBitrate(w: number, h: number): number {
  const pixels = w * h;
  if (pixels >= 1920 * 1080) return 8_000_000;
  if (pixels >= 1280 * 720) return 4_000_000;
  return 2_000_000;
}
