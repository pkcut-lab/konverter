import { parse } from 'exifr';
import piexif from 'piexifjs';

export type ExifMode = 'none' | 'standard' | 'all';

export interface ExifReadResult {
  orientationDeg: 0 | 90 | 180 | 270;
  rawTags: Record<string, unknown> | null;
}

const ORIENTATION_TO_DEG: Record<number, 0 | 90 | 180 | 270> = {
  1: 0, 2: 0, 3: 180, 4: 180, 5: 90, 6: 90, 7: 270, 8: 270,
};

export async function readHeicExif(bytes: Uint8Array): Promise<ExifReadResult> {
  try {
    const tags = await parse(bytes, {
      tiff: true, exif: true, gps: true,
      translateKeys: true, translateValues: false,
    });
    if (!tags) return { orientationDeg: 0, rawTags: null };
    const oriVal = typeof tags.Orientation === 'number' ? tags.Orientation : 1;
    const orientationDeg = ORIENTATION_TO_DEG[oriVal] ?? 0;
    return { orientationDeg, rawTags: tags as Record<string, unknown> };
  } catch {
    return { orientationDeg: 0, rawTags: null };
  }
}

function uint8ToStr(buf: Uint8Array): string {
  let s = '';
  for (let i = 0; i < buf.length; i++) s += String.fromCharCode(buf[i]!);
  return s;
}

function strToUint8(s: string): Uint8Array {
  const buf = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) buf[i] = s.charCodeAt(i);
  return buf;
}

function formatExifDate(d: unknown): string {
  if (!(d instanceof Date) || isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}:${pad(d.getMonth() + 1)}:${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function buildGpsDict(tags: Record<string, unknown>): Record<number, unknown> {
  const GPSIFD = piexif.GPSIFD;
  const lat = tags['latitude'] as number;
  const lon = tags['longitude'] as number;
  const toRat = (deg: number): [number, number][] => {
    const d = Math.floor(Math.abs(deg));
    const mFull = (Math.abs(deg) - d) * 60;
    const m = Math.floor(mFull);
    const s = Math.round((mFull - m) * 60 * 100);
    return [[d, 1], [m, 1], [s, 100]];
  };
  return {
    [GPSIFD['GPSLatitudeRef']!]: lat >= 0 ? 'N' : 'S',
    [GPSIFD['GPSLatitude']!]: toRat(lat),
    [GPSIFD['GPSLongitudeRef']!]: lon >= 0 ? 'E' : 'W',
    [GPSIFD['GPSLongitude']!]: toRat(lon),
  };
}

/**
 * Inject EXIF back into JPEG bytes via piexifjs.
 * - 'standard': keep Make/Model/DateTime; strip GPS
 * - 'all':      same + GPS coordinates preserved
 * Returns original bytes unchanged on any error (graceful degradation).
 */
export function injectExifIntoJpeg(
  jpegBytes: Uint8Array,
  tags: Record<string, unknown>,
  mode: Exclude<ExifMode, 'none'>,
): Uint8Array {
  try {
    const exifDict: ReturnType<typeof piexif.load> = { '0th': {}, Exif: {} };
    const IFD = piexif.ImageIFD;
    const EIFD = piexif.ExifIFD;

    if (typeof tags['Make'] === 'string')
      exifDict['0th']![IFD['Make']!] = tags['Make'];
    if (typeof tags['Model'] === 'string')
      exifDict['0th']![IFD['Model']!] = tags['Model'];
    if (typeof tags['Software'] === 'string')
      exifDict['0th']![IFD['Software']!] = tags['Software'];
    const dtStr = formatExifDate(tags['DateTime']);
    if (dtStr) exifDict['0th']![IFD['DateTime']!] = dtStr;
    const dto = formatExifDate(tags['DateTimeOriginal']);
    if (dto) exifDict['Exif']![EIFD['DateTimeOriginal']!] = dto;
    const dtd = formatExifDate(tags['DateTimeDigitized']);
    if (dtd) exifDict['Exif']![EIFD['DateTimeDigitized']!] = dtd;

    if (mode === 'all' && typeof tags['latitude'] === 'number' && typeof tags['longitude'] === 'number') {
      exifDict['GPS'] = buildGpsDict(tags);
    }

    const exifStr = piexif.dump(exifDict);
    const jpegStr = uint8ToStr(jpegBytes);
    const result = piexif.insert(exifStr, jpegStr);
    return strToUint8(result);
  } catch {
    return jpegBytes;
  }
}
