const HEIC_EXTS = new Set(['.heic', '.heif']);

function getExt(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i).toLowerCase() : '';
}

async function entryToFile(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => entry.file(resolve, reject));
}

async function walkEntry(entry: FileSystemEntry): Promise<File[]> {
  if (entry.isFile) {
    const f = await entryToFile(entry as FileSystemFileEntry);
    return HEIC_EXTS.has(getExt(f.name)) ? [f] : [];
  }
  if (entry.isDirectory) {
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    const all: File[] = [];
    // readEntries returns at most 100 entries per call — must loop until empty
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

/** Extract all HEIC files from a DataTransfer drop, including recursive folders. */
export async function extractHeicFromDrop(dataTransfer: DataTransfer): Promise<File[]> {
  const files: File[] = [];

  if (dataTransfer.items && dataTransfer.items.length > 0) {
    const entries: FileSystemEntry[] = [];
    for (let i = 0; i < dataTransfer.items.length; i++) {
      const item = dataTransfer.items[i]!;
      const entry = item.webkitGetAsEntry?.();
      if (entry) {
        entries.push(entry);
      } else if (item.kind === 'file') {
        const f = item.getAsFile();
        if (f && HEIC_EXTS.has(getExt(f.name))) files.push(f);
      }
    }
    for (const entry of entries) {
      const sub = await walkEntry(entry);
      files.push(...sub);
    }
    return files;
  }

  for (let i = 0; i < dataTransfer.files.length; i++) {
    const f = dataTransfer.files[i]!;
    if (HEIC_EXTS.has(getExt(f.name))) files.push(f);
  }
  return files;
}

export interface LivePhotoPair {
  heic: File;
  mov: File | null;
}

/** Detect Live Photo pairs by matching base filenames (IMG_0001.heic ↔ IMG_0001.mov). */
export function detectLivePhotos(files: File[]): LivePhotoPair[] {
  const movByBase = new Map<string, File>();
  const heicFiles: File[] = [];

  for (const f of files) {
    const e = getExt(f.name);
    const base = f.name.slice(0, f.name.lastIndexOf('.')).toLowerCase();
    if (e === '.mov') movByBase.set(base, f);
    else if (HEIC_EXTS.has(e)) heicFiles.push(f);
  }

  return heicFiles.map((heic) => {
    const base = heic.name.slice(0, heic.name.lastIndexOf('.')).toLowerCase();
    return { heic, mov: movByBase.get(base) ?? null };
  });
}
