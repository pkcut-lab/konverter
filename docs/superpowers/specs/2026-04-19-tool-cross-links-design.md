# Tool-Cross-Links — Design Spec

**Status:** Draft v1 (2026-04-19, post-Phase-0)
**Scope:** Navigation/UX — keine neuen Tools.
**Spec-Author:** Claude (Opus 4.7)
**Brainstorming-Skill:** `superpowers:brainstorming` (gefolgt — Scope-Pivot von Alt-Queue-BG-Remover-Input, 3 Optionen abgewogen, A+B-Kombi gewählt)

---

## 1. Zweck und Kontext

Phase 0 ist abgeschlossen (11/11 Sessions, 258/258 Tests, drei live Prototypen). Die Navigation ist dünn: Header hat nur Brand + Pagefind-Search + Lang + Theme, der Footer trägt drei `(bald)`-Stubs, die Homepage listet alle Tools — aber **nur die Homepage**. Wer auf `/de/meter-zu-fuss` landet, kommt nur über Brand-Back-Link oder Search zurück zu anderen Tools.

Das hat zwei Konsequenzen:

1. **Nutzer-Dwell-Time** niedrig — kein Cross-Sell, kein „oh, das gibt's ja auch". Phase 1 will Traffic auf ~50 Tools aufbauen, interne Verlinkung hebt SEO + Nutzer-Verweildauer (Spec §2.4 B9 AEO/Voice-Search: interne Link-Equity).
2. **Entwickler-Testing** ist umständlich — jeder Smoke-Test muss über Homepage oder direkte URL gehen.

Scope dieser Spec: **zwei Cross-Link-Mechanismen**, die bestehende Infrastruktur wiederverwenden und null neue Datenquellen anlegen.

---

## 2. User-Stories

> **Als** Webseiten-Besucher auf einer Tool-Seite
> **möchte ich** am Ende der Seite verwandte Tools vorgeschlagen bekommen,
> **damit** ich ohne Umweg über die Homepage das nächste relevante Werkzeug finde.

> **Als** Besucher einer beliebigen Seite (Tool, Styleguide, Homepage, 404)
> **möchte ich** im Footer eine kompakte Tool-Liste sehen,
> **damit** ich von überall schnell auf andere Tools springen kann.

---

## 3. MVP-Scope (V1)

### Drin

- **Footer-Section „Werkzeuge"** — ersetzt **nur** die `Kategorien`-Section in [Footer.astro](../../../src/components/Footer.astro) (die `Rechtliches`-Stubs und die funktionale `Meta`-Section bleiben unberührt). Heading-Text „Werkzeuge" matcht die Homepage-Konvention (`<h2>Alle Werkzeuge</h2>` in [index.astro](../../../src/pages/%5Blang%5D/index.astro)) — DE-Site bevorzugt das deutsche Wort über den Anglizismus „Tools".
  - Liste maximal 8 Tool-Titel (Content-Collection-driven, alphabetisch sortiert per `title`).
  - Überlauf-Link `+ N weitere Werkzeuge →` nach `/${lang}/`, sichtbar ab Tool-Count > 8. Bei aktuellem Count (3) unsichtbar.
  - Plain-Text-Links, kein Icon. Identisches Typo-Idiom wie existierende Footer-Sections.

- **Related-Tools-Block** am Fuß jeder Tool-Seite ([src/pages/[lang]/[slug].astro](../../../src/pages/%5Blang%5D/%5Bslug%5D.astro)) — gemountet **nach** `<Content />` (dem gerenderten Markdown-Prosa-Body) und vor dem per `BaseLayout` injizierten Footer.
  - Quelle: existierendes `frontmatter.relatedTools: string[]`-Feld. **Wichtig:** Die Werte sind **lokalisierte Slugs** (kebab-case der Ziel-URL im selben `lang`), nicht toolIds — verifiziert in allen drei Phase-0-Content-Files (`hintergrund-entfernen/de.md` → `webp-konverter`, `bild-komprimieren`, `bild-groesse-aendern`). Schema (`min(3).max(5)`) erzwingt Autoren-Disziplin, nicht Render-Garantie — viele Phase-0-Referenzen sind forward-looking auf Phase-1-Tools, die noch nicht existieren.
  - Card-Layout wie Homepage (`.tool-card`-Idiom), aber schlanker: 48×48-Icon statt 56×56, keine Header-Zählung, Grid `auto-fill, minmax(16rem, 1fr)`.
  - IntersectionObserver-Fade-In-Stagger, `var(--dur-med) var(--ease-out)`, `prefers-reduced-motion` deaktiviert Stagger komplett.

