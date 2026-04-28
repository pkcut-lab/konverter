# HEIC-Konverter — Design-Spec

**Status:** Draft v1.0 · 2026-04-29
**Autor:** Claude Code (kittokit pkcut-lab)
**Tools im Scope:** `heic-zu-jpg` + `heic-zu-png` (zwei Slugs, geteilte Engine)
**Sprachen v1:** `de` + `en` (gleichzeitig zum Launch)
**Sprachen Phase 3+:** `es`, `fr`, `pt-br` (i18n-Migrations-Welle)

---

## §1 Ziel & Kontext

iPhone-User produzieren seit iOS 11 (2017) per Default HEIC-Bilder. Auf Windows, älteren Macs, Linux, Web-Uploads, WhatsApp und vielen anderen Kontexten ist HEIC nicht oder nur eingeschränkt nutzbar. Die Konversion zu JPG/PNG ist ein dauerhafter, wachsender Pain (HEIC-Volumen 2026 ~70% aller iPhone-Fotos).

Die Top-DE-/EN-Konkurrenz ist überwiegend Server-Upload — verletzt damit Privacy-Erwartungen, ist im DSGVO-Kontext angreifbar und limitiert Free-User per Hard-Cap (z.B. 10 Files, 100 MB). Pure-Client-Konvertierung ist in 2026 dank stabiler `heic2any`-WASM-Reife + Safari-Native-Decode technisch möglich und wird zum Hauptdifferenzierer.

kittokit baut zwei Tools (`heic-zu-jpg`, `heic-zu-png`) mit geteilter Engine, die diesen Pain pure-client lösen, mit DE-First-DSGVO-Positionierung und expliziter iOS-Mobile-Optimierung.

**Hard-Constraints (Carry-Over aus CLAUDE.md / CONVENTIONS.md):**
- 100% pure-client (kein Server-Upload, kein Tracking ohne Consent)
- Astro 5 SSG + Svelte 5 Runes + Tailwind, multilingual via slug-map
- Refined-Minimalism (Graphit-Tokens + Warm-Orange-Accent, keine Maximalismus-Effekte)
- Tokens-only in Components (kein Hex/px in `src/components/**`)
- WCAG-AAA-Contrast (≥7:1)
- Keine Vendor-Namen in user-sichtbarem Content (CONTENT.md §11.1, lint-blocked)
- Mobile-Overflow-Defense (4-Layer-Pattern, gelockt 2026-04-28)
- Mobile-ML-Awareness, soweit anwendbar (DeviceProbe-Pattern aus `ml-device-detect.ts`)

---

## §2 Architektur-Übersicht

### §2.1 Zwei Tools, geteilte Engine

| Tool-Slug | Output | Component | Engine-Modul |
|---|---|---|---|
| `heic-zu-jpg` (de), `heic-to-jpg` (en) | JPG | `FileTool.svelte` (generic) | `src/lib/tools/heic-konverter.ts` |
| `heic-zu-png` (de), `heic-to-png` (en) | PNG | `FileTool.svelte` (generic) | `src/lib/tools/heic-konverter.ts` |

Beide Tool-Configs zeigen auf dieselbe Engine, parametrisieren über `target: 'jpg' | 'png'`.

### §2.2 Modul-Struktur

```
src/lib/tools/
  heic-konverter.ts          ← Engine: convertOne, convertBatch (Async-Generator)
  heic-decode.ts             ← schon vorhanden, erweitern
  heic-exif.ts               ← neu: EXIF lesen, Orientation-Transform, Filter-Strategie
  heic-folder-extract.ts     ← neu: webkitGetAsEntry-Recursion + Live-Photo-Pairing
  heic-zip-stream.ts         ← neu: client-zip-Wrapper, STORE-only, streaming
  heic-zu-jpg.ts             ← neu: Tool-Config (target='jpg')
  heic-zu-png.ts             ← neu: Tool-Config (target='png')

src/components/tools/
  FileTool.svelte            ← bestehende generic, ergänzt um HEIC-spezifische Hooks
  (kein neuer Tool-spezifischer Component nötig — wir nutzen Generic-Path)

src/content/tools/
  heic-zu-jpg/
    de.md                    ← 1500+ Wörter, 10+ FAQs
    en.md                    ← 1500+ Wörter, 10+ FAQs
  heic-zu-png/
    de.md                    ← 1500+ Wörter, 10+ FAQs
    en.md                    ← 1500+ Wörter, 10+ FAQs
```

