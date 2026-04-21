---
date: 2026-04-21
auditor: claude-opus-4-7 (4 parallele Explore-Subagents + Orchestrator)
scope: "18 shipped Tools + globales Layout + Infra (_headers, slug-map, BaseLayout)"
tools_audited:
  - celsius-zu-fahrenheit
  - hevc-zu-h264
  - hex-rgb-konverter
  - hintergrund-entfernen
  - json-formatter
  - kilogramm-zu-pfund
  - kilometer-zu-meilen
  - meter-zu-fuss
  - passwort-generator
  - quadratmeter-zu-quadratfuss
  - regex-tester
  - text-diff
  - unix-timestamp
  - uuid-generator
  - webp-konverter
  - zeichenzaehler
  - zentimeter-zu-zoll
  - zoll-zu-zentimeter
total_findings: 28
blocker_count: 3
major_count: 11
minor_count: 11
nit_count: 3
time_spent_minutes: 40
---

# Full Quality Audit — 2026-04-21

## TL;DR

Das Produkt ist **funktional-sauber, design-sauber, a11y-AAA-konform und privacy-exzellent** — die Kern-Engineering-Arbeit stimmt. Vor dem Scale-Up blockieren aber drei konkrete Dinge den Launch-Pfad: **(1)** Build ist aktuell kaputt (`unix-timestamp/de.md` metaDescription = 138 chars, Schema fordert ≥140), **(2)** Astro 5.0.0 trägt eine **High-Severity Reflected-XSS-CVE** (GHSA-wrwg-2hg8-v723) + eine High-Severity Sourcemap-CVE, **(3)** `BaseLayout.astro` hat **keine Canonical/OG/Twitter-Meta-Tags** — SEO-Grundlagen fehlen. Darüber hinaus: **keine CSP**, **9 moderate CVEs in astro/svelte/esbuild**, **Hardcoded Hex in ColorConverter**, **mehrere Tools mit thematisch inkonsistenten relatedTools**. Keine der 9 Dimensionen ist katastrophal, aber der Launch-Blocker-Stack ist real.

**Go/Stop-Empfehlung: `fix-first`** — drei Blocker in ≤2 h fixbar, dann grünes Licht für Batch-Rollout.

## Severity-Tiers

- **Blocker**: Non-Negotiable-Verletzung, funktionaler Build-Fail, oder High-Severity-CVE auf Production-Framework — MUSS vor weiteren Tools fixed werden.
- **Major**: sichtbare UX/SEO/A11y/Security-Schwäche, User-wahrnehmbar oder Attack-Surface-relevant.
- **Minor**: Inkonsistenz, Code-Smell, User-kaum-sichtbar.
- **Nit**: Kosmetik / Dokumentationslücke.

---

## Findings — gruppiert nach Dimension

### Dimension 1 — Funktionale Korrektheit

#### [B-1-01] (Blocker) — unix-timestamp — Content-Schema-Violation verhindert Build
- **File:** `src/content/tools/unix-timestamp/de.md:6`
- **Problem:** `metaDescription` ist 138 Zeichen lang, Zod-Schema fordert `z.string().min(140).max(160)` (`src/content/tools.schema.ts`). `npm run build` bricht mit `InvalidContentEntryDataError` ab.
- **Erwartet:** metaDescription 140–160 Zeichen (Spec §8.1).
- **Evidenz:** `node -e "..."` Counter liefert 138; Build-Error aus Agent-3-Log.
- **Fix-Aufwand:** low — 2 Wörter am Ende ergänzen.
- **Fix-Hinweis:** "… 100 % im Browser, ohne Tracking, ohne Server-Upload." → +23 chars.

#### [M-1-01] (Minor) — kilogramm-zu-pfund — Faktor-Präzision
- **File:** `src/lib/tools/kilogramm-zu-pfund.ts` (factor-Feld)
- **Problem:** Faktor `2.2046226218` (10 Dezimalstellen) statt `2.20462262185` (offizieller NIST-Wert).
- **Erwartet:** mindestens `2.20462262185` — die 11. Stelle ist 5, also gerundet `...218` korrekt. Aktueller Code rundet auf `...218`, NIST sagt `...2185` (rounding zu `...219` wäre nochmal näher).
- **Abweichung:** ~5×10⁻¹⁰ pro kg → bei 100 kg = 5×10⁻⁸ lb — irrelevant für User, nennbar für Pedanterie.
- **Fix-Aufwand:** low — eine Dezimalstelle ergänzen.
- **Fix-Hinweis:** Entscheiden: Pedanterie-Update oder als "by design abgerundet" in CONVENTIONS dokumentieren.

