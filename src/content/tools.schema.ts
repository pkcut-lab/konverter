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
 * NOTE: Astro 5 reserves the frontmatter key `slug` as a special URL-override and
 * strips it from data before schema validation. We therefore do NOT declare a
 * `slug` field here; the directory path + `src/lib/slug-map.ts` are authoritative.
 * Length constraints for title/metaDescription are from Spec Section 8.1.
 * Counts for howToUse/faq/relatedTools match Spec Section 8.1.
 * Word-count for intro is NOT enforced here (warning-only per Spec 8.5);
 * content-lint script (Session 10) handles that.
 */
export const toolContentFrontmatterSchema = z.object({
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
