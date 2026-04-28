# Mobile-ML-Hardening Implementation Plan

**Branch:** `feat/mobile-ml-hardening`
**Datum:** 2026-04-28
**Auslöser:** "Failed to fetch" auf Handy bei Bild-Hintergrund-entferner
**Research-Inputs:**
- `inbox/to-claude/2026-04-28-mobile-ml-bg-removal-research.md` (BG-Removal, fertig)
- `inbox/to-claude/2026-04-28-mobile-ml-tools-audit.md` (6 weitere ML-Tools, async-running)

## Goal

Alle 7 ML-Tools (`remove-background`, `video-bg-remove`, `audio-transkription`, `speech-enhancer`, `bild-zu-text`, `ki-text-detektor`, `ki-bild-detektor`) müssen auf Mobile UND Desktop zuverlässig funktionieren. Pattern wird in `CONVENTIONS.md §10.9` gelockt, sodass künftige ML-Tools automatisch konform sind.

## Out of Scope

- **Cloudflare R2-Provisioning** — Code-Pfad wird gebaut (`env.remoteHost`-Switch hinter Build-Time-Env-Var), aber das Bucket-Setup, CORS-Config, Custom-Domain-Setup macht der User außerhalb dieses Plans.
- **Worker-Refactor existierender Main-Thread-Tools** — `CONVENTIONS.md §10.8` verbietet das explizit. Mobile-Awareness ist orthogonal zur Worker-Frage.
- **Realer iOS-Smoke-Test** — wir können auf BrowserStack/Sauce Labs nicht zugreifen. Final-Verification bleibt manuelle User-Aufgabe.
- **Phase-3-Sprachen** (es/fr/pt-br) — Banner-Strings nur DE+EN.

## Architektur

### Drei neue Foundation-Module

1. **`src/lib/tools/ml-device-detect.ts`** — pure, testbar
   ```ts
   export type DeviceClass = 'fast-mobile' | 'capable-mobile' | 'desktop';
   export interface DeviceProbe {
     class: DeviceClass;
     hasWebGPU: boolean;
     hasReducedRam: boolean;     // navigator.deviceMemory < 4 (Chromium-only)
     isSlowConnection: boolean;  // 'slow-2g' | '2g' | '3g' | saveData
     isMobileUA: boolean;        // iPhone|iPad|Android|Mobile|Tablet
   }
   export async function detectMlDevice(): Promise<DeviceProbe>;
   export function pickVariant(probe: DeviceProbe, supported: VariantId[]): VariantId;
   ```

2. **`src/lib/tools/ml-mirror.ts`** — pure, testbar
   ```ts
   // Liest Build-Time-Env (`PUBLIC_ML_MIRROR_HOST`) ODER window-Override.
   // Setzt `env.remoteHost` von `@huggingface/transformers` falls konfiguriert.
   // Kein Auto-Fallback-bei-HF-Fail (wäre eigene Retry-Layer, später).
   export function applyMlMirrorIfConfigured(): { mirrored: boolean; host: string | null };
   ```

3. **`src/lib/tools/ml-variants.ts`** — pure, testbar
   ```ts
   // Pro Tool eine Variant-Map mit { id, modelId, sizeBytes, dtype, license }
   export type VariantId = 'fast' | 'quality' | 'pro';
   export interface MlVariant {
     id: VariantId;
     modelId: string;          // HF-Repo-ID
     sizeBytes: number;        // ECHT, vom HF-Repo verifiziert
     dtype: 'fp32' | 'fp16' | 'q8' | 'q4';
     deviceClass: DeviceClass[]; // welche Devices dürfen diese Variant
   }
   export const VARIANTS: Record<ToolId, MlVariant[]>;
   ```

### Erweiterung der Runtime-Registry-Schnittstelle