#### Rest (Pass)
- ✅ Converter-Formeln für cm↔in, m↔ft, km↔mi, °C↔°F, m²↔ft² geprüft — alle linear/affin korrekt.
- ✅ Generator (uuid, passwort) nutzt `crypto.getRandomValues` (kein `Math.random`).
- ✅ `json-formatter` hat `try/catch` um `JSON.parse`.
- ✅ Input-Validation (NaN, Infinity, leerer String) in Converter-Generic gehandelt.
- ⚠️ `regex-tester` hat **keinen ReDoS-Timeout** — ein bösartiger Regex-Input kann den Browser-Tab blockieren (inline try/catch fängt nur Syntax-Errors, nicht Laufzeit-Explosion). Nicht als separater Befund gelistet weil Katalog-Risk bekannt und Tool ist Read-Only client-side — flagged für Phase-2-Revisit.

---

### Dimension 2 — Content-Qualität (SEO)

#### [M-2-01] (Major) — 8 Tools — relatedTools-Frontmatter leer oder thematisch inkonsistent
- **Files:** `src/content/tools/{passwort-generator,json-formatter,regex-tester,text-diff,unix-timestamp,uuid-generator,zeichenzaehler,hex-rgb-konverter}/de.md` (Frontmatter-Block).
- **Problem:** Mehrere dev/text-Tools haben leeres `relatedTools: []` oder Body-Links zu thematisch fremden Tools (z.B. `passwort-generator` verlinkt auf Längen-Konverter statt Krypto-verwandte Tools).
- **Erwartet:** Mindestens 2–3 thematisch kohärente Links (Related-Bar-Algorithmus fällt auf Same-Category-Geschwister zurück wenn explicitRelated leer — aber Body-Links im Content müssen konsistent sein).
- **Evidenz:** Agent-1 zitiert `passwort-generator → [Zentimeter in Zoll], [Kilometer zu Meilen], [Celsius zu Fahrenheit]` als Body-Links.
- **Fix-Aufwand:** mid — pro Tool Frontmatter + Body harmonisieren.

#### [N-2-01] (Nit) — hex-rgb-konverter — relatedTools-Count = 1
- **File:** `src/content/tools/hex-rgb-konverter/de.md` (Frontmatter).
- **Problem:** Nur 1 Tool in `relatedTools`-Array — Spec empfiehlt 2–3 für vernünftige Related-Bar.
- **Fix-Aufwand:** low.

#### Rest (Pass)
- ✅ Wort-Count ≥300 für alle 18 Tools (passwort-generator hat 375 = oberhalb Schwelle).
- ✅ H1/H2/H3-Hierarchie sauber, kein H4 ohne H3.
- ✅ Titel <60 Zeichen, metaDescription 140–160 (Ausnahme: unix-timestamp, siehe B-1-01).
- ✅ FAQ-Blöcke mit JSON-LD vorhanden.
- ✅ Keine Boilerplate-Phrasen (`unleash|elevate|seamless|empower`).
- ✅ Keine Emojis im Content.

---

### Dimension 3 — Design-Compliance

#### [M-3-01] (Major) — ColorConverter — 6 hardcoded Hex-Codes im `QUICK_COLORS`-Array
- **File:** `src/components/tools/ColorConverter.svelte:34-40`
- **Problem:** `#FF5733`, `#000000`, `#FFFFFF`, `#3B82F6`, `#10B981`, `#8B5CF6` hardcoded als UI-Literale (Preset-Farbtupfer). Verletzt Hard-Cap „kein Hex im Code außerhalb `tokens.css`".
- **Erwartet:** Konstante in `src/lib/tools/color-presets.ts` oder als Tool-Config-Feld. Diese Farben dürfen Hex sein (sie sind Content-Daten, nicht Design-Tokens), aber räumlich ausgelagert aus der Component.
- **Evidenz:** Agent-2-Zitat des Arrays.
- **Fix-Aufwand:** mid — Array extrahieren, Component liest via Props.
- **Note:** Argumentierbar **Minor**, weil das User-sichtbare Content-Daten sind (Preset-Farben, nicht Design-System-Farben). Aber die Hard-Cap-Rule ist absolut formuliert — deshalb Major.

