# Tool-Cross-Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zwei Cross-Link-Mechanismen auf der Site — Footer-„Werkzeuge"-Section ersetzt den `Kategorien`-Stub, Related-Tools-Block am Fuß jeder Tool-Seite nutzt das existierende `frontmatter.relatedTools`-Feld.

**Architecture:** Ein gemeinsamer Helper `src/lib/tools/list.ts` kapselt Content-Collection + Slug-Map + Icon-Existence-Check. Zwei Astro-Components (`FooterToolsList.astro`, `RelatedTools.astro`) konsumieren den Helper. Keine Runtime-JS-Dependencies außer einer Inline-IntersectionObserver für Fade-In-Stagger. Build-time only.

**Tech Stack:** Astro 5 SSG, TypeScript, Vitest. Tokens-only CSS (Graphit, Inter, `var(--dur-med)`/`var(--ease-out)` — Hard-Caps aus CLAUDE.md §5). Spec: [docs/superpowers/specs/2026-04-19-tool-cross-links-design.md](../specs/2026-04-19-tool-cross-links-design.md).

---

## File Structure

**Neu:**
- `src/lib/tools/list.ts` — `listToolsForLang` + `resolveRelatedTools` + `ToolListItem`-Type
- `src/components/FooterToolsList.astro` — Footer-„Werkzeuge"-Section (List + Überlauf-Link)
- `src/components/RelatedTools.astro` — Verwandte-Tools-Block (Grid + Fade-In-Stagger + IntersectionObserver)
- `tests/lib/tools/list.test.ts` — Helper-Unit-Tests
- `tests/components/footer-tools-list.test.ts` — Footer-Section-Tests
- `tests/components/related-tools.test.ts` — RelatedTools-Tests

**Modifiziert:**
- `src/styles/tokens.css` — drei neue Tokens: `--icon-size-md`, `--stagger-step`, `--underline-offset`
- `src/components/Footer.astro` — `Kategorien`-Section durch `<FooterToolsList>` ersetzt
- `src/pages/[lang]/[slug].astro` — `<RelatedTools>` als Sibling nach `<article class="tool-article">` gemountet
- `tests/smoke/build.test.ts` — Render-Assertions für Footer + RelatedTools
- `STYLE.md` — §13 „Cross-Link-Muster" (neu), §12 bleibt „Skill-Integration"
- `CONVENTIONS.md` — §Content-Collection-Enumeration mit `list.ts` als Single-Source-of-Truth

---

## Task 1: Token Pre-Introduction

**Files:**
- Modify: `src/styles/tokens.css`

Grund: Cross-Link-Komponenten brauchen `--icon-size-md`, `--stagger-step`, `--underline-offset`. Hard-Cap verbietet ad-hoc-px. Diese Tokens existieren vor allem Konsumenten-Code.

- [ ] **Step 1: Tokens in tokens.css ergänzen**

Drei neue Einträge in der `:root`-Block, gruppiert nach semantischer Familie (icon-size bei den Grössen, stagger-step bei Motion, underline-offset bei Typography-Helpers). Finde in der existierenden tokens.css die nächstbeste Gruppe.

Hinzufügen in passenden Blöcken:
```css
--space-5: 1.25rem;     /* Fill gap in space-scale — wird bereits von src/pages/[lang]/index.astro:172 konsumiert (silent-fallback auf 0), Related-Tools braucht es jetzt für Card-Padding */
--icon-size-md: 48px;   /* Related-Tools-Cards; zukünftige 48er-Icons */
--stagger-step: 60ms;   /* Fade-In-Stagger-Einheit für IntersectionObserver */
--underline-offset: 2px;/* text-underline-offset für Footer-Link-Hover */
```

- [ ] **Step 2: Verifikations-Test — Tokens per vitest regex-assertion**

Neues File `tests/styles/tokens.test.ts` (falls nicht existiert, dann erstellen; falls existiert, extending).

