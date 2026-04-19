import { defineConfig } from 'vitest/config';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  // vitePreprocess with script:true uses esbuild to strip TS types from
  // <script lang="ts"> before Svelte compiles. Without it, esrap fails on
  // interface/type declarations during HMR-less test compilation.
  plugins: [svelte({ hot: false, preprocess: vitePreprocess({ script: true, style: false }) })],
  resolve: {
    conditions: ['browser'],
  },
  test: {
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    environment: 'jsdom',
  },
});
