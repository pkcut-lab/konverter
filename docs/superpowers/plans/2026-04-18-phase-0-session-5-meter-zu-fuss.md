# Phase 0 · Session 5 — Meter-zu-Fuß Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Erster funktionierender Converter live auf `http://localhost:4321/de/meter-zu-fuss`. Volle Tool-Seite inkl. Input→Output mit Swap + Copy + Quick-Values, ~500–700-Wörter-SEO-Content, Ähnliche-Tools-Stub. Etabliert das `Converter.svelte`-Template, den Dynamic-Route-Pattern `[lang]/[slug].astro` und den Content-File-Pattern `src/content/tools/{slug}/{lang}.md` für alle künftigen Converter/Calculator/Validator-Tools.

**Architecture:** Drei Datenquellen pro Tool-Seite — (a) Tool-Config mit JS-Funktion (`src/lib/tools/meter-zu-fuss.ts`, typed als `ConverterConfig`), (b) Content-File mit SEO-Prose (`src/content/tools/meter-zu-fuss/de.md`, validiert durch Session-4-Zod-Schema), (c) Slug-Map-Eintrag für Route-Resolution (`src/lib/slug-map.ts`). Die Dynamic-Route `src/pages/[lang]/[slug].astro` generiert über `getStaticPaths()` aus der Content-Collection eine Page pro Entry, matcht den Entry per `toolId` auf einen Tool-Config-Eintrag in einer lokalen Registry, und rendert `BaseLayout` + `Converter.svelte` + Markdown-Body. Converter.svelte nutzt Svelte-5-Runes (`$state`, `$derived`, `$effect`) und ruft `config.convert` / `config.convertInverse` — kein Math im Template. UI folgt Spec 14.2 (Number-Input + Swap + Copy + Quick-Values).

**Tech Stack:** Astro 5 Content Collections, Svelte 5 Runes, TypeScript 5.7 strict, Zod 3.24.1 (indirekt via Session-4-Schemas), Vitest 2.1.8 + jsdom für Component-Tests, Tailwind-Utility-First + Tokens aus Session 2.

**Locked Contracts aus S1–S4 (NICHT brechen):**
- `src/lib/hreflang.ts` API (`ACTIVE_LANGUAGES`, `DEFAULT_LANGUAGE`, `buildHreflangLinks`) und `ActiveLanguage = 'de'`
- `src/layouts/BaseLayout.astro` Props `{ lang, title, description?, pathWithoutLang }`
- `astro.config.mjs` `trailingSlash: 'never'`
- `src/lib/tools/types.ts` API (`Lang`, `TOOL_TYPES`, `ToolType`, `Result<T,E>`, `ok`, `err`)
- `src/lib/tools/schemas.ts` API (9 Base-Schemas, `toolSchema`, 9 Author-Facing Types inkl. `ConverterConfig`, `ToolConfig`, `parseToolConfig`)
- `src/lib/slug-map.ts` API (Signaturen von `getSlug` / `getToolId` / `getSupportedLangs`) — nur **Inhalt** der Map wird in dieser Session erweitert
- `src/content/tools.schema.ts` API (`toolContentFrontmatterSchema`, `ToolContentFrontmatter`)
- `src/content/config.ts` bleibt dünn
- `CONVENTIONS.md` final aus S4 — neue Patterns werden in S6 (Review) ergänzt, nicht hier

---

## Pre-Session User Action (MUSS vor Task 1 erledigt sein)

Der parallele Prep-Agent hat auf `docs/meter-zu-fuss-prep` gearbeitet und 6 Commits gepusht, die Content-Drafts und Icon-Prompts bereitstellen. Diese Branch ist **nicht** in `main` gemerged und hat **Konflikte** zu S4 (prep-branch branchte bei `0f2e2c9` ab, also vor den S4-Commits).

**Merge-Reihenfolge (User-Action, nicht Subagent):**

```bash
cd "c:/Users/carin/.gemini/Konverter Webseite"
bash scripts/check-git-account.sh        # muss pkcut-lab bestätigen

git checkout main
git pull origin main                       # sicher sein, dass main aktuell ist
git merge docs/meter-zu-fuss-prep
```

**Erwartete Konflikte beim Merge:**

| Datei | Konflikt-Typ | Resolution |
|-------|--------------|------------|
| `CONVENTIONS.md` | beide Seiten modifiziert | **Main behalten** (S4-Final). Prep-Branch basiert auf altem Stub — komplett verwerfen. |
| `PROGRESS.md` | beide Seiten modifiziert | **Main behalten** (Session-4-Close-Stand). Keine prep-seitigen Inhalte übernehmen. |

**Erwartete zusätzliche Deletes im Merge:**
Der Prep-Branch zeigt S4-Files (schemas.ts, slug-map.ts, tools.schema.ts, config.ts, types.ts und deren Tests) als **nicht vorhanden** — weil die Branch vor S4 abzweigte. Git interpretiert das beim Merge als „Prep-Branch löscht diese Files". Das ist falsch. **Behalten Sie in JEDEM Konflikt dieser S4-Files die main-Seite** (`git checkout --ours <file>`).

Copy-paste-fertige Resolution (nach `git merge docs/meter-zu-fuss-prep` in einem Konflikt-Zustand):

```bash
# S4-Files zurück-holen (main-Seite gewinnt, da prep-Branch sie nicht kennt)
for f in \
  src/lib/tools/types.ts \
  src/lib/tools/schemas.ts \
  src/lib/slug-map.ts \
  src/content/tools.schema.ts \
  src/content/config.ts \
  tests/lib/tools/schemas.test.ts \
  tests/lib/slug-map.test.ts \
  tests/content/tools-schema.test.ts
do
  git checkout --ours "$f" && git add "$f"
done

# CONVENTIONS.md und PROGRESS.md: main-Seite behalten (S4-Final)
git checkout --ours CONVENTIONS.md && git add CONVENTIONS.md
git checkout --ours PROGRESS.md    && git add PROGRESS.md
```

**Nach Merge-Resolution:**

```bash
npm install                                # falls package.json anfasste
npm run build                              # muss grün
npm test                                   # 106/106 muss grün
npm run check                              # 0/0/0
git commit                                 # merge-commit schließen
git push origin main
git branch -d docs/meter-zu-fuss-prep
git push origin --delete docs/meter-zu-fuss-prep
```

**Nach erfolgreichem Merge müssen diese Files in `main` vorhanden sein** (Subagenten verifizieren zu Task-1-Start):
- `CONTENT.md` (v1)
- `docs/drafts/meter-zu-fuss-content-de.md` (~550 Wörter Draft)
- `docs/drafts/meter-zu-fuss-icon-prompt.md`
- `docs/drafts/webp-konverter-content-de.md` (wird erst S7 konsumiert)
- `docs/drafts/webp-konverter-icon-prompt.md`
- `pending-icons/.gitkeep`
- `pending-icons/README.md`

**Worktree-Cleanup (vor Session-Start, optional):** Der Session-4-Worktree `c:/Users/carin/.gemini/Konverter Webseite-s4/` kann entfernt werden:

```bash
git worktree remove "c:/Users/carin/.gemini/Konverter Webseite-s4"
# Falls Permission-Denied (Editor hält Handle): Editor/Terminal schließen, erneut versuchen,
# notfalls `git worktree remove --force` oder manuell den Ordner löschen.
```

---

## File Structure

**Create:**
- `src/lib/tools/meter-zu-fuss.ts` — ConverterConfig-Export mit Icon-Prompt JSDoc + Status-Marker
- `src/content/tools/meter-zu-fuss/de.md` — SEO-Content (aus Prep-Draft konvertiert) + vollständige Frontmatter nach S4-Schema
- `src/components/tools/Converter.svelte` — Generische Converter-Komponente (Svelte-5-Runes)
- `src/pages/[lang]/[slug].astro` — Dynamic Route: `getStaticPaths` via Content-Collection, Props-Matching gegen Tool-Registry
- `tests/lib/tools/meter-zu-fuss.test.ts` — Config parst durch `parseToolConfig()`; convert/convertInverse Round-Trip; examples-Liste richtige Länge
- `tests/components/tools/converter.test.ts` — Mount + Input-Interaction + Swap + Copy + Quick-Value-Button
- `tests/content/meter-zu-fuss-content.test.ts` — Frontmatter-Parsing via `toolContentFrontmatterSchema` (lädt die echte `.md` via `fs.readFileSync` + `matter`)