```typescript
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

describe('tokens — cross-link pre-introduction', () => {
  const src = readFileSync('src/styles/tokens.css', 'utf8');
  it('exposes --space-5 (fills scale gap; unblocks homepage tool-card padding)', () => {
    expect(src).toMatch(/--space-5:\s*1\.25rem/);
  });
  it('exposes --icon-size-md', () => {
    expect(src).toMatch(/--icon-size-md:\s*48px/);
  });
  it('exposes --stagger-step', () => {
    expect(src).toMatch(/--stagger-step:\s*60ms/);
  });
  it('exposes --underline-offset', () => {
    expect(src).toMatch(/--underline-offset:\s*2px/);
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npm test -- tests/styles/tokens.test.ts`
Expected: 4/4 PASS.

- [ ] **Step 4: Commit**

```bash
git add src/styles/tokens.css tests/styles/tokens.test.ts
git commit -m "feat(tokens): add --space-5, --icon-size-md, --stagger-step, --underline-offset"
```

---

## Task 2: `list.ts` Helper + Unit-Tests

**Files:**
- Create: `src/lib/tools/list.ts`
- Create: `tests/lib/tools/list.test.ts`

Gemeinsamer Helper für Content-Collection-Enumeration. Konsumenten: Footer (Task 3), RelatedTools (Task 4), später Homepage-Refactor (post-MVP).

- [ ] **Step 1: Failing Tests schreiben**

```typescript
// tests/lib/tools/list.test.ts
import { describe, it, expect, vi } from 'vitest';
import { listToolsForLang, resolveRelatedTools } from '../../../src/lib/tools/list';

vi.mock('astro:content', () => ({
  getCollection: vi.fn(async (_name, filter) => {
    const all = [
      { data: { toolId: 'remove-background', language: 'de',
                title: 'Hintergrund entfernen — direkt im Browser',
                tagline: 'Freisteller in Sekunden — das Bild bleibt auf deinem Gerät.' } },
      { data: { toolId: 'meter-to-feet', language: 'de',
                title: 'Meter in Fuß umrechnen – Formel & Tabelle',
                tagline: 'Präzise Längen-Umrechnung in Sekunden — klient-seitig, ohne Tracking.' } },
      { data: { toolId: 'png-jpg-to-webp', language: 'de',
                title: 'PNG und JPG in WebP umwandeln – ohne Upload',
                tagline: 'Bilder direkt im Browser komprimieren — kein Server, kein Tracking.' } },
    ];
    return filter ? all.filter(filter) : all;
  }),
}));

describe('listToolsForLang', () => {
  it('returns all DE tools sorted alphabetically by title', async () => {
    const tools = await listToolsForLang('de');
    expect(tools.map((t) => t.toolId)).toEqual([
      'remove-background',      // „Hintergrund…"
      'meter-to-feet',          // „Meter…"
      'png-jpg-to-webp',        // „PNG…"
    ]);
  });

  it('returns empty array for unsupported language', async () => {
    const tools = await listToolsForLang('en');
    expect(tools).toEqual([]);
  });

  it('attaches href + iconRel to each entry', async () => {
    const tools = await listToolsForLang('de');
    const bgRemover = tools.find((t) => t.toolId === 'remove-background')!;
    expect(bgRemover.href).toBe('/de/hintergrund-entfernen');
    expect(bgRemover.iconRel).toBe('/icons/tools/remove-background.webp');
  });
});

describe('resolveRelatedTools (accepts localized slugs, not toolIds)', () => {
  it('resolves existing slugs in input-order (not alphabetical)', async () => {
    const tools = await resolveRelatedTools('de', ['webp-konverter', 'meter-zu-fuss']);
    expect(tools.map((t) => t.toolId)).toEqual(['png-jpg-to-webp', 'meter-to-feet']);
  });

  it('silently ignores forward-looking Phase-1 slugs', async () => {
    const tools = await resolveRelatedTools('de', ['bild-komprimieren', 'bild-groesse-aendern']);
    expect(tools).toEqual([]);
  });

  it('mixed-resolve: drops unresolvable, keeps resolvable', async () => {
    const tools = await resolveRelatedTools('de', [
      'bild-komprimieren',   // forward-looking
      'webp-konverter',      // resolves
      'jpg-zu-png',          // forward-looking
    ]);
    expect(tools.map((t) => t.toolId)).toEqual(['png-jpg-to-webp']);
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

Run: `npm test -- tests/lib/tools/list.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implementation schreiben**

