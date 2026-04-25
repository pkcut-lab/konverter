import type { FormatterConfig } from './schemas';

export const pdfZusammenfuehren: FormatterConfig = {
  id: 'pdf-merge',
  type: 'formatter',
  categoryId: 'document',
  mode: 'custom',
  // format is a no-op placeholder; all processing happens in PdfZusammenfuehrenTool.svelte
  // using pdf-lib (MIT) loaded via dynamic import per Performance-Mandate §9.1.
  format: (t: string) => t,
};
