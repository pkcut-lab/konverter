# Code-Konventionen

> **Status:** Final ab Session 4. Sessions 5–7 (Prototypen-Lock) ergänzen die
> Tool-Component-, File-Tool- und Astro-Hydration-Sektionen. Signaturen in
> `src/` sind ab Session 7 für Phase-1-Skalierung gelockt — Änderungen brauchen
> einen expliziten Spec-Update + Test-Migration.

## Verbindlich ab Session 1

- **Commit-Format:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`)
- **Commit-Trailer (PFLICHT):** `Rulebooks-Read: <Liste>` (z.B. `Rulebooks-Read: PROJECT, CONVENTIONS, CONTENT`)
- **Verboten:** `any`, `@ts-ignore`, Default-Exports für Tool-Configs
- **Paths:** Relative Imports (`./`, `../`). Aliase werden NICHT benutzt, bis ein konkreter Bedarf auftaucht (YAGNI).
- **Git-Account:** `pkcut-lab` exklusiv. Pre-Commit-Hook (`scripts/check-git-account.sh`) lehnt fremde Accounts ab.

## File-Layout (gelockt Session 4)

```
src/
├── lib/
│   ├── hreflang.ts         # Phase-aware alternate-link builder
│   ├── site.ts             # SITE_URL constant
│   ├── slug-map.ts         # Tool-ID ↔ Slug pro Lang
│   └── tools/
│       ├── types.ts        # Lang, Result<T,E>
│       ├── schemas.ts      # Zod-Schemas für 9 Tool-Typen + parseToolConfig()
│       └── {tool-id}.ts    # Pro Tool: Config-Export (kein iconPrompt — entfernt 2026-04-20)
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   ├── ThemeToggle.svelte
│   └── tools/              # 9 generische Svelte-Komponenten (ab Session 5)
├── layouts/
│   └── BaseLayout.astro
├── content/
│   ├── config.ts           # Astro Collection-Registration (dünn)
│   ├── tools.schema.ts     # Pure Zod frontmatter schema (testbar)
│   └── tools/
│       └── {slug}/
│           └── {lang}.md   # Content pro Tool pro Sprache
├── pages/
│   ├── index.astro         # / → redirect zu /de/
│   └── [lang]/
│       ├── index.astro
│       ├── styleguide.astro
│       └── [slug].astro    # Dynamic tool route (ab Session 5)
└── styles/
    └── tokens.css
```

## Zod-Schemas (gelockt Session 4)

- Tool-Configs: `src/lib/tools/schemas.ts`. Discriminated Union auf `type`.
- Content-Frontmatter: `src/content/tools.schema.ts`. Pure Zod, testbar isoliert.
- **Function-Fields in Tool-Configs:** `z.function()` (runtime callable-check). Signatur-Typisierung via `z.infer<>` + Author-Override bei Variable-Deklaration.
- **`parseToolConfig(input: unknown): Result<ToolConfig, string>`** ist das einzige externe Entry-Point für Config-Parsing. Direkt-Import der einzelnen Schemas nur in Tests.

## Naming

- **Slugs:** kebab-case, ASCII-only (`meter-zu-fuss`, NICHT `meter-zu-fuß`). Regex: `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- **Tool-IDs:** kebab-case (sprach-neutral). Regex gleich wie Slug. Beispiel: `meter-to-feet`.
- **Category-IDs:** kebab-case (`laengen`, `farben`, `datei-konverter`).
- **TypeScript-Variablen:** camelCase (`meterZuFuss: ConverterConfig`).
- **Astro-Props-Interfaces:** PascalCase (`interface Props { ... }`).

## Result-Type (gelockt Session 4)

```typescript
export type Result<T, E = string> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };
```

Exportiert aus `src/lib/tools/types.ts` via `ok()` / `err()` Konstruktoren. Alle Parser, Validators, File-Loader, die fehlschlagen können, geben `Result` zurück — **keine Exceptions** für erwartbare Fehler.

## Testing

- **Framework:** Vitest 2.1.8. `vitest.config.ts` gelockt (jsdom + `resolve.conditions: ['browser']`).
- **Location:** `tests/**/*.test.ts` spiegelt `src/`-Struktur.
- **Pro Zod-Schema:** mindestens 1 valid-Fixture + 1 invalid-Fixture.
- **Pro Pure-Funktion:** happy-path + mindestens 1 Edge-Case.
- **Svelte-Components:** `mount`, `unmount`, `flushSync` aus `svelte`; `client:load`-Hydration wird im jsdom-Env simuliert.
- **KEINE Astro-Runtime-Tests** in Vitest — Astro-Integration verifiziert `npm run build` + `npm run check`.

### jsdom-25 Workarounds (gelockt Session 7)