### §2.3 Tool-Section-Width-Policy

`--wide (48rem)` per gelockter Policy für alle file-tool-typed Tools.

### §2.4 Differenzierung (CONVENTIONS-Pflicht)

#### A. Baseline-Pflicht (Mindest-Scope)

- Drag-Drop + Click-Picker
- Multi-File-Batch (mind. 30+ Files)
- HEIC + HEIF Input
- JPG bzw. PNG Output (jeweiliges Tool)
- Quality-Steuerung (JPG-Tool: 3 Pills)
- ZIP-Download bei mehreren Files
- Mobile-Layout funktioniert auf iOS Safari

#### B. Differenzierungs-Features (das hebt uns)

1. **100% Pure-Client + DSGVO-Klartext-Banner** — *weil 4/8 Top-Konkurrenten Server-Upload sind und „ich will keine Familienfotos hochladen" der größte Pain ist; in DE doppelt wertvoll wegen DSGVO-Bewusstsein*
2. **Folder-Drop rekursiv unbegrenzt** (via `webkitGetAsEntry`, ZIP-Stream-Output) — *weil KEIN Top-8-Konkurrent ganze Ordner durchwandern kann; löst „800 Urlaubsfotos"-Pain ohne Hard-Cap*
3. **EXIF-Privacy-Toggle mit Smart-Default** (`Standard (GPS entfernen)` / `Alles behalten` / `Alles entfernen`) — *weil heictojpg blind strippt, cloudconvert blind erhält; niemand gibt User die Wahl*
4. **Live-Photo-Detection mit Klartext-Hinweis** — *weil niemand iOS-Quirks erklärt; Pain „I lost the .MOV part" weit verbreitet*
5. **iOS-Multi-Select-Aufklärung** (kontextueller Hilfstext nur auf iOS Safari) — *weil iOS-Camera-Roll-Long-Press-Geste versteckt ist; trifft direkt unsere Hauptzielgruppe „iPhone-User"*

#### C. Bewusste Lücken (NICHT-Scope)

- **Kein RAW-Input** — Scope-Creep, eigenes Tool später (siehe §11 Future-Roadmap)
- **Keine Live-Photo-Video-Konvertierung** — eigenes Mediabunny-basiertes Tool wenn Bedarf
- **Keine Cloud-Integrationen** (Drive/Dropbox/iCloud) — verletzt Pure-Client-Versprechen
- **Kein Account, keine History** — Pure-Client = kein Server-State
- **Kein AVIF-Output v1** — eigenes Tool später (siehe §11 Future-Roadmap)
- **Kein Crop / kein Filter / kein Watermark** — Foto-Editor ist nicht der Job dieses Tools

#### D. Re-Evaluation-Trigger

- **Phase-2-Analytics:** wenn `< 2%` der Konvertierungen Resize/Quality-Erweitert nutzen → Pills auf nur Default reduzieren
- **Search-Console:** wenn `≥ 30 Impressions/Monat` für AVIF-Queries → drittes Tool `heic-zu-avif` spec'en (siehe §11)
- **User-Feedback:** wenn `≥ 10` Anfragen nach „Live-Photo-Video bitte mitnehmen" → Live-Photo-Pass-Through-Mode bauen
- **Browser-Capabilities:** wenn Safari `showDirectoryPicker` bekommt → Click-Picker um Folder-Pick erweitern
- **Konkurrenz:** wenn neuer Top-3-DE-Ranker Pure-Client + Folder-Drop schafft → Differenzierungs-Re-Audit

---

## §3 Engine-API