```typescript
// src/lib/tools/list.ts
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getCollection } from 'astro:content';
import { getSlug, getToolId } from '../slug-map';
import type { Lang } from './types';

export type ToolListItem = {
  toolId: string;
  title: string;
  tagline: string;
  href: string;
  iconRel: string;
  hasIcon: boolean;
};

/**
 * Enumerates all content entries for a language, resolved to render-ready items.
 * Silently drops entries whose toolId has no slug-map registration for `lang`.
 * Sorted alphabetically by title using the language's locale.
 */
export async function listToolsForLang(lang: Lang): Promise<ToolListItem[]> {
  const entries = await getCollection('tools', (e: any) => e.data.language === lang);
  const projectRoot = process.cwd();

  return entries
    .map((entry: any): ToolListItem | null => {
      const slug = getSlug(entry.data.toolId, lang);
      if (!slug) return null;
      const iconRel = `/icons/tools/${entry.data.toolId}.webp`;
      return {
        toolId: entry.data.toolId,
        title: entry.data.title,
        tagline: entry.data.tagline,
        href: `/${lang}/${slug}`,
        iconRel,
        hasIcon: existsSync(resolve(projectRoot, 'public', iconRel.replace(/^\//, ''))),
      };
    })
    .filter((t: ToolListItem | null): t is ToolListItem => t !== null)
    .sort((a: ToolListItem, b: ToolListItem) => a.title.localeCompare(b.title, lang));
}

/**
 * Resolves an array of LOCALIZED SLUGS (not toolIds) to ToolListItems.
 * Forward-looking references (slugs without slug-map or content entry) are dropped silently.
 * Preserves input order — used by RelatedTools to respect content-author ordering.
 */
export async function resolveRelatedTools(
  lang: Lang,
  localizedSlugs: readonly string[],
): Promise<ToolListItem[]> {
  const all = await listToolsForLang(lang);
  const bySlugSuffix = new Map(all.map((t) => [t.href.split('/').pop()!, t]));
  const out: ToolListItem[] = [];
  for (const slug of localizedSlugs) {
    const hit = bySlugSuffix.get(slug);
    if (hit) out.push(hit);
  }
  return out;
}
```

- [ ] **Step 4: Run tests — verify they pass**

Run: `npm test -- tests/lib/tools/list.test.ts`
Expected: 6/6 PASS.

- [ ] **Step 5: Run full suite**

Run: `npm test`
Expected: alles grün, nur +6 neue Tests.

- [ ] **Step 6: Run typecheck**

Run: `npm run check`
Expected: 0/0/0.

- [ ] **Step 7: Commit**

```bash
git add src/lib/tools/list.ts tests/lib/tools/list.test.ts
git commit -m "feat(lib): add list.ts helper for tool enumeration + slug resolution"
```

---

## Task 3: FooterToolsList + Footer Mount + Tests

**Files:**
- Create: `src/components/FooterToolsList.astro`
- Modify: `src/components/Footer.astro` (replace `Kategorien`-section)
- Create: `tests/components/footer-tools-list.test.ts`

- [ ] **Step 1: Component schreiben**

```astro
---
// src/components/FooterToolsList.astro
import { listToolsForLang } from '../lib/tools/list';
import type { Lang } from '../lib/tools/types';

interface Props {
  lang: Lang;
}
const { lang } = Astro.props;

const CAP = 8;
const tools = await listToolsForLang(lang);
const visible = tools.slice(0, CAP);
const overflow = Math.max(0, tools.length - CAP);
---
<section>
  <h2>Werkzeuge</h2>
  <ul>
    {visible.map((t) => (
      <li><a href={t.href}>{t.title}</a></li>
    ))}
    {overflow > 0 && (
      <li class="overflow">
        {/* NBSP zwischen `+` und Zahl damit es nicht umbricht */}
        <a href={`/${lang}/`}>{`+\u00A0${overflow} weitere Werkzeuge →`}</a>
      </li>
    )}
  </ul>
</section>

<style>
  /* h2 muss hier wieder gesetzt werden — Astro scoped-styles in Footer.astro erreichen die h2 dieser Component nicht, da sie zu einem anderen Scope-Tree gehört. Werte = Visual-Parität zu Rechtliches/Meta-Headings (Footer.astro:50-54). */
  h2 {
    font-size: var(--font-size-small);
    font-weight: 600;
    color: var(--color-text);
    margin: 0 0 var(--space-3);
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    font-size: var(--font-size-small);
  }
  a {
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color var(--dur-fast) var(--ease-out);
  }
  a:hover,
  a:focus-visible {
    color: var(--color-text);
    text-decoration: underline;
    text-underline-offset: var(--underline-offset);
  }
  a:focus-visible {
    outline: 2px solid var(--color-text);
    outline-offset: 2px;
  }
  .overflow {
    margin-top: var(--space-2);
  }
  @media (prefers-reduced-motion: reduce) {
    a { transition: none; }
  }
</style>
```