- **`Blob/File.prototype.arrayBuffer` ist nicht implementiert** in jsdom 25. Bei File-Tool-Tests per-instance patchen, NICHT global stubben:
  ```ts
  function makeFile(name: string, type: string, sizeBytes: number): File {
    const buf = new Uint8Array(sizeBytes);
    const file = new File([buf], name, { type });
    Object.defineProperty(file, 'arrayBuffer', {
      value: () => Promise.resolve(buf.buffer),
      configurable: true,
    });
    return file;
  }
  ```
- **`URL.createObjectURL` / `revokeObjectURL`** mit `vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:mock-url'), revokeObjectURL: vi.fn() })` in `beforeEach`. Nach jedem Test `vi.unstubAllGlobals()`.
- **Async-Flush:** Promise-Chains aus `processor()` brauchen mehrere Microtask-Ticks. Helper `flushAsync(ticks=6)`: `for (i…) { await Promise.resolve(); flushSync(); }`. Einfaches `await`-`flushSync` reicht nicht, sobald `arrayBuffer()` + `processor()` + `createObjectURL()` in derselben Promise-Kette liegen.
- **`processRegistry`-Spy:** Test-Prozessor unter `processRegistry['test-file-tool']` registrieren und in `beforeEach` mit `delete` aufräumen — den echten Production-Eintrag (`'png-jpg-to-webp'`) NICHT überschreiben.

## Svelte

- **Runes-only** (`$state`, `$derived`, `$effect`). Kein `writable`/`readable` aus `svelte/store`.
- **Hydration:** `client:load` für alles mit Theme/Locale-Abhängigkeit (Flash-Prevention, Section 5.2 Spec). `client:idle` nur nach expliziter Spec-Referenz.
- **Props:** TypeScript-Interface `interface Props { ... }`, via `let { foo }: Props = $props()` destructured.
- **State-Generics:** `$state<T>()` immer typisiert (`let phase = $state<Phase>('idle')`, nicht `let phase = $state('idle')`). Inferenz auf String-Literal-Union geht sonst verloren.
- **`data-testid`-Pflicht:** Jedes interaktive Element + Status-Region kriegt ein `data-testid="<componenttype>-<role>"` (z.B. `filetool-input`, `filetool-error`, `converter-output`). Tests wählen ausschließlich darüber, nie über CSS-Klassen.

## Components (gelockt Session 9)

- **`Loader.svelte`** (`src/components/Loader.svelte`) — geteilte Komponente mit zwei Varianten:
  - `variant="spinner"` — indeterminiert, 24×24, 1px-Hairline-Arc, `var(--color-text-subtle)`.
  - `variant="progress"` — determiniert, `value: 0..1`, optionales `label`, 1px-Hairline-Bar mit Mono-Tabular-Label rechts.
  - `prefers-reduced-motion: reduce`: Spinner dreht langsam weiter (`animation-duration: 2.4s`) — nicht einfrieren, sonst verschwindet das Loading-State-Signal und die UI wirkt abgestürzt. Progress-Bar entfernt nur die Width-`transition`.
  - Verwendung: Jede Tool-Komponente mit Lazy-Loading oder Long-Running-Work nutzt `Loader` — keine Komponenten-eigenen Spinner.

## SEO / JSON-LD (gelockt Session 9)

- **`buildToolJsonLd()`** in `src/lib/seo/tool-jsonld.ts` — pure Builder, emittiert drei Schema.org-Blöcke:
  - `SoftwareApplication` (immer, `applicationCategory: 'MultimediaApplication'`, `offers.price: '0'`, `priceCurrency: 'EUR'`, `inLanguage`-Feld).
  - `FAQPage` nur wenn `faq.length > 0`.
  - `HowTo` nur wenn `steps.length > 0` (steps mit 1-indexierter `position`).
- Wired in `src/pages/[lang]/[slug].astro`: Mapping `entry.data.language → lang`, `metaDescription → description`, `howToUse → steps` (Title `"Schritt N"`, DE-only bis Phase 3).
- Emission als `<script is:inline type="application/ld+json" set:html=...>` — ein Script-Block pro Schema.
- Greift auf jeder Tool-Seite (meter-zu-fuss, webp-konverter, hintergrund-entfernen) — nicht BG-Remover-spezifisch.

## Tool-Components (gelockt Session 5–7)

Zwei Templates decken alle 9 Tool-Typen aus `schemas.ts` ab:

| Template | Type-Discriminator | Use-Case |
|----------|--------------------|----------|
| `Converter.svelte` | `converter` | Numeric/Text-In → Numeric/Text-Out (Längen, Währung, Code-Format) |
| `FileTool.svelte`  | `file-tool`  | Binary-In → Binary-Out (Bilder, PDFs, Audio — alles client-side) |