```typescript
export type ExifMode = 'standard' | 'all' | 'none';
export type Target = 'jpg' | 'png';

export interface ConvertOptions {
  target: Target;
  quality?: number;                 // 0-100, JPG-only, default 92
  resize?: { maxLong: number };     // omit = original, sonst max-Lange-Kante in px
  exif: ExifMode;
  signal?: AbortSignal;
}

export interface ConvertResult {
  blob: Blob;
  outputName: string;               // basename + neue Extension
  originalName: string;
  bytes: number;
}

export interface ConvertError {
  kind: 'error';
  originalName: string;
  reason: 'decode-failed' | 'memory-pressure' | 'aborted' | 'unknown';
  message: string;
}

export async function convertOne(
  file: File, opts: ConvertOptions
): Promise<ConvertResult>;

export async function* convertBatch(
  files: File[], opts: ConvertOptions
): AsyncIterable<ConvertResult | ConvertError>;
```

### §3.1 Per-File-Pipeline (sequenziell)

1. **Read** → `Uint8Array` aus `File.arrayBuffer()`
2. **EXIF-Parse** (`heic-exif.ts`) → Orientation-Tag + alle Metadaten (Pflicht, weil Orientation-Korrektur sonst fehlt)
3. **Decode** (`heic-decode.ts`) → Safari-Native via `createImageBitmap`, sonst lazy `heic2any`
4. **Orientation-Apply** → falls EXIF Orientation 2-8 → Canvas-Transform (`rotate`/`flip`)
5. **Resize** (optional) → falls `resize.maxLong`: bilinear via Canvas, Aspect-Ratio bleibt
6. **Encode** → `canvas.toBlob('image/jpeg', quality/100)` oder `'image/png'`
7. **EXIF-Re-Inject** → je nach `exif`-Setting:
   - `standard`: alles außer GPS-Block (`GPSInfoIFD` strippen) + Orientation auf `1` (weil bereits angewendet)
   - `all`: alles 1:1 (Orientation auf `1` weil bereits angewendet)
   - `none`: nichts re-injecten, Output ist Metadaten-frei
8. **Free** → `ImageBitmap.close()`, Canvas detached, intermediate Blobs nullable

### §3.2 Folder-Drop & Live-Photo-Pairing

```typescript
export interface ExtractedFiles {
  heicFiles: File[];          // alle .heic/.heif rekursiv
  livePhotoCount: number;     // .mov mit gleichem Basename wie ein HEIC
  otherSkippedCount: number;  // alles andere
}

export async function extractFilesFromDataTransfer(
  dt: DataTransfer
): Promise<ExtractedFiles>;
```

Implementation: `DataTransferItem.webkitGetAsEntry()` rekursiv durchwandern, `Map<basename, {heic?: File, mov?: File}>` aufbauen, am Ende ableiten welche HEIC-Files Live-Photos sind. MIME-Detection per Magic-Bytes + Extension-Fallback.

### §3.3 ZIP-Streaming

`client-zip` (~3 KB gzipped, MIT, Web-Streams). STORE-only-Mode (kein Deflate, weil JPG/PNG bereits komprimiert).

```typescript
export async function streamZipDownload(
  results: AsyncIterable<ConvertResult>,
  filename: string
): Promise<void>;
```

ZIP-Trigger: User klickt „Alle als ZIP herunterladen" — die Konvertierung ist zu diesem Zeitpunkt bereits abgeschlossen (User sieht File-Liste mit ✓), beim ZIP-Klick werden die Blobs eingesammelt und durchgestreamt zur Download-URL.

### §3.4 Memory-Strategie

- **Serielle Verarbeitung**: ein File auf einmal
- **Free zwischen Files**: `ImageBitmap.close()`, Canvas-Refs nullable
- **Mobile-Awareness**: `DeviceProbe` (existiert) — bei `fast-mobile` + Original-Resize + Auflösung > 4000px → Soft-Warnung „Auf diesem Gerät kann das Speicher-knapp werden — empfehlen Größe ‚Web (1920px)'"

### §3.5 Error-Handling

- **Decode-Fehler** (corrupt HEIC, falsches MIME): File markiert `failed`, Liste zeigt rotes Icon + Tooltip
- **Memory-Pressure**: einmalig Soft-Retry (mit GC-Hint), danach `failed`
- **AbortSignal**: User-Klick „Abbrechen" beendet Pipeline sauber, liefert nur was bisher fertig ist
- **Partial-ZIP**: wenn 145 / 147 OK sind, ZIP enthält 145 + Hinweis „2 Dateien wurden übersprungen — siehe Liste"
- **Per-File-Try-Catch**: kein Batch-Abbruch bei Einzelfehler

