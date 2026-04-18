import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { ACTIVE_LANGUAGES } from './src/lib/hreflang.ts';

export default defineConfig({
  site: 'https://konverter.pages.dev',
  trailingSlash: 'never',
  integrations: [
    svelte(),
    tailwind({ applyBaseStyles: false }),
    sitemap(),
  ],
  i18n: {
    defaultLocale: 'de',
    locales: [...ACTIVE_LANGUAGES],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  build: {
    format: 'directory',
  },
});
