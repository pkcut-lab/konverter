# HEIC-Konverter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build two pure-client HEIC converter tools (`heic-zu-jpg` + `heic-zu-png`) with batch/folder support, EXIF privacy controls, iOS-first UX, and full DE+EN content.

**Architecture:** Shared engine in `heic-konverter.ts` using async generator pattern for batch; custom `HeicKonverterTool.svelte` (not generic FileTool — FileTool is single-file only); `client-zip` for streaming ZIP output; `exifr` for EXIF read; `piexifjs` for EXIF write-back (JPG "all" mode).

**Tech Stack:** `heic2any` (^0.0.4, already installed), `exifr` + `client-zip` + `piexifjs` (install needed), Canvas API for encode/resize, `webkitGetAsEntry` for folder-drop.

**Spec:** `docs/superpowers/specs/2026-04-29-heic-konverter-design.md`

---

## File Map

**Create:**
- `src/lib/tools/heic-exif.ts` — EXIF read (exifr) + orientation + GPS strip + piexifjs write
- `src/lib/tools/heic-konverter.ts` — engine: `convertOne()` + `convertBatch()` async generator
- `src/lib/tools/heic-folder-extract.ts` — `webkitGetAsEntry` recursion + Live-Photo pair detection
- `src/lib/tools/heic-zip-stream.ts` — `client-zip` wrapper (STORE-only)
- `src/lib/tools/heic-zu-jpg.ts` — FileToolConfig (type: file-tool, stub process)
- `src/lib/tools/heic-zu-png.ts` — FileToolConfig (type: file-tool, stub process)
- `src/lib/tools/heic-konverter.test.ts` — Vitest unit tests for engine
- `src/components/tools/HeicKonverterTool.svelte` — custom Svelte 5 component
- `src/content/tools/heic-zu-jpg/de.md`
- `src/content/tools/heic-zu-jpg/en.md`
- `src/content/tools/heic-zu-png/de.md`
- `src/content/tools/heic-zu-png/en.md`

**Modify:**
- `src/lib/tool-registry.ts` — 2 lazy loader entries
- `src/lib/slug-map.ts` — `heic-to-jpg` + `heic-to-png` in Image section
- `src/lib/i18n/strings.ts` — `tools.heicKonverter` namespace (UiStrings interface + DE/EN values)
- `src/pages/[lang]/[slug].astro` — import HeicKonverterTool + conditional render

---

## Task 1: Setup

**Files:** none (git + npm)

- [ ] **Step 1: Create branch and verify git account**

```bash
git checkout -b feat/heic-konverter
bash scripts/check-git-account.sh
```
Expected: branch created, account = pkcut-lab

- [ ] **Step 2: Install new dependencies**

```bash
npm install exifr client-zip piexifjs
```

- [ ] **Step 3: Write piexifjs type declaration**

Create `src/lib/tools/piexifjs.d.ts`:
```typescript
declare module 'piexifjs' {
  interface ExifDict {
    '0th'?: Record<number, unknown>;
    Exif?: Record<number, unknown>;
    GPS?: Record<number, unknown>;
    '1st'?: Record<number, unknown>;
  }
  const piexif: {
    load(data: string): ExifDict;
    dump(exifDict: ExifDict): string;
    insert(exifStr: string, jpegStr: string): string;
    remove(jpegStr: string): string;
    ImageIFD: Record<string, number>;
    ExifIFD: Record<string, number>;
    GPSIFD: Record<string, number>;
  };
  export = piexif;
}
```

- [ ] **Step 4: Commit setup**

```bash
git add package.json package-lock.json src/lib/tools/piexifjs.d.ts
git commit -m "chore(heic): install exifr, client-zip, piexifjs + type declaration"
```

---

## Task 2: EXIF Module

**Files:**
- Create: `src/lib/tools/heic-exif.ts`

- [ ] **Step 1: Create heic-exif.ts**

