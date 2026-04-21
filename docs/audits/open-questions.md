---
date_opened: 2026-04-21
source: docs/audits/2026-04-21-full-quality-audit.md
owner: user (pkcut-lab)
status: awaiting-input
---

# Open Questions — Audit 2026-04-21

Drei Entscheidungen, die der Fix-Agent NICHT autonom trifft. Werden geskipped, bis User
einen Pfad wählt. Jede Frage nennt Optionen, Trade-offs und den vom Agent empfohlenen
Default (der aber ohne explizites "OK" nicht implementiert wird).

---

## Q1 — OG-Image-Strategie (Findings M-7-02, M-7-03) ✅ RESOLVED 2026-04-21

**Entscheidung:** Option 3 (Hybrid). Phase 1 jetzt: Global-Fallback
`public/og-image.png` (1200×630, SVG-gerendert via `scripts/generate-og-image.mjs`).
og:image, og:image:width/height/alt, twitter:card="summary_large_image" + twitter:image
in `BaseLayout.astro` verdrahtet — gilt ab sofort für alle 18 Tools.

**Phase-2-TODO (nach AdSense-Aktivierung):** Satori-basiertes per-Tool-Rendering für
Top-5 nach Analytics. Fallback bleibt als Default für unpriorisierte Tools.

---

## Q2 — CSP-Scope (Finding M-5-02) ✅ RESOLVED 2026-04-21

**Entscheidung:** Option 1 (globale CSP mit whitelisted connect-src). In
`public/_headers` unter der `/*`-Rule als einzeiliger Content-Security-Policy-Header
verdrahtet. Whitelist: `https://huggingface.co`, `https://cdn-lfs.huggingface.co`
(ML-Worker-Exception nach Spec Section 7a). `'unsafe-inline'` bleibt für script-src
(ThemeScript) + style-src (Astro scoped-styles + Svelte-Runtime) — Nonce-Migration
ist Phase-2-Kandidat.

**Phase-2-TODO:** Option 3 (Nonce-basierte Policy) wenn Zeit ist. ThemeScript.astro
würde den Nonce vom Astro-Middleware bekommen, `unsafe-inline` fällt weg.

---

## Q3 — Secrets-Rotation-Kadenz (Finding N-5-01) ✅ RESOLVED 2026-04-21

**Entscheidung:** Split wie vom Agent empfohlen — 180 Tage Dev-Tooling, 90 Tage Prod.
Policy-Eintrag lebt in `CONVENTIONS.md` unter "Secrets-Rotation-Policy".

---

---

## Q4 — json-formatter UI gleich ColorConverter ✅ RESOLVED 2026-04-21

**Entscheidung:** Option 1 (neue `Formatter.svelte` + Routing-Split). `[slug].astro`
routet jetzt:
- `config.id === 'hex-to-rgb'` → `ColorConverter.svelte` (hex-only, behält Swatch
  + Quick-Colors)
- alle anderen `type: 'formatter'` → `Formatter.svelte` (generische Textarea-UI mit
  Input-Textarea, Preformatted-Output, Copy + Leeren, Error-Banner für Throw).

Kompromiss gegen CONVENTIONS.md "Komponenten dürfen NICHT auf config.id switchen":
Der Switch lebt am Route-Layer (`[slug].astro`), NICHT im Component. Die Components
selbst bleiben generisch.

Phase-2-Kandidat: wenn ein 3. Formatter-Subtyp auftaucht, wird ein `format` Sub-
Discriminator im Zod-Schema sauberer (`formatter-textarea`, `formatter-color`, …).

---

## Answered Questions

_(leer — sobald User eine Q beantwortet, wird der Eintrag hier hin mit Datum + Entscheidung
verschoben, damit die Historie erhalten bleibt.)_