```ts
// src/lib/tools/tool-runtime-registry.ts
export interface ToolRuntime {
  process: ProcessFn;
  prepare?: (opts: PrepareOpts) => Promise<void>;  // <-- neu: opts statt nur progress
  reencode?: ReencodeFn;
  isPrepared?: () => boolean;
  clearLastResult?: () => void;
  preflightCheck?: () => string | null;
  // NEU:
  variants?: MlVariant[];            // wenn vorhanden → Tool ist mobile-aware
  pickDefaultVariant?: (probe: DeviceProbe) => VariantId;
}

export interface PrepareOpts {
  variant?: VariantId;             // explizit gewählt (User-Override)
  onProgress: (e: { loaded: number; total: number }) => void;
  stallTimeoutMs?: number;          // Mobile: 240_000, Desktop: 60_000
}
```

Backward-Compatible: `prepare?(onProgress)` — wenn nur Function → wrap in `{ onProgress }`.

### FileTool.svelte UI-Erweiterungen

Drei neue State-Slots:
- `deviceProbe = $state<DeviceProbe | null>(null)` — bei Mount geprobed
- `selectedVariant = $state<VariantId | null>(null)` — User-Override oder auto-pick
- `stalled = $state<boolean>(false)` — gesetzt von StallError-Catch, zeigt Retry-UI

Drei neue UI-Blöcke:
1. **Mobile-Banner** vor `idle`-Dropzone, wenn `runtime.variants` vorhanden:
   > "Lädt einmalig **6,6 MB**-Modell. Datenverbrauch nur beim ersten Mal — danach offline nutzbar."
   Mit "Qualität wechseln (115 MB)"-Link wenn andere Varianten verfügbar.
2. **Stall-Recovery-Banner** wenn `stalled === true`:
   > "Download stockt. **Erneut versuchen** oder zur **Schnell-Variante** (6,6 MB) wechseln."
3. **Retry-Button** im error-State, gekoppelt an `selectedVariant`.

### i18n-Strings (DE+EN)

```ts
// src/lib/i18n/strings.ts (additions in fileTool namespace)
mlBannerOneTime: 'Lädt einmalig {size}-Modell. Datenverbrauch nur beim ersten Mal — danach offline nutzbar.',
mlBannerSwitchQuality: 'Qualität wechseln ({size})',
mlBannerSwitchFast: 'Schnell-Variante ({size})',
mlStalledTitle: 'Download stockt.',
mlStalledRetry: 'Erneut versuchen',
mlStalledFallback: 'Zur Schnell-Variante wechseln',
mlVariantFast: 'Schnell',
mlVariantQuality: 'Qualität',
mlVariantPro: 'Maximum',
```

### Device-Class-Variant-Matrix

| Tool | fast-mobile | capable-mobile | desktop | desktop+webgpu |
|---|---|---|---|---|
| `remove-background` | MODNet-Q8 (6,6 MB) | MODNet-Q8 | BiRefNet_lite-FP16 (115 MB) | BEN2 opt-in |
| `video-bg-remove` | (deaktiviert/Banner) | MODNet-speed | BiRefNet_lite-quality | BiRefNet_lite-quality |
| `audio-transkription` | whisper-tiny | whisper-tiny | whisper-base | whisper-base/small |
| `speech-enhancer` | DeepFilterNet3 | DeepFilterNet3 | DeepFilterNet3 | DeepFilterNet3 (klein genug) |
| `bild-zu-text` | Tesseract deu (Banner) | Tesseract deu+eng | Tesseract deu+eng | Tesseract deu+eng |
| `ki-text-detektor` | TBD nach Research | TBD | TBD | TBD |
| `ki-bild-detektor` | TBD nach Research | TBD | TBD | TBD |

Die "Mobile-disable mit Banner"-Option ist für Tools, deren kleinste Variante immer noch >150 MB ist.

## Phasen + Commits

Jede Phase = ein logischer Commit mit `Rulebooks-Read:`-Trailer.

### Phase 1 — Foundation Modules
**Commit: `feat(ml): mobile-aware device detection + mirror config + variant map`**
- `src/lib/tools/ml-device-detect.ts` + Tests
- `src/lib/tools/ml-mirror.ts` + Tests
- `src/lib/tools/ml-variants.ts` (initial: nur `remove-background`)
- Vitest grün