### §3.6 Bundle-Budget (Lazy-Load-Strategie)

| Modul | Größe | Lazy-Trigger |
|---|---|---|
| `heic-konverter.ts` (Engine) | ~3 KB | Tool-Page-Load |
| `heic2any` (libheif-WASM) | ~1.5 MB gzipped | Erstes Non-Safari-HEIC |
| `client-zip` | ~3 KB | „Alle als ZIP"-Klick |
| EXIF-Library (`exifr`) | ~5-6 KB | Erstes HEIC (Pflicht) |

EXIF-Library-Wahl: `exifr` (klein, robust, gut gepflegt, MIT). Lazy-loadable.

---

## §4 UI/UX-Layout

### §4.1 Render-Reihenfolge (Tool-Detail-Page)

Folgt gelocktem Pattern: `hero → tool-main → related-bar → ad → article → you-might`

### §4.2 Tool-Main-Sektion

**Initial-State (vor Drop):**

- Drop-Zone groß, prominent, refined-minimal
- Headline: „HEIC-Bilder hier ablegen"
- Sub: „oder Bilder auswählen" (Button → File-Picker)
- Bullet-Hints: „Auch ganze Ordner möglich" / „Mehrere Dateien gleichzeitig"
- iOS-Only-Hilfstext: „Tipp: Lange auf ein Bild drücken, danach weitere antippen" (nur sichtbar bei Safari-Detection)
- DSGVO-Mini-Banner darüber: „🛡 100% in deinem Browser — keine Bilder werden hochgeladen"

**Post-Drop-State:**

- Status-Banner: „147 HEIC-Bilder gefunden · 12 Live-Photos erkannt — Videos bleiben erhalten · 23 andere Dateien übersprungen"
- `<details>` „Erweiterte Optionen" (kollabiert by default):
  - **EXIF-Daten:** Radio-Group mit `Standard (GPS entfernen)` / `Alles behalten` / `Alles entfernen`
  - **Qualität (nur JPG-Tool):** Pill-Group `Web (75)` / `Standard (92)` / `Maximal (98)`
  - **Größe:** Pill-Group `Original` / `Web (1920px)` / `Klein (1280px)`
- Primary-Button: „Konvertieren — 147 Bilder, ~3 Min"

**Während-Konvertierung-State:**

- Progress-Bar oben: „Konvertiere 47 / 147 … 32%"
- File-Liste scrollbar, Pro-File-Status:
  - ✓ konvertiert (mit Download-Icon ↓)
  - ⟳ aktuell (Spinner)
  - ⏳ wartend
  - ✗ fehlgeschlagen (mit Tooltip)

**Post-Konvertierung-State:**

- Banner: „147 Bilder konvertiert (320 MB Output)"
- Primary: „Alle als ZIP herunterladen ↓"
- Secondary: File-Liste mit Pro-File-Download-Buttons

### §4.3 Mobile-Adaption

- Drop-Zone schrumpft auf Mini-Variante (`min-height: 240px`)
- Touch-Target ≥ 44px
- File-Liste gestapelt (volle Breite pro Zeile)
- iOS-Hilfstext sichtbar
- **Sticky-Konvertieren-Button** am unteren Bildschirmrand mit `safe-area-inset` (4-Layer-Overflow-Defense-konform)
- Erweiterte-Optionen-`<details>` bleibt kollabiert by default — User-Klick öffnet, kein Modal

### §4.4 Hero-Sektion (über Tool-Main)

Hero-Image 160×160 (Pflicht per gelocktem Tool-Detail-Layout). Stilisierte HEIC→JPG/PNG-Transformation, refined-minimal, Graphit + Orange-Accent. Konkrete Asset-Spezifikation siehe Implementation-Plan (Plan-Phase, nicht Spec-Phase).

### §4.5 Differenzierungs-Banner

Zwischen Hero und Tool-Main, dezent, einmalig, nicht-sticky:

> 🛡 100% in deinem Browser — keine Bilder werden hochgeladen

Eyebrow-Style, Pulse-Dot-Variante (existiert bereits in DESIGN.md), nicht aufdringlich.