- **Shared Helper** [src/lib/tools/list.ts](../../../src/lib/tools/list.ts) (neu — Dateiname vermeidet `tool-list.ts`-Stutter, matcht Nachbarn `types.ts`/`compute.ts`).
  - `listToolsForLang(lang): Array<ToolListItem>` — Content-Collection + slug-map + Icon-Existence-Check, sortiert nach `title.localeCompare(lang)`.
  - `resolveRelatedTools(lang, localizedSlugs[]): Array<ToolListItem>` — nimmt **Slugs** (nicht toolIds), nutzt `getToolId(lang, slug)` aus [slug-map.ts](../../../src/lib/slug-map.ts) um zum toolId zu kommen, fetcht dann das Content-Collection-Entry für `(toolId, lang)`. Preserves Input-Order. Ignoriert still jeden Slug, zu dem sich kein registrierter toolId + Content-Entry in der aktuellen Sprache auflöst (Forward-References auf Phase-1-Tools = stille No-Ops).
  - Konsumenten: Footer, Homepage (refactor-kandidat — siehe §8), RelatedTools-Komponente.

### Draußen (Non-Goals)

- **`popular:`-Frontmatter-Flag** — YAGNI. Ohne Analytics-Daten ist „beliebt" subjektiv. Phase-2-Trigger: wenn AdSense-Traffic-Daten vorliegen, wird `popular:` als optionales Frontmatter-Feld eingeführt und überschreibt die alphabetische Sortierung im Footer. Implementierung ist dann ein 10-Zeilen-Diff.
- **Header-Tool-Chips** — verworfen (skaliert nicht über ~6 Tools, horizontales Scrollen-Antipattern bei 20+).
- **Breadcrumbs** — verworfen. Brand-Link im Header deckt „zurück zur Übersicht" ab. Breadcrumbs erst sinnvoll, wenn Tool-Kategorien (Phase 2) existieren.
- **Restliche Footer-Sections anfassen** — `Rechtliches` behält seine Phase-2-Stubs (Impressum, Datenschutz), `Meta` ist bereits funktional (Sprache, Copyright). Fokus hier nur auf die `Kategorien`-Section, die zur Werkzeuge-Liste wird.
- **JSON-LD `isRelatedTo`** — verworfen für V1. `SoftwareApplication`-Schema hat `isRelatedTo` nur in sehr lockerer Semantik; `schema.org/related`-Referenzen werden von Google aktuell nicht als Ranking-Signal genutzt. Wenn Phase-1-Audit (nach Batch-1) zeigt, dass Crawler-interne-Link-Struktur hakt, kommt es rein.

---

## 4. Komponenten & Datenfluss

### 4.1 `listToolsForLang` (Single Source of Truth)

```
Content-Collection (astro:content)
       │
       ▼
filter by language === lang
       │
       ▼
map: toolId → { slug via slug-map, title, tagline, iconPath, hasIcon }
       │
       ▼
filter: slug != null (guards gegen fehlende slug-map-Einträge)
       │
       ▼
sort: title.localeCompare(locale)
       │
       ▼
Array<ToolListItem>
```

Der existierende Homepage-Enumerator ([index.astro:19-38](../../../src/pages/%5Blang%5D/index.astro)) wird **verbatim ausgelagert** — keine Verhaltens-Änderung der Homepage, aber drei Konsumenten können jetzt dieselbe Funktion nutzen statt der Copy-Paste-Gefahr.

### 4.2 `FooterToolsList.astro`

```astro
---
import { listToolsForLang } from '../lib/tools/list';
const { lang } = Astro.props;
const tools = await listToolsForLang(lang);
const CAP = 8;
const visible = tools.slice(0, CAP);
const overflow = Math.max(0, tools.length - CAP);
---
<ul>
  {visible.map((t) => <li><a href={t.href}>{t.title}</a></li>)}
  {overflow > 0 && (
    <li class="overflow">
      <a href={`/${lang}/`}>+ {overflow} weitere Werkzeuge →</a>
    </li>
  )}
</ul>
```

Wird in [Footer.astro](../../../src/components/Footer.astro) als drittes Section-Element gemountet; die existierende `section` mit Stubs wird ersetzt. Styles werden in den scoped `<style>`-Block des Footers ergänzt — kein neues CSS-File.

### 4.3 `RelatedTools.astro`

