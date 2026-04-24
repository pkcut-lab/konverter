# SCRIPT-INVENTORY (v1.2, 2026-04-24, reconciled after architecture review)

> **Zweck:** Ehrliche Inventur aller von Agenten-AGENTS.md-Files referenzierten Scripts. Zeigt was existiert, was von Agenten tatsächlich genutzt wird (= keine Orphans), was fehlt.
>
> **Generiert aus:** `grep -rohE 'scripts/[a-zA-Z0-9/_-]+\.mjs' docs/paperclip/bundle/agents/ | sort -u | wc -l` + `find scripts -name "*.mjs" -type f | wc -l`
>
> **Ground-Truth-Count (2026-04-24, empirisch neu gezählt):**
> - Referenzen unique: **150**
> - Existierend total (`scripts/**/*.mjs`): **14**
> - Davon von Agenten tatsächlich referenziert (keine Orphans): **6**
> - Orphan-Scripts (existieren, nutzt niemand): **8** — `audit-screenshot.mjs`, `eval-fixture-gen.mjs`, `eval-runner.mjs`, `generate-og-image.mjs`, `generate-pwa-icons.mjs`, `stitch/generate.mjs`, `stitch/list.mjs`, `validate-frontmatter.mjs`
> - Fehlend (referenziert aber nicht existent): **144**
>
> **v1.2 Korrektur:** v1.1 sagte 150/13/137 — falsch gezählt (Orphans mitgerechnet). Empirische Ground-Truth: **150/14/144**, davon **6/14 effektiv Agent-relevant**. Korrigiert nach externem Architecture-Review 2026-04-24.
>
> **Konsequenz:** Ohne diese Scripts crashen 29 von 33 Agenten beim ersten Heartbeat (`No such file`). Siehe `GAPS-AND-NEXT-STEPS.md` für Tranche-B-Plan.

## §1. Existierende Scripts — 13 total (wiederverwendbar oder legacy)

| # | Script | Location | Ursprünglich für | Neu genutzt von |
|---|---|---|---|---|
| 1 | `scripts/audit-screenshot.mjs` | root | audit-trail | — |
| 2 | `scripts/budget-guard.mjs` | root | §7.16 Kostenlos | ALLE (Pre-Tool-Call) — aber kennt v2.0-api_caps/per_model NOCH NICHT (siehe §2.0 Extend-Task) |
| 3 | `scripts/citation-verify.mjs` | root | tool-dossier-researcher | differenzierungs-researcher |
| 4 | `scripts/competitor-watch.mjs` | root | Manual (Session-4-Prep) | competitor-watcher (nicht referenziert — Dedup-Entscheidung in Tranche B §B6) |
| 5 | `scripts/dossier-compliance-check.mjs` | root | merged-critic | — |
| 6 | `scripts/eval-fixture-gen.mjs` | root | Eval-Bootstrap | Tranche-B-Anchor |
| 7 | `scripts/eval-runner.mjs` | root | Eval-Runs | ALLE (pre-run smoke) |
| 8 | `scripts/generate-og-image.mjs` | root | Social-Card | image-optimizer (nicht referenziert) |
| 9 | `scripts/generate-pwa-icons.mjs` | root | PWA-Session | — |
| 10 | `scripts/hreflang-check.mjs` | root | i18n | merged-critic + seo-auditor (Dup-Risiko mit scripts/seo/hreflang-check.mjs geplant) |
| 11 | `scripts/pii-scrub.mjs` | root | DSGVO §7.12 | differenzierungs-researcher |
| 12 | `scripts/stitch/generate.mjs` | stitch/ | Stitch-Integration | — |
| 13 | `scripts/stitch/list.mjs` | stitch/ | Stitch-Integration | — |

**Redundanz-Check benötigt:** `scripts/competitor-watch.mjs` ↔ `scripts/watcher/*.mjs` (neue Set). Entweder das alte refactor + wiederverwenden oder deprecaten.

## §2. Fehlende Scripts — pro Agent (Tranche B)

### 2.1 content-critic (8 Scripts)

- `scripts/content-em-target-check.mjs` (C1)
- `scripts/fact-match-dossier.mjs` (C3)
- `scripts/faq-pain-match.mjs` (C4)
- `scripts/example-count-check.mjs` (C6)
- `scripts/inverted-pyramid-check.mjs` (C7)
- `scripts/citation-density-check.mjs` (C8)
- `scripts/h2-pattern-check.mjs` (Merged-Critic shared, teils existent als stub?)
- `scripts/related-closer-check.mjs` (Merged-Critic shared)

### 2.2 design-critic (3 Scripts)

