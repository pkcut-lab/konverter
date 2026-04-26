---
agentcompanies: v1
slug: og-image-generator
name: OG-Image-Generator
role: worker
tier: worker
model: claude-sonnet-4-6
effort: max
description: >-
  Generiert Open-Graph Cards (1200×630) für jedes Tool via Sharp/SVG. Brand-
  konsistent: dunkler BG, kittokit-Logo links oben (< | <), Tool-Name groß
  zentriert, Kategorie als Mono-Eyebrow. Audit Brand-Asset-Konsistenz
  (favicon/PWA-Icons/manifest).
heartbeat: 30m
can_dispatch: []
writes_git_commits: true
rulebooks:
  - CLAUDE.md
  - DESIGN.md
inputs:
  - tasks/dispatch/og-image-generator-T12.md
  - public/icon.svg (Brand-Mark)
  - src/lib/tool-registry.ts (alle Tools mit Kategorien)
outputs:
  - scripts/generate-og-cards.mjs (NEU)
  - public/og/tools/<toolId>.webp (72 Files)
  - src/pages/[lang]/[slug].astro (Edit: per-tool og:image-Tag)
  - audits/2026-04-26-brand-asset-audit.md
  - tasks/awaiting-review/T12/og-image-generator.md
---

# OG-Image-Generator — Procedure

## 1. Brand-Asset-Audit zuerst

```bash
mkdir -p tasks/awaiting-review/T12 public/og/tools audits
ls -la public/icon.svg public/favicon-32.png public/icon-192.png public/og-image.png 2>&1

# manifest sanity
cat public/manifest.webmanifest

# Liste fehlende Hero-Images
ls public/heroes/tools/ 2>/dev/null | sort > /tmp/heroes-have.txt
node -e "
const m = require('./src/lib/slug-map.ts').slugMap || {};
console.log(Object.keys(m).join('\\n'));
" > /tmp/tools-all.txt
diff /tmp/tools-all.txt /tmp/heroes-have.txt > audits/2026-04-26-brand-asset-audit.md
```

## 2. OG-Card-Generator-Script

```javascript
// scripts/generate-og-cards.mjs
import sharp from 'sharp';
import fs from 'fs';
import { slugMap } from '../src/lib/slug-map.ts';
// (Pseudo — actual import via tsx/jiti)

const BRAND_BG = '#1A1917';
const BRAND_TEXT = '#FAFAF9';
const BRAND_ACCENT = '#F0A066';
const BRAND_MUTED = '#9C998F';

async function makeCard({ toolId, name, category, lang, outPath }) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
      <rect width="1200" height="630" fill="${BRAND_BG}"/>
      <!-- Logo top-left -->
      <g transform="translate(80,80)">
        <rect width="64" height="64" rx="14" fill="${BRAND_TEXT}"/>
        <polyline points="22,18 11,32 22,46" stroke="${BRAND_BG}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="32" y1="18" x2="32" y2="46" stroke="${BRAND_ACCENT}" stroke-width="8" stroke-linecap="round"/>
        <polyline points="42,18 53,32 42,46" stroke="${BRAND_BG}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <text x="160" y="120" fill="${BRAND_TEXT}" font-family="Inter, sans-serif" font-size="32" font-weight="600" letter-spacing="-0.5">kit<tspan fill="${BRAND_ACCENT}">to</tspan>kit</text>
      <!-- Eyebrow category -->
      <text x="80" y="370" fill="${BRAND_MUTED}" font-family="JetBrains Mono, monospace" font-size="22" letter-spacing="2" text-transform="uppercase">${category.toUpperCase()}</text>
      <!-- Tool name -->
      <text x="80" y="440" fill="${BRAND_TEXT}" font-family="Inter, sans-serif" font-size="72" font-weight="600" letter-spacing="-1.5">${escapeXml(name)}</text>
      <!-- Footer URL -->
      <text x="80" y="570" fill="${BRAND_MUTED}" font-family="JetBrains Mono, monospace" font-size="20">kittokit.com/${lang}/${toolId}</text>
    </svg>
  `;
  await sharp(Buffer.from(svg))
    .webp({ quality: 90 })
    .toFile(outPath);
}

function escapeXml(s) { return s.replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c])); }

// Iterate slug-map → DE slug → call makeCard
// (read tool name from src/content/tools/<slug>/de.md frontmatter title)
```

## 3. Run + Validate

```bash
npm install --no-save sharp
node scripts/generate-og-cards.mjs

# Validate dimensions
for f in public/og/tools/*.webp; do
  size=$(identify -format "%wx%h" "$f")
  test "$size" = "1200x630" || echo "WARN $f: $size"
done

# Test 5 cards via opengraph.xyz (curl-based)
# (manual via dev-server screenshot for visual confirm)
```

## 4. Wire [slug].astro

Add per-tool og:image:
```astro
---
const ogImage = `/og/tools/${slug}.webp`;
const ogImageExists = ...; // check fs at build time
---
<meta property="og:image" content={new URL(ogImageExists ? ogImage : '/og-image.png', Astro.site).toString()} />
```

## 5. Report

```bash
cat > tasks/awaiting-review/T12/og-image-generator.md <<EOF
T12 — OG-Bilder + Brand-Asset-Audit — Worker-Output
Status: ready-for-review

Generiert: 72 OG-Cards (1200×630 WebP) in public/og/tools/
Brand-Asset-Audit: audits/2026-04-26-brand-asset-audit.md
- icon.svg: ✅
- favicon-32.png: ✅
- icon-192.png: ✅
- og-image.png (default): ✅
- manifest: ✅

Hero-Images (separate Schuld): <count>/72 vorhanden, <count> fehlen
[slug].astro updated mit per-tool og:image

Übergabe: quality-reviewer
EOF

git add -A && bash scripts/check-git-account.sh
git commit -m "feat(brand): T12 — 72 OG-Cards generated + per-tool og:image-tag

scripts/generate-og-cards.mjs (sharp + SVG-template, 1200x630 WebP)
[slug].astro picks per-tool /og/tools/<slug>.webp mit fallback

Rulebooks-Read: PROJECT, DESIGN

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```
