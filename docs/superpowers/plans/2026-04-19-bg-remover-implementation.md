# Hintergrund-Entferner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the third Phase-0-Tool — `/de/hintergrund-entfernen` — a fully client-side Background-Remover using Transformers.js + BEN2-ONNX, while extending the `FileTool` template with reusable building blocks (Loader component, prepare-phase, multi-format output, clipboard paste, mobile camera, HEIC support).

**Architecture:** Pure-client only. ML model lazy-loaded on first upload via `@huggingface/transformers` v4 + `onnx-community/BEN2-ONNX` (~110 MB, MIT, WebGPU + WASM fallback). Singleton-cached after first load. `FileToolConfig` gets five optional fields (`prepare?`, `defaultFormat?`, `cameraCapture?`, `filenameSuffix?`, `showQuality?`) — fully backwards-compatible with the existing `webp-konverter`. Output Canvas snapshot is module-cached so format switches re-encode without re-inference.

**Tech Stack:** Astro 5 SSG · Svelte 5 Runes · Tailwind 3.4 · TypeScript strict · Zod 3.24 · vitest 2.1.8 + jsdom 25 · `@huggingface/transformers` v4 · `heic2any` (HEIC decode polyfill).

**Spec:** [docs/superpowers/specs/2026-04-19-bg-remover-design.md](../specs/2026-04-19-bg-remover-design.md)

**Rulebooks (read at session start):** PROJECT, CONVENTIONS, STYLE, CONTENT.

---

## File Structure (Decomposition Lock-in)

### New files (9 source + 8 test)

| File | Responsibility |
|------|----------------|
| `src/components/Loader.svelte` | Shared 2-variant loader (spinner / progress); used by every future tool that needs lazy-loading or long-running work. |
| `src/lib/tools/heic-decode.ts` | Tiny wrapper around `heic2any` lazy-import — converts HEIC/HEIF Blob → PNG Blob. Safari short-circuits (returns input). |
| `src/lib/tools/remove-background.ts` | Pure ML module: `prepareBackgroundRemovalModel`, `removeBackground`, `reencodeLastResult`, `clearLastResult`, `isPrepared`, `StallError`. Singleton-cached pipeline + canvas snapshot + watchdog timer. |
| `src/lib/tools/hintergrund-entferner.ts` | Tool config (FileToolConfig). |
| `src/lib/tools/tool-runtime-registry.ts` | Replaces `process-registry.ts` — one registry holding `{ process, prepare?, reencode?, isPrepared?, clearLastResult? }` per tool-id. (Renamed because shape grew.) |
| `src/lib/seo/tool-jsonld.ts` | JSON-LD builder: SoftwareApplication + FAQPage + HowTo. Pure function, applies to every tool page (not just BG-Remover). |
| `src/content/tools/hintergrund-entfernen/de.md` | SEO content. |
| `tests/components/Loader.test.ts` | Loader-component tests. |
| `tests/lib/tools/heic-decode.test.ts` | HEIC-decode wrapper tests (mocked heic2any). |
| `tests/lib/tools/remove-background.test.ts` | Pure-module tests (mocked transformers.js + watchdog). |
| `tests/lib/tools/tool-runtime-registry.test.ts` | Registry shape + dispatch tests. |
| `tests/lib/seo/tool-jsonld.test.ts` | JSON-LD builder tests. |
| `tests/components/tools/filetool-format.test.ts` | Dynamic-format-output + format-chooser + filenameSuffix + showQuality tests. |
| `tests/components/tools/filetool-prepare.test.ts` | Preparing-phase + isPrepared cache tests. |
| `tests/components/tools/filetool-input-methods.test.ts` | Clipboard + camera + HEIC tests. |
| `tests/components/tools/filetool-preview.test.ts` | Mini-preview rendering test. |
| `tests/content/hintergrund-entfernen-content.test.ts` | Content frontmatter + body + Datenschutz-CDN-disclosure tests. |

### Modified files

| File | Change |
|------|--------|
| `src/lib/tools/schemas.ts` | Add 5 optional fields to `fileToolSchema` + `FileToolConfig` type: `prepare?`, `defaultFormat?`, `cameraCapture?`, `filenameSuffix?`, `showQuality?`. |
| `src/components/tools/FileTool.svelte` | Major refactor: phase-machine adds `preparing`, dynamic output MIME/extension, format chooser, clipboard paste, camera button, HEIC pre-decode, mini-preview. |
| `src/lib/tools/tool-registry.ts` | Register `hintergrundEntferner`. |
| `src/lib/slug-map.ts` | Add `remove-background` → `hintergrund-entfernen` slug for DE. |
| `src/lib/tools/png-jpg-to-webp.ts` | Update import path: `process-registry` → `tool-runtime-registry`. |
| `tests/lib/tools/png-jpg-to-webp-config.test.ts` | Same import update (if it imports process-registry). |
| `tests/components/tools/filetool.test.ts` | Same import update (if it imports process-registry). |
| `package.json` + `package-lock.json` | New deps: `@huggingface/transformers`, `heic2any`. |
| `CONVENTIONS.md` | §Tool-Components: new `preparing` phase. §File-Tool-Pattern: prepare-step + clipboard/camera defaults + HEIC pre-decode. §Components: Loader.svelte. |
| `STYLE.md` | §9.2: preparing-state + format-chooser + mini-preview. New §11: Loader visual spec. |
| `PROGRESS.md` | Mark Session 9 (or whichever) as Hintergrund-Entferner complete. |
| `src/pages/[lang]/[slug].astro` | Emit JSON-LD blocks per Task 12b (applies to every tool page). |

### Locked design decisions (resolves spec §15 open questions)

1. **Single registry, not split.** `tool-runtime-registry.ts` holds `{ process, prepare? }` per tool-id. Cleaner than two parallel registries.
2. **WebGPU detection:** `try { const adapter = await navigator.gpu?.requestAdapter(); return adapter ? 'webgpu' : 'wasm'; } catch { return 'wasm'; }`. Try-catch covers browsers reporting `gpu` but failing on adapter request.
3. **Format-chooser default = always PNG**, regardless of input MIME. Spec §15.3 — Transparency is the headline use-case.
4. **Mini-preview downscale to max 200×200** before display. Spec §15.4.
5. **`lastResultCanvas` cache lifetime:** Module-scope variable, explicitly `clearLastResult()`-ed on FileTool reset. Spec §15.5.
6. **Camera-capture default = `true` for all File-Tools whose `accept[]` contains any `image/*` MIME.** Per-tool opt-out via `cameraCapture: false`.

---

## Pre-flight checks (every task starts with these)

```bash
bash scripts/check-git-account.sh   # must print: ✓ Git account correct: ...pkcut-lab...
git status                          # clean working tree (or only the task's own files)
```

If either fails, STOP and surface to the human.

---

## Task 1: Install npm dependencies

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Verify current package.json baseline**

Run: `node -e "console.log(Object.keys(require('./package.json').dependencies).sort().join('\n'))"`
Expected: lists current deps; should NOT include `@huggingface/transformers` or `heic2any`.

- [ ] **Step 2: Install Transformers.js + heic2any**

Run:
```bash
npm install @huggingface/transformers@^4 heic2any@^0.0.4
```
Expected: install succeeds, both deps appear in `package.json`. `node_modules` grows by ~250 MB (onnxruntime-web is a peer-dep).

- [ ] **Step 3: Verify peer-dep `onnxruntime-web` is present**

Run: `ls node_modules/onnxruntime-web/dist/*.wasm | head -5`
Expected: lists at least 3 `.wasm` files (ort-wasm, ort-wasm-simd, ort-wasm-threaded).

- [ ] **Step 4: Type-check still passes**

Run: `npm run check`
Expected: `0 errors, 0 warnings, 0 hints`.

- [ ] **Step 5: All existing tests still pass**

Run: `npm test -- --run`
Expected: 159/159 (or current count) pass.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json
git commit -m "$(cat <<'EOF'
chore(deps): add @huggingface/transformers v4 + heic2any for bg-remover

Both MIT-licensed. Dynamic-imported (no Hauptbundle impact).
- transformers.js: ML inference (BEN2 ONNX, WebGPU + WASM)
- heic2any: HEIC/HEIF decode polyfill (Safari skips)

Rulebooks-Read: PROJECT, CONVENTIONS

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: `Loader.svelte` — shared component

**Files:**
- Create: `src/components/Loader.svelte`
- Test: `tests/components/Loader.test.ts`

**Reference:** Spec §6.1. STYLE.md §11 (will be added in Task 14).

- [ ] **Step 1: Write failing tests**

Create `tests/components/Loader.test.ts`:

```typescript
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import Loader from '../../src/components/Loader.svelte';

describe('Loader', () => {
  let host: HTMLElement;
  let cmp: ReturnType<typeof mount> | undefined;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
  });

  afterEach(() => {
    if (cmp) unmount(cmp);
    host.remove();
  });

  it('spinner variant renders SVG arc with role=status', () => {
    cmp = mount(Loader, { target: host, props: { variant: 'spinner' } });
    flushSync();
    const el = host.querySelector('[data-testid="loader-spinner"]');
    expect(el).not.toBeNull();
    expect(el?.getAttribute('role')).toBe('status');
    expect(host.querySelector('svg')).not.toBeNull();
  });

  it('spinner variant uses ariaLabel prop', () => {
    cmp = mount(Loader, { target: host, props: { variant: 'spinner', ariaLabel: 'Verarbeitet' } });
    flushSync();
    expect(host.querySelector('[data-testid="loader-spinner"]')?.getAttribute('aria-label')).toBe('Verarbeitet');
  });

  it('progress variant renders progressbar with aria-valuenow', () => {
    cmp = mount(Loader, { target: host, props: { variant: 'progress', value: 0.42 } });
    flushSync();
    const el = host.querySelector('[data-testid="loader-progress"]');
    expect(el?.getAttribute('role')).toBe('progressbar');
    expect(el?.getAttribute('aria-valuenow')).toBe('42');
    expect(el?.getAttribute('aria-valuemin')).toBe('0');
    expect(el?.getAttribute('aria-valuemax')).toBe('100');
  });

  it('progress variant clamps value to [0,1]', () => {
    cmp = mount(Loader, { target: host, props: { variant: 'progress', value: 1.5 } });
    flushSync();
    expect(host.querySelector('[data-testid="loader-progress"]')?.getAttribute('aria-valuenow')).toBe('100');
    unmount(cmp);
    cmp = mount(Loader, { target: host, props: { variant: 'progress', value: -0.5 } });
    flushSync();
    expect(host.querySelector('[data-testid="loader-progress"]')?.getAttribute('aria-valuenow')).toBe('0');
  });

  it('progress variant renders label with NBSP', () => {
    cmp = mount(Loader, { target: host, props: { variant: 'progress', value: 0.42, label: '46\u00A0/\u00A0110\u00A0MB' } });
    flushSync();
    const labelEl = host.querySelector('[data-testid="loader-progress-label"]');
    expect(labelEl?.textContent).toContain('\u00A0');
    expect(labelEl?.textContent).toContain('46');
  });

  it('progress variant fill width matches value', () => {
    cmp = mount(Loader, { target: host, props: { variant: 'progress', value: 0.42 } });
    flushSync();
    const fill = host.querySelector('[data-testid="loader-progress-fill"]') as HTMLElement | null;
    expect(fill).not.toBeNull();
    expect(fill?.style.width).toBe('42%');
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

Run: `npx vitest run tests/components/Loader.test.ts`
Expected: 6 failures, all "Loader.svelte not found" or similar.

- [ ] **Step 3: Implement `Loader.svelte`**

Create `src/components/Loader.svelte`:

```svelte
<script lang="ts">
  interface Props {
    variant: 'spinner' | 'progress';
    value?: number;
    label?: string;
    ariaLabel?: string;
  }

  let { variant, value = 0, label, ariaLabel = 'Lädt' }: Props = $props();

  const clamped = $derived(Math.max(0, Math.min(1, value)));
  const pct = $derived(Math.round(clamped * 100));
</script>