---

## §5 SEO & Schema-Markup

### §5.1 Frontmatter-Pattern (Beispiel `de.md` für `heic-zu-jpg`)

```yaml
---
slug: heic-zu-jpg
type: file-tool
category: image
title: "HEIC in JPG umwandeln — kostenlos & ohne Upload"
metaDescription: "Wandle iPhone-HEIC-Bilder direkt im Browser in JPG um. Keine Server, keine Anmeldung, ganze Ordner gleichzeitig — DSGVO-konform und 100% privat."
h1: "HEIC in JPG umwandeln"
subLabel: "iPhone-Bilder lokal in deinem Browser konvertieren"
keywords: ["heic", "jpg", "umwandeln", "konverter", "iphone", "ohne upload"]
ogImage: "/og/heic-zu-jpg-de.png"
publishedAt: 2026-04-29
---
```

Auto-Brand-Suffix-Anhang (`— kittokit`) erfolgt in `BaseLayout.astro`.

### §5.2 Per-Sprache-SEO-Tuning

- **de:** „kostenlos & ohne Upload" + DSGVO-Erwähnung
- **en:** „free, no upload, in your browser" + privacy-first
- **es / fr / pt-br:** analog (Phase 3+)

### §5.3 Strukturierte Daten (JSON-LD, pro Tool)

