---
date: 2026-04-22
scope: Deep-Performance-Review closure (Run-3)
baseline: docs/audits/2026-04-21-full-quality-audit-run-2.md (run-2)
branch: main
build: EXIT=0
tests: 846/846
---

# Re-Audit — Run 3 (Perf-Sweep)

Run-2 klassifizierte 3 offene Minor-Findings als "Phase-3-prep"; parallel
entstand ein Deep-Performance-Review mit 7 neuen Findings (Perf 1–7), die
orthogonal zum Launch-Scope liegen, aber für das Revenue-Ziel ("perfekte
Performance") gelöst werden mussten. Run-3 schliesst genau diese 7 Findings.

## Terminal Summary

```json
{
  "perf_remaining": 0,
  "regressions": 0,
  "tests": "846/846",
  "recommendation": "go"
}
```

- **Perf-1 bis Perf-7:** 7/7 geschlossen (Commit `dc81e56`).
- **Regressionen:** 0 — Test-Suite unverändert grün.
- **Launch-Scope:** unberührt. Die 3 aus Run-2 offenen Minor-Findings (m-8-01
  Pagefind-Index, m-9-02 Lighthouse-CI, m-9-03 Bundle-Budget) bleiben wie
  geplant in Phase-3-prep.

Empfehlung: **go**. Perf-Baseline für Launch steht.

---

## Finding-by-Finding

| ID | Severity | Datei(en) | Fix | Commit |
|---|---|---|---|---|
| **Perf-1** Static-Imported `remove-background` shipt `@huggingface/transformers` (~38 MB) auf jede File-Tool-Seite | High/10 | `src/lib/tools/tool-runtime-registry.ts`, `remove-background.ts` | Promise-Singleton Dynamic-Import im Runtime-Entry; Transformers-Chunk lädt nur auf `/hintergrund-entfernen` | dc81e56 |
| **Perf-2** `formatter-runtime-registry` + `type-runtime-registry` static-importieren 17+ Module | Med/10 | `formatter-runtime-registry.ts` (neu), `type-runtime-registry.ts` (neu), `Formatter.svelte`, `ColorConverter.svelte`, `Comparer.svelte`, `Validator.svelte`, `Generator.svelte`, `Analyzer.svelte` | Lazy-Map-Pattern `() => import()` pro Tool-ID; Components lazy-laden per `$effect` + Cancel-Flag | dc81e56 |
| **Perf-3** `tool-registry` static-importiert alle 44+ Tool-Configs | Med/9 | `src/lib/tool-registry.ts`, `src/pages/[lang]/[slug].astro`, `tests/lib/tools/{hevc,hintergrund}-config.test.ts` | `loaders: Record<string, () => Promise<ToolConfig>>`; `hasTool(id)` sync, `getToolConfig(id)` async; `getStaticPaths` via `Promise.all`; Tests auf async angepasst | dc81e56 |
| **Perf-4** `BildDiffTool` `$state` deep-proxied Uint8ClampedArray | Med/9 | `src/components/tools/BildDiffTool.svelte` | `$state.raw` für Pixel-Buffer — kein Proxy-Overhead auf `width × height × 4` Bytes | dc81e56 |
| **Perf-5** `Comparer` lief O(m×n) LCS auf jeden Keystroke | Med/8 | `src/components/tools/Comparer.svelte` | 180 ms Debounce auf Diff-Compute; `scheduleDiff()` via `setTimeout` + Cleanup in `$effect` | dc81e56 |
| **Perf-6** Playfair Display preloaded 38 KB für dekorativen Font | Med/8 | `src/layouts/BaseLayout.astro` | `<link rel="preload">` entfernt; `@font-face` mit `font-display: swap` bleibt in `fonts.css` | dc81e56 |
| **Perf-7** ~92 KB render-blocking CSS als Folge von #3 | Low-Med/7 | (transitiv) | Behoben durch Perf-3: weniger statische Imports → weniger transitives CSS im HTML-Head | dc81e56 |

---

## Rule-Codification (Run-3)

Damit die Patterns verbindlich bleiben, sind sie in zwei Ebenen verankert
(Commit `6840f64`):

1. **`CONVENTIONS.md`** — neuer Abschnitt "Performance-Mandate" (5 Regeln +
   6-Punkt-Pre-Commit-Check) vor Commit-Disziplin.
2. **`docs/paperclip/bundle/agents/tool-builder/AGENTS.md`** — neuer §9
   "Performance-Mandate" (6 Unter-Regeln mit Code-Snippets), alte §9
   "Skill-Sequenz-Pflicht" → §10.

Paperclip-Agents, die künftig Tools scaffolden, wenden die Patterns
automatisch an (lazy-loader statt static import; `$state.raw` für binäre
State; ≥150 ms Debounce hinter O(m×n)-Algorithmen; keine Font-Preloads für
dekorative Fonts).

---

## Evidence

- Build: `npm run build` → EXIT=0, 48 Pages in 9.27 s, Pagefind 5965 Wörter.
- Tests: `npm test` → 846/846 pass in 78 Test-Files.
- Commits: `dc81e56` (Perf-Sweep Bundle), `6840f64` (Rules), dieses Closure-Note.

---

## Open after Run-3

- Phase-3-prep Minors aus Run-2 (m-8-01, m-9-02, m-9-03) — unverändert.
- User-decision-blocked aus Run-2 (Q1 OG-Image, Q2 CSP, Q3 Secrets, Q4
  json-formatter UI) — unverändert, siehe `open-questions.md`.
