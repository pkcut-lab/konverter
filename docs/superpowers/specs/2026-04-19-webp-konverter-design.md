# WebP Konverter — Prototype Design (Session 7)

**Status:** Approved by user (brainstorming round, 2026-04-19) — pending spec-review-loop + final user review.
**Parent-Spec:** [`2026-04-17-konverter-webseite-design.md`](2026-04-17-konverter-webseite-design.md) §14.1
**Session:** Phase 0 / Session 7
**Tool-Typ:** `file-tool` (etabliert das `FileTool.svelte`-Template analog zum `Converter.svelte`-Template aus Session 5/6)

---

## 1. Scope-Lock (MVP)

Diese Session liefert **das Minimum, das das FileTool-Template valide trägt** — nicht die vollständige Feature-Liste aus §14.1 der Parent-Spec.

**In Scope:**
- Single-File-Drop (PNG oder JPG)
- Quality-Slider (0–100, Default 85)
- Konvertierung via Canvas-API → WebP
- Single-Download via `<a download>`
- Inline-Pattern: eine Box, Inhalt morpht zwischen `idle` / `converting` / `done` / `error`
- File-Size-Cap 10 MB
- Inline-Errors innerhalb der Box (kein Toast, kein Modal)

**Explizit aus dem MVP gestrichen** (verschoben auf eigene Sessions/Phasen, nach User-Review des Templates):
- Multi-File-Drop
- ZIP-Batch-Download (→ `jszip`-Dep nicht in Session 7)
- Resize-Optionen
- Aspect-Ratio-Lock
- Strip-Metadata-Checkbox
- Before/After-Preview-Thumbnails
- Web-Worker / OffscreenCanvas in dediziertem Worker
- Recraft-Icon (kommt mit Phase-1-Icon-Batch)

**Begründung des Cuts:** Session-Ziel ist Template-Validierung. Surgical-Changes-Prinzip (CLAUDE.md §3) und 5h-Session-Box (Memory: `user_claude_code_usage`) erfordern engen Scope. Nach User-Review werden die geparkten Features in eigenen Branches/Sessions ergänzt.

---

## 2. Architektur

**Tool-Identität:**
- `tool-id: png-jpg-to-webp`
- `slug DE: webp-konverter`
- `categoryId: bilder` (neu — bisher existiert nur `laengen`). Hinweis für die Planning-Phase: es gibt **keine zentrale Category-Registry** in Phase 0 — `categoryId` ist ein freier String, validiert nur via `z.string().min(1)`. Kein Code-Change nötig, nur das String-Literal im Tool-Config.

**Tech-Choices:**
- Encoding: Canvas `OffscreenCanvas.convertToBlob({ type: 'image/webp', quality })` im Main-Thread.
- Decoding: `createImageBitmap(blob)` (baseline-supported, schneller als `<img>.onload`).
- Download: `URL.createObjectURL(blob)` + `<a download>`. URL wird beim Reset/Unmount via `URL.revokeObjectURL` freigegeben.
- File-I/O: `File.arrayBuffer()` (Promise-API, kein FileReader-Callback-Spaghetti).

**Begründung Main-Thread:** Für Bilder ≤10 MB blockt das Encoding den Main-Thread ~100–500 ms — akzeptabel mit klarer `converting`-Anzeige. Worker-Setup (OffscreenCanvas in dediziertem Worker, postMessage, Transfer-of-ArrayBuffer) ist Komplexität, die erst mit Multi-File-Batch oder >10 MB lohnt.

**Browser-Compat-Baseline:** Chrome 99 / Safari 16.4 / Firefox 105 (alle ≥2022). `OffscreenCanvas` + `convertToBlob` sind die kritischen APIs. Kein Polyfill, kein Fallback in MVP. Pre-flight-Check: bei `'OffscreenCanvas' in window === false` → Error-State mit Message "Browser zu alt".

**Schema-Fit:** Das existierende `FileToolConfig`-Schema in [`src/lib/tools/schemas.ts:87`](../../../src/lib/tools/schemas.ts) passt unverändert:
```ts
type FileToolConfig = {
  type: 'file-tool';
  accept: string[];
  maxSizeMb: number;
  process: (input: Uint8Array, config?: Record<string, unknown>) => Uint8Array | Promise<Uint8Array>;
  // ...
};
```
Das `Uint8Array → Uint8Array`-Contract ist deliberately Lowest-Common-Denominator für alle FileTools (Bild, PDF, ZIP, Audio). WebP-spezifische Adaption (Bytes → ImageBitmap → Canvas → Bytes) lebt im pure-function-Modul, nicht im Schema.

---

