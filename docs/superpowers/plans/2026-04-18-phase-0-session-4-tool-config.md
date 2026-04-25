# Phase 0 · Session 4 — Tool-Config-Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Foundation für alle künftigen Tool-Implementierungen — (a) Zod-Schemas für alle 9 Tool-Typen, (b) Slug-Map mit Round-Trip-Lookup, (c) Astro Content-Collection-Config mit separatem pure-Zod-Schema, (d) CONVENTIONS.md final statt Stub. Keine Tool-Configs, keine Converter-Komponente, keine Seiten — das ist Session 5.

**Architecture:** Split zwischen Tool-Config-Schemas (`src/lib/tools/schemas.ts`, Discriminated-Union-Zod für 9 Typen) und Content-Collection-Schema (`src/content/tools.schema.ts` pure Zod, importiert von `src/content/config.ts` via `defineCollection`). Das erlaubt pure Unit-Tests auf das Schema ohne Astro-Runtime. Slug-Map als einfache Nested-Record-Struktur mit drei Accessor-Funktionen. Result-Type `{ ok, value, error }` als Standard-Error-Handling (gelocktes Pattern für alle künftigen Parser).

**Tech Stack:** Zod 3.24.1, Astro Content Collections (astro:content), TypeScript 5.7 strict. Vitest 2.1.8 + jsdom (already configured).

**Locked Contracts aus S1-S3 (NICHT brechen):**
- `src/lib/hreflang.ts` API (`ACTIVE_LANGUAGES`, `DEFAULT_LANGUAGE`, `buildHreflangLinks`)
- `src/lib/site.ts` (`SITE_URL`)
- `BaseLayout.astro` Props `{ lang, title, description?, pathWithoutLang }`
- `trailingSlash: 'never'`

---

## File Structure

**Create:**
- `src/lib/tools/types.ts` — shared primitives (Lang, Result-Type, TOOL_TYPES, ToolType-Union)
- `src/lib/tools/schemas.ts` — Zod-Schemas für 9 Tool-Typen + Discriminated-Union + `parseToolConfig()` helper
- `src/lib/slug-map.ts` — Tool-ID↔Slug-Lookup + Reverse-Lookup + `getSupportedLangs()`
- `src/content/tools.schema.ts` — pure Zod-Schema für Tool-Content-Frontmatter (testbar ohne Astro)
- `src/content/config.ts` — Astro `defineCollection` wrapping des Schemas
- `tests/lib/tools/schemas.test.ts` — valid/invalid-Fixtures pro Tool-Typ
- `tests/lib/slug-map.test.ts` — Round-Trip + Edge-Cases
- `tests/content/tools-schema.test.ts` — valid/invalid-Fixtures für Content-Frontmatter

**Update:**
- `CONVENTIONS.md` — final statt Stub (Code-Patterns, Naming, Result-Type, Testing, Svelte-Runes-only)
- `PROGRESS.md` — Session 4 ✅, Next = Session 5

**Do not touch:** `src/lib/hreflang.ts`, `src/lib/site.ts`, `astro.config.mjs`, `vitest.config.ts`, `src/components/*`, `src/layouts/*`, `src/pages/*`, `src/styles/tokens.css`, STYLE.md, `docs/drafts/` (paralleler Prep-Branch).

---

## Task 1 — Shared Types + Result-Type

**Files:**
- Create: `src/lib/tools/types.ts`

**Rationale:** Alle anderen Module importieren aus hier. Pure types, no runtime. Gelockt um zirkuläre Abhängigkeiten zu vermeiden.

**YAGNI-Entscheidung:** Keine Branded-Types für Tool-IDs/Slugs — die würden in Phase 0 nirgends konsumiert (Dead Code). Ein `string` ist ausreichend; semantische Kennzeichnung kommt durch Zod-Regex-Validation in den Schemas.

- [ ] **Step 1.1: Write `src/lib/tools/types.ts`**

```typescript
/**
 * Shared primitives for tool configs and content.
 * Locked in Session 4 — do not change signatures without opening a new Session.
 */

import type { ActiveLanguage } from '../hreflang';
export type Lang = ActiveLanguage;

export const TOOL_TYPES = [
  'converter',
  'calculator',
  'generator',
  'formatter',
  'validator',
  'analyzer',
  'comparer',
  'file-tool',
  'interactive',
] as const;

export type ToolType = (typeof TOOL_TYPES)[number];

export type Result<T, E = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });
```

- [ ] **Step 1.2: Run `npm run check`**

Expected: 0 errors / 0 warnings / 0 hints.

- [ ] **Step 1.3: Commit**

```bash
git add src/lib/tools/types.ts
git commit -m "$(cat <<'EOF'
feat(tools): shared primitives (Lang, ToolType, Result)

Rulebooks-Read: PROJECT, CONVENTIONS
EOF
)"
```

---

## Task 2 — Zod Schemas for 9 Tool Types

**Files:**
- Create: `tests/lib/tools/schemas.test.ts` (first — TDD)
- Create: `src/lib/tools/schemas.ts`

**Rationale:** Zentrale Zod-Schemas für Tool-Configs. Discriminated Union auf `type` erlaubt Pattern-Matching im Consumer. Jeder Schema-Key ist minimal — nur was die Svelte-Komponente für ihren Typ zwingend braucht. Erweiterungen kommen in späteren Sessions (S5 = converter, S7 = file-tool).