```typescript
// src/lib/tools/heic-exif.ts
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
    return { orientationDeg, rawTags: tags };
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

/**
 * For JPG output + "all" / "standard" mode:
 * inject EXIF into the JPEG bytes using piexifjs.
 * - "all"     : keep Make, Model, DateTime, Software, DateTimeOriginal
 * - "standard": same (GPS always stripped — never in output)
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

    if (tags.Make && typeof tags.Make === 'string')
      exifDict['0th']![IFD.Make!] = tags.Make;
    if (tags.Model && typeof tags.Model === 'string')
      exifDict['0th']![IFD.Model!] = tags.Model;
    if (tags.Software && typeof tags.Software === 'string')
      exifDict['0th']![IFD.Software!] = tags.Software;
    if (tags.DateTime && typeof tags.DateTime === 'object')
      exifDict['0th']![IFD.DateTime!] = formatExifDate(tags.DateTime as Date);
    if (tags.DateTimeOriginal && typeof tags.DateTimeOriginal === 'object')
      exifDict['Exif']![EIFD.DateTimeOriginal!] = formatExifDate(tags.DateTimeOriginal as Date);
    if (tags.DateTimeDigitized && typeof tags.DateTimeDigitized === 'object')
      exifDict['Exif']![EIFD.DateTimeDigitized!] = formatExifDate(tags.DateTimeDigitized as Date);

    // GPS: included only in "all" mode
    if (mode === 'all' && tags.latitude != null && tags.longitude != null) {
      exifDict['GPS'] = buildGpsDict(tags);
    }

    const exifStr = piexif.dump(exifDict);
    const jpegStr = uint8ToStr(jpegBytes);
    const result = piexif.insert(exifStr, jpegStr);
    return strToUint8(result);
  } catch {
    return jpegBytes; // fallback: return without EXIF
  }
}

function formatExifDate(d: Date): string {
  if (!(d instanceof Date) || isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}:${pad(d.getMonth() + 1)}:${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function buildGpsDict(tags: Record<string, unknown>): Record<number, unknown> {
  const GPSIFD = piexif.GPSIFD;
  const lat = tags.latitude as number;
  const lon = tags.longitude as number;
  const toRat = (deg: number): [number, number][] => {
    const d = Math.floor(Math.abs(deg));
    const mFull = (Math.abs(deg) - d) * 60;
    const m = Math.floor(mFull);
    const s = Math.round((mFull - m) * 60 * 100);
    return [[d, 1], [m, 1], [s, 100]];
  };
  return {
    [GPSIFD.GPSLatitudeRef!]: lat >= 0 ? 'N' : 'S',
    [GPSIFD.GPSLatitude!]: toRat(lat),
    [GPSIFD.GPSLongitudeRef!]: lon >= 0 ? 'E' : 'W',
    [GPSIFD.GPSLongitude!]: toRat(lon),
  };
}
```

- [ ] **Step 2: Commit EXIF module**

```bash
git add src/lib/tools/heic-exif.ts
git commit -m "feat(heic): EXIF read (exifr) + piexifjs write-back helper"
```

---

## Task 3: Core Engine

**Files:**
- Create: `src/lib/tools/heic-konverter.ts`

- [ ] **Step 1: Create heic-konverter.ts**

