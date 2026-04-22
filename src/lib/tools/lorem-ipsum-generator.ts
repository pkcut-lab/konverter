import type { FormatterConfig } from './schemas';

/**
 * Lorem Ipsum Generator — generates placeholder text in Latin or German.
 * Pure client-side, no server contact.
 *
 * Input format (typed into the Formatter textarea):
 *   "[count] [unit] [variant]"
 *
 * Defaults: 3 paragraphs latin
 *
 * Examples:
 *   "5 absätze deutsch"  → 5 German paragraphs with umlauts
 *   "10 sätze latein"    → 10 Latin sentences
 *   "20 wörter"          → 20 Latin words
 *   "3"                  → 3 Latin paragraphs (default unit + variant)
 *   ""                   → error (empty input)
 *
 * Output includes a statistics line at the end:
 *   "--- Statistik: X Wörter · Y Zeichen ---"
 */

// Classic Lorem Ipsum word pool (shuffled during generation)
const LATIN_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing',
  'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore',
  'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam',
  'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi',
  'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure',
  'in', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'fugiat',
  'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat',
  'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt',
  'mollit', 'anim', 'id', 'est', 'laborum', 'praesent', 'semper',
  'feugiat', 'nibh', 'euismod', 'fermentum', 'posuere', 'urna', 'nec',
  'tincidunt', 'praesent', 'blandit', 'facilisis', 'leo', 'donec',
  'pretium', 'vulputate', 'sapien', 'nec', 'sagittis', 'aliquam',
  'malesuada', 'bibendum', 'arcu', 'vitae', 'elementum', 'curabitur',
  'gravida', 'massa', 'eget', 'laoreet', 'suspendisse', 'interdum',
  'pellentesque', 'habitant', 'morbi', 'tristique', 'senectus',
];

// German blind text word pool with umlauts (ä, ö, ü, ß)
const GERMAN_WORDS = [
  'blindtext', 'platzhalter', 'überall', 'können', 'größe', 'natürlich',
  'gemäß', 'straße', 'schließen', 'öffnen', 'prüfen', 'führen',
  'genügt', 'tatsächlich', 'grundsätzlich', 'ungefähr', 'zuverlässig',
  'verfügbar', 'gewöhnlich', 'völlig', 'dafür', 'einführung', 'erklärung',
  'berücksichtigen', 'außerdem', 'selbstverständlich', 'nämlich',
  'regelmäßig', 'vollständig', 'übersicht', 'veröffentlichen',
  'lösung', 'ausführen', 'müssen', 'dürfen', 'wählen', 'bereits',
  'schüler', 'hören', 'würde', 'küche', 'möglich', 'änderung',
  'beträgt', 'ähnlich', 'fähigkeit', 'stärke', 'größte', 'nächste',
  'früher', 'später', 'häufig', 'öfter', 'büro', 'glück',
  'wörter', 'sätze', 'absätze', 'zeichen', 'schriftgröße',
  'textlänge', 'darstellung', 'entwurf', 'gestaltung', 'schriftart',
  'layout', 'vorlage', 'website', 'anwendung', 'entwicklung',
  'möglichkeit', 'oberfläche', 'benutzer', 'eingabe', 'ausgabe',
  'ergebnis', 'berechnung', 'umwandlung', 'formatierung', 'werkzeug',
  'funktion', 'eigenschaft', 'beispiel', 'aufgabe', 'anforderung',
  'umsetzung', 'abschnitt', 'überschrift', 'inhalt', 'seite',
];

/** Simple seeded pseudo-random for deterministic-per-call but varied output. */
function shuffleArray<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Pick N words from the pool, cycling through shuffled copies as needed. */
export function pickWords(pool: readonly string[], count: number): string[] {
  const result: string[] = [];
  let shuffled = shuffleArray(pool);
  let idx = 0;
  for (let i = 0; i < count; i++) {
    if (idx >= shuffled.length) {
      shuffled = shuffleArray(pool);
      idx = 0;
    }
    result.push(shuffled[idx]);
    idx++;
  }
  return result;
}