- [ ] **Step 2: Footer.astro — Kategorien-Section durch Component ersetzen**

In `src/components/Footer.astro`:
- Import-Block: `import FooterToolsList from './FooterToolsList.astro';`
- Die erste `<section>` (mit `<h2>Kategorien</h2>` und den 3 `bald`-Stubs) wird durch `<FooterToolsList lang={lang} />` ersetzt.
- `Rechtliches` + `Meta` bleiben unverändert.
- Footer-CSS (`h2`, `ul`, `.stub`) wird nicht angefasst — `FooterToolsList` bringt eigene scoped Styles.

- [ ] **Step 3: Tests schreiben**

```typescript
// tests/components/footer-tools-list.test.ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import FooterToolsList from '../../src/components/FooterToolsList.astro';

describe('FooterToolsList', () => {
  it('renders one <a> per DE tool in alphabetical order', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FooterToolsList, { props: { lang: 'de' } });
    const links = html.match(/<a\s+href="[^"]+">/g) ?? [];
    expect(links.length).toBeGreaterThanOrEqual(3);
    // Alphabetical: Hintergrund < Meter < PNG/WebP
    const hrefs = Array.from(html.matchAll(/<a\s+href="([^"]+)">/g)).map((m) => m[1]);
    const idxBg = hrefs.indexOf('/de/hintergrund-entfernen');
    const idxMeter = hrefs.indexOf('/de/meter-zu-fuss');
    expect(idxBg).toBeGreaterThanOrEqual(0);
    expect(idxMeter).toBeGreaterThan(idxBg);
  });

  it('renders heading "Werkzeuge"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FooterToolsList, { props: { lang: 'de' } });
    expect(html).toMatch(/<h2>\s*Werkzeuge\s*<\/h2>/);
  });

  it('does NOT render overflow link when count <= 8', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FooterToolsList, { props: { lang: 'de' } });
    expect(html).not.toMatch(/weitere Werkzeuge/);
  });
});
```

- [ ] **Step 4: Run tests**

Run: `npm test -- tests/components/footer-tools-list.test.ts`
Expected: 3/3 PASS.

- [ ] **Step 5: Run full suite + typecheck + build**

Run: `npm test && npm run check && npm run build`
Expected: alles grün, +3 neue Tests, Build erzeugt erwartete Pages.

- [ ] **Step 6: Commit**

```bash
git add src/components/FooterToolsList.astro src/components/Footer.astro tests/components/footer-tools-list.test.ts
git commit -m "feat(footer): replace Kategorien stubs with live Werkzeuge list"
```

---

## Task 4: RelatedTools + [slug].astro Mount + Tests

**Files:**
- Create: `src/components/RelatedTools.astro`
- Modify: `src/pages/[lang]/[slug].astro` (mount nach `<article class="tool-article">`)
- Create: `tests/components/related-tools.test.ts`

- [ ] **Step 1: Component schreiben**