**Schema-Shape-Entscheidungen:**
- `base` hat: id, type, categoryId, iconPrompt?
- `converter`: units{from,to}, convert, convertInverse, decimals, examples[]
- `calculator`: inputs[], compute(function-reference als unknown — wird NICHT serialisiert, nur zur Compile-Zeit genutzt), outputs[]
- `generator`: configSchema (open record), generate, defaultCount?
- `formatter`: mode ('pretty'|'minify'|'custom'), format
- `validator`: rule (string-id), validate
- `analyzer`: metrics[]
- `comparer`: diffMode ('text'|'json'|'csv'), diff
- `file-tool`: accept (mime types[]), maxSizeMb, process
- `interactive`: canvasKind ('canvas'|'svg'), exportFormats[]

Function-Fields (`convert`, `validate`, etc.) sind nicht in Markdown serialisierbar → Schema toleriert `z.function()` oder `z.any()` nur zur Config-TIME-Validation, nicht zur Content-Validation. Wir nutzen `z.function().optional()` für functional members und kommentieren das explizit.

**Pragmatischer Ansatz:** Wir modellieren **Function-Fields als `z.unknown()` mit Type-Assertion in TypeScript via `z.infer<>` + Manual-Override-Type**. Das hält das Schema klein und der Type-System-Contract bleibt präzise für Authoren. Begründung im Schema-Kommentar.

- [ ] **Step 2.1: Write the failing tests `tests/lib/tools/schemas.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import {
  converterSchema,
  calculatorSchema,
  generatorSchema,
  formatterSchema,
  validatorSchema,
  analyzerSchema,
  comparerSchema,
  fileToolSchema,
  interactiveSchema,
  toolSchema,
  parseToolConfig,
} from '../../../src/lib/tools/schemas';

const baseValid = {
  id: 'meter-to-feet',
  categoryId: 'laengen',
  iconPrompt: 'A pencil sketch of a ruler',
};

describe('converterSchema', () => {
  it('accepts a minimal valid converter', () => {
    const parsed = converterSchema.safeParse({
      ...baseValid,
      type: 'converter',
      units: { from: { id: 'm', label: 'Meter' }, to: { id: 'ft', label: 'Fuß' } },
      convert: () => 0,
      convertInverse: () => 0,
      decimals: 4,
      examples: [1, 10, 100],
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects a converter with wrong type tag', () => {
    const parsed = converterSchema.safeParse({ ...baseValid, type: 'calculator' });
    expect(parsed.success).toBe(false);
  });

  it('rejects a converter missing units', () => {
    const parsed = converterSchema.safeParse({
      ...baseValid,
      type: 'converter',
      convert: () => 0,
      convertInverse: () => 0,
      decimals: 2,
      examples: [],
    });
    expect(parsed.success).toBe(false);
  });
});

describe('calculatorSchema', () => {
  it('accepts a minimal valid calculator', () => {
    const parsed = calculatorSchema.safeParse({
      ...baseValid,
      id: 'bmi',
      type: 'calculator',
      inputs: [{ id: 'weight', label: 'Gewicht' }, { id: 'height', label: 'Größe' }],
      compute: () => ({}),
      outputs: [{ id: 'bmi', label: 'BMI' }],
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects calculator with empty inputs', () => {
    const parsed = calculatorSchema.safeParse({
      ...baseValid,
      id: 'bmi',
      type: 'calculator',
      inputs: [],
      compute: () => ({}),
      outputs: [{ id: 'x', label: 'X' }],
    });
    expect(parsed.success).toBe(false);
  });
});

describe('generatorSchema', () => {
  it('accepts a minimal valid generator', () => {
    const parsed = generatorSchema.safeParse({
      ...baseValid,
      id: 'password',
      type: 'generator',
      generate: () => '',
    });
    expect(parsed.success).toBe(true);
  });
});

describe('formatterSchema', () => {
  it('accepts a minimal valid formatter', () => {
    const parsed = formatterSchema.safeParse({
      ...baseValid,
      id: 'json-pretty',
      type: 'formatter',
      mode: 'pretty',
      format: () => '',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects formatter with invalid mode', () => {
    const parsed = formatterSchema.safeParse({
      ...baseValid,
      id: 'json-pretty',
      type: 'formatter',
      mode: 'banana',
      format: () => '',
    });
    expect(parsed.success).toBe(false);
  });
});

describe('validatorSchema', () => {
  it('accepts a minimal valid validator', () => {
    const parsed = validatorSchema.safeParse({
      ...baseValid,
      id: 'email',
      type: 'validator',
      rule: 'email',
      validate: () => true,
    });
    expect(parsed.success).toBe(true);
  });
});

describe('analyzerSchema', () => {
  it('accepts a minimal valid analyzer', () => {
    const parsed = analyzerSchema.safeParse({
      ...baseValid,
      id: 'word-count',
      type: 'analyzer',
      metrics: [{ id: 'words', label: 'Wörter' }],
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects analyzer with empty metrics', () => {
    const parsed = analyzerSchema.safeParse({
      ...baseValid,
      id: 'word-count',
      type: 'analyzer',
      metrics: [],
    });
    expect(parsed.success).toBe(false);
  });
});

describe('comparerSchema', () => {
  it('accepts a minimal valid comparer', () => {
    const parsed = comparerSchema.safeParse({
      ...baseValid,
      id: 'text-diff',
      type: 'comparer',
      diffMode: 'text',
      diff: () => '',
    });
    expect(parsed.success).toBe(true);
  });
});

describe('fileToolSchema', () => {
  it('accepts a minimal valid file-tool', () => {
    const parsed = fileToolSchema.safeParse({
      ...baseValid,
      id: 'webp-konverter',
      type: 'file-tool',
      accept: ['image/png', 'image/jpeg'],
      maxSizeMb: 10,
      process: () => new Uint8Array(),
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects file-tool with non-positive maxSizeMb', () => {
    const parsed = fileToolSchema.safeParse({
      ...baseValid,
      id: 'webp-konverter',
      type: 'file-tool',
      accept: ['image/png'],
      maxSizeMb: 0,
      process: () => new Uint8Array(),
    });
    expect(parsed.success).toBe(false);
  });
});

describe('interactiveSchema', () => {
  it('accepts a minimal valid interactive', () => {
    const parsed = interactiveSchema.safeParse({
      ...baseValid,
      id: 'svg-path-editor',
      type: 'interactive',
      canvasKind: 'svg',
      exportFormats: ['svg'],
    });
    expect(parsed.success).toBe(true);
  });
});

describe('toolSchema (discriminated union)', () => {
  it('picks the correct branch by type tag', () => {
    const r = toolSchema.safeParse({
      ...baseValid,
      type: 'converter',
      units: { from: { id: 'm', label: 'Meter' }, to: { id: 'ft', label: 'Fuß' } },
      convert: () => 0,
      convertInverse: () => 0,
      decimals: 4,
      examples: [1],
    });
    expect(r.success).toBe(true);
  });

  it('rejects an unknown type tag', () => {
    const r = toolSchema.safeParse({ ...baseValid, type: 'banana' });
    expect(r.success).toBe(false);
  });
});

describe('parseToolConfig', () => {
  it('returns ok for valid config', () => {
    const r = parseToolConfig({
      ...baseValid,
      type: 'converter',
      units: { from: { id: 'm', label: 'Meter' }, to: { id: 'ft', label: 'Fuß' } },
      convert: () => 0,
      convertInverse: () => 0,
      decimals: 4,
      examples: [1],
    });
    expect(r.ok).toBe(true);
  });

  it('returns err with readable message for invalid config', () => {
    const r = parseToolConfig({ id: 'x', type: 'banana' });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toContain('banana');
    }
  });
});
```