/** Build a single sentence from the word pool (5–15 words). */
export function buildSentence(pool: readonly string[]): string {
  const len = 5 + Math.floor(Math.random() * 11); // 5–15
  const words = pickWords(pool, len);
  // Capitalize first word
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(' ') + '.';
}

/** Build a paragraph (3–6 sentences). */
export function buildParagraph(pool: readonly string[]): string {
  const sentenceCount = 3 + Math.floor(Math.random() * 4); // 3–6
  const sentences: string[] = [];
  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(buildSentence(pool));
  }
  return sentences.join(' ');
}

type OutputUnit = 'paragraphs' | 'sentences' | 'words';
type Variant = 'latin' | 'german';

interface ParsedInput {
  count: number;
  unit: OutputUnit;
  variant: Variant;
}

/** Parse the user input string into structured generation parameters. */
export function parseInput(raw: string): ParsedInput {
  const trimmed = raw.trim().toLowerCase();

  if (trimmed === '') {
    throw new Error('Bitte Anzahl und Einheit eingeben, z. B. „5 absätze deutsch" oder „10 sätze latein".');
  }

  // Default values
  let count = 3;
  let unit: OutputUnit = 'paragraphs';
  let variant: Variant = 'latin';

  // Extract number
  const numMatch = trimmed.match(/(\d+)/);
  if (numMatch) {
    count = parseInt(numMatch[1], 10);
  } else {
    throw new Error(
      'Keine Zahl erkannt. Bitte eine Zahl eingeben, z. B. „5 absätze" oder „20 wörter".',
    );
  }

  // Validate range
  if (count < 1 || count > 50) {
    throw new Error('Anzahl muss zwischen 1 und 50 liegen.');
  }

  // Detect unit
  if (/abs[aä]tz|paragraph/i.test(trimmed)) {
    unit = 'paragraphs';
  } else if (/s[aä]tz|sentence/i.test(trimmed)) {
    unit = 'sentences';
  } else if (/w[oö]rt|word/i.test(trimmed)) {
    unit = 'words';
  }
  // else: default to paragraphs

  // Detect variant
  if (/deutsch|german|de\b/i.test(trimmed)) {
    variant = 'german';
  } else if (/latein|latin|la\b/i.test(trimmed)) {
    variant = 'latin';
  }
  // else: default to latin

  return { count, unit, variant };
}

/** Generate Lorem Ipsum text based on parsed parameters. */
export function generate(params: ParsedInput): string {
  const pool = params.variant === 'german' ? GERMAN_WORDS : LATIN_WORDS;

  let text: string;
  switch (params.unit) {
    case 'paragraphs': {
      const paragraphs: string[] = [];
      for (let i = 0; i < params.count; i++) {
        paragraphs.push(buildParagraph(pool));
      }
      text = paragraphs.join('\n\n');
      break;
    }
    case 'sentences': {
      const sentences: string[] = [];
      for (let i = 0; i < params.count; i++) {
        sentences.push(buildSentence(pool));
      }
      text = sentences.join(' ');
      break;
    }
    case 'words': {
      const words = pickWords(pool, params.count);
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
      text = words.join(' ');
      break;
    }
  }

  // Append live statistics
  const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
  const charCount = text.length;
  const stats = `\n\n--- Statistik: ${wordCount} Wörter · ${charCount} Zeichen ---`;

  return text + stats;
}

/**
 * Format function for FormatterConfig.
 * Parses input string and generates Lorem Ipsum text.
 */
function generateLoremIpsum(input: string): string {
  const params = parseInput(input);
  return generate(params);
}

export const loremIpsumGenerator: FormatterConfig = {
  id: 'lorem-ipsum-generator',
  type: 'formatter',
  categoryId: 'text',
  mode: 'custom',
  format: generateLoremIpsum,
  placeholder:
    'Anzahl + Einheit + Variante, z. B.:\n5 absätze deutsch\n10 sätze latein\n20 wörter',
};