**Update:**
- `src/lib/slug-map.ts` — Eintrag `'meter-to-feet': { de: 'meter-zu-fuss' }` ergänzen (Signaturen unverändert)
- `tests/lib/slug-map.test.ts` — zusätzliche Tests: `getSlug('meter-to-feet', 'de')` === `'meter-zu-fuss'`; `getToolId('de', 'meter-zu-fuss')` === `'meter-to-feet'`; `getSupportedLangs('meter-to-feet')` === `['de']`
- `PROGRESS.md` — Session 5 ✅, Tool-Inventar aktualisiert, Next = Session 6 (Review + Lock)

**Do not touch:**
- `src/lib/hreflang.ts`, `src/lib/site.ts`
- `astro.config.mjs`, `vitest.config.ts`, `svelte.config.js`, `tailwind.config.mjs`
- `src/styles/tokens.css` (Token-Änderungen sind S6/S8 nach Review)
- `src/lib/tools/types.ts`, `src/lib/tools/schemas.ts` (S4 locked)
- `src/content/tools.schema.ts`, `src/content/config.ts` (S4 locked)
- `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/ThemeScript.astro`, `src/components/ThemeToggle.svelte`
- `src/pages/index.astro`, `src/pages/[lang]/index.astro`, `src/pages/[lang]/styleguide.astro`
- `CONVENTIONS.md`, `STYLE.md`, `CONTENT.md` (alle v1-locked; Review-Sessions pflegen sie)
- `docs/drafts/webp-konverter-*` (gehören zu Session 7)

---

## Task 1 — Tool-Config `src/lib/tools/meter-zu-fuss.ts`

**Files:**
- Create: `src/lib/tools/meter-zu-fuss.ts`
- Create: `tests/lib/tools/meter-zu-fuss.test.ts`

**Rationale:** Tool-Config ist die Datenquelle der Wahrheit für Convert-Mathematik + UI-Labels. Vor jedem anderen Artefakt (Content, Slug, Komponente) nötig, weil sowohl der Komponenten-Test als auch die Dynamic-Route diesen Config statisch importieren.

**Entscheidungen:**
- **Variable-Deklaration:** `export const meterZuFuss: ConverterConfig = { ... }` — **explizit getypt**. Das ist der Mechanismus, der die korrekten Convert-Signaturen `(value: number) => number` durchsetzt (Session-4-Override-Pattern).
- **Decimals:** 4 (genug für 4-stellige Präzision `3,2808 ft`, ohne Overflow in Mobile-Displays). Spec Section 4.2 zeigt explizit `decimals: 4`.
- **Examples:** `[1, 10, 100, 1000]` — gerade diese Werte aus Spec Section 14.2 für Quick-Value-Buttons.
- **Icon-Prompt:** Wird **wörtlich** aus `docs/drafts/meter-zu-fuss-icon-prompt.md` (Primary-Prompt-Block) als JSDoc in den Header übernommen. Status-Marker `[ ] Pending [ ] Generated [ ] Delivered` aus Spec 4.2.
- **iconPrompt-Feld im Config:** Das optionale Zod-Feld `iconPrompt` (`z.string().optional()` in `base`) kann den Prompt aufnehmen — wir nutzen es als Single-Source-of-Truth. Der JSDoc-Block über dem Config referenziert das Feld.
- **categoryId:** `'laengen'` (kebab-case, ASCII — „laengen" statt „längen" laut CONVENTIONS Naming).

- [ ] **Step 1.1: Write failing test `tests/lib/tools/meter-zu-fuss.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { meterZuFuss } from '../../../src/lib/tools/meter-zu-fuss';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('meterZuFuss config', () => {
  it('is a valid ConverterConfig per S4 schema', () => {
    const r = parseToolConfig(meterZuFuss);
    expect(r.ok).toBe(true);
  });

  it('has the expected identity fields', () => {
    expect(meterZuFuss.id).toBe('meter-to-feet');
    expect(meterZuFuss.type).toBe('converter');
    expect(meterZuFuss.categoryId).toBe('laengen');
    expect(meterZuFuss.units.from.id).toBe('m');
    expect(meterZuFuss.units.to.id).toBe('ft');
    expect(meterZuFuss.decimals).toBe(4);
    expect(meterZuFuss.examples).toEqual([1, 10, 100, 1000]);
  });

  it('convert(1) is ~3.28084', () => {
    expect(meterZuFuss.convert(1)).toBeCloseTo(3.28084, 5);
  });

  it('convertInverse(1) is ~0.3048', () => {
    expect(meterZuFuss.convertInverse(1)).toBeCloseTo(0.3048, 4);
  });

  it('round-trips within decimals precision for integer inputs', () => {
    for (const m of [1, 10, 100, 1000]) {
      const ft = meterZuFuss.convert(m);
      const backToM = meterZuFuss.convertInverse(ft);
      expect(backToM).toBeCloseTo(m, 4);
    }
  });

  it('exposes an iconPrompt string', () => {
    expect(typeof meterZuFuss.iconPrompt).toBe('string');
    expect((meterZuFuss.iconPrompt ?? '').length).toBeGreaterThan(40);
  });
});
```

- [ ] **Step 1.2: Run test to verify it fails**

Command: `npm test -- tests/lib/tools/meter-zu-fuss.test.ts`
Expected: fail — module `src/lib/tools/meter-zu-fuss` existiert nicht.

- [ ] **Step 1.3: Create `src/lib/tools/meter-zu-fuss.ts`**

```typescript
import type { ConverterConfig } from './schemas';

/**
 * Recraft.ai icon prompt (Primary — locked with icon-prompt draft).
 * Status: [ ] Pending  [ ] Generated  [ ] Delivered
 * Source: docs/drafts/meter-zu-fuss-icon-prompt.md
 *
 * Target: public/icons/tools/meter-to-feet.webp (160x160, CSS 80x80).
 * After PNG generation: drop 512x512 source into pending-icons/meter-to-feet.png.
 * Build-Script (Session 9) converts to WebP.
 */
export const meterZuFuss: ConverterConfig = {
  id: 'meter-to-feet',
  type: 'converter',
  categoryId: 'laengen',
  iconPrompt:
    'Pencil-sketch icon of a retractable measuring tape partially extended toward ' +
    'a bare human footprint outline, both elements drawn in monochrome graphite gray ' +
    '(#6B7280), single-weight hand-drawn strokes, no shading, no fill, transparent ' +
    'background, minimalist line art, square aspect, balanced composition with tape ' +
    'on the left and footprint on the right, small measurement ticks visible on the ' +
    'tape surface.',
  units: {
    from: { id: 'm', label: 'Meter' },
    to: { id: 'ft', label: 'Fuß' },
  },
  convert: (m: number) => m * 3.28084,
  convertInverse: (ft: number) => ft / 3.28084,
  decimals: 4,
  examples: [1, 10, 100, 1000],
};
```

- [ ] **Step 1.4: Run test to verify it passes**

Command: `npm test -- tests/lib/tools/meter-zu-fuss.test.ts`
Expected: PASS 6/6.

- [ ] **Step 1.5: Run full test suite + typecheck + build**

Commands:
- `npm test` → 112/112 grün (106 alt + 6 neu)
- `npm run check` → 0/0/0
- `npm run build` → erfolgreich (Content-Collection bleibt leer in dieser Session, Tool-Config nur reiner TS-Import, wird aber erst in Task 5 konsumiert)

- [ ] **Step 1.6: Commit**

```bash
git add src/lib/tools/meter-zu-fuss.ts tests/lib/tools/meter-zu-fuss.test.ts
git commit -m "feat(tools): meter-zu-fuss ConverterConfig + icon prompt

Rulebooks-Read: PROJECT, CONVENTIONS"
```

---

## Task 2 — Slug-Map Entry für `meter-to-feet`

**Files:**
- Modify: `src/lib/slug-map.ts` (nur der `slugMap`-Literal, keine Signatur-Änderung)
- Modify: `tests/lib/slug-map.test.ts` (+3 neue Test-Cases für populated-Map)

**Rationale:** Der Slug-Map-Eintrag ist die Brücke zwischen Tool-Config (sprach-neutral `meter-to-feet`) und URL (`/de/meter-zu-fuss`). Muss vor der Content-Datei existieren, weil der Dynamic-Route (Task 5) den Slug via `getToolId('de', 'meter-zu-fuss')` auflöst. TDD durch Round-Trip-Assertions.

