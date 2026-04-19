# WebP Konverter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the single-file WebP converter at `/de/webp-konverter` and lock the `FileTool.svelte` template for all future `type: 'file-tool'` tools.

**Architecture:** Canvas `OffscreenCanvas.convertToBlob` in main thread. Pure-function encoder (`process-webp.ts`) separated from Svelte component (`FileTool.svelte`). Component state-machine: `idle → converting → done | error`. Dispatch from `[slug].astro` via component-map so future tool types plug in without touching the page. See spec `docs/superpowers/specs/2026-04-19-webp-konverter-design.md`.

**Tech Stack:** Astro 5, Svelte 5 Runes, TypeScript, vitest + jsdom, Canvas API (native). No new runtime deps, no new test deps — existing tests use Svelte's `mount` (no testing-library).

**Test-Env Decision (Spec §5.1 planning-hint):** jsdom 25 does not provide `OffscreenCanvas` or `createImageBitmap`. Decision locked here: `process-webp.test.ts` mocks these globals and tests orchestration + error branches. Real encoding is verified manually during Quality Gates (Task 7) and in a future Playwright E2E session. No browser-test-runner or `@napi-rs/canvas` dep needed for MVP.

---

## File Structure (decomposition lock)

| Path | Responsibility | Create/Modify |
|---|---|---|
| `src/lib/tools/process-webp.ts` | Pure encoder: `Uint8Array → WebP Uint8Array`. Zero DOM/Canvas-coupling in its import surface; only uses globals that exist at runtime. | Create |
| `tests/lib/tools/process-webp.test.ts` | Orchestration + error-branch tests with mocked Canvas globals. | Create |
| `src/lib/tools/png-jpg-to-webp.ts` | `FileToolConfig` instance: accept list, max-size, iconPrompt, delegates to `processWebp`. | Create |
| `tests/lib/tools/png-jpg-to-webp.test.ts` | Config-shape test (accept, maxSizeMb, process is callable). | Create |
| `src/lib/tool-registry.ts` | Add `png-jpg-to-webp` entry. | Modify |
| `src/lib/slug-map.ts` | Add `{ de: 'webp-konverter' }` entry. | Modify |
| `tests/lib/slug-map.test.ts` | Add coverage for new slug if existing tests iterate all entries. | Modify (maybe) |
| `src/content/tools/webp-konverter/de.md` | SEO content ≥300 words, passes frontmatter schema, locked H2 list. Directory name matches the **DE slug** (`webp-konverter`), not the toolId — aligns with the existing `meter-zu-fuss/` precedent. | Create |
| `tests/content/webp-konverter-content.test.ts` | Frontmatter + H2-order test analogous to `meter-zu-fuss-content.test.ts`. | Create |
| `src/components/tools/FileTool.svelte` | Template component — state-machine, drop-zone, quality-slider, inline morph, reset. | Create |
| `tests/components/tools/filetool.test.ts` | State-machine verification with `processWebp` mocked. | Create |
| `src/pages/[lang]/[slug].astro` | Replace `if/throw` type-guard with component-map. | Modify |
| `PROGRESS.md` | Session-7 deliverables + tool-inventar update. | Modify |

**Category:** `bilder` is introduced as a free-string `categoryId`. Spec §2 confirmed no central registry exists — no code-change required.

---

## Task 1: `process-webp` pure module + tests

**Files:**
- Create: `src/lib/tools/process-webp.ts`
- Create: `tests/lib/tools/process-webp.test.ts`

- [ ] **Step 1.1: Write failing tests**

Create `tests/lib/tools/process-webp.test.ts` with these cases (use `vi.stubGlobal` for `createImageBitmap` and `OffscreenCanvas`; both are not in jsdom):

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { processWebp } from '../../../src/lib/tools/process-webp';

function mockCanvasPipeline(outputBytes: Uint8Array) {
  const fakeBitmap = { width: 1, height: 1, close: vi.fn() };
  vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(fakeBitmap));
  const convertToBlob = vi.fn().mockResolvedValue(
    new Blob([outputBytes], { type: 'image/webp' }),
  );
  vi.stubGlobal(
    'OffscreenCanvas',
    vi.fn().mockImplementation(() => ({
      getContext: () => ({ drawImage: vi.fn() }),
      convertToBlob,
    })),
  );
  return { convertToBlob, fakeBitmap };
}