{#if variant === 'spinner'}
  <span
    class="spinner"
    role="status"
    aria-label={ariaLabel}
    data-testid="loader-spinner"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-opacity="0.2" />
      <path d="M12 2 a 10 10 0 0 1 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>
  </span>
{:else}
  <span class="progress">
    <span
      class="progress__track"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label={ariaLabel}
      data-testid="loader-progress"
    >
      <span
        class="progress__fill"
        style="width: {pct}%"
        data-testid="loader-progress-fill"
      ></span>
    </span>
    {#if label}
      <span class="progress__label" data-testid="loader-progress-label">{label}</span>
    {/if}
  </span>
{/if}

<style>
  .spinner {
    display: inline-flex;
    width: 24px;
    height: 24px;
    color: var(--color-text-subtle);
  }
  .spinner svg {
    width: 100%;
    height: 100%;
    animation: spin 0.9s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .progress {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    width: 100%;
  }
  .progress__track {
    flex: 1 1 auto;
    display: block;
    height: 1px;
    background: var(--color-border);
    border-radius: var(--r-sm);
    overflow: hidden;
  }
  .progress__fill {
    display: block;
    height: 100%;
    background: var(--color-text);
    transition: width var(--dur-med) var(--ease-out);
  }
  .progress__label {
    flex: 0 0 auto;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-variant-numeric: tabular-nums;
    color: var(--color-text-subtle);
    letter-spacing: 0.02em;
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner svg {
      animation-duration: 0s;
    }
    .progress__fill {
      transition: none;
    }
  }
</style>
```

- [ ] **Step 4: Run tests — verify they pass**

Run: `npx vitest run tests/components/Loader.test.ts`
Expected: 6/6 pass.

- [ ] **Step 5: Run full test suite + check**

Run: `npm test -- --run && npm run check`
Expected: all tests pass, 0/0/0.

- [ ] **Step 6: Commit**

```bash
git add src/components/Loader.svelte tests/components/Loader.test.ts
git commit -m "$(cat <<'EOF'
feat(components): add Loader.svelte (spinner + progress variants)

Shared loader for any tool that needs lazy-load progress or long-running
work. Tokens-only (no hex/arbitrary-px), prefers-reduced-motion respected,
NBSP in label, clamped value.

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: `heic-decode.ts` — HEIC/HEIF decode helper

**Files:**
- Create: `src/lib/tools/heic-decode.ts`
- Test: `tests/lib/tools/heic-decode.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/lib/tools/heic-decode.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('heic-decode', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns input unchanged when MIME is not HEIC/HEIF', async () => {
    const { decodeHeicIfNeeded } = await import('../../../src/lib/tools/heic-decode');
    const buf = new Uint8Array([1, 2, 3]);
    const result = await decodeHeicIfNeeded(buf, 'image/png');
    expect(result.bytes).toBe(buf);
    expect(result.mime).toBe('image/png');
  });

  it('returns input unchanged in Safari (native HEIC decode)', async () => {
    vi.stubGlobal('navigator', { ...globalThis.navigator, userAgent: 'Mozilla/5.0 (Macintosh) AppleWebKit/605.1.15 Safari/605.1.15 Version/17.0' });
    const { decodeHeicIfNeeded } = await import('../../../src/lib/tools/heic-decode');
    const buf = new Uint8Array([1, 2, 3]);
    const result = await decodeHeicIfNeeded(buf, 'image/heic');
    expect(result.bytes).toBe(buf);
    expect(result.mime).toBe('image/heic');
  });

  it('lazy-loads heic2any and converts HEIC to PNG in non-Safari', async () => {
    vi.stubGlobal('navigator', { ...globalThis.navigator, userAgent: 'Mozilla/5.0 Chrome/120' });
    const heic2anySpy = vi.fn(async () => new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' }));
    vi.doMock('heic2any', () => ({ default: heic2anySpy }));
    const { decodeHeicIfNeeded } = await import('../../../src/lib/tools/heic-decode');
    const buf = new Uint8Array([0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63]);
    const result = await decodeHeicIfNeeded(buf, 'image/heic');
    expect(heic2anySpy).toHaveBeenCalledTimes(1);
    expect(result.mime).toBe('image/png');
    expect(result.bytes[0]).toBe(137);
    expect(result.bytes[1]).toBe(80);
  });

  it('handles image/heif MIME type the same as image/heic', async () => {
    vi.stubGlobal('navigator', { ...globalThis.navigator, userAgent: 'Mozilla/5.0 Chrome/120' });
    const heic2anySpy = vi.fn(async () => new Blob([new Uint8Array([137, 80, 78, 71])], { type: 'image/png' }));
    vi.doMock('heic2any', () => ({ default: heic2anySpy }));
    const { decodeHeicIfNeeded } = await import('../../../src/lib/tools/heic-decode');
    const buf = new Uint8Array([1, 2, 3]);
    const result = await decodeHeicIfNeeded(buf, 'image/heif');
    expect(heic2anySpy).toHaveBeenCalledTimes(1);
    expect(result.mime).toBe('image/png');
  });

  it('rejects with descriptive error when heic2any fails', async () => {
    vi.stubGlobal('navigator', { ...globalThis.navigator, userAgent: 'Mozilla/5.0 Chrome/120' });
    vi.doMock('heic2any', () => ({ default: vi.fn().mockRejectedValue(new Error('corrupt')) }));
    const { decodeHeicIfNeeded } = await import('../../../src/lib/tools/heic-decode');
    await expect(decodeHeicIfNeeded(new Uint8Array([1]), 'image/heic')).rejects.toThrow(/HEIC/i);
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

Run: `npx vitest run tests/lib/tools/heic-decode.test.ts`
Expected: 5 failures, "heic-decode not found".

- [ ] **Step 3: Implement `heic-decode.ts`**

Create `src/lib/tools/heic-decode.ts`:

```typescript
/**
 * HEIC/HEIF decode helper. Lazy-loads `heic2any` only when needed AND only
 * in non-Safari browsers. Safari decodes HEIC natively via createImageBitmap,
 * so the polyfill is skipped — saves ~30 KB gzip on iOS/macOS visits.
 */

export interface DecodeResult {
  bytes: Uint8Array;
  mime: string;
}

const HEIC_MIMES = new Set(['image/heic', 'image/heif']);

function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua);
}

export async function decodeHeicIfNeeded(
  bytes: Uint8Array,
  mime: string,
): Promise<DecodeResult> {
  if (!HEIC_MIMES.has(mime)) return { bytes, mime };
  if (isSafari()) return { bytes, mime };

  let heic2any: (opts: { blob: Blob; toType: string }) => Promise<Blob | Blob[]>;
  try {
    const mod = await import('heic2any');
    heic2any = mod.default as typeof heic2any;
  } catch (err) {
    throw new Error(
      `HEIC-Decoder konnte nicht geladen werden: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  let outBlob: Blob;
  try {
    const result = await heic2any({
      blob: new Blob([bytes as BlobPart], { type: mime }),
      toType: 'image/png',
    });
    outBlob = Array.isArray(result) ? result[0] : result;
  } catch (err) {
    throw new Error(
      `HEIC-Datei konnte nicht gelesen werden: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const buf = new Uint8Array(await outBlob.arrayBuffer());
  return { bytes: buf, mime: 'image/png' };
}
```

- [ ] **Step 4: Run tests — verify they pass**

Run: `npx vitest run tests/lib/tools/heic-decode.test.ts`
Expected: 5/5 pass.

- [ ] **Step 5: Full suite + check**

Run: `npm test -- --run && npm run check`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add src/lib/tools/heic-decode.ts tests/lib/tools/heic-decode.test.ts
git commit -m "$(cat <<'EOF'
feat(tools): add heic-decode helper (Safari-skip + Chrome/FF lazy-load)

Tiny wrapper: HEIC/HEIF MIME → PNG bytes. Safari short-circuits because
createImageBitmap handles HEIC natively. Chromium/Firefox lazy-import
heic2any (~30 KB gzip) only on actual HEIC upload.

Rulebooks-Read: PROJECT, CONVENTIONS

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Extend `FileToolConfig` schema

**Files:**
- Modify: `src/lib/tools/schemas.ts`
- Test: `tests/lib/tools/schemas.test.ts` (existing — extend with new field tests)

**Reference:** Spec §4.2.

- [ ] **Step 1: Locate existing schema test file**

Run: `ls tests/lib/tools/schemas*.test.ts`
Expected: at least one schema test file. Read it first to understand existing patterns.

- [ ] **Step 2: Write failing tests for new fields**

Append to the existing schema-test file (or create `tests/lib/tools/schemas-filetool-extended.test.ts` if no good fit):

```typescript
import { describe, it, expect } from 'vitest';
import { parseToolConfig } from '../../../src/lib/tools/schemas';

describe('FileToolConfig — extended fields', () => {
  const valid = {
    id: 'test-tool',
    type: 'file-tool' as const,
    categoryId: 'bilder',
    accept: ['image/png'],
    maxSizeMb: 10,
    process: () => new Uint8Array([1, 2, 3]),
  };

  it('accepts config without prepare/defaultFormat/cameraCapture (backwards-compat)', () => {
    const r = parseToolConfig(valid);
    expect(r.ok).toBe(true);
  });

  it('accepts config with optional prepare function', () => {
    const r = parseToolConfig({ ...valid, prepare: async () => undefined });
    expect(r.ok).toBe(true);
  });

  it('accepts config with defaultFormat string', () => {
    const r = parseToolConfig({ ...valid, defaultFormat: 'png' });
    expect(r.ok).toBe(true);
  });

  it('accepts config with cameraCapture boolean', () => {
    const r = parseToolConfig({ ...valid, cameraCapture: false });
    expect(r.ok).toBe(true);
  });

  it('accepts config with filenameSuffix string', () => {
    const r = parseToolConfig({ ...valid, filenameSuffix: '_no-bg' });
    expect(r.ok).toBe(true);
  });

  it('accepts config with showQuality boolean', () => {
    const r = parseToolConfig({ ...valid, showQuality: false });
    expect(r.ok).toBe(true);
  });

  it('rejects non-callable prepare', () => {
    const r = parseToolConfig({ ...valid, prepare: 'not-a-function' });
    expect(r.ok).toBe(false);
  });
});
```

- [ ] **Step 3: Run tests — verify they fail**

Run: `npx vitest run tests/lib/tools/schemas-filetool-extended.test.ts`
Expected: 5 failures (or whichever count) — schema doesn't yet accept new fields, but the rejection-test for non-callable might pass already. Read failures carefully.

- [ ] **Step 4: Extend `fileToolSchema` and `FileToolConfig` type**

Edit `src/lib/tools/schemas.ts`:

```typescript
export const fileToolSchema = base.extend({
  type: z.literal('file-tool'),
  accept: z.array(z.string().min(1)).min(1),
  maxSizeMb: z.number().positive(),
  process: z.function(),
  prepare: z.function().optional(),
  defaultFormat: z.string().min(1).optional(),
  cameraCapture: z.boolean().optional(),
  filenameSuffix: z.string().optional(),
  showQuality: z.boolean().optional(),
});
```

And update the type:

```typescript
export type FileToolConfig = Omit<z.infer<typeof fileToolSchema>, 'process' | 'prepare'> & {
  process: (input: Uint8Array, config?: Record<string, unknown>) => Uint8Array | Promise<Uint8Array>;
  prepare?: (onProgress: (e: { loaded: number; total: number }) => void) => Promise<void>;
};
```

- [ ] **Step 5: Run tests — verify they pass**

Run: `npx vitest run tests/lib/tools/schemas-filetool-extended.test.ts && npm test -- --run`
Expected: all pass. Existing FileToolConfig consumers (e.g. `png-jpg-to-webp.ts`) still type-check.

- [ ] **Step 6: Type-check + commit**

Run: `npm run check`
Expected: 0/0/0.

```bash
git add src/lib/tools/schemas.ts tests/lib/tools/
git commit -m "$(cat <<'EOF'
feat(schemas): extend FileToolConfig with 5 optional fields

prepare/defaultFormat/cameraCapture/filenameSuffix/showQuality.
Additive — webp-konverter and any future file-tool without these fields
are unaffected. Enables BG-Remover (prepare = model load,
filenameSuffix = '_no-bg', showQuality = false) and multi-format output
tools (defaultFormat).

Rulebooks-Read: PROJECT, CONVENTIONS

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Refactor `process-registry` → `tool-runtime-registry`

**Files:**
- Create: `src/lib/tools/tool-runtime-registry.ts`
- Delete: `src/lib/tools/process-registry.ts` (after consumers updated)
- Test: `tests/lib/tools/tool-runtime-registry.test.ts`
- Modify: `src/components/tools/FileTool.svelte` (import path only — full refactor in later tasks)
- Modify: any test file currently importing `process-registry`

**Reference:** Spec §4.3 (resolved as single registry).

- [ ] **Step 1: Find all current imports of `process-registry`**

Run: `grep -rn "process-registry" src/ tests/ --include="*.ts" --include="*.svelte"`
Note the list. Expected: at least `src/components/tools/FileTool.svelte` and likely 1–2 test files.

- [ ] **Step 2: Write failing tests for new registry shape**

Create `tests/lib/tools/tool-runtime-registry.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { getRuntime, toolRuntimeRegistry } from '../../../src/lib/tools/tool-runtime-registry';

describe('tool-runtime-registry', () => {
  it('contains an entry for png-jpg-to-webp with process function', () => {
    const r = getRuntime('png-jpg-to-webp');
    expect(r).toBeDefined();
    expect(typeof r?.process).toBe('function');
    expect(r?.prepare).toBeUndefined();
  });

  it('returns undefined for unknown tool-id', () => {
    expect(getRuntime('does-not-exist')).toBeUndefined();
  });

  it('exports the underlying registry for test-only override', () => {
    expect(toolRuntimeRegistry).toBeDefined();
    expect(typeof toolRuntimeRegistry).toBe('object');
  });
});
```

- [ ] **Step 3: Run tests — verify they fail**

Run: `npx vitest run tests/lib/tools/tool-runtime-registry.test.ts`
Expected: 3 failures, "tool-runtime-registry not found".

- [ ] **Step 4: Create the new registry module**

Create `src/lib/tools/tool-runtime-registry.ts`:

```typescript
import { processWebp } from './process-webp';

/**
 * Client-side runtime registry for FileTools.
 *
 * Astro serializes island props to JSON during SSR. Functions on the tool
 * config (`process`, `prepare`) are dropped to `null` on the client. The
 * FileTool component therefore looks up its runtime by `config.id` from
 * this table — plain ES-module imports the bundler can include.
 *
 * Each entry holds the dispatchers for ONE tool:
 *   - `process` — required, the actual conversion
 *   - `prepare` — optional, lazy-load step (e.g. ML model download)
 *
 * Adding a new file-tool requires three edits:
 *   1. Pure module(s) under `src/lib/tools/`
 *   2. Tool config in `src/lib/tool-registry.ts`
 *   3. Runtime entry below
 */

export type ProcessFn = (
  input: Uint8Array,
  config?: Record<string, unknown>,
) => Uint8Array | Promise<Uint8Array>;

export type PrepareFn = (
  onProgress: (e: { loaded: number; total: number }) => void,
) => Promise<void>;

export interface ToolRuntime {
  process: ProcessFn;
  prepare?: PrepareFn;
}

export const toolRuntimeRegistry: Record<string, ToolRuntime> = {
  'png-jpg-to-webp': {
    process: (input, config) =>
      processWebp(input, {
        quality: typeof config?.quality === 'number' ? config.quality : 85,
      }),
  },
};

export function getRuntime(toolId: string): ToolRuntime | undefined {
  return toolRuntimeRegistry[toolId];
}
```

- [ ] **Step 5: Update consumers**

For each file found in Step 1, replace:
- `from './process-registry'` → `from './tool-runtime-registry'`
- `getProcessor(...)` → `getRuntime(...)?.process`
- `processRegistry[...]` → `toolRuntimeRegistry[...].process`

In `src/components/tools/FileTool.svelte`, the call becomes:
```typescript
import { getRuntime } from '../../lib/tools/tool-runtime-registry';
// ...
const runtime = getRuntime(config.id);
const processor = runtime?.process;
```

- [ ] **Step 6: Delete old file**

Run: `rm src/lib/tools/process-registry.ts`

- [ ] **Step 7: Run all tests + check**

Run: `npm test -- --run && npm run check`
Expected: all pass, 0/0/0. The new registry test passes, the old `process-registry.ts` is gone, FileTool still uses the renamed import.

- [ ] **Step 8: Commit**

```bash
git add src/ tests/
git commit -m "$(cat <<'EOF'
refactor(tools): rename process-registry -> tool-runtime-registry, add prepare slot

Single registry per tool-id with shape { process, prepare? }. Resolves
spec open question §4.3. webp-konverter behavior unchanged. Enables ML
tools to register their lazy-load step alongside their processor.

Rulebooks-Read: PROJECT, CONVENTIONS

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `remove-background.ts` — pure ML module

**Files:**
- Create: `src/lib/tools/remove-background.ts`
- Test: `tests/lib/tools/remove-background.test.ts`

**Reference:** Spec §5. Test mocks transformers.js so the real model is never loaded in tests.

- [ ] **Step 1: Write failing tests with mocked transformers.js**

Create `tests/lib/tools/remove-background.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockMask = new Float32Array(64 * 64).fill(0.8);
const mockPipe = vi.fn(async () => ({ mask: mockMask, width: 64, height: 64 }));
const pipelineSpy = vi.fn(async (_task: string, _model: string, _opts: unknown) => mockPipe);

vi.mock('@huggingface/transformers', () => ({
  pipeline: pipelineSpy,
}));

function makeImageBytes(): Uint8Array {
  // Minimal PNG header so createImageBitmap doesn't reject in jsdom mocks.
  return new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
}

describe('remove-background pure module', () => {
  beforeEach(() => {
    vi.resetModules();
    pipelineSpy.mockClear();
    mockPipe.mockClear();
    // Stub createImageBitmap (jsdom 25 lacks it)
    vi.stubGlobal('createImageBitmap', vi.fn(async () => ({
      width: 64, height: 64, close: vi.fn(),
    })));
    // Stub OffscreenCanvas
    const ctx = {
      drawImage: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(64 * 64 * 4).fill(255), width: 64, height: 64 })),
      putImageData: vi.fn(),
      fillRect: vi.fn(),
      set fillStyle(_v: string) { /* no-op */ },
      set globalCompositeOperation(_v: string) { /* no-op */ },
    };
    class FakeOffscreenCanvas {
      width: number; height: number;
      constructor(w: number, h: number) { this.width = w; this.height = h; }
      getContext() { return ctx; }
      async convertToBlob(opts?: { type?: string }) {
        const type = opts?.type ?? 'image/png';
        const bytes =
          type === 'image/png' ? new Uint8Array([137, 80, 78, 71]) :
          type === 'image/webp' ? new Uint8Array([0x52, 0x49, 0x46, 0x46]) :
          new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]);
        return new Blob([bytes as BlobPart], { type });
      }
    }
    vi.stubGlobal('OffscreenCanvas', FakeOffscreenCanvas);
    // navigator.gpu absent → forces wasm path in detectDevice
    vi.stubGlobal('navigator', { ...globalThis.navigator, gpu: undefined });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('prepareBackgroundRemovalModel calls pipeline once on first invocation', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await m.prepareBackgroundRemovalModel(() => undefined);
    expect(pipelineSpy).toHaveBeenCalledTimes(1);
  });

  it('prepareBackgroundRemovalModel is idempotent on second invocation', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await m.prepareBackgroundRemovalModel(() => undefined);
    await m.prepareBackgroundRemovalModel(() => undefined);
    expect(pipelineSpy).toHaveBeenCalledTimes(1);
  });

  it('prepareBackgroundRemovalModel passes onProgress as progress_callback', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    const onProgress = vi.fn();
    await m.prepareBackgroundRemovalModel(onProgress);
    const opts = pipelineSpy.mock.calls[0][2] as Record<string, unknown>;
    expect(opts.progress_callback).toBe(onProgress);
  });

  it('removeBackground throws when not prepared', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await expect(m.removeBackground(makeImageBytes(), { format: 'png' })).rejects.toThrow(/prepare/i);
  });

  it('removeBackground returns PNG bytes after prepare', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await m.prepareBackgroundRemovalModel(() => undefined);
    const out = await m.removeBackground(makeImageBytes(), { format: 'png' });
    expect(out[0]).toBe(137);
    expect(out[1]).toBe(80);
  });

  it('removeBackground returns WebP bytes when format=webp', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await m.prepareBackgroundRemovalModel(() => undefined);
    const out = await m.removeBackground(makeImageBytes(), { format: 'webp' });
    expect(out[0]).toBe(0x52); // 'R'
    expect(out[1]).toBe(0x49); // 'I'
  });

  it('removeBackground returns JPG bytes when format=jpg', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await m.prepareBackgroundRemovalModel(() => undefined);
    const out = await m.removeBackground(makeImageBytes(), { format: 'jpg' });
    expect(out[0]).toBe(0xFF);
    expect(out[1]).toBe(0xD8);
  });

  it('reencodeLastResult re-encodes without re-running inference', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await m.prepareBackgroundRemovalModel(() => undefined);
    await m.removeBackground(makeImageBytes(), { format: 'png' });
    expect(mockPipe).toHaveBeenCalledTimes(1);
    const out = await m.reencodeLastResult('webp');
    expect(mockPipe).toHaveBeenCalledTimes(1); // still 1
    expect(out[0]).toBe(0x52);
  });

  it('reencodeLastResult throws when no result is cached', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await expect(m.reencodeLastResult('png')).rejects.toThrow(/no.*result/i);
  });

  it('clearLastResult removes the cached canvas', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    await m.prepareBackgroundRemovalModel(() => undefined);
    await m.removeBackground(makeImageBytes(), { format: 'png' });
    m.clearLastResult();
    await expect(m.reencodeLastResult('png')).rejects.toThrow(/no.*result/i);
  });

  it('isPrepared returns false before prepare and true after', async () => {
    const m = await import('../../../src/lib/tools/remove-background');
    expect(m.isPrepared()).toBe(false);
    await m.prepareBackgroundRemovalModel(() => undefined);
    expect(m.isPrepared()).toBe(true);
  });

  it('prepareBackgroundRemovalModel rejects with StallError when no progress for stallTimeoutMs', async () => {
    vi.useFakeTimers();
    // Replace pipelineSpy with one that hangs and never calls onProgress
    pipelineSpy.mockImplementationOnce(
      () => new Promise(() => undefined) as Promise<typeof mockPipe>,
    );
    const m = await import('../../../src/lib/tools/remove-background');
    const p = m.prepareBackgroundRemovalModel(() => undefined, { stallTimeoutMs: 1000 });
    await vi.advanceTimersByTimeAsync(1100);
    await expect(p).rejects.toThrow(/stall/i);
    vi.useRealTimers();
  });

  it('progress events reset the stall watchdog', async () => {
    vi.useFakeTimers();
    let onProgressCb: ((e: ProgressEvent) => void) | undefined;
    pipelineSpy.mockImplementationOnce(async (_t, _m, opts) => {
      onProgressCb = (opts as { progress_callback: (e: ProgressEvent) => void }).progress_callback;
      // Resolve only after we get a tick
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (onProgressCb) onProgressCb({ loaded: 50, total: 100 });
        }, 500);
        setTimeout(() => { clearInterval(interval); resolve(); }, 2500);
      });
      return mockPipe;
    });
    const m = await import('../../../src/lib/tools/remove-background');
    const onProgress = vi.fn();
    const p = m.prepareBackgroundRemovalModel(onProgress, { stallTimeoutMs: 1000 });
    await vi.advanceTimersByTimeAsync(3000);
    await expect(p).resolves.toBeUndefined();
    vi.useRealTimers();
  });
});

