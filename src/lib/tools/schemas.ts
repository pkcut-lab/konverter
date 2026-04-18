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
  const base = r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
  // Append the received type value so callers can identify which tool type failed.
  const receivedType =
    input !== null && typeof input === 'object' && 'type' in input
      ? ` (received type: "${String((input as Record<string, unknown>).type)}")`
      : '';
  return err(base + receivedType);
}