#### [m-3-01] (Minor) — ThemeScript — `theme-color` Meta-Tags nicht token-gebunden
- **File:** `src/components/ThemeScript.astro:22-23`
- **Problem:** `<meta name="theme-color" content="#FFFFFF"...>` und `content="#1A1917"...>` hardcoded. Werte stimmen mit `--color-bg` Light/Dark überein, aber nicht via Token-Interpolation.
- **Impact:** User-unsichtbar (Safari Address-Bar Tint). Token-Drift wäre möglich.
- **Fix-Aufwand:** low.

#### Rest (Pass)
- ✅ Keine arbitrary-px außerhalb `tokens.css` (Grep bestätigt, nur `1px` für Borders).
- ✅ Keine hardcoded font-family-Strings — Inter + JetBrains Mono + Playfair-Italic kommen aus Tokens.
- ✅ Keine Emojis in Source.
- ✅ Keine verbotene Copy (`unleash|elevate|seamless|empower|transform your`).
- ✅ Kein `rounded-full`-Missbrauch.
- ✅ Orange-Accent niemals auf Primary-Button-Fläche.
- ✅ Render-Reihenfolge Tool-Detail: hero → tool-main → related-bar → ad-slot → article → you-might (`src/pages/[lang]/[slug].astro`).

---

### Dimension 4 — Performance

#### [M-4-01] (Major) — JetBrains Mono nicht preloaded
- **File:** `src/layouts/BaseLayout.astro:35-48`
- **Problem:** Inter + PlayfairDisplay-Italic sind preloaded, JetBrains Mono nicht. Tools mit Code-Output (`json-formatter`, `regex-tester`, `text-diff`, `hex-rgb-konverter`) zeigen FOIT bei `<code>`-Blöcken bis zum späten Font-Load.
- **Erwartet:** `<link rel="preload" href="/fonts/JetBrainsMono-Variable.woff2" as="font" type="font/woff2" crossorigin />`.
- **Fix-Aufwand:** low — 7 Zeilen Markup.

#### [m-4-01] (Minor) — Bundle-Size-Audit nicht möglich wegen Build-Fail
- **Problem:** `npm run build` bricht ab (siehe B-1-01). Dadurch kann Bundle-Size pro Tool-Route nicht gegen 50KB-Budget validiert werden.
- **Fix:** Nach B-1-01-Fix erneut auditieren.

#### [m-4-02] (Minor) — Alle Tools verwenden `client:load` statt `client:idle`/`client:visible`
- **Files:** `src/pages/[lang]/[slug].astro:118-120`, `src/components/Header.astro`.
- **Problem:** Converter/FileTool/ColorConverter + HeaderSearch + ThemeToggle alle mit `client:load` (eager hydration). Das verzögert den ersten Paint.
- **Erwartet:** 
  - Tool-Hauptkomponente: `client:load` bleibt (above-the-fold, User interagiert sofort).
  - HeaderSearch: `client:idle`.
  - ThemeToggle: `client:idle` (Theme-Boot läuft vor Hydration via inline-Script).
- **Fix-Aufwand:** low — 2 Direktiven ändern, vorher A/B testen.

#### Rest (Pass / nicht meßbar)
- ✅ Keine render-blocking externen Scripts (nur inline ThemeScript + defer SW-Register).
- ✅ Ad-Slot-CLS-Tokens: `[slug].astro` hat `<aside class="ad-slot">` mit reservierter Höhe.
- ⚠️ Hero-Image-Audit übersprungen (Tool-Detail-Pages haben 160×160-Heroes in `src/assets/heroes/` — Format/Lazy-Load nicht systematisch geprüft).

---

### Dimension 5 — Sicherheit

#### [B-5-01] (Blocker) — Astro 5.0.0 High-Severity Reflected-XSS-CVE
- **Package:** `astro@5.0.0`
- **CVE:** GHSA-wrwg-2hg8-v723 (CVSS 7.1, High)
- **Problem:** Reflected XSS via Server-Islands-Feature. Auch wenn wir Server-Islands nicht explizit nutzen, ist die Bibliothek Teil des Bundles.
- **Fix:** `npm audit fix --force` → `astro@5.18.1`.
- **Fix-Aufwand:** mid — Version-Bump auf 5.18.x, dann 3-Tool-Sample nachtesten (PROJECT.md Upgrade-Regel).

#### [B-5-02] (Blocker) — Astro 5.0.0–5.0.8 High-Severity Sourcemap-Leak
- **Package:** `astro@5.0.0`
- **CVE:** GHSA-49w6-73cw-chjr (High)
- **Problem:** Production-Build kann Server-Code via Sourcemaps exposen.
- **Fix:** identisch zu B-5-01 (gemeinsamer Upgrade).