- [ ] **Step 2.2: Run the tests to verify they fail**

Run: `npx vitest run tests/lib/tools/schemas.test.ts`
Expected: FAIL — "Cannot find module '../../../src/lib/tools/schemas'".

- [ ] **Step 2.3: Write `src/lib/tools/schemas.ts`**

```typescript
import { z } from 'zod';
import type { Result } from './types';
import { err, ok } from './types';

/**
 * Tool-Config-Schemas (9 types).
 *
 * Design decision: function-valued fields (convert, validate, compute, ...) are
 * modelled as `z.function()`. Zod validates they are callable, but we do NOT
 * attempt to infer their signatures here — authors rely on the exported
 * TypeScript types below for compile-time checking.
 *
 * Why not `z.any()`: `z.function()` rejects non-callable runtime values, which
 * catches a whole class of typos. Why not full signature typing: Zod's function
 * schema does not generate TS types matching our intended call signatures —
 * we model those as plain TS types in `./types` and each tool file declares
 * its variable with the exact type.
 */

const idLabelPair = z.object({ id: z.string().min(1), label: z.string().min(1) });

const base = z.object({
  id: z.string().min(1),
  categoryId: z.string().min(1),
  iconPrompt: z.string().optional(),
});

export const converterSchema = base.extend({
  type: z.literal('converter'),
  units: z.object({ from: idLabelPair, to: idLabelPair }),
  convert: z.function(),
  convertInverse: z.function(),
  decimals: z.number().int().min(0).max(10),
  examples: z.array(z.number()),
});

export const calculatorSchema = base.extend({
  type: z.literal('calculator'),
  inputs: z.array(idLabelPair).min(1),
  compute: z.function(),
  outputs: z.array(idLabelPair).min(1),
});

export const generatorSchema = base.extend({
  type: z.literal('generator'),
  generate: z.function(),
  defaultCount: z.number().int().min(1).optional(),
});

export const formatterSchema = base.extend({
  type: z.literal('formatter'),
  mode: z.enum(['pretty', 'minify', 'custom']),
  format: z.function(),
});

export const validatorSchema = base.extend({
  type: z.literal('validator'),
  rule: z.string().min(1),
  validate: z.function(),
});

export const analyzerSchema = base.extend({
  type: z.literal('analyzer'),
  metrics: z.array(idLabelPair).min(1),
});

export const comparerSchema = base.extend({
  type: z.literal('comparer'),
  diffMode: z.enum(['text', 'json', 'csv']),
  diff: z.function(),
});

export const fileToolSchema = base.extend({
  type: z.literal('file-tool'),
  accept: z.array(z.string().min(1)).min(1),
  maxSizeMb: z.number().positive(),
  process: z.function(),
});

export const interactiveSchema = base.extend({
  type: z.literal('interactive'),
  canvasKind: z.enum(['canvas', 'svg']),
  exportFormats: z.array(z.string().min(1)).min(1),
});

export const toolSchema = z.discriminatedUnion('type', [
  converterSchema,
  calculatorSchema,
  generatorSchema,
  formatterSchema,
  validatorSchema,
  analyzerSchema,
  comparerSchema,
  fileToolSchema,
  interactiveSchema,
]);

/**
 * Author-facing TS types.
 * Function-fields override z.infer<>'s (...args: unknown[]) => unknown with
 * the signature the tool's Svelte component will actually call.
 * Refining later (e.g. narrower input type) is non-breaking; widening is.
 */
export type ConverterConfig = Omit<z.infer<typeof converterSchema>, 'convert' | 'convertInverse'> & {
  convert: (value: number) => number;
  convertInverse: (value: number) => number;
};

export type CalculatorConfig = Omit<z.infer<typeof calculatorSchema>, 'compute'> & {
  compute: (inputs: Record<string, number>) => Record<string, number>;
};

export type GeneratorConfig = Omit<z.infer<typeof generatorSchema>, 'generate'> & {
  generate: (config?: Record<string, unknown>) => string;
};

export type FormatterConfig = Omit<z.infer<typeof formatterSchema>, 'format'> & {
  format: (input: string) => string;
};

export type ValidatorConfig = Omit<z.infer<typeof validatorSchema>, 'validate'> & {
  validate: (input: string) => boolean;
};

export type AnalyzerConfig = z.infer<typeof analyzerSchema>;

export type ComparerConfig = Omit<z.infer<typeof comparerSchema>, 'diff'> & {
  diff: (a: string, b: string) => string;
};

export type FileToolConfig = Omit<z.infer<typeof fileToolSchema>, 'process'> & {
  process: (input: Uint8Array, config?: Record<string, unknown>) => Uint8Array | Promise<Uint8Array>;
};

export type InteractiveConfig = z.infer<typeof interactiveSchema>;

export type ToolConfig =
  | ConverterConfig
  | CalculatorConfig
  | GeneratorConfig
  | FormatterConfig
  | ValidatorConfig
  | AnalyzerConfig
  | ComparerConfig
  | FileToolConfig
  | InteractiveConfig;

export function parseToolConfig(input: unknown): Result<ToolConfig, string> {
  const r = toolSchema.safeParse(input);
  // Cast: Zod validated shape + non-function fields. Function-fields are guaranteed
  // callable via z.function(); their typed signatures come from the override types.
  if (r.success) return ok(r.data as ToolConfig);
  return err(r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; '));
}
```

