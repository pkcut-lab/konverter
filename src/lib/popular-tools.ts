import type { Lang } from './tools/types';

/**
 * Curated "popular tools" list for the header Beliebt-Bar.
 *
 * Order matters — it's the display order in the bar. Phase 1 is hand-curated;
 * Phase 2 (AdSense + Analytics) will replace this with pageview-driven ranking.
 *
 * Each entry uses the toolId (not the slug) so the Header.astro can resolve
 * the correct language-slug via slug-map.ts at render time.
 */
interface PopularTool {
  toolId: string;
  /** Short tab label shown in the bar. Kept short (≤20 chars) so all tabs fit.
   *  Map keyed by ISO-2 language code. Phase 1 is DE-only; more keys get added
   *  as language branches activate (see ACTIVE_LANGUAGES in hreflang.ts). */
  label: Partial<Record<Lang, string>>;
}

export const POPULAR_TOOLS: PopularTool[] = [
  { toolId: 'hevc-to-h264',          label: { de: 'iPhone-Video → MP4',    en: 'iPhone Video → MP4' } },
  { toolId: 'remove-background',     label: { de: 'Hintergrund entfernen', en: 'Background Remover' } },
  { toolId: 'png-jpg-to-webp',       label: { de: 'PNG/JPG → WebP',        en: 'PNG/JPG → WebP' } },
  { toolId: 'meter-to-feet',         label: { de: 'Meter → Fuß',           en: 'Meters → Feet' } },
  { toolId: 'celsius-to-fahrenheit', label: { de: 'Celsius → Fahrenheit',  en: 'Celsius → °F' } },
  { toolId: 'km-to-mile',            label: { de: 'km → Meilen',           en: 'km → Miles' } },
];
