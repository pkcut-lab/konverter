# Code-Konventionen

> **Status:** Final ab Session 4. Session 6 (Prototype-Review) kann ergänzen,
> darf aber keine Signaturen ändern, die bereits in `src/` gelockt sind.

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

## Svelte

- **Runes-only** (`$state`, `$derived`, `$effect`). Kein `writable`/`readable` aus `svelte/store`.
- **Hydration:** `client:load` für alles mit Theme/Locale-Abhängigkeit (Flash-Prevention, Section 5.2 Spec). `client:idle` nur nach expliziter Spec-Referenz.
- **Props:** TypeScript-Interface `interface Props { ... }`, via `let { foo }: Props = $props()` destructured.

## CSS

- **Tailwind Utility-First** in Astro/Svelte-Markup.
- **Custom-CSS** NUR in `src/styles/tokens.css` und direkt in `<style>`-Blöcken von Komponenten (scoped).
- **Neue Tokens:** IMMER in beiden `:root`-Blöcken (light + dark) pflegen. Contrast ≥ 7:1 (WCAG AAA).
- **Hex-Codes außerhalb tokens.css verboten** — immer `var(--color-*)` / `var(--space-*)` / etc.

## Commit-Disziplin (Karpathy-Prinzipien aus CLAUDE.md)

- **Ein Commit = ein logisches Stück.** Keine Mix-Commits (`fix X + refactor Y`).
- **Kein opportunistisches Refactoring** während Bug-Fixes.
- **GitHub Flow:** ein Tool / eine Tool-Familie pro Branch.
- **Session-Ende:** `PROGRESS.md` updaten + Commit mit Trailer + stop.

## Build-Gates

- `npm run build` muss grün sein vor Commit
- `npm test` muss grün sein vor Commit
- `npm run check` muss 0/0/0 sein vor Commit
- `bash scripts/check-git-account.sh` ist pflicht — Pre-Commit-Hook erzwingt es automatisch
