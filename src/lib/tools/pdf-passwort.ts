import type { FormatterConfig } from './schemas';

/**
 * pdf-passwort — PDF Passwortschutz entfernen (Entsperren).
 *
 * Phase 1: Decrypt-only. Kein qpdf.wasm — zero new deps.
 * CEO §0.7 Arch-Pivot 2026-04-26.
 *
 * Differenzierung Dossier §9:
 * H1 — Client-Side-Processing: Kein Upload, kein Server, kein Tracking.
 *       Kein Top-7-Konkurrent bietet das an — alle sind server-basiert.
 * H3 — Transparente Security-Kommunikation: Output ist rasterisiert,
 *       wird klar kommuniziert. Nutzer wissen, was sie bekommen.
 *
 * Technisches Verfahren (Phase 1):
 *   pdfjs-dist lädt verschlüsselte PDF mit Passwort →
 *   Seiten werden auf OffscreenCanvas bei 150 DPI gerendert →
 *   pdf-lib verpackt JPEG-Frames als neue passwortfreie PDF.
 *
 * Phase 2 (zukünftig): Verschlüsseln via @cantoo/pdf-lib oder qpdf-wasm,
 * sobald eine stabile MIT/LGPL-konforme Browser-Encrypt-Library verfügbar ist.
 */
export const pdfPasswort: FormatterConfig = {
  id: 'pdf-password',
  type: 'formatter',
  categoryId: 'document',
  mode: 'custom',
  format: (t: string) => t,
};