- [ ] **Step 2.4: Run the tests to verify they pass**

Run: `npx vitest run tests/lib/tools/schemas.test.ts`
Expected: 19/19 PASS (3 for converter, 2 for calculator, 1 generator, 2 formatter, 1 validator, 2 analyzer, 1 comparer, 2 file-tool, 1 interactive, 2 toolSchema, 2 parseToolConfig).

- [ ] **Step 2.5: Run `npm run check`**

Expected: 0/0/0.

- [ ] **Step 2.6: Commit**

```bash
git add src/lib/tools/schemas.ts tests/lib/tools/schemas.test.ts
git commit -m "$(cat <<'EOF'
feat(tools): Zod schemas for 9 tool types + discriminated union

Each type defines the minimal contract the corresponding Svelte
component will consume. Function-valued fields use z.function()
for runtime callable-check; compile-time signatures come from
per-tool TS variable declarations. parseToolConfig() returns the
locked Result<ToolConfig, string> type.

Rulebooks-Read: PROJECT, CONVENTIONS
EOF
)"
```

---

## Task 3 — Slug Map

**Files:**
- Create: `tests/lib/slug-map.test.ts` (first — TDD)
- Create: `src/lib/slug-map.ts`

**Rationale:** Wird von `[lang]/[slug].astro` Dynamic-Route (S5) und von Hreflang-Alternates pro Tool (S5+) gebraucht. In Phase 0 ist die Map leer — erster echter Eintrag kommt in Session 5 (`meter-to-feet` → `{ de: 'meter-zu-fuss' }`). Wichtig: Round-Trip lookup (Tool-ID→Slug UND Slug→Tool-ID pro Lang).

- [ ] **Step 3.1: Write the failing tests `tests/lib/slug-map.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { slugMap, getSlug, getToolId, getSupportedLangs } from '../../src/lib/slug-map';

describe('slugMap', () => {
  it('is an object (may be empty in Phase 0)', () => {
    expect(typeof slugMap).toBe('object');
    expect(slugMap).not.toBeNull();
  });
});

describe('getSlug', () => {
  it('returns undefined for an unknown tool id', () => {
    expect(getSlug('nonexistent-tool-id', 'de')).toBeUndefined();
  });
});

describe('getToolId', () => {
  it('returns undefined for an unknown slug/lang pair', () => {
    expect(getToolId('de', 'nonexistent-slug')).toBeUndefined();
  });
});

describe('getSupportedLangs', () => {
  it('returns an empty array for an unknown tool id', () => {
    expect(getSupportedLangs('nonexistent-tool-id')).toEqual([]);
  });
});

describe('round-trip — synthetic fixture', () => {
  it('getSlug + getToolId are inverse for registered tools', () => {
    // Use real entries once slugMap has any; until then, test the property
    // by inspecting the map's current entries (works even when empty).
    for (const [toolId, perLang] of Object.entries(slugMap)) {
      for (const [lang, slug] of Object.entries(perLang)) {
        expect(getSlug(toolId, lang as 'de')).toBe(slug);
        expect(getToolId(lang as 'de', slug!)).toBe(toolId);
      }
    }
  });
});
```

- [ ] **Step 3.2: Run to verify failure**

Run: `npx vitest run tests/lib/slug-map.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3.3: Write `src/lib/slug-map.ts`**

```typescript
import type { Lang } from './tools/types';
import { ACTIVE_LANGUAGES } from './hreflang';

