import { defineCollection } from 'astro:content';
import { toolContentFrontmatterSchema } from './tools.schema';

/**
 * Astro Content Collections config.
 * Actual Markdown files live in src/content/tools/{slug}/{lang}.md
 * and are added starting in Session 5 (meter-zu-fuss).
 */
// Zod-cast: Astro 5 bundles zod 3.25.76, our package.json locks 3.24.1 (PROJECT.md).
// Under `exactOptionalPropertyTypes: true` the two ZodErrorMap types diverge — the
// schema is structurally identical at runtime but not assignable across instances.
// Upgrade-Regel (PROJECT.md) requires a dedicated bump branch; cast stays until then.
type AstroSchema = Parameters<typeof defineCollection>[0] extends { schema?: infer S }
  ? NonNullable<S>
  : never;

export const collections = {
  tools: defineCollection({
    type: 'content',
    schema: toolContentFrontmatterSchema as unknown as AstroSchema,
  }),
};
