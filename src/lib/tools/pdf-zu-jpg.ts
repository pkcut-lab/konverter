import type { FormatterConfig } from './schemas';

/**
 * pdf-zu-jpg — PDF in JPG-Bilder konvertieren (client-side via PDF.js).
 *
 * Differenzierung Dossier §9:
 * H1 — Client-Side als einziger echter Datenschutz-Beweis im DE-Markt.
 *      9/9 Konkurrenten uploaden auf Server — kittokit läuft komplett im Browser.
 *      Keyword-Gap: "pdf jpg konverter ohne upload" unbesetzt (§6).
 * H2 — Seiten-Auswahl per visuelles Vorschau-Grid mit Checkbox-Selektion.
 *      Nur 2/9 Konkurrenten bieten irgendeine Seitenauswahl (§2).
 * H3 — 300 DPI kostenlos + erklärter DPI-Unterschied.
 *      Mehrheit sperrt 300 DPI hinter Paywall; kein Konkurrent erklärt DPI visuell (§3).
 *
 * Tool-Type formatter mit mode: 'custom' — alle Render-/Export-Logik läuft in
 * PdfZuJpgTool.svelte. PDF.js wird lazy per dynamic import geladen (Performance-
 * Mandate §9.2 — pdfjs-dist ist >900 KB).
 */
export const pdfZuJpg: FormatterConfig = {
  id: 'pdf-to-jpg',
  type: 'formatter',
  categoryId: 'document',
  mode: 'custom',
  format: (t: string) => t,
};
