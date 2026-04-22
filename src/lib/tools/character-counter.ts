import type { AnalyzerConfig } from './schemas';

/**
 * Character counter (Zeichenzähler) — pure client-side text analysis.
 * Counts characters (with/without spaces), words, sentences, paragraphs,
 * lines, and estimates reading time calibrated for German (250 wpm).
 */

const WORDS_PER_MINUTE_DE = 250;

export function analyzeText(input: string): Record<string, string> {
  const chars = input.length;
  const charsNoSpaces = input.replace(/\s/g, '').length;
  const words = input.trim() === '' ? 0 : input.trim().split(/\s+/).length;
  const sentences =
    input.trim() === '' ? 0 : (input.match(/[.!?]+(\s|$)/g) ?? []).length || (words > 0 ? 1 : 0);
  const paragraphs =
    input.trim() === ''
      ? 0
      : input
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter((p) => p.length > 0).length;
  const lines = input === '' ? 0 : input.split(/\r\n|\r|\n/).length;

  const minutes = words / WORDS_PER_MINUTE_DE;
  let readingTime: string;
  if (words === 0) {
    readingTime = '0 Sek.';
  } else if (minutes < 1) {
    readingTime = `${Math.max(1, Math.round(minutes * 60))} Sek.`;
  } else {
    readingTime = `${Math.round(minutes)} Min.`;
  }

  return {
    chars: String(chars),
    'chars-no-spaces': String(charsNoSpaces),
    words: String(words),
    sentences: String(sentences),
    paragraphs: String(paragraphs),
    lines: String(lines),
    'reading-time': readingTime,
  };
}

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
  placeholder: 'Text hier einfügen — Zeichen, Wörter und Lesezeit werden live gezählt.',
};
