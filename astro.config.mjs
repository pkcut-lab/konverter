import { defineConfig } from 'astro/config';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import svelte from '@astrojs/svelte';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import AstroPWA from '@vite-pwa/astro';
import { ACTIVE_LANGUAGES } from './src/lib/hreflang.ts';
import { slugMap } from './src/lib/slug-map.ts';

// Build a reverse lookup: { '/de/<slug>': toolId, '/en/<slug>': toolId } so
// the sitemap serialize() callback can resolve a URL back to its toolId in
// O(1) and emit hreflang alternates for every active language. Doing this
// once at config-load time avoids re-walking slug-map per item.
// Audit P0-4: per-tool xhtml:link emission (2026-04-27).
const URL_TO_TOOL_ID = new Map();
for (const [toolId, perLang] of Object.entries(slugMap)) {
  for (const [lang, slug] of Object.entries(perLang)) {
    if (typeof slug === 'string') URL_TO_TOOL_ID.set(`/${lang}/${slug}`, toolId);
  }
}
const SITE_URL = 'https://kittokit.com';

// Build a URL → frontmatter.dateModified map by scanning every content file
// at config-load. Sync I/O is fine here — config runs once at build start
// and there are <500 markdown files. Audit P1-C (2026-04-27): without this
// the sitemap emitted a single build-time lastmod for every page, which
// Google interprets as constant churn and distrusts.
const URL_TO_DATE_MODIFIED = new Map();
const CONTENT_TOOLS = join(process.cwd(), 'src', 'content', 'tools');
function readDateModified(filePath) {
  try {
    const txt = readFileSync(filePath, 'utf-8');
    const m = txt.match(/^---\s*([\s\S]*?)\s*---/);
    if (!m) return null;
    const fm = m[1] ?? '';
    const dm = fm.match(/^dateModified:\s*['"]?([0-9]{4}-[0-9]{2}-[0-9]{2})['"]?/m);
    return dm ? dm[1] : null;
  } catch {
    return null;
  }
}
if (existsSync(CONTENT_TOOLS)) {
  for (const tool of readdirSync(CONTENT_TOOLS)) {
    for (const lang of ACTIVE_LANGUAGES) {
      const f = join(CONTENT_TOOLS, tool, `${lang}.md`);
      if (!existsSync(f)) continue;
      const date = readDateModified(f);
      if (!date) continue;
      // Resolve to URL via slug-map: tool dir name === DE slug for legacy
      // tools, but EN slug differs. Walk slug-map to find toolId for this
      // dir (matches DE slug in most cases) and resolve.
      let toolId;
      for (const [tid, perLang] of Object.entries(slugMap)) {
        if (perLang.de === tool || perLang.en === tool) { toolId = tid; break; }
      }
      if (!toolId) continue;
      const slug = slugMap[toolId][lang];
      if (typeof slug === 'string') {
        URL_TO_DATE_MODIFIED.set(`/${lang}/${slug}`, date);
      }
    }
  }
}
function buildToolAlternates(toolId) {
  const entries = [];
  const perLang = slugMap[toolId];
  if (!perLang) return entries;
  for (const lang of ACTIVE_LANGUAGES) {
    const slug = perLang[lang];
    if (typeof slug === 'string') {
      entries.push({ lang, url: `${SITE_URL}/${lang}/${slug}` });
    }
  }
  return entries;
}

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
      // 2026-04-27: filter raised to drop dev-only routes (styleguide) so they
      // never leak into the public sitemap. Page itself is also `noindex={true}`.
      filter: (page) => !/\/styleguide(?:\/|$)/.test(page),
      // i18n alternates per item — emits <xhtml:link rel="alternate"> entries
      // for every active language inside each <url>. The plugin's built-in
      // i18n option needs identical slugs across locales, but our per-tool
      // slug-map is allowed to differ per language (e.g. meter-zu-fuss vs
      // meter-to-feet). So we compute alternates manually inside `serialize`.
      // Audit P0-4 (2026-04-27).
      i18n: {
        defaultLocale: 'en',
        locales: { de: 'de', en: 'en' },
      },
      serialize(item) {
        const url = item.url;

        // Resolve URL back to toolId so we can emit hreflang alternates that
        // correctly map per-language slugs (meter-zu-fuss ↔ meter-to-feet).
        // The leading site-origin needs stripping first.
        const path = url.replace(SITE_URL, '').replace(/\/$/, '');
        const toolId = URL_TO_TOOL_ID.get(path);
        const alternates = toolId ? buildToolAlternates(toolId) : [];
        // lastmod from frontmatter.dateModified — preserves Google's freshness
        // signal so unchanged pages aren't constantly re-flagged. Audit P1-C.
        const lastmod = URL_TO_DATE_MODIFIED.get(path);

        // Audit P1-P (2026-04-27): regexes below previously hardcoded (de|en).
        // Now derived from ACTIVE_LANGUAGES so future locales (es/fr/pt-br)
        // get the priority + changefreq classification automatically.
        const langGroup = ACTIVE_LANGUAGES.join('|');
        const homeRe = new RegExp(`/(?:${langGroup})/?$`);
        // Tools-index slugs are 'werkzeuge' (de) + 'tools' (en) for now —
        // hardcoded here because static-page-slugs.ts needs an async import
        // path that doesn't fit the sync config-load contract. The pattern
        // tolerates new tools-index slugs without code changes — re-add to
        // the alternation when adding a new language.
        const toolsIndexRe = /\/(?:de\/werkzeuge|en\/tools)\/?$/;
        // Sitemap plugin shape: each link is { url, lang } and gets emitted
        // as <xhtml:link rel="alternate" hreflang="<lang>" href="<url>">.
        // Plus an x-default mirror of the default-language entry.
        const defaultLangEntry = alternates.find((a) => a.lang === 'en');
        const links = alternates.length
          ? [
              ...alternates,
              ...(defaultLangEntry
                ? [{ lang: 'x-default', url: defaultLangEntry.url }]
                : []),
            ]
          : undefined;

        // Home pages: /de  /en (and any future locale prefix).
        if (homeRe.test(url)) {
          return { ...item, priority: 1.0, changefreq: 'weekly' };
        }
        // Tools index: /de/werkzeuge  /en/tools
        if (toolsIndexRe.test(url)) {
          return { ...item, priority: 0.9, changefreq: 'weekly' };
        }
        // Legal / static: datenschutz, impressum, privacy, imprint, ueber, about, security-policy
        if (/datenschutz|impressum|privacy|imprint|ueber|about|security/.test(url)) {
          return { ...item, priority: 0.5, changefreq: 'yearly' };
        }
        // Tool pages (all others under /de/* or /en/*)
        return {
          ...item,
          priority: 0.8,
          changefreq: 'monthly',
          ...(links && { links }),
          ...(lastmod && { lastmod: new Date(`${lastmod}T00:00:00Z`) }),
        };
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
        // Skip root index.html: it's the unstyled CF-Functions fallback
        // (src/pages/index.astro). Precaching it makes the SW serve that
        // bare HTML on every repeat visit to /, causing a meta-refresh
        // flash before the CF Function 302 can fire. Pattern is root-only
        // (no '**/' prefix) so dist/de/index.html, dist/en/index.html and
        // every tool page stay precached.
        globIgnores: [
          'index.html',
          '**/FileTool.*.js',
          '**/heic2any.*.js',
          '**/onnx*.js',
          '**/*.wasm',
        ],
        // No App-Shell fallback. Default in @vite-pwa/astro is '/', which
        // would call createHandlerBoundToURL('/') and throw at install
        // because we just dropped '/' from the precache. Disabling means
        // unknown navigations fall through to the network — fine for an
        // MPA where every real route is individually precached.
        navigateFallback: null,
        // SW update flow: claim clients + skipWaiting so autoUpdate works
        // without the user needing a second refresh.
        clientsClaim: true,
        skipWaiting: true,
        // The default 2 MB limit would drop the sitemap + a handful of
        // generated chunks in Phase 1 as tool count grows.
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          // No HF rule. Transformers.js v4 maintains its own `CacheStorage`
          // bucket (`transformers-cache`) with `useBrowserCache: true`
          // semantics — adding a Workbox CacheFirst layer on top of that
          // double-caches every model file (230 MB for `quality`, 438 MB
          // for `pro`) and intercepts the cross-origin 302 from
          // `huggingface.co` → `*.xethub.hf.co` in ways that swallowed
          // failures as `no-response` during the XetHub-CSP block. Letting
          // Transformers.js own model caching keeps storage usage halved
          // and the redirect path SW-transparent.
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