```typescript
// src/lib/tools/heic-konverter.ts
import { readHeicExif, injectExifIntoJpeg } from './heic-exif';
import type { ExifMode } from './heic-exif';

export type OutputFormat = 'jpg' | 'png';
export type ResizeMode = 'original' | '2160' | '1080';

export interface ConvertOpts {
  format: OutputFormat;
  quality: number; // 0–1 (jpg only)
  resize: ResizeMode;
  exifMode: ExifMode;
}

export interface ConvertResult {
  kind: 'result';
  filename: string;
  bytes: Uint8Array;
  mime: string;
  originalName: string;
}

export interface ConvertError {
  kind: 'error';
  originalName: string;
  message: string;
}

const HEIC_MIMES = new Set(['image/heic', 'image/heif', 'image/heic-sequence', 'image/heif-sequence']);

export function isHeicFile(file: File): boolean {
  if (HEIC_MIMES.has(file.type)) return true;
  return /\.(heic|heif)$/i.test(file.name);
}

function replaceExtension(name: string, ext: string): string {
  return name.replace(/\.(heic|heif)$/i, '') + '.' + ext;
}

async function fileToUint8Array(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

async function decodeHeicToCanvas(bytes: Uint8Array, mime: string): Promise<HTMLCanvasElement> {
  const isSafari = (() => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent;
    return /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua);
  })();

  let blob: Blob;
  if (isSafari) {
    blob = new Blob([bytes], { type: mime });
  } else {
    const mod = await import('heic2any');
    const heic2any = mod.default as (opts: { blob: Blob; toType: string }) => Promise<Blob | Blob[]>;
    const result = await heic2any({ blob: new Blob([bytes], { type: mime }), toType: 'image/png' });
    blob = Array.isArray(result) ? (result[0] as Blob) : result;
  }

  const img = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  img.close();
  return canvas;
}

function applyOrientation(canvas: HTMLCanvasElement, deg: 0 | 90 | 180 | 270): HTMLCanvasElement {
  if (deg === 0) return canvas;
  const rotated = document.createElement('canvas');
  if (deg === 90 || deg === 270) {
    rotated.width = canvas.height;
    rotated.height = canvas.width;
  } else {
    rotated.width = canvas.width;
    rotated.height = canvas.height;
  }
  const ctx = rotated.getContext('2d')!;
  ctx.translate(rotated.width / 2, rotated.height / 2);
  ctx.rotate((deg * Math.PI) / 180);
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
  return rotated;
}

function applyResize(canvas: HTMLCanvasElement, resize: ResizeMode): HTMLCanvasElement {
  const maxPx = resize === '2160' ? 3840 : resize === '1080' ? 1920 : 0;
  if (maxPx === 0) return canvas;
  const { width, height } = canvas;
  if (width <= maxPx && height <= maxPx) return canvas;
  const scale = maxPx / Math.max(width, height);
  const resized = document.createElement('canvas');
  resized.width = Math.round(width * scale);
  resized.height = Math.round(height * scale);
  const ctx = resized.getContext('2d')!;
  ctx.drawImage(canvas, 0, 0, resized.width, resized.height);
  return resized;
}

async function canvasToBytes(canvas: HTMLCanvasElement, format: OutputFormat, quality: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
    canvas.toBlob(
      (blob) => {
        if (!blob) { reject(new Error('canvas.toBlob failed')); return; }
        blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf))).catch(reject);
      },
      mime,
      format === 'jpg' ? quality : undefined,
    );
  });
}

export async function convertOne(file: File, opts: ConvertOpts): Promise<Uint8Array> {
  const bytes = await fileToUint8Array(file);
  const mime = HEIC_MIMES.has(file.type) ? file.type : 'image/heic';

  // Read EXIF before decode (decode strips EXIF)
  const { orientationDeg, rawTags } = await readHeicExif(bytes);

  const rawCanvas = await decodeHeicToCanvas(bytes, mime);
  const oriented = applyOrientation(rawCanvas, orientationDeg);
  const resized = applyResize(oriented, opts.resize);
  let outBytes = await canvasToBytes(resized, opts.format, opts.quality);

  // Re-attach EXIF for JPG output in standard/all modes
  if (opts.format === 'jpg' && opts.exifMode !== 'none' && rawTags) {
    outBytes = injectExifIntoJpeg(outBytes, rawTags, opts.exifMode);
  }

  return outBytes;
}

export async function* convertBatch(
  files: File[],
  opts: ConvertOpts,
): AsyncGenerator<ConvertResult | ConvertError> {
  for (const file of files) {
    try {
      const bytes = await convertOne(file, opts);
      const mime = opts.format === 'jpg' ? 'image/jpeg' : 'image/png';
      yield {
        kind: 'result',
        filename: replaceExtension(file.name, opts.format),
        bytes,
        mime,
        originalName: file.name,
      };
    } catch (err) {
      yield {
        kind: 'error',
        originalName: file.name,
        message: err instanceof Error ? err.message : String(err),
      };
    }
  }
}
```

- [ ] **Step 2: Commit engine**