**Generische Komponente, Tool-spezifisches Verhalten kommt aus der Config.** Komponenten dürfen NICHT auf `config.id` switchen — alles Tool-spezifische lebt in der Config (Formel, Units, Decimals, Examples) oder in einem registrierten Pure-Module.

**Routing:** Beide Templates werden in `src/pages/[lang]/[slug].astro` über eine **statische** `componentByType`-Map dispatched:

```astro
const componentByType = {
  converter: Converter,
  'file-tool': FileTool,
} as const;

// ...

{config.type === 'converter' && <Converter config={config} client:load />}
{config.type === 'file-tool' && <FileTool config={config} client:load />}
```

**Astro-Hydration-Limitation (HART):** `client:load` wird **silent gedroppt**, wenn die Component-Referenz dynamisch ist (`<DynamicCmp client:load />`). Immer explizite Conditional-Renders mit statisch importierten Component-Namen verwenden. Beim Hinzufügen eines neuen Tool-Typs MUSS sowohl `componentByType` als auch der Conditional-Block ergänzt werden — fehlt einer, schlägt der `if (!(config.type in componentByType))`-Guard im Frontmatter zur Build-Zeit zu.

## File-Tool-Pattern (gelockt Session 7, erweitert Session 9)

**Astro-SSR-Limitation (HART):** Astro serialisiert Island-Props zu JSON. Functions in der Tool-Config (`FileToolConfig.process`, `prepare`, `reencode`) überleben nur server-seitig — auf dem Client landen sie als `null`. Daher: Client-Dispatch läuft über `src/lib/tools/tool-runtime-registry.ts`, keyed by `config.id`.

**Registry-Shape (Session 9):**

```typescript
interface ToolRuntime {
  process: ProcessFn;            // required
  prepare?: PrepareFn;           // optional — lazy-load step (ML-Modell etc.)
  reencode?: ReencodeFn;         // optional — z.B. Format-Wechsel ohne Re-Inference
  isPrepared?: () => boolean;    // lazy-load-Flag; Runtime ist source of truth, kein Component-local flag
  clearLastResult?: () => void;  // Reset-Pfad — befreit Bitmap-Caches
}
```

**Drei-Touch-Pattern für neue File-Tools:**

1. **Pure Processor-Module** unter `src/lib/tools/<verb>-<format>.ts` — exportiert `(input: Uint8Array, opts?: …) => Promise<Uint8Array>`. Keine DOM-, Window- oder Canvas-Imports im Top-Level (jsdom verträgt das nicht); Worker-Boundary darunter ist OK.
2. **Tool-Config** unter `src/lib/tools/<tool-id>.ts` — `FileToolConfig` mit `id`, `accept[]`, `maxSizeMb`, `process` (verweist aufs Pure-Module für Server-Seite). Session-9-neue optionale Felder: `prepare`, `defaultFormat`, `cameraCapture`, `filenameSuffix`, `showQuality`. (`iconPrompt` entfernt 2026-04-20 mit dem Tool-Icon-Rollback.)
3. **Dispatch-Eintrag** in `src/lib/tools/tool-runtime-registry.ts` — neuer Key `'<tool-id>'` mit `{ process, prepare?, reencode?, isPrepared?, clearLastResult? }`.

Außerdem: `tool-registry.ts` (Tool-Existenz) + `slug-map.ts` (Slug pro Lang) — gleiche Schritte wie bei `converter`.

**Session-9-Defaults für `FileToolConfig`:**
- `cameraCapture` defaulted auf `true`, wenn `accept[]` irgendeinen `image/*`-MIME enthält.
- `showQuality` defaulted auf `true`.
- `prepare`, `defaultFormat`, `filenameSuffix` haben keine Defaults und sind nur für Tools nötig, die sie aktiv brauchen.

**FileTool-Phase-Machine (erweitert Session 9):** `idle → preparing → converting → done | error`. `preparing` ist der neue Lazy-Load-Pfad für ML-Tools — sichtbar als `Loader variant="progress"` mit "Lädt einmalig Modell …"-Status. Auf Revisit (`isPrepared() === true`) wird `preparing` übersprungen, um UI-Flash zu vermeiden.

**FileTool-Eingabekanäle (Session 9):** Clipboard-Paste (`Strg+V`) + Mobile-Kamera-Capture (`capture="environment"`) + HEIC-Pre-Decode via `src/lib/tools/heic-decode.ts` sind FileTool-Defaults. `heic-decode.ts` lazy-importiert `heic2any` nur in Non-Safari-Browsern (~30 KB gzip gespart auf iOS/macOS).

