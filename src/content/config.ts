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
