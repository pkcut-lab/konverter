import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: false })],
  resolve: {
    conditions: ['browser'],
  },
  test: {
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    environment: 'jsdom',
  },
});
