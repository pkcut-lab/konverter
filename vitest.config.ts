import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const astroContentStub = fileURLToPath(new URL('./tests/stubs/astro-content.ts', import.meta.url));

export default defineConfig({
  // vitePreprocess with script:true uses esbuild to strip TS types from
  // <script lang="ts"> before Svelte compiles. Without it, esrap fails on
  // interface/type declarations during HMR-less test compilation.
  plugins: [
    svelte({ hot: false, preprocess: vitePreprocess({ script: true, style: false }) }),
    // Virtual `astro:content` has no resolver outside Astro's build. Tests
    // supply real behavior via `vi.mock('astro:content', …)`; this plugin
    // only satisfies vite's import-analysis by redirecting to a stub file.
    {
      name: 'vitest-stub-astro-content',
      enforce: 'pre' as const,
      resolveId(id: string) {
        if (id === 'astro:content') return astroContentStub;
        return null;
      },
    },
  ],
  resolve: {
    conditions: ['browser'],
  },
  test: {
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    environment: 'jsdom',
  },
});