```astro
---
// src/components/RelatedTools.astro
import { resolveRelatedTools } from '../lib/tools/list';
import type { Lang } from '../lib/tools/types';

interface Props {
  lang: Lang;
  relatedSlugs: readonly string[];
}
const { lang, relatedSlugs } = Astro.props;
const tools = await resolveRelatedTools(lang, relatedSlugs);
---
{tools.length > 0 && (
  <section class="related-tools" aria-labelledby="related-heading">
    <h2 id="related-heading">Verwandte Tools</h2>
    <ul>
      {tools.map((t, i) => (
        <li style={`--index: ${i}`}>
          <a href={t.href}>
            {t.hasIcon && (
              <img
                src={t.iconRel}
                alt=""
                width="48"
                height="48"
                loading="lazy"
                decoding="async"
              />
            )}
            <div>
              <h3>{t.title}</h3>
              <p>{t.tagline}</p>
            </div>
          </a>
        </li>
      ))}
    </ul>
  </section>
)}

<script>
  // Plain-IO Fade-In-Stagger. Kein Import, ~30 Byte. Fallback: fehlt IO → .in-view sofort.
  const section = document.querySelector<HTMLElement>('.related-tools');
  if (section) {
    if (typeof IntersectionObserver === 'undefined') {
      section.classList.add('in-view');
    } else {
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            section.classList.add('in-view');
            io.disconnect();
            break;
          }
        }
      }, { rootMargin: '-40px 0px' });
      io.observe(section);
    }
  }
</script>

<style>
  .related-tools {
    max-width: 60rem;
    margin: var(--space-16) auto 0;
    padding: 0 var(--space-6);
  }
  .related-tools h2 {
    margin: 0 0 var(--space-6);
    letter-spacing: -0.01em;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
    gap: var(--space-4);
  }
  li {
    opacity: 0;
    transform: translateY(8px);
  }
  .related-tools.in-view li {
    opacity: 1;
    transform: none;
    transition:
      opacity var(--dur-med) var(--ease-out),
      transform var(--dur-med) var(--ease-out);
    transition-delay: calc(var(--index) * var(--stagger-step));
  }
  a {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4) var(--space-5);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
    color: var(--color-text);
    text-decoration: none;
    transition:
      border-color var(--dur-fast) var(--ease-out),
      background var(--dur-fast) var(--ease-out);
  }
  a:hover {
    border-color: var(--color-text-subtle);
    background: var(--color-bg);
  }
  a:focus-visible {
    outline: 2px solid var(--color-text);
    outline-offset: 2px;
  }
  img {
    width: var(--icon-size-md);
    height: var(--icon-size-md);
    object-fit: contain;
    flex: 0 0 auto;
  }
  :global([data-theme='dark']) .related-tools img {
    filter: invert(1);
  }
  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.35;
    letter-spacing: -0.005em;
  }
  p {
    margin: var(--space-1) 0 0;
    font-size: var(--font-size-small);
    line-height: 1.5;
    color: var(--color-text-muted);
  }

  @media (max-width: 40rem) {
    .related-tools {
      padding: 0 var(--space-4);
    }
    ul { grid-template-columns: 1fr; }
    .related-tools.in-view li { transition-delay: 0ms !important; }
  }

  @media (prefers-reduced-motion: reduce) {
    li { opacity: 1; transform: none; }
    .related-tools.in-view li {
      transition: none;
      transition-delay: 0ms;
    }
    a { transition: none; }
  }
</style>
```

- [ ] **Step 2: [slug].astro — RelatedTools mounten**

In `src/pages/[lang]/[slug].astro`:
- Import: `import RelatedTools from '../../components/RelatedTools.astro';`
- Nach `</article>` (nach dem schließenden Tag von `<article class="tool-article">`), noch innerhalb von `<div class="tool-page">`:

```astro
    </article>

    <RelatedTools lang={entry.data.language} relatedSlugs={entry.data.relatedTools} />
  </div>
</BaseLayout>
```

- [ ] **Step 3: Tests schreiben**

```typescript
// tests/components/related-tools.test.ts
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import RelatedTools from '../../src/components/RelatedTools.astro';

describe('RelatedTools', () => {
  it('renders nothing when all slugs are forward-looking', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(RelatedTools, {
      props: { lang: 'de', relatedSlugs: ['bild-komprimieren', 'jpg-zu-png'] },
    });
    expect(html).not.toMatch(/class="related-tools"/);
  });

  it('renders section + card when one slug resolves', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(RelatedTools, {
      props: { lang: 'de', relatedSlugs: ['webp-konverter'] },
    });
    expect(html).toMatch(/class="related-tools"/);
    expect(html).toMatch(/href="\/de\/webp-konverter"/);
  });

  it('renders heading "Verwandte Tools"', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(RelatedTools, {
      props: { lang: 'de', relatedSlugs: ['webp-konverter'] },
    });
    expect(html).toMatch(/Verwandte\s+Tools/);
  });

  it('preserves input order when multiple resolve', async () => {
    const c = await AstroContainer.create();
    const html = await c.renderToString(RelatedTools, {
      props: { lang: 'de', relatedSlugs: ['webp-konverter', 'hintergrund-entfernen'] },
    });
    const firstWebp = html.indexOf('/de/webp-konverter');
    const firstBg = html.indexOf('/de/hintergrund-entfernen');
    expect(firstWebp).toBeGreaterThan(-1);
    expect(firstBg).toBeGreaterThan(firstWebp);
  });
});
```