describe('processWebp', () => {
  beforeEach(() => vi.unstubAllGlobals());

  it('returns Uint8Array produced by convertToBlob', async () => {
    const out = new Uint8Array([1, 2, 3]);
    mockCanvasPipeline(out);
    const result = await processWebp(new Uint8Array([0]), { quality: 85 });
    expect(result).toBeInstanceOf(Uint8Array);
    expect(Array.from(result)).toEqual([1, 2, 3]);
  });

  it('passes quality/100 to convertToBlob', async () => {
    const { convertToBlob } = mockCanvasPipeline(new Uint8Array());
    await processWebp(new Uint8Array(), { quality: 50 });
    expect(convertToBlob).toHaveBeenCalledWith({ type: 'image/webp', quality: 0.5 });
  });

  it('clamps quality > 100 to 1.0', async () => {
    const { convertToBlob } = mockCanvasPipeline(new Uint8Array());
    await processWebp(new Uint8Array(), { quality: 150 });
    expect(convertToBlob).toHaveBeenCalledWith({ type: 'image/webp', quality: 1 });
  });

  it('clamps quality < 0 to 0', async () => {
    const { convertToBlob } = mockCanvasPipeline(new Uint8Array());
    await processWebp(new Uint8Array(), { quality: -10 });
    expect(convertToBlob).toHaveBeenCalledWith({ type: 'image/webp', quality: 0 });
  });

  it('closes ImageBitmap after drawing', async () => {
    const { fakeBitmap } = mockCanvasPipeline(new Uint8Array());
    await processWebp(new Uint8Array(), { quality: 85 });
    expect(fakeBitmap.close).toHaveBeenCalled();
  });

  it('throws decode-fail when createImageBitmap rejects', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockRejectedValue(new Error('bad')));
    await expect(processWebp(new Uint8Array(), { quality: 85 })).rejects.toThrow();
  });

  it('throws canvas-context-unavailable when getContext returns null', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue({ width: 1, height: 1, close: vi.fn() }));
    vi.stubGlobal('OffscreenCanvas', vi.fn().mockImplementation(() => ({ getContext: () => null })));
    await expect(processWebp(new Uint8Array(), { quality: 85 })).rejects.toThrow(/canvas-context-unavailable/);
  });
});
```

- [ ] **Step 1.2: Run tests, confirm they fail**

```bash
npm run test -- tests/lib/tools/process-webp.test.ts
```
Expected: FAIL (module not found).

- [ ] **Step 1.3: Implement `src/lib/tools/process-webp.ts`**

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

- [ ] **Step 1.4: Run tests, confirm they pass**

```bash
npm run test -- tests/lib/tools/process-webp.test.ts
```
Expected: 7/7 PASS.

- [ ] **Step 1.5: Run full gates**

```bash
npm run check && npm run test
```
Expected: 0/0 check, ~140/140 tests (~133 previous + 7 new). Confirm exact baseline with first `npm run test` output before this task.

- [ ] **Step 1.6: Commit**

```bash
bash scripts/check-git-account.sh
git add src/lib/tools/process-webp.ts tests/lib/tools/process-webp.test.ts
git commit -m "$(cat <<'EOF'
feat(tools): add process-webp pure encoder + tests

Pure-function WebP encoder via OffscreenCanvas + convertToBlob.
Mocked unit tests cover orchestration, quality-clamping, bitmap
cleanup, and decode/context-fail error branches. Real-encoding
verification is manual (browser) in Session 7 quality gates.

Rulebooks-Read: PROJECT, CONVENTIONS

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: `png-jpg-to-webp` tool config + slug-map + content

**Files:**
- Create: `src/lib/tools/png-jpg-to-webp.ts`
- Create: `tests/lib/tools/png-jpg-to-webp.test.ts`
- Create: `src/content/tools/png-jpg-to-webp/de.md`
- Create: `tests/content/png-jpg-to-webp-content.test.ts`
- Modify: `src/lib/tool-registry.ts`
- Modify: `src/lib/slug-map.ts`

- [ ] **Step 2.1: Write failing config-shape test**