**Entscheidung: Form des Updates**
Wir fügen **nur einen Eintrag** im Map-Literal hinzu. Keine Umstellung auf „Map-from-Array", keine helper-Erweiterung. Punkt.

- [ ] **Step 2.1: Write additional failing tests in `tests/lib/slug-map.test.ts`**

An das Ende der `describe('slug-map', …)`-Block (oder in einem neuen `describe`-Block darunter) diese Tests anfügen:

```typescript
describe('slug-map — meter-to-feet entry', () => {
  it('getSlug("meter-to-feet", "de") resolves to "meter-zu-fuss"', () => {
    expect(getSlug('meter-to-feet', 'de')).toBe('meter-zu-fuss');
  });

  it('getToolId("de", "meter-zu-fuss") resolves to "meter-to-feet"', () => {
    expect(getToolId('de', 'meter-zu-fuss')).toBe('meter-to-feet');
  });

  it('getSupportedLangs("meter-to-feet") returns ["de"]', () => {
    expect(getSupportedLangs('meter-to-feet')).toEqual(['de']);
  });
});
```

Hinweis: Die bestehenden Tests (5 aus S4) müssen **weiterhin grün** bleiben. Der Round-Trip-Property-Test in `slug-map.test.ts` iteriert über alle Einträge der Map — mit einem echten Eintrag ist er jetzt nicht mehr leer-triviell, sondern prüft real. Das ist erwünschte Verschärfung.

- [ ] **Step 2.2: Run tests to verify the 3 new ones fail**

Command: `npm test -- tests/lib/slug-map.test.ts`
Expected: 5/8 pass, 3/8 fail mit „expected 'meter-zu-fuss', received undefined" (o.ä.).

- [ ] **Step 2.3: Edit `src/lib/slug-map.ts`**

Ändere **nur** die Zeile mit dem leeren `slugMap`:

Vorher:
```typescript
export const slugMap: Record<string, Partial<Record<Lang, string>>> = {};
```

Nachher:
```typescript
export const slugMap: Record<string, Partial<Record<Lang, string>>> = {
  'meter-to-feet': { de: 'meter-zu-fuss' },
};
```