**Stall-Watchdog-Pattern (Session 9):** `prepare`-Implementierungen mit langer Laufzeit (Modell-Download) akzeptieren ein `{ stallTimeoutMs }` (Default `120_000`) und werfen einen typisierten `StallError`, wenn kein Progress-Event im Window ankommt. Implementation-Referenz: `src/lib/tools/remove-background.ts`.

## Astro Routes (gelockt Session 5)

- **Dynamic-Route:** `src/pages/[lang]/[slug].astro` ist die einzige Tool-Route. `getStaticPaths()` enumeriert Content-Collection × Slug-Map.
- **Frontmatter-Guards:** `getToolConfig()` + `componentByType[config.type]` werfen explizit, wenn ein Tool keine Registry-/Map-Einträge hat — niemals silent fallback.
- **`.prose` Utility** lebt in `src/styles/global.css`. Keine `:global()`-Duplikate in Page-Scoped-Styles.

## CSS

- **Tailwind Utility-First** in Astro/Svelte-Markup.
- **Custom-CSS** NUR in `src/styles/tokens.css` und direkt in `<style>`-Blöcken von Komponenten (scoped).
- **Neue Tokens:** IMMER in beiden `:root`-Blöcken (light + dark) pflegen. Contrast ≥ 7:1 (WCAG AAA).
- **Hex-Codes außerhalb tokens.css verboten** — immer `var(--color-*)` / `var(--space-*)` / etc.

## PWA / Service Worker (gelockt Session 10)

- **Manifest ist Source-of-Truth:** `public/manifest.webmanifest` wird von Hand gepflegt. `@vite-pwa/astro` läuft mit `manifest: false`, damit Smoke-Tests feste Felder pinnen können.
- **Icon-Regeneration:** `node scripts/generate-pwa-icons.mjs` manuell nach SVG-Änderungen. PNGs werden committed; CI rasterisiert nicht (keine `sharp`-Build-Dep).
- **Maskable Safe-Zone:** 80% innen — zentrale Paths auf `icon-maskable.svg` bleiben im 0.1×0.1→0.9×0.9-Viewbox-Bereich, sonst beißt Android sie ab.
- **SW Scope:** `registerType: 'autoUpdate'` + `clientsClaim: true` + `skipWaiting: true`. Updates greifen ohne zweiten Refresh.
- **Precache-Pattern:** Lazy-Chunks (`FileTool.*.js`, `heic2any.*.js`, `onnx*.js`, `*.wasm`) werden via `globIgnores` ausgeschlossen — sonst zahlt jeder Erstbesucher den 1.5 MB ML-Overhead, auch auf reinen Info-Seiten.
- **Runtime-Caching-Regeln:** neue externe Origins werden hier gepinnt, nicht im Component-Code. Aktuell: `CacheFirst` für `huggingface.co` (immutable Model-Weights, 30 Tage), `StaleWhileRevalidate` für `/pagefind/*`.
- **registerSW manuell:** Das Plugin injiziert `/registerSW.js` NICHT automatisch — `BaseLayout.astro` referenziert es explizit per `<script is:inline defer src="/registerSW.js">`.

## Pagefind (gelockt Session 10)

- **Build-Step:** `npm run build` = `astro build && pagefind --site dist`. Pagefind ist devDependency, läuft nicht in `astro dev`.
- **Index-Scoping:** `<main data-pagefind-body>` in `BaseLayout.astro` isoliert den Such-Body — Header/Footer-Chrome (Wordmark, Lang-Toggle-Labels) darf nicht das Ergebnis jeder Query dominieren. `<header data-pagefind-ignore>` als Gürtel-und-Hosenträger.
- **Multi-Lang:** Pagefind indexiert per `<html lang>` automatisch nach Sprache. Jeder neue Sprach-Shard braucht keine Extra-Konfiguration.
- **UI-Komponente:** `HeaderSearch.svelte` lädt `/pagefind/pagefind-ui.{js,css}` dynamisch zur Laufzeit. Dev-Fallback: disabled Input ohne Crash, wenn Bundle fehlt.
- **CSS-Override-Punkt:** Pagefind-Styling geht AUSSCHLIESSLICH über `.pagefind-ui { --pagefind-ui-*: var(--color-*) }` in `src/styles/global.css`. Keine Komponenten-lokalen Overrides, sonst divergiert die Search-Drop-Down-Optik zwischen Layouts.
- **bundlePath Invariante:** Heute hardcoded `/pagefind/`. Phase-5-Trigger: wenn R2-Proxy für Cloudflare-20k-Limit kommt, wird der Pfad zur build-time-Konstante (Env-Var + Vite `define`). Bis dahin nicht anfassen.

## Performance-Mandate (gelockt 2026-04-22, Deep-Perf-Review)

