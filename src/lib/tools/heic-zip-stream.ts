import { downloadZip } from 'client-zip';

export interface ZipEntry {
  name: string;
  bytes: Uint8Array;
}

/** Creates a ZIP blob from converted files. JPG/PNG are already compressed — no Deflate needed. */
export async function createZipBlob(entries: ZipEntry[]): Promise<Blob> {
  const files = entries.map((e) => ({
    name: e.name,
    input: e.bytes,
    lastModified: new Date(),
  }));
  const response = downloadZip(files);
  return response.blob();
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