```bash
git add src/lib/tools/heic-konverter.ts
git commit -m "feat(heic): core engine — convertOne + convertBatch async generator"
```

---

## Task 4: Folder-Drop + ZIP

**Files:**
- Create: `src/lib/tools/heic-folder-extract.ts`
- Create: `src/lib/tools/heic-zip-stream.ts`

- [ ] **Step 1: Create heic-folder-extract.ts**

```typescript
// src/lib/tools/heic-folder-extract.ts
const HEIC_EXTS = new Set(['.heic', '.heif']);

function ext(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i).toLowerCase() : '';
}

async function entryToFile(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => entry.file(resolve, reject));
}

async function walkEntry(entry: FileSystemEntry): Promise<File[]> {
  if (entry.isFile) {
    const f = await entryToFile(entry as FileSystemFileEntry);
    return HEIC_EXTS.has(ext(f.name)) ? [f] : [];
  }
  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    const all: File[] = [];
    // readEntries returns at most 100 per call — must loop until empty
    await new Promise<void>((resolve, reject) => {
      const batch = () => {
        reader.readEntries(async (entries) => {
          if (entries.length === 0) { resolve(); return; }
          for (const e of entries) {
            const sub = await walkEntry(e);
            all.push(...sub);
          }
          batch();
        }, reject);
      };
      batch();
    });
    return all;
  }
  return [];
}

export async function extractHeicFromDrop(
  dataTransfer: DataTransfer,
): Promise<File[]> {
  const files: File[] = [];

  // Desktop: use webkitGetAsEntry for recursive folder support
  if (dataTransfer.items && dataTransfer.items.length > 0) {
    const entries: FileSystemEntry[] = [];
    for (let i = 0; i < dataTransfer.items.length; i++) {
      const item = dataTransfer.items[i]!;
      const entry = item.webkitGetAsEntry?.();
      if (entry) entries.push(entry);
      else if (item.kind === 'file') {
        const f = item.getAsFile();
        if (f && HEIC_EXTS.has(ext(f.name))) files.push(f);
      }
    }
    for (const entry of entries) {
      const sub = await walkEntry(entry);
      files.push(...sub);
    }
    return files;
  }

  // Fallback: plain FileList
  for (let i = 0; i < dataTransfer.files.length; i++) {
    const f = dataTransfer.files[i]!;
    if (HEIC_EXTS.has(ext(f.name))) files.push(f);
  }
  return files;
}

export interface LivePhotoPair {
  heic: File;
  mov: File | null;
}

export function detectLivePhotos(files: File[]): LivePhotoPair[] {
  const movByBase = new Map<string, File>();
  const heicFiles: File[] = [];

  for (const f of files) {
    const e = ext(f.name);
    const base = f.name.slice(0, f.name.lastIndexOf('.')).toLowerCase();
    if (e === '.mov') movByBase.set(base, f);
    else if (HEIC_EXTS.has(e)) heicFiles.push(f);
  }

  return heicFiles.map((heic) => {
    const base = heic.name.slice(0, heic.name.lastIndexOf('.')).toLowerCase();
    return { heic, mov: movByBase.get(base) ?? null };
  });
}
```

- [ ] **Step 2: Create heic-zip-stream.ts**

```typescript
// src/lib/tools/heic-zip-stream.ts
import { downloadZip } from 'client-zip';

export interface ZipEntry {
  name: string;
  bytes: Uint8Array;
}

/** Creates a ZIP blob from converted files using STORE compression (no Deflate). */
export async function createZipBlob(entries: ZipEntry[]): Promise<Blob> {
  const files = entries.map((e) => ({
    name: e.name,
    input: e.bytes,
    // STORE: JPG/PNG are already compressed — Deflate adds CPU with no size gain
    lastModified: new Date(),
  }));
  const response = downloadZip(files);
  return response.blob();
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 3: Commit folder + ZIP modules**

```bash
git add src/lib/tools/heic-folder-extract.ts src/lib/tools/heic-zip-stream.ts
git commit -m "feat(heic): folder-drop extractor + ZIP stream helper"
```

---

## Task 5: Tool Configs + Registry

**Files:**
- Create: `src/lib/tools/heic-zu-jpg.ts`
- Create: `src/lib/tools/heic-zu-png.ts`
- Modify: `src/lib/tool-registry.ts`
- Modify: `src/lib/slug-map.ts`

- [ ] **Step 1: Create heic-zu-jpg.ts**

```typescript
// src/lib/tools/heic-zu-jpg.ts
import type { FileToolConfig } from './schemas';