Bei 1000 Tools wird jede „harmlose" Static-Import-Entscheidung zur nicht-linearen
Katastrophe: ein Tool-Chunk zieht die Runtime aller Tools mit. Die folgenden
Regeln sind nicht verhandelbar — jeder Agent, der ein neues Tool baut oder ein
bestehendes redesigned, muss sie **sofort** beim jeweiligen Tool anwenden.

### 1. Registries müssen lazy sein (`() => import()`)

Jede Registry, die Tool-Code einem `id`-String zuordnet, MUSS ihre Einträge
hinter einem `() => Promise<…>`-Thunk verbergen. Static imports am Dateikopf
sind verboten — sie kollabieren den Split zurück in einen einzigen Bundle und
skalieren O(n) mit der Tool-Count.

Betroffene Dateien (Vertrag, nicht nur Konvention):
- `src/lib/tool-registry.ts` — `getToolConfig(id): Promise<ToolConfig>`; `hasTool(id): boolean` als Sync-Check für Filter-Pfade.
- `src/lib/tools/tool-runtime-registry.ts` — Heavy-Deps (ML-Pipelines, WASM-Codecs, >100 KB Libs) MÜSSEN im Entry-Thunk dynamic-importiert werden, nie am Modul-Top. Singleton-Pattern: `Promise | null` + Capture nach erstem Resolve.
- `src/lib/tools/formatter-runtime-registry.ts` — `loadFormatter(id): Promise<FormatterEntry | undefined>`.
- `src/lib/tools/type-runtime-registry.ts` — `loadDiff / loadValidate / loadGenerate / loadAnalyze`.

Consumers (Svelte-Komponenten) laden den passenden Fn in einem `$effect` mit
Cancel-Flag:

```svelte
let fn = $state<FormatFn | undefined>(undefined);
$effect(() => {
  const id = config.id;
  let cancelled = false;
  void loadFormatter(id).then((e) => { if (!cancelled) fn = e?.format; });
  return () => { cancelled = true; };
});
```

**Kontrollfrage vor jedem Registry-Edit:** Wenn ich an der Dateispitze `import
x from ...` schreibe — wird `x` von jedem Tool gebraucht? Wenn nein → `() =>
import()`.

### 2. Typed-Array / Binary-State → `$state.raw`

`$state(value)` wickelt `value` in einen Svelte-Proxy. Für `Uint8Array` /
`Uint8ClampedArray` / `Blob` / `ImageBitmap` / große geparste JSON-Objekte
bedeutet das: jeder Lesezugriff triggert einen Proxy-Walk über Millionen
Elemente. Das Bild-Diff-Tool zeigte 33 Mio. Proxy-Ops pro 4K-Vergleich — 2 s
Jank statt 40 ms.

Regel: **jede reaktive Variable, deren Wert ein typed array, Blob, Canvas,
ImageBitmap oder eine >10 KB-JSON-Struktur ist, wird mit `$state.raw` deklariert.**
`$state.raw` entfernt den Proxy; Zuweisungen triggern weiterhin Reaktivität.

```svelte
let slotA = $state.raw<Loaded | null>(null);
```

Nur wenn die Komponente wirklich tief in den Inhalt schreibt und darauf
reaktiv reagieren muss, greift das reguläre `$state`. Das ist bei Binary-Daten
nie der Fall.

### 3. O(m×n)-Algorithmen hinter Debounce (≥150 ms)

LCS-Diffs (`text-diff`), JSON-Deep-Diffs (`json-diff`), AST-Formatter und
ähnliche Algorithmen mit quadratischer/größer-Komplexität DÜRFEN NICHT bei
jedem Keystroke laufen. Regel: Input in `$state` schreiben, einen debounced
Mirror in einem `$effect` mit `setTimeout`/`clearTimeout` (180 ms Default,
150–250 ms OK) pflegen, Algorithmus nur auf dem Mirror rechnen.

Referenz-Implementation: `src/components/tools/Comparer.svelte` lines 17–35.

### 4. Keine preloads für dekorative Fonts

Critical-path-preloads (`<link rel="preload" as="font">`) sind für Text
reserviert, der beim ersten Paint sichtbar ist (bei uns: Inter + JetBrains
Mono). Playfair Display trägt nur `<em>`-Akzente in H1/H2 und nutzt
`font-display: swap` — die 38 KB WOFF2 auf den kritischen Pfad zu schieben
kostet LCP ohne Ertrag. Regel: **dekorative Fonts bekommen `@font-face` +
`font-display: swap`, aber KEINEN `<link rel="preload">`.**

Referenz: `src/layouts/BaseLayout.astro` — Inter + JetBrains Mono preloaded,
Playfair absichtlich nicht.

### 5. Checkliste für jedes neue Tool

Vor Commit prüft der Agent:

- [ ] Tool-Config in `tool-registry.ts` als `() => import(...)` — kein static import.
- [ ] FileTool-Entry mit `>100 KB`-Dep: dynamic-imported Singleton im Entry-Thunk.
- [ ] Formatter/Diff/Validate/Generate/Analyze: über `load*`-Funktion, nicht Sync-Registry.
- [ ] Reaktive Binary-Daten: `$state.raw`, nicht `$state`.
- [ ] Quadratische Algorithmen auf Text-Input: 150–250 ms Debounce.
- [ ] Keine neuen Font-`preload`-Links außer Inter / JetBrains Mono.

Wer eine Regel bricht, schreibt einen inline-Kommentar mit Begründung —
sonst kippt der PR.

## Commit-Disziplin (Karpathy-Prinzipien aus CLAUDE.md)

- **Ein Commit = ein logisches Stück.** Keine Mix-Commits (`fix X + refactor Y`).
- **Kein opportunistisches Refactoring** während Bug-Fixes.
- **GitHub Flow:** ein Tool / eine Tool-Familie pro Branch.
- **Session-Ende:** `PROGRESS.md` updaten + Commit mit Trailer + stop.

## Content-Collection-Enumeration (gelockt Phase-1 Session 1)

**Regel (Single-Source-of-Truth):** Jeder Code-Pfad, der Tool-Listen oder Tool-Resolutions bildet, muss `src/lib/tools/list.ts` nutzen. Kein Copy-Paste des `getCollection → map → filter → sort`-Patterns in neue Pages.

**API:**

- `listToolsForLang(lang)` → alle Tools einer Sprache, alphabetisch nach `title` sortiert, mit `href` vorkomputiert. Konsumenten: `FooterToolsList.astro` (Footer-Cross-Links), Homepage (post-MVP-Refactor-Kandidat — aktuell `src/pages/[lang]/index.astro` hat noch inline-Enumerator). (`iconRel`/`hasIcon`-Felder entfernt 2026-04-20 mit dem Tool-Icon-Rollback.)
- `resolveRelatedTools(lang, localizedSlugs)` → resolved eine Slug-Liste aus `frontmatter.relatedTools` auf Render-Items. Input-Order bleibt erhalten, Forward-References (nicht-existente Slugs) werden still gefiltert. Konsument: `RelatedTools.astro`.

**Wichtig:** `frontmatter.relatedTools` enthält **lokalisierte URL-Slugs**, nicht `toolId`s. Das Schema erzwingt kebab-case, nicht die Domain.

**Refactor-Kandidat (nicht Pflicht):** `src/pages/[lang]/index.astro` (inline `getCollection`-Enumerator, Zeile 17–40) — bei nächster Berührung auf `listToolsForLang` umstellen.

## Category-Taxonomie + Fallback (gelockt Session 6)

**Authoritative Enum-Liste** lebt in `src/lib/tools/categories.ts`. Das Content-Schema
(`src/content/tools.schema.ts`) importiert daraus und verlangt `category` als
required-Feld. Änderungen an der Enum-Liste sind Breaking-Changes und brauchen
einen expliziten Spec-Update + Test-Migration.

**14 Enum-Werte:**

```typescript
export const TOOL_CATEGORIES = [
  'length', 'weight', 'area', 'volume', 'distance',
  'temperature', 'image', 'video', 'audio', 'document',
  'text', 'dev', 'color', 'time',
] as const;
```

DE-Labels für die UI-Darstellung (Prose-Closer-H2, Related-Bar-Captions):
siehe `CONTENT.md §13.3` (hand-authored Mapping, keine Auto-Derivation aus dem
Enum-Literal).

### Category-Fallback-Contract

**API:** `resolveRelatedToolsWithFallback(lang, ownSlug, explicitSlugs, minCount=3)`
in `src/lib/tools/list.ts`. Konsument: `src/components/RelatedTools.astro`.

**Vertrag:**

1. **`relatedTools` darf leer oder unter-spezifiziert sein.** Frontmatter-Constraint
   `z.array(...).min(0).max(5)` — `[]` ist gültig.
2. **Resolver-Logik:**
   - Explicit-Slugs werden zuerst gematcht, **Reihenfolge bleibt erhalten**.
   - Own-Slug wird stets übersprungen (kein Self-Link).
   - Wenn explicit-Resolves < `minCount`: Same-Category-Siblings werden
     **alphabetisch** (nach `title`) aufgefüllt bis `minCount` erreicht ist.
   - Wenn `own.category` undefined oder keine Siblings existieren: Output bleibt
     kürzer als `minCount` (kein Fehler).
3. **Forward-Refs werden still verworfen.** Frontmatter-Slugs, die noch kein
   Content-File haben, führen zu keinem Build-Break — der Resolver filtert sie.