Create `tests/lib/tools/png-jpg-to-webp.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { pngJpgToWebp } from '../../../src/lib/tools/png-jpg-to-webp';
import { toolSchema } from '../../../src/lib/tools/schemas';

describe('pngJpgToWebp config', () => {
  it('passes toolSchema validation', () => {
    const r = toolSchema.safeParse(pngJpgToWebp);
    if (!r.success) throw new Error(JSON.stringify(r.error.issues, null, 2));
    expect(r.success).toBe(true);
  });
  it('has id "png-jpg-to-webp" and type "file-tool"', () => {
    expect(pngJpgToWebp.id).toBe('png-jpg-to-webp');
    expect(pngJpgToWebp.type).toBe('file-tool');
  });
  it('accepts image/png and image/jpeg only', () => {
    expect(pngJpgToWebp.accept).toEqual(['image/png', 'image/jpeg']);
  });
  it('has maxSizeMb = 10', () => {
    expect(pngJpgToWebp.maxSizeMb).toBe(10);
  });
  it('has iconPrompt (non-empty Pencil-Sketch-style)', () => {
    expect(pngJpgToWebp.iconPrompt).toMatch(/pencil/i);
  });
});
```

- [ ] **Step 2.2: Run, confirm fail**

```bash
npm run test -- tests/lib/tools/png-jpg-to-webp.test.ts
```

- [ ] **Step 2.3: Implement `src/lib/tools/png-jpg-to-webp.ts`**

```ts
import type { FileToolConfig } from './schemas';
import { processWebp } from './process-webp';

/**
 * Recraft.ai icon prompt (Primary — locked with icon-prompt draft).
 * Status: [ ] Pending  [ ] Generated  [ ] Delivered
 *
 * Target: public/icons/tools/png-jpg-to-webp.webp (160x160, CSS 80x80).
 */
export const pngJpgToWebp: FileToolConfig = {
  id: 'png-jpg-to-webp',
  type: 'file-tool',
  categoryId: 'bilder',
  iconPrompt:
    'Pencil-sketch icon of a stylized image file transforming into a smaller ' +
    'compressed file, both drawn in monochrome graphite gray (#6B7280), ' +
    'single-weight hand-drawn strokes, no shading, no fill, transparent ' +
    'background, minimalist line art, square aspect, balanced composition with ' +
    'a right-arrow between source and target, small dot-pattern suggesting ' +
    'pixel compression on the right file.',
  accept: ['image/png', 'image/jpeg'],
  maxSizeMb: 10,
  process: (input, config) =>
    processWebp(input, {
      quality: typeof config?.quality === 'number' ? config.quality : 85,
    }),
};
```

- [ ] **Step 2.4: Add to `src/lib/tool-registry.ts`**

```ts
import { pngJpgToWebp } from './tools/png-jpg-to-webp';
// ...
export const toolRegistry: Record<string, ToolConfig> = {
  'meter-to-feet': meterZuFuss,
  'png-jpg-to-webp': pngJpgToWebp,
};
```

- [ ] **Step 2.5: Add to `src/lib/slug-map.ts`**

```ts
'png-jpg-to-webp': { de: 'webp-konverter' },
```

- [ ] **Step 2.6: Check existing slug-map tests; update only if they enumerate all entries**

```bash
npm run test -- tests/lib/slug-map.test.ts
```
If test asserts exact keys or count, update. Otherwise leave.

- [ ] **Step 2.7: Write content `src/content/tools/webp-konverter/de.md`**

Directory name = DE slug (`webp-konverter/`), matching the `meter-zu-fuss/` precedent.