- `SoftwareApplication` mit `featureList`
- `HowTo` für AEO/Voice-Search („Wie wandle ich HEIC in JPG um?")
- `FAQPage` mit ≥10 Fragen
- `BreadcrumbList` (auto-generiert)

### §5.4 SEO-Body-Content (Pflicht: 1500+ Wörter pro Tool/Sprache)

Struktur:

1. **Was ist HEIC?** (Kurzkontext)
2. **Warum HEIC in JPG/PNG umwandeln?** (Use-Cases: Web-Share, Windows-Kompatibilität, Print, Social-Upload)
3. **So benutzt du das Tool** (Step-by-Step, matcht HowTo-Schema)
4. **Häufige Fragen** (matcht FAQ-Schema, ≥10 Items)
5. **Tipps zur Bildqualität** (welche Quality wann)
6. **Was passiert mit meinen Daten?** (Privacy-Erklärung, DSGVO-Anker)
7. **HEIC vs JPG vs PNG vs HEIF** (Vergleichstabelle, ranked für Compare-Queries)
8. **Häufige Probleme** (Live-Photos, große Mengen, alte iOS-Versionen, Fehlermeldungen)

**CONVENTIONS-Compliance:**
- Keine Vendor-Namen (`heic2any`, `libheif`, `exifr`, `client-zip` → generisch beschreiben)
- Keine Implementation-Reveals
- Web-Standards (WebGPU, Web-Streams) sind erlaubt

### §5.5 FAQ-Pflichtfragen (Mindest-Set, ≥10)

1. Was ist HEIC?
2. Warum sind iPhone-Fotos im HEIC-Format?
3. Werden meine Bilder hochgeladen?
4. Kann ich ganze Ordner auf einmal konvertieren?
5. Funktioniert das auch ohne Internet?
6. Was passiert mit Live-Photos?
7. Bleibt die EXIF-Information erhalten?
8. HEIC oder HEIF — was ist der Unterschied?
9. Wie viele Bilder kann ich gleichzeitig konvertieren?
10. Verlieren meine Bilder Qualität?
11. Funktioniert das auf dem iPhone?
12. Wie wähle ich auf dem iPhone mehrere Bilder aus?

### §5.6 Internal-Linking

- **Related-Bar:** `bild-diff` · `hintergrund-entfernen` · `jpg-zu-pdf` · jeweils anderes HEIC-Tool
- **You-Might-Strip:** zwei rotierende Bild-Kategorie-Tools
- **Inline-Body-Links:** kontextuell (z.B. „Wenn du mehrere JPGs in eine PDF willst → jpg-zu-pdf")

### §5.7 Hreflang Cross-Linking

5 Sprach-Varianten via `<link rel="alternate" hreflang="...">` (BaseLayout-Pattern existiert).

### §5.8 OG-Images (1200×630)

- Pro Tool × Sprache → 4 Images für v1 (DE+EN × JPG+PNG)
- Refined-minimal, Graphit + Orange-Accent
- HEIC→JPG/PNG visuelle Metapher

---

## §6 i18n-Strings (neue Keys)

```typescript
// src/lib/i18n/strings.ts (neue Keys, jeweils DE + EN)

heicDropZoneTitle:        "HEIC-Bilder hier ablegen" | "Drop HEIC images here"
heicDropZoneSub:          "oder Bilder auswählen" | "or choose images"
heicHintFolders:          "Auch ganze Ordner möglich" | "Folders work too"
heicHintMulti:            "Mehrere Dateien gleichzeitig" | "Multiple files at once"
heicIosMultiSelect:       "Tipp: Lange auf ein Bild drücken, danach weitere antippen" | "Tip: Long-press the first photo, then tap others"
heicPrivacyBanner:        "100% in deinem Browser — keine Bilder werden hochgeladen" | "100% in your browser — no images are uploaded"
heicFoundFiles:           "{n} HEIC-Bilder gefunden" | "{n} HEIC images found"
heicFoundLivePhotos:      "{n} Live-Photos erkannt — Videos bleiben erhalten" | "{n} Live Photos detected — videos remain in your folder"
heicSkippedOthers:        "{n} andere Dateien übersprungen" | "{n} other files skipped"
heicAdvancedToggle:       "Erweiterte Optionen" | "Advanced options"
heicExifLabel:            "EXIF-Daten" | "EXIF metadata"
heicExifStandard:         "Standard (GPS entfernen)" | "Default (remove GPS)"
heicExifAll:              "Alles behalten" | "Keep all"
heicExifNone:             "Alles entfernen" | "Remove all"
heicQualityLabel:         "Qualität" | "Quality"
heicQualityWeb:           "Web (75)" | "Web (75)"
heicQualityStandard:      "Standard (92)" | "Standard (92)"
heicQualityMax:           "Maximal (98)" | "Maximum (98)"
heicResizeLabel:          "Größe" | "Size"
heicResizeOriginal:       "Original" | "Original"
heicResizeWeb:            "Web (max 1920px)" | "Web (max 1920px)"
heicResizeSmall:          "Klein (max 1280px)" | "Small (max 1280px)"
heicConvertButton:        "Konvertieren" | "Convert"
heicConvertButtonCount:   "Konvertieren — {n} Bilder, ~{min} Min" | "Convert — {n} images, ~{min} min"
heicProgress:             "Konvertiere {current} / {total} …" | "Converting {current} / {total} …"
heicDone:                 "{n} Bilder konvertiert ({mb} MB)" | "{n} images converted ({mb} MB)"
heicDownloadAllZip:       "Alle als ZIP herunterladen" | "Download all as ZIP"
heicDownloadSingle:       "Einzeln herunterladen" | "Download individually"
heicMemorySoftWarn:       "Auf diesem Gerät empfehlen wir Größe ‚Web' für große Mengen" | "On this device we recommend size ‘Web' for large batches"
heicErrorDecode:          "Datei konnte nicht gelesen werden" | "File could not be read"
heicErrorMemory:          "Nicht genug Speicher — versuche kleinere Größe" | "Not enough memory — try a smaller size"
heicAbort:                "Abbrechen" | "Cancel"
heicAbortedSummary:       "{ok} fertig, {failed} übersprungen, {pending} abgebrochen" | "{ok} done, {failed} skipped, {pending} cancelled"
```

ES/FR/PT-BR-Strings folgen in der i18n-Migrations-Welle.

---

## §7 Testing-Strategie

### §7.1 Vitest Unit

- `heic-konverter.test.ts`:
  - Smoke: HEIC → JPG, HEIC → PNG, beide validieren (Magic-Bytes-Check)
  - EXIF-Modi: alle 3 Modi → Output-EXIF prüfen
  - Resize: Output-Dimensionen prüfen
  - Orientation: HEIC mit Orientation=6 → JPG muss korrekt rotiert sein
  - Quality: 75/92/98 → Output-Größe sinnvoll
  - Per-File-Error: corrupt HEIC → ConvertError
- `heic-exif.test.ts`:
  - GPS-Strip lässt andere Tags intakt
  - Orientation-Reset auf 1 nach Apply
- `heic-folder-extract.test.ts`:
  - Mock-DataTransfer mit nested entries → korrekte File-Liste
  - Live-Photo-Pairing-Logik (matched basenames)
  - Skip-Filter (non-HEIC silently ignored)
- `heic-zip-stream.test.ts`:
  - Stream-Output korrekt (Magic-Bytes ZIP-Header)
  - STORE-only Mode (kein Deflate)

### §7.2 Component-Test (Svelte)

`FileTool` mit HEIC-Hooks: Snapshots der drei States (initial, post-drop, post-convert).

### §7.3 Playwright E2E

`tests/e2e/no-horizontal-overflow.spec.ts` erweitern um zwei neue Routen × 5 Sprachen (= 4 zusätzliche Routen v1, weitere via Phase-3).

### §7.4 Cross-Browser-Smoke (manuell, vor Commit)

- Chrome Desktop (heic2any-Pfad)
- Firefox Desktop (heic2any-Pfad)
- Safari macOS (Native-Pfad)
- iOS Safari Simulator + falls verfügbar realer iPhone (v1-Critical)
- Android Chrome (Multi-Select-Verhalten verifizieren)

---

## §8 Implementation-Sequenz (autonom, ein Branch)

Branch: `feat/heic-konverter`

### Sprint 1 — Engine-Foundation
- `heic-konverter.ts` mit `convertOne` + `convertBatch`
- `heic-exif.ts` (read/strip/inject via `exifr`)
- `heic-decode.ts` erweitern um Re-Encode-Output
- Vitest Unit-Tests (5-10 Fixture-HEICs)

### Sprint 2 — Folder-Drop + ZIP-Stream
- `heic-folder-extract.ts` (`webkitGetAsEntry`-Recursion + Live-Photo-Pairing)
- `heic-zip-stream.ts` (`client-zip`-Integration)
- Vitest Mock-DataTransfer

### Sprint 3 — Tool-Configs + Content (DE+EN)
- `heic-zu-jpg.ts` + `heic-zu-png.ts` Tool-Configs (Zod-Schema-konform)
- 4 Markdown-Files (DE+EN × JPG+PNG): Frontmatter + 1500+ Wörter Body + 10+ FAQ-Items
- Hero-Image (160×160) + OG-Image (1200×630) je Tool/Sprache
- Tool-Runtime-Registry-Eintrag

### Sprint 4 — UI + Mobile-Polish + Tests
- `FileTool.svelte` HEIC-Hooks (Live-Photo-Banner, iOS-Hint, EXIF/Quality/Resize-Pills, Sticky-Mobile-Button)
- i18n DE+EN Banner-Strings
- Playwright-Overflow-Test um zwei neue Routen erweitern
- Cross-Browser-Smoke

### Final
- Vitest grün, astro check 0/0/0, Playwright grün
- PR auf `main` mit Trailer `Rulebooks-Read: PROJECT, CONVENTIONS, STYLE, CONTENT, TRANSLATION`
- PROGRESS.md-Update

### Autonomer Modus

Bei offenen Sub-Entscheidungen während Implementation:
- Research-Subagent für externe Fakten
- Best-Fit-Entscheidung treffen für: Pure-Client + DE-DSGVO-SEO + Refined-Minimalism + Mobile-First
- Im PR-Body dokumentieren („Während Implementation entschieden: X, weil Y")

---

## §9 Edge-Cases & Bekannte Limitationen

- **iOS Safari `<input multiple>` mit Camera-Roll:** funktioniert ab iOS 14, niedrigere Versionen sehen Multi-Select möglicherweise nicht. Akzeptabel: <iOS-14-User sehen einfach Single-Picker.
- **iOS Safari `webkitGetAsEntry` für Folder:** funktioniert NICHT auf iOS. Folder-Drop ist Desktop-Only-Feature, was kommuniziert werden muss (Hint-Bullets sagen „Auch ganze Ordner möglich" — auf iOS faktisch nicht. Akzeptabel weil iOS-User üblicherweise Camera-Roll-Multi-Select nutzen, nicht Drop).
- **Live-Photos auf iOS Camera-Roll-Picker:** Apple's Picker liefert manchmal nur die HEIC, manchmal HEIC+MOV — Verhalten variiert pro iOS-Version. Unsere Live-Photo-Detection greift nur wenn beide Files ankommen.
- **Memory-Pressure bei sehr großen HEICs (50+ MP Pano):** Soft-Warnung + Auto-Resize-Vorschlag, kein Hard-Block.
- **CORS für `heic2any`-WASM:** falls aus npm gebundelt, kein Issue. Falls später CDN-Hosted: CORS-Header beachten (R2-Mirror-Pattern existiert für ML-Tools).

---

## §10 Risiken & Mitigationen

| Risiko | Wahrscheinlichkeit | Mitigation |
|---|---|---|
| `heic2any`-Bundle-Size (1.5 MB) bremst Initial-Load | mittel | Lazy-Load erst beim ersten Non-Safari-HEIC; Safari-User (60%+ iPhone-Traffic) bleiben unberührt |
| iOS Safari Memory-Crash bei großen Batches | mittel | Serielle Pipeline + Soft-Warnung + Auto-Resize-Hint |
| EXIF-Lib `exifr` schreibt Metadata anders als Apple-Standard | niedrig | Vitest-Tests gegen Apple-Reference-HEICs |
| Live-Photo-Pairing False-Positives (zufällige `.mov`-Geschwister) | niedrig | Basename-Match + nur wenn beide Files im selben Drop |
| `client-zip` STORE-Mode produziert ZIP, das macOS Archive Utility nicht öffnet | niedrig | Vitest gegen Test-Extraction; Fallback-Lib falls Issue |
| Search-Console-Penalty wegen Duplicate-Content (Slug-Variants) | niedrig | Klare `<link rel="canonical">`-Setup, hreflang sauber |

---

## §11 Future-Roadmap (Out-of-Scope für v1)

Eigene Tools, gated auf Search-Console-Signale + User-Feedback:

- **`heic-zu-avif`** — wenn AVIF-Search-Volumen ≥ 30 Impressions/Monat in Search-Console
- **`raw-zu-jpg` / `raw-zu-png`** — RAW-Konvertierung (CR2, NEF, ARW, DNG). Pure-Client möglich via `libraw.js`-WASM. Foto-Enthusiasten-Zielgruppe, aktuell von cloudconvert/freeconvert dominiert. Bei ≥ 50 RAW-User-Anfragen oder Search-Console-Signal → spec'en.
- **Live-Photo-Video-Konvertierung** — HEIC + MOV → MP4 als Single-Stream (Mediabunny-Scope)

---

## §12 Akzeptanzkriterien für Spec-Lock

- [x] §2.4 Differenzierung vollständig (A/B/C/D)
- [x] Engine-API definiert
- [x] UI-States skizziert
- [x] SEO-Setup definiert (Frontmatter, Schema, Body-Struktur, FAQs)
- [x] i18n-Keys gelistet
- [x] Testing-Strategie definiert
- [x] Implementation-Sequenz definiert
- [x] Edge-Cases + Risiken benannt
- [x] Future-Roadmap (AVIF, RAW) verankert

---

## §13 Open Items (während Implementation autonom zu entscheiden)

1. **Hero- und OG-Image konkrete Komposition** — refined-minimal, Graphit + Orange. Image-Skill oder selbst-skizziert via SVG.
2. **Konkrete OG-Image-Texts pro Sprache** — sollten H1 spiegeln aber knackiger.
3. **Sticky-Mobile-Button-Position vs. existierende Sticky-Elements** (Header, Cookie-Banner) — Z-Index-Stacking prüfen.
4. **`exifr`-Library finale Auswahl bestätigen** vs. eigener Mini-Parser — entscheiden während Sprint 1 nach Bundle-Check.
5. **DCIM-Folder-Handling** — Apple's DCIM hat `100APPLE/`, `101APPLE/` Subfolders. Verifizieren dass Recursion funktioniert.
6. **Soft-Warnung-Schwelle** — bei wie vielen Files genau? 200 ist Best-Guess, ggf. nach Mobile-Test anpassen.
7. **FAQ-Inhalte** — die 12 Fragen ausformulieren, je 80-150 Wörter Antwort.