export const heicZuJpg: FileToolConfig = {
  id: 'heic-to-jpg',
  type: 'file-tool',
  categoryId: 'image',
  accept: ['image/heic', 'image/heif', '.heic', '.heif'],
  maxSizeMb: 50,
  filenameSuffix: '.jpg',
  defaultFormat: 'jpg',
  cameraCapture: false,
  process: async () => {
    // HeicKonverterTool.svelte calls convertOne/convertBatch directly.
    throw new Error('heic-to-jpg: use HeicKonverterTool component — not called via FileTool');
  },
};
```

- [ ] **Step 2: Create heic-zu-png.ts**

```typescript
// src/lib/tools/heic-zu-png.ts
import type { FileToolConfig } from './schemas';

export const heicZuPng: FileToolConfig = {
  id: 'heic-to-png',
  type: 'file-tool',
  categoryId: 'image',
  accept: ['image/heic', 'image/heif', '.heic', '.heif'],
  maxSizeMb: 50,
  filenameSuffix: '.png',
  defaultFormat: 'png',
  cameraCapture: false,
  process: async () => {
    throw new Error('heic-to-png: use HeicKonverterTool component — not called via FileTool');
  },
};
```

- [ ] **Step 3: Register in tool-registry.ts** (add after 'remove-background' entry):

```typescript
  'heic-to-jpg': () => import('./tools/heic-zu-jpg').then((m) => m.heicZuJpg),
  'heic-to-png': () => import('./tools/heic-zu-png').then((m) => m.heicZuPng),
```

- [ ] **Step 4: Register in slug-map.ts** (add in Image section after 'webcam-blur'):

```typescript
  'heic-to-jpg': { de: 'heic-zu-jpg', en: 'heic-to-jpg' },
  'heic-to-png': { de: 'heic-zu-png', en: 'heic-to-png' },
```

- [ ] **Step 5: Commit configs**

```bash
git add src/lib/tools/heic-zu-jpg.ts src/lib/tools/heic-zu-png.ts src/lib/tool-registry.ts src/lib/slug-map.ts
git commit -m "feat(heic): tool configs heic-zu-jpg + heic-zu-png + registry entries"
```

---

## Task 6: i18n Strings

**Files:**
- Modify: `src/lib/i18n/strings.ts`

- [ ] **Step 1: Add tools.heicKonverter to UiStrings interface**

In the `tools` object of `UiStrings` interface, add:
```typescript
    heicKonverter: {
      dropzoneLabel: string;
      dropzoneSubLabel: string;
      orBrowse: string;
      folderHint: string;
      iosHint: string;
      convertBtn: string;
      converting: string;
      formatLabel: string;
      qualityLabel: string;
      qualityHigh: string;
      qualityMid: string;
      qualityLow: string;
      resizeLabel: string;
      resizeOriginal: string;
      resize4k: string;
      resize1080: string;
      exifLabel: string;
      exifStandard: string;
      exifAll: string;
      exifNone: string;
      exifHint: string;
      advancedToggle: string;
      livePhotosBanner: string;
      resultCount: string;
      downloadAll: string;
      downloadZip: string;
      downloadFile: string;
      privacyBadge: string;
      errorHeicDecode: string;
      errorNoFiles: string;
      errorTooLarge: string;
      statusDone: string;
      statusError: string;
    };
