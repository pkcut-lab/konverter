import { z } from 'zod';
import { ACTIVE_LANGUAGES } from '../lib/hreflang';
import { TOOL_CATEGORIES } from '../lib/tools/categories';

const kebabCase = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const faqEntry = z.object({
  q: z.string().min(1),
  a: z.string().min(1),
});

const asideStep = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

const kbdHint = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
});

const statEntry = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  unit: z.string().optional(),
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
/**
 * Optional editorial H1 in HTML form. Allows exactly ONE `<em>…</em>` inside
 * the title for italic-accent emphasis (see DESIGN.md §4 Italic-Accent-H1).
 * Used ONLY for visible rendering — meta/title/JSON-LD always use plain `title`.
 */
const headingHtmlSchema = z
  .string()
  .min(1)
  .refine((s) => (s.match(/<em>/g) ?? []).length <= 1, {
    message: 'headingHtml darf maximal ein <em>…</em> enthalten (Refined-Minimalism).',
  })
  .refine((s) => !/<(?!\/?em\b)[^>]+>/i.test(s), {
    message: 'headingHtml erlaubt nur <em>…</em> — kein anderes HTML.',
  });

export const toolContentFrontmatterSchema = z.object({
  toolId: z.string().min(1),
  language: z.enum(ACTIVE_LANGUAGES),
  title: z.string().min(30).max(60),
  /** Optional short label above H1 (e.g., "KONVERTER", "BILD-TOOL"). */
  eyebrow: z.string().min(1).max(24).optional(),
  /** Optional editorial H1 with up to one <em>; falls back to plain `title`. */
  headingHtml: headingHtmlSchema.optional(),
  // metaDescription max: 220 covers the full visible-snippet range Google
  // shows on desktop SERPs (~155–160 chars usually, longer on rich results).
  // Bumped from 160 → 220 to fit content-rich tools where the value-prop
  // doesn't compress below 180 chars (HEIC-Konverter's "Einzelbilder, Batch
  // und ganze Ordner. iPhone-Fotos sofort öffnen." trailer adds 35 chars).
  metaDescription: z.string().min(140).max(220),
  tagline: z.string().min(1).max(200),
  intro: z.string().min(1),
  howToUse: z.array(z.string().min(1)).min(3).max(5),
  // faq max: 12 covers the deep-content tier (HEIC, video-bg-remove, audio
  // tools) where users have a long tail of distinct concerns. The previous
  // max-6 forced cutting genuine user questions; FAQPage JSON-LD does not
  // penalise length, only relevance — content-lint can catch padding later.
  faq: z.array(faqEntry).min(4).max(12),
  relatedTools: z.array(z.string().regex(kebabCase)).min(0).max(5),
  /**
   * Flache Kategorie. Treibt das Category-Fallback in `resolveRelatedToolsWithFallback`.
   * Required seit C3 — alle Content-Files müssen eine Kategorie setzen.
   */
  category: z.enum(TOOL_CATEGORIES),
  aside: z
    .object({
      steps: z.array(asideStep).length(3),
      privacy: z.string().min(1),
    })
    .optional(),
  kbdHints: z.array(kbdHint).min(1).max(4).optional(),
  stats: z.array(statEntry).min(1).max(6).optional(),
  featureList: z.array(z.string().min(1)).min(1).max(8).optional(),
  contentVersion: z.number().int().min(1),
  datePublished: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateModified: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type ToolContentFrontmatter = z.infer<typeof toolContentFrontmatterSchema>;
