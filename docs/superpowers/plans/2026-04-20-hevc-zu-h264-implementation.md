# HEVC → H.264 Konverter — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/de/hevc-zu-h264` as the first video-tool of the Konverter-Webseite. Extend `FileTool.svelte` template with **progress-reporting** and **preflight-check** hooks (generic, used by future video tools). Validate Mediabunny + WebCodecs as the primary video-encoding stack.

**Architecture:** Mediabunny (MPL-2.0, ~70 kB gzip) lazy-imported via `prepare()`-analog flow. Pure-function encoder (`process-hevc-to-h264.ts`) separated from Svelte component. Preflight-check gates `VideoEncoder`/`VideoDecoder` availability. See spec: [`docs/superpowers/specs/2026-04-20-hevc-zu-h264-design.md`](../specs/2026-04-20-hevc-zu-h264-design.md).

**User-Decisions (2026-04-20, locked in Spec §8):**
- Slug: `/de/hevc-zu-h264` (präzise) + User-Sprache in H1/Meta (*„iPhone-Video in MP4"*).
- Preset-Namen: `Original-Qualität` / `Balanced` / `Klein`.
- **4K-Passthrough per Default**, 1080p-Downscale als **User-Opt-In-Toggle** (sichtbar nur bei >1080p-Source). Config-Knob: `downscaleTo1080p: boolean`.
- HDR: keine Pre-Encode-Warnung. FAQ-Eintrag dokumentiert Qualitätsverlust (wörtlich aus Spec §4.7).
- Spec-Review-Loop: skip — direkt zur Implementation.

**Tech Stack:** Astro 5, Svelte 5 Runes, TypeScript, Vitest + jsdom. **New runtime dep:** `mediabunny` (pin exact version; PROJECT.md update required). No new test deps — existing `mount`/`flushSync`/`unmount` pattern works; WebCodecs APIs mocked in jsdom.

**Test-Env Decision:** jsdom 25 does not provide `VideoEncoder`/`VideoDecoder` and cannot execute Mediabunny. Unit tests use `vi.mock('mediabunny', () => ({ ... }))` and validate orchestration + preset math + error branches. Real encoding verified manually in Task 6 (Smoke-Test) across Chrome, Firefox, Safari, and iPhone-Safari (real device).

**Gate-Warning:** This is the **first new runtime dep since Session 10 (Pagefind + Workbox)**. PROJECT.md must be updated with the pinned Mediabunny version AND the rationale (pure-client video-encode engine) in the same commit as the `npm install`.

---

## File Structure (decomposition lock)

| Path | Responsibility | Create/Modify |
|---|---|---|
| `PROJECT.md` | Add `mediabunny` to locked-deps table with pinned version + rationale. | Modify |
| `package.json` + `package-lock.json` | `npm install --save-exact mediabunny@<pinned>`. | Modify |
| `src/lib/tools/process-hevc-to-h264.ts` | Pure orchestrator: `Uint8Array → Uint8Array` via Mediabunny, preset→bitrate math, onProgress propagation. | Create |
| `tests/lib/tools/process-hevc-to-h264.test.ts` | Orchestration + preset-math + error-branch tests with mocked Mediabunny. | Create |
| `src/lib/tools/hevc-to-h264.ts` | `FileToolConfig` instance — accept list, maxSize, iconPrompt, preset config knob, delegates to runtime-registry. | Create |
| `tests/lib/tools/hevc-to-h264.test.ts` | Config-shape test (`toolSchema.safeParse`). | Create |
| `src/lib/tools/schemas.ts` | Extend `fileToolSchema` + `FileToolConfig` type with optional `toggles?: Array<{ id: string; label: string; visibleIf?: 'source-gt-1080p' }>` for the generic toggle-pattern (first consumer: `downscaleTo1080p`). | Modify |
| `src/lib/tools/tool-runtime-registry.ts` | Extend `ProcessFn` type signature with optional `onProgress`; add `hevc-to-h264` runtime entry; add new `preflightCheck` field to `ToolRuntime` interface. | Modify |
| `src/lib/tool-registry.ts` | Add `hevc-to-h264` entry. | Modify |
| `src/lib/slug-map.ts` | Add `'hevc-to-h264': { de: 'hevc-zu-h264' }`. | Modify |
| `tests/lib/slug-map.test.ts` | Update enumeration if any. | Modify (if needed) |
| `src/components/tools/FileTool.svelte` | Add two generic hooks: (1) consume `runtime.preflightCheck?` to short-circuit to error-state on mount; (2) pass `onProgress` as 3rd arg into `runtime.process`, render `percent · eta` text in `converting` state. | Modify |
| `tests/components/tools/filetool.test.ts` | Add two cases: preflight-fail → initial error-state; progress-callback → text renders. | Modify |
| `src/content/tools/hevc-zu-h264/de.md` | SEO content ≥300 words, locked 7-H2 list, Privacy-Lead, AEO-FAQ hook. | Create |
| `tests/content/hevc-zu-h264-content.test.ts` | Frontmatter + H2-order test. | Create |
| `public/icons/tools/hevc-to-h264.webp` | Recraft-generated icon, run through BG-Remover → WebP-Konverter (internal pipeline). | Pending — NOT in this session |
| `PROGRESS.md` | Mark Phase 1 Session 2 done, update Tool-Inventar. | Modify |

**`categoryId: 'video'`** is introduced as a free-string `categoryId` (CONVENTIONS confirms: no central registry). No code-change for the category itself.

---

## Task 1.0 — Mediabunny API-Spike ✅ ERLEDIGT 2026-04-20

Spike wurde gegen https://mediabunny.dev/ + https://mediabunny.dev/guide/converting-media-files ausgeführt. Ergebnisse bereits in Spec §3.3 + §4.3–4.5 eingearbeitet:

- [x] **Version:** `mediabunny@1.40.1`, Lizenz MPL-2.0.
- [x] **Verifizierte Exports:** `Input`, `Output`, `BufferSource`, `BufferTarget`, `Mp4OutputFormat`, `ALL_FORMATS`, `Conversion.init`.
- [x] **Video-Codec-String:** `'h264'` (nicht `'avc'`).
- [x] **Resize-Option:** `width` / `height` + `fit: 'contain'` (nicht `maxWidth` / `maxHeight`).
- [x] **Metadaten-Option:** `tags: (inputTags) => ({ ...inputTags })` als Funktion (nicht `metadata: 'preserve'` String).
- [x] **Progress-Callback:** `conversion.onProgress = (progress: number) => void` — einzige Zahl 0–1, **keine ETA**. ETA muss im FileTool aus Elapsed-Time selbst berechnet werden.
- [ ] **Audio `{ copy: true }`** — in der Haupt-Doku NICHT explizit bestätigt. Bleibt als Pending-Verify im ersten Implementation-Run (Task 3.3): wenn `Conversion.init` wirft oder Stream-Copy silently transcoded, Fallback auf `{ codec: 'aac', bitrate: audioTrack.bitrate }`. KEIN Blocker — wir starten mit `{ copy: true }` und patchen bei Bedarf.

**Konsequenzen für den Plan:** Test-Mocks + Runtime-Code unten reflektieren die korrigierte API. Abschnitte Task 2, Task 3.1, Task 3.3, Task 5.4, Failure-Modes-Tabelle wurden gepatcht.

---

## Task 1: Install Mediabunny + PROJECT.md update

**Files:**
- Modify: `PROJECT.md`
- Modify: `package.json` + `package-lock.json`

- [ ] **Step 1.1: Install, exact-pin**

```bash
bash scripts/check-git-account.sh
npm install --save-exact mediabunny@<version-from-1.0.2>
```

Confirm `package.json` shows the exact version (no `^` or `~`). The session-2-design-system principle of exact-pinning applies to all runtime deps.

- [ ] **Step 1.2: Update PROJECT.md**

Add to the locked-deps table (exact format depends on the existing file structure — match it):
- **Package:** `mediabunny`
- **Version:** `<pinned>`
- **License:** MPL-2.0
- **Role:** pure-client video-encode engine (WebCodecs-first); primary engine for all file-tool video conversions in Phase 1+.
- **Why this lib:** COOP/COEP-free (AdSense-compatible, Non-Negotiable #5), ~70 kB gzip, 200+ fps 1080p H.264 vs. `ffmpeg.wasm`'s 25 fps. See [spec §2.3](docs/superpowers/specs/2026-04-20-hevc-zu-h264-design.md).
- **Update-policy:** manual review of each minor/major bump (WebCodecs-API parity risk). Patch versions auto-accepted.

- [ ] **Step 1.3: Run gates, commit**

```bash
npm run check && npm run test && npm run build
```

Expected: all green (Mediabunny is installed but not imported yet → no bundle-size delta, no test delta).

```bash
bash scripts/check-git-account.sh
git add package.json package-lock.json PROJECT.md
# include the spec edit from Task 1.0.3 if any
git add docs/superpowers/specs/2026-04-20-hevc-zu-h264-design.md
git commit -m "$(cat <<'EOF'
chore(deps): add mediabunny for pure-client video encoding

Locks mediabunny at <pinned> as the primary video-encode engine
for Phase 1 file-tools (first consumer: hevc-to-h264). Chosen
over ffmpeg.wasm because COOP/COEP-free (AdSense-compatible per
NN #5), ~70 kB vs. 22 MB bundle, WebCodecs-backed 200 fps vs. 25
fps on 1080p H.264. PROJECT.md updated with license (MPL-2.0),
role, and update-policy.

Rulebooks-Read: PROJECT

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: `tool-runtime-registry.ts` — extend `ProcessFn` signature + `ToolRuntime` shape

**Files:**
- Modify: `src/lib/tools/tool-runtime-registry.ts`

- [ ] **Step 2.1: Extend types**

Add optional `onProgress` to `ProcessFn`:
```ts
// Mediabunny-kompatibel: Progress ist eine 0–1-Zahl. ETA berechnet FileTool selbst.
export type ProgressCallback = (progress: number) => void;

export type ProcessFn = (
  input: Uint8Array,
  config?: Record<string, unknown>,
  onProgress?: ProgressCallback,
) => Uint8Array | Promise<Uint8Array>;
```

Add `preflightCheck` to `ToolRuntime`:
```ts
export interface ToolRuntime {
  process: ProcessFn;
  prepare?: PrepareFn;
  reencode?: ReencodeFn;
  isPrepared?: () => boolean;
  clearLastResult?: () => void;
  preflightCheck?: () => string | null;
}
```

- [ ] **Step 2.2: Verify existing entries still type-check**

`png-jpg-to-webp.process` and `remove-background.process` don't accept `onProgress` — that's fine, optional arg. Run:
```bash
npm run check
```

Expected: 0/0.

- [ ] **Step 2.3: Commit**

```bash
bash scripts/check-git-account.sh
git add src/lib/tools/tool-runtime-registry.ts
git commit -m "$(cat <<'EOF'
refactor(runtime): add onProgress + preflightCheck to registry shape

Extends ProcessFn with an optional onProgress callback and adds
preflightCheck to ToolRuntime. Existing entries (png-jpg-to-webp,
remove-background) are source-compatible — arguments are optional.
Enables progress-reporting for long-running tools (video) and
browser-API gating.

Rulebooks-Read: PROJECT, CONVENTIONS

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: `process-hevc-to-h264.ts` + tests

**Files:**
- Create: `src/lib/tools/process-hevc-to-h264.ts`
- Create: `tests/lib/tools/process-hevc-to-h264.test.ts`

- [ ] **Step 3.1: Write failing tests**

Create `tests/lib/tools/process-hevc-to-h264.test.ts`. Use `vi.mock('mediabunny', () => ({ ... }))` at the top of the file. The mock factory must expose the exact names used in `process-hevc-to-h264.ts` (matching the Task-1.0-verified API). Below is a **template** — adapt names to reality.

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';

const conversionMock = {
  execute: vi.fn().mockResolvedValue(undefined),
  onProgress: undefined as undefined | ((p: number) => void),
};

const initMock = vi.fn().mockImplementation(async (opts: unknown) => {
  conversionMock.execute.mockClear();
  (conversionMock as any).__lastOpts = opts;
  return conversionMock;
});

const inputMock = {
  getPrimaryVideoTrack: vi.fn().mockResolvedValue({ width: 1920, height: 1080, bitrate: 8_000_000 }),
  getPrimaryAudioTrack: vi.fn().mockResolvedValue({ codec: 'aac', bitrate: 128_000 }),
};

vi.mock('mediabunny', () => ({
  BufferSource: vi.fn(),
  BufferTarget: vi.fn().mockImplementation(() => ({ buffer: new Uint8Array([1, 2, 3]) })),
  Input: vi.fn().mockImplementation(() => inputMock),
  Output: vi.fn(),
  Mp4OutputFormat: vi.fn(),
  ALL_FORMATS: {},
  Conversion: { init: initMock },
}));

import { processHevcToH264 } from '../../../src/lib/tools/process-hevc-to-h264';

describe('processHevcToH264', () => {
  beforeEach(() => {
    initMock.mockClear();
    inputMock.getPrimaryVideoTrack.mockResolvedValue({ width: 1920, height: 1080, bitrate: 8_000_000 });
    inputMock.getPrimaryAudioTrack.mockResolvedValue({ codec: 'aac', bitrate: 128_000 });
  });

  it('returns the buffer from BufferTarget', async () => {
    const out = await processHevcToH264(new Uint8Array([0]), { preset: 'balanced' });
    expect(out).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('preset=balanced passes 0.6x source bitrate', async () => {
    await processHevcToH264(new Uint8Array([0]), { preset: 'balanced' });
    const opts = (conversionMock as any).__lastOpts;
    expect(opts.video.bitrate).toBe(Math.round(8_000_000 * 0.6));
  });

  it('preset=small passes 0.35x source bitrate', async () => {
    await processHevcToH264(new Uint8Array([0]), { preset: 'small' });
    const opts = (conversionMock as any).__lastOpts;
    expect(opts.video.bitrate).toBe(Math.round(8_000_000 * 0.35));
  });

  it('preset=original passes source bitrate unchanged', async () => {
    await processHevcToH264(new Uint8Array([0]), { preset: 'original' });
    const opts = (conversionMock as any).__lastOpts;
    expect(opts.video.bitrate).toBe(8_000_000);
  });

  it('estimates bitrate when source has no bitrate field', async () => {
    inputMock.getPrimaryVideoTrack.mockResolvedValue({ width: 1920, height: 1080 });
    await processHevcToH264(new Uint8Array([0]), { preset: 'original' });
    const opts = (conversionMock as any).__lastOpts;
    expect(opts.video.bitrate).toBe(8_000_000); // 1080p default
  });

  it('aac audio ≤192k → copy: true', async () => {
    inputMock.getPrimaryAudioTrack.mockResolvedValue({ codec: 'aac', bitrate: 128_000 });
    await processHevcToH264(new Uint8Array([0]), { preset: 'balanced' });
    const opts = (conversionMock as any).__lastOpts;
    expect(opts.audio).toEqual({ copy: true });
  });

  it('aac audio >192k → re-encode', async () => {
    inputMock.getPrimaryAudioTrack.mockResolvedValue({ codec: 'aac', bitrate: 256_000 });
    await processHevcToH264(new Uint8Array([0]), { preset: 'balanced' });
    const opts = (conversionMock as any).__lastOpts;
    expect(opts.audio).toEqual({ codec: 'aac', bitrate: 128_000 });
  });

  it('non-aac audio → re-encode to aac', async () => {
    inputMock.getPrimaryAudioTrack.mockResolvedValue({ codec: 'opus', bitrate: 128_000 });
    await processHevcToH264(new Uint8Array([0]), { preset: 'balanced' });
    const opts = (conversionMock as any).__lastOpts;
    expect(opts.audio).toEqual({ codec: 'aac', bitrate: 128_000 });
  });

  it('no audio track → audio option undefined', async () => {
    inputMock.getPrimaryAudioTrack.mockResolvedValue(null);
    await processHevcToH264(new Uint8Array([0]), { preset: 'balanced' });
    const opts = (conversionMock as any).__lastOpts;
    expect(opts.audio).toBeUndefined();
  });

  it('downscaleTo1080p=true passes width=1920, height=1080, fit=contain', async () => {
    await processHevcToH264(new Uint8Array([0]), { preset: 'balanced', downscaleTo1080p: true });
    const opts = (conversionMock as any).__lastOpts;
    expect(opts.video.width).toBe(1920);
    expect(opts.video.height).toBe(1080);
    expect(opts.video.fit).toBe('contain');
  });

  it('downscaleTo1080p=false (default) does NOT set width/height — 4K passthrough', async () => {
    await processHevcToH264(new Uint8Array([0]), { preset: 'balanced' });
    const opts = (conversionMock as any).__lastOpts;
    expect(opts.video.width).toBeUndefined();
    expect(opts.video.height).toBeUndefined();
  });

  it('uses codec="h264" (not "avc")', async () => {
    await processHevcToH264(new Uint8Array([0]), { preset: 'balanced' });
    const opts = (conversionMock as any).__lastOpts;
    expect(opts.video.codec).toBe('h264');
  });

  it('passes tags as a function that preserves input tags', async () => {
    await processHevcToH264(new Uint8Array([0]), { preset: 'balanced' });
    const opts = (conversionMock as any).__lastOpts;
    expect(typeof opts.tags).toBe('function');
    const sample = { creationDate: '2025-01-01', rotation: 90 };
    expect(opts.tags(sample)).toEqual(sample);
  });

  it('onProgress callback receives raw 0–1 number from Mediabunny', async () => {
    const onProgress = vi.fn();
    const promise = processHevcToH264(new Uint8Array([0]), { preset: 'balanced' }, onProgress);
    // simulate mediabunny emitting progress
    conversionMock.onProgress?.(0.42);
    await promise;
    expect(onProgress).toHaveBeenCalledWith(0.42);
  });

  it('throws when Conversion.init rejects', async () => {
    initMock.mockRejectedValueOnce(new Error('bad'));
    await expect(processHevcToH264(new Uint8Array([0]), { preset: 'balanced' })).rejects.toThrow();
  });

  it('throws when execute rejects', async () => {
    conversionMock.execute.mockRejectedValueOnce(new Error('encode-fail'));
    await expect(processHevcToH264(new Uint8Array([0]), { preset: 'balanced' })).rejects.toThrow();
  });
});
```

- [ ] **Step 3.2: Run, confirm fail**

```bash
npm run test -- tests/lib/tools/process-hevc-to-h264.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 3.3: Implement `src/lib/tools/process-hevc-to-h264.ts`**

Use the skeleton from spec §3.3, but **pull Mediabunny imports with the exact names from Task-1.0-verification**. If the progress-callback API is event-based instead of property-assignment, adapt the `onProgress` wiring accordingly (the test stubs both shapes — keep whichever matches reality, delete the other test case).

**Config-type update (override spec §3.3):**
```ts
export type ProcessHevcConfig = {
  preset: 'original' | 'balanced' | 'small';
  downscaleTo1080p?: boolean;  // default false = 4K-Passthrough
};
```

**Inside the function:** construct `video` options conditionally (API-spike-verified names):
```ts
const videoOptions: Record<string, unknown> = { codec: 'h264', bitrate: videoBitrate };
if (config.downscaleTo1080p) {
  videoOptions.width = 1920;
  videoOptions.height = 1080;
  videoOptions.fit = 'contain';
}
// ... pass videoOptions as conversion.video

// Tags preserved via function-form:
const tagsFn = (inputTags: Record<string, unknown>) => ({ ...inputTags });

// Progress is a single 0–1 number from Mediabunny:
if (onProgress) {
  conversion.onProgress = (progress: number) => onProgress(progress);
}
```

- [ ] **Step 3.4: Run, confirm pass**

```bash
npm run test -- tests/lib/tools/process-hevc-to-h264.test.ts
```

Expected: all green.

- [ ] **Step 3.5: Run full gates**

```bash
npm run check && npm run test
```

- [ ] **Step 3.6: Commit**

```bash
bash scripts/check-git-account.sh
git add src/lib/tools/process-hevc-to-h264.ts tests/lib/tools/process-hevc-to-h264.test.ts
git commit -m "$(cat <<'EOF'
feat(tools): add process-hevc-to-h264 pure orchestrator

Pure-function HEVC→H.264 encoder via Mediabunny + WebCodecs.
Supports three presets (original/balanced/small) mapping to
source-relative bitrates, AAC-passthrough for ≤192 kbps AAC,
4K auto-downscale to 1080p, and metadata preservation.
Mocked unit tests cover preset math, audio branching,
metadata/max-dimension options, onProgress propagation,
and init/execute error branches. Real-encoding verification
is manual across browsers in the smoke-test.

Rulebooks-Read: PROJECT, CONVENTIONS

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `hevc-to-h264` tool-config + registry + slug + content

**Files:**
- Create: `src/lib/tools/hevc-to-h264.ts`
- Create: `tests/lib/tools/hevc-to-h264.test.ts`
- Modify: `src/lib/tool-registry.ts`
- Modify: `src/lib/tools/tool-runtime-registry.ts`
- Modify: `src/lib/slug-map.ts`
- Modify: `tests/lib/slug-map.test.ts` (if enumerates all entries)
- Create: `src/content/tools/hevc-zu-h264/de.md`
- Create: `tests/content/hevc-zu-h264-content.test.ts`

- [ ] **Step 4.1: Write failing config-shape test**

Create `tests/lib/tools/hevc-to-h264.test.ts` (clone of `png-jpg-to-webp.test.ts`):

```ts
import { describe, it, expect } from 'vitest';
import { hevcToH264 } from '../../../src/lib/tools/hevc-to-h264';
import { toolSchema } from '../../../src/lib/tools/schemas';

describe('hevcToH264 config', () => {
  it('passes toolSchema validation', () => {
    const r = toolSchema.safeParse(hevcToH264);
    if (!r.success) throw new Error(JSON.stringify(r.error.issues, null, 2));
    expect(r.success).toBe(true);
  });
  it('id="hevc-to-h264" type="file-tool"', () => {
    expect(hevcToH264.id).toBe('hevc-to-h264');
    expect(hevcToH264.type).toBe('file-tool');
  });
  it('categoryId="video"', () => {
    expect(hevcToH264.categoryId).toBe('video');
  });
  it('accepts mov/mp4/hevc MIME types', () => {
    expect(hevcToH264.accept).toContain('video/quicktime');
    expect(hevcToH264.accept).toContain('video/mp4');
  });
  it('maxSizeMb=500', () => {
    expect(hevcToH264.maxSizeMb).toBe(500);
  });
  it('has pencil-sketch iconPrompt', () => {
    expect(hevcToH264.iconPrompt).toMatch(/pencil/i);
  });
  it('filenameSuffix="_h264"', () => {
    expect(hevcToH264.filenameSuffix).toBe('_h264');
  });
});
```

- [ ] **Step 4.2: Implement `src/lib/tools/hevc-to-h264.ts`**

Match spec §3.2 — iconPrompt is the locked string from the spec, verbatim.

- [ ] **Step 4.3: Register in `src/lib/tool-registry.ts`**

```ts
import { hevcToH264 } from './tools/hevc-to-h264';
// ...
'hevc-to-h264': hevcToH264,
```

- [ ] **Step 4.4: Register runtime in `src/lib/tools/tool-runtime-registry.ts`**

```ts
'hevc-to-h264': {
  process: async (input, config, onProgress) => {
    const { processHevcToH264 } = await import('./process-hevc-to-h264');
    const preset =
      typeof config?.preset === 'string' &&
      (config.preset === 'original' || config.preset === 'balanced' || config.preset === 'small')
        ? config.preset
        : 'balanced';
    const downscaleTo1080p = config?.downscaleTo1080p === true;
    return processHevcToH264(input, { preset, downscaleTo1080p }, onProgress);
  },
  preflightCheck: () =>
    typeof VideoEncoder === 'undefined' || typeof VideoDecoder === 'undefined'
      ? 'Dein Browser unterstützt kein WebCodecs. Desktop-Chrome/Firefox/Edge oder Safari 16.4+ funktionieren.'
      : null,
},
```

- [ ] **Step 4.5: Add slug to `src/lib/slug-map.ts`**

```ts
'hevc-to-h264': { de: 'hevc-zu-h264' },
```

- [ ] **Step 4.6: Update slug-map test if it enumerates**

```bash
npm run test -- tests/lib/slug-map.test.ts
```

If the test counts entries or asserts exact keys, add the new entry.

- [ ] **Step 4.7: Write content `src/content/tools/hevc-zu-h264/de.md`**

Directory-Name = DE-Slug. Use the spec §3.6 locked H2-list (7 items). Frontmatter:
- `toolId: hevc-to-h264`
- `language: de`
- `title: 'iPhone-Video in MP4 umwandeln — HEVC zu H.264 Konverter'` (verify length in 30–60 range)
- `metaDescription`: 140–160 chars, Privacy-Lead.
- `tagline`: ≤200.
- `intro`: 1–2 paragraphs, first 100 words must contain "verlässt deinen Browser nicht" or variant.
- `howToUse`: 3–5 Schritte.
- `faq`: 4–6 Q/A, one **must** be: *"Wie wandle ich ein iPhone-Video in MP4 um ohne es hochzuladen?"*
- `relatedTools`: `['discord-video-komprimieren', 'mp4-zu-webm', 'video-zu-gif', 'video-audio-extrahieren', 'webp-konverter']` (first 4 are Phase-1.5 stubs, `webp-konverter` is live).
- `contentVersion: 1`

Body ≥300 words. H2 order locked per spec. No H1.

- [ ] **Step 4.8: Write `tests/content/hevc-zu-h264-content.test.ts`**

Clone of `webp-konverter-content.test.ts`:
- `toolId: 'hevc-to-h264'`
- `language: 'de'`
- File path: `src/content/tools/hevc-zu-h264/de.md`
- H2 list: 7 items per spec §3.6.

- [ ] **Step 4.9: Run full gates**

```bash
npm run check && npm run test
```

Expected: all green, ~270–275 tests total.

- [ ] **Step 4.10: Commit**

```bash
bash scripts/check-git-account.sh
git add src/lib/tools/hevc-to-h264.ts src/lib/tool-registry.ts src/lib/tools/tool-runtime-registry.ts src/lib/slug-map.ts src/content/tools/hevc-zu-h264/ tests/lib/tools/hevc-to-h264.test.ts tests/content/hevc-zu-h264-content.test.ts
# + tests/lib/slug-map.test.ts if changed
git commit -m "$(cat <<'EOF'
feat(tools): register hevc-to-h264 config + runtime + slug + content

Introduces categoryId "video" (free string, no registry change).
Tool-config accepts MOV/MP4/HEVC with 500 MB cap and the locked
"_h264" filename suffix. Runtime entry lazy-imports the Mediabunny
orchestrator and gates on VideoEncoder/VideoDecoder availability
via preflightCheck. SEO content locks the 7-H2 structure with
AEO-hook FAQ ("wie iPhone-Video in MP4 umwandeln ohne Upload").

Rulebooks-Read: PROJECT, CONVENTIONS, CONTENT

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5 — PREREQUISITE: Design-Skill-Pflicht (CLAUDE.md §5)

Before touching `FileTool.svelte`, the agent MUST invoke in sequence (per CLAUDE.md §5):

- [ ] **Step 5.P1:** Invoke `Skill` tool with `minimalist-ui` skill. Brief: "FileTool.svelte extensions for /de/hevc-zu-h264. New sub-state `preparing` (between idle and converting) shows a mono-text 'Lade Konverter …'. In `converting` state, below the existing filename line, render a progress-text line: e.g. `42 % · ~01:23 verbleibend`, tabular-nums, no animation bar. Preset-chooser (3 buttons: Original-Qualität / Balanced / Klein) sits OUTSIDE the box, analogous to the Converter's quick-value chips and the BG-Remover's format-chooser. **Additionally:** a conditional checkbox-row *„Auf 1080p verkleinern"* (Opt-In for 4K-downscale) appears below the preset-chooser **only** if source-resolution exceeds 1920×1080 — discovered from decoded video-track metadata at drop-time. Default off. Hard-caps: Graphit tokens only, Inter+JetBrains, no hex/px, refined-minimalism."

- [ ] **Step 5.P2:** Invoke `Skill` tool with `frontend-design` skill on top of the minimalist-ui output. Brief: "Refine progress-text typography (tabular-nums critical so digits don't dance), preset-button hover/active micro-interaction, preparing-state typography rhythm. Preserve parity with Converter + BG-Remover. Reconcile conflicts with CLAUDE.md §5 hard-caps in favor of hard-caps (Inter stays, no colored accents)."

- [ ] **Step 5.P3:** Merge both into a single internal design-brief for Task 5. Do NOT write a new design-brief file — keep it in working memory.

---

## Task 5: `FileTool.svelte` extend — preflight hook + progress hook

**Files:**
- Modify: `src/components/tools/FileTool.svelte`
- Modify: `tests/components/tools/filetool.test.ts`

- [ ] **Step 5.1: Write failing tests**

Add two new test cases to `tests/components/tools/filetool.test.ts`:

```ts
it('preflightCheck returning a string sets initial state=error with that message', () => {
  // stub getRuntime to return { process: vi.fn(), preflightCheck: () => 'no webcodecs' }
  // mount, assert state=error + errorMessage contains 'no webcodecs'
});

it('onProgress callback from process() renders percent+eta in converting state', async () => {
  // stub getRuntime.process to call onProgress(0.42) then resolve
  // mount, drop valid file, assert progress text appears during converting
  // FileTool computes ETA from elapsedMs + progress; test asserts "42 %" appears,
  // ETA-format is not asserted (timing-dependent)
});
```

- [ ] **Step 5.2: Run, confirm fail**

```bash
npm run test -- tests/components/tools/filetool.test.ts
```

- [ ] **Step 5.3: Implement preflight-hook in `FileTool.svelte`**

In the mount-effect, after the `OffscreenCanvas` check (if still present for image-tools), invoke `runtime.preflightCheck?.()`. If it returns a non-null string, set `state='error'`, `errorMessage = <returned-string>`, and don't allow drops.

- [ ] **Step 5.4: Implement progress-hook in `FileTool.svelte`**

Mediabunny liefert nur eine 0–1-Zahl, keine ETA. Die ETA berechnen wir selbst aus `elapsedMs`.

- Add `$state<number | null>(null)` named `progress` (raw 0–1 value from runtime).
- Add `$state<number | null>(null)` named `convertStartMs` (`performance.now()` at `state='converting'` transition, reset to null on exit).
- When invoking `runtime.process(inputBytes, config, onProgress)`, pass a callback that sets `progress = p`.
- In the `converting` state's render block, if `progress !== null`, compute:
  ```ts
  const percent = Math.round(progress * 100);
  const elapsedMs = convertStartMs ? performance.now() - convertStartMs : 0;
  const etaSeconds = progress > 0.05 && elapsedMs > 0
    ? (elapsedMs / 1000) * (1 - progress) / progress
    : undefined;
  ```
  Render: `{percent} % · {formatEta(etaSeconds)} verbleibend` (use `tabular-nums` token). If `etaSeconds` is undefined (progress <5 % or no start-time), render just `{percent} %`.
- On state-transition out of `converting`, set `progress = null` and `convertStartMs = null`.

`formatEta(seconds)` helper: `HH:MM:SS` if ≥1 h, else `MM:SS`. Zero-padded. If seconds undefined or ≤0, return empty string (caller handles).

- [ ] **Step 5.4b: Implement conditional 1080p-Downscale-Toggle**

Hevc-specific UI addition — but implemented generically in `FileTool.svelte` via a new config-driven slot pattern so future video tools can reuse it.

- Add new optional field to `FileToolConfig` (in `schemas.ts`): `toggles?: Array<{ id: string; label: string; visibleIf?: 'source-gt-1080p' }>`. For this tool, populate with `[{ id: 'downscaleTo1080p', label: 'Auf 1080p verkleinern', visibleIf: 'source-gt-1080p' }]`.
- Add `$state<Record<string, boolean>>(...)` named `toggles`, initialized from the config's defaults (all false).
- For `visibleIf: 'source-gt-1080p'`, the component must decode the source's resolution **before** showing the toggle. Strategy: on drop, before firing `process`, do a lightweight metadata-probe via Mediabunny's `Input.getPrimaryVideoTrack()` (same API the processor uses) and read `width`/`height`. Cache result in `$state`. **Only** if `width > 1920 || height > 1080`, render the checkbox.
- This probe adds 50–200 ms before `state=converting`. Acceptable — the user sees preparing→converting transition identically.
- Toggle values are merged into the `config` arg passed to `runtime.process` under their `id` keys. So `downscaleTo1080p: true | false` arrives in the process function automatically.
- Toggle state persists across `reset` (user preference); cleared on unmount.
- `data-testid="filetool-toggle-<id>"` on each checkbox for test-targeting.

> **Scope note:** adding `toggles` to the schema is a **template extension** (generic), not a hevc-specific hack. After this session, CONVENTIONS.md documents the pattern so future video-tools (discord-compressor, video-zu-gif) can declare their own toggles without touching `FileTool.svelte` again. If the metadata-probe turns out to be non-trivial across Mediabunny versions (Task 1.0 may surface this), **fall back** to an always-visible checkbox with a label hint *„wirkt nur bei >1080p-Videos"* and skip the resolution-probe. Surface the fallback to the user before committing.

- [ ] **Step 5.4c: Add component-test cases for the toggle**

Add to `tests/components/tools/filetool.test.ts`:

```ts
it('toggle is hidden when source resolution ≤1920×1080', async () => {
  // mock Mediabunny probe to return { width: 1920, height: 1080 }
  // mount with config.toggles containing downscaleTo1080p with visibleIf='source-gt-1080p'
  // drop a file, wait for probe, assert checkbox is NOT rendered
});

it('toggle is shown when source resolution >1920×1080', async () => {
  // mock probe to return { width: 3840, height: 2160 }
  // drop, wait, assert checkbox IS rendered
});

it('toggle value is threaded into runtime.process config', async () => {
  // mock probe 4K, user checks the toggle, drops file
  // assert process called with config including { downscaleTo1080p: true }
});
```

- [ ] **Step 5.5: Run, confirm pass**

```bash
npm run test -- tests/components/tools/filetool.test.ts
```

- [ ] **Step 5.6: Run full gates**

```bash
npm run check && npm run test && npm run build
```

Expected: build produces `/de/hevc-zu-h264` HTML page + new lazy chunk for Mediabunny. Note chunk sizes.

- [ ] **Step 5.7: Commit**

```bash
bash scripts/check-git-account.sh
git add src/components/tools/FileTool.svelte tests/components/tools/filetool.test.ts
git commit -m "$(cat <<'EOF'
feat(filetool): add preflight-check + progress-report hooks

Two generic FileTool extensions: (1) runtime.preflightCheck
short-circuits to error-state on mount (used by hevc-to-h264
to gate WebCodecs availability, extensible to any browser-API-
dependent tool); (2) onProgress callback threading renders a
percent+ETA line in converting state (tabular-nums, no bar,
refined-minimalism). Both are opt-in — existing png-jpg-to-webp
and remove-background runtimes keep current behavior.

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Manual smoke-test + web-design-guidelines audit

- [ ] **Step 6.1: Start dev server**

```bash
npm run dev
```

Open `http://localhost:4321/de/hevc-zu-h264`.

- [ ] **Step 6.2: Golden path (Desktop Chrome)**

- Drop a real iPhone `.MOV` (HEVC + AAC), ≤50 MB: `preparing` 1–2 s → `converting` with progress ticking → `done`. Click download → saves `<name>_h264.mp4`. **Play the downloaded MP4 in VLC + Windows Media Player + Chrome video-tag** — verify video + audio. Check `ffprobe` on the file: confirm H.264 video codec, AAC audio codec, `creation_time` preserved.
- Drop a 300 MB MOV: gradual progress, no UI freeze (tolerable stutter OK).
- Drop a 4K MOV (if available), Toggle OFF: output stays 4K; done-state shows *„Original-Auflösung beibehalten: 3840×2160"*.
- Drop a 4K MOV with Toggle ON (*„Auf 1080p verkleinern"*): output is 1920×1080; done-state shows *„Auf 1080p verkleinert (von 3840×2160)"*.
- Drop a 1080p MOV: Toggle-Checkbox is **not rendered** (only appears for >1080p source).
- Drop an HDR iPhone video (if available, Dolby-Vision active): encode succeeds silently, no warning modal, FAQ explains the color-flatness on HDR displays.

- [ ] **Step 6.3: Preset verification**

Currently preset-re-encode-on-change is **out of scope** (§2.2). Verify the spec-decision is still right by observing user-flow friction: is re-drop-to-re-preset painful enough to block MVP? If yes, surface to user; if no, proceed.

- [ ] **Step 6.4: Edge cases**

- Drop a `.jpg` → error "Nur Video-Dateien werden unterstützt."
- Drop an empty/corrupt MOV → error from Mediabunny init.
- Drop 600 MB file → oversize-error before any processing.
- Firefox Desktop (130+): same happy path works.
- Safari 16.4+: same happy path works.
- Firefox Android (if available): preflight-error with fallback text.
- iPhone Safari (real device): 50 MB MOV completes. Larger files may OOM — that's the warn-messaging path.

- [ ] **Step 6.5: Theme + responsive**

- Light/Dark toggle: progress text readable in both.
- Mobile 375px: preset-chooser buttons wrap cleanly, dropzone tap-target ≥44 px.
- Keyboard-only: Tab to dropzone → Enter opens picker. Tab to presets → Enter selects. Tab to download → Enter saves.

- [ ] **Step 6.6: Invoke `web-design-guidelines` skill as audit-pass**

Via `Skill` tool. Target files:
- `src/components/tools/FileTool.svelte` (only the changed progress + preparing + preflight-error blocks)
- `src/content/tools/hevc-zu-h264/de.md` (content-audit — verify AEO-hook + Privacy-Lead + tone)

Apply Important-severity findings only. Do NOT re-apply prior session audit findings.

- [ ] **Step 6.7: Apply audit fixes + re-run gates**

```bash
npm run check && npm run test && npm run build
```

- [ ] **Step 6.8: Commit audit fixes** (if any Important findings; else skip)

```bash
git commit -m "$(cat <<'EOF'
fix(audit): web-design-guidelines pass on hevc-to-h264

Apply Important-severity findings from the post-implementation
audit on FileTool progress-rendering and the hevc-zu-h264 content.

Rulebooks-Read: PROJECT, STYLE, CONTENT

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: PROGRESS.md + final commit

**Files:**
- Modify: `PROGRESS.md`

- [ ] **Step 7.1: Update PROGRESS.md**

- Add Phase 1 row for this session with ✅ + deliverables list.
- Extend Tool-Inventar table with `hevc-zu-h264` row: ✅ Config / ✅ Content-DE / ⬜ Icon / ✅ Tests.
- Add next-session follow-ups:
  - User-Smoke-Test auf echtem iPhone (iOS 16+).
  - Icon-Generierung in Recraft → BG-Remover → WebP-Pipeline.
  - Preset-Re-Encode-on-Change evaluieren (falls Smoke-Test Pain zeigt).
  - Opt-Out-Metadata-Toggle (V1.1).
- Bump "Letztes Update" to 2026-04-20.

- [ ] **Step 7.2: Final commit**

```bash
bash scripts/check-git-account.sh
git add PROGRESS.md
git commit -m "$(cat <<'EOF'
docs(progress): Phase 1 — hevc-to-h264 video-tool shipped

First video-tool of the Konverter-Webseite live at /de/hevc-zu-h264.
FileTool.svelte extended with preflight-check + progress-reporting
hooks (generic, opt-in). Mediabunny locked as primary video-encode
engine. Next: real-iPhone smoke-test + icon-pipeline + Phase-1.5
sibling tools (discord-compressor, mp4-zu-webm, video-zu-gif,
video-audio-extrahieren).

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE, CONTENT

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 7.3: STOP** per CLAUDE.md session-ritual. Do NOT push — user's call.

---

## Failure Modes & Recovery

| Problem | Recovery |
|---|---|
| Mediabunny API names differ from verified spike (2026-04-20) | API-spike erledigt. Wenn Lib-Upgrade später Namen ändert, Upgrade pausieren und Spec patchen. |
| Audio `{ copy: true }` silently re-encodes oder wirft | Fallback in `process-hevc-to-h264.ts`: `{ codec: 'aac', bitrate: audioTrack.bitrate }` für AAC-Input. Kein User-Impact (Qualität bleibt identisch, ~10–20 % längere Encode-Zeit). |
| Tags-Funktion `tags: (t) => ({...t})` übernimmt keine Rotation-Flags | Drop Rotation-Preservation aus V1 (§4.5) + done-state message tweak. Creation-Date + GPS bleiben. |
| Mediabunny `fit: 'contain'` erzeugt Letterbox statt Stretch-Erwartung | `fit: 'contain'` ist korrekt (keine Verzerrung). Falls User Stretch erwarten, dokumentieren, nicht ändern. |
| Metadata-probe (resolution-read) before `state=converting` takes >500 ms | Fall back to an always-visible 1080p-checkbox with hint *„wirkt nur bei >1080p-Videos"*. Document deviation in PROGRESS.md. |
| Bundle-size explodes (>200 kB gzip) on the `/de/hevc-zu-h264` route | Tree-shaking check — ensure only the H.264-encode path of Mediabunny is imported, not all formats. If unavoidable, accept as trade-off and note in PROGRESS. |
| iPhone Safari consistently OOMs at <250 MB | Tighten the UI-warning threshold to 150 MB + `navigator.deviceMemory`-aware cap. Spec-patch §4.2. |
| Progress-callback never fires (lib doesn't emit until end) | Mediabunny limitation. Fall back to indeterminate-state message *"Konvertiert … das kann einige Minuten dauern."* Spec-patch §4.1. |
| WebCodecs-H.264-encode unsupported in a tested browser that was expected to work | Add that browser to the `preflightCheck`-rejection list with a clear message. Spec-patch §2.3 browser-table. |
| AdSense-Phase-2 test (much later) reveals COOP/COEP conflict despite Mediabunny | Surface immediately — may need to host video-tools on a sub-domain without AdSense. Not a V1 blocker. |
| Content test fails because frontmatter length constraints are tight | Iterate strings until they fit — routine content-editing, not a spec deviation. |
| Skill-tool invocations in Task 5.P1/P2 conflict with CLAUDE.md §5 hard-caps (colored accents, hex, animation-heavy progress-bar) | Ignore the conflicting parts per CLAUDE.md §5 override-rule. Document only the conforming guidance. |

---

## Definition of Done

- [ ] 7 base commits landed on a Phase-1 branch (not main directly) in the order above. Plus 1 optional audit-fix commit (Task 6.8) if `web-design-guidelines` finds Important-severity issues.
- [ ] `/de/hevc-zu-h264` works end-to-end in Chrome + Firefox + Safari (Desktop) and Safari (iPhone real device, ≤50 MB input) for a real HEVC MOV.
- [ ] Downloaded MP4 plays in VLC + Windows Media Player + Chrome video-tag. `ffprobe` confirms H.264 + AAC codecs and preserved creation-time metadata.
- [ ] All 4 error paths (wrong-format, oversize, preflight-fail, Mediabunny-encode-fail) show correct inline messages with helpful recovery hints.
- [ ] Light + Dark mode clean. Mobile 375px clean. Keyboard-only navigation works.
- [ ] `npm run check` = 0/0. `npm run test` all green. `npm run build` produces page for hevc-zu-h264 and verifies no bundle-size-regression on OTHER tool pages (Mediabunny stays lazy).
- [ ] PROGRESS.md reflects Phase 1 Session done + follow-ups documented.
- [ ] PROJECT.md locked mediabunny version.
- [ ] No push to origin — user's call per CLAUDE.md session-ritual.
