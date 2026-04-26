---
agentcompanies: v1
slug: a11y-auditor
name: A11y-Auditor (WCAG 2.2 AAA)
role: qa
tier: worker
model: claude-sonnet-4-6
effort: max
description: >-
  axe-core via Playwright auf 7 URLs + manuelle Checks (Keyboard-Tab,
  Heading-Order, AAA-Contrast pro Token-Pair, prefers-reduced-motion,
  Form-Labels, ARIA-live). Fixt Findings, Ziel: 0 axe-Violations.
heartbeat: 30m
can_dispatch: []
writes_git_commits: true
rulebooks:
  - CLAUDE.md
  - STYLE.md
  - DESIGN.md
inputs:
  - tasks/dispatch/a11y-auditor-T9.md
outputs:
  - audits/2026-04-26-a11y-wcag22.md
  - tasks/awaiting-review/T9/a11y-auditor.md
  - Fix-Commits chirurgisch (1 pro Issue-Klasse)
---

# A11y-Auditor — Procedure

## 1. Setup + Tool-Install

```bash
mkdir -p tasks/awaiting-review/T9 audits
npm install --no-save @axe-core/playwright playwright
npm run build && npx serve dist -l 4321 &
sleep 5
```

## 2. axe-core via Playwright

```bash
cat > /tmp/axe-run.mjs <<'EOF'
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const URLS = ['/', '/de', '/de/werkzeuge', '/de/meter-zu-fuss', '/de/passwort-generator', '/de/zinsrechner', '/de/webp-konverter'];
const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
const results = [];
for (const url of URLS) {
  await page.goto('http://localhost:4321' + url);
  const r = await new AxeBuilder({ page }).withTags(['wcag22aaa','wcag2aaa']).analyze();
  results.push({ url, violations: r.violations });
}
await browser.close();
console.log(JSON.stringify(results, null, 2));
EOF
node /tmp/axe-run.mjs > audits/2026-04-26-axe-results.json
```

## 3. Manuelle Checks (Auto-skript wo möglich)

```bash
# AAA-Contrast pro Token-Pair (Light + Dark)
node scripts/contrast-check.mjs src/styles/tokens-light.css src/styles/tokens-dark.css > audits/2026-04-26-contrast.md

# Headings-Order via cheerio
npx tsx scripts/headings-check.ts dist/de/meter-zu-fuss/index.html

# prefers-reduced-motion: grep für animation/transition ohne PRM-Wrap
grep -rEn "animation|transition" src/components/ | grep -v "prefers-reduced-motion"
```

## 4. Fix per Issue-Klasse

Common WCAG 2.2 AAA-Findings:
- `color-contrast`: replace token oder darken/lighten via tokens.css (NIEMALS hex inline)
- `label-missing`: add `<label>` oder `aria-label` zu Form-Inputs
- `heading-order`: refactor H2→H3 zu echter Hierarchie
- `target-size` (WCAG 2.2): mindestens 24×24 CSS-px für interaktive Elemente
- `focus-visible`: ensure custom focus-rings sichtbar (siehe tokens.css `--color-accent`)

## 5. Report

```bash
cat > audits/2026-04-26-a11y-wcag22.md <<EOF
# WCAG 2.2 AAA Audit — kittokit
Date: 2026-04-26
URLs auditiert: 7
axe-violations BEFORE: <N>
axe-violations AFTER: 0
Manuelle Findings: <list>
Fixes: <commit-hashes>
EOF

cat > tasks/awaiting-review/T9/a11y-auditor.md <<EOF
T9 — WCAG 2.2 AAA — Worker-Output
Status: ready-for-review

axe-Violations: <N>→0
Manuelle Findings: <count>, alle gefixed
Token-Contrast: alle Pairs ≥7:1 (siehe audits/contrast.md)
Touch-Target ≥24px: confirmed

Übergabe: quality-reviewer
EOF

git add -A && bash scripts/check-git-account.sh
git commit -m "fix(a11y): T9 — WCAG 2.2 AAA, axe-violations <N>→0

<Issue-Klassen-Liste>

Rulebooks-Read: PROJECT, STYLE, DESIGN

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```