- [ ] **Step 4: Run tests**

Run: `npm test -- tests/components/related-tools.test.ts`
Expected: 4/4 PASS.

- [ ] **Step 5: Run full suite + typecheck + build**

Run: `npm test && npm run check && npm run build`
Expected: alles grün; Build verifiziert per visual inspection dass `dist/de/hintergrund-entfernen/index.html` die `related-tools`-Section hat und `dist/de/meter-zu-fuss/index.html` sie NICHT hat (→ Task 5 lockt das als Smoke-Assertion).

- [ ] **Step 6: Commit**

```bash
git add src/components/RelatedTools.astro src/pages/[lang]/[slug].astro tests/components/related-tools.test.ts
git commit -m "feat(tool-pages): mount RelatedTools below article when slugs resolve"
```

---

## Task 5: Smoke-Build-Tests Erweiterung

**Files:**
- Modify: `tests/smoke/build.test.ts`

- [ ] **Step 1: Neue Build-Assertions dazu**

Finde den existierenden `describe`-Block in `tests/smoke/build.test.ts` und ergänze innerhalb einen neuen Block:

```typescript
describe('Cross-Links — Footer + RelatedTools', () => {
  const root = process.cwd();

  it('Footer has Werkzeuge heading + ≥1 tool link on every page', () => {
    const homepage = readFileSync(join(root, 'dist', 'de', 'index.html'), 'utf8');
    expect(homepage).toMatch(/<h2>\s*Werkzeuge\s*<\/h2>/);
    expect(homepage).toMatch(/href="\/de\/[a-z0-9-]+"/);
  });

  it('/de/hintergrund-entfernen renders related-tools section with webp-konverter link', () => {
    const page = readFileSync(
      join(root, 'dist', 'de', 'hintergrund-entfernen', 'index.html'),
      'utf8',
    );
    expect(page).toMatch(/class="[^"]*related-tools[^"]*"/);
    expect(page).toMatch(/href="\/de\/webp-konverter"/);
  });

  it('/de/meter-zu-fuss has NO related-tools section (all refs forward-looking)', () => {
    const page = readFileSync(
      join(root, 'dist', 'de', 'meter-zu-fuss', 'index.html'),
      'utf8',
    );
    expect(page).not.toMatch(/class="[^"]*related-tools[^"]*"/);
  });

  it('/de/webp-konverter has NO related-tools section (all refs forward-looking)', () => {
    const page = readFileSync(
      join(root, 'dist', 'de', 'webp-konverter', 'index.html'),
      'utf8',
    );
    expect(page).not.toMatch(/class="[^"]*related-tools[^"]*"/);
  });
});
```

Imports (falls nicht schon drin): `readFileSync` aus `node:fs`, `join` aus `node:path`.

- [ ] **Step 2: Build zuerst, dann Tests**

Run: `npm run build && npm test -- tests/smoke/build.test.ts`
Expected: alle neu+alt Smoke-Tests grün.

- [ ] **Step 3: Full suite**

Run: `npm test && npm run check`
Expected: alles grün. Delta: +4 Smoke-Tests.

- [ ] **Step 4: Commit**

```bash
git add tests/smoke/build.test.ts
git commit -m "test(smoke): assert Footer + RelatedTools render matrix"
```

---

## Task 6: Rulebook-Updates

**Files:**
- Modify: `STYLE.md`
- Modify: `CONVENTIONS.md`

Session-Continuity: Regeln, die wir heute lebten, müssen in den Rulebooks auftauchen, sonst sind sie in der nächsten Session verloren.

- [ ] **Step 1: STYLE.md — §13 „Cross-Link-Muster"**