/**
 * Tool-ID ↔ Slug mapping per language.
 * Phase 0: empty. Session 5 adds 'meter-to-feet'. Session 7 adds 'webp-konverter'.
 *
 * Shape: { [toolId]: { [lang]: slug } }. Partial per-lang record — a tool
 * may not yet have all active-language slugs filled.
 */
export const slugMap: Record<string, Partial<Record<Lang, string>>> = {};

export function getSlug(toolId: string, lang: Lang): string | undefined {
  return slugMap[toolId]?.[lang];
}

export function getToolId(lang: Lang, slug: string): string | undefined {
  for (const [toolId, perLang] of Object.entries(slugMap)) {
    if (perLang[lang] === slug) return toolId;
  }
  return undefined;
}

export function getSupportedLangs(toolId: string): Lang[] {
  const perLang = slugMap[toolId];
  if (!perLang) return [];
  return ACTIVE_LANGUAGES.filter((l) => perLang[l] !== undefined);
}
```

- [ ] **Step 3.4: Run tests**

Run: `npx vitest run tests/lib/slug-map.test.ts`
Expected: 5/5 PASS.

- [ ] **Step 3.5: Run `npm run check`**

Expected: 0/0/0.

- [ ] **Step 3.6: Commit**

```bash
git add src/lib/slug-map.ts tests/lib/slug-map.test.ts
git commit -m "$(cat <<'EOF'
feat(i18n): slug-map with round-trip lookup (Phase 0 empty)

Tool-ID ↔ Slug pro Sprache. Round-Trip garantiert via getSlug +
getToolId Inverse-Eigenschaft (Property-Test läuft auch auf leerer
Map). Erste Einträge kommen in Session 5 (meter-to-feet) und
Session 7 (webp-konverter).

Rulebooks-Read: PROJECT, CONVENTIONS
EOF
)"
```

---

## Task 4 — Content-Collection Schema (pure Zod, testbar)

**Files:**
- Create: `tests/content/tools-schema.test.ts` (first — TDD)
- Create: `src/content/tools.schema.ts`

**Rationale:** Astro-Content-Collections erfordern ein Zod-Schema. Wir spalten das Schema aus `src/content/config.ts` in ein separates File `tools.schema.ts`, damit es pure testbar ist (kein Import von `astro:content`). `config.ts` ist dann nur ein dünner Wrapper (Task 5).

**Content-Frontmatter-Felder** (aus Spec 8.1 + 8.2):
- slug (kebab-case)
- toolId
- language (aus ACTIVE_LANGUAGES)
- title (30-60 chars)
- metaDescription (140-160 chars)
- tagline (string, 1 sentence — toleriere 1-200 chars)
- intro (40-80 Wörter; wir messen Wörter grob als Whitespace-Split)
- howToUse (3-5 strings)
- faq (4-6 Einträge à {q, a})
- relatedTools (3-5 Slugs)
- contentVersion (positive int)

- [ ] **Step 4.1: Write the failing tests `tests/content/tools-schema.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { toolContentFrontmatterSchema } from '../../src/content/tools.schema';

const valid = {
  slug: 'meter-zu-fuss',
  toolId: 'meter-to-feet',
  language: 'de' as const,
  title: 'Meter zu Fuß Konverter — Schnell & Genau',
  metaDescription:
    'Wandle Meter in Fuß um. Kostenlos, ohne Anmeldung. Präzise Umrechnung mit Formel, Tabelle und Anwendungsbeispielen für Bauwesen und Luftfahrt heute.',
  tagline: 'Präzise Längen-Umrechnung in Sekunden',
  intro:
    'Meter und Fuß sind die weltweit gebräuchlichsten Längeneinheiten. ' +
    'Dieser Konverter rechnet beide Richtungen exakt und sofort um. ' +
    'Keine Installation, keine Anmeldung nötig. Einfach eintippen.',
  howToUse: ['Wert in Meter eingeben', 'Ergebnis erscheint automatisch', 'Tausch-Button für Umkehr'],
  faq: [
    { q: 'Wie viele Fuß sind ein Meter?', a: 'Ein Meter entspricht 3,28084 Fuß.' },
    { q: 'Ist die Umrechnung exakt?', a: 'Ja, 1 Fuß = 0,3048 Meter exakt seit 1959.' },
    { q: 'Welcher Fuß?', a: 'International foot, identisch mit UK/US seit 1959.' },
    { q: 'Dezimaltrennung?', a: 'Komma deutsch, Punkt englisch.' },
  ],
  relatedTools: ['zentimeter-zu-zoll', 'kilometer-zu-meile', 'meter-zu-yard'],
  contentVersion: 1,
};