Wird in [[slug].astro](../../../src/pages/%5Blang%5D/%5Bslug%5D.astro) gemountet: **Sibling** der `<article class="tool-article">` **innerhalb** der `.tool-page`-Flex-Column, **nach** `<article>` und vor dem per `BaseLayout` injizierten Footer. Nicht als letztes Child *in* `.tool-article` — die Sektion bekommt ihre eigene Max-Breite (`60rem`, matcht Homepage-Tools-Grid), während `.tool-article` bei `42rem` bleibt. FAQ-Hinweis: wird aktuell nicht als HTML gerendert, fließt nur per `buildToolJsonLd` in JSON-LD, also ist `<Content />` der letzte sichtbare Prosa-Block.

```astro
---
import { resolveRelatedTools } from '../lib/tools/list';
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
            {t.hasIcon && <img src={t.iconRel} alt="" width="48" height="48" loading="lazy" />}
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
```

Conditional-Wrap: kein leerer Block, wenn Schema-Regel (`min(3)`) ausnahmsweise verletzt ist (defense in depth).

---

## 5. Visual Design

Skill-gefiltertes Detail ([minimalist-ui](../../../.claude/skills) + [frontend-design](../../../.claude/skills) + Hard-Caps aus [CLAUDE.md §5](../../../CLAUDE.md)):

### 5.1 Footer-Tools-Section

- **H2** identisch zu Peer-Sections: `font-size: var(--font-size-small)`, `font-weight: 600`, `color: var(--color-text)`, `margin: 0 0 var(--space-3)`.
- **`<ul>`** erbt das bereits im Footer definierte `gap: var(--space-2)` + `font-size-small`.
- **`<a>`**: `color: var(--color-text-muted)`, `text-decoration: none`. Hover/Focus: `color: var(--color-text)`, `text-decoration: underline`, `text-underline-offset: 2px`. Transition: `color var(--dur-fast) var(--ease-out)`.
- **Overflow-Link** identische Styles wie normale Links; Pfeil-Glyph `→` als Text (kein SVG), Leerzeichen davor ist NBSP (U+00A0) damit `+ 12` und `weitere Werkzeuge →` nicht umbrechen.
- **Mobile**: erbt `grid-template-columns: 1fr` aus existierendem Footer-Mobile-Breakpoint; kein zusätzliches CSS.

### 5.2 Related-Tools-Block

- **Page-Abstand + Breite**: `max-width: 60rem`, `margin: var(--space-16) auto 0` (setzt sichtbaren Abstand nach der Prosa; Footer-Offset kommt per BaseLayout). Die Card-Grid hat drei 16rem-min-width-Cards + Gaps → braucht >50rem, deshalb breiter als die Article-Max (42rem).
- **H2**: `font-size: var(--font-size-h3)`, `letter-spacing: -0.01em`, `margin: 0 0 var(--space-6)`. Kein Border-Bottom unter dem Heading (die Homepage hat eins, weil dort mehr Tools folgen — hier sind es max 5, schlanker).
- **Grid**: `grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr))`, `gap: var(--space-4)`.
- **Card** (reuse Homepage-`.tool-card`-Idiom):
  - `border: 1px solid var(--color-border)`, `border-radius: var(--r-md)`, `background: var(--color-surface)`.
  - Padding: `var(--space-4) var(--space-5)` (enger als Homepage `var(--space-5) var(--space-6)` — sekundärer Block, weniger visual weight).
  - `grid-template-columns: auto 1fr` (kein Pfeil — Related-Karten zeigen nur Inhalt, kein Call-to-Action-Marker).
  - Icon: 48×48 (Homepage: 56), `object-fit: contain`, Dark-Theme-`filter: invert(1)` per bestehender Global-Rule.
  - Title + Tagline identisch zu Homepage-Idiom.
- **Hover**: `border-color: var(--color-text-subtle)`, `background: var(--color-bg)`, Transition `var(--dur-fast) var(--ease-out)`. Kein `translateX`-Arrow (kein Arrow da).
- **Fade-In-Stagger**: IntersectionObserver triggert `.in-view`-Klasse auf `<ul>`. CSS:
  ```css
  .related-tools li { opacity: 0; transform: translateY(8px); }
  .related-tools.in-view li {
    opacity: 1;
    transform: none;
    transition:
      opacity var(--dur-med) var(--ease-out),
      transform var(--dur-med) var(--ease-out);
    transition-delay: calc(var(--index) * 60ms);
  }
  @media (prefers-reduced-motion: reduce) {
    .related-tools li { opacity: 1; transform: none; transition: none; }
  }
  ```