type ProgressEvent = { loaded: number; total: number };
```

- [ ] **Step 2: Run tests — verify they fail**

Run: `npx vitest run tests/lib/tools/remove-background.test.ts`
Expected: 13 failures (module doesn't exist).

- [ ] **Step 3: Implement `remove-background.ts`**

Create `src/lib/tools/remove-background.ts`:

```typescript
/**
 * BG-Remover pure module.
 *
 * Singleton-cached pipeline (Transformers.js v4 + onnx-community/BEN2-ONNX).
 * Module is dynamic-imported by the FileTool runtime so the Hauptbundle
 * stays under 100 KB gzip — this file itself is fine to import statically.
 *
 * Cache lifetime: pipeline + lastResultCanvas live at module scope. The
 * FileTool component calls `clearLastResult()` on its reset path to avoid
 * leaking large bitmaps when the user starts over.
 */

export type RemoveBackgroundFormat = 'png' | 'webp' | 'jpg';

export interface RemoveBackgroundOpts {
  format: RemoveBackgroundFormat;
}

export interface ProgressEvent {
  loaded: number;
  total: number;
}

export interface PrepareOpts {
  /**
   * Watchdog timeout in ms. If no progress event arrives within this window
   * the pipeline-promise rejects with `StallError`. Defaults to 120_000.
   * Spec §10.
   */
  stallTimeoutMs?: number;
}

export class StallError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StallError';
  }
}

type Pipe = (input: unknown, opts?: unknown) => Promise<{ mask: Float32Array; width?: number; height?: number }>;

let pipelinePromise: Promise<Pipe> | null = null;
let pipelineReady = false;
let lastResultCanvas: OffscreenCanvas | null = null;

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

export function isPrepared(): boolean {
  return pipelineReady;
}

export async function prepareBackgroundRemovalModel(
  onProgress: (e: ProgressEvent) => void,
  opts: PrepareOpts = {},
): Promise<void> {
  if (pipelinePromise) {
    await pipelinePromise;
    return;
  }
  const stallTimeoutMs = opts.stallTimeoutMs ?? 120_000;

  pipelinePromise = (async () => {
    const { pipeline } = await import('@huggingface/transformers');
    const device = await detectDevice();

    let watchdog: ReturnType<typeof setTimeout> | null = null;
    let stallReject: ((err: Error) => void) | null = null;

    const wrappedProgress = (e: ProgressEvent) => {
      if (watchdog) clearTimeout(watchdog);
      watchdog = setTimeout(() => {
        stallReject?.(new StallError(
          `Model download stalled — no progress for ${stallTimeoutMs}ms.`,
        ));
      }, stallTimeoutMs);
      onProgress(e);
    };
    // Start the watchdog before the first progress event arrives.
    watchdog = setTimeout(() => {
      stallReject?.(new StallError(
        `Model download stalled — no progress for ${stallTimeoutMs}ms.`,
      ));
    }, stallTimeoutMs);

    try {
      const pipe = await new Promise<Pipe>((resolve, reject) => {
        stallReject = reject;
        pipeline('image-segmentation', 'onnx-community/BEN2-ONNX', {
          progress_callback: wrappedProgress,
          device,
        })
          .then((p) => resolve(p as unknown as Pipe))
          .catch(reject);
      });
      return pipe;
    } finally {
      if (watchdog) clearTimeout(watchdog);
    }
  })();

  try {
    await pipelinePromise;
    pipelineReady = true;
  } catch (err) {
    // Reset so a subsequent retry actually retries.
    pipelinePromise = null;
    pipelineReady = false;
    throw err;
  }
}

function formatToMime(format: RemoveBackgroundFormat): string {
  switch (format) {
    case 'png': return 'image/png';
    case 'webp': return 'image/webp';
    case 'jpg': return 'image/jpeg';
  }
}

async function encodeCanvas(canvas: OffscreenCanvas, format: RemoveBackgroundFormat): Promise<Uint8Array> {
  // JPG: composite white background under any alpha pixels before encoding.
  if (format === 'jpg') {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Cast: ctx is OffscreenCanvasRenderingContext2D in real browsers.
      const c = ctx as unknown as CanvasRenderingContext2D;
      c.globalCompositeOperation = 'destination-over';
      c.fillStyle = 'white';
      c.fillRect(0, 0, canvas.width, canvas.height);
      c.globalCompositeOperation = 'source-over';
    }
  }
  const blob = await canvas.convertToBlob({ type: formatToMime(format), quality: 0.92 });
  return new Uint8Array(await blob.arrayBuffer());
}

export async function removeBackground(
  input: Uint8Array,
  opts: RemoveBackgroundOpts,
): Promise<Uint8Array> {
  if (!pipelinePromise) {
    throw new Error('Pipeline not prepared — prepareBackgroundRemovalModel() must run first.');
  }
  const pipe = await pipelinePromise;

  const blob = new Blob([input as BlobPart]);
  const bitmap = await createImageBitmap(blob);

  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('OffscreenCanvas 2d context unavailable.');
  ctx.drawImage(bitmap as unknown as CanvasImageSource, 0, 0);

  const segmentation = await pipe(bitmap);
  const mask = segmentation.mask;
  const w = canvas.width;
  const h = canvas.height;
  const img = ctx.getImageData(0, 0, w, h);
  // Apply mask to alpha channel. Mask is 0..1 float, stored row-major matching image.
  for (let i = 0; i < mask.length; i++) {
    img.data[i * 4 + 3] = Math.round(mask[i] * 255);
  }
  ctx.putImageData(img, 0, 0);

  lastResultCanvas = canvas;
  return encodeCanvas(canvas, opts.format);
}

