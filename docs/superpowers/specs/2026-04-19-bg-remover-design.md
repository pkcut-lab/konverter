# Hintergrund-Entferner — Design Spec

**Status:** Draft v1 (2026-04-19, post-Session-8 brainstorming)
**Slug (DE):** `/de/hintergrund-entfernen`
**Tool-ID:** `remove-background`
**Tool-Type:** `file-tool`
**Phase-Zuordnung:** Phase 0 (drittes Prototyp-Tool nach `meter-zu-fuss` und `webp-konverter`)
**Spec-Author:** Claude (Opus 4.7)
**Brainstorming-Skill:** `superpowers:brainstorming` (gefolgt — alle 6 Q's beantwortet, Architektur-Entscheidung getroffen)

---

## 1. Zweck und Kontext

### 1.1 Doppelter Hebel

Das Tool dient gleichzeitig zwei Zwecken:

1. **Eigenständiges Konverter-Tool** auf der Webseite — Nutzer laden ein Bild hoch und erhalten ein PNG mit transparentem Hintergrund.
2. **Zweiter Schritt der internen Icon-Pipeline:** Recraft.ai liefert nur Bilder mit weißem Hintergrund. Damit unsere Tool-Icons (Pencil-Sketches) später per `filter: var(--icon-filter)` auf jedem Theme-Hintergrund funktionieren, müssen sie freigestellt sein. Pipeline: Recraft → BG-Remover → WebP-Konverter → 160×160-Icon.

Das Tool bekommt also User-Traffic UND wird intern verwendet — verifiziert das `FileTool`-Template auch für schwere ML-Modelle und schließt eine Lücke in unserer eigenen Asset-Pipeline.

### 1.2 Spec-Kontext (Konverter-Webseite)

Die Konverter-Webseite ist eine multilinguale Astro-5-SSG-Plattform mit 1000+ Tools, finanziert über AdSense (Phase 2+), entwickelt mit Karpathy-Disziplin (Surgical Changes, Goal-Driven Execution, Simplicity First). Vollständige Spec: `docs/superpowers/specs/2026-04-17-konverter-webseite-design.md` v1.1.

Relevante Constraints für dieses Tool:
- **Privacy-First** (Non-Negotiable #2): Datei darf das Gerät nicht verlassen.
- **Section 7a Worker-Fallback-Exception:** ML-Tools dürfen unter 6 Bedingungen einen Server-Worker haben. **Wir nutzen das in V1 NICHT** — pure-client only.
- **Refined-Minimalism-Aesthetic:** Graphit-Tokens, Inter + JetBrains Mono, keine Akzent-Farben außer Olive-Success / Rust-Error.
- **Keine externen Network-Dependencies zur Runtime** außer Modell-Download beim ersten Upload (separat erlaubt durch §7a-ähnlichen Modell-CDN-Pfad — siehe §10.3).

---

## 2. User-Story und MVP-Scope

### 2.1 Primary User Story

> **Als** Webseiten-Besucher
> **möchte ich** ein Bild hochladen und dessen Hintergrund automatisch entfernen lassen, ohne mich zu registrieren oder die Datei hochzuladen,
> **damit** ich ein freigestelltes PNG/WebP/JPG für mein Projekt herunterladen kann.

### 2.2 MVP-Scope (V1) — „MVP-Plus"

**Drin:**
- **Vier Upload-Wege** (Differenzierung gg. Konkurrenz):
  1. Drag-&-Drop auf die Card.
  2. Click-Browse via Button.
  3. **Clipboard-Paste (Ctrl/Cmd+V)** — `paste`-Event-Listener auf der Tool-Card; akzeptiert nur Image-Items.
  4. **Mobile-Kamera direkt** — sekundärer Button „Foto aufnehmen" mit `<input type="file" accept="image/*" capture="environment">`. Wird auf Desktop ausgeblendet via Pointer/Hover-Media-Query.
- **Format-Liste:** `accept: image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif`. Max **15 MB** (iPhone-HEIC-Fotos liegen oft bei 5–12 MB).
  - **HEIC/HEIF-Decode:** `heic2any` (~30 KB gzip, MIT) wird **dynamisch** importiert nur wenn die Datei eine HEIC/HEIF-MIME oder Endung hat → konvertiert intern zu PNG-Blob, ab da läuft der normale Pfad. Safari kann HEIC nativ via `createImageBitmap` — Library wird dort übersprungen.
  - **AVIF:** kein Polyfill nötig — Chrome/Firefox/Safari 16+ dekodieren nativ via `createImageBitmap`.
- Auto-Process bei Upload (kein „Start"-Button) — exakt wie bei `webp-konverter`.
- **Format-Chooser** vor Download: `PNG (mit Alpha)` als Default · `WebP (mit Alpha)` · `JPG (mit weißem Hintergrund)`.
- Download-Button mit korrektem Filename (Original-Stem + Suffix `_no-bg` + Extension).
- Reset-Button (zurück zu `idle`).
- Vor-/Nach-Vergleich: Größen-Differenz wie bei FileTool, plus Mini-Preview-Thumbnail des Ergebnisses (transparent-checkerboard-Hintergrund per CSS, damit Transparenz sichtbar ist).

**Draußen (Out of Scope — siehe §13):**
- URL-Input (CORS-Problem → Phase 2 mit eigenem R2-Proxy), Edge-Feather-Slider, Replace-Background-Color-Picker, Worker-Fallback, Batch-Processing, History.

### 2.3 Sekundäre Story (intern)

> **Als** Icon-Pipeline-Schritt
> **nehme ich** das Recraft-PNG mit weißem Hintergrund **entgegen** und gebe ein PNG mit Alpha-Kanal aus, das anschließend dem WebP-Konverter übergeben wird.

Diese Story braucht **kein eigenes UI** — sie nutzt das normale User-UI des Tools.

### 2.4 Differenzierung (HART, gemäß CLAUDE.md §6)

> **Recherche-Quellen:** Subagent-Report 2026-04-19 (Top 7 Konkurrenten + User-Wünsche aus Reddit/HN/Trustpilot/ProductHunt 2024–2026 + 2026-Trends). Vollständige Matrix im Subagent-Output (extern dokumentiert).

#### Wettbewerbs-Befund (Kurz)

| Konkurrent | Modell | Privacy | Free-Tier-Schmerz |
|------------|--------|---------|-------------------|
| [remove.bg](https://www.remove.bg) | Server-side U2-Net | Server-Upload, Retention opaque | 1 HD/Tag mit Account, Preview-Paywall |
| [Adobe Express](https://www.adobe.com/express/feature/image/remove-background) | Server-side Sensei | Adobe-ID Pflicht | Lock-in |
| [Canva](https://www.canva.com/features/background-remover/) | Server-side | Account, server | Pro-only Paywall |
| [Photoroom](https://www.photoroom.com/tools/background-remover) | Server + AI Scenes | GDPR-claim, Server | Watermark auf Batch |
| [Slazzer](https://www.slazzer.com) | Server | Server | 2 HD/Monat free |
| [Cleanup.pictures](https://cleanup.pictures) | Server (Stability AI) | Server | Res-Cap |
| [Pixian.ai](https://pixian.ai) | Server, Quality-Focus | Server, "no permanent storage" | Preview-Res free, HD paid |

**Schlüsselbefund:** ALLE Mainstream-Player sind serverseitig. Kein dominanter Privacy-First-Pure-Browser-Player im DE/EN/ES/FR/PT-BR-Markt. Das ist unser **strategisches White-Space-Window**.

#### A. Baseline-Features (Mindest-Scope — was JEDER Konkurrent hat)

1. Drag-&-Drop + Click-Browse-Upload.
2. PNG-Output mit Alpha.
3. JPG-Input (Pflicht — am häufigsten).
4. Vor-/Nach-Vergleich.
5. Direct-Download ohne Reload.
6. Mobile-fähige Touch-Drop-Zone.

→ Alle in V1 enthalten (siehe §2.2).

#### B. Differenzierungs-Features (Hebel — was KEINER der 7 Konkurrenten gut macht)

1. **100 % client-side, kein Server-Upload** — Privacy-as-a-Feature. Subagent-Quote: *„Ich lade kein Foto meines Kindes auf irgendeinen Server, damit die ihr nächstes Modell darauf trainieren."* Wedge, den große Konkurrenten nur durch Komplettrebuild kopieren könnten.
2. **HEIC/HEIF-Direkt-Support** — ~70 % aller Smartphone-Fotos sind 2026 HEIC; Konkurrenten lehnen ab oder konvertieren still. Wir lesen direkt via `heic2any` Lazy-Load.
3. **WebP-Transparent-Output** — kleinerer File-Size als PNG mit Alpha. Konkurrenz bietet meist nur PNG. (AVIF-Transparent für später, siehe §13.)
4. **Clipboard-Paste (Strg+V)** als First-Class-Upload — Power-User-Wedge gegen Click-only-Konkurrenz.
5. **Mobile-Kamera-Capture-Button** — `<input capture="environment">` in 2 Taps zum Ergebnis. Kein Konkurrent außer Photoroom (deren Mobile-App, nicht Web) bietet das im Web.
6. **Null Friktion:** kein Watermark, kein Limit, keine Registrierung, kein Cookie-Banner-Pflicht-Klick (DSGVO-Default-deny). Spricht 100 % der „Bait-and-Switch-Paywall"-Trustpilot-Beschwerden direkt an.
7. **Privacy-Lead-Headline** im H1 + Meta-Description: „Hintergrund entfernen — dein Bild verlässt nie deinen Browser." Differenzierende SEO-Position für AEO/Voice-Search („wie kann ich Hintergrund entfernen ohne hochzuladen?").
8. **DE-Long-Tail-Slug-Strategie:** Tool antwortet auf `/de/hintergrund-entfernen` (Hauptslug) — zusätzliche Content-Variant-Slugs `/de/hintergrund-entfernen-ohne-anmeldung` und `/de/png-transparent-machen` werden in Phase 1 als 301 oder eigene Content-Pages mit Canonical aufgebaut (Plan-Phase 2 entscheidet, je nach AEO-Strategie).
9. **Schema.org-Markup:** `SoftwareApplication` + `HowTo` + `FAQPage` mit expliziter „kein Upload"-Antwort-String — optimiert für Perplexity/ChatGPT-Citations.
10. **Tool-Chain-Hint:** Done-State zeigt Link „Jetzt zu WebP konvertieren →" zum existierenden `/de/webp-konverter`. Skaliert mit dem 1000-Tool-Ökosystem als Moat.

#### C. Bewusste Lücken (NICHT bauen + Begründung)

| Feature | Warum NICHT in V1 |
|---------|-------------------|
| AI-Background-Replacement (DALL-E-Stil) | Benötigt Server-API → bricht Privacy-Promise. Kein Workaround in pure-client. |
| Batch-Upload (mehrere Bilder gleichzeitig) | Pain-Point in User-Reviews bestätigt, aber V1-Scope-Schutz. **Re-evaluiert in Phase 3.** |
| Edge-Refine-Brush (Canvas-basiert) | User-Wunsch bestätigt; technisch ohne ML machbar; aber doppelter UI-Stack (Brush + Tool-Layout) → V1.1. |
| URL-Input | CORS-Komplexität, Phase 2 mit R2-Proxy. |
| AVIF-Transparent-Output | Browser-Encoder-Unterstützung 2026 noch uneinheitlich (Chromium teils mit Flag). Re-evaluiert wenn `canvas.convertToBlob('image/avif')` in 90 % der Ziel-Browser stable ist. |
| EXIF/Color-Profile-Preserve | Photographen-Wunsch; Pure-Client-Pfad mit `createImageBitmap` verliert EXIF. Lösbar mit `piexifjs`-Lazy-Load — V1.1 wenn Photo-Pro-Segment Traffic zeigt. |
| Manuelle Eraser-Tools | „Konkurrenz hat das, aber bricht den Refined-Minimalism-Look + USP „schnell + privat"." |

#### D. Re-Evaluation-Trigger

- **Phase 2 Analytics:** Bounce-Rate >50 % auf `/de/hintergrund-entfernen` → Konkurrenz-Vergleich erneut, Headline + Above-the-Fold-Copy schärfen.
- **User-Feedback-Threshold:** ≥5 unabhängige Anfragen nach einem C-Listen-Feature (z.B. Batch) → in V1.1 evaluieren.
- **Modell-Refresh:** Alle 6 Monate prüfen, ob neue Modelle (`<50 MB SOTA` erwartet EOY 2026) BEN2 in Bandwidth + Quality ablösen — dann Lazy-Migration ohne Code-Änderung am Tool, nur Config-Tausch.
- **Trend-Refresh:** Alle 6 Monate Sub-Sektion C/D auf Aktualität prüfen (Browser-AVIF-Encoder, neue Format-Standards, AEO-Patterns).

---

## 3. Tech-Stack-Entscheidungen (gelockt)

### 3.1 Modell und Library

| Wahl | Begründung |
|------|------------|
| **`@huggingface/transformers` v4** (npm: `@huggingface/transformers`) | MIT-Lizenz. WebGPU-Support out-of-the-box. WASM-Fallback automatisch. Aktiv gepflegt durch Hugging Face. |
| **`onnx-community/BEN2-ONNX`** (Huggingface Hub) | MIT-Lizenz. ~110 MB. State-of-the-art Background-Removal-Qualität (besser als U2Net/MODNet/RMBG-1.4 in 2025-Benchmarks). Inference: ~100–200 ms WebGPU, ~1–3 s WASM. |
| **NICHT `@imgly/background-removal`** | AGPL-3.0 — würde uns zu Source-Disclosure unseres gesamten Webseiten-Codes zwingen. **Disqualifiziert.** |
| **NICHT `briaai/RMBG-1.4` oder `RMBG-2.0`** | CC-BY-NC (non-commercial only). Da wir AdSense schalten, ist die Nutzung kommerziell. **Disqualifiziert.** |

### 3.2 Lade-Strategie

- **Trigger:** Modell-Download startet beim **ersten Upload** des Users, NICHT beim Page-Load (sparen Bandbreite für Bouncer).
- **Anzeige:** Meta-Zeile unter Dropzone informiert vorab: „Erste Nutzung lädt einmalig ~110 MB Modell (anschließend offline verfügbar)."
- **Cache:** Hugging Face's interner IndexedDB-Cache wird genutzt (default-Verhalten von Transformers.js v4) → 2. Upload überspringt Download komplett.
- **Singleton:** `removeBackgroundPipeline` lebt als Modul-Level-Promise in `src/lib/tools/remove-background.ts`. Erster `removeBackground()`-Call löst Pipeline-Init aus, alle weiteren Calls warten auf dasselbe Promise.

### 3.3 Worker-Fallback

**V1: Bewusst NICHT umgesetzt.** Pure-Client-Default. Sektion 7a der Master-Spec erlaubt einen serverseitigen Fallback für Mobile/explizite User-Wahl, aber:
- Vor Phase-2-Analytics fehlt uns die Datenbasis, um zu entscheiden, wann der Fallback wirklich nötig ist.
- Worker-Fallback bedeutet: eigene Sub-Domain `api.konverter.app` + CORS + DSGVO-Eintrag + UI-Hint — Infra, die wir vor CI/CD (Session 10) nicht aufbauen wollen.
- BEN2 in WebGPU läuft auf modernen Mobile-Browsern (Chrome Android 121+, Safari iOS 18+) mit akzeptabler Performance.

**Phase 2 Re-Evaluation:** Falls Analytics (Plausible o.ä., final festgelegt in Phase-2-Setup) zeigen, dass >5 % der Mobile-Sessions an OOM scheitern, triggert das einen separaten Worker-Fallback-Spec.

---

## 4. Tool-Config

### 4.1 Datei: `src/lib/tools/hintergrund-entferner.ts`

```ts
import type { FileToolConfig } from './schemas';
import { removeBackground, prepareBackgroundRemovalModel } from './remove-background';

/**
 * Recraft.ai icon prompt — "premium editorial pencil sketch" template
 * (gelockt 2026-04-19 nach Session-7-Smoke-Test). Subjekt-Block + Layout-Satz
 * werden pro Tool ausgetauscht; alle Stil-Sätze bleiben WORTGLEICH zwischen
 * Tools, damit die Icon-Familie visuell kohärent ist.
 *
 * Status: [ ] Generated  [ ] Background-Removed  [ ] Delivered
 *
 * Target: public/icons/tools/remove-background.webp (160x160, CSS 80x80).
 * Pipeline: Recraft → BG-Remover-Tool (dieses Tool selbst!) → WebP-Konverter.
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
  prepare: (onProgress) => prepareBackgroundRemovalModel(onProgress),
  process: (input, config) =>
    removeBackground(input, {
      format: typeof config?.format === 'string' ? config.format : 'png',
    }),
};
```

### 4.2 Schema-Erweiterung (additiv)

`src/lib/tools/schemas.ts` bekommt im `fileToolConfigSchema` ein **optionales** Feld:

```ts
prepare: z.function()
  .args(z.function().args(z.object({ loaded: z.number(), total: z.number() })).returns(z.void()))
  .returns(z.promise(z.void()))
  .optional(),
```

**Backwards-Compat:** WebP-Konverter und alle künftigen File-Tools ohne ML-Lazy-Load setzen `prepare` einfach nicht.

### 4.3 Process-Registry-Eintrag

`src/lib/tools/process-registry.ts`:

```ts
import { removeBackground } from './remove-background';

export const processRegistry: Record<string, ProcessFn> = {
  'png-jpg-to-webp': (input, cfg) => processWebp(input, { quality: …, }),
  'remove-background': (input, cfg) => removeBackground(input, {
    format: typeof cfg?.format === 'string' ? cfg.format : 'png',
  }),
};
```

**Astro-SSR-Hinweis:** `prepare` muss **ebenfalls** in einer separaten Client-Registry stehen, weil Astro auch `prepare` als `null` serialisiert. Neue Datei `src/lib/tools/prepare-registry.ts` mit demselben Drei-Touch-Pattern. (Alternative: `process-registry.ts` umbenennen zu `tool-runtime-registry.ts` und beide Felder zusammenfassen — Plan-Phase entscheidet das.)

---

## 5. Pure-Module: `remove-background.ts`

### 5.1 Public API

```ts
// src/lib/tools/remove-background.ts

export type RemoveBackgroundFormat = 'png' | 'webp' | 'jpg';

export interface RemoveBackgroundOpts {
  format: RemoveBackgroundFormat;
}

export interface ProgressEvent {
  loaded: number;  // bytes
  total: number;   // bytes
}

/** Triggert den Modell-Download (Singleton). Idempotent. */
export function prepareBackgroundRemovalModel(
  onProgress: (e: ProgressEvent) => void,
): Promise<void>;

/**
 * Führt Inference aus + encodet im gewählten Format.
 * Cached intern den letzten OffscreenCanvas-Snapshot für `reencode()`.
 */
export function removeBackground(
  input: Uint8Array,
  opts: RemoveBackgroundOpts,
): Promise<Uint8Array>;

/**
 * Re-encodet den letzten cached Canvas-Snapshot in ein anderes Format
 * OHNE Re-Inference. Wirft, wenn noch kein removeBackground()-Call gelaufen ist.
 */
export function reencodeLastResult(
  format: RemoveBackgroundFormat,
): Promise<Uint8Array>;
```

**Cache-Lebenszyklus:** Der Canvas-Snapshot lebt im Modul-Scope und wird beim nächsten `removeBackground()`-Call überschrieben. Bei FileTool-Reset (`idle`-Phase) ruft die Komponente `clearLastResult()` (zusätzlicher Export) auf — verhindert Memory-Leak bei großen Bildern.

### 5.2 Singleton-Pattern

```ts
let pipelinePromise: Promise<unknown> | null = null;

export function prepareBackgroundRemovalModel(onProgress) {
  if (pipelinePromise) return pipelinePromise.then(() => undefined);
  pipelinePromise = (async () => {
    const { pipeline } = await import('@huggingface/transformers');
    return pipeline('image-segmentation', 'onnx-community/BEN2-ONNX', {
      progress_callback: onProgress,
      device: await detectDevice(),  // 'webgpu' | 'wasm'
    });
  })();
  return pipelinePromise.then(() => undefined);
}
```

**Wichtig:**
- `import('@huggingface/transformers')` ist **dynamisch** → Hauptbundle bleibt klein.
- `detectDevice()` versucht WebGPU via `'gpu' in navigator && await navigator.gpu.requestAdapter()`, fällt sonst auf `'wasm'` zurück.
- Falls weder WebGPU noch WASM verfügbar (sehr selten, alte Browser), wirft `pipeline()` — wird im FileTool als `error`-Phase angezeigt.

### 5.3 Inference + Encoding

```ts
export async function removeBackground(input, opts) {
  const pipe = await pipelinePromise;
  if (!pipe) throw new Error('Pipeline not prepared — prepare() must run first.');

  // 1. Uint8Array → ImageBitmap
  const blob = new Blob([input]);
  const bitmap = await createImageBitmap(blob);

  // 2. Pipeline-Inference (BEN2 liefert Maske als Float32Array)
  const segmentation = await pipe(bitmap, { threshold: 0.5 });

  // 3. Maske auf Original-RGBA anwenden via OffscreenCanvas
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0);
  applyMask(ctx, segmentation.mask);  // sets alpha-channel per-pixel

  // 4. Encoding nach gewähltem Format
  const mime = formatToMime(opts.format);  // 'png' | 'webp' | 'jpg'
  const outBlob = await canvas.convertToBlob({ type: mime, quality: 0.92 });

  // 5. JPG-Sonderfall: weißer Background-Composite VOR Encoding
  //    (canvas.convertToBlob mit type='image/jpeg' verwirft Alpha automatisch
  //     und ersetzt mit Schwarz — wir wollen Weiß)
  // Implementation: wenn opts.format === 'jpg', vorher
  //   ctx.globalCompositeOperation = 'destination-over';
  //   ctx.fillStyle = 'white';
  //   ctx.fillRect(0, 0, bitmap.width, bitmap.height);
  // dann encode.

  return new Uint8Array(await outBlob.arrayBuffer());
}
```

**Performance-Erwartung:**
- WebGPU + 1024×1024 Bild: ~150 ms inference + ~20 ms encoding = **~170 ms total**.
- WASM + 1024×1024 Bild: ~1.5 s inference + ~20 ms encoding = **~1.5 s total**.
- Modell-First-Load: 110 MB / typischer Privat-Anschluss 50 Mbps = **~18 s**.

---

## 6. UI-Komponenten

### 6.1 `<Loader />` (neu, geteilt)

**Datei:** `src/components/Loader.svelte`

**Props:**
```ts
interface Props {
  variant: 'spinner' | 'progress';
  value?: number;       // 0..1 — required für variant='progress'
  label?: string;       // optionaler Text rechts vom Loader (z.B. "46 / 110 MB")
  ariaLabel?: string;   // default: "Lädt"
}
```

**Spinner-Variante:**
- 24×24, SVG-Arc (1px-Stroke `var(--color-text-subtle)`).
- `@keyframes spin { to { transform: rotate(360deg); } }`, `0.9s linear infinite`.
- `role="status"` + `aria-label`.
- `prefers-reduced-motion: reduce` → Animation off, statt dessen drei sich pulsierende Punkte (`opacity` 0.3 → 1, `2s ease-in-out infinite alternate`, gestaffelt) — auch das wird unter `reduce` zu statischen Punkten.

**Progress-Variante:**
- `<div role="progressbar" aria-valuenow=... aria-valuemin="0" aria-valuemax="100">`.
- Track: 1px-hairline-Bar `var(--color-border)`, max-width abhängig vom Container (default 100 %).
- Fill: gleiche Höhe, Background `var(--color-text)`, `width: ${value*100}%`, Transition `width var(--dur-med) var(--ease-out)`.
- Label rechts: Mono, `tabular-nums`, NBSP zwischen Wert und Einheit (`46\u00A0/\u00A0110\u00A0MB`, `42\u00A0%`).
- `prefers-reduced-motion: reduce` → Width-Transition auf `0s`, Wert springt direkt.

**Tokens-only:** kein Hex, keine arbitrary-px außer 1px (Border-Hairline-Konvention).

### 6.2 `FileTool.svelte` — Erweiterungen (`preparing`-Phase + dynamisches Output-Format)

**Kontext-Refactor (HART):** Das aktuelle `FileTool.svelte` (Session 7) hardcodet die Output-MIME als `'image/webp'` und die Download-Extension als `.webp` (Zeile 79 + Zeile 21). Für den BG-Remover muss beides aus der gewählten Format-Option kommen. Refactor:
- Neuer Modul-State `outputFormat: $state<'webp' | 'png' | 'jpg'>('webp')` mit Default aus Tool-Config (neues optionales `defaultFormat`-Feld in `FileToolConfig`, default `'webp'` für Backwards-Compat).
- `formatToMime(format)` und `formatToExt(format)` als kleine Helper.
- Bei FileTool-Reset-Path bleibt der Default erhalten.

Das gilt **auch** für künftige Multi-Format-Tools — also kein BG-Remover-Spezial-Code.

**Clipboard-Paste (für ALLE FileTools, nicht nur BG-Remover):**
- `$effect`-Listener auf Document-Level `paste`-Event, aktiv nur wenn Phase = `idle`.
- Filtert `event.clipboardData.items` auf `kind === 'file'` und `type.startsWith('image/')`. Nimmt das erste Match.
- Validiert MIME gegen `config.accept` und Size gegen `config.maxSizeMb` (gleiche Logik wie File-Drop).
- Synthetisches `File`-Objekt (Clipboard liefert kein Filename) bekommt Default-Name `pasted-image-${Date.now()}.<ext>` mit aus MIME abgeleiteter Extension.
- `prefers-reduced-motion`-irrelevant.
- Hint-Copy in Dropzone-Meta-Zeile: „… oder Bild aus Zwischenablage einfügen (Strg+V)".

**Mobile-Kamera-Capture (für ALLE FileTools, nicht nur BG-Remover):**
- Sekundärer Button neben „Durchsuchen": `<label><input type="file" accept="image/*" capture="environment" hidden /> Foto aufnehmen</label>`.
- Sichtbar nur via `@media (hover: none) and (pointer: coarse)` — Desktop-Browser sehen ihn nicht.
- Feature-Flag (Tool-Config-Level) `cameraCapture?: boolean` mit Default `true` für File-Tools mit Image-MIMEs in `accept`. Der Spec-Author kann es per Tool deaktivieren.
- Resultierendes File-Objekt durchläuft denselben Validate+Process-Pfad wie File-Drop.



**Phase-Machine (erweitert):**
```
idle → [config.prepare ? preparing : converting] → done | error
       ↑ first upload only         ↑ subsequent uploads
       ↓
   error (Modell-Lade-Fehler) → Retry → preparing
```

**Preparing-State-UI** (innerhalb derselben Card, kein CLS):
- `<Loader variant="progress" value={progress} label={`${mb} / 110 MB`} />`
- Status-Text darüber: „Modell wird einmalig heruntergeladen …" (`aria-live="polite"`).
- Quality-Slider/Format-Chooser bleiben sichtbar, aber `disabled`.

**Converting-State-UI** (existiert schon, leicht erweitert):
- `<Loader variant="spinner" ariaLabel="Verarbeitet" />`
- Status-Text: „Hintergrund wird entfernt …" (Tool-spezifischer Text aus Config? **Nein** — hartcodiert für `remove-background`-Tool, andere FileTools bleiben wie heute).

**Done-State-UI** (erweitert um Format-Chooser):
- Vorher → Nachher Größen-Block (existiert).
- **Mini-Preview** des Ergebnisses (max 200×200, `object-fit: contain`) auf einem **Transparenz-Checkerboard-Background** via CSS-Gradient (8×8-Squares `var(--color-border-subtle)` / transparent). Damit Transparenz sichtbar ist.
- **Format-Chooser** (Radio-Group): `PNG` (default) / `WebP` / `JPG`. Format-Wechsel triggert **Re-Encode** des cached Resultats (NICHT Re-Inference). Dafür merkt sich der State das ungeencodete Canvas-Snapshot.
- Download-Button (Primary): Filename `${stem}_no-bg.${ext}`.
- Reset-Button (Secondary).

### 6.3 `data-testid`-Konvention (additiv zu CONVENTIONS §Svelte)

Neue Test-IDs:
- `loader-spinner`, `loader-progress`, `loader-progress-fill`, `loader-progress-label`
- `filetool-preparing` (Status-Region in `preparing`-Phase)
- `filetool-format-chooser`, `filetool-format-png`, `filetool-format-webp`, `filetool-format-jpg`
- `filetool-preview` (Mini-Preview-Thumbnail)

---

## 7. Routing und Slug

- **DE-Slug:** `hintergrund-entfernen`
- `src/lib/slug-map.ts` bekommt Eintrag `{ id: 'remove-background', slugs: { de: 'hintergrund-entfernen' } }`.
- `src/lib/tools/tool-registry.ts` bekommt Eintrag `'remove-background': hintergrundEntferner`.
- Dynamic-Route `src/pages/[lang]/[slug].astro` bleibt unverändert — die `componentByType`-Map enthält bereits `'file-tool': FileTool`, da das Tool-Type unverändert ist.

---

## 8. Content (`src/content/tools/hintergrund-entfernen/de.md`)

### 8.1 Frontmatter-Felder (gemäß `tools.schema.ts`)

```yaml
---
toolId: remove-background
lang: de
title: "Hintergrund entfernen — dein Bild verlässt nie deinen Browser"
metaDescription: "Entferne Bildhintergründe komplett im Browser — kein Upload, kein Konto, keine Wartezeit. PNG, WebP oder JPG ausgeben. KI läuft lokal auf deinem Gerät."
tagline: "Bildhintergrund in Sekunden entfernen — 100 % auf deinem Gerät, ohne Upload."
intro: "Lade ein Foto hoch und erhalte ein freigestelltes Bild mit transparentem Hintergrund. Die KI läuft komplett auf deinem Gerät — dein Bild wird nie hochgeladen."
howToSteps:
  - "Bild per Drag-&-Drop auf das Feld ziehen oder „Durchsuchen" klicken (PNG, JPG oder WebP, max 10 MB)."
  - "Auf den ersten Klick lädt einmalig das ~110 MB große KI-Modell — danach läuft alles offline in deinem Browser."
  - "Format wählen (PNG mit Transparenz, WebP mit Transparenz oder JPG mit weißem Hintergrund) und herunterladen."
faq:
  - question: "Wird mein Bild hochgeladen oder gespeichert?"
    answer: "Nein. Die KI läuft komplett in deinem Browser — dein Bild verlässt dein Gerät zu keinem Zeitpunkt. Es gibt keinen Server-Upload und keine Speicherung."
  - question: "Warum dauert der erste Klick länger?"
    answer: "Das KI-Modell (etwa 110 MB) wird einmalig in deinen Browser-Cache geladen. Beim nächsten Besuch läuft das Tool sofort — auch offline."
  - question: "Welche Bildformate werden unterstützt?"
    answer: "Eingang: PNG, JPG und WebP bis 10 MB. Ausgang: PNG (mit Transparenz), WebP (mit Transparenz) oder JPG (mit weißem Hintergrund)."
  - question: "Funktioniert das auf dem Smartphone?"
    answer: "Ja, in modernen Mobile-Browsern (Chrome Android 121+, Safari iOS 18+) mit WebGPU-Unterstützung. Bei sehr großen Bildern oder älteren Geräten kann es zu Speicher-Engpässen kommen — versuche dann ein kleineres Bild."
  - question: "Wie genau ist die Hintergrund-Entfernung?"
    answer: "Wir verwenden BEN2, ein State-of-the-Art-Segmentierungsmodell von 2025. Das Ergebnis ist bei Personen-, Produkt- und Tier-Bildern in der Regel sauber genug für direkten Einsatz; bei feinen Strukturen (Haare, transparente Gegenstände) kann manuelle Nachbearbeitung sinnvoll sein."
related:
  - "png-jpg-to-webp"
  - "..."  # zwei weitere Phase-1-Tools — final beim Skalieren
---
```

### 8.2 Body-Struktur (gelockte H2-Reihenfolge)

```markdown
## Wie funktioniert das Tool?

[200–300 Wörter Absatz: Wie BEN2 segmentiert, warum es im Browser läuft, was WebGPU ist.]

## So entfernst du einen Hintergrund

[How-To-Steps werden im Astro-Layout per `<HowToList>` gerendert; der Markdown-Body referenziert sie nicht direkt — siehe Page-Layout-Rhythmus in STYLE.md §10.]

## Datenschutz — 100 % im Browser

[200–300 Wörter: Wir verarbeiten dein Bild nicht serverseitig. Die KI läuft per WebAssembly bzw. WebGPU auf deinem Gerät. Es gibt keinen Server-Upload, kein Tracking pro Bild, keine Speicherung. Modell-Download läuft einmalig über Hugging Face's CDN — dieser Request enthält weder dein Bild noch personenbezogene Daten. Verweis auf unsere Datenschutzerklärung. ]

## Wann liefert das Tool gute Ergebnisse?

[300–400 Wörter über typische Use-Cases: Produktfotos auf einfarbigem Hintergrund (sehr gut), Personen-Porträts (gut), Tier-Fotos (gut), Haare/Fell (akzeptabel), transparente Gläser (schwierig), feine Strukturen wie Drahtgitter (eingeschränkt). Plus Tipps: gut belichtetes Original, Subjekt klar vom Hintergrund abgehoben, kein zu starker Schatten.]

## Häufige Fragen

[FAQ wird im Layout per `<FAQ>` aus Frontmatter gerendert.]

## Verwandte Tools

[Related wird im Layout per `<RelatedTools>` aus Frontmatter gerendert.]
```

**Wortzahl-Ziel:** ≥800 Wörter Body (Non-Negotiable #8: kein Thin-Content <300).

---

## 9. Tests (vitest, jsdom-25 Workarounds aus CONVENTIONS §Testing)

### 9.1 `tests/lib/tools/remove-background.test.ts`

**Mock-Strategie:** `vi.mock('@huggingface/transformers', () => ({ pipeline: vi.fn(() => Promise.resolve(mockPipe)) }))`. `mockPipe` ist eine async-Funktion, die ein Fake-Mask-Object zurückgibt (Float32Array mit definierten Werten).

| # | Test | Erwartung |
|---|------|-----------|
| 1 | `prepareBackgroundRemovalModel()` erste Call lädt Pipeline | `pipeline` wird genau 1× aufgerufen |
| 2 | `prepareBackgroundRemovalModel()` zweite Call ist no-op | `pipeline` wird weiterhin nur 1× aufgerufen |
| 3 | `prepareBackgroundRemovalModel()` reicht progress-Events durch | `onProgress` wird ≥1× mit `{loaded, total}` gerufen |
| 4 | `removeBackground(buf, {format:'png'})` ohne prepare → wirft | Aussagekräftige Error-Message |
| 5 | `removeBackground(buf, {format:'png'})` nach prepare → liefert PNG-Bytes | Output beginnt mit PNG-Magic `89 50 4E 47` |
| 6 | `removeBackground(buf, {format:'webp'})` → liefert WebP-Bytes | Output enthält `RIFF…WEBP`-Header |
| 7 | `removeBackground(buf, {format:'jpg'})` → liefert JPG mit weißem Background | Output beginnt mit JPG-Magic `FF D8`, kein Alpha-Kanal |
| 8 | Pipeline-Reject (z.B. WebGPU-Fail) → Promise rejects | Error wird durchgereicht, nicht geschluckt |

### 9.2 `tests/components/tools/filetool-prepare.test.ts`

| # | Test | Erwartung |
|---|------|-----------|
| 1 | Phase wechselt `idle → preparing → converting → done` wenn `config.prepare` existiert | Phase-Sequenz korrekt, jede Phase rendert das richtige UI |
| 2 | Phase überspringt `preparing` beim 2. Upload (Singleton-Pfad) | Nach erstem Upload + Reset bleibt nächster Upload direkt in `converting` |
| 3 | Progress-Updates landen in `data-testid="loader-progress-label"` | Label-Text zeigt formatierten Wert (`42\u00A0%` o.ä.) |
| 4 | `prepare`-Reject → `error`-Phase mit Retry-Button | Retry-Button vorhanden, Klick triggert wieder `preparing` |
| 5 | `prepare`-Reject + Retry → erfolgreicher 2. Versuch funktioniert | Phase erreicht `done` |
| 6 | Format-Chooser-Wechsel triggert Re-Encode, NICHT Re-Inference | `removeBackground`-Spy wird nur 1× gerufen, aber Download-Blob-MIME wechselt |
| 7 | Clipboard-Paste in `idle`-Phase mit Image-Item → Upload-Pfad läuft | `paste`-Event mit Fake-`ClipboardEvent` → `removeBackground` wird gerufen |
| 8 | Clipboard-Paste ohne Image-Item → stille Ignorierung | Kein State-Wechsel, kein Error |
| 9 | Clipboard-Paste in `preparing`/`converting`/`done`-Phase → ignoriert | `paste`-Event während Non-Idle-Phase hat keinen Effekt |
| 10 | HEIC-Upload triggert Lazy-Load von `heic2any` + konvertiert vor Inference | `heic2any`-Spy wird genau 1× gerufen, dann läuft normaler Pfad |
| 11 | Camera-Capture-Input liefert File → Upload-Pfad läuft | Change-Event auf `data-testid="filetool-camera-input"` triggert Process |

### 9.3 `tests/components/Loader.test.ts`

| # | Test | Erwartung |
|---|------|-----------|
| 1 | `<Loader variant="spinner" />` rendert SVG-Arc + `role="status"` | DOM enthält `<svg>` und `role="status"` |
| 2 | `<Loader variant="progress" value={0.42} label="46 / 110 MB" />` rendert Label mit NBSP | Text enthält `46\u00A0/\u00A0110\u00A0MB` |
| 3 | `<Loader variant="progress" value={0.42} />` setzt `aria-valuenow="42"` | `role="progressbar"` mit korrektem `aria-valuenow` |
| 4 | `value` außerhalb 0..1 wird geclampt | `value=-0.5` → 0; `value=1.5` → 100 |
| 5 | `prefers-reduced-motion: reduce` deaktiviert Animation | CSS-Snapshot via `getComputedStyle().animationDuration === '0s'` |

### 9.4 `tests/content/hintergrund-entfernen-content.test.ts`

| # | Test | Erwartung |
|---|------|-----------|
| 1 | Frontmatter-Schema valid | `toolsContentSchema.parse()` ohne Fehler |
| 2 | `toolId === 'remove-background'`, `lang === 'de'` | Identitäts-Check |
| 3 | Body startet mit H2 | erstes Heading-Token = `##` |
| 4 | Gelockte H2-Reihenfolge | `[Wie funktioniert, So entfernst du, Datenschutz, Wann liefert, Häufige Fragen, Verwandte Tools]` |
| 5 | Wortzahl ≥ 800 | Body ohne Frontmatter zählen |

### 9.5 Build- und Smoke-Verifikation (manuell, post-implementation)

- `npm run build` muss `/de/hintergrund-entfernen` erzeugen.
- Hauptbundle bleibt `<100 KB gzip` (Transformers.js + BEN2 dürfen NICHT im Initial-Chunk auftauchen — `import('@huggingface/transformers')` ist dynamisch).
- `npm run check` muss 0/0/0 sein.
- Smoke-Test im Browser: erste Upload triggert Modell-Download mit Progress, zweiter Upload skippt Download, Format-Wechsel re-encodet ohne Re-Inference, Reset funktioniert.

---

## 10. Error-Handling (vollständig)

| Fehlerquelle | Phase | Verhalten |
|--------------|-------|-----------|
| MIME nicht in `accept` | idle | Inline-Error in Meta-Zeile (Reuse FileTool-bestehende Logik) |
| Datei > `maxSizeMb` | idle | Inline-Error in Meta-Zeile |
| HEIC/HEIF-Decode schlägt fehl (`heic2any`-Reject) | idle | Inline-Error: „HEIC-Datei konnte nicht gelesen werden. Versuche, sie auf dem Smartphone als JPG zu speichern." Bestehender Pfad bleibt unberührt. |
| Clipboard-Paste enthält kein Bild | idle | Stille (kein Error-Toast — Paste eines Text-Items ist kein User-Fehler) |
| Camera-Capture liefert leeres File-Objekt (User bricht Aufnahme ab) | idle | Stille (kein Error) |
| Modell-Download abgebrochen (Netz-Fehler) | preparing | `error`-Phase mit Retry-Button → springt zurück zu `preparing` |
| Modell-Download zu langsam (>2 min ohne Progress) | preparing | `error`-Phase: „Modell-Download dauert ungewöhnlich lange. Bitte Internetverbindung prüfen und erneut versuchen." Implementierung: Watchdog-Timer in `prepareBackgroundRemovalModel` — `setTimeout(120_000)` wird bei jedem `onProgress`-Tick resettet; läuft er aus, wird die Pipeline-Promise abgebrochen (`AbortController`) und ein typisierter `StallError` geworfen. |
| WebGPU + WASM beide nicht verfügbar | preparing | `error`-Phase: „Dein Browser unterstützt das nötige Modell nicht. Versuche Chrome/Edge oder Firefox in aktueller Version." |
| OOM während Inference | converting | `error`-Phase: „Bild zu groß für dieses Gerät. Versuche ein kleineres Bild oder einen Desktop." (Phase-2-Hint: Worker-Fallback siehe §13) |
| Encoder-Fehler bei WebP/JPG | converting | Fallback auf PNG, Toast „Format nicht unterstützt, PNG verwendet" |
| Process-Funktion wirft unerwarteter Error | converting | `error`-Phase mit generischer Message + Reset-Button |

### 10.1 Modell-CDN-Begründung (§7-Konformität)

Non-Negotiable #7 verbietet externe Network-Dependencies zur Runtime, mit Ausnahme §7a (ML-File-Tools mit 6 Bedingungen). Hier die Mapping:

| §7a-Bedingung | Erfüllt? | Begründung |
|---------------|----------|------------|
| (a) Client-Side default funktioniert auf Desktop | ✅ | BEN2 + WebGPU läuft auf Chrome/Firefox/Safari Desktop seit 2024 |
| (b) Worker-Fallback nur für Mobile/explizite Wahl | N/A V1 | V1 baut keinen Worker — Phase 2 |
| (c) Kein Storage, transient processing | ✅ | Modell wird in Browser-IndexedDB gecached, KEIN Bild-Storage |
| (d) Eigene Sub-Domain + CORS | N/A V1 | Kein eigener Worker — Modell-CDN ist Hugging Face's `huggingface.co`, nicht unser Server |
| (e) DSGVO-Eintrag Pflicht | ⚠️ TODO Plan-Phase | Datenschutz-Seite muss um Hinweis „Modell-Download via Hugging Face CDN (USA, kein personenbezogener Datenfluss)" ergänzt werden |
| (f) UI-Hint wenn Worker aktiv | N/A V1 | Kein Worker |

**Gap:** §7 erlaubt strenggenommen nur OWN-Workers, nicht Third-Party-CDNs. Für Phase 2 evaluieren wir den **R2-Mirror** (siehe §13.5), der das Modell auf Cloudflare R2 spiegelt → eliminiert CDN-Abhängigkeit. V1 nutzt HF's CDN, weil R2-Setup vor Session 10 (CI/CD) nicht sinnvoll ist.

---

## 11. CONVENTIONS- und STYLE-Updates (für die Plan-Phase)

Folgende Rulebook-Updates werden mit der Implementierung mitgeliefert (nicht vorab):

### 11.1 CONVENTIONS.md
- §Tool-Components: Neue Phase `preparing` zur FileTool-Phase-Machine ergänzen.
- §File-Tool-Pattern: Neuer Schritt im Drei-Touch-Pattern für ML-Tools (`prepare`-Funktion + prepare-registry).
- §Components: Neuer Eintrag `Loader.svelte` (geteilte Komponente, Props-Interface dokumentiert).
- §Tool-Components: Output-Format-Handling im FileTool ist jetzt **dynamisch** (kein hardcoded `'image/webp'`/`'.webp'` mehr). Neues optionales `defaultFormat`-Feld in `FileToolConfig`, plus Multi-Format-Output-Convention.
- §File-Tool-Pattern: FileTool-Template bekommt **zwei neue Upload-Methoden als Default** (Clipboard-Paste + Mobile-Kamera-Capture) — gelten für ALLE File-Tools, nicht nur BG-Remover. Opt-out per Tool-Config-Flag `cameraCapture: false`.
- §File-Tool-Pattern: Neuer optionaler Pre-Decode-Step im FileTool-Validierungspfad (HEIC/HEIF → PNG via `heic2any` Lazy-Load). Pattern: wenn MIME in `accept` aber nicht von `createImageBitmap` dekodierbar ist, führt das Tool erst einen Format-Normalisierungs-Step aus.

### 11.2 STYLE.md
- §9.2 FileTool: Neue `preparing`-State-Beschreibung.
- §11 (neu, oder Anhang an §9): `<Loader />` Visual-Spec (24×24 Spinner, 1px-Hairline-Bar, Mono-Tabular-Label, NBSP).
- §9.2 Done-State: Erweitert um Format-Chooser + Mini-Preview mit Transparenz-Checkerboard.

---

## 12. Dependencies (npm)

**Neu:**
- `@huggingface/transformers` (~v4.x, MIT) — peer-dep `onnxruntime-web` (auto-installiert).
- `heic2any` (~v0.0.4, MIT) — HEIC/HEIF-Decode für Chrome/Firefox.

**Bundle-Impact:**
- Hauptbundle: **+0 KB** (alle dynamic imports).
- Lazy-Chunk `transformers.js`: ~80 KB gzip.
- Lazy-Chunk `heic2any`: ~30 KB gzip (nur geladen bei HEIC/HEIF-Upload + nicht-Safari).
- Modell `BEN2-ONNX`: ~110 MB (NICHT im npm-Bundle — wird bei Runtime von HF-CDN geladen).

**Total npm-install-Impact:** ~250 MB `node_modules`-Größenwachstum (wegen onnxruntime-web's WASM-Binaries und ONNX-Tooling).

---

## 13. Out of Scope V1 (Verbesserungen für später)

| # | Feature | Trigger / Phase |
|---|---------|-----------------|
| 1 | **Worker-Fallback (§7a)** auf eigener Sub-Domain `api.konverter.app` mit DSGVO-Banner + UI-Hint | Phase 2, wenn Analytics (Plausible o.ä., final festgelegt in Phase-2-Setup) >5 % Mobile-OOM zeigen |
| 2 | **Hand-drawn-Pencil-animated Loader** (z.B. SVG-Stroke-Animation eines Pencil-Sketches) | Phase 1 Polish, wenn Marken-Identität verstärkt werden soll |
| 3 | **Edge-Feather-Slider** (Maske weichzeichnen für glattere Übergänge) + **Replace-BG-Color-Picker** | User-Feedback-getrieben — nur einbauen, wenn explizit gefragt |
| 4 | **CLI Batch-Script** `scripts/icon-pipeline.ts` (Recraft-PNGs aus `pending-icons/raw/` automatisch durch BG-Remover + WebP-Konverter pipen) | Wenn ≥10 Pending-Icons in Queue → Automation lohnt sich |
| 5 | **R2 self-hosted Modell-Mirror** auf `cdn.konverter.app/models/ben2.onnx` | Phase 2 R2-Gate (siehe Master-Spec §10) — eliminiert HF-CDN-Abhängigkeit |
| 6 | **Model-Variant-Picker** (BiRefNet_lite für Mobile = ~50 MB, BEN2 für Desktop = ~110 MB) | Wenn Mobile-First-Load-Cost als gemessenes Problem erscheint |
| 7 | **History / Undo** (letzte 5 verarbeitete Bilder, IndexedDB-cached) | Phase 3, wenn Power-User-Feedback dafür spricht |
| 8 | **Batch-Upload** (mehrere Bilder gleichzeitig) | Phase 3 |

---

## 14. Akzeptanz-Kriterien (für Plan-Phase und Review)

V1 gilt als „done", wenn:

1. **Funktional:** Bild upload → BG entfernt → Format wählen → Download funktioniert in Chrome Desktop, Chrome Android, Firefox Desktop, Safari Desktop (iOS 18+ optional, da WebGPU teils noch instabil).
2. **Performance:** Erste Inference ≤200 ms WebGPU / ≤3 s WASM bei 1024×1024-Eingabe. Modell-First-Load-Progress sichtbar in <500 ms nach Upload.
3. **Tests:** Alle Tests aus §9.1–9.4 grün. `npm test` 25+/25+ neue Tests.
4. **Build-Gates:** `npm run build` 0 Errors, `npm run check` 0/0/0, Hauptbundle <100 KB gzip (Lazy-Chunks erlaubt).
5. **Visual-Audit:** `web-design-guidelines`-Skill-Pass auf alle neuen Files. Refined-Minimalism-Constraints eingehalten (Tokens-only, keine Hex/arbitrary-px, NBSP zwischen Zahl und Einheit).
6. **DSGVO:** Inline-Meta-Hinweis unter Dropzone vorhanden („100 % im Browser"), Datenschutz-Sektion in Content-MD vorhanden, Datenschutzerklärung um Modell-CDN-Hinweis ergänzt.
7. **Doppel-Hebel verifiziert:** Recraft-PNG → durch dieses Tool → freigestelltes PNG. Manueller Test mit dem `meter-zu-fuss`-Icon.

---

## 15. Offene Fragen für die Plan-Phase

1. **Process-Registry vs. separate Prepare-Registry:** §4.3 nennt zwei Optionen. Plan-Phase entscheidet basierend auf Code-Lesbarkeit. Tests in §9 müssen den gewählten Import-Pfad mocken.
2. **WebGPU-Detection-Robustness:** Manche Browser melden `gpu` als verfügbar, scheitern aber bei `requestAdapter()`. Plan-Phase verifiziert die genaue Detection-Logik aus aktuellen Transformers.js-Best-Practices.
3. **Format-Chooser-Default je Quelltyp:** Sollte z.B. ein eingehendes JPG default zu PNG (mit Transparenz) gehen, oder zurück zu JPG? V1-Default: **immer PNG**, weil Transparenz der Hauptzweck ist. Plan-Phase: Bestätigen oder umschwenken.
4. **Mini-Preview-Performance:** Bei sehr großen Bildern (>4000×4000) kann der Browser das Mini-Thumbnail-Rendering verzögern. Plan-Phase: ggf. expliziter Downscale auf 200×200 vor Display.
5. **Cache-Lifetime von `lastResultCanvas`:** Modul-Scope-State überlebt Hot-Module-Replacement; Plan-Phase prüft, ob ein `WeakRef`-Pattern oder ein expliziter `clearLastResult()` beim FileTool-Reset robuster ist (V1-Default in §5.1: expliziter Clear).

---

## 16. Verweise

- **Subagent-Research-Report 2026-04-19** (Konkurrenten + User-Wünsche + 2026-Trends) — Output war Quelle für §2.4 — siehe Brainstorming-Conversation-Log dieser Session (Konkurrenz-Matrix mit 7 Tools, 3 Pain-Point-Kategorien, 9 Trend-Punkte).
- Master-Spec: `docs/superpowers/specs/2026-04-17-konverter-webseite-design.md` v1.1
- Phase-0-Plan: `docs/superpowers/plans/2026-04-17-phase-0-foundation.md`
- Session-7-Plan (FileTool-Template-Vorbild): `docs/superpowers/plans/2026-04-18-phase-0-session-5-meter-zu-fuss.md` und nachfolgende
- CONVENTIONS.md (v2, post-Session-7)
- STYLE.md (v1.2, post-Session-7)
- Transformers.js v4 Docs: https://huggingface.co/docs/transformers.js
- BEN2-ONNX Modell: https://huggingface.co/onnx-community/BEN2-ONNX

---

**Ende der Spec.** Plan wird per `superpowers:writing-plans` als nächster Schritt erstellt.