4. **Kuration ist optional.** Neue Tools dürfen `relatedTools: []` setzen —
   Fallback trägt. Explizite Kuration nur bei gewünschter redaktioneller
   Reihenfolge (z.B. Cross-Category-Link aus redaktionellen Gründen).

**Scaling-Implikation (Paperclip):** Mass-Production-Tools können das
`relatedTools`-Feld leer lassen und nur `category` setzen. Related-Bar füllt sich
automatisch aus dem wachsenden Sibling-Pool. Manuelle Kuration wird nicht
skalierbar bei 1000+ Tools.

**Orthogonaler Pfad:** Der ursprüngliche `resolveRelatedTools(lang, slugs)` ohne
Fallback lebt weiter und wird von `YouMightAlsoLike` genutzt — dort ist die
Semantik „nur expliziter Cross-Link, kein Fallback".

## Secrets-Rotation-Policy (gelockt 2026-04-21)

**Zwei-Kadenzen-Split** nach Blast-Radius:

| Kadenz | Scope | Keys |
|--------|-------|------|
| **180 Tage** | Dev-Tooling (local-only, kein User-Traffic) | `STITCH_API_KEY`, `FIRECRAWL_API_KEY`, `FIRECRAWL_WEBHOOK_SIGNING_KEY` |
| **90 Tage** | Prod-Credentials (ab Aktivierung) | AdSense-Publisher-ID-Secret, Cloudflare-Pages-API-Token, später: Analytics-Keys |

**Ausnahme-Trigger (unabhängig von Kadenz):**
- Kompromittierungs-Verdacht → sofort rotieren + Post-Mortem in `docs/security/`
- Person-Wechsel (Account-Transfer) → sofort rotieren
- Leak in Git-History / Logs → sofort rotieren + `git-filter-repo`-Cleanup

**Verfahren:** Rotation wird in `docs/security/secrets-rotation.md` geloggt (Datum,
Key-Name, Grund: `scheduled` | `incident` | `person-change`). Kein automatisiertes
Rotation-Tool in Phase 1 — manueller Kalender-Reminder reicht bei ≤6 Keys.

**Phase-2-Trigger:** Wenn > 8 aktive Secrets oder erste Prod-Rotation ansteht, wird
ein Secret-Manager (1Password / Doppler / CF-Wrangler-Secrets) evaluiert. Bis dahin
`.env.local` + `.gitignore`-Disziplin.

## §10 MLFileTool-Template (§7a-Ausnahme-Tools, gelockt 2026-04-26)

Tools, die unter Non-Negotiable §7a fallen (ML-Inferenz im Browser, kein
Server-Roundtrip), folgen einem strikteren Pattern als der generische
`FileTool`. Referenz-Implementierung: `video-hintergrund-entfernen`
(`src/components/tools/VideoHintergrundEntfernenTool.svelte` +
`src/lib/tools/process-video-bg-remove.ts` +
`src/workers/video-bg-remove.worker.ts`). Weitere existierende
ML-File-Tools — `remove-background`, `audio-transkription`,
`speech-enhancer` — laufen Main-Thread und sind **nicht** unter §10
zu refactoren; §10 gilt ab sofort nur für **neue** §7a-Tools mit
Inferenz-Laufzeit > 200 ms pro Sample.

### 10.1 Worker-Pflicht

ML-Inferenz mit Frame-Rate (Video, Audio-Stream, Live-Camera) **muss**
in einem dedizierten Web-Worker laufen. Main-Thread-Inferenz ist nur
zulässig wenn das Modell pro User-Action genau einmal feuert (Single-
Image, Single-Klick) und dabei < 800 ms blockiert.

```ts
// src/workers/<tool-id>.worker.ts
self.onmessage = async (event: MessageEvent<WorkerInbound>) => {
  const msg = event.data;
  if (msg.type === 'process') {
    await runPipeline(msg.payload, postProgress, postDone, postError);
  } else if (msg.type === 'abort') {
    aborted = true;
  }
};
```

### 10.2 State-Machine (Pflicht, fünf Phasen)

```
idle → preparing → model-loading → converting → done
                                                    ↘ idle (reset)
                                                    ↘ error → idle
```

- `idle` — Dropzone sichtbar, kein Loader.
- `preparing` — Datei-Validierung, kurz, kein UI-Indikator nötig.
- `model-loading` — Modell-Weights via `caches.match()` oder `fetch()`,
  Progress-Bar mit `loaded/total`-MB, ETA, Stall-Watchdog 120 s.
  Wird **übersprungen** wenn `isPrepared() === true`.
- `converting` — Frame-/Sample-Loop. Zweite Progress-Bar mit
  `frameIdx / totalFrames` + ETA. Abort-Button sichtbar.
