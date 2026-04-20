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

/**
 * Converter formula as pure data — must cross the Astro Islands JSON boundary
 * intact. Functions can NOT: Astro serialises props as JSON and strips them to
 * null. `linear` covers m↔ft, km↔mi, kg↔lb, etc. (~95% of converters).
 * `affine` covers °C↔°F, °C↔K. Extend with `power` (m²↔ft²) when needed.
 */
export const formulaSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('linear'), factor: z.number() }),
  z.object({
    type: z.literal('affine'),
    factor: z.number(),
    offset: z.number(),
  }),
]);

export const converterSchema = base.extend({
  type: z.literal('converter'),
  units: z.object({ from: idLabelPair, to: idLabelPair }),
  formula: formulaSchema,
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

export const toggleVisibleIfSchema = z.enum(['source-gt-1080p']);

export const fileToolToggleSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  visibleIf: toggleVisibleIfSchema.optional(),
});

export const fileToolPresetsSchema = z.object({
  id: z.string().min(1),
  options: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        /** Optional mono sub-label shown beside the main label in the segmented pill (e.g. "CRF 18 · größte Datei"). */
        subLabel: z.string().min(1).optional(),
      }),
    )
    .min(2),
  default: z.string().min(1),
});

export const fileToolSchema = base.extend({
  type: z.literal('file-tool'),
  accept: z.array(z.string().min(1)).min(1),
  maxSizeMb: z.number().positive(),
  process: z.function(),
  prepare: z.function().optional(),
  defaultFormat: z.string().min(1).optional(),
  cameraCapture: z.boolean().optional(),
  filenameSuffix: z.string().optional(),
  showQuality: z.boolean().optional(),
  toggles: z.array(fileToolToggleSchema).optional(),
  presets: fileToolPresetsSchema.optional(),
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
 * Most configs infer directly from Zod. The remaining function-valued fields
 * (calculator.compute, generator.generate, formatter.format, validator.validate,
 * comparer.diff, file-tool.process) override z.infer<>'s (...args: unknown[])
 * => unknown with the signature the tool's Svelte component will actually call.
 * Converter is pure data now (see formulaSchema) so no override needed.
 */
export type ConverterFormula = z.infer<typeof formulaSchema>;
export type ConverterConfig = z.infer<typeof converterSchema>;

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

export type FileToolToggle = z.infer<typeof fileToolToggleSchema>;
export type FileToolPresets = z.infer<typeof fileToolPresetsSchema>;

export type FileToolConfig = Omit<z.infer<typeof fileToolSchema>, 'process' | 'prepare'> & {
  process: (
    input: Uint8Array,
    config?: Record<string, unknown>,
    onProgress?: (progress: number) => void,
  ) => Uint8Array | Promise<Uint8Array>;
  prepare?: (onProgress: (e: { loaded: number; total: number }) => void) => Promise<void>;
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
  // Cast: Zod validated shape. Remaining function-valued fields on non-converter
  // tools are guaranteed callable via z.function(); their typed signatures come
  // from the override types above.
  if (r.success) return ok(r.data as ToolConfig);
  const base = r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  // Append the received type value so callers can identify which tool type failed.
  const receivedType =
    input !== null && typeof input === 'object' && 'type' in input
      ? ` (received type: "${String((input as Record<string, unknown>).type)}")`
      : '';
  return err(base + receivedType);
}