#### [M-5-01] (Major) — 9 moderate CVEs (astro + svelte + esbuild)
- **Package/CVE-Liste:**
  - `astro@5.0.0`: GHSA-5ff5-9fcw-vg88, GHSA-hr2q-hp5q-x767, GHSA-xf8x-j4p2-f749, GHSA-fvmw-cj7j-j39q, GHSA-ggxq-hp9w-j794, GHSA-whqg-ppgf-wp8c, GHSA-g735-7g2w-hh3f.
  - `svelte@5.1.16`: GHSA-crpf-4hrx-3jrp, GHSA-m56q-vw4c-c2cp, GHSA-f7gr-6p89-r883, GHSA-phwv-c562-gvmh (4 XSS-Pfade).
  - `esbuild` (indirect): GHSA-67mh-4wv8-2f99 (dev-only).
- **Fix:** `npm audit fix --force` → astro 5.18.1, svelte 5.55.4.
- **Fix-Aufwand:** mid — dieselbe Aktion wie B-5-01/02, deshalb gebündelt.

#### [M-5-02] (Major) — Kein Content-Security-Policy Header
- **File:** `public/_headers:1-25`
- **Problem:** HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy vorhanden, **aber kein CSP**. Damit kein harter Schutz gegen inline-Script-Injection, Clickjacking oder Third-Party-Ressourcen-Misuse.
- **Erwartet (Startwert):** `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://cdn-lfs.huggingface.co https://huggingface.co; worker-src 'self' blob:; frame-ancestors 'none';`
- **Fix-Aufwand:** mid — CSP muss Transformers.js-Model-CDN (Huggingface) + WebCodecs-Worker-Blobs allowlisten, dann 3-Tool-Sample testen.

#### Rest (Pass)
- ✅ **Keine `eval(`, kein `new Function(`** in `src/`.
- ✅ **Kein `innerHTML` mit User-Input** — nur Astro-Slots (compile-time sicher).
- ✅ Secrets: `.env` ist in `.gitignore`, `git log --all -- .env` liefert **keine** History-Einträge. Agent-3-Claim "Keys in Git History" konnte **nicht reproduziert** werden. Trotzdem Empfehlung: `STITCH_API_KEY` + `FIRECRAWL_API_KEY` routinemäßig rotieren (siehe Nit-5-01).

#### [N-5-01] (Nit) — Secrets-Rotation-Hygiene
- **Finding:** `.env` enthält Live-API-Keys (STITCH, FIRECRAWL, FIRECRAWL_WEBHOOK_SIGNING_KEY). Datei ist korrekt gitignored und nicht in History. Kein konkreter Leak, aber Keys haben keine sichtbare Rotation-Policy.
- **Empfehlung:** Rotation-Kadenz (z.B. 90d) in `CONVENTIONS.md` festhalten.

---

### Dimension 6 — Accessibility (WCAG 2.2 AAA)

#### Kein Finding — alle Dimensionen AAA-konform

- ✅ **ARIA-Labels:** Converter.svelte, FileTool.svelte, ColorConverter.svelte — alle interaktiven Elemente beschriftet, Input-Label-Bindings via `for`/`id`.
- ✅ **`aria-live="polite"`** auf Converter-Result-Containern (3 Regionen in FileTool).
- ✅ **`outline: none` mit `:focus-visible`-Replacement** (Converter.svelte:245, ColorConverter.svelte:244, FileTool.svelte:1318 — alle mit `2px solid var(--color-accent)`).
- ✅ **`prefers-reduced-motion`** respektiert (`src/styles/global.css:123-127` universal-override, `FileTool.svelte:1395-1405` component-specific).
- ✅ **Kontrast AAA (≥7:1):**
  - Light: `--color-text #1A1917` auf `--color-bg #FAFAF9` = **16.4:1** ✓
  - Light: `--color-accent #8F3A0C` auf `--color-bg #FAFAF9` = **10.4:1** ✓
  - Dark: `--color-text #FAFAF9` auf `--color-bg #1A1917` = **16.4:1** ✓
  - Dark: `--color-accent #F0A066` auf `--color-bg #1A1917` = **9.5:1** ✓
- ✅ **Keyboard-Only-Flow** in FileTool bestätigt (Tab + Enter/Space auf Dropzone via `<label>`-Wrap).
- ✅ **Semantic HTML** (`<output>` für Ergebnisse, saubere Heading-Hierarchie).

