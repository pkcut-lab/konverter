import type { AnalyzerConfig } from './schemas';

/**
 * Character counter (Zeichenzähler) — pure client-side text analysis.
 * Counts characters (with/without spaces), words, sentences, paragraphs,
 * lines, and estimates reading time calibrated for German (250 wpm).
 */

export const characterCounter: AnalyzerConfig = {
  id: 'character-counter',
  type: 'analyzer',
  categoryId: 'text',
  metrics: [
    { id: 'chars', label: 'Zeichen' },
    { id: 'chars-no-spaces', label: 'Zeichen (ohne Leerzeichen)' },
    { id: 'words', label: 'Wörter' },
    { id: 'sentences', label: 'Sätze' },
    { id: 'paragraphs', label: 'Absätze' },
    { id: 'lines', label: 'Zeilen' },
    { id: 'reading-time', label: 'Lesezeit' },
  ],
};