- `done` — Output-Preview + Download + KI-Disclaimer-Zeile.
- `error` — Reset-Button + Error-Message in `var(--color-error)`.

### 10.3 Zweistufige Progress-API

Worker postet zwei Progress-Phasen:

```ts
type WorkerOutbound =
  | { type: 'progress'; phase: 'model'; loaded: number; total: number }
  | { type: 'progress'; phase: 'frame'; frameIdx: number; totalFrames: number }
  | { type: 'done'; output: Uint8Array; meta?: Record<string, unknown> }
  | { type: 'error'; message: string };
```

Komponenten-Code mappt `phase: 'model'` auf den `model-loading`-State,
`phase: 'frame'` auf den `converting`-State.

### 10.4 Runtime-Registry-Contracts

Jedes §10-Tool erfüllt diese Schnittstelle in
`tool-runtime-registry.ts`:

```ts
'<tool-id>': {
  process: async (input, config, onProgress) => { /* posts to worker */ },
  prepare: async (onProgress) => { /* posts model-load to worker */ },
  isPrepared: () => /* sync flag from main-thread shim */,
  clearLastResult: () => /* drops cached output, releases worker */,
  preflightCheck: () => /* string | null — WebCodecs / WebGPU / etc. */,
}
```

`isPrepared()` ist **synchron** — Komponenten dürfen nicht in einem
`$effect` darauf warten. Source-of-truth ist ein Modul-Scope-Flag,
das beim Worker-Done auf `true` flippt.

### 10.5 Worker-Abort-Pattern

Lange Pipelines brauchen User-Abort. Pattern:

```ts
// Main-thread shim
let activeWorker: Worker | null = null;
export function abortVideoBgRemove(): void {
  activeWorker?.postMessage({ type: 'abort' });
}

// Worker
let aborted = false;
for await (const frame of frames) {
  if (aborted) { closeAll(); return; }
  /* … */
}
```

Komponente wirft `AbortError` (Name-Property), Component fängt und
geht in `idle` zurück (kein `error`-State — der User hat absichtlich
abgebrochen).

### 10.6 Cache-API für Modell-Weights

`@huggingface/transformers` cached die Weights automatisch in der
Browser-Cache-API. Kein eigener Cache-Code nötig. Verhalten:

- First-Load: ~50 MB Download mit Progress.
- Second-Load: instant (Cache-Hit).
- Cache-Eviction: re-download mit selber UI (kein Crash).

Der Stall-Watchdog (`prepareXxxModel({ stallTimeoutMs: 120_000 })`)
fängt blockierte Downloads — wenn 120 s lang kein Progress-Event
kommt, wird `StallError` geworfen. Pattern aus `remove-background.ts`
übernehmen.

### 10.7 WebGPU-Preflight + WASM-Fallback

```ts
async function detectDevice(): Promise<'webgpu' | 'wasm'> {
  try {
    const gpu = (navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu;
    if (!gpu) return 'wasm';
    const adapter = await gpu.requestAdapter();
    return adapter ? 'webgpu' : 'wasm';
  } catch {
    return 'wasm';
  }
}
```

`pipeline()`-Aufruf kriegt `{ device }` mit. Bei `wasm`-Fallback zeigt
die UI eine Warning-Zeile *„CPU-Modus aktiv — 3-5× langsamer."*

`preflightCheck()` im Runtime-Registry prüft Browser-Voraussetzungen
**vor** dem ersten Worker-Spawn (z.B. `VideoEncoder`, `VideoDecoder`,
`navigator.mediaDevices`). Returnt `string` mit User-Message wenn
fehlend, sonst `null`.

### 10.8 Bestehende §7a-Tools (NICHT refactoren)

Folgende Tools sind §7a-konform aber laufen Main-Thread —
Refactor auf Worker-Pattern wäre Scope-Creep:

- `remove-background` (BEN2-Single-Image, ~800 ms pro Inferenz)
- `audio-transkription` (Whisper-Single-Pass, User-Action one-shot)
- `speech-enhancer` (DeepFilterNet, Audio-Block-One-Shot)
- `bild-zu-text` (Tesseract.js, Single-Image)
- `ki-text-detektor`, `ki-bild-detektor` (Single-Klick)

Diese bleiben Main-Thread bis ein konkreter UX-Pain auftritt
(>5 unabhängige User-Reports zu „UI-Freeze" pro Tool).

## Build-Gates

- `npm run build` muss grün sein vor Commit
- `npm test` muss grün sein vor Commit
- `npm run check` muss 0/0/0 sein vor Commit
- `bash scripts/check-git-account.sh` ist pflicht — Pre-Commit-Hook erzwingt es automatisch