Frontmatter must satisfy `toolContentFrontmatterSchema` — ALL these fields are required:
- `toolId: png-jpg-to-webp` (matches registry)
- `language: de`
- `title`: 30–60 chars, e.g. "PNG und JPG in WebP umwandeln – kostenlos" (42)
- `metaDescription`: 140–160 chars
- `tagline`: ≤200 chars
- `intro`: ≥1 char (rendered in `[slug].astro:70` as `entry.data.intro` — REQUIRED, not optional)
- `howToUse`: 3–5 Schritte (rendered as `<ol>` under the layout-hardcoded `<h2>Wie benutzt du den Konverter?</h2>`)
- `faq`: 4–6 Q/A
- `relatedTools`: 3–5 kebab-case slugs (can be stubs that don't resolve yet; schema validates kebab-case only)
- `contentVersion: 1`

Body H2 list (locked, must NOT collide with the layout-rendered `<h2>Wie benutzt du den Konverter?</h2>`):
1. `## Was ist WebP?`
2. `## Warum PNG/JPG in WebP umwandeln?`
3. `## Anwendungsbeispiele`
4. `## Datenschutz — 100% im Browser`
5. `## Häufige Fragen`
6. `## Verwandte Konverter`

Body ≥300 words total. No H1 (comes from layout). Related-tools stubs: `meter-zu-fuss` plus two plausible Phase-1 slugs (e.g. `kilometer-zu-meilen`, `zentimeter-zu-zoll`). A future link-validator script (Spec §8.5) will flag broken refs — that's a Session-9+ concern.

- [ ] **Step 2.8: Write `tests/content/webp-konverter-content.test.ts`**

Clone of `meter-zu-fuss-content.test.ts` but with:
- `toolId: 'png-jpg-to-webp'`
- `language: 'de'`
- File path: `src/content/tools/webp-konverter/de.md`
- H2 list locked to the 6 above

- [ ] **Step 2.9: Run full gates**

```bash
npm run check && npm run test
```
Expected: 0/0 check, ~150/150 tests.

- [ ] **Step 2.10: Commit**

```bash
bash scripts/check-git-account.sh
git add src/lib/tools/png-jpg-to-webp.ts src/lib/tool-registry.ts src/lib/slug-map.ts src/content/tools/webp-konverter/ tests/lib/tools/png-jpg-to-webp.test.ts tests/content/webp-konverter-content.test.ts
# add tests/lib/slug-map.test.ts if changed
git commit -m "$(cat <<'EOF'
feat(tools): add png-jpg-to-webp config + slug + content

Registers the WebP Konverter tool at /de/webp-konverter with
categoryId "bilder" (new, no central registry required — Zod
validates as free string). File-type restricted to PNG/JPG,
10 MB max. SEO content locks 6-H2 structure analogous to
meter-zu-fuss.

Rulebooks-Read: PROJECT, CONVENTIONS, CONTENT

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3 — PREREQUISITE: Design-Skill-Pflicht (CLAUDE.md §5)

Before touching `FileTool.svelte`, the agent MUST invoke in sequence:

- [ ] **Step 3.P1:** Invoke `Skill` tool with `minimalist-ui` skill. Pass brief: "FileTool.svelte box for /de/webp-konverter. States: idle (drop-prompt), converting (text only), done (stats + download), error (message + drop-prompt). Box geometry must match Converter.svelte from Session 6 (same border, radius, padding, shadow). Quality-slider outside the box analogous to Converter quick-value chips. Reset-pill (× neue Datei) absolute top-right in box, shown in done/error only. Hard-caps: Graphit tokens only, Inter+JetBrains, no hex/px, refined-minimalism. Min-height must accommodate the tallest of the four states — lock a token-value."

- [ ] **Step 3.P2:** Invoke `Skill` tool with `frontend-design` skill on top of the minimalist-ui output. Pass brief: "Refine typography, whitespace rhythm, micro-interactions (drag-hover, reset-pill hover, download-button press). Preserve Converter-parity. Map any non-token numerics to the project tokens." Then reconcile any conflicts with the CLAUDE.md §5 hard-caps in favor of the hard-caps.

- [ ] **Step 3.P3:** Merge both outputs into a single internal design-brief for the coding step. Document briefly (in agent's working memory / notes, not a new file) the locked visual values that will go into the component.

---

## Task 3: `FileTool.svelte` template + component tests

**Files:**
- Create: `src/components/tools/FileTool.svelte`
- Create: `tests/components/tools/filetool.test.ts`

- [ ] **Step 3.1: Write failing component tests**

Use the existing `mount/flushSync/unmount` pattern from `tests/components/tools/converter.test.ts`. No testing-library. Mock `processWebp` with `vi.mock('../../../src/lib/tools/process-webp', () => ({ processWebp: vi.fn().mockResolvedValue(new Uint8Array([1,2,3])) }))` (3 `../` from `tests/components/tools/`, matching the converter-test import depth).

Cases (minimum):
1. Initial render: `state=idle`, drop-zone text visible, no download-button present.
2. Drop valid PNG (mock `File` via `new File([bytes], 'x.png', { type: 'image/png' })`): after `flushSync` and awaited async, `state=done`, stats visible, download `<a>` has correct `download` attr (`x.webp`).
3. Drop oversize file (11 MB mock via File with `size` overridden — may need a stub helper since File.size is derived; alternative: inject size-check at a higher level the test can hit): `state=error`, error-message visible, `processWebp` never called.
4. Drop wrong-format file (`.gif`): `state=error` with format-message, `processWebp` never called.
5. Reset-pill click in `done`: `state=idle`, stats gone, `URL.revokeObjectURL` spy called with the done-state URL.
6. Quality-slider change in `done`: `processWebp` called again with new quality, still `state=done` after settle.

File-oversize test gotcha: `new File([...], 'x.png', { type: 'image/png' })` derives `.size` from the blob parts. To simulate >10 MB without allocating, either (a) construct with `new Uint8Array(11 * 1024 * 1024)` — 11 MB allocation is fine in test; or (b) use `Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 })`. Prefer (b) — no allocation.

- [ ] **Step 3.2: Run, confirm fail**

```bash
npm run test -- tests/components/tools/filetool.test.ts
```

- [ ] **Step 3.3: Implement `src/components/tools/FileTool.svelte`**

Use the visual direction from Task 3.P1–P3 (the merged design-brief). Component must:
- Use Svelte 5 runes: `$state`, `$derived`, `$props`.
- TS `interface Props { config: FileToolConfig }`.
- State enum type: `'idle' | 'converting' | 'done' | 'error'`.
- Pre-flight check on mount: if `!('OffscreenCanvas' in window)`, initial state = `error` with browser-too-old message.
- `<input type="file" hidden>` + programmatic click from drop-zone (keyboard Enter/Space activation).
- `@dragover.preventDefault` + `@drop.preventDefault` on outer div; extract first file from `event.dataTransfer.files`.
- Validate on selection: `file.type ∈ config.accept` AND `file.size ≤ config.maxSizeMb * 1024 * 1024`. On fail → `state=error` with specific message, `errorMessage` field.
- On pass → `state=converting`, read `file.arrayBuffer()`, cache in `inputBytes`, call `config.process(inputBytes, { quality })`, await. On reject → `state=error` "Konvertierung fehlgeschlagen. Bitte erneut versuchen." On success → wrap in Blob (`type: 'image/webp'`), `URL.createObjectURL`, store as `outputUrl`, compute stats, `state=done`.
- Reset-pill: revoke `outputUrl`, clear all state, `state=idle`.
- `onDestroy`: revoke `outputUrl` if present.
- Quality-change in `done`: re-run `config.process(inputBytes, { quality })`, revoke previous URL before storing new one.
- `data-testid` on: outer `filetool`, `filetool-dropzone`, `filetool-input`, `filetool-state` (carries current state as attribute for test-assertion), `filetool-download`, `filetool-reset`, `filetool-quality-slider`, `filetool-error-message`.
- `translate="no"` on filename, units ("KB", "MB"), percent-delta.
- `touch-action: manipulation` on interactive.
- `:focus-visible` 2px outline.
- `prefers-reduced-motion` respected (only applies if any transition is added — default transitions are fast enough).
- `text-wrap: balance` is a page-level concern, not needed inside the box.
- `aria-live="polite"` on the state-text inside the box so SR announces morph.
- Accessibility: drop-zone has `role="button"`, `tabindex="0"`, keyboard activation.

CSS uses only tokens from `src/styles/tokens.css` (already imported via `global.css`). No hex, no arbitrary px, no inline-style numerics. Match Converter box geometry: `border 1px solid var(--color-border)`, `border-radius var(--r-lg)`, `padding var(--space-8)`, `background var(--color-bg)`, `box-shadow var(--shadow-sm)`, `min-height <locked-value>`.

- [ ] **Step 3.4: Run component tests, confirm pass**

```bash
npm run test -- tests/components/tools/filetool.test.ts
```
Expected: all cases green.

- [ ] **Step 3.5: Run full gates**

```bash
npm run check && npm run test
```
Expected: 0/0 check, ~156/156 tests.

- [ ] **Step 3.6: Commit**

```bash
bash scripts/check-git-account.sh
git add src/components/tools/FileTool.svelte tests/components/tools/filetool.test.ts
git commit -m "$(cat <<'EOF'
feat(components): add FileTool.svelte template + tests

