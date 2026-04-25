/**
 * Client-side lazy-load registry for comparer / validator / generator /
 * analyzer tools.
 *
 * Astro serializes island props to JSON on hydration and drops function-valued
 * config fields to null, so each specialised Svelte component resolves its
 * implementation here via the tool id.
 *
 * Lazy-load contract: every tool module lives behind `() => import()`. A tool
 * page only downloads its own implementation, not every diff/validate/generate
 * module. Static imports in this file are FORBIDDEN — they collapse the split
 * back into a single shared bundle that scales O(n) with the tool count.
 *
 * Adding a new entry requires one edit per loader map below. No other exports.
 */

export type DiffFn = (a: string, b: string) => string;
export type ValidateFn = (input: string) => boolean;
export type GenerateFn = (config?: Record<string, unknown>) => string;
export type AnalyzeFn = (input: string) => Record<string, string>;

const diffLoaders: Record<string, () => Promise<DiffFn>> = {
  'text-diff': () => import('./text-diff').then((m) => m.textDiff.diff),
  'json-diff': () => import('./json-diff').then((m) => m.jsonDiff.diff),
};

const validateLoaders: Record<string, () => Promise<ValidateFn>> = {
  'regex-tester': () => import('./regex-tester').then((m) => m.regexTester.validate),
};

const generateLoaders: Record<string, () => Promise<GenerateFn>> = {
  'uuid-generator': () => import('./uuid-generator').then((m) => m.uuidGenerator.generate),
  'password-generator': () =>
    import('./passwort-generator').then((m) => m.passwortGenerator.generate),
};

const analyzeLoaders: Record<string, () => Promise<AnalyzeFn>> = {
  'character-counter': () => import('./character-counter').then((m) => m.analyzeText),
};

export async function loadDiff(id: string): Promise<DiffFn | undefined> {
  const loader = diffLoaders[id];
  return loader ? loader() : undefined;
}
export async function loadValidate(id: string): Promise<ValidateFn | undefined> {
  const loader = validateLoaders[id];
  return loader ? loader() : undefined;
}
export async function loadGenerate(id: string): Promise<GenerateFn | undefined> {
  const loader = generateLoaders[id];
  return loader ? loader() : undefined;
}
export async function loadAnalyze(id: string): Promise<AnalyzeFn | undefined> {
  const loader = analyzeLoaders[id];
  return loader ? loader() : undefined;
}

export async function loadKiTextDetektor() {
  return import('./ki-text-detektor');
}

export async function loadKiBildDetektor() {
  return import('./ki-bild-detektor');
}

export async function loadAudioTranskription() {
  return import('./audio-transkription');
}
