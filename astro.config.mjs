import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

const SUPPORTED_LANGUAGES = ['de'];

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
    locales: SUPPORTED_LANGUAGES,
    routing: {
      prefixDefaultLocale: true,
    },
  },
  build: {
    format: 'directory',
  },
});