describe('toolContentFrontmatterSchema', () => {
  it('accepts a minimal valid frontmatter', () => {
    const r = toolContentFrontmatterSchema.safeParse(valid);
    expect(r.success).toBe(true);
  });

  it('rejects title shorter than 30 chars', () => {
    const r = toolContentFrontmatterSchema.safeParse({ ...valid, title: 'Zu kurz' });
    expect(r.success).toBe(false);
  });

  it('rejects title longer than 60 chars', () => {
    const r = toolContentFrontmatterSchema.safeParse({
      ...valid,
      title: 'X'.repeat(61),
    });
    expect(r.success).toBe(false);
  });

  it('rejects metaDescription outside 140-160 chars', () => {
    const tooShort = toolContentFrontmatterSchema.safeParse({ ...valid, metaDescription: 'zu kurz' });
    const tooLong = toolContentFrontmatterSchema.safeParse({ ...valid, metaDescription: 'X'.repeat(161) });
    expect(tooShort.success).toBe(false);
    expect(tooLong.success).toBe(false);
  });

  it('rejects fewer than 3 howToUse steps', () => {
    const r = toolContentFrontmatterSchema.safeParse({ ...valid, howToUse: ['a', 'b'] });
    expect(r.success).toBe(false);
  });

  it('rejects more than 5 howToUse steps', () => {
    const r = toolContentFrontmatterSchema.safeParse({
      ...valid,
      howToUse: ['a', 'b', 'c', 'd', 'e', 'f'],
    });
    expect(r.success).toBe(false);
  });

  it('rejects fewer than 4 FAQ entries', () => {
    const r = toolContentFrontmatterSchema.safeParse({ ...valid, faq: valid.faq.slice(0, 3) });
    expect(r.success).toBe(false);
  });

  it('rejects more than 6 FAQ entries', () => {
    const seven = [...valid.faq, ...valid.faq, ...valid.faq].slice(0, 7);
    const r = toolContentFrontmatterSchema.safeParse({ ...valid, faq: seven });
    expect(r.success).toBe(false);
  });

  it('rejects fewer than 3 relatedTools', () => {
    const r = toolContentFrontmatterSchema.safeParse({ ...valid, relatedTools: ['a', 'b'] });
    expect(r.success).toBe(false);
  });

  it('rejects more than 5 relatedTools', () => {
    const r = toolContentFrontmatterSchema.safeParse({
      ...valid,
      relatedTools: ['a', 'b', 'c', 'd', 'e', 'f'],
    });
    expect(r.success).toBe(false);
  });

  it('rejects language not in ACTIVE_LANGUAGES', () => {
    const r = toolContentFrontmatterSchema.safeParse({ ...valid, language: 'en' });
    expect(r.success).toBe(false);
  });

  it('rejects non-kebab-case slug', () => {
    const r = toolContentFrontmatterSchema.safeParse({ ...valid, slug: 'Meter_zu_Fuß' });
    expect(r.success).toBe(false);
  });

  it('rejects contentVersion < 1', () => {
    const r = toolContentFrontmatterSchema.safeParse({ ...valid, contentVersion: 0 });
    expect(r.success).toBe(false);
  });
});
```

- [ ] **Step 4.2: Run tests to verify failure**

Run: `npx vitest run tests/content/tools-schema.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4.3: Write `src/content/tools.schema.ts`**

```typescript
import { z } from 'zod';
import { ACTIVE_LANGUAGES } from '../lib/hreflang';

const kebabCase = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const faqEntry = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
});

/**
 * Frontmatter schema for tool content files.
 * Lives in its own module so it is unit-testable without importing astro:content.
 * src/content/config.ts wraps this with defineCollection().
 *
 * Length constraints for title/metaDescription are from Spec Section 8.1.
 * Counts for howToUse/faq/relatedTools match Spec Section 8.1.
 * Word-count for intro is NOT enforced here (warning-only per Spec 8.5);
 * content-lint script (Session 10) handles that.
 */
export const toolContentFrontmatterSchema = z.object({
  slug: z.string().regex(kebabCase, 'slug must be kebab-case ASCII'),
  toolId: z.string().min(1),
  language: z.enum(ACTIVE_LANGUAGES),
  title: z.string().min(30).max(60),
  metaDescription: z.string().min(140).max(160),
  tagline: z.string().min(1).max(200),
  intro: z.string().min(1),
  howToUse: z.array(z.string().min(1)).min(3).max(5),
  faq: z.array(faqEntry).min(4).max(6),
  relatedTools: z.array(z.string().regex(kebabCase)).min(3).max(5),
  contentVersion: z.number().int().min(1),
});

export type ToolContentFrontmatter = z.infer<typeof toolContentFrontmatterSchema>;
```

- [ ] **Step 4.4: Run tests**

Run: `npx vitest run tests/content/tools-schema.test.ts`
Expected: 13/13 PASS.

- [ ] **Step 4.5: Run `npm run check`**

Expected: 0/0/0.

- [ ] **Step 4.6: Commit**

```bash
git add src/content/tools.schema.ts tests/content/tools-schema.test.ts
git commit -m "$(cat <<'EOF'
feat(content): pure Zod frontmatter schema for tool content

Testable ohne astro:content — config.ts wrappt das Schema in
Task 5. Length/Count-Regeln aus Spec 8.1. Word-count für intro
bleibt Warning-only (Spec 8.5), kommt in Session 10 content-lint.

Rulebooks-Read: PROJECT, CONVENTIONS, CONTENT
EOF
)"
```

---

## Task 5 — Astro Content-Collection Config

**Files:**
- Create: `src/content/config.ts`

**Rationale:** Dünner Wrapper der Task-4-Schema in `defineCollection` steckt. Separat, damit der Astro-Build das Schema per Convention findet (`src/content/config.ts` oder `src/content.config.ts`). Kein eigener Test — das wird implizit durch `astro check` + Build in Step 5.3 verifiziert (Build würde sonst fehlschlagen).

- [ ] **Step 5.1: Write `src/content/config.ts`**

```typescript
import { defineCollection } from 'astro:content';
import { toolContentFrontmatterSchema } from './tools.schema';

/**
 * Astro Content Collections config.
 * Actual Markdown files live in src/content/tools/{slug}/{lang}.md
 * and are added starting in Session 5 (meter-zu-fuss).
 */
export const collections = {
  tools: defineCollection({
    type: 'content',
    schema: toolContentFrontmatterSchema,
  }),
};
```

