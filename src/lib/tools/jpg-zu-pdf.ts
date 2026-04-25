import type { FileToolConfig } from './schemas';
import { processJpgToPdf } from './jpg-zu-pdf-runtime';

/**
 * jpg-zu-pdf — Bilder (JPEG / PNG / WebP) zu PDF konvertieren.
 *
 * Differenzierung Dossier §9:
 * H1 — Zero-Upload als einziger DSGVO-by-design-Anbieter im DE-Markt
 *      (alle 7 Hauptkonkurrenten uploaden auf Server)
 * H2 — Lossless JPEG-Einbettung via PDF 1.4 DCTDecode-Filter (kein
 *      Re-Encoding bei JPEG-Input)
 * H3 — Mobile-First für Bewerbungsfotos / Behördendokumente
 *
 * Pure client-side: PDF-Bytes werden im Browser erzeugt, niemand
 * uploadet die Datei. PNG/WebP werden via OffscreenCanvas zu JPEG
 * re-encoded vor dem Embed.
 */
export const jpgZuPdf: FileToolConfig = {
  id: 'jpg-to-pdf',
  type: 'file-tool',
  categoryId: 'document',
  accept: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxSizeMb: 25,
  filenameSuffix: '.pdf',
  defaultFormat: 'pdf',
  showQuality: false,
  cameraCapture: true,
  process: processJpgToPdf,
};