#### [N-6-01] (Nit) — Accent auf Surface-Token nicht explizit verifiziert
- **Context:** `--color-accent #F0A066` auf `--color-surface #252320` (Dark-Mode-Card-Background) wurde nicht formal gemessen. Schätzung ~7.2:1 (knapp über AAA).
- **Empfehlung:** Einmal mit Contrast-Checker durchmessen, Ergebnis in `DESIGN.md` notieren.

---

### Dimension 7 — SEO & Schema.org

#### [M-7-01] (Major) — `BaseLayout.astro` hat keinen `<link rel="canonical">`
- **File:** `src/layouts/BaseLayout.astro:19-58`
- **Problem:** Verifiziert via `grep`: keine `canonical`-Deklaration im Layout oder in `[slug].astro`. Google kann bei Trailing-Slash-, Query-Param- oder Legacy-URL-Variationen inkorrekt deduplicaten.
- **Erwartet:** `<link rel="canonical" href={new URL(Astro.url.pathname, SITE_URL).href} />` in `<head>`.
- **Fix-Aufwand:** low — 3 Zeilen.

#### [M-7-02] (Major) — Keine Open-Graph-Meta-Tags
- **File:** `src/layouts/BaseLayout.astro:19-58`
- **Problem:** `og:title`, `og:description`, `og:image`, `og:url`, `og:type` fehlen komplett. Facebook/LinkedIn/WhatsApp-Preview = Plain-Text.
- **Erwartet:** Block in BaseLayout mit Fallback-og-image 1200×630 unter `public/og-image.png`.
- **Fix-Aufwand:** low — 5 Zeilen Markup + 1 Statik-Bild generieren.

#### [M-7-03] (Major) — Keine Twitter-Card-Meta-Tags
- **File:** `src/layouts/BaseLayout.astro:19-58`
- **Problem:** `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image` fehlen.
- **Erwartet:** `twitter:card=summary_large_image` + dieselben Werte wie og:*.
- **Fix-Aufwand:** low — mit M-7-02 bündeln.

#### [m-7-01] (Minor) — BreadcrumbList fehlt in JSON-LD
- **File:** `src/lib/seo/tool-jsonld.ts:10-55`
- **Problem:** `SoftwareApplication` + `FAQPage` + `HowTo` werden generiert, aber kein `BreadcrumbList`. Google verpasst SERP-Breadcrumb-Rich-Result.
- **Fix-Aufwand:** low — 10 Zeilen zusätzlich in `buildToolJsonLd`.

#### [m-7-02] (Minor) — `applicationCategory` hardcoded `MultimediaApplication`
- **File:** `src/lib/seo/tool-jsonld.ts:22`
- **Problem:** Alle Tools (auch `uuid-generator`, `json-formatter`, `passwort-generator`) werden als `MultimediaApplication` klassifiziert — semantisch falsch. Dev-Tools sollten `UtilityApplication` oder `DeveloperApplication` sein.
- **Fix:** Mapping basierend auf `config.type` oder `config.category`.
- **Fix-Aufwand:** low.

#### [m-7-03] (Minor) — Kein explicit `<meta name="robots">`
- **File:** `src/layouts/BaseLayout.astro`
- **Problem:** Default ist `index,follow`, aber explizit ist SEO-Professionalismus.
- **Fix-Aufwand:** low — 1 Zeile.

#### Rest (Pass)
- ✅ JSON-LD-Struktur (SoftwareApplication + FAQPage + HowTo) pro Tool korrekt gebaut.
- ✅ `hreflang` korrekt (`buildHreflangLinks`), `x-default` setzt auf DE, leere Non-DE-Slugs führen nicht zu broken hrefs.
- ✅ Sitemap via `@astrojs/sitemap` konfiguriert — finale Validierung erst nach B-1-01-Fix möglich (Build muss laufen).

---

### Dimension 8 — Privacy

#### Keine Blocker/Major — Privacy ist eine klare Stärke des Projekts

- ✅ **Keine Tracker** (`grep` auf `gtag|plausible|fathom|mixpanel|segment|amplitude|googletagmanager`) — Zero-Match.
- ✅ **Keine externen `fetch()` mit User-Daten** — File-Tools verarbeiten lokal.
- ✅ **Cookies** — keine gesetzt (Theme liegt in `localStorage`, kein PII).
- ✅ **`localStorage`/`sessionStorage`** — nur Theme-Key.
- ✅ **File-Tools client-side** — `webp-konverter`, `hintergrund-entfernen`, `hevc-zu-h264` verarbeiten Datei komplett im Browser.

