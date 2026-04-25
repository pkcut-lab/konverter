import type { FileToolConfig } from './schemas';
import { processPdfKomprimieren } from './pdf-komprimieren-runtime';

/**
 * pdf-komprimieren — PDF verlustlos optimieren (Struktur-Komprimierung).
 *
 * Differenzierung Dossier §9:
 * H1 — Before/After-Groeßen-Anzeige: Einziger Anbieter der den Unterschied
 *      direkt im UI zeigt (kein Konkurrent macht das).
 * H2 — Verlustlose Komprimierung prominent positioniert — ehrliche
 *      Kommunikation "5–25% typisch" statt leere "sicher und schnell"-Versprechen.
 * H3 — 100% client-side: Datei verlässt den Browser nie. Kein Upload, kein
 *      Server, kein Tracking (alle 10 Konkurrenten uploaden auf Server).
 *
 * Architektur-Entscheidung CEO §0.7 (2026-04-25): Option A — Lossless-only
 * via pdf-lib (MIT). Positionierung: "Struktur-Optimierung", 5–25% Reduktion.
 * pdf-lib lädt lazy on first use (Performance-Mandate §9.2 — ~500 KB chunk).
 */
export const pdfKomprimieren: FileToolConfig = {
  id: 'pdf-compress',
  type: 'file-tool',
  categoryId: 'document',
  accept: ['application/pdf', '.pdf'],
  maxSizeMb: 100,
  filenameSuffix: '.pdf',
  defaultFormat: 'pdf',
  showQuality: false,
  resetLabel: 'Neue PDF',
  process: processPdfKomprimieren,
};