- `scripts/design-primary-button-color.mjs` (D6)
- `scripts/design-accent-scope.mjs` (D7)
- `scripts/reduced-motion-check.mjs` (D9)

### 2.3 a11y-auditor (1 Orchestrator-Script + ~12 Playwright-Specs)

- `scripts/a11y-audit.mjs` (Orchestrator)
- `tests/a11y/<slug>-axe-strict.spec.ts` (pro Tool)
- `tests/a11y/<slug>-tab-order.spec.ts`
- `tests/a11y/<slug>-focus-ring.spec.ts`
- `tests/a11y/<slug>-focus-trap.spec.ts`

### 2.4 performance-auditor (0 neue Scripts, nutzt `npx lhci`)

Komplett via Standard-Tools (Lighthouse-CI). Keine Scripts fehlend.

### 2.5 security-auditor (3 Scripts)

- `scripts/csp-check.mjs` (S1)
- `scripts/dep-freshness.mjs` (S10)
- `security-exceptions.yaml` (Data-File, nicht Script)

### 2.6 legal-auditor (5 Scripts)

- `scripts/impressum-check.mjs` (L1)
- `scripts/datenschutz-sections.mjs` (L2)
- `scripts/cookie-banner-check.mjs` (L4)
- `scripts/cmp-check.mjs` (L5)
- `scripts/legal-rulings-fetch.mjs` (Monthly-Sweep)

### 2.7 seo-auditor (4 Scripts)

- `scripts/jsonld-extract.mjs` (SE1-SE3)
- `scripts/hreflang-validate-live.mjs` (SE5)
- `scripts/rich-results-test.mjs` (SE9)
- `scripts/gsc-index-status.mjs` (SE10)

### 2.8 differenzierungs-researcher (7 Scripts)

- `scripts/extract-competitors.mjs`
- `scripts/competitor-deep-fetch.mjs`
- `scripts/review-quote-mining.mjs`
- `scripts/subreddit-suggest.mjs`
- `scripts/reddit-pain-extract.mjs`
- `scripts/hn-pain-extract.mjs`
- `scripts/trend-fetch.mjs`
- `scripts/trend-filter-constraints.mjs`
- `scripts/diff-research-synthesize.mjs`

### 2.9 platform-engineer (1 Script + Playwright-Specs)

- `scripts/console-error-check.mjs` (PE6)
- `tests/visual/<slug>.spec.ts` (pro Tool, Snapshot-basiert)
- `tests/bundle-baselines.json` (Data-File)
- `tests/lighthouse-baselines.json` (Data-File)

### 2.10 seo-geo-strategist (24 Scripts — höchster Aufwand)

- `scripts/seo/title-check.mjs`
- `scripts/seo/meta-desc-check.mjs`
- `scripts/seo/h1-variant-check.mjs`
- `scripts/seo/slug-check.mjs`
- `scripts/seo/hreflang-check.mjs` (potential Dup mit root hreflang-check.mjs)
- `scripts/seo/sitemap-priority.mjs`
- `scripts/seo/link-closers.mjs`
- `scripts/seo/pillar-link.mjs`
- `scripts/seo/anchor-diversity.mjs`
- `scripts/seo/image-seo.mjs`
- `scripts/seo/keyword-blueprint.mjs`
- `scripts/geo/inverted-pyramid.mjs`
- `scripts/geo/definitions-pattern.mjs`
- `scripts/geo/table-compare.mjs`
- `scripts/geo/examples-h3.mjs`
- `scripts/geo/faq-self-contained.mjs`
- `scripts/geo/eeat-signals.mjs`
- `scripts/geo/qapage-schema.mjs`
- `scripts/geo/howto-schema.mjs`
- `scripts/geo/citation-magnet.mjs`

### 2.11 seo-geo-monitor (6 Scripts)

- `scripts/monitor/gsc-fetch.mjs` (Dup mit scripts/analytics/gsc-fetch.mjs?)
- `scripts/monitor/brave-search.mjs`
- `scripts/monitor/perplexity-citations.mjs`
- `scripts/monitor/ai-chat-citations.mjs`
- `scripts/monitor/aggregate-weekly.mjs`
- `scripts/monitor/detect-rank-drops.mjs`

### 2.12 analytics-interpreter (5 Scripts)

- `scripts/analytics/cf-rum-fetch.mjs`
- `scripts/analytics/gsc-fetch.mjs`
- `scripts/analytics/adsense-fetch.mjs`
- `scripts/analytics/filter-min-sessions.mjs`
- `scripts/analytics/rework-score.mjs`
- `scripts/analytics/category-segment.mjs`
- `scripts/analytics/synthesize-insights.mjs`

### 2.13 retro-audit-agent (3 Scripts)