Am Ende von STYLE.md, nach dem letzten §, einen neuen § ergänzen (Numbering fortlaufend):

```markdown
## § 13 Cross-Link-Muster

**Footer-„Werkzeuge"-Section**
- Heading `Werkzeuge` (DE-Wort, matcht Homepage `<h2>Alle Werkzeuge</h2>`).
- Max 8 Tool-Links, dann Überlauf-Link `+ N weitere Werkzeuge →` zur Homepage.
- Plain-Text-Links, kein Icon. Hover/Focus: `color: var(--color-text)`, `text-decoration: underline`, `text-underline-offset: var(--underline-offset)`.
- Datenquelle: `src/lib/tools/list.ts` `listToolsForLang(lang)`.

**Verwandte-Tools-Block auf Tool-Seiten**
- Gemountet als Sibling von `<article class="tool-article">` innerhalb `.tool-page`.
- Max-Breite `60rem`, `margin-top: var(--space-16)`.
- Conditional-Render: leere Auflösung → keine Section (dokumentiert in Spec §4.3).
- Card-Layout: `auto 1fr`-Grid, Icon `var(--icon-size-md)` (48px), `border: 1px solid var(--color-border)`, `border-radius: var(--r-md)`.
- Motion: IntersectionObserver-Fade-In-Stagger, `var(--dur-med) var(--ease-out)`, Delay-Step `var(--stagger-step)` (60ms). `prefers-reduced-motion`: deaktiviert komplett.
- Dark-Theme: globales `[data-theme='dark'] .related-tools img { filter: invert(1); }` matcht Homepage-Konvention.
- Datenquelle: `src/lib/tools/list.ts` `resolveRelatedTools(lang, frontmatter.relatedTools)` — **Slugs**, nicht toolIds.
```

- [ ] **Step 2: CONVENTIONS.md — § Content-Collection-Enumeration**

Am Ende von CONVENTIONS.md einen neuen §-Block ergänzen:

```markdown
## § Content-Collection-Enumeration (Single-Source-of-Truth)

**Regel:** Jeder Code-Pfad, der Tool-Listen oder Tool-Resolutions bildet, muss [src/lib/tools/list.ts](src/lib/tools/list.ts) nutzen. Kein Copy-Paste des `getCollection → map → filter → sort`-Patterns in neue Pages.

**API:**
- `listToolsForLang(lang)` → alle Tools für eine Sprache, alphabetisch nach Title. Konsumenten: Footer, Homepage (post-MVP-Refactor).
- `resolveRelatedTools(lang, localizedSlugs)` → resolved eine Slug-Liste aus `frontmatter.relatedTools` auf Render-Items. Input-Order bleibt erhalten, Forward-References (nicht-existente Slugs) werden still gefiltert.

**Wichtig:** `frontmatter.relatedTools` enthält **lokalisierte URL-Slugs**, nicht `toolId`s. Das Schema erzwingt kebab-case, nicht die Domain.
```

- [ ] **Step 3: Verifikation der Rulebook-Updates per grep**

Run: `grep -c "Cross-Link-Muster" STYLE.md && grep -c "Content-Collection-Enumeration" CONVENTIONS.md`
Expected: `1` + `1`.

- [ ] **Step 4: Commit**

```bash
git add STYLE.md CONVENTIONS.md
git commit -m "docs(rulebooks): lock cross-link pattern + list.ts single-source-of-truth"
```

---

## Task 7: PROGRESS.md + Final Commit

**Files:**
- Modify: `PROGRESS.md`

- [ ] **Step 1: PROGRESS.md — neuer Session-Entry**

Am Kopf von PROGRESS.md:
- „Letztes Update" auf `2026-04-19 (Phase-1 Session 1, End)` setzen.
- „Aktuelle Phase" auf `Phase 1 — Skalierung & UX-Hebel` umstellen.
- „Current Session": `#1 (Phase 1) — Tool-Cross-Links ✅`.

