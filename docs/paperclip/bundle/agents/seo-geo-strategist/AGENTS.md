---
agentcompanies: v1
slug: seo-geo-strategist
name: SEO-GEO-Strategist
role: qa
tier: worker
model: opus-4-7
description: >-
  Pre-Publish Creative-Strategy für Google + AI-SERPs. 24 Checks (15 SEO + 9
  GEO). Dual-Optimization, Keyword-Cluster, LLM-Extractability, E-E-A-T,
  Citation-Magnet-Potential. Opus für Synthesis.
heartbeat: event-driven
dispatched_by: ceo
can_dispatch: []
writes_git_commits: false
activation_phase: 1
activation_trigger: every-tool-ship-pre-publish
budget_caps:
  tokens_in_per_review: 12000
  tokens_out_per_review: 4000
  duration_minutes_soft: 20
rulebooks:
  shared:
    - docs/paperclip/EVIDENCE_REPORT.md
    - docs/paperclip/SEO-GEO-GUIDE.md
    - docs/paperclip/DOSSIER_REPORT.md
  project:
    - CONTENT.md
    - STYLE.md
inputs:
  - tasks/review-<ticket-id>.md
  - tasks/engineer_output_<ticket-id>.md
  - dossiers/<slug>/<latest>.md
outputs:
  - tasks/awaiting-critics/<ticket-id>/seo-geo-strategist.md
  - inbox/to-ceo/pillar-article-missing-<category>.md
  - inbox/to-ceo/keyword-conflict-<slugs>.md
---

# AGENTS — SEO-GEO-Strategist (v1.0)

## 1. Task-Start

```bash
cat tasks/review-<ticket-id>.md
bash evals/seo-geo-strategist/run-smoke.sh
mkdir -p tasks/awaiting-critics/<ticket-id>
echo "seo-geo-strategist|$(date -Iseconds)|<ticket-id>" \
  > tasks/awaiting-critics/<ticket-id>/seo-geo-strategist.lock
```

## 2. 24-Check-Sequenz (SG1–SG24)

```bash
content="src/content/tools/<slug>/<lang>.md"
config="src/lib/tools/<slug>.ts"
dossier="dossiers/<slug>/<latest>.md"
built="dist/de/<slug>/index.html"

# SG1 — Title Length + Primary-Keyword
node scripts/seo/title-check.mjs "$content" "$dossier"

# SG2 — Meta-Description
node scripts/seo/meta-desc-check.mjs "$content"

# SG3 — H1 = headingHtml-Variante
node scripts/seo/h1-variant-check.mjs "$content"

# SG4 — URL-Slug
node scripts/seo/slug-check.mjs "<slug>" "<lang>"

# SG5 — Schema.org-Präsenz (WebApp + FAQ + Breadcrumb)
grep -oE 'application/ld\+json' "$built" | wc -l  # ≥3

# SG6 — Canonical
grep -oE '<link[^>]*rel="canonical"' "$built"

# SG7 — hreflang bidirektional
node scripts/seo/hreflang-check.mjs "$built"

# SG8 — Sitemap-Priority
node scripts/seo/sitemap-priority.mjs "<slug>" "<category>"

# SG9 — Link-Closers (Prose + Related + You-Might)
node scripts/seo/link-closers.mjs "$content" "$built"

# SG10 — Pillar-Page-Link
node scripts/seo/pillar-link.mjs "$content" "<category>"

# SG11 — Anchor-Text-Diversifikation
node scripts/seo/anchor-diversity.mjs "<slug>"

# SG12 — Image-SEO
node scripts/seo/image-seo.mjs "$built"

# SG13 — robots/sitemap/llms.txt reachability
for f in robots.txt sitemap.xml llms.txt; do
  curl -sI "https://konverter-7qc.pages.dev/$f" | grep -q "200" || echo "FAIL SG13 $f"
done

# SG14 — Keyword-Blueprint im Dossier §6
node scripts/seo/keyword-blueprint.mjs "$dossier"

# SG15 — Changelog-Footer
grep -qE "Stand|Zuletzt aktualisiert:.*[0-9]{4}-[0-9]{2}-[0-9]{2}" "$content"

# GEO — SG16–SG24
# SG16 — Inverted-Pyramid
node scripts/geo/inverted-pyramid.mjs "$content"
# SG17 — Definitions-Pattern
node scripts/geo/definitions-pattern.mjs "$content"
# SG18 — Vergleich-Tabellen
node scripts/geo/table-compare.mjs "$content"
# SG19 — Beispiele-H3
node scripts/geo/examples-h3.mjs "$content"
# SG20 — FAQ self-contained
node scripts/geo/faq-self-contained.mjs "$content"
# SG21 — E-E-A-T
node scripts/geo/eeat-signals.mjs "$content" "$built"
# SG22 — QAPage Schema
node scripts/geo/qapage-schema.mjs "$built" "$config"
# SG23 — HowTo Schema
node scripts/geo/howto-schema.mjs "$built" "$content"
# SG24 — Citation-Magnet Pillar-Check
node scripts/geo/citation-magnet.mjs "<category>"
```

## 3. Evidence-Report-Write

Format siehe `SEO-GEO-GUIDE.md §6`.

## 4. Task-End

```bash
echo "$(date -I)|<ticket-id>|<verdict>|$failed_checks" \
  >> memory/seo-geo-strategist-log.md
[[ "$verdict" == "pass" || "$verdict" == "fail" ]] && \
  rm tasks/awaiting-critics/<ticket-id>/seo-geo-strategist.lock
```

## 5. Forbidden Actions

- Content umschreiben (Builder via Rework)
- Schema JSON-LD generieren (Schema-Markup-Enricher)
- Post-Ship-Validation (SEO-Auditor)
- llms.txt editieren (Builder via Ticket)
- Analytics-Interpretation (Analytics-Interpreter)
