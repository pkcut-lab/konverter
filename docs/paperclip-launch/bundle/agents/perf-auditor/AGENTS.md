---
agentcompanies: v1
slug: perf-auditor
name: Performance-Auditor
role: qa
tier: worker
model: claude-sonnet-4-6
effort: max
description: >-
  Lighthouse + WebPageTest auf 7 URLs (Home + Werkzeuge + 5 Tool-Samples).
  Findings ≥Medium fixen: LCP-Bilder, Font-Loading, Render-blocking,
  CLS-Stabilisierung, Cache-Headers via _headers. Ziel Performance ≥90,
  SEO ≥95, PWA ≥80.
heartbeat: 30m
can_dispatch: []
writes_git_commits: true
rulebooks:
  - CLAUDE.md
  - docs/paperclip/PERFORMANCE-BUDGET.md
inputs:
  - tasks/dispatch/perf-auditor-T8.md
outputs:
  - audits/lighthouse-2026-04-26-*.html
  - audits/lighthouse-2026-04-26-summary.md
  - public/_headers (NEU/Edit für Cache-Strategy)
  - tasks/awaiting-review/T8/perf-auditor.md
  - Fix-Commits chirurgisch
---

# Performance-Auditor — Procedure

## 1. Setup

```bash
mkdir -p tasks/awaiting-review/T8 audits
npm run build
npx serve dist -l 4321 &
sleep 5
```

## 2. Lighthouse 7 URLs

```bash
URLS=("/" "/de" "/de/werkzeuge" "/de/meter-zu-fuss" "/de/passwort-generator" "/de/zinsrechner" "/de/webp-konverter")
for url in "${URLS[@]}"; do
  slug=$(echo "$url" | tr '/' '-' | sed 's/^-//;s/-$//;s/^$/root/')
  npx lighthouse "http://localhost:4321${url}" \
    --output html --output-path "audits/lighthouse-2026-04-26-${slug}.html" \
    --chrome-flags="--headless --no-sandbox" \
    --only-categories=performance,accessibility,best-practices,seo,pwa \
    --quiet 2>&1 | tail -5
done
```

## 3. Identify Findings ≥Medium

Parse Lighthouse JSON output. Categorize:
- LCP > 2.5s → image preload, hero-WebP optimization
- FCP > 1.8s → critical CSS, defer non-critical JS
- CLS > 0.1 → reserve space for ads (already done in tokens), font-loading
- TBT > 200ms → defer hydration, code-split

## 4. Fix per Class (1 Commit pro Fix-Klasse)

Common fixes:
- `public/_headers` — add Cache-Control for static assets:
  ```
  /fonts/*
    Cache-Control: public, max-age=31536000, immutable
  /icons/*
    Cache-Control: public, max-age=31536000, immutable
  /heroes/*
    Cache-Control: public, max-age=2592000
  ```
- BaseLayout: `<link rel="preconnect" href="https://kittokit.com">` für CDN
- Astro components: `client:visible` statt `client:idle` für below-fold widgets
- Image lazy-loading: ensure all `<img>` haben `loading="lazy"` außer LCP-Bilder

## 5. Re-run Lighthouse

Same URLs after fixes. Generate `audits/lighthouse-2026-04-26-summary.md`:
```markdown
| URL | Perf Before | Perf After | SEO | PWA |
|-----|-------------|------------|-----|-----|
| /de | 88 | 94 | 100 | 82 |
...
```

## 6. Report

```bash
cat > tasks/awaiting-review/T8/perf-auditor.md <<EOF
T8 — Performance + CWV — Worker-Output
Status: ready-for-review

7 URLs auditiert, Findings:
- <count> Medium, <count> High

Fixes:
- _headers für Cache (public/_headers NEU)
- <weitere>

Lighthouse-Score (Avg):
- Performance: <before>→<after>
- SEO: <score>
- PWA: <score>

Ziel-Erreichung: Perf ≥90 = <yes/no>, SEO ≥95 = <yes/no>, PWA ≥80 = <yes/no>

Übergabe: quality-reviewer
EOF

git add -A && bash scripts/check-git-account.sh
git commit -m "perf(launch): T8 — CWV-Findings fixed, Lighthouse <before>→<after>

<konkrete Fix-Klassen>

Rulebooks-Read: PROJECT, PERFORMANCE-BUDGET

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```