### Phase 2 — i18n Banner-Strings
**Commit: `feat(i18n): mobile-ML-banner strings DE/EN`**
- `src/lib/i18n/strings.ts` Erweiterung
- Tests grün

### Phase 3 — FileTool.svelte UI
**Commit: `feat(filetool): mobile-banner + retry-UI + variant-switcher`**
- Banner vor Dropzone
- Stall-Banner + Retry
- Variant-Switcher-Link
- Tests + Component-Tests

### Phase 4 — remove-background Switch
**Commit: `feat(remove-bg): three-tier model switch (MODNet/BiRefNet_lite/BEN2)`**
- `remove-background.ts` akzeptiert `variant`-Parameter
- `tool-runtime-registry.ts` integration
- `hintergrund-entferner.ts` config
- Watchdog 240/60s Mobile/Desktop
- Tests grün

### Phase 5 — Research-Report 2 lesen + Plan patchen
**Kein Commit** — Plan-Update inline.
- Lesen `inbox/to-claude/2026-04-28-mobile-ml-tools-audit.md`
- Variant-Matrix konkretisieren für die 5 anderen Tools

### Phase 6-10 — Remaining 5 Tools
Je ein Commit pro Tool:
- `feat(video-bg): mobile-aware variant routing`
- `feat(audio-transkription): mobile-aware whisper-tiny default + retry`
- `feat(speech-enhancer): mobile-aware retry + watchdog tune`
- `feat(bild-zu-text): mobile-aware Tesseract retry`
- `feat(ki-detektoren): mobile-aware ki-text + ki-bild`

### Phase 11 — Spec
**Commit: `docs(conventions): §10.9 Mobile-Awareness-Pattern für ML-Tools`**
- `CONVENTIONS.md` neue Sektion §10.9
- Erklärt: device-detect, variant-map, mirror, retry, watchdog
- Pflicht für alle künftigen ML-Tools

### Phase 12 — PROGRESS.md + Final
**Commit: `chore: PROGRESS.md mobile-ML-hardening Sweep + memory update`**
- PROGRESS.md update
- MEMORY.md update
- alle Tests grün
- `astro check` grün

## Verifikations-Schritte (jede Phase)

```
npm run check         # tsc + astro check
npm test              # Vitest
bash scripts/check-git-account.sh
```

## Risk-Register

| Risk | Mitigation |
|---|---|
| MODNet-Output-Qualität auf Nicht-Personen-Bildern schlechter als BEN2 | User kann via Variant-Switcher auf Quality wechseln; Banner kommuniziert die Wahl |
| Transformers.js v4 hat den iOS-v3-Crash-Bug noch | Watchdog + Retry-UI fängt es; im error-State wird die Schnell-Variante als Fallback angeboten |
| Tesseract-Lang-Daten nicht splittbar in Tesseract.js | Banner zeigt Größe; auf Mobile-Fast nur deu, ohne eng |
| Whisper-Q8-Bug (DequantizeLinear) noch offen | Bleiben bei FP32 für audio-transkription, akzeptieren 39 MB statt 10 MB für tiny |
| ki-text/ki-bild-Modelle haben keine Mobile-Variante | Banner mit "Aktuell nur Desktop empfohlen" + nicht-blockierender Hinweis |

## Open Questions (vor Phase 6+)

1. Hat `Xenova/whisper-tiny` heute einen Q8 oder Q4-Export? (Research-Subagent klärt)
2. Welche Lizenz hat `onnx-community/SMOGY-Ai-images-detector-ONNX`? (Research-Subagent klärt)
3. Welche Lizenz hat `onnx-community/tmr-ai-text-detector-ONNX`? (Research-Subagent klärt)
4. Tesseract.js v6+: Mobile-Bugs auf iOS Safari? (Research-Subagent klärt)