- `scripts/retro/checks-for-section.mjs`
- `scripts/retro/drift-audit.mjs`
- `scripts/retro/aggregate-drift.mjs`

### 2.14 skill-scout (4 Scripts)

- `scripts/scout/pain-extract.mjs`
- `scripts/scout/skill-match.mjs`
- `scripts/scout/security-scan.mjs`
- `scripts/scout/write-report.mjs`

### 2.15 internal-linking-strategist (7 Scripts)

- `scripts/linking/build-graph.mjs`
- `scripts/linking/detect-orphans.mjs`
- `scripts/linking/detect-dead-ends.mjs`
- `scripts/linking/detect-over-optim.mjs`
- `scripts/linking/compute-pagerank.mjs`
- `scripts/linking/update-manifest.mjs`
- `scripts/linking/write-report.mjs`

### 2.16 cross-tool-consistency-auditor (8 Scripts)

- `scripts/consistency/enumerate-full-categories.mjs`
- `scripts/consistency/h2-variants.mjs`
- `scripts/consistency/precision-variants.mjs`
- `scripts/consistency/cta-wording.mjs`
- `scripts/consistency/schema-variants.mjs`
- `scripts/consistency/faq-patterns.mjs`
- `scripts/consistency/changelog-format.mjs`
- `scripts/consistency/related-bar-count.mjs`
- `scripts/consistency/filter-explained-divergence.mjs`

### 2.17 conversion-critic (4 Scripts + Playwright-Specs)

- `scripts/conversion/ad-slot-flow.mjs`
- `scripts/conversion/ad-cls.mjs`
- `scripts/conversion/tap-target-size.mjs`
- `scripts/conversion/secondary-action-emphasis.mjs`
- `tests/conversion/<slug>-*.spec.ts`

### 2.18 faq-gap-finder (4 Scripts)

- `scripts/faq/brave-paa.mjs`
- `scripts/faq/alsoasked-fetch.mjs`
- `scripts/faq/extract-current-faqs.mjs`
- `scripts/faq/gap-analysis.mjs`

### 2.19 schema-markup-enricher (5 Scripts)

- `scripts/schema/gen-softwareapplication.mjs`
- `scripts/schema/gen-howto.mjs`
- `scripts/schema/gen-qapage.mjs`
- `scripts/schema/gen-dataset.mjs`
- `scripts/schema/write-enrichments.mjs`

### 2.20 content-refresher (6 Scripts)

- `scripts/refresh/ttl-check.mjs`
- `scripts/refresh/algo-updates.mjs`
- `scripts/refresh/extract-competitor-launches.mjs`
- `scripts/refresh/extract-retro-drift.mjs`
- `scripts/refresh/consolidate-triggers.mjs`
- `scripts/refresh/skip-filter.mjs`
- `scripts/refresh/write-ticket.mjs`

### 2.21 competitor-watcher (6 Scripts)

- `scripts/watcher/extract-competitors.mjs`
- `scripts/watcher/fetch-landing.mjs`
- `scripts/watcher/fetch-blog.mjs`
- `scripts/watcher/fetch-ph.mjs`
- `scripts/watcher/diff.mjs`
- `scripts/watcher/write-report.mjs`

### 2.22 image-optimizer (0 eigene Scripts, nutzt `sharp-cli`)

Benötigt nur `npm install sharp-cli` — User-Approval-Pflicht.

### 2.23 meta-reviewer (7 Scripts)

- `scripts/meta/critic-consistency.mjs`
- `scripts/meta/eval-f1-trends.mjs`
- `scripts/meta/rubric-ambiguity.mjs`
- `scripts/meta/rework-patterns.mjs`
- `scripts/meta/hidden-success.mjs`
- `scripts/meta/critic-load.mjs`
- `scripts/meta/synthesize-findings.mjs`

### 2.24 polish-agent (6 Scripts)

- `scripts/polish/copy-variants.mjs`
- `scripts/polish/spacing-micro.mjs`
- `scripts/polish/faq-refine.mjs`
- `scripts/polish/hero-micro.mjs`
- `scripts/polish/ui-micro.mjs`
- `scripts/polish/write-suggestions.mjs`

### 2.25 uptime-sentinel (2 Scripts)

- `scripts/uptime/cwv-rum-check.mjs`
- `scripts/uptime/broken-link-scan.mjs`

### 2.26 Phase-3-drafted (9 Scripts, NIEMALS vor Phase 3 nötig)

