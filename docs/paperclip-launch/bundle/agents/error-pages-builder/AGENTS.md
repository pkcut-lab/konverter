---
agentcompanies: v1
slug: error-pages-builder
name: Error-Pages-Builder
role: worker
tier: worker
model: claude-sonnet-4-6
effort: max
description: >-
  Erstellt 404 + 500 Error-Pages (DE+EN), validiert Astro-Sitemap-Output,
  erweitert robots.txt-Sanity (T3 hat AI-Crawler bereits gemacht), prüft
  llms.txt-Konsistenz mit aktuellem Tool-Inventory.
heartbeat: 30m
can_dispatch: []
writes_git_commits: true
rulebooks:
  - CLAUDE.md
  - DESIGN.md
inputs:
  - tasks/dispatch/error-pages-builder-T10.md
outputs:
  - src/pages/404.astro (NEU)
  - src/pages/500.astro (NEU)
  - src/pages/de/404.astro + src/pages/en/404.astro (lang-specific)
  - public/robots.txt (sanity-check + edits)
  - public/llms.txt (sync mit aktuellem slug-map)
  - tasks/awaiting-review/T10/error-pages-builder.md
---

# Error-Pages-Builder — Procedure

## 1. Setup

```bash
mkdir -p tasks/awaiting-review/T10
cat public/robots.txt | head -30  # was hat T3 schon?
ls src/pages/ | grep -E "404|500"  # existing?
```

## 2. 404 + 500 Pages (top-level Fallback)

```astro
---
// src/pages/404.astro — top-level Fallback (Astro detect lang via Accept-Language → middleware redirects)
import BaseLayout from '../layouts/BaseLayout.astro';
const lang = (Astro.preferredLocale ?? 'de') as 'de' | 'en';
const t = lang === 'de'
  ? { title: '404 — Seite nicht gefunden', heading: 'Diese Seite gibt es nicht.', body: 'Vielleicht findest du was du suchst in unseren Werkzeugen.', cta: 'Zu den Werkzeugen', back: 'Zur Startseite' }
  : { title: '404 — Page not found', heading: 'This page does not exist.', body: 'Maybe what you are looking for is in our tools.', cta: 'Browse tools', back: 'Back home' };
---
<BaseLayout lang={lang} title={t.title} pathWithoutLang="/404">
  <main class="error-page">
    <p class="eyebrow">404</p>
    <h1>{t.heading}</h1>
    <p class="body">{t.body}</p>
    <div class="actions">
      <a class="primary" href={`/${lang}/werkzeuge`}>{t.cta}</a>
      <a class="ghost" href={`/${lang}`}>{t.back}</a>
    </div>
  </main>
</BaseLayout>

<style>
  .error-page { max-width: 32rem; margin: var(--space-16) auto; text-align: center; }
  .eyebrow { font-family: var(--font-family-mono); font-size: var(--font-size-xs); color: var(--color-text-subtle); text-transform: uppercase; margin: 0 0 var(--space-4); }
  h1 { font-size: var(--font-size-h1); margin: 0 0 var(--space-4); }
  .body { color: var(--color-text-muted); margin: 0 0 var(--space-8); }
  .actions { display: flex; gap: var(--space-4); justify-content: center; }
  .primary { background: var(--color-text); color: var(--color-bg); padding: var(--space-3) var(--space-6); border-radius: var(--r-sm); text-decoration: none; }
  .ghost { color: var(--color-text-muted); padding: var(--space-3) var(--space-6); border: 1px solid var(--color-border); border-radius: var(--r-sm); text-decoration: none; }
</style>
```

500.astro analog mit anderem Text + Reload-Button.

## 3. Sitemap Validation

```bash
npm run build
# Astro sitemap output check
ls dist/sitemap*.xml
xmllint --noout dist/sitemap-index.xml && echo "sitemap-index valid"
xmllint --noout dist/sitemap-0.xml && echo "sitemap-0 valid"
# Anzahl URLs
grep -c "<loc>" dist/sitemap-0.xml  # erwarte ~144 (72 DE + 72 EN)
# hreflang in jedem URL?
grep -c "xhtml:link" dist/sitemap-0.xml
```

## 4. robots.txt Sanity (T3-Erweiterung verify)

```bash
# Verify AI-Crawler allow + Sitemap-Pfad
grep -E "GPTBot|ClaudeBot|PerplexityBot|Google-Extended" public/robots.txt
grep -E "^Sitemap:" public/robots.txt
# Falls Sitemap-Pfad falsch (z.B. konverter-7qc.pages.dev statt kittokit.com): patch
```

## 5. llms.txt Sync

```bash
# llms.txt aus T3 muss aktuelle Tool-Liste reflecten
# Vergleiche mit slug-map.ts current state
node scripts/llms-txt-sync.mjs  # ggf neu schreiben falls abweichung
```

## 6. Report

```bash
cat > tasks/awaiting-review/T10/error-pages-builder.md <<EOF
T10 — Error-Pages + Sitemap + robots — Worker-Output
Status: ready-for-review

NEU:
- src/pages/404.astro
- src/pages/500.astro

Validation:
- Sitemap: <N> URLs, hreflang on all, valid XML
- robots.txt: AI-Crawler-Allow confirmed, Sitemap-Pfad: <path>
- llms.txt: synced mit slug-map (72 Tools)

Übergabe: quality-reviewer
EOF

git add -A && bash scripts/check-git-account.sh
git commit -m "feat(launch): T10 — 404/500 + sitemap-/robots-/llms-validation

Refined-Minimalism Error-Pages, lang-detection via Astro.preferredLocale.
Sitemap-Output verified, robots.txt sanity, llms.txt synced.

Rulebooks-Read: PROJECT, DESIGN

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```