Template component for file-tool-type tools. State machine
idle → converting → done | error with inline-morph pattern
(single box, content swaps). Validates accept + size before
invoking config.process(). Reset-pill + quality re-run with
cached input bytes.

Visual language follows Converter.svelte from Session 6.
Svelte-5-Runes pattern, data-testid convention, WCAG-AAA
contrast, keyboard drop-zone activation, OffscreenCanvas
preflight check.

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `[slug].astro` component-map dispatch

**Files:**
- Modify: `src/pages/[lang]/[slug].astro`

- [ ] **Step 4.1: Edit the type-guard and render block**

Replace current lines around 37–42 (`if (config.type !== 'converter') throw`) and the `<Converter config={config} client:load />` line with:

```astro
---
import Converter from '../../components/tools/Converter.svelte';
import FileTool from '../../components/tools/FileTool.svelte';
// ... existing imports ...

const componentMap = {
  converter: Converter,
  'file-tool': FileTool,
} as const;

type SupportedType = keyof typeof componentMap;
const ToolComponent = componentMap[config.type as SupportedType];

if (!ToolComponent) {
  throw new Error(
    `No component registered for tool type="${config.type}". ` +
      `Add an entry to componentMap in src/pages/[lang]/[slug].astro.`,
  );
}
---

<section class="tool-section" aria-label="Konverter">
  <ToolComponent config={config} client:load />
</section>
```