export async function reencodeLastResult(
  format: RemoveBackgroundFormat,
): Promise<Uint8Array> {
  if (!lastResultCanvas) {
    throw new Error('No cached result to re-encode.');
  }
  return encodeCanvas(lastResultCanvas, format);
}

export function clearLastResult(): void {
  lastResultCanvas = null;
}
```

- [ ] **Step 4: Run tests — verify they pass**

Run: `npx vitest run tests/lib/tools/remove-background.test.ts`
Expected: 13/13 pass.

If JPG test fails because the per-instance canvas mock's getContext returns the same mock for all instances (so the destination-over fillRect call doesn't change behaviour), confirm the test still asserts `bytes[0] === 0xFF` based on the mocked `convertToBlob` returning JPG-magic for that type — it should pass independent of fillRect logic.

- [ ] **Step 5: Full suite + check**

Run: `npm test -- --run && npm run check`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add src/lib/tools/remove-background.ts tests/lib/tools/remove-background.test.ts
git commit -m "$(cat <<'EOF'
feat(tools): add remove-background pure module (Transformers.js + BEN2)

Singleton-cached pipeline with WebGPU detection + WASM fallback. Format
chooser (PNG/WebP/JPG) re-encodes from cached canvas — no re-inference.
Module-scope lastResultCanvas; explicit clearLastResult() on reset.
Stall watchdog (default 120s, configurable via stallTimeoutMs) rejects
the prepare-promise with typed StallError if no progress event arrives
within the window — spec §10. isPrepared() exposed for component-mount
state-restoration (no UI flash on revisit).

Rulebooks-Read: PROJECT, CONVENTIONS

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: FileTool — dynamic format + format-chooser UI

**Files:**
- Modify: `src/components/tools/FileTool.svelte`
- Test: `tests/components/tools/filetool-format.test.ts`

**Reference:** Spec §6.2 (Kontext-Refactor block).

**Goal:** Replace hardcoded `'image/webp'` MIME and `.webp` extension with state driven by `config.defaultFormat` (default `'webp'` for backwards-compat). Render a Format-Chooser radio-group in `done`-phase that re-encodes via runtime's optional `reencodeLastResult` (only used by tools that expose one — for now, only `remove-background`; the dispatch is generalized via the runtime registry's optional `reencode` field). Apply `config.filenameSuffix` (e.g. `'_no-bg'`) to download name when set. Hide quality slider when `config.showQuality === false`.

- [ ] **Step 1: Extend `ToolRuntime` with optional reencode field**

Edit `src/lib/tools/tool-runtime-registry.ts` — add optional field:

```typescript
export type ReencodeFn = (format: string) => Promise<Uint8Array>;

export interface ToolRuntime {
  process: ProcessFn;
  prepare?: PrepareFn;
  reencode?: ReencodeFn;
}
```

(Webp-konverter does not implement reencode; that's fine.)

- [ ] **Step 2: Write failing tests**

Create `tests/components/tools/filetool-format.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import FileTool from '../../../src/components/tools/FileTool.svelte';
import { toolRuntimeRegistry } from '../../../src/lib/tools/tool-runtime-registry';
import type { FileToolConfig } from '../../../src/lib/tools/schemas';

function makeFile(name: string, type: string, sizeBytes: number): File {
  const buf = new Uint8Array(sizeBytes);
  const file = new File([buf], name, { type });
  Object.defineProperty(file, 'arrayBuffer', {
    value: () => Promise.resolve(buf.buffer),
    configurable: true,
  });
  return file;
}

const FORMATS_CFG: FileToolConfig = {
  id: 'test-format-tool',
  type: 'file-tool',
  categoryId: 'bilder',
  accept: ['image/png'],
  maxSizeMb: 5,
  defaultFormat: 'png',
  process: async () => new Uint8Array([137, 80, 78, 71]),
};

describe('FileTool — dynamic format + format-chooser', () => {
  let host: HTMLElement;
  let cmp: ReturnType<typeof mount> | undefined;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:mock'), revokeObjectURL: vi.fn() });
    toolRuntimeRegistry['test-format-tool'] = {
      process: async () => new Uint8Array([137, 80, 78, 71]),
      reencode: vi.fn(async (fmt: string) => {
        if (fmt === 'webp') return new Uint8Array([0x52, 0x49, 0x46, 0x46]);
        if (fmt === 'jpg') return new Uint8Array([0xFF, 0xD8]);
        return new Uint8Array([137, 80, 78, 71]);
      }),
    };
  });

  afterEach(() => {
    if (cmp) unmount(cmp);
    host.remove();
    delete toolRuntimeRegistry['test-format-tool'];
    vi.unstubAllGlobals();
  });

  async function flushAsync(ticks = 6) {
    for (let i = 0; i < ticks; i++) {
      await Promise.resolve();
      flushSync();
    }
  }

  it('uses defaultFormat from config for download extension', async () => {
    cmp = mount(FileTool, { target: host, props: { config: FORMATS_CFG } });
    flushSync();
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('photo.png', 'image/png', 100)] });
    input.dispatchEvent(new Event('change'));
    await flushAsync();
    const dl = host.querySelector('[data-testid="filetool-download"]') as HTMLAnchorElement;
    expect(dl.getAttribute('download')).toMatch(/\.png$/);
  });

  it('renders format-chooser in done-phase when runtime has reencode', async () => {
    cmp = mount(FileTool, { target: host, props: { config: FORMATS_CFG } });
    flushSync();
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('photo.png', 'image/png', 100)] });
    input.dispatchEvent(new Event('change'));
    await flushAsync();
    expect(host.querySelector('[data-testid="filetool-format-chooser"]')).not.toBeNull();
    expect(host.querySelector('[data-testid="filetool-format-png"]')).not.toBeNull();
    expect(host.querySelector('[data-testid="filetool-format-webp"]')).not.toBeNull();
    expect(host.querySelector('[data-testid="filetool-format-jpg"]')).not.toBeNull();
  });

  it('format switch triggers reencode + updates download extension', async () => {
    cmp = mount(FileTool, { target: host, props: { config: FORMATS_CFG } });
    flushSync();
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('photo.png', 'image/png', 100)] });
    input.dispatchEvent(new Event('change'));
    await flushAsync();

    const webpRadio = host.querySelector('[data-testid="filetool-format-webp"]') as HTMLInputElement;
    webpRadio.checked = true;
    webpRadio.dispatchEvent(new Event('change', { bubbles: true }));
    await flushAsync();

    const reencode = toolRuntimeRegistry['test-format-tool'].reencode as ReturnType<typeof vi.fn>;
    expect(reencode).toHaveBeenCalledWith('webp');
    const dl = host.querySelector('[data-testid="filetool-download"]') as HTMLAnchorElement;
    expect(dl.getAttribute('download')).toMatch(/\.webp$/);
  });

  it('omits format-chooser when runtime has no reencode', async () => {
    delete toolRuntimeRegistry['test-format-tool'].reencode;
    cmp = mount(FileTool, { target: host, props: { config: FORMATS_CFG } });
    flushSync();
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('photo.png', 'image/png', 100)] });
    input.dispatchEvent(new Event('change'));
    await flushAsync();
    expect(host.querySelector('[data-testid="filetool-format-chooser"]')).toBeNull();
  });

  it('applies filenameSuffix to download name when set', async () => {
    const suffixCfg: FileToolConfig = { ...FORMATS_CFG, filenameSuffix: '_no-bg' };
    cmp = mount(FileTool, { target: host, props: { config: suffixCfg } });
    flushSync();
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('photo.png', 'image/png', 100)] });
    input.dispatchEvent(new Event('change'));
    await flushAsync();
    const dl = host.querySelector('[data-testid="filetool-download"]') as HTMLAnchorElement;
    expect(dl.getAttribute('download')).toBe('photo_no-bg.png');
  });

  it('hides quality slider when showQuality is false', async () => {
    const noQCfg: FileToolConfig = { ...FORMATS_CFG, showQuality: false };
    cmp = mount(FileTool, { target: host, props: { config: noQCfg } });
    flushSync();
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('photo.png', 'image/png', 100)] });
    input.dispatchEvent(new Event('change'));
    await flushAsync();
    expect(host.querySelector('[data-testid="filetool-quality"]')).toBeNull();
  });

  it('renders quality slider by default (showQuality omitted)', async () => {
    cmp = mount(FileTool, { target: host, props: { config: FORMATS_CFG } });
    flushSync();
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('photo.png', 'image/png', 100)] });
    input.dispatchEvent(new Event('change'));
    await flushAsync();
    expect(host.querySelector('[data-testid="filetool-quality"]')).not.toBeNull();
  });
});
```

- [ ] **Step 3: Run tests — verify they fail**

Run: `npx vitest run tests/components/tools/filetool-format.test.ts`
Expected: 8 failures.

- [ ] **Step 4: Refactor FileTool — add format state, helpers, format-chooser markup**

Edit `src/components/tools/FileTool.svelte`. Key changes:

1. Replace hardcoded `.webp` and `'image/webp'` with helper-derived values.
2. Add `outputFormat` state initialized from `config.defaultFormat ?? 'webp'`.
3. Add `formatToMime` and `formatToExt` helpers.
4. Add `<form>`-style radio-group block in `done`-phase, only rendered when `runtime?.reencode` exists.
5. Add `onFormatChange` handler that calls `runtime.reencode(format)`, updates `outputUrl` + `outputSize`, swaps `outputFormat`.

Concrete edit sketch (apply by reading current file and editing the relevant blocks):

```typescript
// Replace existing 'image/webp' literal at line 79 with:
const blob = new Blob([outBytes as BlobPart], { type: formatToMime(outputFormat) });

// Replace `replaceExt(sourceName, '.webp')` derived (line 21) with one that
// applies the optional filenameSuffix (e.g. '_no-bg' → 'photo_no-bg.png'):
const downloadName = $derived(buildDownloadName(sourceName, outputFormat, config.filenameSuffix));

// Add at top:
let outputFormat = $state<string>(config.defaultFormat ?? 'webp');
function formatToMime(f: string): string {
  switch (f) { case 'png': return 'image/png'; case 'jpg': return 'image/jpeg'; case 'webp': return 'image/webp'; default: return 'image/webp'; }
}
function formatToExt(f: string): string {
  switch (f) { case 'png': return 'png'; case 'jpg': return 'jpg'; case 'webp': return 'webp'; default: return 'webp'; }
}
function buildDownloadName(name: string, format: string, suffix?: string): string {
  const ext = '.' + formatToExt(format);
  const dot = name.lastIndexOf('.');
  const stem = dot > 0 ? name.slice(0, dot) : name;
  return `${stem}${suffix ?? ''}${ext}`;
}

// In script, also resolve runtime once:
const runtime = $derived(getRuntime(config.id));
const processor = $derived(runtime?.process);
const reencoder = $derived(runtime?.reencode);