```

- [ ] **Step 2: Add DE values** (in the `de` entry of `strings`):

```typescript
        heicKonverter: {
          dropzoneLabel: 'HEIC-Dateien hierher ziehen',
          dropzoneSubLabel: 'oder Ordner ablegen',
          orBrowse: 'Dateien auswählen',
          folderHint: 'Ordner und Unterordner werden vollständig durchsucht',
          iosHint: 'Auf dem iPhone: Mehrere Bilder gleichzeitig auswählen',
          convertBtn: 'Konvertieren',
          converting: 'Wird konvertiert…',
          formatLabel: 'Format',
          qualityLabel: 'Qualität',
          qualityHigh: 'Hoch',
          qualityMid: 'Mittel',
          qualityLow: 'Klein',
          resizeLabel: 'Auflösung',
          resizeOriginal: 'Original',
          resize4k: '4K (max)',
          resize1080: 'Full HD',
          exifLabel: 'Bilddaten',
          exifStandard: 'Ohne GPS',
          exifAll: 'Alles behalten',
          exifNone: 'Alles entfernen',
          exifHint: 'Standardmäßig werden GPS-Standortdaten entfernt',
          advancedToggle: 'Erweiterte Optionen',
          livePhotosBanner: 'Live Photos erkannt — die zugehörigen Videos werden nicht mitkonvertiert',
          resultCount: '{count} Datei(en) konvertiert',
          downloadAll: 'Alle herunterladen',
          downloadZip: 'Als ZIP herunterladen',
          downloadFile: 'Herunterladen',
          privacyBadge: '100 % lokal — keine Bilder werden hochgeladen',
          errorHeicDecode: 'HEIC-Datei konnte nicht gelesen werden',
          errorNoFiles: 'Keine HEIC-Dateien gefunden',
          errorTooLarge: 'Datei zu groß (max. 50 MB)',
          statusDone: 'Fertig',
          statusError: 'Fehler',
        },
```

- [ ] **Step 3: Add EN values** (in the `en` entry of `strings`):

```typescript
        heicKonverter: {
          dropzoneLabel: 'Drop HEIC files here',
          dropzoneSubLabel: 'or drop a folder',
          orBrowse: 'Choose files',
          folderHint: 'Folders and subfolders are scanned recursively',
          iosHint: 'On iPhone: tap and select multiple photos at once',
          convertBtn: 'Convert',
          converting: 'Converting…',
          formatLabel: 'Format',
          qualityLabel: 'Quality',
          qualityHigh: 'High',
          qualityMid: 'Medium',
          qualityLow: 'Small',
          resizeLabel: 'Resolution',
          resizeOriginal: 'Original',
          resize4k: '4K (max)',
          resize1080: 'Full HD',
          exifLabel: 'Image data',
          exifStandard: 'No GPS',
          exifAll: 'Keep all',
          exifNone: 'Remove all',
          exifHint: 'By default, GPS location data is removed',
          advancedToggle: 'Advanced options',
          livePhotosBanner: 'Live Photos detected — the associated videos will not be converted',
          resultCount: '{count} file(s) converted',
          downloadAll: 'Download all',
          downloadZip: 'Download as ZIP',
          downloadFile: 'Download',
          privacyBadge: '100% local — no images are uploaded',
          errorHeicDecode: 'Could not read HEIC file',
          errorNoFiles: 'No HEIC files found',
          errorTooLarge: 'File too large (max 50 MB)',
          statusDone: 'Done',
          statusError: 'Error',
        },