Note: keep the existing German `aria-label="Konverter"` — "Konverter" is the colloquial umbrella for all our tool types in the DE context (and the WebP-Konverter literally has "Konverter" in its slug). When EN content arrives, the aria-label gets i18n-mapped at that point.

- [ ] **Step 4.2: Run gates**

```bash
npm run check && npm run test && npm run build
```
Expected: 0/0 check, tests green, build produces pages for meter-zu-fuss AND webp-konverter (4 pages total: `/de/meter-zu-fuss`, `/de/webp-konverter`, plus whatever index pages exist).

- [ ] **Step 4.3: Commit**

```bash
bash scripts/check-git-account.sh
git add src/pages/[lang]/[slug].astro
git commit -m "$(cat <<'EOF'
refactor(pages): component-map dispatch for tool types

Replace single-type if/throw guard with a component-map keyed on
config.type. Adds file-tool (FileTool.svelte) alongside converter.
Extensible to all 9 tool types without further page edits.

Rulebooks-Read: PROJECT, CONVENTIONS

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Manual smoke-test + web-design-guidelines audit

- [ ] **Step 5.1: Start dev server**

```bash
npm run dev
```
Open `http://localhost:4321/de/webp-konverter` in a real browser (Chrome latest or Firefox latest).

- [ ] **Step 5.2: Golden path test**

- Drag a real PNG (or click drop-zone → select) → converting → done. Stats visible, download button has correct `download` attr. Click download → saves `x.webp`. **Open the downloaded file in an OS image viewer** to confirm it's a valid WebP image (this compensates for the unit-tests using mocked Canvas APIs — see plan preamble).
- Drag a JPG → done with correct filename `x.webp`. Open downloaded file, confirm valid.
- Change quality slider → re-converts, new size-stat shown. Higher quality = larger file (visible in stats).
- Click reset-pill → idle state, slider value preserved (user setting, not conversion state).

- [ ] **Step 5.3: Edge cases**

- Drag a `.gif` → error "Nur PNG und JPG werden unterstützt."
- Drag a `.txt` → error (same).
- Simulate 11 MB (use a 15 MP screenshot PNG or similar) → error "Datei zu groß. Maximum: 10 MB."
- Corrupt file (truncated PNG) → error "Datei konnte nicht gelesen werden."

- [ ] **Step 5.4: Theme + responsive**

- Toggle light/dark. Box, slider, stats, buttons all readable. No hex-coded values leaking.
- DevTools → responsive mode → 375px. Box padding reduced to `--space-6`, layout still clean. Quality-slider remains usable.
- Keyboard-only: Tab to drop-zone → Enter opens file-picker. Tab to reset-pill → Enter resets. Tab to download link → Enter saves.

- [ ] **Step 5.5: Invoke `web-design-guidelines` skill as audit-pass**

Via `Skill` tool. Target files:
- `src/components/tools/FileTool.svelte`
- `src/pages/[lang]/[slug].astro` (only the lines changed in Task 4)

