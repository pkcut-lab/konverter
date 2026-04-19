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
│       ├── types.ts        # Lang, Result<T,E>, TOOL_TYPES, ToolType
│       ├── schemas.ts      # Zod-Schemas für 9 Tool-Typen + parseToolConfig()
│       └── {tool-id}.ts    # Pro Tool: Config-Export mit iconPrompt JSDoc
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
2. **Tool-Config** unter `src/lib/tools/<tool-id>.ts` — `FileToolConfig` mit `id`, `accept[]`, `maxSizeMb`, `iconPrompt` JSDoc, `process` (verweist aufs Pure-Module für Server-Seite). Session-9-neue optionale Felder: `prepare`, `defaultFormat`, `cameraCapture`, `filenameSuffix`, `showQuality`.
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

## Commit-Disziplin (Karpathy-Prinzipien aus CLAUDE.md)

- **Ein Commit = ein logisches Stück.** Keine Mix-Commits (`fix X + refactor Y`).
- **Kein opportunistisches Refactoring** während Bug-Fixes.
- **GitHub Flow:** ein Tool / eine Tool-Familie pro Branch.
- **Session-Ende:** `PROGRESS.md` updaten + Commit mit Trailer + stop.

## Content-Collection-Enumeration (gelockt Phase-1 Session 1)

**Regel (Single-Source-of-Truth):** Jeder Code-Pfad, der Tool-Listen oder Tool-Resolutions bildet, muss `src/lib/tools/list.ts` nutzen. Kein Copy-Paste des `getCollection → map → filter → sort`-Patterns in neue Pages.

**API:**

- `listToolsForLang(lang)` → alle Tools einer Sprache, alphabetisch nach `title` sortiert, mit `href` + `iconRel` + `hasIcon` vorkomputiert. Konsumenten: `FooterToolsList.astro` (Footer-Cross-Links), Homepage (post-MVP-Refactor-Kandidat — aktuell `src/pages/[lang]/index.astro` hat noch inline-Enumerator).
- `resolveRelatedTools(lang, localizedSlugs)` → resolved eine Slug-Liste aus `frontmatter.relatedTools` auf Render-Items. Input-Order bleibt erhalten, Forward-References (nicht-existente Slugs) werden still gefiltert. Konsument: `RelatedTools.astro`.

**Wichtig:** `frontmatter.relatedTools` enthält **lokalisierte URL-Slugs**, nicht `toolId`s. Das Schema erzwingt kebab-case, nicht die Domain.

**Refactor-Kandidat (nicht Pflicht):** `src/pages/[lang]/index.astro` (inline `getCollection`-Enumerator, Zeile 17–40) — bei nächster Berührung auf `listToolsForLang` umstellen.

## Build-Gates

- `npm run build` muss grün sein vor Commit
- `npm test` muss grün sein vor Commit
- `npm run check` muss 0/0/0 sein vor Commit
- `bash scripts/check-git-account.sh` ist pflicht — Pre-Commit-Hook erzwingt es automatisch