- [ ] **Step 5.2: Run `npm run check`**

Expected: 0/0/0. (Astro sync + check should pick up the new config without errors even though no content files exist yet.)

- [ ] **Step 5.3: Run `npm run build`**

Expected: Build succeeds; the tools collection is registered but empty. 2 pages still (`/de/` + `/de/styleguide/`).

- [ ] **Step 5.4: Run full test suite**

Run: `npm test`
Expected: all previous tests pass + 19 new (schemas) + 5 new (slug-map) + 13 new (content-schema) = **106 total** (69 before + 37 new).

- [ ] **Step 5.5: Commit**

```bash
git add src/content/config.ts
git commit -m "$(cat <<'EOF'
feat(content): register tools collection with Astro Content

Dünner Wrapper — Schema lebt in ./tools.schema.ts. Collection
ist in Phase 0 leer; erste Content-Files kommen in Session 5
(meter-zu-fuss) und Session 7 (webp-konverter).

Rulebooks-Read: PROJECT, CONVENTIONS, CONTENT
EOF
)"
```

---

## Task 6 — CONVENTIONS.md final

**Files:**
- Modify: `CONVENTIONS.md` (ersetze Stub komplett)

**Rationale:** Die letzte „Stub"-Seite im Rulebook-System. Nach Session 4 ist sie gelockt. Session 6 (Prototype-Review) kann Ergänzungen machen, aber keine Breaking-Changes.

- [ ] **Step 6.1: Replace `CONVENTIONS.md` with the final version**

```markdown
# Code-Konventionen

> **Status:** Final ab Session 4. Session 6 (Prototype-Review) kann ergänzen,
> darf aber keine Signaturen ändern, die bereits in `src/` gelockt sind.

## Verbindlich ab Session 1

- **Commit-Format:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`)
- **Commit-Trailer (PFLICHT):** `Rulebooks-Read: <Liste>` (z.B. `Rulebooks-Read: PROJECT, CONVENTIONS, CONTENT`)
- **Verboten:** `any`, `@ts-ignore`, Default-Exports für Tool-Configs
- **Paths:** Relative Imports (`./`, `../`). Aliase werden NICHT benutzt, bis ein konkreter Bedarf auftaucht (YAGNI).
- **Git-Account:** `pkcut-lab` exklusiv. Pre-Commit-Hook (`scripts/check-git-account.sh`) lehnt fremde Accounts ab.

## File-Layout (gelockt Session 4)

```
src/
├── lib/
│   ├── hreflang.ts         # Phase-aware alternate-link builder
│   ├── site.ts             # SITE_URL constant
│   ├── slug-map.ts         # Tool-ID ↔ Slug pro Lang
│   └── tools/
│       ├── types.ts        # Lang, Result<T,E>, TOOL_TYPES, ToolType
│       ├── schemas.ts      # Zod-Schemas für 9 Tool-Typen + parseToolConfig()
│       └── {tool-id}.ts    # Pro Tool: Config-Export mit iconPrompt JSDoc
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   ├── ThemeToggle.svelte
│   └── tools/              # 9 generische Svelte-Komponenten (ab Session 5)
├── layouts/
│   └── BaseLayout.astro
├── content/
│   ├── config.ts           # Astro Collection-Registration (dünn)
│   ├── tools.schema.ts     # Pure Zod frontmatter schema (testbar)
│   └── tools/
│       └── {slug}/
│           └── {lang}.md   # Content pro Tool pro Sprache
├── pages/
│   ├── index.astro         # / → redirect zu /de/
│   └── [lang]/
│       ├── index.astro
│       ├── styleguide.astro
│       └── [slug].astro    # Dynamic tool route (ab Session 5)
└── styles/
    └── tokens.css
```

## Zod-Schemas (gelockt Session 4)

- Tool-Configs: `src/lib/tools/schemas.ts`. Discriminated Union auf `type`.
- Content-Frontmatter: `src/content/tools.schema.ts`. Pure Zod, testbar isoliert.
- **Function-Fields in Tool-Configs:** `z.function()` (runtime callable-check). Signatur-Typisierung via `z.infer<>` + Author-Override bei Variable-Deklaration.
- **`parseToolConfig(input: unknown): Result<ToolConfig, string>`** ist das einzige externe Entry-Point für Config-Parsing. Direkt-Import der einzelnen Schemas nur in Tests.

## Naming

