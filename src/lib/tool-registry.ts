import type { ToolConfig } from './tools/schemas';
import { meterZuFuss } from './tools/meter-zu-fuss';

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
};

export function getToolConfig(toolId: string): ToolConfig | undefined {
  return toolRegistry[toolId];
}