Neuen Deliverables-Block unter der Phase-0-Tabelle (vor „Phase-Kickoff-Reminders"):

```markdown
## Phase 1 Fortschritt

| Session | Status | Deliverable |
|---------|--------|-------------|
| 1 — Tool-Cross-Links | ✅ done | Footer-„Werkzeuge"-Section + RelatedTools-Block + `list.ts`-Helper |

## Phase-1-Session-1 Deliverables

- **`src/lib/tools/list.ts`** (neu, ~55 LOC): Gemeinsamer Content-Collection-Enumerator mit `listToolsForLang` + `resolveRelatedTools`. Single-Source-of-Truth-Pattern, dokumentiert in CONVENTIONS.md §Content-Collection-Enumeration.
- **`src/components/FooterToolsList.astro`** (neu): Ersetzt die `Kategorien (bald)`-Stubs im Footer durch eine echte „Werkzeuge"-Section (aktuell 3 Tools, Cap 8, Überlauf-Link `+ N weitere →`). Plain-Text-Links, Tokens-only, `prefers-reduced-motion` respektiert.
- **`src/components/RelatedTools.astro`** (neu): Verwandte-Tools-Block am Fuß jeder Tool-Seite. Sibling nach `<article class="tool-article">`, `max-width: 60rem`, Fade-In-Stagger per IntersectionObserver (`var(--dur-med)` + `var(--stagger-step)` 60ms). Conditional-Wrap suppresst leere Sektionen — Phase-0-Reality: nur `/de/hintergrund-entfernen` resolved heute 1 Card (`webp-konverter`), `/de/meter-zu-fuss` + `/de/webp-konverter` rendern nichts weil ihre `relatedTools` auf Phase-1-Slugs zeigen.
- **Tokens**: +`--icon-size-md: 48px`, +`--stagger-step: 60ms`, +`--underline-offset: 2px` in [src/styles/tokens.css](src/styles/tokens.css). Pre-introduction statt Audit-Nachzug.
- **Rulebooks**: STYLE.md §13 „Cross-Link-Muster" (neu), CONVENTIONS.md §Content-Collection-Enumeration (neu).
- **Tests**: +~16 neue (258 → ~274). Aufteilung: tokens 3, list.ts 6, FooterToolsList 3, RelatedTools 4, Smoke-Build 4 (Render-Matrix: Footer global + Related auf BG-Remover + Anti-Render auf meter-zu-fuss/webp-konverter).
- **Gates**: 0/0/0 `astro check`, ~274/274 vitest, Build grün mit erwarteter Render-Matrix.

## Phase-1-Session-1 Carry-Over
- Homepage-Refactor auf `listToolsForLang` (Spec §8, optional post-MVP-Schritt): -17 Zeilen Inline-Code in `src/pages/[lang]/index.astro`, kein Verhaltens-Delta. Nicht in V1 um Smoke-Scope klein zu halten; Kandidat für nächste triviale Session.
```

Außerdem den existierenden „Next-Session-Plan"-Block aktualisieren (Phase-1-Session-1 abhaken, Phase-1-Session-2 benennen → Batch-1-DE-Converter).

- [ ] **Step 2: Final-Commit**

```bash
git add PROGRESS.md
git commit -m "$(cat <<'EOF'
docs(progress): Phase-1 Session 1 complete — tool cross-links

Footer-Werkzeuge-Section + RelatedTools-Block + list.ts helper live.
~274/274 vitest, 0/0/0 astro check, build grün.

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE, CONTENT

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Verification Gate (nach allen Tasks)

Nach Task 7 müssen folgende Zustände gleichzeitig gelten:

- [ ] `npm run check` — 0 errors, 0 warnings, 0 hints
- [ ] `npm test` — alle grün (~274 Tests)
- [ ] `npm run build` — 5 Pages gebaut, `dist/_headers` + `dist/_redirects` unverändert
- [ ] `dist/de/hintergrund-entfernen/index.html` enthält `class="related-tools"` + `href="/de/webp-konverter"`
- [ ] `dist/de/meter-zu-fuss/index.html` enthält NICHT `class="related-tools"`
- [ ] `dist/de/webp-konverter/index.html` enthält NICHT `class="related-tools"`
- [ ] `dist/de/index.html` enthält `<h2>Werkzeuge</h2>` + ≥1 Tool-Link
- [ ] Final code-review-Agent: approved
- [ ] `web-design-guidelines`-Audit: pass oder nur advisory-findings

Bei irgendeinem Fail: entsprechende Task nochmal aufmachen, nicht weitermachen.