Apply Important-severity findings. Discard Nit-severity unless trivial. Do NOT blanket-reapply Session-6 audit findings — those are already in place (`translate="no"`, `touch-action: manipulation`, `text-wrap: balance`, `color-scheme`, `:focus-visible`).

- [ ] **Step 5.6: Apply audit fixes + re-run gates**

```bash
npm run check && npm run test && npm run build
```

- [ ] **Step 5.7: Commit audit fixes**

```bash
bash scripts/check-git-account.sh
git add -A
git commit -m "$(cat <<'EOF'
fix(audit): web-design-guidelines pass on FileTool

Apply Important-severity audit findings from the post-implementation
pass on FileTool.svelte and the slug-page component-map dispatch.

Rulebooks-Read: PROJECT, STYLE

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

If the audit finds nothing Important, skip this commit and note in PROGRESS that no fixes were needed.

---

## Task 6: PROGRESS.md update + final commit

**Files:**
- Modify: `PROGRESS.md`

- [ ] **Step 6.1: Update PROGRESS.md**

- Mark Session 7 as ✅ done with deliverables list.
- Update Tool-Inventar table: add `png-jpg-to-webp` row with ✅ Config / ✅ Content-DE / ⬜ Icon / ✅ Tests.
- Add Session-8 Plan bullet: "Review #2 — User testet `/de/webp-konverter` und gibt Feedback. Danach lock FileTool-Template in CONVENTIONS.md + STYLE.md."
- Bump "Letztes Update" to 2026-04-19 (Session 7, End).

- [ ] **Step 6.2: Final commit**

```bash
bash scripts/check-git-account.sh
git add PROGRESS.md
git commit -m "$(cat <<'EOF'
docs(progress): Session 7 WebP Konverter Prototype complete

FileTool.svelte template shipped, /de/webp-konverter live,
component-map dispatch in [slug].astro lets future tool types
plug in. All quality gates green. Next: Session 8 Review #2
with user.

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE, CONTENT

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 6.3: Stop (per CLAUDE.md Session-Ritual).** Do NOT push. Push is user's call.

---

## Failure Modes & Recovery

| Problem | Recovery |
|---|---|
| `processWebp` tests pass in jsdom but real browser encoding fails in Task 5.2 | Surface to user. Likely a mock-vs-real divergence. Add a browser-runner E2E test as a follow-up plan. Do NOT try to salvage by rewriting the encoder — spec scope ends at MVP, real-browser verification is a Gate, not a dev-target. |
| `[slug].astro` Astro build fails after component-map refactor | Revert Task 4 only (`git reset HEAD~1 --soft` or `git revert`). Re-attempt with stricter type-narrowing on `config.type`. |
| Content test fails because frontmatter length constraints (title 30–60, metaDescription 140–160) are tight | Iterate the strings until lengths fit. This is routine content-editing, not a spec deviation. |
| Oversize-file test can't simulate 11 MB via `Object.defineProperty(file, 'size', …)` (browser-in-jsdom edge) | Fall back to allocating `new Uint8Array(11 * 1024 * 1024)` in-test — acceptable memory cost in a one-time test run. |
| Skill-tool invocation for `minimalist-ui` / `frontend-design` returns advice that conflicts with CLAUDE.md §5 Hard-Caps (e.g., recommends a colored accent, sans-serif swap, hex values) | Ignore the conflicting parts. CLAUDE.md §5 says Hard-Caps override skill defaults. Document only the conforming guidance. |
| Audit finds Important-severity issues that would require a spec change | Stop. Surface to user with the specific finding + proposed scope delta. Do not silently expand scope. |

---

## Definition of Done

- [ ] 6 base commits landed on `main` (local) in the order above. Plus 1 optional audit-fix commit (Task 5.7) if `web-design-guidelines` finds Important-severity issues — total 6 or 7.
- [ ] `/de/webp-konverter` works end-to-end in a real browser for a real PNG and JPG.
- [ ] All 4 error paths (wrong-format, oversize, decode-fail, encode-fail) show correct inline messages.
- [ ] Light + Dark mode both clean. Mobile 375px clean. Keyboard-only navigation works.
- [ ] `npm run check` = 0/0. `npm run test` all green. `npm run build` produces 4 pages.
- [ ] PROGRESS.md reflects Session 7 complete + Session-8 next-step.
- [ ] No push to origin — user's call per CLAUDE.md session-ritual.
