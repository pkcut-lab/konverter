import type { ToolConfig } from './tools/schemas';
import { meterZuFuss } from './tools/meter-zu-fuss';
import { pngJpgToWebp } from './tools/png-jpg-to-webp';
import { hintergrundEntferner } from './tools/hintergrund-entferner';
import { zentimeterZuZoll } from './tools/zentimeter-zu-zoll';
import { kilometerZuMeilen } from './tools/kilometer-zu-meilen';
import { kilogrammZuPfund } from './tools/kilogramm-zu-pfund';
import { celsiusZuFahrenheit } from './tools/celsius-zu-fahrenheit';
import { quadratmeterZuQuadratfuss } from './tools/quadratmeter-zu-quadratfuss';

/**
 * Single source of truth for tool configurations.
 *
 * Adding a new tool requires two edits:
 *   1. Add an entry to this registry (`toolId` → config import)
 *   2. Add matching entries to `src/lib/slug-map.ts` for every language
 *
 * The dynamic route at `src/pages/[lang]/[slug].astro` reads from this
 * registry to resolve `toolId` → runtime config.
 */
export const toolRegistry: Record<string, ToolConfig> = {
  'meter-to-feet': meterZuFuss,
  'png-jpg-to-webp': pngJpgToWebp,
  'remove-background': hintergrundEntferner,
  'cm-to-inch': zentimeterZuZoll,
  'km-to-mile': kilometerZuMeilen,
  'kg-to-lb': kilogrammZuPfund,
  'celsius-to-fahrenheit': celsiusZuFahrenheit,
  'sqm-to-sqft': quadratmeterZuQuadratfuss,
};

export function getToolConfig(toolId: string): ToolConfig | undefined {
  return toolRegistry[toolId];
}