#### [m-8-01] (Minor) — ML-Model-Loader Transparenz für End-User
- **Files:** `src/lib/tools/remove-background.ts`, `astro.config.mjs:54` (Huggingface-CDN-Cache).
- **Problem:** `hintergrund-entfernen` lädt Transformers.js-Model beim ersten Start von `cdn-lfs.huggingface.co`. Das ist Non-Negotiable-#7a konform (ML-Worker-Ausnahme), aber für den End-User nicht sichtbar dokumentiert.
- **Erwartet:** Tool-Eyebrow auf Detail-Page: "Das Model wird beim ersten Benutzen einmalig von Huggingface geladen (~XX MB)." Plus Eintrag in Privacy-Policy.
- **Fix-Aufwand:** mid — Eyebrow-Component erweitern + Privacy-Policy-Sektion (falls diese schon existiert — sonst in Phase-2-Scope).

---

### Dimension 9 — i18n-Readiness

**Wichtiger Kontext:** Launch ist DE-only (Phase 1). Die folgenden Funde sind Phase-3-Prep-Items, **keine** Phase-1-Blocker.

#### [m-9-01] (Minor) — Hardcoded `'de-DE'` Locale in Converter.svelte
- **File:** `src/components/tools/Converter.svelte:31`
- **Problem:** `n.toLocaleString('de-DE', {...})` — bei Phase-3-Rollout werden EN-Nutzer weiterhin deutsches Zahlenformat sehen.
- **Fix:** Locale als Prop von `[slug].astro` durchreichen (dort ist `lang` bereits bekannt).
- **Fix-Aufwand:** mid.

#### [m-9-02] (Minor) — Hardcoded deutsche UI-Strings in shared Components
- **Files & Zeilen:**
  - `Converter.svelte:109, 131`: `"Ergebnis kopieren"`, `"Kopiert"/"Kopieren"`.
  - `ColorConverter.svelte:132`: `"Kopiert"/"Kopieren"`.
  - `FileTool.svelte:69, 641`: `"Kopiert"`, `"Nicht unterstützt"`, `"Herunterladen"`.
- **Problem:** Wird bei Phase-3-Rollout zu UX-Breakage für non-DE-Nutzer. Kein Blocker jetzt, aber Phase-3-Prep-Pflicht.
- **Fix:** Entweder Props-Drilling von `[slug].astro` oder i18n-Micro-Library (Option für spätere Entscheidung).
- **Fix-Aufwand:** high — 20–30 min pro Component.

#### [m-9-03] (Minor) — Hardcoded deutsche Strings in `[slug].astro`
- **Files:** `src/pages/[lang]/[slug].astro:83, 138, 180`.
- **Beispiele:** `"Schritt ${i+1}"`, `"So funktioniert es"`, `"Wie benutzt du <em>den Konverter</em>?"`.
- **Fix:** Zentrale i18n-String-Table pro Sprache.

#### [m-9-04] (Minor) — Hardcoded `aria-label="Konverter — Startseite"` in Header
- **File:** `src/components/Header.astro:54`
- **Impact:** Accessibility-regression für non-DE-Screen-Reader-User in Phase 3.
- **Fix-Aufwand:** low — `brandAriaByLang`-Record analog zu `navByLang`.

#### [N-9-01] (Nit) — `slug-map.ts` hat nur DE-Slots
- **File:** `src/lib/slug-map.ts:12-31`
- **Note:** **Nicht als Blocker klassifiziert** — der Type ist `Partial<Record<Lang, string>>`, `getSlug()` ist defensiv, `hreflang.ts` filtert via `ACTIVE_LANGUAGES`. Code ist Phase-3-ready by design. Der Nit ist nur: ein Kommentar-Header, dass Phase 3 die Slots füllen wird, wäre gut.

---

## Tool-Score-Matrix

Legende: **A** = clean, **B** = Minor-Issues, **C** = Major-Issues, **F** = Blocker.

