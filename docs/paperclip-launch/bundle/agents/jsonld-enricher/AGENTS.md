---
agentcompanies: v1
slug: jsonld-enricher
name: JSON-LD-Enricher
role: worker
tier: worker
model: claude-sonnet-4-6
effort: max
description: >-
  Erweitert pro Tool-Page strukturierte Daten. Type-Mapping je tool.type:
  Converter→SoftwareApplication+HowTo, Calculator→SoftwareApplication+offers,
  Generator→SoftwareApplication+featureList, Formatter/Validator/Analyzer→
  WebApplication, FileTool→SoftwareApplication+fileFormat. Plus BreadcrumbList
  + (wenn ≥3 Q-A) FAQPage. Validation gegen schema.org.
heartbeat: 30m
can_dispatch: []
writes_git_commits: true
rulebooks:
  - CLAUDE.md
  - docs/paperclip/SEO-GEO-GUIDE.md
  - docs/superpowers/research/2026-04-26-seo-geo-deep-research.md
inputs:
  - tasks/dispatch/jsonld-enricher-T7.md
  - src/lib/tool-registry.ts (Tool-Type-Mapping)
  - src/lib/slug-map.ts (alle 72 Tool-Slugs)
outputs:
  - src/lib/seo/json-ld.ts (NEU — Builder-Functions)
  - src/pages/[lang]/[slug].astro (Edit: inject JSON-LD)
  - tasks/awaiting-review/T7/jsonld-enricher.md
---

# JSON-LD-Enricher — Procedure

## 1. Setup + Read State

```bash
mkdir -p tasks/awaiting-review/T7
cat src/lib/tool-registry.ts | head -100
cat src/lib/slug-map.ts | head -50
# T3 hat bereits Organization + WebSite gemacht — checken in BaseLayout.astro
grep -n "application/ld+json" src/layouts/BaseLayout.astro
grep -n "application/ld+json" src/pages/\[lang\]/\[slug\].astro
```

## 2. Build src/lib/seo/json-ld.ts

```typescript
import type { Lang } from '../tools/types';

export interface ToolMeta {
  toolId: string;
  slug: string;
  lang: Lang;
  type: 'converter' | 'calculator' | 'generator' | 'formatter' | 'validator' | 'analyzer' | 'comparer' | 'file-tool';
  name: string;
  description: string;
  url: string;
  category?: string;
  faqs?: Array<{ q: string; a: string }>;
}

const SITE = 'https://kittokit.com'; // adjust via .env in future
const ORG_NAME = 'kittokit';

export function softwareApplicationLd(t: ToolMeta) {
  return {
    '@context': 'https://schema.org',
    '@type': t.type === 'file-tool' ? 'SoftwareApplication' : (['formatter','validator','analyzer','comparer'].includes(t.type) ? 'WebApplication' : 'SoftwareApplication'),
    name: t.name,
    description: t.description,
    url: t.url,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    inLanguage: t.lang === 'de' ? 'de-DE' : 'en-US',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    publisher: { '@type': 'Organization', name: ORG_NAME, url: SITE },
  };
}

export function breadcrumbLd(t: ToolMeta) {
  const labels = t.lang === 'de' ? { home: 'Start', tools: 'Werkzeuge' } : { home: 'Home', tools: 'Tools' };
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: labels.home, item: `${SITE}/${t.lang}` },
      { '@type': 'ListItem', position: 2, name: labels.tools, item: `${SITE}/${t.lang}/werkzeuge` },
      { '@type': 'ListItem', position: 3, name: t.name, item: t.url },
    ],
  };
}

export function howToLd(t: ToolMeta, steps: string[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: t.lang === 'de' ? `So nutzt du ${t.name}` : `How to use ${t.name}`,
    description: t.description,
    inLanguage: t.lang === 'de' ? 'de-DE' : 'en-US',
    step: steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, text: s })),
  };
}

export function faqLd(t: ToolMeta) {
  if (!t.faqs || t.faqs.length < 3) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: t.lang === 'de' ? 'de-DE' : 'en-US',
    mainEntity: t.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

export function buildAllToolLd(t: ToolMeta, opts?: { howToSteps?: string[] }) {
  const blocks: object[] = [softwareApplicationLd(t), breadcrumbLd(t)];
  if (['converter', 'calculator', 'generator'].includes(t.type) && opts?.howToSteps?.length) {
    blocks.push(howToLd(t, opts.howToSteps));
  }
  const faq = faqLd(t);
  if (faq) blocks.push(faq);
  return blocks;
}
```

## 3. Inject in [slug].astro

Edit `src/pages/[lang]/[slug].astro`:
- Import `buildAllToolLd` from `~/lib/seo/json-ld`
- Resolve tool meta from registry + content
- Render `<script type="application/ld+json" set:html={JSON.stringify(block)} />` per block

NICHT die existing Organization/WebSite-Blöcke in BaseLayout.astro duplizieren — die sind bereits da seit T3.

## 4. Validate

```bash
npm run build
# Pick 3 sample tools
for slug in meter-zu-fuss webp-konverter passwort-generator; do
  html=$(cat dist/de/$slug/index.html 2>/dev/null)
  echo "=== $slug ==="
  echo "$html" | grep -c "application/ld+json"  # erwarte ≥4 (Org + Site + SoftApp + Breadcrumb)
done
```

## 5. Report

```bash
cat > tasks/awaiting-review/T7/jsonld-enricher.md <<EOF
T7 — JSON-LD per Tool — Worker-Output
Status: ready-for-review

Dateien:
- src/lib/seo/json-ld.ts (NEU)
- src/pages/[lang]/[slug].astro (Edit)

Coverage: 72 Tools × {SoftwareApplication, BreadcrumbList} + Subset HowTo + FAQ

Verifikation:
- Build: 75 pages (DE+EN)
- Spot-Check 3 Tools: ≥4 JSON-LD-Blöcke pro Page bestätigt
- npm run check: 0/0/0
- vitest: <count> pass

Übergabe: quality-reviewer
EOF

git add -A && bash scripts/check-git-account.sh
git commit -m "feat(seo): T7 — per-tool JSON-LD (SoftwareApp/Web + Breadcrumb + HowTo + FAQ)

Builder-Functions in src/lib/seo/json-ld.ts mit Type-Mapping.
[slug].astro injiziert pro Tool die passenden Schema-Blöcke.
Organization/WebSite-Blocks aus T3 bleiben unangetastet.

Rulebooks-Read: PROJECT, CONVENTIONS, SEO-GEO-GUIDE

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```
