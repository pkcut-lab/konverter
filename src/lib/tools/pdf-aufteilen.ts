import type { FormatterConfig } from './schemas';

/**
 * pdf-aufteilen — PDF in mehrere Teildokumente aufteilen.
 *
 * Differenzierung Dossier §9:
 * H1 — Client-Side (kein Upload) als einziger DE-Markt-Anbieter.
 *      Alle 6 Hauptkonkurrenten (PDF24, Sejda, iLovePDF, Smallpdf, PDF2Go,
 *      SodaPDF) uploaden auf Server.
 * H2 — Keine künstlichen Limits — Browser-RAM ist die einzige Grenze.
 *      Konkurrenten haben 50 MB / 50 Seiten / 3-Tasks-pro-Stunde-Limits.
 *
 * Tool-Type formatter mit `format` als no-op Placeholder — die echte
 * Page-Range-Parsing- und Split-Logic läuft im Custom-Component
 * `PdfAufteilenTool.svelte` mit pdf-lib lazy-imported.
 */
export const pdfAufteilen: FormatterConfig = {
  id: 'pdf-split',
  type: 'formatter',
  categoryId: 'document',
  mode: 'custom',
  format: (t: string) => t,
};
