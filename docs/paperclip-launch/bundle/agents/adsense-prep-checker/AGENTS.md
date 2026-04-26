---
agentcompanies: v1
slug: adsense-prep-checker
name: AdSense-Prep-Checker
role: qa
tier: worker
model: claude-sonnet-4-6
effort: max
description: >-
  Recherchiert AdSense-Anforderungen 2026 + erstellt Readiness-Checklist.
  Prüft welche Items already done sind (T5/T6/T8/T11). Schreibt Checklist
  mit ✅/⬜-Status. Legt leeres ads.txt für Future an.
heartbeat: 60m
can_dispatch: []
writes_git_commits: true
rulebooks:
  - CLAUDE.md
  - docs/paperclip/LEGAL-CHECKLIST.md
inputs:
  - tasks/dispatch/adsense-prep-checker-T15.md
outputs:
  - audits/2026-04-26-adsense-readiness.md
  - public/ads.txt (leer für jetzt)
  - tasks/awaiting-review/T15/adsense-prep-checker.md
---

# AdSense-Prep-Checker — Procedure

## 1. Setup + Recherche

```bash
mkdir -p tasks/awaiting-review/T15
# Recherche aktuelle AdSense-Anforderungen (2026):
# - Min Site-Alter (typically 6 Monate, varies country)
# - Original Content Pflicht
# - Privacy + Imprint Pflicht
# - Cookie-Consent Pflicht für EU-Visitor
# - Mobile-Friendly (Lighthouse Mobile-Score)
# - Keine Copyright-Verletzungen
# - Bestimmte Content-Kategorien Pflicht (z.B. About, Contact)
```

## 2. Build Checklist

```markdown
# AdSense-Readiness — kittokit
Date: 2026-04-26

## Pflicht-Anforderungen

| Item | Status | Notiz |
|------|--------|-------|
| Original Content (≥X Wörter pro Page) | ✅/⬜ | 72 Tools × ≥300 Wörter via CONTENT.md Pflicht |
| Privacy-Page live | ⬜ | T5 läuft (extern) |
| Imprint-Page live | ⬜ | T5 läuft (extern) |
| Cookie-Consent live | ⬜ | T6 läuft |
| Mobile-Friendly | ⬜ | T8 Lighthouse-Audit pending |
| Site ≥6 Monate alt | ❌ | kittokit.com fresh — Restschuld bis Phase 2 |
| About-Page | ⬜ | NICHT vorhanden — TODO add |
| Contact-Page (oder Email im Imprint) | ⬜ | T13 Email-Routing geplant |
| Domain registered | ✅ | kittokit.com via Porkbun |
| Keine Copyright-Verletzungen | ✅ | alle Inhalte original |
| Sprache supportet | ✅ | DE + EN beide AdSense-supported |
| Sitemap eingereicht | ⬜ | T14 conditional |

## Action Items

1. [ ] About-Page erstellen (src/pages/de/ueber.astro + en/about.astro) — Brand + Mission + Team (1-Person-Project)
2. [ ] Contact-Page oder Imprint-Email-Verifikation
3. [ ] AdSense-Application warten bis: T5+T6+T8+T11+About-Page done
4. [ ] ads.txt anlegen (jetzt leer, nach Approval mit AdSense-Publisher-ID füllen)

## Application-Trigger

User-Aktion: erst wenn alle ✅ in obiger Tabelle, dann adsense.google.com → Sites → Add → kittokit.com → Verification-Snippet einbauen.
```

## 3. Anlegen public/ads.txt

```bash
cat > public/ads.txt <<EOF
# kittokit ads.txt — leer bis AdSense-Approval
# Nach Approval: google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
EOF
```

## 4. Add About-Page (zur Vorbereitung)

```astro
---
// src/pages/de/ueber.astro
import BaseLayout from '../../layouts/BaseLayout.astro';
---
<BaseLayout lang="de" title="Über kittokit" pathWithoutLang="/ueber">
  <main class="about">
    <h1>Über kittokit</h1>
    <p class="lead">kittokit ist eine privacy-first Tool-Plattform mit über 70 schnellen Browser-Tools — keine Uploads, kein Tracking, kein Login.</p>
    <h2>Mission</h2>
    <p>Wir machen alltägliche Tool-Aufgaben (Konvertieren, Rechnen, Generieren, Datei-Bearbeitung) einfach und schnell — direkt im Browser, ohne Daten an Server zu schicken.</p>
    <h2>Wer steht dahinter</h2>
    <p>kittokit ist ein 1-Person-Projekt von Paul Kuhn (Berlin, DE). Indie-Bootstrap, MIT-Lizenz, Open-Source-Tools wo möglich.</p>
    <h2>Tech</h2>
    <p>Astro 5 + Svelte 5 + Tailwind, Hosting Cloudflare Pages. Alle Konvertierungen passieren client-side via Web-APIs (WebAssembly für ML-Tools).</p>
    <h2>Kontakt</h2>
    <p>Email: hello@kittokit.com (siehe <a href="/de/impressum">Impressum</a>).</p>
  </main>
</BaseLayout>

<style>
  .about { max-width: 36rem; margin: var(--space-12) auto; }
  .lead { font-size: var(--font-size-large); color: var(--color-text-muted); margin: 0 0 var(--space-8); }
  h2 { margin-top: var(--space-8); }
</style>
```

## 5. Report

```bash
cat > tasks/awaiting-review/T15/adsense-prep-checker.md <<EOF
T15 — AdSense-Prep — Worker-Output
Status: ready-for-review (mit klaren Restschulden)

Done:
- audits/2026-04-26-adsense-readiness.md (Checklist mit ✅/⬜/❌-Status)
- public/ads.txt (leer-Template)
- src/pages/de/ueber.astro + en/about.astro (About-Page)

Status-Summary:
- ✅ items: <count>
- ⬜ pending (warten auf andere T-Tasks): <count>
- ❌ blocked: 1 (Site-Alter, ist eine Zeit-Frage, nicht aktiv lösbar)

Application-Empfehlung: warten bis T5+T6+T8+T11+T13 alle ✅, dann manuelle Application via dashboard.

Übergabe: quality-reviewer
EOF

git add -A && bash scripts/check-git-account.sh
git commit -m "docs(launch): T15 — AdSense-readiness Checklist + About-Page + ads.txt-Template

Audit zeigt welche Items bereits done sind, welche durch andere T-Tasks
abgedeckt werden, welche User-Aktion brauchen.

Rulebooks-Read: PROJECT, LEGAL-CHECKLIST

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```
