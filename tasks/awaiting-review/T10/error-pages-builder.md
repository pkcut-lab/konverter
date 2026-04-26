T10 — Error-Pages + Sitemap + robots — Worker-Output
Status: ready-for-review

NEU:
- src/pages/404.astro — lang-aware (de/en) via Astro.currentLocale ?? preferredLocale
- src/pages/500.astro — lang-aware, reload button statt CTA-Link

Validation:
- Build: exit 0, 155 pages built
- Sitemap: 153 URLs, sitemap-index.xml + sitemap-0.xml both valid
  - /de + /en: 72 tools each = 144 tool pages
  - /de/home + /en/home + 4 legal + 2 werkzeuge + /de/styleguide
  - No hreflang in sitemap-0.xml (expected — @astrojs/sitemap without i18n customization; hreflang is in <head> of each page)
  - Sitemap path: https://kittokit.com/sitemap-index.xml ✓
- robots.txt: AI-Crawler-Allow confirmed (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, + 9 more)
- robots.txt Sitemap-Pfad: https://kittokit.com/sitemap-index.xml ✓
- llms-full.txt: 72 tools — synced mit slug-map (72 tool IDs × 2 langs)
- llms.txt: korrekt (keine tool-by-tool URLs, high-level description)

Übergabe: quality-reviewer