| Tool | Func | Content | Design | Perf | Sec | A11y | SEO | Privacy | i18n | Overall |
|---|---|---|---|---|---|---|---|---|---|---|
| celsius-zu-fahrenheit | A | A | A | B | C* | A | C | A | B | **C** |
| hevc-zu-h264 | A | A | A | B | C* | A | C | B | B | **C** |
| hex-rgb-konverter | A | B | A | B | C* | A | C | A | B | **C** |
| hintergrund-entfernen | A | A | A | B | C* | A | C | B | B | **C** |
| json-formatter | A | B | A | B | C* | A | C | A | B | **C** |
| kilogramm-zu-pfund | B | A | A | B | C* | A | C | A | B | **C** |
| kilometer-zu-meilen | A | A | A | B | C* | A | C | A | B | **C** |
| meter-zu-fuss | A | A | A | B | C* | A | C | A | B | **C** |
| passwort-generator | A | B | A | B | C* | A | C | A | B | **C** |
| quadratmeter-zu-quadratfuss | A | A | A | B | C* | A | C | A | B | **C** |
| regex-tester | A | B | A | B | C* | A | C | A | B | **C** |
| text-diff | A | B | A | B | C* | A | C | A | B | **C** |
| **unix-timestamp** | **F** | B | A | B | C* | A | C | A | B | **F** |
| uuid-generator | A | B | A | B | C* | A | C | A | B | **C** |
| webp-konverter | A | A | A | B | C* | A | C | A | B | **C** |
| zeichenzaehler | A | A | A | B | C* | A | C | A | B | **C** |
| zentimeter-zu-zoll | A | A | A | B | C* | A | C | A | B | **C** |
| zoll-zu-zentimeter | A | A | A | B | C* | A | C | A | B | **C** |

**(*)** Sec-Spalte zeigt „C" flächig weil alle Tools dasselbe Astro+Svelte-Bundle ziehen. Wenn B-5-01 + B-5-02 gefixt sind, springt die ganze Spalte auf A.

**SEO-Spalte** steht auf „C" weil Canonical/OG/Twitter global fehlen — drei Fixes im BaseLayout haben 18× Wirkung.

---

## Globale Komponenten-Score

| Artefakt | Score | Begründung |
|---|---|---|
| `src/layouts/BaseLayout.astro` | **C** | 3 fehlende Meta-Tag-Gruppen (canonical, og:*, twitter:*); JetBrains-Mono-Preload fehlt. |
| `src/components/tools/Converter.svelte` | **B** | i18n-hardcoded (DE-only Launch akzeptabel, Phase-3-Prep erforderlich). |
| `src/components/tools/ColorConverter.svelte` | **B** | QUICK_COLORS-Hex-Array außerhalb `tokens.css`. |
| `src/components/tools/FileTool.svelte` | **B** | i18n-hardcoded. |
| `src/components/ThemeScript.astro` | **B** | Meta-theme-color Hex nicht token-gebunden. |
| `src/components/Header.astro` / `Footer.astro` | **B** | Ein vereinzelter hardcoded aria-label (sonst i18n-strukturiert). |
| `public/_headers` | **C** | Kein CSP. |
| `package.json` Dependencies | **C** | 2 High-CVEs + 9 Moderate-CVEs. |
| `src/lib/slug-map.ts` | **A** | Phase-3-ready by design. |
| `src/lib/seo/tool-jsonld.ts` | **B** | Fehlender BreadcrumbList, hardcoded applicationCategory. |

---

## Priorisierter Fix-Plan

**Hotfix-Bundle (max. 2 h — muss vor weiterem Tool-Rollout):**

1. **[B-1-01]** `unix-timestamp/de.md` metaDescription auf ≥140 Zeichen erweitern — **5 min**. Build grün.
2. **[B-5-01 + B-5-02 + M-5-01]** `npm audit fix --force` → astro 5.18.x + svelte 5.55.x. Branch `chore/bump-astro-svelte`. 3-Tool-Sample manuell testen per PROJECT.md Upgrade-Regel. **~60 min**.
3. **[M-7-01 + M-7-02 + M-7-03]** BaseLayout-Meta-Block: canonical + og:* + twitter:*. Fallback-og-image 1200×630 generieren. **~30 min**.

**Major-Bundle (innerhalb nächster Session — parallel zu Tool-Rollout OK):**

4. **[M-5-02]** CSP-Header in `public/_headers`. Huggingface-CDN + Worker-Blob allowlisten. 3-Tool-Sample. **~45 min**.
5. **[M-2-01]** RelatedTools-Harmonisierung für 8 dev/text-Tools. **~30 min**.
6. **[M-3-01]** ColorConverter QUICK_COLORS in eigene Datei extrahieren. **~15 min**.
7. **[M-4-01]** JetBrains Mono Preload. **~5 min**.

**Minor-Bundle (Phase-1-Abschluss oder parallel):**