```

- [ ] **Step 4: Commit i18n**

```bash
git add src/lib/i18n/strings.ts
git commit -m "feat(heic): i18n strings — tools.heicKonverter DE+EN"
```

---

## Task 7: HeicKonverterTool.svelte

**Files:**
- Create: `src/components/tools/HeicKonverterTool.svelte`

- [ ] **Step 1: Create the component** (Svelte 5 runes)

See full component code in execution step below.

- [ ] **Step 2: Wire into [slug].astro**

Add import at top of frontmatter:
```typescript
import HeicKonverterTool from '../../components/tools/HeicKonverterTool.svelte';
```

Add constant near top of page script:
```typescript
const HEIC_TOOL_IDS = new Set(['heic-to-jpg', 'heic-to-png']);
```

In the `file-tool` render section, add BEFORE the generic FileTool catch-all:
```astro
{config.type === 'file-tool' && HEIC_TOOL_IDS.has(config.id) && (
  <HeicKonverterTool config={config} lang={entry.data.language as Lang} client:load />
)}
```

Update the generic FileTool condition to exclude HEIC IDs:
```astro
{config.type === 'file-tool' && config.id !== VIDEO_BG_REMOVE_TOOL_ID && config.id !== 'jpg-to-pdf' && !HEIC_TOOL_IDS.has(config.id) && (
  <FileTool config={config} lang={entry.data.language as Lang} client:load />
)}
```

- [ ] **Step 3: Commit component**

```bash
git add src/components/tools/HeicKonverterTool.svelte src/pages/[lang]/[slug].astro
git commit -m "feat(heic): HeicKonverterTool.svelte + [slug].astro routing"
```

---

## Task 8: Content Files

4 files: DE+EN for each tool.

- [ ] **Step 1: Create heic-zu-jpg/de.md** (1500+ words, 10+ FAQs)
- [ ] **Step 2: Create heic-zu-jpg/en.md**
- [ ] **Step 3: Create heic-zu-png/de.md**
- [ ] **Step 4: Create heic-zu-png/en.md**

- [ ] **Step 5: Commit content**

```bash
git add src/content/tools/heic-zu-jpg/ src/content/tools/heic-zu-png/
git commit -m "feat(heic): SEO content DE+EN for heic-zu-jpg + heic-zu-png"
```

---

## Task 9: Tests

**Files:**
- Create: `src/lib/tools/heic-konverter.test.ts`

- [ ] **Step 1: Write unit tests**

```typescript
// src/lib/tools/heic-konverter.test.ts
import { describe, it, expect } from 'vitest';
import { isHeicFile } from './heic-konverter';

describe('isHeicFile', () => {
  it('detects by MIME type', () => {
    const f = new File([], 'photo.heic', { type: 'image/heic' });
    expect(isHeicFile(f)).toBe(true);
  });
  it('detects by extension (lowercase)', () => {
    const f = new File([], 'photo.heic', { type: '' });
    expect(isHeicFile(f)).toBe(true);
  });
  it('detects .heif extension', () => {
    const f = new File([], 'photo.HEIF', { type: '' });
    expect(isHeicFile(f)).toBe(true);
  });
  it('rejects jpg', () => {
    const f = new File([], 'photo.jpg', { type: 'image/jpeg' });
    expect(isHeicFile(f)).toBe(false);
  });
});

describe('detectLivePhotos', () => {
  it('pairs heic with matching .mov', async () => {
    const { detectLivePhotos } = await import('./heic-folder-extract');
    const heic = new File([], 'IMG_0001.heic', { type: 'image/heic' });
    const mov = new File([], 'IMG_0001.mov', { type: 'video/quicktime' });
    const pairs = detectLivePhotos([heic, mov]);
    expect(pairs).toHaveLength(1);
    expect(pairs[0]!.heic.name).toBe('IMG_0001.heic');
    expect(pairs[0]!.mov?.name).toBe('IMG_0001.mov');
  });
  it('returns null mov when no pair', async () => {
    const { detectLivePhotos } = await import('./heic-folder-extract');
    const heic = new File([], 'photo.heic', { type: 'image/heic' });
    const pairs = detectLivePhotos([heic]);
    expect(pairs[0]!.mov).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run src/lib/tools/heic-konverter.test.ts
```
Expected: PASS

- [ ] **Step 3: Commit tests**

```bash
git add src/lib/tools/heic-konverter.test.ts
git commit -m "test(heic): unit tests for isHeicFile + detectLivePhotos"
```

---

## Task 10: Final Verification

- [ ] **Step 1: Full type check**

```bash
npm run check
```
Expected: 0 errors

- [ ] **Step 2: Full test suite**

```bash
npx vitest run
```
Expected: all green

- [ ] **Step 3: Update PROGRESS.md**

Add new tools to in-progress section.

- [ ] **Step 4: Final commit + push**

```bash
git add PROGRESS.md
git commit -m "docs(progress): add heic-zu-jpg + heic-zu-png to tool roster"
git push -u origin feat/heic-konverter
```
