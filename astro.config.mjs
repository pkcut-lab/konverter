import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import AstroPWA from '@vite-pwa/astro';
import { ACTIVE_LANGUAGES } from './src/lib/hreflang.ts';

export default defineConfig({
  // Production domain. Flip to https://kittokit.com once Cloudflare DNS is live.
  // Until then the CF Pages preview URL is used (update when Pages project is created).
  site: 'https://kittokit.com',
  trailingSlash: 'never',
  integrations: [
    svelte({ preprocess: vitePreprocess({ script: true, style: false }) }),
    tailwind({ applyBaseStyles: false }),
    sitemap({
      // T3.5 — Sitemap-Refinement: priority + changefreq per URL type.
      // lastmod wired from frontmatter.dateModified once Sprint-1 migration runs;
      // until then the plugin default (build time) is used.
      serialize(item) {
        const url = item.url;

        // TODO(phase-3): the (de|en) regex group below is hardcoded.
        // Generate it from ACTIVE_LANGUAGES.join('|') so new languages
        // get the priority boost automatically. Same for the
        // (de/werkzeuge|en/tools) group — should derive from
        // STATIC_PAGE_SLUGS in src/lib/static-page-slugs.ts.
        // See CONVENTIONS.md section 11.

        // Home pages: /de  /en
        if (/\/(de|en)\/?$/.test(url)) {
          return { ...item, priority: 1.0, changefreq: 'weekly' };
        }
        // Tools index: /de/werkzeuge  /en/tools
        if (/\/(de\/werkzeuge|en\/tools)\/?$/.test(url)) {
          return { ...item, priority: 0.9, changefreq: 'weekly' };
        }
        // Legal / static: datenschutz, impressum, privacy, imprint, ueber, about, security-policy
        if (/datenschutz|impressum|privacy|imprint|ueber|about|security/.test(url)) {
          return { ...item, priority: 0.5, changefreq: 'yearly' };
        }
        // Tool pages (all others under /de/* or /en/*)
        return { ...item, priority: 0.8, changefreq: 'monthly' };
      },
    }),
    AstroPWA({
      registerType: 'autoUpdate',
      // We ship `manifest.webmanifest` manually so the build tests can pin
      // its fields; the plugin just points `<link rel="manifest">` at the
      // same file instead of generating its own.
      manifest: false,
      manifestFilename: 'manifest.webmanifest',
      workbox: {
        // Precache the build output that Astro emits (HTML + JS + CSS +
        // hashed assets). runtimeCaching handles everything else.
        globPatterns: ['**/*.{html,css,js,woff2,svg,png,webp,webmanifest}'],
        // Skip the Transformers.js bundle (540 KB) and heic2any chunk
        // (1.3 MB) — they lazy-load only when needed, no point precaching
        // them for every visitor.
        globIgnores: [
          '**/FileTool.*.js',
          '**/heic2any.*.js',
          '**/onnx*.js',
          '**/*.wasm',
        ],
        // SW update flow: claim clients + skipWaiting so autoUpdate works
        // without the user needing a second refresh.
        clientsClaim: true,
        skipWaiting: true,
        // The default 2 MB limit would drop the sitemap + a handful of
        // generated chunks in Phase 1 as tool count grows.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            // Hugging Face CDN — model weights for BG-Remover. Cache-first
            // with long expiration because these immutable artifacts never
            // change per version.
            urlPattern: /^https:\/\/(?:huggingface\.co|cdn-lfs\.huggingface\.co)\/.*$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'hf-model-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\/pagefind\/.*$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'pagefind-index' },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  i18n: {
    defaultLocale: 'de',
    locales: [...ACTIVE_LANGUAGES],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  build: {
    format: 'directory',
    // 'auto' (default) inlines CSS bundles under Astro's internal threshold
    // (~4 KB). Keeps the default explicit so reviewers know it was evaluated.
    // 'always' was tested but would inline ~15–20 KB of scoped tool-page CSS,
    // increasing HTML size without meaningful FCP gain (single origin, H2).
    inlineStylesheets: 'auto',
  },
  vite: {
    worker: {
      // ES-module workers are required for the video-bg-remove worker to
      // dynamically import @huggingface/transformers + mediabunny chunks.
      // Default 'iife' rejects code-splitting (Rollup error
      // "UMD and IIFE output formats are not supported for code-splitting").
      format: 'es',
    },
  },
});