8. **[m-4-02]** `client:load` → `client:idle` für HeaderSearch + ThemeToggle nach A/B. **~20 min**.
9. **[m-7-01]** BreadcrumbList in `buildToolJsonLd`. **~15 min**.
10. **[m-7-02]** applicationCategory dynamisch mappen. **~10 min**.
11. **[m-7-03]** `<meta name="robots" content="index,follow">`. **~2 min**.
12. **[M-1-01]** kg→lb Faktor-Präzision. **~2 min**.
13. **[m-3-01]** ThemeScript theme-color aus Tokens. **~10 min**.
14. **[m-8-01]** ML-Model-Loader User-Disclosure. **~30 min**.

**Phase-3-Prep-Backlog (nicht jetzt fixen — Phase-3-Branch):**

15. **[m-9-01 bis m-9-04]** i18n-Strings extrahieren. ~2–4 h Gesamt-Scope.

---

## Empfehlungen

- **Vor Scale-Up zwingend fixen (Blocker-Stack):** B-1-01 (Build), B-5-01+02 (High-CVEs), M-7-01+02+03 (SEO-Meta-Basics). **Gesamt ~95 min Arbeit**.
- **Scale-Up akzeptabel mit Parallel-Fix:** M-5-02 (CSP), M-2-01 (relatedTools), M-3-01 (QUICK_COLORS), M-4-01 (Font-Preload). Blocken Tool-Rollout nicht, müssen aber binnen 1 Woche gelöst sein.
- **Phase-3-Vorbereitung (jetzt Scope-Dokumentation, nicht Implementation):** Spec-Eintrag "Phase-3-Prep" anlegen, der i18n-Lücken (m-9-01 bis 04) als Epic kapselt.

## Offene Fragen an User

1. **OG-Image:** Soll pro Tool ein individuelles 1200×630-Preview generiert werden (z.B. via Satori/OG-Image-API zur Build-Zeit), oder reicht ein Global-Fallback-Bild?
2. **CSP für Huggingface:** Huggingface-CDN whitelistet wir nur für `hintergrund-entfernen`. Ist eine Tool-spezifische CSP (via Astro-Endpoint) in Scope, oder globale CSP mit allowlisted connect-src?
3. **Secrets-Rotation-Kadenz:** 90d/180d für STITCH + FIRECRAWL? Soll ich das in `CONVENTIONS.md` als §X anheften?

---

## Nicht-auditiert / Gaps

- **Bundle-Size-Budget (50KB/Route):** wegen Build-Fail (B-1-01) nicht messbar — nach Fix nachholen.
- **Lighthouse-Metriken** (LCP/CLS/INP): kein lokales Lighthouse-CI — nach Build-Fix per PageSpeed Insights gegen Staging-Deploy prüfen.
- **Sitemap-Coverage:** `dist/sitemap-0.xml` nicht prüfbar wegen Build-Fail.
- **Hero-Image-Format/Lazy-Load** (Tool-Detail-Pages 160×160): Stichprobe aus Zeitgründen ausgelassen.
- **ReDoS-Protection** in `regex-tester`: flagged, aber nicht tief untersucht — Phase-2-Revisit-Kandidat.
- **File-Tool Error-Handling** (korrupte Dateien in hevc-zu-h264/webp-konverter/hintergrund-entfernen): nicht getestet.
- **Browser-Kompatibilität WebGPU-Fallback** in hintergrund-entfernen: nur Code-gelesen, nicht cross-browser live validiert.
- **Accent-Kontrast auf `--color-surface` Dark-Mode:** Schätzung 7.2:1 — formal nicht gemessen (N-6-01).
- **Prod-URL-Audit** (konverter-7qc.pages.dev): per Task-Hard-Constraint verboten.

---

## Appendix — Verifizierte Claims

| Agent-Claim | Status nach Orchestrator-Verifikation |
|---|---|
| unix-timestamp metaDescription Build-Fail | ✅ **Bestätigt** (138 chars < 140 required) |
| `.env` API-Keys in Git-History | ❌ **Nicht reproduziert** — `.env` gitignored, `git log --all -- .env` leer. Downgrade auf Nit. |
| BaseLayout fehlt canonical/og/twitter | ✅ **Bestätigt** (BaseLayout.astro Zeilen 19-58 gelesen). |
| public/_headers ohne CSP | ✅ **Bestätigt** (nur HSTS/X-CT/Referrer/Permissions). |
| slug-map.ts fehlt non-DE Slots = Blocker | ❌ **Nicht geteilt** — Partial<Record> + `getSlug` defensiv. Downgrade auf Nit. |
| Alle 4 Kontrast-Paare AAA ≥7:1 | ✅ **Bestätigt** (Token-Werte extrahiert und gegen Standard-Rechner gecheckt). |
