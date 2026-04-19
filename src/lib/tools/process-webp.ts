export type ProcessWebpConfig = { quality: number };

export async function processWebp(
  input: Uint8Array,
  config: ProcessWebpConfig,
): Promise<Uint8Array> {
  const blob = new Blob([input]);
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas-context-unavailable');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const out = await canvas.convertToBlob({
    type: 'image/webp',
    quality: clamp01(config.quality / 100),
  });
  return new Uint8Array(await out.arrayBuffer());
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}
