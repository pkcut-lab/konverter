import { describe, it, expect } from 'vitest';
import { isHeicFile } from './heic-konverter';
import { detectLivePhotos } from './heic-folder-extract';

describe('isHeicFile', () => {
  it('detects by image/heic MIME type', () => {
    const f = new File([], 'photo.heic', { type: 'image/heic' });
    expect(isHeicFile(f)).toBe(true);
  });

  it('detects by image/heif MIME type', () => {
    const f = new File([], 'photo.heif', { type: 'image/heif' });
    expect(isHeicFile(f)).toBe(true);
  });

  it('detects by .heic extension with empty MIME type', () => {
    const f = new File([], 'photo.heic', { type: '' });
    expect(isHeicFile(f)).toBe(true);
  });

  it('detects .heif extension', () => {
    const f = new File([], 'photo.heif', { type: '' });
    expect(isHeicFile(f)).toBe(true);
  });

  it('detects .HEIC extension (uppercase)', () => {
    const f = new File([], 'IMG_0001.HEIC', { type: '' });
    expect(isHeicFile(f)).toBe(true);
  });

  it('rejects image/jpeg', () => {
    const f = new File([], 'photo.jpg', { type: 'image/jpeg' });
    expect(isHeicFile(f)).toBe(false);
  });

  it('rejects image/png', () => {
    const f = new File([], 'photo.png', { type: 'image/png' });
    expect(isHeicFile(f)).toBe(false);
  });

  it('rejects .jpg extension with no MIME', () => {
    const f = new File([], 'photo.jpg', { type: '' });
    expect(isHeicFile(f)).toBe(false);
  });
});

describe('detectLivePhotos', () => {
  it('pairs heic with matching .mov file', () => {
    const heic = new File([], 'IMG_0001.heic', { type: 'image/heic' });
    const mov = new File([], 'IMG_0001.mov', { type: 'video/quicktime' });
    const pairs = detectLivePhotos([heic, mov]);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]!.heic.name).toBe('IMG_0001.heic');
    expect(pairs[0]!.mov?.name).toBe('IMG_0001.mov');
  });

  it('returns null mov when no matching pair', () => {
    const heic = new File([], 'photo.heic', { type: 'image/heic' });
    const pairs = detectLivePhotos([heic]);
    expect(pairs[0]!.mov).toBeNull();
  });

  it('handles multiple heic files, partial mov pairing', () => {
    const heic1 = new File([], 'IMG_0001.heic', { type: 'image/heic' });
    const heic2 = new File([], 'IMG_0002.heic', { type: 'image/heic' });
    const mov1 = new File([], 'IMG_0001.mov', { type: 'video/quicktime' });
    const pairs = detectLivePhotos([heic1, heic2, mov1]);
    expect(pairs).toHaveLength(2);
    const pair1 = pairs.find(p => p.heic.name === 'IMG_0001.heic');
    const pair2 = pairs.find(p => p.heic.name === 'IMG_0002.heic');
    expect(pair1?.mov?.name).toBe('IMG_0001.mov');
    expect(pair2?.mov).toBeNull();
  });

  it('is case-insensitive for base name matching', () => {
    const heic = new File([], 'IMG_0001.HEIC', { type: '' });
    const mov = new File([], 'IMG_0001.mov', { type: '' });
    const pairs = detectLivePhotos([heic, mov]);
    expect(pairs[0]!.mov).not.toBeNull();
  });

  it('returns empty array for empty input', () => {
    expect(detectLivePhotos([])).toEqual([]);
  });
});