- `scripts/translator/translate.mjs`
- `scripts/brand-voice/tone-match.mjs`
- `scripts/brand-voice/glossary-check.mjs`
- `scripts/brand-voice/idiomatik.mjs`
- `scripts/brand-voice/nbsp-numerik.mjs`
- `scripts/brand-voice/datetime-locale.mjs`
- `scripts/brand-voice/cta-check.mjs`
- `scripts/i18n/hreflang-bidirectional.mjs`
- `scripts/i18n/numerik-locale.mjs`
- `scripts/i18n/plural-icu-check.mjs`
- `scripts/i18n/fallback-check.mjs`
- `scripts/cto/adr-write.mjs`

## §3. Scripts für Data-Files (nicht .mjs)

- `docs/paperclip/translation-glossary.json` — fehlt (Phase 3)
- `docs/paperclip/legal-rulings-log.md` — **vorhanden seit Tranche A** (Initial-Stand)
- `security-exceptions.yaml` — fehlt
- `tests/bundle-baselines.json` — fehlt (Platform-Engineer)
- `tests/lighthouse-baselines.json` — fehlt (Platform-Engineer)
- `src/data/internal-links-manifest.json` — fehlt (Internal-Linking-Strategist)

## §4. Tranche-B-Plan (Priorisierung)

### 4.1 Must-Have für Phase-1-Activation (16 Agenten aktiv)

Agenten pro Priorität, Scripts pro Agent:

| Priorität | Agent | Scripts | Effort-Estimate |
|---|---|---|---|
| P0 | ceo (upgraded frontmatter, keine neuen Scripts) | 0 | — |
| P0 | tool-dossier-researcher | 0 (nutzt existent) | — |
| P0 | tool-builder | 0 | — |
| P0 | merged-critic (19 Checks teils mit Existenten, teils fehlend) | ~5 neue | 1 Session |
| P1 | content-critic | 8 | 1 Session |
| P1 | design-critic | 3 | 0.5 Sessions |
| P1 | a11y-auditor | 1 + Playwright-Specs | 1 Session |
| P1 | performance-auditor | 0 (Lighthouse-CI) | — |
| P1 | security-auditor | 3 | 0.5 Session |
| P1 | legal-auditor | 5 | 1 Session |
| P1 | platform-engineer | 1 + Playwright-Specs | 1 Session |
| P1 | differenzierungs-researcher | 9 | 2 Sessions |
| P1 | seo-geo-strategist | 20 | 3 Sessions |
| P1 | schema-markup-enricher | 5 | 1 Session |
| P1 | image-optimizer | 0 (sharp-cli) | — |
| P1 | faq-gap-finder | 4 | 1 Session |

**Phase-1-Summe:** ~64 Scripts + Playwright-Specs-Setup = **ca. 12 Sessions** Tranche-B-Arbeit.

### 4.2 Phase-2-Activation (nochmal ~55 Scripts)

- retro-audit-agent, cross-tool-consistency-auditor, conversion-critic, meta-reviewer, polish-agent
- seo-auditor, seo-geo-monitor, analytics-interpreter, competitor-watcher, content-refresher, internal-linking-strategist
- skill-scout, uptime-sentinel

**Phase-2-Summe:** ~55 Scripts = **ca. 10 Sessions** Tranche-B.

### 4.3 Phase-3-Agenten (~13 Scripts)

- translator, i18n-specialist, brand-voice-auditor, cto

**Phase-3-Summe:** 13 Scripts = **ca. 2-3 Sessions** Tranche-B (wenn je Phase 3 beginnt).

## §5. Evals-Inventar (separate Arbeit)

Alle 29 neuen Agenten starten mit `bash evals/<agent>/run-smoke.sh`. Von 33 Agenten hat nur **merged-critic** eine Eval-Suite heute. **32 Eval-Suiten fehlen.**

Pro Eval-Suite: 10 Fixtures (5 pass + 5 fail) + `run-smoke.sh` + `annotations.yaml` = ca. 2-4h Arbeit pro Agent. **Gesamt: ~80-120h Eval-Bootstrap.**

## §6. Aktivierungs-Gate (normativ)

`.paperclip.yaml activation_gate`:
```yaml
activation_gate:
  require_evals: true
  require_scripts: true
  require_smoke_green: true
```

Vor `paperclipai hire <agent>`:
1. `find evals/<agent>/` — Existenz prüfen
2. `bash evals/<agent>/run-smoke.sh` — F1 ≥0.85
3. Per AGENTS.md-Parse: `grep 'node scripts/...'` — alle referenzierten Scripts müssen existieren

Wenn einer der drei fehlt → `hire` blockiert, `inbox/to-user/activation-gate-fail-<agent>.md`.

Script zur Gate-Prüfung: `scripts/validate-agent-activation.mjs` — **existiert nicht**, muss als Teil von Tranche-B-Setup zuerst gebaut werden.
