import { processWebp } from './process-webp';

/**
 * Client-side dispatch table for FileTool processors.
 *
 * Why a separate registry: Astro serializes island props to JSON during SSR.
 * Functions on the tool config (e.g. `FileToolConfig.process`) are dropped to
 * `null` on the client — they survive only on the server. The FileTool
 * component therefore looks up its processor by `config.id` from this table,
 * which is plain ES-module imports the bundler can include.
 *
 * Adding a new file-tool requires three edits:
 *   1. Add the pure processor module under `src/lib/tools/`
 *   2. Add the tool config to `src/lib/tool-registry.ts`
 *   3. Add the dispatch entry below
 */
export type ProcessFn = (
  input: Uint8Array,
  config?: Record<string, unknown>,
) => Uint8Array | Promise<Uint8Array>;

export const processRegistry: Record<string, ProcessFn> = {
  'png-jpg-to-webp': (input, config) =>
    processWebp(input, {
      quality: typeof config?.quality === 'number' ? config.quality : 85,
    }),
};

export function getProcessor(toolId: string): ProcessFn | undefined {
  return processRegistry[toolId];
}