Keine weiteren Änderungen an der Datei. JSDoc-Comment am Head („Phase 0: empty. Session 5 adds 'meter-to-feet'.") kann so bleiben (Prognose ist nun erfüllt — korrekt).

- [ ] **Step 2.4: Run test to verify all 8 pass**

Command: `npm test -- tests/lib/slug-map.test.ts`
Expected: PASS 8/8.

- [ ] **Step 2.5: Run full suite + typecheck + build**

Commands:
- `npm test` → 115/115 grün (112 nach Task 1 + 3 neu)
- `npm run check` → 0/0/0
- `npm run build` → grün

- [ ] **Step 2.6: Commit**

```bash
git add src/lib/slug-map.ts tests/lib/slug-map.test.ts
git commit -m "feat(i18n): slug-map entry meter-to-feet -> meter-zu-fuss (de)

Rulebooks-Read: PROJECT, CONVENTIONS"
```

---

## Task 3 — Content-File `src/content/tools/meter-zu-fuss/de.md`

**Files:**
- Create: `src/content/tools/meter-zu-fuss/de.md`
- Create: `tests/content/meter-zu-fuss-content.test.ts`
- (Optional, am Ende) Delete: `docs/drafts/meter-zu-fuss-content-de.md` — Quelle ist ab jetzt `src/content/tools/meter-zu-fuss/de.md`; Draft bleibt in Git-Historie erhalten. Falls nicht-trivial zu entscheiden, behalte den Draft — kein Scope-Creep.

**Rationale:** Der S4-Zod-Schema `toolContentFrontmatterSchema` verlangt 10 Pflichtfelder. Der Draft aus dem Prep-Branch enthält die H2-Body-Struktur, aber keine Frontmatter. Diese Task fügt Frontmatter hinzu und schiebt die Datei in den Astro-Collection-Pfad. Die Test-Sicherung ist ein Node-Read + `gray-matter`-Parse + Schema-Check — das spiegelt was Astro zur Build-Zeit tut, ohne die Astro-Runtime zu starten.

**Dependency-Check:** `gray-matter` ist **keine direkte Dep** des Projekts (aktuelle `package.json` listet 6 devDeps — gray-matter ist nicht dabei). Astro bundelt es zwar intern, aber unter einem nicht-stabilen Import-Pfad. → **Pflicht-Install** als devDependency zu Beginn von Task 3:

```bash
npm install --save-dev gray-matter
```

`package.json` und `package-lock.json` werden in Task-3-Commit mit den Test- und Content-Dateien zusammen ge-committet (EIN Commit, da semantisch zusammenhängend).

**Frontmatter-Werte (aus Spec 8.1 Count-Regeln):**
- `slug`: `meter-zu-fuss` (kebab-case, ASCII)
- `toolId`: `meter-to-feet` (matcht Slug-Map + Tool-Config)
- `language`: `de`
- `title`: 30–60 Zeichen. Vorschlag: `"Meter in Fuß umrechnen – Formel & Tabelle"` (43 Zeichen)
- `metaDescription`: 140–160 Zeichen. Vorschlag aus Draft, leicht gestrafft: `"Meter in Fuß umrechnen: exakte Formel (1 m = 3,28084 ft), Tabelle gängiger Werte und FAQ zu internationalem vs. US-Survey-Fuß. Ohne Anmeldung, ohne Ads."` (156 Zeichen — zählen!)
- `tagline`: 1 Satz. `"Präzise Längen-Umrechnung in Sekunden — klient-seitig, ohne Tracking."`
- `intro`: min 1, soft-target 40–80 Wörter (Word-Count-Enforcement ist S10, hier nur Struktur-Lock). Vorschlag: Lead-Absatz aus dem Draft `"Was macht der Konverter?"`-Sektion + ein Halbsatz, der primary-Keyword `Meter in Fuß umrechnen` enthält.
- `howToUse`: 3–5 Einträge. Vorschlag 3 Einträge:
  - `"Gib den Wert in Metern ein"`
  - `"Das Ergebnis erscheint automatisch in Fuß"`
  - `"Kopiere oder tausche die Richtung mit einem Klick"`
- `faq`: 4–6 Einträge (Draft hat 5 — perfekt). Kopiere die 5 FAQ-Fragen 1:1 aus dem Draft, aber strippe Markdown-Formatierung in den Antworten (Plain-Text für YAML). Die 5 Fragen des Drafts:
  1. `"Wie viele Fuß sind ein Meter?"`
  2. `"Was ist der Unterschied zwischen internationalem Fuß und US-Survey-Foot?"`
  3. `"Warum verwenden Pilotinnen und Piloten Fuß für Flughöhen?"`
  4. `"Wie rechne ich grob ohne Taschenrechner?"`
  5. `"Wie viele Zoll sind ein Fuß?"`
- `relatedTools`: 3 Slugs aus Draft: `['zentimeter-zu-zoll', 'kilometer-zu-meilen', 'quadratmeter-zu-quadratfuss']`
  - **Warnung:** Diese 3 Slugs existieren noch nicht in der Slug-Map. Das Zod-Schema prüft nur Kebab-Case-Regex, nicht Existenz — d.h. die Validierung passiert. Links zeigen in der Laufzeit auf 404er, was für die **Phase-0-Stub-Semantik erwünscht** ist (Spec 14.2 nennt das „Ähnliche-Tools-Card-Stub"). Session 10 fügt `scripts/content-lint.ts` hinzu, das Existenz prüft (dann ist Review-Zeit für diese Liste).
- `contentVersion`: `1`

**Body-Struktur:** H2-Kaskade **unverändert aus dem Draft übernehmen** (CONTENT.md §1 lockt diese Reihenfolge):

1. `## Was macht der Konverter?`
2. `## Umrechnungsformel`
3. `## Anwendungsbeispiele` (Tabelle 6-8 Werte beide Richtungen)
4. `## Häufige Einsatzgebiete` (Bauwesen, Luftfahrt, US-Immobilien)
5. `## Häufige Fragen` (wird doppelt mit frontmatter.faq gepflegt — H2-Block ist für User-Rendering, JSON-LD kommt erst S9/S10; in dieser Session Body-Markup genügt)
6. `## Verwandte Konverter` (die 3 Slugs als Markdown-Links zu `/de/{slug}`)

**Keine H1 im Body** — H1 wird aus `frontmatter.title` in der Astro-Layout-Page gesetzt (Task 5).

- [ ] **Step 3.1: Install `gray-matter` as devDependency**

Command:
```bash
npm install --save-dev gray-matter
```
`package.json` + `package-lock.json` werden in Step 3.7 zusammen mit Test-File und Content-File ge-committet.

- [ ] **Step 3.2: Write failing test `tests/content/meter-zu-fuss-content.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import matter from 'gray-matter';
import { toolContentFrontmatterSchema } from '../../src/content/tools.schema';

describe('meter-zu-fuss/de.md frontmatter', () => {
  const filePath = resolve(__dirname, '../../src/content/tools/meter-zu-fuss/de.md');
  const raw = readFileSync(filePath, 'utf-8');
  const parsed = matter(raw);

  it('frontmatter passes the Session-4 Zod schema', () => {
    const r = toolContentFrontmatterSchema.safeParse(parsed.data);
    if (!r.success) {
      throw new Error('schema failed: ' + JSON.stringify(r.error.issues, null, 2));
    }
    expect(r.success).toBe(true);
  });

  it('toolId matches slug-map entry', () => {
    expect(parsed.data.toolId).toBe('meter-to-feet');
    expect(parsed.data.slug).toBe('meter-zu-fuss');
    expect(parsed.data.language).toBe('de');
  });

  it('body begins with the first H2 (no H1 in body — H1 comes from layout)', () => {
    const body = parsed.content.trim();
    expect(body.startsWith('## ')).toBe(true);
  });

  it('body includes the 6 locked H2 headings in order', () => {
    const h2s = parsed.content.match(/^## .+$/gm) ?? [];
    expect(h2s).toEqual([
      '## Was macht der Konverter?',
      '## Umrechnungsformel',
      '## Anwendungsbeispiele',
      '## Häufige Einsatzgebiete',
      '## Häufige Fragen',
      '## Verwandte Konverter',
    ]);
  });
});
```

- [ ] **Step 3.3: Run test to verify it fails**

Command: `npm test -- tests/content/meter-zu-fuss-content.test.ts`
Expected: fail — Datei `src/content/tools/meter-zu-fuss/de.md` existiert nicht.

- [ ] **Step 3.4: Create `src/content/tools/meter-zu-fuss/de.md`**

Struktur:

```markdown
---
slug: meter-zu-fuss
toolId: meter-to-feet
language: de
title: "Meter in Fuß umrechnen – Formel & Tabelle"
metaDescription: "Meter in Fuß umrechnen: exakte Formel (1 m = 3,28084 ft), Tabelle gängiger Werte und FAQ zu internationalem vs. US-Survey-Fuß. Ohne Anmeldung, ohne Ads."
tagline: "Präzise Längen-Umrechnung in Sekunden — klient-seitig, ohne Tracking."
intro: "Der Konverter wandelt einen Wert in Metern (m) in die entsprechende Angabe in Fuß (ft) um und zeigt gleichzeitig den Rückweg. Er eignet sich für jede Rechnung, die zwischen metrischem und imperialem Längenmaß pendelt — von der Körpergröße bis zur Flughöhe. Meter in Fuß umrechnen ist dank exakter Definition seit 1959 eindeutig."
howToUse:
  - "Gib den Wert in Metern ein"
  - "Das Ergebnis erscheint automatisch in Fuß"
  - "Kopiere oder tausche die Richtung mit einem Klick"
faq:
  - q: "Wie viele Fuß sind ein Meter?"
    a: "Ein Meter entspricht 3,28084 Fuß. Für schnelle Kopfrechnungen reicht die Näherung mal 3,28."
  - q: "Was ist der Unterschied zwischen internationalem Fuß und US-Survey-Foot?"
    a: "Der internationale Fuß misst exakt 0,3048 m, der US-Survey-Foot 0,30480061 m. Die Differenz beträgt rund zwei Millionstel und wurde in US-Vermessung und Katasterwesen bis Ende 2022 genutzt. Seitdem gilt auch dort der internationale Fuß."
  - q: "Warum verwenden Pilotinnen und Piloten Fuß für Flughöhen?"
    a: "Die Einigung auf Fuß stammt aus der frühen zivilen Luftfahrt, die von angloamerikanischen Herstellern dominiert war. Luftraum-Regelwerke in Nordamerika, Europa und Asien führen Flugflächen bis heute in Fuß; ein Systemwechsel bringt keinen operativen Vorteil."
  - q: "Wie rechne ich grob ohne Taschenrechner?"
    a: "Multipliziere Meter mit drei und addiere rund neun Prozent — Du erhältst Fuß mit unter einem Prozent Abweichung. Umgekehrt: Fuß mal 0,3 und ein Sechzigstel draufschlagen."
  - q: "Wie viele Zoll sind ein Fuß?"
    a: "Ein Fuß entspricht 12 Zoll (inch, in). Ein Zoll misst damit exakt 0,0254 m oder 25,4 mm. Für Körpergrößen in US-Format kombinieren sich Fuß und Zoll: 5'11\" bedeutet 5 Fuß und 11 Zoll, zusammen rund 1,80 m."
relatedTools:
  - zentimeter-zu-zoll
  - kilometer-zu-meilen
  - quadratmeter-zu-quadratfuss
contentVersion: 1
---

## Was macht der Konverter?

Der Konverter wandelt einen Wert in Metern (m) in die entsprechende Angabe in Fuß
(ft) um und zeigt gleichzeitig den Rückweg. Er eignet sich für jede Rechnung, die
zwischen metrischem und imperialem Längenmaß pendelt — von der Körpergröße bis
zur Flughöhe.

## Umrechnungsformel

Ein Meter entspricht exakt 3,28084 Fuß. Die Gegenrichtung ist seit dem
Internationalen Yard-und-Pfund-Abkommen von 1959 gelockt: `1 Fuß = 0,3048 m
exakt`. Vor dieser Einigung existierten leicht abweichende nationale Fuß-Maße in
den USA, Großbritannien, Kanada, Australien und Südafrika — seit dem Abkommen
gilt dieser gemeinsame Wert in Wissenschaft, Technik und allgemeinem
Sprachgebrauch.

Formeln:

`Fuß = Meter × 3,28084`
`Meter = Fuß × 0,3048`

Rechen-Beispiel: 2 m × 3,28084 = 6,56168 ft. Auf zwei Nachkommastellen gerundet
ergibt das 6,56 ft — präzise genug für Alltag und Handwerk, zu grob für Luftfahrt
und Vermessung. Wer exakt rechnet, behält alle Stellen und rundet erst am Ende
der Rechenkette.

## Anwendungsbeispiele

Die folgende Tabelle zeigt gängige Werte in beiden Richtungen, gerundet auf zwei
bis vier Nachkommastellen.

| Meter | Fuß       | Fuß   | Meter     |
|-------|-----------|-------|-----------|
| 1     | 3,2808    | 1     | 0,3048    |
| 1,80  | 5,9055    | 5     | 1,5240    |
| 5     | 16,4042   | 6     | 1,8288    |
| 10    | 32,8084   | 10    | 3,0480    |
| 30    | 98,4252   | 100   | 30,4800   |
| 100   | 328,0840  | 1.000 | 304,8000  |

Eine Körpergröße von 1,80 m ergibt knapp 5 ft 11 in. Wolkenkratzer werden in den
USA meist in Fuß angegeben — 100 m sind rund 328 ft.

## Häufige Einsatzgebiete

**Bauwesen:** US-amerikanische und britische Baupläne verwenden Fuß und Zoll,
während europäische Gewerke in Metern planen. Wer transatlantische Pläne liest,
rechnet laufend um — bei Raumhöhen, Türbreiten, Möbelmaßen.

**Luftfahrt:** Flughöhen werden international in Fuß angegeben, unabhängig vom
Heimatland der Airline. Reisende lesen `35.000 ft` auf dem Cockpit-Display; das
entspricht 10.668 m. Nur wenige Staaten (darunter China und Russland) nutzen
Meter im oberen Luftraum.

**US-Immobilien:** Wohnflächen geben Makler in Quadratfuß (ft²) an. Bei der
Deckenhöhe bleibt aber der lineare Fuß relevant — eine Standardhöhe von 8 ft
entspricht 2,44 m.

## Häufige Fragen

### Wie viele Fuß sind ein Meter?

Ein Meter entspricht 3,28084 Fuß. Für schnelle Kopfrechnungen reicht die
Näherung `mal 3,28`.

### Was ist der Unterschied zwischen internationalem Fuß und US-Survey-Foot?

Der internationale Fuß misst exakt 0,3048 m, der US-Survey-Foot 0,30480061 m.
Die Differenz beträgt rund zwei Millionstel und wurde in US-Vermessung und
Katasterwesen bis Ende 2022 genutzt. Seitdem gilt auch dort der internationale
Fuß.

### Warum verwenden Pilotinnen und Piloten Fuß für Flughöhen?

Die Einigung auf Fuß stammt aus der frühen zivilen Luftfahrt, die von
angloamerikanischen Herstellern dominiert war. Luftraum-Regelwerke in
Nordamerika, Europa und Asien führen Flugflächen bis heute in Fuß; ein
Systemwechsel bringt keinen operativen Vorteil.

### Wie rechne ich grob ohne Taschenrechner?

Multipliziere Meter mit drei und addiere rund neun Prozent — Du erhältst Fuß
mit unter einem Prozent Abweichung. Umgekehrt: Fuß mal 0,3 und ein Sechzigstel
draufschlagen.

### Wie viele Zoll sind ein Fuß?

Ein Fuß entspricht 12 Zoll (inch, in). Ein Zoll misst damit exakt 0,0254 m oder
25,4 mm. Für Körpergrößen in US-Format kombinieren sich Fuß und Zoll: `5'11"`
bedeutet 5 Fuß und 11 Zoll, zusammen rund 1,80 m.

## Verwandte Konverter

- [Zentimeter in Zoll](/de/zentimeter-zu-zoll)
- [Kilometer in Meilen](/de/kilometer-zu-meilen)
- [Quadratmeter in Quadratfuß](/de/quadratmeter-zu-quadratfuss)
```

**Zeichen-Zählungen verifizieren** (mit Shell-Einzeiler):
```bash
node -e "
const s = require('gray-matter')(require('fs').readFileSync('src/content/tools/meter-zu-fuss/de.md','utf-8'));
console.log('title:', s.data.title.length);
console.log('metaDescription:', s.data.metaDescription.length);
"
# expected: title 30-60, metaDescription 140-160
```

Falls nicht im gewünschten Korridor: Text anpassen, bis es passt. **Die Länge ist vom Schema hart enforced.**

- [ ] **Step 3.5: Run test to verify frontmatter + H2-Struktur korrekt**

Command: `npm test -- tests/content/meter-zu-fuss-content.test.ts`
Expected: PASS 4/4.

- [ ] **Step 3.6: Run full suite + typecheck + build**

Commands:
- `npm test` → 119/119 grün (115 + 4 neu)
- `npm run check` → 0/0/0
- `npm run build` → grün. Astro-Content-Collection `tools` hat jetzt **1 Eintrag**. Build-Log zeigt ihn.

- [ ] **Step 3.7: Commit**

```bash
git add src/content/tools/meter-zu-fuss/de.md tests/content/meter-zu-fuss-content.test.ts package.json package-lock.json
git commit -m "feat(content): meter-zu-fuss de.md + frontmatter schema-locked

Rulebooks-Read: PROJECT, CONVENTIONS, CONTENT"
```

---

## Task 4 — Converter.svelte (Svelte-5-Runes-Komponente)

**Files:**
- Create: `src/components/tools/Converter.svelte`
- Create: `tests/components/tools/converter.test.ts`

**Rationale:** Kern-UI-Template für alle Converter (Meter↔Fuß, EUR↔USD, °C↔°F etc.). Svelte-5-Runes (`$state`, `$derived`, `$effect`) nach CONVENTIONS. TDD über `mount`/`unmount`/`flushSync` analog zu `ThemeToggle`-Test-Pattern aus S3.

**UI-Spec (Spec 14.2):**

```
┌────────────────────────────────────┐
│ Meter (m)              [    1    ] │
│                                    │
│         [ ⇅ Tauschen ]             │
│                                    │
│ Fuß (ft)   [3,28084]    [📋 Kopie] │
└────────────────────────────────────┘

Häufige Werte: [1] [10] [100] [1000]
```

**Props & State:**

```typescript
interface Props {
  config: ConverterConfig;
}
```

State:
- `inputValue: number = $state(config.examples[0] ?? 1)` — Startwert
- `direction: 'forward' | 'inverse' = $state('forward')` — Swap-Zustand
- `copyState: 'idle' | 'copied' = $state('idle')` — UI-Feedback für Copy-Button

Derived:
- `fromLabel = $derived(direction === 'forward' ? config.units.from.label : config.units.to.label)`
- `toLabel   = $derived(direction === 'forward' ? config.units.to.label   : config.units.from.label)`
- `outputValue = $derived(direction === 'forward' ? config.convert(inputValue) : config.convertInverse(inputValue))`
- `outputFormatted = $derived(formatDecimal(outputValue, config.decimals))` — `toLocaleString('de-DE', { maximumFractionDigits, minimumFractionDigits: 0 })`

Helper (inline in Script):
```typescript
function formatDecimal(n: number, decimals: number): string {
  if (!Number.isFinite(n)) return '–';
  return n.toLocaleString('de-DE', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
    useGrouping: false,
  });
}
```

**Event-Handler:**
- `onInput(e)`: parse `e.target.value` → wenn `Number.isFinite` und ≥ 0 → `inputValue = parsed`, sonst state unverändert.
- `onSwap()`: `direction = direction === 'forward' ? 'inverse' : 'forward'`. `inputValue` bleibt **unverändert** — der User sieht sofort die neue Richtung mit gleicher Eingabe interpretiert.
- `onCopy()`: `navigator.clipboard.writeText(outputFormatted)` → `copyState = 'copied'` → nach 1500ms `copyState = 'idle'`.
- `onQuickValue(n)`: `inputValue = n`; `direction` bleibt unverändert.

**Markup-Constraints (CONVENTIONS CSS §):**
- Tailwind-Utility-First. Custom-CSS nur in scoped `<style>`-Block, wenn Utility nicht ausreicht.
- Keine Hex-Codes — `var(--color-*)` via Tailwind-Arbitrary-Value `class="bg-[var(--color-surface)]"` oder via `<style>`-Block.
- A11y: `<label for="...">`, `aria-live="polite"` auf Output, `aria-pressed` auf Swap-Button, `type="button"` auf ALLEN Buttons (sonst form-submit-Default).

**Hydration:** `client:load` (NICHT `client:idle` — Input muss sofort reagibel sein, sonst Jank beim ersten Tastendruck). Entspricht CONVENTIONS Svelte §.

- [ ] **Step 4.1: Write failing test `tests/components/tools/converter.test.ts`**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushSync, mount, unmount } from 'svelte';
import Converter from '../../../src/components/tools/Converter.svelte';
import { meterZuFuss } from '../../../src/lib/tools/meter-zu-fuss';

function render() {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const cmp = mount(Converter, { target, props: { config: meterZuFuss } });
  flushSync();
  return { target, cmp };
}

describe('Converter.svelte — meter-zu-fuss', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders labels "Meter" (from) and "Fuß" (to) by default', () => {
    const { target, cmp } = render();
    expect(target.textContent).toContain('Meter');
    expect(target.textContent).toContain('Fuß');
    unmount(cmp);
  });

  it('initial input is first example (1) and output shows "3,2808"', () => {
    const { target, cmp } = render();
    const input = target.querySelector('input[type="number"]') as HTMLInputElement;
    expect(input.value).toBe('1');
    const output = target.querySelector('[data-testid="converter-output"]');
    // decimals: 4 + useGrouping: false → 3.28084 rounded to 4 FD → "3,2808"
    expect(output?.textContent?.trim()).toBe('3,2808');
    unmount(cmp);
  });

  it('typing "2" into input updates output to "6,5617"', () => {
    const { target, cmp } = render();
    const input = target.querySelector('input[type="number"]') as HTMLInputElement;
    input.value = '2';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    flushSync();
    const output = target.querySelector('[data-testid="converter-output"]');
    // 2 * 3.28084 = 6.56168 → rounded to 4 FD → "6,5617"
    expect(output?.textContent?.trim()).toBe('6,5617');
    unmount(cmp);
  });

  it('swap button flips labels to Fuß (from) and Meter (to)', () => {
    const { target, cmp } = render();
    const swap = target.querySelector('[data-testid="converter-swap"]') as HTMLButtonElement;
    swap.click();
    flushSync();
    // Ersten Label-Slot müssen nun Fuß zeigen, zweiten Meter.
    const labels = target.querySelectorAll('[data-testid^="converter-label-"]');
    expect(labels[0]?.textContent).toContain('Fuß');
    expect(labels[1]?.textContent).toContain('Meter');
    unmount(cmp);
  });

  it('swap + input=1 yields inverse value "0,3048"', () => {
    const { target, cmp } = render();
    (target.querySelector('[data-testid="converter-swap"]') as HTMLButtonElement).click();
    flushSync();
    const input = target.querySelector('input[type="number"]') as HTMLInputElement;
    input.value = '1';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    flushSync();
    const output = target.querySelector('[data-testid="converter-output"]');
    expect(output?.textContent?.trim()).toBe('0,3048');
    unmount(cmp);
  });

  it('quick-value buttons [1,10,100,1000] set input and output', () => {
    const { target, cmp } = render();
    const btn100 = Array.from(target.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === '100',
    ) as HTMLButtonElement;
    btn100.click();
    flushSync();
    const input = target.querySelector('input[type="number"]') as HTMLInputElement;
    expect(input.value).toBe('100');
    const output = target.querySelector('[data-testid="converter-output"]');
    expect(output?.textContent?.trim()).toBe('328,084');
    unmount(cmp);
  });

  it('copy button writes output to clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    const { target, cmp } = render();
    const copy = target.querySelector('[data-testid="converter-copy"]') as HTMLButtonElement;
    copy.click();
    // onCopy is async, but navigator.clipboard.writeText is the first statement
    // before any await — so it's invoked synchronously inside the click handler.
    // flushSync flushes Svelte state updates; the writeText call itself does not
    // need to be awaited for this assertion.
    flushSync();
    expect(writeText).toHaveBeenCalledWith('3,2808');
    unmount(cmp);
  });

  it('output aria-live="polite" for screen readers', () => {
    const { target, cmp } = render();
    const output = target.querySelector('[data-testid="converter-output"]');
    expect(output?.getAttribute('aria-live')).toBe('polite');
    unmount(cmp);
  });
});
```

- [ ] **Step 4.2: Run test to verify all 8 fail**

Command: `npm test -- tests/components/tools/converter.test.ts`
Expected: fail — Komponente existiert nicht.

- [ ] **Step 4.3: Create `src/components/tools/Converter.svelte`**

```svelte
<script lang="ts">
  import type { ConverterConfig } from '../../lib/tools/schemas';

  interface Props {
    config: ConverterConfig;
  }

  let { config }: Props = $props();

  let inputValue = $state<number>(config.examples[0] ?? 1);
  let direction = $state<'forward' | 'inverse'>('forward');
  let copyState = $state<'idle' | 'copied'>('idle');

  const fromLabel = $derived(
    direction === 'forward' ? config.units.from.label : config.units.to.label,
  );
  const toLabel = $derived(
    direction === 'forward' ? config.units.to.label : config.units.from.label,
  );
  const fromUnit = $derived(
    direction === 'forward' ? config.units.from.id : config.units.to.id,
  );
  const toUnit = $derived(
    direction === 'forward' ? config.units.to.id : config.units.from.id,
  );
  const outputValue = $derived(
    direction === 'forward'
      ? config.convert(inputValue)
      : config.convertInverse(inputValue),
  );
  const outputFormatted = $derived(formatDecimal(outputValue, config.decimals));

  function formatDecimal(n: number, decimals: number): string {
    if (!Number.isFinite(n)) return '–';
    return n.toLocaleString('de-DE', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: 0,
      useGrouping: false,
    });
  }

  function onInput(e: Event) {
    const v = (e.target as HTMLInputElement).valueAsNumber;
    if (Number.isFinite(v) && v >= 0) inputValue = v;
  }

  function onSwap() {
    direction = direction === 'forward' ? 'inverse' : 'forward';
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(outputFormatted);
      copyState = 'copied';
      setTimeout(() => (copyState = 'idle'), 1500);
    } catch {
      // Clipboard-Ablehnung (Permission-Denied) — still fail silent
    }
  }

  function onQuickValue(n: number) {
    inputValue = n;
  }
</script>

<div class="converter">
  <div class="row">
    <label for="converter-input" data-testid="converter-label-from">
      {fromLabel} ({fromUnit})
    </label>
    <input
      id="converter-input"
      type="number"
      inputmode="decimal"
      step="any"
      min="0"
      value={inputValue}
      oninput={onInput}
    />
  </div>

  <button
    type="button"
    class="swap"
    data-testid="converter-swap"
    onclick={onSwap}
    aria-label="Richtung tauschen"
  >
    ⇅ Tauschen
  </button>

  <div class="row">
    <span data-testid="converter-label-to">{toLabel} ({toUnit})</span>
    <output
      data-testid="converter-output"
      aria-live="polite"
    >{outputFormatted}</output>
    <button
      type="button"
      data-testid="converter-copy"
      onclick={onCopy}
      aria-label="Ergebnis kopieren"
    >
      {copyState === 'copied' ? '✓ Kopiert' : '📋 Kopieren'}
    </button>
  </div>

  {#if config.examples.length > 0}
    <div class="quick">
      <span class="quick-label">Häufige Werte:</span>
      {#each config.examples as ex (ex)}
        <button
          type="button"
          onclick={() => onQuickValue(ex)}
        >{ex}</button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .converter {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-6);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-lg);
  }
  .row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }
  .row label,
  .row span {
    font-weight: 500;
    color: var(--color-text);
    min-width: 8ch;
  }
  .row input {
    flex: 1 1 auto;
    padding: var(--space-2) var(--space-3);
    font: inherit;
    font-variant-numeric: tabular-nums;
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-bg);
    color: var(--color-text);
  }
  .row input:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .row output {
    flex: 1 1 auto;
    padding: var(--space-2) var(--space-3);
    font-variant-numeric: tabular-nums;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    color: var(--color-text);
  }
  .swap {
    align-self: center;
    padding: var(--space-2) var(--space-4);
    font: inherit;
    font-size: var(--font-size-small);
    background: var(--color-bg);
    color: var(--color-accent);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease-out);
  }
  .swap:hover {
    background: var(--color-surface);
  }
  .swap:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  button[data-testid='converter-copy'] {
    padding: var(--space-2) var(--space-3);
    font: inherit;
    background: transparent;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    cursor: pointer;
  }
  button[data-testid='converter-copy']:hover {
    color: var(--color-text);
  }
  .quick {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }
  .quick-label {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
  }
  .quick button {
    padding: var(--space-1) var(--space-3);
    font: inherit;
    background: var(--color-bg);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    cursor: pointer;
  }
  .quick button:hover {
    background: var(--color-surface);
  }
</style>
```

- [ ] **Step 4.4: Run test to verify it passes**

Command: `npm test -- tests/components/tools/converter.test.ts`
Expected: PASS 8/8.

**Falls Tests failen: NICHT raten** — Subagent nutzt `svelte`-Dokumentation oder fragt back. Typische Ursachen:
- `$derived()` Syntax-Fehler bei mehrzeiligen Expressions → in eine Zeile bringen oder via `$derived.by(() => { ... })`
- `oninput`-Event-Name (Svelte 5) statt `on:input` (Svelte 4)
- `type="number"` + `valueAsNumber` in jsdom — bei Bedarf als Fallback `Number(e.target.value)`

- [ ] **Step 4.5: Run full suite + typecheck + build**

Commands:
- `npm test` → 127/127 grün (119 + 8 neu)
- `npm run check` → 0/0/0
- `npm run build` → grün

- [ ] **Step 4.6: Commit**

```bash
git add src/components/tools/Converter.svelte tests/components/tools/converter.test.ts
git commit -m "feat(tools): Converter.svelte with Svelte 5 Runes

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE"
```

---

## Task 5 — Dynamic Route `src/pages/[lang]/[slug].astro`

**Files:**
- Create: `src/pages/[lang]/[slug].astro`

**Rationale:** Diese Datei schließt den Loop: alle Tool-Pages (jetzt 1, später 1000+) werden über genau diese eine Route statisch generiert. `getStaticPaths()` listet Content-Collection-Einträge und erzeugt pro Entry eine Page. Die Page liest den zugehörigen Tool-Config aus einer lokalen Registry, rendert den passenden Svelte-Komponenten-Typ + Markdown-Body.

**Design-Entscheidungen:**
- **Registry:** Lokal in der Astro-Page — `const toolRegistry = { 'meter-to-feet': meterZuFuss };`. Wenn ein Content-Entry keinen Registry-Eintrag hat → wir werfen einen Build-Error. Das erzwingt Disziplin: Kein Content ohne Tool-Config (und umgekehrt).
- **Kein separater Registry-File:** YAGNI. Bei 1000+ Tools überdenken — explizite Registry reduziert Bundle-Size (nur benötigte Configs werden via SSG-Tree-Shaking eingebunden). Ein zentraler `src/lib/tools/registry.ts` würde alle Configs in einem Edge laden und blockt Tree-Shaking. Das verschieben wir erst, wenn der Nutzen zählt.
- **Komponenten-Switch:** Session 5 hat nur `Converter`. Falls `config.type !== 'converter'`: Build-Error. Erweitert S7 (File-Tool) und danach.
- **Hydration:** `client:load` (Begründung siehe Task 4).
- **H1:** Layout erzeugt via `title` in Props. Zusätzlich explizites `<h1>` im Page-Body, weil der Astro `<title>`-Tag (in `<head>`) und Semantic-H1 (im `<body>`) zwei verschiedene Dinge sind.
- **Path-Prop für BaseLayout:** `pathWithoutLang: `/${slug}`` — Hreflang-Baukasten braucht das.
- **Ad-Slot-Platzhalter:** Nicht diese Session — Spec Section 5.7 zeigt `[Ad-Slot 1]`/`[Ad-Slot 2]`/`[Ad-Slot 3]`, aber die `.ad-slot` Styles (Tokens aus S2) sind nur reserviert, nicht gerendert. Phase 0 rendert **keine** Ad-Slots; Phase 2 aktiviert sie. Wir überspringen sie deshalb hier.

- [ ] **Step 5.1: Create `src/pages/[lang]/[slug].astro`**

```astro
---
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Converter from '../../components/tools/Converter.svelte';
import { meterZuFuss } from '../../lib/tools/meter-zu-fuss';
import type { ToolConfig } from '../../lib/tools/schemas';

const toolRegistry: Record<string, ToolConfig> = {
  'meter-to-feet': meterZuFuss,
};

export async function getStaticPaths() {
  const entries = await getCollection('tools');
  return entries.map((entry) => ({
    params: { lang: entry.data.language, slug: entry.data.slug },
    props: { entry },
  }));
}

type Props = { entry: CollectionEntry<'tools'> };
const { entry } = Astro.props;
const config = toolRegistry[entry.data.toolId];

if (!config) {
  throw new Error(
    `No tool config registered for toolId="${entry.data.toolId}". ` +
      `Add an entry to src/pages/[lang]/[slug].astro:toolRegistry.`,
  );
}

if (config.type !== 'converter') {
  throw new Error(
    `Session 5 only supports type="converter", got type="${config.type}" ` +
      `for toolId="${entry.data.toolId}". Add a branch in [slug].astro.`,
  );
}

const { Content } = await entry.render();
---
<BaseLayout
  lang={entry.data.language}
  title={entry.data.title}
  description={entry.data.metaDescription}
  pathWithoutLang={`/${entry.data.slug}`}
>
  <article class="tool-page">
    <header class="tool-header">
      <h1>{entry.data.title}</h1>
      <p class="tagline">{entry.data.tagline}</p>
    </header>

    <section class="tool-ui">
      <Converter config={config} client:load />
    </section>

    <section class="tool-intro">
      <p>{entry.data.intro}</p>
    </section>

    <section class="tool-how">
      <h2>Wie benutzt du den Konverter?</h2>
      <ol>
        {entry.data.howToUse.map((step) => <li>{step}</li>)}
      </ol>
    </section>

    <section class="tool-seo">
      <Content />
    </section>
  </article>
</BaseLayout>

<style>
  .tool-page {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }
  .tool-header h1 {
    margin: 0 0 var(--space-2) 0;
  }
  .tool-header .tagline {
    color: var(--color-text-muted);
    margin: 0;
  }
  .tool-how ol {
    padding-left: var(--space-6);
  }
  .tool-how li {
    margin-bottom: var(--space-2);
  }
  .tool-seo :global(h2) {
    margin-top: var(--space-8);
  }
  .tool-seo :global(h3) {
    margin-top: var(--space-6);
  }
  .tool-seo :global(table) {
    border-collapse: collapse;
    margin: var(--space-4) 0;
  }
  .tool-seo :global(th),
  .tool-seo :global(td) {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
  }
  .tool-seo :global(code) {
    font-family: var(--font-family-mono);
    background: var(--color-surface);
    padding: 0 var(--space-1);
    border-radius: var(--r-sm);
  }
</style>
```

**Anmerkung zu `:global()`-Styles:** Astro scoped `<style>` auf die Page — aber der rendered `<Content />` Markdown-HTML bekommt die Page-Scope-Klasse NICHT. Wir nutzen `:global()` in dieser gescopten Section, damit die Regeln auf Markdown-Children (`h2`, `h3`, `table`, `code`) greifen. Das ist die Standard-Astro-Lösung und reicht für die 1 Page; nicht Template-extrahieren.

- [ ] **Step 5.2: Run build + manual dev-server smoke**

Commands:
- `npm run check` → 0/0/0
- `npm run build` → grün. Build-Log muss zeigen:
  - `[content] Synced 1 file from tools collection`
  - Eine Page generiert: `dist/de/meter-zu-fuss.html`
- `npm run dev` im Hintergrund starten (user tut das manuell oder Agent mit `run_in_background=true`), dann `curl -sS http://localhost:4321/de/meter-zu-fuss | head -40` → HTML kommt zurück, enthält `<h1>` mit Titel.

Smoke-Validation Checklist (Agent dokumentiert Ergebnisse im Commit-Message):
- [ ] Page rendered at `/de/meter-zu-fuss` (HTTP 200)
- [ ] H1 enthält `"Meter in Fuß umrechnen"` (oder gewählte Title-Version)
- [ ] Converter-Insel sichtbar mit Input-Feld, Swap-Button, Output-Feld
- [ ] Markdown-Body rendert H2-Sections + Tabelle
- [ ] Light/Dark-Toggle im Header wechselt Theme — Converter-Box tönt mit

Wenn der Agent **keine interaktive Browser-Sitzung** durchführen kann, reicht der curl-Smoke + Build-Log-Check — dokumentiere das explizit im Commit-Message („manuelle Browser-Verifikation ausstehend für User").

- [ ] **Step 5.3: Run full suite (keine neuen Tests in dieser Task; Astro-Pages werden per Build verifiziert)**

Command: `npm test` → 127/127 grün (unverändert zu Task 4, da keine Unit-Tests neu).

- [ ] **Step 5.4: Commit**

```bash
git add src/pages/\[lang\]/\[slug\].astro
git commit -m "feat(pages): dynamic [lang]/[slug] route for tool pages

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE"
```

**Hinweis:** Die eckigen Klammern in `[lang]/[slug].astro` müssen auf der Shell escaped werden (wie gezeigt), sonst interpretiert die Shell sie als Glob. In Windows-bash funktioniert Backslash-Escape normalerweise; bei Problemen Alternativ-Syntax `git add 'src/pages/[lang]/[slug].astro'` (mit Single-Quotes).

---

## Task 6 — PROGRESS.md Session-Close

**Files:**
- Modify: `PROGRESS.md`

**Rationale:** Session-Ritual aus CLAUDE.md. Jede Session endet mit aktualisiertem Tracker. Der Commit-Trailer `Rulebooks-Read: ...` bleibt Pflicht.

- [ ] **Step 6.1: Edit `PROGRESS.md`**

Kernänderungen:

1. Header-Block:
   - `Letztes Update: 2026-04-18 (Session 5, End)`
   - `Aktuelle Phase: Phase 0 — Foundation`
   - `Current Session: #5 — Meter-zu-Fuß Prototype ✅`

2. Phase-0-Tabelle: Zeile `5 — Meter-zu-Fuß Prototype` von `⬜ pending` auf `✅ done` setzen.

3. Tool-Inventar-Tabelle: Zeile `meter-zu-fuss` auf:

   | Tool | Config | Content-DE | Icon | Tests |
   |------|--------|------------|------|-------|
   | meter-zu-fuss | ✅ | ✅ | ⬜ (Pending) | ✅ |

   `Icon` bleibt `⬜ Pending` — Icon-Generation ist Session 9 (Icon-Pipeline) bzw. User-Handarbeit bei Recraft.ai.

4. Next-Session-Plan-Absatz komplett ersetzen:

```markdown
## Next-Session-Plan
Session 6 — Prototype-Review #1: User testet `http://localhost:4321/de/meter-zu-fuss`
lokal (Desktop + Mobile, Light + Dark). Feedback zu Layout, Typografie,
Converter-Interaktion, Mobile-Scroll-Verhalten. Iteration bis 100%. Am Ende der
Session werden die gelockten Patterns in `CONVENTIONS.md` (Svelte-5-Runes-Pattern
für Tools, `data-testid`-Konvention) und `STYLE.md` (Converter-Box-Layout,
Quick-Value-Button-Look) nachgetragen. Kein neuer Converter, kein WebP — das ist
Session 7.
```

5. Blockers-Section: bleibt `Keine.` solange es keine Blocker gibt. Falls Task 5 manuelle Browser-Verifikation nicht abgeschlossen hat: Eintrag `- User-Verifikation offen: /de/meter-zu-fuss im Browser testen`.

- [ ] **Step 6.2: Run final verification**

Commands:
- `bash scripts/check-git-account.sh` → pkcut-lab bestätigt
- `npm test` → 127/127 grün
- `npm run check` → 0/0/0
- `npm run build` → grün

- [ ] **Step 6.3: Commit**

```bash
git add PROGRESS.md
git commit -m "docs(progress): Session 5 Meter-zu-Fuß Prototype complete

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE, CONTENT"
```

- [ ] **Step 6.4: Push**

```bash
git push origin main
```

---

## Final Code Review (nach allen 6 Tasks)

Dispatch code-reviewer (superpowers:subagent-driven-development letzter Schritt) mit Scope:

- Alle 6 Commits dieser Session (ab Merge-Commit)
- Quality-Gates grün: `npm test`, `npm run check`, `npm run build`
- Manuelle Browser-Verifikation: `/de/meter-zu-fuss` Desktop + Mobile + Dark-Mode (wenn Agent einen Browser kontrollieren kann, sonst User delegieren)
- Cross-Check: Converter.svelte-Patterns sind reusable für weitere Converter (keine `meter`/`fuss`-Strings hart-codiert — alle via `config.units`)

Dokumentieren der offenen Items für S6:
- Icon-PNG muss vom User bei Recraft.ai generiert werden (Prompt steht in Config)
- Tailwind-Zu-Token-Coverage: Falls Review feststellt, dass ein Token fehlt → S6/S8 nachtragen, NICHT hier
- `schema.org/FAQPage` JSON-LD: offenes S9-Item (siehe Spec 8.7 / 12.1)

---

## Locked Contracts (ab Session-5-Close)

Nach dieser Session sind folgende APIs **gelockt**. Erweitern nur additiv; Signatur-Änderungen erfordern explizit neue Session.

- `src/lib/tools/meter-zu-fuss.ts` — `meterZuFuss: ConverterConfig`. Shape gelockt; Änderungen am Convert-Wert (`3.28084`) oder an `examples` wären breaking für Test-Snapshots und Content-Tabelle.
- `src/components/tools/Converter.svelte` — Props `{ config: ConverterConfig }`. Runes-Pattern als Vorlage für künftige Tool-Komponenten. Neue Tool-Typen (Calculator, Formatter …) kriegen eigene Komponente mit gleichem Runes-Design.
- `src/pages/[lang]/[slug].astro` — `getStaticPaths()`-Signatur (via Content-Collection), `toolRegistry`-Lookup-Pattern, `config.type`-Switch (noch einbranch, expandiert S7+).
- `data-testid`-Konvention: `data-testid="converter-*"` (and analog für andere Tools `calculator-*`, `validator-*` etc.) ist jetzt das Test-Selector-Pattern. Wird in S6 in CONVENTIONS.md nachgetragen.
- Dezimal-Formatierung: `toLocaleString('de-DE', { maximumFractionDigits, minimumFractionDigits: 0, useGrouping: false })` ist das locked Pattern für DE-Locale. EN/ES/FR/PT-BR bekommen eigene Locales ab Phase 3.

---

## Deferred (NICHT diese Session)

- **Icon-Pipeline** (`scripts/build-icons.ts` + `sharp` + PNG→WebP): Session 9
- **Pagefind-Indexierung** (`data-pagefind-body`, `data-pagefind-meta`): Session 9
- **Service-Worker + PWA-Manifest**: Session 9
- **JSON-LD `FAQPage` / `WebApplication`**: Session 9/10 (`scripts/generate-jsonld.ts`)
- **`scripts/content-lint.ts`** (Wortzahl-, Keyword-Density-, relatedTools-Existenz-Check): Session 10
- **Playwright E2E-Test**: Session 10
- **Ad-Slot-Rendering** (Slot 1/2/3 mit AdSense-Code): Phase 2
- **Mehrsprachige Meter-zu-Fuß-Version** (`en.md`, `es.md` etc.): Phase 3
- **WebP-Konverter (File-Tool Prototype)**: Session 7

---

## YAGNI-Begründungen (explizite Ablehnungen)

- **Kein `src/lib/tools/registry.ts`:** Der lokale Registry-Record in `[slug].astro` reicht für Phase 0. Ein separater File erzwingt Import aller Configs und verhindert Tree-Shaking — Overhead ohne Nutzen bei 1 Tool. Bei ≥ 20 Tools re-evaluieren.
- **Kein Swap-Animation:** Spec 14.2 zeigt stills; Motion-Token `--dur-med` ist vorhanden, aber visuelle Verfeinerungen werden S6 nach User-Review diskutiert.
- **Kein History-Stack für Swap:** Nicht gefragt. Input bleibt beim Swap unverändert — das ist die einfachste Regel; wenn User sie nicht mag, S6-Feedback.
- **Kein Error-State für Non-Number-Input:** HTML5 `type="number"` verhindert schon Eingaben außerhalb Zahlen; `oninput` ignoriert non-finite-Werte leise. Ein roter Fehler-Banner wäre prämature Abstraktion.
- **Keine separate `format.ts`-Util:** `formatDecimal` ist 4 Zeilen inline im Converter. Wenn ein zweiter Tool-Typ (Calculator) die gleiche Logik braucht → dann extrahieren.
- **Kein `ThemeScript`-Touch:** Darkmode läuft bereits über den `html[data-theme]`-Schalter aus S2/S3. Der Converter konsumiert nur Tokens; keine theme-spezifische Logik hier.

---

## Verification Checklist (nach allen 6 Tasks)

- [ ] `npm test` → 127+ grün (6 Task-1 + 3 Task-2 + 4 Task-3 + 8 Task-4 = 21 neu)
- [ ] `npm run check` → 0 errors / 0 warnings / 0 hints
- [ ] `npm run build` → Astro baut erfolgreich, Build-Log zeigt 3 Pages (`/de/`, `/de/styleguide`, `/de/meter-zu-fuss`) und 1 Collection-Entry (`meter-zu-fuss/de`)
- [ ] `bash scripts/check-git-account.sh` → pkcut-lab bestätigt vor jedem Commit
- [ ] `git log --oneline` seit Merge zeigt 6 saubere Commits, jeder mit Conventional-Commits-Präfix + `Rulebooks-Read`-Trailer
- [ ] `http://localhost:4321/de/meter-zu-fuss` im `npm run dev`-Mode:
  - H1, Tagline, Converter-Box sichtbar
  - Input: `1` → Output: `3,2808` (4 Dezimalstellen, DE-Locale mit Komma, ohne Tausender-Gruppierung)
  - Swap-Button flippt Labels (Fuß↔Meter)
  - Copy-Button kopiert den formatierten Output in Zwischenablage
  - Quick-Values 1/10/100/1000 setzen Input korrekt
  - Light/Dark-Toggle ändert Theme inkl. Converter-Box
  - Markdown-Body rendert alle 6 H2-Sections + Tabelle korrekt
- [ ] `PROGRESS.md` aktuell (Session 5 ✅, Tool-Inventar-Zeile aktualisiert, Next-Session-Plan auf Session 6 umgestellt)

---

## Done.

Nach erfolgreichem Session-5-Close:
1. Branch ist aktuell auf `main`, gepusht.
2. User lädt `/de/meter-zu-fuss` im Browser und geht durch die Verification-Checklist.
3. Bei allen grün → Session 6 (Review) kann starten.
4. Bei rot → Issues in neues Issue oder TODO-Kommentar, Session 6 fixt sie.