## 3. Komponenten

### 3.1 `src/components/tools/FileTool.svelte` *(neu — Template)*

State-Machine:
```
idle ──drop/select──> converting ──ok──> done ──reset──> idle
                          │              │
                          └──fail──> error ──reset/drop──> idle
```

Props: `{ config: FileToolConfig }`.

Reactivity (Svelte-5-Runes — siehe CONVENTIONS pattern aus Converter):
- `let state = $state<FileState>('idle')`
- `let file = $state<File | null>(null)`
- `let inputBytes = $state<Uint8Array | null>(null)` — gecacht für Quality-Re-Run
- `let outputBlob = $state<Blob | null>(null)`
- `let outputUrl = $state<string | null>(null)`
- `let quality = $state<number>(85)`
- `let errorMessage = $state<string>('')`

UI-Layout (eine `<div class="filetool">`-Box, Inhalt morpht):
- **Idle:** zentriertes Inline-SVG-Icon (Upload-Pfeil, 24×24, currentColor), Headline "PNG oder JPG hier ablegen", Sublabel "oder klicken zum Auswählen". Box ist klickbar (`<input type="file" hidden>` darüber gelegt).
- **Converting:** Mono-Text "Konvertiert …" + Filename. Keine Spinner-Animation (refined-minimalism, das Wort genügt). `aria-live="polite"`.
- **Done:** Filename als Mono-Subtext, zwei Stat-Zeilen (`Original 3,21 KB` / `WebP 1,08 KB · −66 %`), Download-Button (Style identisch zur Converter-Copy-Pill). Reset-Pill `× neue Datei` oben rechts in der Box.
- **Error:** Inline-Error-Message in Mono-Subtext-Stil. Drop-Aufforderung darunter sichtbar (User kann sofort neu droppen, kein Reset-Klick nötig).

Quality-Slider: außerhalb der Box, analog Quick-Value-Chips beim Converter (User-Setting, nicht Konvertierungs-State). Slider-Value rechts in Mono-Tabular-Nums.

Quality-Re-Convert: ändert sich `quality` während `state === 'done'`, läuft `process(inputBytes, { quality })` erneut auf den gecachten Bytes (kein File-Re-Read).

Accessibility:
- Drop-Zone hat `role="button"`, `tabindex="0"`, Keyboard-Activation (Enter/Space) öffnet File-Picker.
- `data-testid` an allen interaktiven Elementen analog Converter.
- `prefers-reduced-motion` respektieren (gilt für Morph-Transitions).
- `:focus-visible` 2px Outline analog Converter.

### 3.2 `src/lib/tools/png-jpg-to-webp.ts` *(neu — Tool-Config)*

```ts
import type { FileToolConfig } from './schemas';
import { processWebp } from './process-webp';

export const pngJpgToWebp: FileToolConfig = {
  id: 'png-jpg-to-webp',
  type: 'file-tool',
  categoryId: 'bilder',
  iconPrompt: '...', // Pencil-Sketch, analog meter-zu-fuss-Pattern
  accept: ['image/png', 'image/jpeg'],
  maxSizeMb: 10,
  process: (input, config) => processWebp(input, {
    quality: typeof config?.quality === 'number' ? config.quality : 85,
  }),
};
```

### 3.3 `src/lib/tools/process-webp.ts` *(neu — Pure-Function-Modul)*

Trennt Encoding-Logik von Komponente. Direkt unit-testbar ohne DOM-Setup.

```ts
export type ProcessWebpConfig = { quality: number };

export async function processWebp(
  input: Uint8Array,
  config: ProcessWebpConfig,
): Promise<Uint8Array> {
  const blob = new Blob([input]);
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas-context-unavailable');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const out = await canvas.convertToBlob({
    type: 'image/webp',
    quality: clamp01(config.quality / 100),
  });
  return new Uint8Array(await out.arrayBuffer());
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}
```

### 3.4 `src/lib/tool-registry.ts` *(edit)*

Ein Eintrag ergänzt:
```ts
import { pngJpgToWebp } from './tools/png-jpg-to-webp';

export const toolRegistry: Record<string, ToolConfig> = {
  'meter-to-feet': meterZuFuss,
  'png-jpg-to-webp': pngJpgToWebp,
};
```

### 3.5 `src/lib/slug-map.ts` *(edit)*

Ein Eintrag ergänzt:
```ts
'png-jpg-to-webp': { de: 'webp-konverter' },
```

### 3.6 `src/pages/[lang]/[slug].astro` *(refactor)*

Ersetzt die `if (config.type !== 'converter') throw` Single-Type-Wache durch eine Component-Map:

```astro
---
import Converter from '../../components/tools/Converter.svelte';
import FileTool from '../../components/tools/FileTool.svelte';

const componentMap = {
  converter: Converter,
  'file-tool': FileTool,
} as const;

const ToolComponent = componentMap[config.type as keyof typeof componentMap];

if (!ToolComponent) {
  throw new Error(
    `No component registered for tool type="${config.type}". ` +
      `Add an entry to componentMap in [slug].astro.`,
  );
}
---
<ToolComponent config={config} client:load />
```

Begründung: bei 9 Tool-Typen wächst sonst eine `if/else if`-Kette. Die Map ist O(1) Lookup, fail-loud bei fehlendem Mapping, sauber erweiterbar.

### 3.7 `src/content/tools/png-jpg-to-webp/de.md` *(neu — SEO-Content)*

Frontmatter analog `meter-zu-fuss/de.md` (`toolId: png-jpg-to-webp`, `language: de`, `title`, `metaDescription`, `tagline`, `intro`, `howToUse[]`).
Body ≥300 Wörter (Non-Negotiable #8): "Was ist WebP?" / "Warum PNG/JPG → WebP?" / "Wie funktioniert dieses Tool?" / "Datenschutz" (100% client-side hervorheben) / "Häufige Fragen".

---

## 4. Data Flow

**Happy Path:**
1. User dropt File ODER klickt Drop-Zone (verstecktes `<input type="file" accept="image/png,image/jpeg">`).
2. Validate: `file.type ∈ accept`, `file.size ≤ maxSizeMb * 1024 * 1024`.
3. `state: idle → converting`.
4. `inputBytes = new Uint8Array(await file.arrayBuffer())`.
5. `outputBytes = await config.process(inputBytes, { quality })`.
6. `outputBlob = new Blob([outputBytes], { type: 'image/webp' })`.
7. `outputUrl = URL.createObjectURL(outputBlob)`.
8. Download-Filename berechnet: `file.name.replace(/\.(png|jpe?g)$/i, '.webp')`.
9. `state: converting → done`. Stats berechnet aus `file.size` und `outputBytes.byteLength`.
10. User klickt Download → Browser-Native-Save-Dialog.

**Reset-Pfad:** `× neue Datei`-Pill → `URL.revokeObjectURL(outputUrl)` → alle Refs `null` → `state: idle`.

**Quality-Re-Run im Done-State:** Slider-Change während `state === 'done'` → `state: converting → done` (mit gecachten `inputBytes`, kein File-Re-Read). Output-URL wird vor neuer URL revoked.

**Error-Pfade (alle → `state: error`, Box morpht in Error-Layout):**

| Trigger | Inline-Message |
|---|---|
| Wrong format (`.gif`, `.pdf`, …) gedropt | "Nur PNG und JPG werden unterstützt." |
| Oversize (`> 10 MB`) | "Datei zu groß. Maximum: 10 MB." |
| `createImageBitmap` rejected | "Datei konnte nicht gelesen werden." |
| `convertToBlob` returns null oder rejected | "Konvertierung fehlgeschlagen. Bitte erneut versuchen." |
| `'OffscreenCanvas' in window === false` (Pre-flight) | "Dein Browser unterstützt diese Funktion nicht. Bitte aktualisieren." |

Error-State zeigt Drop-Aufforderung darunter weiter sichtbar — User kann sofort neu droppen.

**Memory-Lifecycle:**
- `outputUrl` wird revoked bei Reset, vor neuer Konvertierung, und im `onDestroy` der Komponente.
- `bitmap.close()` nach `drawImage` (siehe `process-webp.ts`).
- `inputBytes` wird beim Reset auf `null` gesetzt — GC räumt auf.

---

## 5. Testing

**Strategie:** Pure-Function-Tests sind die Wahrheit, Komponenten-Tests verifizieren nur State-Machine-Verdrahtung. Keine Snapshot-Tests, keine visuelle Regression in Session 7 (Playwright kommt in späterer Session).

### 5.1 `tests/process-webp.test.ts` *(neu, vitest, ~6–8 Cases)*

Fixtures: hardcoded 1×1-Pixel-Uint8Arrays für PNG (~70 Bytes) und JPG (~120 Bytes).

- 1×1 PNG → output ist gültiges WebP (Magic-Bytes `RIFF....WEBP` an Position 0/8 prüfen)
- 1×1 JPG → gültiges WebP
- Quality-Param wird durchgereicht: `q=50` erzeugt anderes Output als `q=95` (Byte-Length-Diff genügt als Beweis)
- Default-Verhalten (kein Config) → wirft, weil `processWebp` `quality` zwingend braucht (Default lebt im Tool-Config, nicht im Pure-Modul — bewusste Trennung)
- `quality > 100` wird auf 1.0 geclampt (clamp01)
- `quality < 0` wird auf 0 geclampt
- Korruptes Input (random Bytes) → Promise rejected
- Output-Type ist exakt `Uint8Array` (Type-Guard via `instanceof`)

**Test-Environment:** vitest mit jsdom oder happy-dom. `OffscreenCanvas` + `createImageBitmap` müssen verfügbar sein — falls jsdom diese nicht polyfillt, evaluieren wir [`@napi-rs/canvas`] oder testen mit `vitest --browser` (Playwright-runner) für diesen Modul-Test.
**Implementation-Note:** vor Commit klären, welche Test-Env-Variante grün läuft. Falls keine sauber funktioniert, fallback: `processWebp`-Tests laufen als E2E-Test in einem späteren Playwright-Setup, MVP committet nur die Komponenten-Tests + Type-Check als Coverage.
**Planning-Hinweis:** Diese Test-Env-Klärung ist **Task 1 von Commit 2** — Spike vor dem ersten Code-Schreiben, sonst Risiko, dass Commit 2 mittendrin blockiert.

### 5.2 `tests/filetool-component.test.ts` *(neu, vitest + @testing-library/svelte, ~5 Cases)*

`processWebp` wird gestubbt (`vi.mock`) — der Komponenten-Test prüft Verdrahtung, nicht Encoding-Korrektheit. Stub gibt deterministische Uint8Array zurück.

- Initial: `state=idle`, Drop-Zone-Text sichtbar, kein Download-Button
- File-Upload via `fireEvent.change(input, { target: { files: [pngFile] } })` → `state=converting` → `state=done`; Stats erscheinen, Download-Button hat korrekten `download`-Attr
- Oversize-File (11 MB Mock) → `state=error` mit korrekter Message; `processWebp` wurde nie aufgerufen
- Wrong-Format-File (`.gif`) → `state=error`; `processWebp` wurde nie aufgerufen
- Reset-Pill-Click im `done`-State → `state=idle`, Stats verschwinden, `URL.revokeObjectURL` wurde mit der done-URL aufgerufen

### 5.3 Bestehende Tests

133 Tests aus Sessions 1–6 bleiben grün. Touchpoint ist `[slug].astro` (Component-Map-Refactor) und `tool-registry.ts` (neuer Eintrag) — beide additive Changes. Smoketest: `astro check` + `vitest run` + `astro build` müssen unverändert grün laufen.

---

## 6. Visual Direction (Briefing für Design-Skill-Pflicht)

**Wichtig:** Diese Richtung ist Briefing für die Skills, kein finaler Visual-Spec. Der finale CSS-Code entsteht via minimalist-ui → frontend-design während Implementation (CLAUDE.md §5). Hard-Caps aus CLAUDE.md §5 (Graphit-Tokens, Inter+JetBrains, kein Hex/px, Svelte-Runes, refined-minimalism) gelten unverändert.

**Box-Geometrie:** Identisch zur Converter-Card aus Session 6 — `border 1px solid var(--color-border)`, `border-radius var(--r-lg)`, `padding var(--space-8)`, `background var(--color-bg)`, `box-shadow var(--shadow-sm)`. Min-Height fixiert auf einen Wert, der den größten der vier State-Layouts trägt — verhindert CLS beim Morph.

**Drag-Hover:** `border-color var(--color-text-subtle)`, `transition border-color var(--dur-fast) var(--ease-out)`. Kein Background-Wechsel, kein Lift-Effekt, kein Scale.

**Icons:** Inline-SVG, 24×24, `currentColor`, `stroke-width 1.75`, `stroke-linecap round` (analog Converter-Swap-Icon). Upload-Pfeil im idle-State, Check im done-State, X im error-State.

**Mono-Stats im done-State:**
```
Original   3,21 KB
WebP       1,08 KB · −66 %
```
Tabular-Nums, `font-size: var(--font-size-small)`, label-spalte links in `var(--color-text-subtle)`, value-spalte rechts in `var(--color-text)`. Differenz-Prozent in `var(--color-success)` (semantisch).

**Reset-Pill:** absolute oben rechts in der Box, `var(--space-3)` Inset. Style identisch zur Swap-Pill. `aria-label="Neue Datei wählen"`.

**Mobile (<40rem):** Box-Padding auf `var(--space-6)` reduziert, Stats-Layout bleibt zweispaltig, Download-Button nimmt volle Breite ein.

---

## 7. Commit-Sequenz

| # | Commit | Inhalt |
|---|---|---|
| 1 | `chore(deps): add @testing-library/svelte` | Falls noch nicht vorhanden (vorher prüfen, ggf. überspringen) |
| 2 | `feat(tools): add process-webp pure module + tests` | `src/lib/tools/process-webp.ts` + `tests/process-webp.test.ts` |
| 3 | `feat(tools): add png-jpg-to-webp config + slug-map + content` | Config + slug-map-Edit + de.md |
| 4 | `feat(components): add FileTool.svelte template + tests` | Komponente + Komponenten-Tests |
| 5 | `refactor(pages): component-map dispatch in [slug].astro` | Refactor von `if/throw` zu Map-Lookup |
| 6 | `feat(pages): wire png-jpg-to-webp file-tool` | Registry-Eintrag, sichtbar unter `/de/webp-konverter` |
| 7 | `fix(audit): web-design-guidelines pass on FileTool` | Fixes nach Audit-Subagent-Pass |
| 8 | `docs(progress): Session 7 WebP Konverter Prototype complete` | PROGRESS.md-Update + Trailer |

Trailer für jeden Commit: `Rulebooks-Read: PROJECT, CONVENTIONS[, STYLE][, CONTENT]` je nach Touch-Set.

**Skill-Sequenz während Implementation:** Vor Commit 4 (Komponente): `minimalist-ui` → `frontend-design` → Code. Nach Commit 6: `web-design-guidelines` Audit-Pass auf alle in der Session geänderten View-Files (das wird Commit 7).

---

## 8. Quality Gates

Vor jedem Commit grün:
- `npm run check` — 0 errors / 0 warnings
- `npm run test` — alle Tests grün (133 → ~144 nach Session 7)
- `npm run build` — alle Pages built (3 → 4)

Vor PROGRESS-Update:
- Tool funktioniert lokal unter `http://localhost:4321/de/webp-konverter` mit echtem PNG- und JPG-File (Drop + Click-to-Select beide getestet)
- Light + Dark Mode visuell geprüft
- Mobile (<40rem) im DevTools geprüft
- Oversize-File-Test (>10 MB) zeigt korrekten Error
- Wrong-Format-Test (`.gif`) zeigt korrekten Error
- `bash scripts/check-git-account.sh` green

---

## 9. Geparkte Folge-Sessions

Diese Features sind explizit Out-of-Scope für Session 7. Reihenfolge nach User-Review festzulegen:

| Feature | Trigger / Voraussetzung | Etwa-Aufwand |
|---|---|---|
| Multi-File-Drop + ZIP-Download | User-Approval des Single-File-Templates; `jszip`-Dep-Bump-Branch | 1 Session |
| Resize-Optionen | Nach Multi-File (wegen Per-File-Aspect-Lock-State) | 1 Session |
| Strip-Metadata-Checkbox | Independent — kann nach Single-File | 0,5 Session |
| Web-Worker / OffscreenCanvas-Worker | Trigger: Multi-File mit großen Files (>5 MB) blockt UI spürbar | 1 Session |
| Recraft.ai Icon | Phase-1-Icon-Batch (gemeinsam für alle bisherigen Tools) | Cross-Tool |
| Browser-Compat-Fallback (Pre-2022) | Nur wenn Analytics ≥1% Pre-2022-Traffic zeigen | TBD |

---

## 10. Non-Negotiables-Check

| # | Non-Negotiable | Erfüllt? |
|---|---|---|
| 1 | Session-Continuity (Rulebooks befolgt) | ✅ — PROJECT/CONVENTIONS/STYLE/CONTENT werden vor & während Session gelesen |
| 2 | Privacy-First (kein Tracking, 100% client-side) | ✅ — Canvas-API läuft im Browser, kein Upload |
| 3 | Quality-Gates (Build bricht bei fehlender Struktur) | ✅ — astro check + vitest + build sind Hard-Gates pro Commit |
| 4 | Git-Account pkcut-lab only | ✅ — Husky-Guard aktiv, manueller Check vor Commit |
| 5 | AdSense erst Phase 2 | ✅ — Ad-Slot-Placeholder bleibt unverändert (Session 6) |
| 6 | Design-Approval vor Template-Extraction | ✅ — Diese Spec + spec-review-loop + User-Final-Review |
| 7 | Keine Runtime-Network-Deps | ✅ — Canvas-API ist Browser-nativ, keine externen Calls |
| 7a | ML-File-Tools-Ausnahme | N/A — WebP-Konverter ist Standard-Browser-API, kein ML |
| 8 | Kein thin Content (<300 Wörter) | ✅ — de.md Pflicht ≥300 Wörter |