- **Slugs:** kebab-case, ASCII-only (`meter-zu-fuss`, NICHT `meter-zu-fuß`). Regex: `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- **Tool-IDs:** kebab-case (sprach-neutral). Regex gleich wie Slug. Beispiel: `meter-to-feet`.
- **Category-IDs:** kebab-case (`laengen`, `farben`, `datei-konverter`).
- **TypeScript-Variablen:** camelCase (`meterZuFuss: ConverterConfig`).
- **Astro-Props-Interfaces:** PascalCase (`interface Props { ... }`).

## Result-Type (gelockt Session 4)

```typescript
export type Result<T, E = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
```

Exportiert aus `src/lib/tools/types.ts` via `ok()` / `err()` Konstruktoren. Alle Parser, Validators, File-Loader, die fehlschlagen können, geben `Result` zurück — **keine Exceptions** für erwartbare Fehler.

## Testing

- **Framework:** Vitest 2.1.8. `vitest.config.ts` gelockt (jsdom + `resolve.conditions: ['browser']`).
- **Location:** `tests/**/*.test.ts` spiegelt `src/`-Struktur.
- **Pro Zod-Schema:** mindestens 1 valid-Fixture + 1 invalid-Fixture.
- **Pro Pure-Funktion:** happy-path + mindestens 1 Edge-Case.
- **Svelte-Components:** `mount`, `unmount`, `flushSync` aus `svelte`; `client:load`-Hydration wird im jsdom-Env simuliert.
- **KEINE Astro-Runtime-Tests** in Vitest — Astro-Integration verifiziert `npm run build` + `npm run check`.

## Svelte

- **Runes-only** (`$state`, `$derived`, `$effect`). Kein `writable`/`readable` aus `svelte/store`.
- **Hydration:** `client:load` für alles mit Theme/Locale-Abhängigkeit (Flash-Prevention, Section 5.2 Spec). `client:idle` nur nach expliziter Spec-Referenz.
- **Props:** TypeScript-Interface `interface Props { ... }`, via `let { foo }: Props = $props()` destructured.

## CSS

- **Tailwind Utility-First** in Astro/Svelte-Markup.
- **Custom-CSS** NUR in `src/styles/tokens.css` und direkt in `<style>`-Blöcken von Komponenten (scoped).
- **Neue Tokens:** IMMER in beiden `:root`-Blöcken (light + dark) pflegen. Contrast ≥ 7:1 (WCAG AAA).
- **Hex-Codes außerhalb tokens.css verboten** — immer `var(--color-*)` / `var(--space-*)` / etc.

## Commit-Disziplin (Karpathy-Prinzipien aus CLAUDE.md)

- **Ein Commit = ein logisches Stück.** Keine Mix-Commits (`fix X + refactor Y`).
- **Kein opportunistisches Refactoring** während Bug-Fixes.
- **GitHub Flow:** ein Tool / eine Tool-Familie pro Branch.
- **Session-Ende:** `PROGRESS.md` updaten + Commit mit Trailer + stop.

## Build-Gates

- `npm run build` muss grün sein vor Commit
- `npm test` muss grün sein vor Commit
- `npm run check` muss 0/0/0 sein vor Commit
- `bash scripts/check-git-account.sh` ist pflicht — Pre-Commit-Hook erzwingt es automatisch
```

- [ ] **Step 6.2: Run `npm run check` + `npm test`**

Expected: beides grün, unverändert zu Task 5.

- [ ] **Step 6.3: Commit**

```bash
git add CONVENTIONS.md
git commit -m "$(cat <<'EOF'
docs(rulebook): CONVENTIONS.md final (replaces Session 1 stub)

Lockt File-Layout, Zod-Schema-Pattern, Result-Type, Naming,
Testing-Regeln, Svelte-Runes-only, CSS-Tailwind-Utility-first,
Commit-Disziplin. Session 6 kann ergänzen, aber keine
Signaturen brechen.

Rulebooks-Read: PROJECT, CONVENTIONS
EOF
)"
```

---

## Task 7 — PROGRESS.md + Session-Close Memory

**Files:**
- Modify: `PROGRESS.md`
- Create: `C:\Users\carin\.claude\projects\c--Users-carin--gemini-Konverter-Webseite\memory\project_session_4_tool_config_complete.md`
- Modify: `C:\Users\carin\.claude\projects\c--Users-carin--gemini-Konverter-Webseite\memory\MEMORY.md`

- [ ] **Step 7.1: Update PROGRESS.md**

Set:
- `Letztes Update: 2026-04-18 (Session 4, End)`
- `Current Session: #4 — Tool-Config-Foundation ✅`
- Table-Row Session 4 → ✅ done
- Next-Session-Plan → Session 5 Meter-zu-Fuß Prototype (beschreibe Dateien aus phase-0-foundation.md:1080-1085)

- [ ] **Step 7.2: Write session-close memory**

Create `project_session_4_tool_config_complete.md`. Include: Deliverables (Files + Tests), Locked-Contracts für Session 5+, Deferred to later sessions, „How to apply" für Session 5-Start.

- [ ] **Step 7.3: Add entry to MEMORY.md**

Append one line (format matching existing entries).

- [ ] **Step 7.4: Run full verification**

```bash
npm run check   # 0/0/0
npm test        # 106/106 green
npm run build   # 2 pages built
bash scripts/check-git-account.sh   # green
```

- [ ] **Step 7.5: Commit PROGRESS.md**

```bash
git add PROGRESS.md
git commit -m "$(cat <<'EOF'
docs(progress): Session 4 Tool-Config-Foundation complete

Rulebooks-Read: PROJECT, CONVENTIONS
EOF
)"
```

- [ ] **Step 7.6: Push**

```bash
git push origin main
```

Verify: CI green. Branch `docs/meter-zu-fuss-prep` (paralleler Prep-Agent) unberührt.

---

## Verification Checklist (End of Session)

- [ ] 7 Commits landen auf `main` (Task 1-7)
- [ ] `npm test` = 106/106 (69 vorher + 37 neu)
- [ ] `npm run build` = 2 pages, collection `tools` registriert aber leer
- [ ] `npm run check` = 0/0/0
- [ ] `CONVENTIONS.md` hat keinen „Stub"-Status mehr
- [ ] `PROGRESS.md` zeigt Session 4 ✅ und Next = Session 5
- [ ] Memory aktualisiert (1 neue Datei + 1 Zeile in MEMORY.md)
- [ ] `docs/meter-zu-fuss-prep` Branch (Prep-Agent) noch nicht gemerged — das macht der User vor Session 5