// Add format-change handler:
async function onFormatChange(newFormat: string) {
  if (!reencoder) return;
  outputFormat = newFormat;
  try {
    const newBytes = await reencoder(newFormat);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    const blob = new Blob([newBytes as BlobPart], { type: formatToMime(newFormat) });
    outputUrl = URL.createObjectURL(blob);
    outputSize = newBytes.byteLength;
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : 'Format-Wechsel fehlgeschlagen.';
    phase = 'error';
  }
}
```

Markup additions in `done`-phase block (after the size-rows, before `.result`):

```svelte
{#if phase === 'done' && reencoder}
  <fieldset class="formats" data-testid="filetool-format-chooser">
    <legend class="formats__legend">Format</legend>
    <label class="formats__opt">
      <input type="radio" name="filetool-format" value="png" data-testid="filetool-format-png"
        checked={outputFormat === 'png'} onchange={() => onFormatChange('png')} />
      <span>PNG <span class="formats__hint">(Transparenz)</span></span>
    </label>
    <label class="formats__opt">
      <input type="radio" name="filetool-format" value="webp" data-testid="filetool-format-webp"
        checked={outputFormat === 'webp'} onchange={() => onFormatChange('webp')} />
      <span>WebP <span class="formats__hint">(Transparenz)</span></span>
    </label>
    <label class="formats__opt">
      <input type="radio" name="filetool-format" value="jpg" data-testid="filetool-format-jpg"
        checked={outputFormat === 'jpg'} onchange={() => onFormatChange('jpg')} />
      <span>JPG <span class="formats__hint">(weißer Hintergrund)</span></span>
    </label>
  </fieldset>
{/if}
```

Add minimal CSS (token-only) for `.formats`, `.formats__legend`, `.formats__opt`, `.formats__hint` — keep consistent with existing `.row` / `.quality` styles (small font, mono for hints, no rounded-full).

Also wrap the existing `.quality` slider markup in a conditional so it disappears when a tool opts out:

```svelte
{#if (config.showQuality ?? true)}
  <div class="quality" data-testid="filetool-quality">
    <!-- existing slider markup unchanged -->
  </div>
{/if}
```

Add `data-testid="filetool-quality"` to the wrapper if not already present so the new tests can assert presence/absence.

- [ ] **Step 5: Update existing FileTool tests if needed**

Run: `npx vitest run tests/components/tools/filetool.test.ts`
Expected: previous tests still pass — they use `webp-konverter` which has no `defaultFormat` (defaults to `'webp'`) and no `reencode`, so format-chooser is hidden.

If failures appear, fix tests by aligning with the new state (don't change behavior).

- [ ] **Step 6: Run new tests — verify pass**

Run: `npx vitest run tests/components/tools/filetool-format.test.ts`
Expected: 8/8 pass.

- [ ] **Step 7: Full suite + check + commit**

Run: `npm test -- --run && npm run check`
Expected: all green.

```bash
git add src/components/tools/FileTool.svelte src/lib/tools/tool-runtime-registry.ts tests/components/tools/filetool-format.test.ts
git commit -m "$(cat <<'EOF'
feat(filetool): dynamic output format + format-chooser + filename suffix + quality opt-out

Replaces hardcoded image/webp with config.defaultFormat-driven state.
Format-chooser radio-group renders only when the runtime exposes a
reencode function (BG-Remover yes, webp-konverter no). Optional
filenameSuffix appended to download stem (e.g. 'photo_no-bg.png').
Quality slider hidden when config.showQuality === false (tools that
hardcode quality, like BG-Remover, opt out). Tokens-only.

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: FileTool — `preparing` phase

**Files:**
- Modify: `src/components/tools/FileTool.svelte`
- Test: `tests/components/tools/filetool-prepare.test.ts`

**Reference:** Spec §6.2 (preparing-state-UI block).

- [ ] **Step 1: Write failing tests**

Create `tests/components/tools/filetool-prepare.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import FileTool from '../../../src/components/tools/FileTool.svelte';
import { toolRuntimeRegistry } from '../../../src/lib/tools/tool-runtime-registry';
import type { FileToolConfig } from '../../../src/lib/tools/schemas';

function makeFile(name: string, type: string, sizeBytes: number): File {
  const buf = new Uint8Array(sizeBytes);
  const file = new File([buf], name, { type });
  Object.defineProperty(file, 'arrayBuffer', { value: () => Promise.resolve(buf.buffer), configurable: true });
  return file;
}

let prepareCalls = 0;
let prepareImpl: () => Promise<void> = async () => undefined;

const PREP_CFG: FileToolConfig = {
  id: 'test-prepare-tool',
  type: 'file-tool',
  categoryId: 'bilder',
  accept: ['image/png'],
  maxSizeMb: 5,
  prepare: async () => undefined,
  process: async () => new Uint8Array([1]),
};

describe('FileTool — preparing phase', () => {
  let host: HTMLElement;
  let cmp: ReturnType<typeof mount> | undefined;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:mock'), revokeObjectURL: vi.fn() });
    prepareCalls = 0;
    prepareImpl = async () => undefined;
    let preparedFlag = false;
    toolRuntimeRegistry['test-prepare-tool'] = {
      process: async () => new Uint8Array([1]),
      prepare: async (onProgress) => {
        prepareCalls++;
        onProgress({ loaded: 50, total: 110 });
        await prepareImpl();
        preparedFlag = true;
      },
      isPrepared: () => preparedFlag,
      clearLastResult: () => undefined,
    };
  });

  afterEach(() => {
    if (cmp) unmount(cmp);
    host.remove();
    delete toolRuntimeRegistry['test-prepare-tool'];
    vi.unstubAllGlobals();
  });

  async function flushAsync(ticks = 8) {
    for (let i = 0; i < ticks; i++) {
      await Promise.resolve();
      flushSync();
    }
  }

  it('phase passes idle -> preparing -> converting -> done on first upload', async () => {
    let resolveImpl: () => void = () => undefined;
    prepareImpl = () => new Promise<void>((res) => { resolveImpl = res; });
    cmp = mount(FileTool, { target: host, props: { config: PREP_CFG } });
    flushSync();
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('a.png', 'image/png', 10)] });
    input.dispatchEvent(new Event('change'));
    await flushAsync();
    expect(host.querySelector('[data-testid="filetool-preparing"]')).not.toBeNull();
    resolveImpl();
    await flushAsync();
    expect(host.querySelector('[data-testid="filetool-status"]')).not.toBeNull();
    expect(host.querySelector('[data-testid="filetool-download"]')).not.toBeNull();
  });

  it('skips preparing on second upload (cache path)', async () => {
    cmp = mount(FileTool, { target: host, props: { config: PREP_CFG } });
    flushSync();
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('a.png', 'image/png', 10)] });
    input.dispatchEvent(new Event('change'));
    await flushAsync();
    expect(prepareCalls).toBe(1);

    // Reset and upload again
    (host.querySelector('[data-testid="filetool-reset"]') as HTMLButtonElement).click();
    await flushAsync();
    Object.defineProperty(input, 'files', { value: [makeFile('b.png', 'image/png', 10)] });
    input.dispatchEvent(new Event('change'));
    await flushAsync();
    expect(prepareCalls).toBe(1); // not called again
  });

  it('renders progress label inside preparing state', async () => {
    let resolveImpl: () => void = () => undefined;
    prepareImpl = () => new Promise<void>((res) => { resolveImpl = res; });
    cmp = mount(FileTool, { target: host, props: { config: PREP_CFG } });
    flushSync();
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('a.png', 'image/png', 10)] });
    input.dispatchEvent(new Event('change'));
    await flushAsync();
    const label = host.querySelector('[data-testid="loader-progress-label"]');
    expect(label?.textContent).toMatch(/MB|%/);
    resolveImpl();
    await flushAsync();
  });

  it('prepare reject -> error phase with retry button', async () => {
    prepareImpl = async () => { throw new Error('Netz weg'); };
    cmp = mount(FileTool, { target: host, props: { config: PREP_CFG } });
    flushSync();
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('a.png', 'image/png', 10)] });
    input.dispatchEvent(new Event('change'));
    await flushAsync();
    expect(host.querySelector('[data-testid="filetool-error"]')).not.toBeNull();
  });

  it('configs without prepare go straight from idle to converting (no preparing UI)', async () => {
    delete toolRuntimeRegistry['test-prepare-tool'].prepare;
    cmp = mount(FileTool, { target: host, props: { config: { ...PREP_CFG, prepare: undefined } } });
    flushSync();
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [makeFile('a.png', 'image/png', 10)] });
    input.dispatchEvent(new Event('change'));
    await flushAsync();
    expect(host.querySelector('[data-testid="filetool-preparing"]')).toBeNull();
    expect(host.querySelector('[data-testid="filetool-download"]')).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

Run: `npx vitest run tests/components/tools/filetool-prepare.test.ts`
Expected: 5 failures.

- [ ] **Step 3: Implement preparing phase in FileTool**

Edit `src/components/tools/FileTool.svelte`:

1. Add `'preparing'` to `Phase` union.
2. Add module-scope state:
   ```typescript
   let prepareProgress = $state<{ loaded: number; total: number }>({ loaded: 0, total: 0 });
   ```
   No component-local `prepared` flag — the runtime is the source of truth via its optional `isPrepared()` selector. The runtime registry exposes this for tools that have it (BG-Remover does); generic tools without lazy-load skip preparing entirely because `runtime.prepare` is undefined.
3. Extend `ToolRuntime` with optional `isPrepared` selector:
   ```typescript
   export interface ToolRuntime {
     process: ProcessFn;
     prepare?: PrepareFn;
     reencode?: ReencodeFn;
     isPrepared?: () => boolean;
   }
   ```
   The BG-Remover runtime entry exposes `isPrepared: () => isPrepared()` (re-exported from `remove-background.ts`). webp-konverter has none.
4. In `processFile`, after MIME/Size validation but before `phase = 'converting'`:
   ```typescript
   const alreadyReady = runtime?.isPrepared?.() ?? false;
   if (runtime?.prepare && !alreadyReady) {
     phase = 'preparing';
     try {
       await runtime.prepare((e) => { prepareProgress = e; });
     } catch (err) {
       errorMessage = err instanceof Error ? `Modell-Lade-Fehler: ${err.message}` : 'Modell-Lade-Fehler.';
       phase = 'error';
       return;
     }
   }
   phase = 'converting';
   ```
   This ensures revisits never flash the preparing UI: when the user navigates away and back, the runtime singleton is still ready, `isPrepared()` returns true, and the component skips straight to converting.
5. Reset path clears `prepareProgress` AND calls `runtime?.clearLastResult?.()` if exposed (so the cached canvas in `remove-background.ts` is dropped). Add `clearLastResult?: () => void` to `ToolRuntime` for this.
5. Add markup block for preparing-phase (uses `<Loader />`):
   ```svelte
   {#if phase === 'preparing'}
     <div class="preparing" data-testid="filetool-preparing" aria-live="polite">
       <p class="preparing__title">Lädt einmalig Modell …</p>
       <Loader
         variant="progress"
         value={prepareProgress.total > 0 ? prepareProgress.loaded / prepareProgress.total : 0}
         label={prepareProgress.total > 0
           ? `${Math.round(prepareProgress.loaded / 1024 / 1024)}\u00A0/\u00A0${Math.round(prepareProgress.total / 1024 / 1024)}\u00A0MB`
           : ''}
       />
     </div>
   {/if}
   ```
6. Import: `import Loader from '../Loader.svelte';`
7. Hide dropzone in preparing-phase: change `{#if phase === 'idle' || phase === 'error'}` block check (already excludes preparing).
8. Add minimal `.preparing` styles (token-only).

- [ ] **Step 4: Run new tests — verify pass**

Run: `npx vitest run tests/components/tools/filetool-prepare.test.ts`
Expected: 5/5 pass.

- [ ] **Step 5: Full suite + check + commit**

Run: `npm test -- --run && npm run check`
Expected: all green.

```bash
git add src/components/tools/FileTool.svelte tests/components/tools/filetool-prepare.test.ts
git commit -m "$(cat <<'EOF'
feat(filetool): add preparing phase for ML lazy-load tools

Phase sequence idle -> preparing -> converting -> done | error when
config.prepare exists. Singleton-cached: second upload skips preparing.
Progress label uses NBSP between value and unit. Loader renders inside
the same card (no CLS).

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: FileTool — input methods (clipboard + camera + HEIC pre-decode)

**Files:**
- Modify: `src/components/tools/FileTool.svelte`
- Test: `tests/components/tools/filetool-input-methods.test.ts`

**Reference:** Spec §6.2 (clipboard + camera blocks), §2.2 (HEIC).

- [ ] **Step 1: Write failing tests**

Create `tests/components/tools/filetool-input-methods.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import FileTool from '../../../src/components/tools/FileTool.svelte';
import { toolRuntimeRegistry } from '../../../src/lib/tools/tool-runtime-registry';
import type { FileToolConfig } from '../../../src/lib/tools/schemas';

const CFG: FileToolConfig = {
  id: 'test-input-tool',
  type: 'file-tool',
  categoryId: 'bilder',
  accept: ['image/png', 'image/jpeg', 'image/heic'],
  maxSizeMb: 5,
  process: async () => new Uint8Array([1]),
};

function patch(file: File, buf: Uint8Array): File {
  Object.defineProperty(file, 'arrayBuffer', { value: () => Promise.resolve(buf.buffer), configurable: true });
  return file;
}

async function flushAsync(ticks = 6) {
  for (let i = 0; i < ticks; i++) { await Promise.resolve(); flushSync(); }
}

describe('FileTool — input methods', () => {
  let host: HTMLElement;
  let cmp: ReturnType<typeof mount> | undefined;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:mock'), revokeObjectURL: vi.fn() });
    toolRuntimeRegistry['test-input-tool'] = { process: async () => new Uint8Array([1]) };
  });

  afterEach(() => {
    if (cmp) unmount(cmp);
    host.remove();
    delete toolRuntimeRegistry['test-input-tool'];
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('clipboard paste with image File item triggers process', async () => {
    cmp = mount(FileTool, { target: host, props: { config: CFG } });
    flushSync();
    const buf = new Uint8Array([1, 2, 3]);
    const file = patch(new File([buf], 'pasted.png', { type: 'image/png' }), buf);
    const item = { kind: 'file', type: 'image/png', getAsFile: () => file } as unknown as DataTransferItem;
    const ev = new Event('paste') as Event & { clipboardData: DataTransfer };
    Object.defineProperty(ev, 'clipboardData', { value: { items: [item] } });
    document.dispatchEvent(ev);
    await flushAsync();
    expect(host.querySelector('[data-testid="filetool-download"]')).not.toBeNull();
  });

  it('clipboard paste without image item is silently ignored', async () => {
    cmp = mount(FileTool, { target: host, props: { config: CFG } });
    flushSync();
    const item = { kind: 'string', type: 'text/plain', getAsFile: () => null } as unknown as DataTransferItem;
    const ev = new Event('paste') as Event & { clipboardData: DataTransfer };
    Object.defineProperty(ev, 'clipboardData', { value: { items: [item] } });
    document.dispatchEvent(ev);
    await flushAsync();
    expect(host.querySelector('[data-testid="filetool-download"]')).toBeNull();
    expect(host.querySelector('[data-testid="filetool-error"]')).toBeNull();
  });

  it('clipboard paste in non-idle phase is ignored', async () => {
    cmp = mount(FileTool, { target: host, props: { config: CFG } });
    flushSync();
    const buf = new Uint8Array([1]);
    // First paste -> done
    const file = patch(new File([buf], 'a.png', { type: 'image/png' }), buf);
    const item = { kind: 'file', type: 'image/png', getAsFile: () => file } as unknown as DataTransferItem;
    const ev1 = new Event('paste') as Event & { clipboardData: DataTransfer };
    Object.defineProperty(ev1, 'clipboardData', { value: { items: [item] } });
    document.dispatchEvent(ev1);
    await flushAsync();
    // Second paste while in done — should be ignored
    const ev2 = new Event('paste') as Event & { clipboardData: DataTransfer };
    Object.defineProperty(ev2, 'clipboardData', { value: { items: [item] } });
    document.dispatchEvent(ev2);
    await flushAsync();
    // Output URL should not have changed (still single createObjectURL call)
    expect((URL.createObjectURL as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1);
  });

  it('camera-capture button is rendered when cameraCapture is not false', () => {
    cmp = mount(FileTool, { target: host, props: { config: CFG } });
    flushSync();
    expect(host.querySelector('[data-testid="filetool-camera-input"]')).not.toBeNull();
  });

  it('camera-capture button is omitted when cameraCapture is false', () => {
    cmp = mount(FileTool, { target: host, props: { config: { ...CFG, cameraCapture: false } } });
    flushSync();
    expect(host.querySelector('[data-testid="filetool-camera-input"]')).toBeNull();
  });

  it('clipboard paste with unnamed File synthesizes pasted-image-<ts>.png', async () => {
    cmp = mount(FileTool, { target: host, props: { config: CFG } });
    flushSync();
    const buf = new Uint8Array([1, 2, 3]);
    // File with empty name (real browsers may emit this from getAsFile())
    const file = patch(new File([buf], '', { type: 'image/png' }), buf);
    const item = { kind: 'file', type: 'image/png', getAsFile: () => file } as unknown as DataTransferItem;
    const ev = new Event('paste') as Event & { clipboardData: DataTransfer };
    Object.defineProperty(ev, 'clipboardData', { value: { items: [item] } });
    document.dispatchEvent(ev);
    await flushAsync();
    const dl = host.querySelector('[data-testid="filetool-download"]') as HTMLAnchorElement;
    expect(dl).not.toBeNull();
    expect(dl.getAttribute('download')).toMatch(/^pasted-image-\d+\.webp$/);
  });

  it('HEIC upload triggers heic-decode lazy-load before process', async () => {
    const decodeSpy = vi.fn(async (bytes: Uint8Array, _mime: string) => ({ bytes, mime: 'image/png' }));
    vi.doMock('../../../src/lib/tools/heic-decode', () => ({ decodeHeicIfNeeded: decodeSpy }));
    cmp = mount(FileTool, { target: host, props: { config: CFG } });
    flushSync();
    const buf = new Uint8Array([1, 2]);
    const file = patch(new File([buf], 'x.heic', { type: 'image/heic' }), buf);
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [file] });
    input.dispatchEvent(new Event('change'));
    await flushAsync();
    // decode should have been called once with the HEIC bytes
    expect(decodeSpy).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

Run: `npx vitest run tests/components/tools/filetool-input-methods.test.ts`
Expected: 7 failures.

- [ ] **Step 3: Implement input methods in FileTool**

Edit `src/components/tools/FileTool.svelte`:

1. Extract MIME/size validation + processing into a helper:
   ```typescript
   async function processFile(file: File) {
     if (!config.accept.includes(file.type)) { /* … existing error path */ return; }
     if (file.size > config.maxSizeMb * 1024 * 1024) { /* … */ return; }
     sourceName = file.name;
     sourceSize = file.size;
     errorMessage = '';

     // HEIC pre-decode
     let bytes = new Uint8Array(await file.arrayBuffer());
     let effectiveMime = file.type;
     if (file.type === 'image/heic' || file.type === 'image/heif') {
       try {
         const { decodeHeicIfNeeded } = await import('../../lib/tools/heic-decode');
         const dec = await decodeHeicIfNeeded(bytes, file.type);
         bytes = dec.bytes;
         effectiveMime = dec.mime;
       } catch (err) {
         errorMessage = err instanceof Error ? err.message : 'HEIC-Decode-Fehler.';
         phase = 'error';
         return;
       }
     }

     // Prepare phase (existing logic — keep as is)
     // …
     // Process
     try {
       const outBytes = await processor(bytes, { quality });
       // … rest unchanged
     } catch (err) { /* … */ }
   }
   ```
   And refactor `onFileChange` to call `processFile(file)`.

2. Add clipboard paste handler with `$effect`:
   ```typescript
   $effect(() => {
     function onPaste(e: ClipboardEvent) {
       if (phase !== 'idle' && phase !== 'error') return;
       const items = e.clipboardData?.items;
       if (!items) return;
       for (const item of items) {
         if (item.kind !== 'file') continue;
         if (!item.type.startsWith('image/')) continue;
         const file = item.getAsFile();
         if (file) {
           // Synthetic name if missing
           const finalFile = file.name
             ? file
             : new File([file], `pasted-image-${Date.now()}.${item.type.split('/')[1] ?? 'png'}`, { type: item.type });
           processFile(finalFile);
           return;
         }
       }
     }
     document.addEventListener('paste', onPaste);
     return () => document.removeEventListener('paste', onPaste);
   });
   ```

3. Add camera-capture markup inside dropzone block:
   ```svelte
   {#if (config.cameraCapture ?? true) && config.accept.some((m) => m.startsWith('image/'))}
     <label class="camera">
       <input
         type="file"
         accept="image/*"
         capture="environment"
         data-testid="filetool-camera-input"
         hidden
         onchange={onFileChange}
       />
       <span>Foto aufnehmen</span>
     </label>
   {/if}
   ```
   With CSS `.camera { display: none; } @media (hover: none) and (pointer: coarse) { .camera { display: inline-flex; … } }` so it's mobile-only.

4. Update the meta-line hint to mention paste:
   ```svelte
   <span class="dropzone__hint" data-testid="filetool-meta">
     {acceptHumanList} · max. {config.maxSizeMb}&nbsp;MB · oder Strg+V
   </span>
   ```

- [ ] **Step 4: Run new tests — verify pass**

Run: `npx vitest run tests/components/tools/filetool-input-methods.test.ts`
Expected: 7/7 pass.

- [ ] **Step 5: Full suite + check + commit**

Run: `npm test -- --run && npm run check`
Expected: all green.

```bash
git add src/components/tools/FileTool.svelte tests/components/tools/filetool-input-methods.test.ts
git commit -m "$(cat <<'EOF'
feat(filetool): clipboard paste + mobile camera + HEIC pre-decode

Three new entry points for FileTool template (apply to ALL future
file-tools, not just BG-Remover): Ctrl+V paste of image clipboard items,
mobile-only camera-capture button, transparent HEIC->PNG pre-decode via
heic-decode lazy-import. Refactor consolidates upload paths into one
processFile() helper.

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: FileTool — mini-preview with checkerboard

**Files:**
- Modify: `src/components/tools/FileTool.svelte`
- Test: `tests/components/tools/filetool-preview.test.ts`

**Reference:** Spec §6.2 (Done-State-UI block), §15.4 (downscale to 200×200).

- [ ] **Step 1: Write failing test**

Create `tests/components/tools/filetool-preview.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, unmount, flushSync } from 'svelte';
import FileTool from '../../../src/components/tools/FileTool.svelte';
import { toolRuntimeRegistry } from '../../../src/lib/tools/tool-runtime-registry';
import type { FileToolConfig } from '../../../src/lib/tools/schemas';

const CFG: FileToolConfig = {
  id: 'test-preview-tool',
  type: 'file-tool',
  categoryId: 'bilder',
  accept: ['image/png'],
  maxSizeMb: 5,
  process: async () => new Uint8Array([137, 80, 78, 71]),
};

function patch(file: File, buf: Uint8Array): File {
  Object.defineProperty(file, 'arrayBuffer', { value: () => Promise.resolve(buf.buffer), configurable: true });
  return file;
}

async function flushAsync(ticks = 6) {
  for (let i = 0; i < ticks; i++) { await Promise.resolve(); flushSync(); }
}

describe('FileTool — mini-preview', () => {
  let host: HTMLElement;
  let cmp: ReturnType<typeof mount> | undefined;

  beforeEach(() => {
    host = document.createElement('div');
    document.body.appendChild(host);
    vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:mock'), revokeObjectURL: vi.fn() });
    toolRuntimeRegistry['test-preview-tool'] = { process: async () => new Uint8Array([137, 80, 78, 71]) };
  });

  afterEach(() => {
    if (cmp) unmount(cmp);
    host.remove();
    delete toolRuntimeRegistry['test-preview-tool'];
    vi.unstubAllGlobals();
  });

  it('renders preview img in done-phase pointing to outputUrl', async () => {
    cmp = mount(FileTool, { target: host, props: { config: CFG } });
    flushSync();
    const buf = new Uint8Array([1]);
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [patch(new File([buf], 'x.png', { type: 'image/png' }), buf)] });
    input.dispatchEvent(new Event('change'));
    await flushAsync();
    const img = host.querySelector('[data-testid="filetool-preview"]') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('blob:mock');
    expect(img.getAttribute('alt')).toBeTruthy();
  });

  it('preview wrapper has checkerboard background class', async () => {
    cmp = mount(FileTool, { target: host, props: { config: CFG } });
    flushSync();
    const buf = new Uint8Array([1]);
    const input = host.querySelector('[data-testid="filetool-input"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [patch(new File([buf], 'x.png', { type: 'image/png' }), buf)] });
    input.dispatchEvent(new Event('change'));
    await flushAsync();
    const wrapper = host.querySelector('[data-testid="filetool-preview"]')?.parentElement;
    expect(wrapper?.className).toMatch(/preview/);
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

Run: `npx vitest run tests/components/tools/filetool-preview.test.ts`
Expected: 2 failures.

- [ ] **Step 3: Implement preview block**

Edit `src/components/tools/FileTool.svelte`:

In the `done`-phase markup, before the size-rows or right after the result-rows:

```svelte
{#if phase === 'done' && outputUrl}
  <div class="preview" aria-hidden="false">
    <img
      class="preview__img"
      src={outputUrl}
      alt="Vorschau des freigestellten Bildes"
      data-testid="filetool-preview"
    />
  </div>
{/if}
```

CSS (token-only) — checkerboard via gradient:

```css
.preview {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 200px;
  max-height: 200px;
  margin: 0 auto;
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--r-md);
  background-color: var(--color-bg);
  background-image:
    linear-gradient(45deg, var(--color-border-subtle, var(--color-border)) 25%, transparent 25%),
    linear-gradient(-45deg, var(--color-border-subtle, var(--color-border)) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--color-border-subtle, var(--color-border)) 75%),
    linear-gradient(-45deg, transparent 75%, var(--color-border-subtle, var(--color-border)) 75%);
  background-size: 12px 12px;
  background-position: 0 0, 0 6px, 6px -6px, -6px 0;
}
.preview__img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}
```

- [ ] **Step 4: Run tests — verify pass**

Run: `npx vitest run tests/components/tools/filetool-preview.test.ts`
Expected: 2/2 pass.

- [ ] **Step 5: Full suite + check + commit**

Run: `npm test -- --run && npm run check`
Expected: all green.

```bash
git add src/components/tools/FileTool.svelte tests/components/tools/filetool-preview.test.ts
git commit -m "$(cat <<'EOF'
feat(filetool): mini-preview with transparent-checkerboard background

Done-phase shows up to 200x200 preview of outputUrl on a CSS-gradient
checkerboard so transparency is visually obvious. Image alt is always
present for a11y.

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Tool config + tool-registry + slug-map + runtime-registry

**Files:**
- Create: `src/lib/tools/hintergrund-entferner.ts`
- Modify: `src/lib/tools/tool-registry.ts`
- Modify: `src/lib/slug-map.ts`
- Modify: `src/lib/tools/tool-runtime-registry.ts`
- Test: extend an existing tool-registry test if present, otherwise create `tests/lib/tools/hintergrund-entferner-config.test.ts`

**Reference:** Spec §4.1, §7.

- [ ] **Step 1: Read existing patterns**

Read `src/lib/tools/png-jpg-to-webp.ts`, `src/lib/tools/tool-registry.ts`, and `src/lib/slug-map.ts` to confirm exact shapes.

- [ ] **Step 2: Write failing tests**

Create `tests/lib/tools/hintergrund-entferner-config.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { hintergrundEntferner } from '../../../src/lib/tools/hintergrund-entferner';
import { parseToolConfig } from '../../../src/lib/tools/schemas';
import { toolRegistry } from '../../../src/lib/tools/tool-registry';
import { slugMap } from '../../../src/lib/slug-map';
import { getRuntime } from '../../../src/lib/tools/tool-runtime-registry';

describe('hintergrund-entferner config + registry', () => {
  it('config validates against fileToolSchema', () => {
    const r = parseToolConfig(hintergrundEntferner);
    expect(r.ok).toBe(true);
  });

  it('id is remove-background', () => {
    expect(hintergrundEntferner.id).toBe('remove-background');
  });

  it('accepts PNG, JPG, WebP, AVIF, HEIC, HEIF', () => {
    expect(hintergrundEntferner.accept).toEqual(
      expect.arrayContaining(['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/heic', 'image/heif'])
    );
  });

  it('maxSizeMb is 15', () => {
    expect(hintergrundEntferner.maxSizeMb).toBe(15);
  });

  it('defaultFormat is png', () => {
    expect(hintergrundEntferner.defaultFormat).toBe('png');
  });

  it('filenameSuffix is _no-bg', () => {
    expect(hintergrundEntferner.filenameSuffix).toBe('_no-bg');
  });

  it('showQuality is false (quality slider hidden)', () => {
    expect(hintergrundEntferner.showQuality).toBe(false);
  });

  it('exposes prepare function', () => {
    expect(typeof hintergrundEntferner.prepare).toBe('function');
  });

  it('is registered in tool-registry', () => {
    expect(toolRegistry['remove-background']).toBe(hintergrundEntferner);
  });

  it('is registered in slug-map for de', () => {
    expect(slugMap['remove-background']?.de).toBe('hintergrund-entfernen');
  });

  it('is registered in tool-runtime-registry with process + prepare + reencode + isPrepared + clearLastResult', () => {
    const r = getRuntime('remove-background');
    expect(r).toBeDefined();
    expect(typeof r?.process).toBe('function');
    expect(typeof r?.prepare).toBe('function');
    expect(typeof r?.reencode).toBe('function');
    expect(typeof r?.isPrepared).toBe('function');
    expect(typeof r?.clearLastResult).toBe('function');
  });
});
```

- [ ] **Step 3: Run tests — verify they fail**

Run: `npx vitest run tests/lib/tools/hintergrund-entferner-config.test.ts`
Expected: 11 failures.

- [ ] **Step 4: Create the tool config**

Create `src/lib/tools/hintergrund-entferner.ts`:

```typescript
import type { FileToolConfig } from './schemas';
import {
  removeBackground,
  prepareBackgroundRemovalModel,
  reencodeLastResult,
} from './remove-background';

/**
 * Recraft.ai icon prompt — "premium editorial pencil sketch" template
 * (gelockt 2026-04-19). Subjekt-Block + Layout-Satz werden pro Tool
 * ausgetauscht; alle Stil-Sätze bleiben WORTGLEICH.
 *
 * Status: [ ] Generated  [ ] Background-Removed  [ ] Delivered
 *
 * Target: public/icons/tools/remove-background.webp (160x160, CSS 80x80).
 * Pipeline: Recraft -> dieses Tool selbst (Doppel-Hebel!) -> WebP-Konverter.
 */
export const hintergrundEntferner: FileToolConfig = {
  id: 'remove-background',
  type: 'file-tool',
  categoryId: 'bilder',
  iconPrompt:
    'A premium editorial pencil sketch of a portrait silhouette being lifted ' +
    'cleanly off a textured background square, the silhouette floating slightly ' +
    'above with the background fading at the edges. Minimalist line drawing ' +
    'featuring beautifully textured, bold and expressive graphite strokes. Very ' +
    'clean composition on a pure white background, high contrast monochromatic. ' +
    'No heavy shading, focusing on the raw, authentic texture of a soft graphite ' +
    'pencil. Centered, modern artistic execution, bespoke and unique appearance. ' +
    'Subtle dotted outline around the silhouette indicating selection, ' +
    'background square anchored at the bottom, balanced asymmetrical composition.',
  accept: ['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/heic', 'image/heif'],
  maxSizeMb: 15,
  defaultFormat: 'png',
  filenameSuffix: '_no-bg',
  showQuality: false,
  // NOTE: `prepare` and `process` here are never invoked at runtime — Astro
  // strips functions from island props. The runtime-registry below is the
  // single source of truth for execution. These stay here only to satisfy
  // the Zod schema and make the config self-describing.
  prepare: (onProgress) => prepareBackgroundRemovalModel(onProgress),
  process: (input, config) =>
    removeBackground(input, {
      format: typeof config?.format === 'string' && (config.format === 'png' || config.format === 'webp' || config.format === 'jpg')
        ? config.format
        : 'png',
    }),
};

/** Re-export for runtime-registry consumption. */
export { reencodeLastResult };
```

- [ ] **Step 5: Register in `tool-registry`**

Edit `src/lib/tools/tool-registry.ts` — add import + entry. Exact keys depend on existing file shape.

- [ ] **Step 6: Register in `slug-map`**

Edit `src/lib/slug-map.ts` — add `'remove-background': { de: 'hintergrund-entfernen' }` (or append `de` to existing nested-map shape).

- [ ] **Step 7: Register in `tool-runtime-registry`**

Edit `src/lib/tools/tool-runtime-registry.ts`:

```typescript
import {
  removeBackground,
  prepareBackgroundRemovalModel,
  reencodeLastResult,
  clearLastResult,
  isPrepared,
} from './remove-background';

export const toolRuntimeRegistry: Record<string, ToolRuntime> = {
  'png-jpg-to-webp': { /* unchanged */ },
  'remove-background': {
    process: (input, config) =>
      removeBackground(input, {
        format: typeof config?.format === 'string' && (config.format === 'png' || config.format === 'webp' || config.format === 'jpg')
          ? config.format
          : 'png',
      }),
    prepare: (onProgress) => prepareBackgroundRemovalModel(onProgress),
    reencode: (format) => reencodeLastResult(format as 'png' | 'webp' | 'jpg'),
    isPrepared: () => isPrepared(),
    clearLastResult: () => clearLastResult(),
  },
};
```

- [ ] **Step 8: Run tests — verify pass**

Run: `npx vitest run tests/lib/tools/hintergrund-entferner-config.test.ts && npm test -- --run`
Expected: 11/11 pass + full suite green.

- [ ] **Step 9: Type-check + commit**

Run: `npm run check`
Expected: 0/0/0.

```bash
git add src/lib/tools/hintergrund-entferner.ts src/lib/tools/tool-registry.ts src/lib/slug-map.ts src/lib/tools/tool-runtime-registry.ts tests/lib/tools/hintergrund-entferner-config.test.ts
git commit -m "$(cat <<'EOF'
feat(tools): wire hintergrund-entferner config + registries + slug-map

Tool-config (BEN2 + WebGPU + WASM) plus registrations in:
- tool-registry (config existence)
- slug-map (DE: hintergrund-entfernen)
- tool-runtime-registry (process + prepare + reencode)

Rulebooks-Read: PROJECT, CONVENTIONS

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Content MD `de.md` + content test

**Files:**
- Create: `src/content/tools/hintergrund-entfernen/de.md`
- Test: `tests/content/hintergrund-entfernen-content.test.ts`

**Reference:** Spec §8 (full Frontmatter + body).

- [ ] **Step 1: Write failing tests**

Create `tests/content/hintergrund-entfernen-content.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { toolsContentSchema } from '../../src/content/tools.schema';

const path = join(process.cwd(), 'src/content/tools/hintergrund-entfernen/de.md');
const raw = readFileSync(path, 'utf-8');

const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
if (!fmMatch) throw new Error('Content MD missing frontmatter');
const yaml = fmMatch[1];
const body = fmMatch[2];

// Tiny YAML-ish parser for our specific shape (toolId, lang, scalars).
function parseYaml(s: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  // Naive — only used in tests; the real parse happens in Astro content collection.
  for (const line of s.split('\n')) {
    const m = line.match(/^(\w+):\s*"?([^"]*)"?$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

describe('hintergrund-entfernen content (DE)', () => {
  const fm = parseYaml(yaml);

  it('toolId is remove-background', () => {
    expect(fm.toolId).toBe('remove-background');
  });

  it('lang is de', () => {
    expect(fm.lang).toBe('de');
  });

  it('body starts with H2 heading', () => {
    expect(body.trim().startsWith('## ')).toBe(true);
  });

  it('contains the locked H2 in order', () => {
    const expected = [
      '## Wie funktioniert das Tool?',
      '## Datenschutz — 100\u00A0% im Browser',
      '## Wann liefert das Tool gute Ergebnisse?',
    ];
    let pos = 0;
    for (const h of expected) {
      const found = body.indexOf(h, pos);
      expect(found, `expected "${h}" after position ${pos}`).toBeGreaterThanOrEqual(0);
      pos = found + h.length;
    }
  });

  it('body word count is ≥ 800', () => {
    const words = body.replace(/[#*_`]/g, ' ').split(/\s+/).filter(Boolean);
    expect(words.length).toBeGreaterThanOrEqual(800);
  });

  it('headline mentions privacy / browser', () => {
    expect(String(fm.title).toLowerCase()).toMatch(/browser|hochladen|gerät/);
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

Run: `npx vitest run tests/content/hintergrund-entfernen-content.test.ts`
Expected: failures, content file doesn't exist.

- [ ] **Step 3: Create content file**

Create `src/content/tools/hintergrund-entfernen/de.md`. Use the frontmatter template from spec §8.1 verbatim. For the body, write ≥800 words that:

- Start with `## Wie funktioniert das Tool?` (200–300 words on BEN2 + WebGPU + WASM, in lay-audience German).
- Continue with `## So entfernst du einen Hintergrund` (~80 words, references the on-page steps).
- Continue with `## Datenschutz — 100\u00A0% im Browser` (200–300 words: no upload, no tracking, model-CDN-disclaimer, link to Datenschutz page).
- Continue with `## Wann liefert das Tool gute Ergebnisse?` (300–400 words: typical use cases — product photos, portraits, animals, fine structures, transparent objects — with practical tips).
- Continue with `## Häufige Fragen` (renders FAQ from frontmatter, can be one introductory sentence).
- End with `## Verwandte Tools`.

Use NBSP (`&nbsp;` or U+00A0) between numbers and units throughout. No backticks for technical terms like „WebGPU" — use plain text.

- [ ] **Step 4: Run tests — verify pass**

Run: `npx vitest run tests/content/hintergrund-entfernen-content.test.ts`
Expected: all pass. If word-count fails, expand the body.

- [ ] **Step 5: Verify it appears in Astro build**

Run: `npm run build`
Expected: build succeeds, log mentions `/de/hintergrund-entfernen` page generation.

- [ ] **Step 6: Datenschutz-Disclosure in Content MD (conscious-gap note)**

The global Datenschutzerklärung page is a Phase-2 stub (`src/components/Footer.astro:22` — `<span class="stub">Datenschutz (Phase 2)</span>`). Spec §14.6 expects an entry there. Until the Datenschutz page exists, the in-page `## Datenschutz — 100 % im Browser` section in `de.md` IS the user-facing disclosure. Ensure the content explicitly names:

- "Hugging Face" as CDN provider (USA, non-EU jurisdiction)
- That the CDN request contains NO image data and NO personal data
- That the download is one-time and cached by the browser afterwards
- Link-placeholder to the future `/de/datenschutz` page (use `<a href="/de/datenschutz">Datenschutzerklärung</a>` — will 404 until Phase 2, but the anchor is stable)

Add a dedicated test to `tests/content/hintergrund-entfernen-content.test.ts`:

```typescript
it('datenschutz section mentions Hugging Face CDN + no image upload', () => {
  const section = body.slice(
    body.indexOf('## Datenschutz'),
    body.indexOf('## Wann liefert das Tool gute Ergebnisse?'),
  );
  expect(section).toMatch(/hugging\s*face/i);
  expect(section).toMatch(/kein.*upload|nicht.*hochgeladen|100.*%.*im\s*browser/i);
  expect(section).toMatch(/\/de\/datenschutz/);
});
```

Re-run: `npx vitest run tests/content/hintergrund-entfernen-content.test.ts`. Expected: pass.

- [ ] **Step 7: Commit content**

```bash
git add src/content/tools/hintergrund-entfernen/de.md tests/content/hintergrund-entfernen-content.test.ts
git commit -m "$(cat <<'EOF'
feat(content): add hintergrund-entfernen DE content (>=800 words)

Privacy-Lead headline + locked H2 sequence. Datenschutz-Sektion explicitly
names Hugging Face CDN (USA, no image data) per spec §10.1 condition (e)
and links to /de/datenschutz (stub page; becomes live in Phase 2).

Rulebooks-Read: PROJECT, CONTENT

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 12b: Schema.org structured data (SoftwareApplication + FAQPage + HowTo)

**Files:**
- Modify: `src/pages/[lang]/[slug].astro` (add JSON-LD emission)
- Create: `src/lib/seo/tool-jsonld.ts` (builder — one module, tested)
- Test: `tests/lib/seo/tool-jsonld.test.ts`

**Reference:** Spec §2.4 differentiation B9. Currently zero JSON-LD output in the codebase (verified via grep). Required for AEO/voice-search feature.

- [ ] **Step 1: Write failing tests**

Create `tests/lib/seo/tool-jsonld.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { buildToolJsonLd } from '../../../src/lib/seo/tool-jsonld';

describe('buildToolJsonLd', () => {
  const content = {
    toolId: 'remove-background',
    lang: 'de',
    title: 'Hintergrund entfernen',
    description: 'Beschreibung',
    faq: [
      { q: 'Funktioniert das offline?', a: 'Ja, nach dem ersten Modell-Download.' },
      { q: 'Ist es kostenlos?', a: 'Ja.' },
    ],
    steps: [
      { title: 'Bild hochladen', description: 'Drag-&-Drop oder Click.' },
      { title: 'Warten', description: 'KI arbeitet 100–200 ms lokal.' },
      { title: 'Download', description: 'PNG mit Transparenz.' },
    ],
  };

  it('emits an array with SoftwareApplication + FAQPage + HowTo @types', () => {
    const out = buildToolJsonLd(content, 'https://example.com/de/hintergrund-entfernen');
    const types = out.map((x) => x['@type']);
    expect(types).toContain('SoftwareApplication');
    expect(types).toContain('FAQPage');
    expect(types).toContain('HowTo');
  });

  it('SoftwareApplication includes name, applicationCategory, offers free', () => {
    const [soft] = buildToolJsonLd(content, 'https://example.com/de/hintergrund-entfernen');
    expect(soft.name).toBe('Hintergrund entfernen');
    expect(soft.applicationCategory).toBe('MultimediaApplication');
    expect((soft.offers as { price: string }).price).toBe('0');
  });

  it('FAQPage mainEntity matches faq length and shape', () => {
    const out = buildToolJsonLd(content, 'https://example.com/x');
    const faq = out.find((x) => x['@type'] === 'FAQPage');
    expect((faq?.mainEntity as unknown[]).length).toBe(2);
  });

  it('HowTo step count matches steps length', () => {
    const out = buildToolJsonLd(content, 'https://example.com/x');
    const howTo = out.find((x) => x['@type'] === 'HowTo');
    expect((howTo?.step as unknown[]).length).toBe(3);
  });

  it('omits FAQPage when faq is empty', () => {
    const out = buildToolJsonLd({ ...content, faq: [] }, 'https://example.com/x');
    expect(out.find((x) => x['@type'] === 'FAQPage')).toBeUndefined();
  });

  it('omits HowTo when steps are empty', () => {
    const out = buildToolJsonLd({ ...content, steps: [] }, 'https://example.com/x');
    expect(out.find((x) => x['@type'] === 'HowTo')).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests — verify they fail**

Run: `npx vitest run tests/lib/seo/tool-jsonld.test.ts`
Expected: 6 failures (module does not exist).

- [ ] **Step 3: Implement `buildToolJsonLd`**

Create `src/lib/seo/tool-jsonld.ts`:

```typescript
export interface ToolContentForJsonLd {
  toolId: string;
  lang: string;
  title: string;
  description: string;
  faq: Array<{ q: string; a: string }>;
  steps: Array<{ title: string; description: string }>;
}

export function buildToolJsonLd(content: ToolContentForJsonLd, url: string): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = [];

  out.push({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: content.title,
    description: content.description,
    url,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    inLanguage: content.lang,
  });

  if (content.faq.length > 0) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: content.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  if (content.steps.length > 0) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: content.title,
      step: content.steps.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.title,
        text: s.description,
      })),
    });
  }

  return out;
}
```

- [ ] **Step 4: Emit JSON-LD in `[slug].astro`**

Edit `src/pages/[lang]/[slug].astro`. Inside the `<BaseLayout>` — or, if BaseLayout exposes a `head` slot, in that slot — emit one `<script type="application/ld+json">` per block:

```astro
---
import { buildToolJsonLd } from '../../lib/seo/tool-jsonld';
// … existing imports

const jsonLd = buildToolJsonLd(
  {
    toolId: content.toolId,
    lang: content.lang,
    title: content.title,
    description: content.description,
    faq: content.faq ?? [],
    steps: content.steps ?? [],
  },
  Astro.url.href,
);
---
…
<BaseLayout …>
  {jsonLd.map((block) => (
    <script type="application/ld+json" set:html={JSON.stringify(block)} />
  ))}
  <!-- rest of page -->
</BaseLayout>
```

Adjust field names to match the actual content collection shape (some fields may be `howToSteps` or `relatedTools` — read the existing webp-konverter page + schema first).

- [ ] **Step 5: Build-time assertion — JSON-LD renders in HTML**

Run: `npm run build && grep -c 'application/ld+json' dist/de/hintergrund-entfernen/index.html || true`
Expected: count ≥ 1.

Also verify webp-konverter and meter-zu-fuss pages pick up the same emission (they have FAQ + steps; SoftwareApplication should also appear). This is a side-effect improvement, not a regression.

- [ ] **Step 6: Full suite + check + commit**

Run: `npm test -- --run && npm run check`
Expected: all green.

```bash
git add src/lib/seo/tool-jsonld.ts src/pages/[lang]/[slug].astro tests/lib/seo/tool-jsonld.test.ts
git commit -m "$(cat <<'EOF'
feat(seo): emit SoftwareApplication + FAQPage + HowTo JSON-LD for tool pages

One builder module, tested with 6 cases. Applies to every tool with
FAQ+steps, not just BG-Remover — webp-konverter + meter-zu-fuss pick up
the same emission. Required for AEO/voice-search (spec §2.4 B9).

Rulebooks-Read: PROJECT, CONVENTIONS, CONTENT

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 6: Full suite + check + commit**

Run: `npm test -- --run && npm run check`
Expected: all green.

```bash
git add src/content/tools/hintergrund-entfernen/de.md tests/content/hintergrund-entfernen-content.test.ts
git commit -m "$(cat <<'EOF'
docs(content): add /de/hintergrund-entfernen SEO content (≥800 words)

Privacy-lead headline + 6 locked H2s + ≥800-word body with use-case
guidance, datenschutz section explicit about model CDN, NBSP between
all numeric values and units.

Rulebooks-Read: PROJECT, CONTENT

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Build verification + smoke checklist

**Files:** none (verification only).

- [ ] **Step 1: Clean build**

Run: `rm -rf dist .astro && npm run build`
Expected: build succeeds, `dist/de/hintergrund-entfernen/index.html` exists. List of generated pages includes the new slug.

- [ ] **Step 2: Verify Hauptbundle bleibt klein**

Run: `du -sh dist/_astro/*.js | sort -rh | head -10`
Expected: largest individual JS chunk < 200 KB. Transformers.js + heic2any chunks should NOT appear in the entry chunks.

Also assert that `huggingface` / `transformers` code is isolated to a dynamic-import chunk, never the entry bundle:

```bash
find dist/_astro -name '*.js' | xargs grep -l 'huggingface' 2>/dev/null || echo "not in any chunk"
```

Expected: either a single matching file (the dynamic-import chunk) or `not in any chunk`. If it appears in multiple chunks — especially the entry chunk — the lazy-import is broken.

- [ ] **Step 3: Check 0/0/0**

Run: `npm run check && npm test -- --run`
Expected: 0 errors, 0 warnings, 0 hints. All tests pass.

- [ ] **Step 4: Manual smoke checklist (document, do not auto-execute)**

Add the following block to `PROGRESS.md` next session, to be filled in when human runs `npm run dev`:

```
Session N Smoke-Test:
- [ ] /de/hintergrund-entfernen lädt
- [ ] PNG-Upload triggert Modell-Download (Progress sichtbar)
- [ ] BG entfernt, PNG-Download funktioniert
- [ ] Format-Wechsel zu WebP re-encodet (kein Re-Inference; Network-Tab zeigt keinen erneuten Modell-Download)
- [ ] Format-Wechsel zu JPG: weißer Hintergrund statt Alpha
- [ ] Reset-Button funktioniert
- [ ] Strg+V mit Screenshot triggert Process
- [ ] Mobile: Kamera-Button sichtbar (DevTools-Mobile-Mode oder echtes Smartphone)
- [ ] HEIC-Upload (echte iPhone-Datei) triggert heic2any-Lazy-Load
- [ ] Dark-Mode: Card, Loader, Preview, Format-Chooser sehen korrekt aus
- [ ] /de/webp-konverter funktioniert immer noch wie vorher (Regression-Check)
```

- [ ] **Step 5: Commit (if anything was generated, e.g. types)**

```bash
git status
# If there are auto-generated changes (like .astro/types.d.ts), commit them:
git add .astro/  # if applicable
git commit -m "$(cat <<'EOF'
chore: regenerate Astro types after bg-remover wiring

Rulebooks-Read: PROJECT

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
# Otherwise skip this commit.
```

---

## Task 14: Rulebook + PROGRESS update

**Files:**
- Modify: `CONVENTIONS.md`
- Modify: `STYLE.md`
- Modify: `PROGRESS.md`

- [ ] **Step 1: Update CONVENTIONS.md**

Add to `§Tool-Components`:
- New `preparing` phase to FileTool phase machine.
- Five new optional FileToolConfig fields: `prepare`, `defaultFormat`, `cameraCapture`, `filenameSuffix`, `showQuality`. Document defaults: `cameraCapture` defaults to `true` for any tool whose `accept[]` contains an `image/*` MIME; `showQuality` defaults to `true`; others default to undefined.

Add to `§File-Tool-Pattern`:
- Drei-Touch-Pattern updated: `process-registry` → `tool-runtime-registry` (single registry, `{ process, prepare?, reencode?, isPrepared?, clearLastResult? }` shape).
- ML-lazy-load tools expose `isPrepared()` so the component can skip the preparing UI flash on revisit. The runtime is source of truth; no component-local `prepared` flag.
- New entry-points (clipboard paste + camera capture + HEIC pre-decode) are now FileTool-Defaults.
- Stall-watchdog pattern: long-running `prepare` implementations should accept a `{ stallTimeoutMs }` option and throw a typed `StallError` when no progress event arrives within the window (default 120 s).

Add new sub-section `§Components`:
- `Loader.svelte` — shared component, two variants (`spinner` indeterminate / `progress` determinate). Used by any tool with lazy-loading or long-running work.

Add new sub-section `§SEO/JSON-LD`:
- `buildToolJsonLd()` in `src/lib/seo/tool-jsonld.ts` — emits `SoftwareApplication` + `FAQPage` + `HowTo` blocks. Wired into `[slug].astro`; applies to every tool page that exposes FAQ + steps frontmatter.

- [ ] **Step 2: Update STYLE.md**

Append to `§9.2 FileTool`:
- Preparing-State: Loader-Variant `progress` plus „Lädt einmalig Modell …"-Status-Text.
- Done-State: Mini-Preview (max 200×200) auf Transparenz-Checkerboard via CSS-Gradient; Format-Chooser Radio-Group mit Hint-Mono-Suffixen.

Add new `§11. Loader` (if §11 still free; otherwise renumber existing §11 Skill-Integration to §12):
- `<Loader variant="spinner" />`: 24×24, 1px-Hairline-Arc, `var(--color-text-subtle)`, 0.9s rotate.
- `<Loader variant="progress" value={0..1} label="…" />`: 1px-Hairline-Bar, Mono-Tabular-Label rechts, NBSP zwischen Wert und Unit.
- `prefers-reduced-motion: reduce` deaktiviert Spin-Animation und Width-Transition.

- [ ] **Step 3: Update PROGRESS.md**

Add Session entry (use the next session-number that fits the project's running count):

```markdown
| Session | Status | Deliverable |
|---------|--------|-------------|
| N — Hintergrund-Entferner Prototype | ✅ done | BG-Remover live + FileTool-Erweiterungen + Loader-Komponente |
```

Add section:

```markdown
## Session N Deliverables

- `src/lib/tools/remove-background.ts` (~200 LOC): Singleton-Pipeline (BEN2 + WebGPU/WASM), `removeBackground` + `reencodeLastResult` + `clearLastResult`.
- `src/lib/tools/heic-decode.ts` (~50 LOC): Lazy-Loader für `heic2any`, Safari-skip via UA-Check.
- `src/components/Loader.svelte` (~80 LOC): Geteilte Spinner/Progress-Komponente, Tokens-only.
- `src/lib/tools/tool-runtime-registry.ts` (replaces `process-registry.ts`): Single Registry mit `{ process, prepare?, reencode? }` pro Tool-ID.
- `src/components/tools/FileTool.svelte`: +`preparing`-Phase, dynamisches Output-Format, Format-Chooser-Radio-Group, Clipboard-Paste, Mobile-Kamera-Capture, HEIC-Pre-Decode, Mini-Preview mit Checkerboard-BG. Phase-State-Machine: `idle → preparing → converting → done | error`.
- `src/lib/tools/hintergrund-entferner.ts`: Tool-Config mit `prepare`, `defaultFormat: 'png'`, `accept: PNG/JPG/WebP/AVIF/HEIC/HEIF`, `maxSizeMb: 15`.
- `src/content/tools/hintergrund-entfernen/de.md`: ≥800 Wörter SEO-Content, Privacy-Lead-Headline, 6 gelockte H2s.
- Tests: ~45 neue (Loader: 6, heic-decode: 5, remove-background: 13, tool-runtime-registry: 3, tool-jsonld: 6, filetool-format: 8, filetool-prepare: 5, filetool-input-methods: 7, filetool-preview: 2, hintergrund-entferner-config: 11, content: 7).
- Differenzierung: §2.4 mit Subagent-Recherche gefüllt — White-Space „pure-client + HEIC + WebP-transparent + Clipboard + Camera + zero-friction".
- Gates: 0/0/0 `astro check`, X/X vitest, 5 pages built (`/`, `/de`, `/de/meter-zu-fuss`, `/de/webp-konverter`, `/de/hintergrund-entfernen`).
```

Update `Tool-Inventar`:

```markdown
| remove-background | ✅ | ✅ | ⬜ (Pending Recraft) | ✅ |
```

Update `Next-Session-Plan` to whatever the next logical step is (PWA + Pagefind, or an icon-pipeline-pass through the new tool itself, or CI/CD).

- [ ] **Step 4: Final commit (Session-End-Commit)**

Run: `bash scripts/check-git-account.sh && git add CONVENTIONS.md STYLE.md PROGRESS.md`

```bash
git commit -m "$(cat <<'EOF'
docs(rulebooks+progress): lock Loader + FileTool extensions + bg-remover session

CONVENTIONS: preparing phase, defaultFormat/cameraCapture flags, Loader
component reference, tool-runtime-registry shape.
STYLE: §9.2 preparing/preview/format-chooser blocks, new §11 Loader spec.
PROGRESS: Session N marked complete, tool inventory updated.

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE, CONTENT

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Done-Criteria (from Spec §14)

V1 is "done" when ALL of these hold:

- [ ] All 14 tasks above committed.
- [ ] `npm run build` 0 errors. `dist/de/hintergrund-entfernen/index.html` exists.
- [ ] `npm run check` 0/0/0.
- [ ] `npm test -- --run` all passing (target: ≥185 tests, depending on existing baseline).
- [ ] Hauptbundle < 100 KB gzip (Lazy-Chunks for transformers.js + heic2any may be larger but split).
- [ ] `web-design-guidelines` skill audit-pass on all changed files (run as a final review pass).
- [ ] Manual smoke checklist (Task 13 Step 4) executed by human in browser.
- [ ] Doppel-Hebel verified: Recraft-PNG of `meter-zu-fuss` → through this tool → PNG with alpha for the icon pipeline.

---

## Notes for the executing agent

- **Subagent-driven-development is recommended.** Each task above is independent enough to dispatch as one subagent invocation: subagent reads the task, runs the steps, returns the commit SHA, you review, dispatch the next.
- **TDD discipline:** every task starts with a failing test. Don't write production code until the test fails for the right reason (function/module not found, not a syntax error).
- **Commit hygiene:** one task = one or two commits. Conventional Commits + `Rulebooks-Read:` trailer. Pre-commit hook enforces git account.
- **jsdom-25 quirks:** see CONVENTIONS §Testing for `Blob.arrayBuffer` per-instance patch and `URL.createObjectURL` stub. Test files in this plan already follow the patterns.
- **If a step's expected behavior diverges from reality** (e.g. transformers.js v4.x has a different API than spec assumes), STOP and surface to the human before bending the spec. The spec is the source of truth; deviations need approval.
