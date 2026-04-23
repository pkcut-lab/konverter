/**
 * Flache Taxonomie für Tool-Kategorisierung. Treibt das Category-Fallback
 * in `resolveRelatedToolsWithFallback` — wenn ein Tool zu wenige auflösbare
 * explicit-relatedTools hat, werden Same-Category-Geschwister alphabetisch
 * aufgefüllt. Reservierte Werte sind Absicht: spätere Tool-Additions lösen
 * keine Taxonomie-Migration aus.
 */
export const TOOL_CATEGORIES = [
  'length',
  'weight',
  'area',
  'volume',
  'distance',
  'temperature',
  'image',
  'video',
  'audio',
  'document',
  'text',
  'dev',
  'color',
  'time',
  'finance',
  'construction',
  'math',
  'health',
  'science',
  'engineering',
  'sport',
  'automotive',
  'education',
  'agriculture',
] as const;

export type ToolCategory = (typeof TOOL_CATEGORIES)[number];