- **Mobile** (< 40rem): Grid fällt auf `1fr`, Stagger-Delays werden per `transition-delay: 0 !important` in Mobile-Media-Query deaktiviert (Single-Column macht Stagger wie Scrolling wirken).

### 5.3 Token-Pre-Introduction (proaktiv, nicht nachgezogen)

Statt auf den `web-design-guidelines`-Audit zu warten, werden die neu entstehenden visuellen Konstanten **vor** Implementation als Tokens in [src/styles/tokens.css](../../../src/styles/tokens.css) eingeführt (matcht Karpathy-Prinzip „Think Before Coding"):

- `--icon-size-md: 48px` (Related-Tools + zukünftige 48er-Icon-Verwendungen)
- `--stagger-step: 60ms` (Stagger-Delay-Einheit für IntersectionObserver-Fade-Ins, auch homepage-seitig verfügbar)
- `--underline-offset: 2px` (text-underline-offset für Footer-Link-Hover)

Homepage behält `56px` inline (`--icon-size-lg` wäre voreilig bei einem einzigen Konsumenten — YAGNI). Der bereits existierende `--shadow-1`, die `--space-*`-Scale und `--r-md`/`--dur-*`/`--ease-out` werden re-used, nicht erweitert.

---

## 6. Testing

### 6.1 Unit / Smoke (vitest)

- [tests/lib/tools/list.test.ts](../../../tests/lib/tools/list.test.ts) — neu:
  - `listToolsForLang('de')` liefert alle 3 DE-Tools in alphabetischer Reihenfolge (`Hintergrund…` vor `Meter…` vor `WebP…`).
  - `listToolsForLang('en')` liefert leeres Array (heute — keine EN-Content-Files).
  - `resolveRelatedTools('de', ['webp-konverter', 'meter-zu-fuss'])` liefert 2 resolvierte Items in **Input-Order** (nicht alphabetisch).
  - `resolveRelatedTools('de', ['bild-komprimieren'])` liefert leeres Array (forward-looking Phase-1-Slug, kein Content-Entry heute).
  - `resolveRelatedTools` nimmt **Slugs**, nicht toolIds — dokumentiert im Test-Namen explizit.
- [tests/components/footer.test.ts](../../../tests/components/footer.test.ts) — neu:
  - Renders `<li>` pro Tool (aktuell 3).
  - Overflow-Link **nicht** sichtbar bei count ≤ 8.
  - Links haben korrekte `href` (`/de/<slug>`).
- [tests/components/related-tools.test.ts](../../../tests/components/related-tools.test.ts) — neu:
  - Rendert 3-5 Cards bei valider Input-Liste.
  - Rendert nichts bei leerer Input-Liste (`section` fehlt komplett).
  - Card enthält Title, Tagline, Icon-Img (wenn hasIcon).
- [tests/smoke/build.test.ts](../../../tests/smoke/build.test.ts) — erweitert (Realität-gechecked: heute resolved nur `webp-konverter` aus `hintergrund-entfernen/de.md`, der Rest sind Forward-References auf Phase-1-Tools):
  - Assert: `dist/de/hintergrund-entfernen/index.html` enthält `<section class="related-tools">` mit mindestens einem descendant `<a>` (der `webp-konverter`-Ref resolved). Keine BEM-Klasse auf dem Link hardgecoded — Test matcht flexibel auf die Sektion + einen `href`-Link.
  - Assert: `dist/de/meter-zu-fuss/index.html` und `dist/de/webp-konverter/index.html` enthalten **kein** `class="related-tools"`-Root (alle Refs forward-looking, `resolveRelatedTools` liefert `[]`, Conditional-Wrap suppresst Section). Dieser Anti-Render-Check dokumentiert die Conditional-Wrap-Regel als Testinvariante.
  - Assert: Global-Footer-Markup enthält `<h2>Werkzeuge</h2>` und mindestens einen Link mit Pattern `/de/<kebab-slug>` (kein harter Slug-Pin — überlebt neue Tools die alphabetisch vor den heutigen landen).

**Ziel-Delta:** +10–12 Tests (258 → ~270).

### 6.2 Gates

- `npm run check`: 0/0/0
- `npm test`: alle grün
- `npm run build`: 5 Seiten, korrekter Sitemap
- `web-design-guidelines`-Audit-Pass nach Fertigstellung

---

## 7. Performance & Accessibility

- **Render-Kosten**: `listToolsForLang` ist build-time (Astro SSG). Null Runtime-Overhead.
- **Bundle-Impact**: Null JS für Footer. RelatedTools-IntersectionObserver ist ein Inline-`<script>` (~40 Bytes, kein Import).
- **A11y**:
  - Footer-Section hat implizites `<section>`, `<h2>` wie Peers.
  - Related-Tools-Section: `aria-labelledby="related-heading"`.
  - Alle Links sind „echte" `<a href>`, kein JS-Click-Handler.
  - Focus-Ring: `outline: 2px solid var(--color-text)` (Homepage-Konvention).
  - Icon-`<img alt="">` (dekorativ, Title liefert Bedeutung).
- **SEO**: Zusätzliche interne Links stärken Crawl-Budget-Verteilung. Anchor-Text = Tool-Title = Primary-Keyword. Kein `nofollow`.

---

## 8. Migration / Konsolidierung (Optional, post-MVP)

Die Homepage ([[lang]/index.astro:20-38](../../../src/pages/%5Blang%5D/index.astro)) enthält heute den Content-Collection-Enumerator inline. Nach Einführung von `listToolsForLang` ist dieser Inline-Code **deckungsgleich** mit dem Helper.

**Vorschlag:** Homepage refactort auf `listToolsForLang(lang)`, dropped den Inline-Code. Netto-Wirkung: -17 Zeilen, single source of truth.

**Separater Schritt nach V1** — nicht Teil dieser Spec, damit Tests und Smoke-Pfad klein bleiben. Fällt als Karpathy-Surgical-Change im Anschluss.

---

## 9. Abhängigkeiten / Risiken

| Risiko | Mitigation |
|---|---|
| IntersectionObserver auf Safari-<14.5 nicht verfügbar | Graceful fallback: IO-fehlend → `li`s bleiben sichtbar ohne Animation (CSS default `opacity: 1` ohne `.in-view`-Klasse? → JS-Fallback: `.in-view` direkt initial setzen, wenn `!('IntersectionObserver' in window)`). |
| Reduced-Motion-User sieht Stagger | CSS-Override zwingt `opacity: 1; transform: none; transition: none` (siehe §5.2). Getestet per `matchMedia('(prefers-reduced-motion: reduce)')` in vitest. |
| Footer-Overflow-Link-Text ist DE-hardcoded | Phase-3-Trigger: per-lang-String-Map. Für V1 okay — nur DE aktiv. |
| `relatedTools` verweist auf Slug ohne Slug-Map-Eintrag | `resolveRelatedTools` filtert still raus (Forward-References auf Phase-1-Tools sind erwartetes Verhalten). Build-time-Lint könnte in Phase 2 harten Fehler werfen; heute zu viel für V1. |

---

## 10. Deliverable-Liste

- [ ] `src/lib/tools/list.ts` — `listToolsForLang` + `resolveRelatedTools` + `ToolListItem`-Type
- [ ] `src/components/FooterToolsList.astro` — Footer-Section (List + Overflow-Link)
- [ ] `src/components/RelatedTools.astro` — Tool-Seiten-Block (Grid + Fade-In)
- [ ] [src/components/Footer.astro](../../../src/components/Footer.astro) — ersetze Kategorien-Section durch FooterToolsList
- [ ] [src/pages/[lang]/[slug].astro](../../../src/pages/%5Blang%5D/%5Bslug%5D.astro) — mount `<RelatedTools>` nach `<Content>`
- [ ] Tests (4 Files, ~12 neue Tests)
- [ ] `STYLE.md` §-Update: „Cross-Link-Muster" mit Footer-Tools + Related-Tools-Karten
- [ ] `CONVENTIONS.md` §-Update: `src/lib/tools/list.ts` als Single-Source-of-Truth für Content-Collection-Enumeration
- [ ] `web-design-guidelines`-Audit-Pass auf die drei neuen Files
- [ ] `PROGRESS.md` — Phase-1-Session-1-Entry (erster Phase-1-Commit post-Foundation)

---

## 11. Phase-1-Zuordnung

Das ist die **erste** Phase-1-Session. Cross-Links sind eine Voraussetzung für Batch-1-Tool-Rollout: wenn wir 20 Tools ausrollen, ohne dass sie sich gegenseitig verlinken, hat jedes Tool eine isolierte SEO-Insel. Cross-Links machen das Volumen wertvoller.

**Re-Evaluation-Trigger:** Nach Phase-2-Analytics-Launch. Wenn Tool-Impression-Daten zeigen, dass >80 % der Sessions nur eine Tool-Seite sehen, Footer-Tools-Visibility erhöhen (z.B. per Sidebar auf Desktop). Heute kein Signal → kein Action.
