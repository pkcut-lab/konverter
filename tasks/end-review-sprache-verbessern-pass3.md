---
ticket_type: end-review
pass_number: 3
target_slug: sprache-verbessern
tool_id: speech-enhancer
build_commit_sha: 5132d1512c99aeb64998d64a157de931795fd996
dossier_ref: tasks/dossiers/_cache/audio/sprache-verbessern.dossier.md
previous_pass_ref: tasks/end-review-sprache-verbessern-pass2.md
verdict: clean
reviewed_at: 2026-04-25T23:40:00Z
reviewer_model: claude-sonnet-4-6
thinking_budget: ultra
---

## TL;DR

**clean.** Unabhängiger Pass-3-Check bestätigt alle Pass-2-Befunde ohne neue Blocker. B-01 (ONNX-Tensor-Assertion) ist in `speech-enhancer.ts:161-176` fest verankert — kein TODO-Kommentar, kein silent Fallback. 1650/1650 Tests grün (35 Extra aus ungetrackter a11y-Testdatei, nicht im Build-SHA). Die vier carry-forward Improvements (I-01, I-02, I-03, I-04) sind unverändert nicht-blockierend.

---

## §2.1 Build & Boot

```
rm -rf dist/ .astro/ → npm run build → Complete!
output: "static"
Vite: ✓ built in 25.91s
Static routes: ✓ Completed in 5.09s
  ├─ /de/sprache-verbessern/index.html (+33ms)
Pagefind: Indexed 73 pages ✓
Tests: 1650/1650 ✓ (35 extra von ungetracktem tests/a11y/pdf-komprimieren.spec.ts — not in SHA)
```

Build sauber. Chunk-Size-Warnungen pre-existing site-wide. `speech-enhancer.GOdBaOm6.js`: 407.66 kB / 112.28 kB gzip — lazy-loaded, nicht blocking.

Route `dist/de/sprache-verbessern/index.html` existiert ✓
Layout-Marker im HTML: `eyebrow`, `tool-main`, `tool-section`, `related-bar` ✓

---

## §2.2 Funktions-Test

**B-01-Fix verifiziert (speech-enhancer.ts:161-176):**

```typescript
const EXPECTED_INPUTS = ['input'];
const EXPECTED_OUTPUTS = ['output'];
const badInputs = EXPECTED_INPUTS.filter((n) => !newSession.inputNames.includes(n));
const badOutputs = EXPECTED_OUTPUTS.filter((n) => !newSession.outputNames.includes(n));
if (badInputs.length > 0 || badOutputs.length > 0) {
  throw new Error(`DeepFilterNet3 ONNX tensor name mismatch — ...`);
}
```

Kein TODO-Kommentar im File: `grep -c "TODO" speech-enhancer.ts` = 0 ✓

**Bypass-Pfad (attenLimDb = 0, speech-enhancer.ts:233):**

```typescript
if (opts.attenLimDb === 0) { return encodeWav(samples48k, SAMPLE_RATE); }
```
Kein ONNX-Call. ✓

**Inference-Pfad (attenLimDb > 0, speech-enhancer.ts:351-353):**

```typescript
const wet = Math.min(1, Math.max(0, attenLimDb / 100));
const dry = 1 - wet;
```
Wet/dry-Mix korrekt für Stärke-Kontrolle. ✓

**Per-Frame Error-Handling (speech-enhancer.ts:374-377):**

```typescript
} catch {
  enhanced = frame.slice(); // Fallback auf Hann-gefensterten Originalframe
}
```
✓

**Stall-Watchdog (speech-enhancer.ts:103-118):** 120s Timeout, race-condition-sicher via `settled`-Flag. ✓

**WAV-Encoder (D2-Pflicht):** `encodeWav()` schreibt LIST-INFO/ISFT-Chunk mit `kittokit.de AI-processed (model=DeepFilterNet3)`. ✓

### Input-Format-Konsistenz (§2.2.1)

N/A. Kein numerisches Freitext-Input-Feld. Stärke-Preset ist eine Radiogruppe mit 4 fixen Optionen (0, 20, 40, 100 dB). DE-Locale-Parsing-Bugs strukturell ausgeschlossen. ✓

---

## §2.3 Dossier §9 Differenzierung

| Hypothese | Status | Nachweis |
|-----------|--------|----------|
| H1: Pure-Client (kein Upload) | ✓ | Keine externen Calls außer HF-Modell-Download (§7a-Ausnahme); Privacy-First im Tagline + FAQ kommuniziert |
| H2: Strength-Preset Default 20dB | ✓ | `config.ts default: '20'`; HTML: `checked=""` auf Preset-20; Label "Dezent · empfohlen" |
| H3: A/B-Playback | ~ | Zwei unabhängige `<audio controls>`. Kein Sync-Scrub. V1-akzeptabel (I-02 carry-forward) |
| H4: DE-native (sprach-agnostisch) | ✓ | de.md erklärt spektralen Filter ohne ASR; FAQ3 klärt Mono-Output |

---

## Blocker

**Keine.** Keine neuen Blocker gegenüber Pass 2. Alle Pass-1/2-Blocker gefixt.

---

## Improvements (sollten gemacht werden, nicht ship-blocking)

### I-01 — Content-Genauigkeit: Prose behauptet direkten atten_lim_db-Zugriff (CARRY-FORWARD)

**Problem:** `de.md:45-47`:
> "Der Stärke-Slider gibt dir direkte Kontrolle über den `atten_lim_db`-Parameter des Modells"

Tatsächliche Implementation: linearer wet/dry-Mix-Prozentsatz (`attenLimDb / 100`), kein direkter ONNX-Parameter. Tabelle bei `de.md:72` nutzt `atten_lim_dB` als Spaltenheader (physikalisch irreführend: impliziert logarithmische Dämpfung, Werte sind linear).

**Fix:** Prosa + Tabelle auf Wet/Dry-Sprache umstellen.

### I-02 — Dossier H3: A/B-Playback ohne Sync-Scrub (CARRY-FORWARD)

Zwei unabhängige `<audio controls>`. Kein `timeupdate`-Sync. V1-akzeptabel.

### I-03 — Content: Zwei externe Links (CONTENT.md §11) (CARRY-FORWARD)

- `de.md:40`: `[ICASSP 2023 als State-of-the-Art-Modell](https://github.com/Rikorose/DeepFilterNet)` — GitHub, kein Normungs-Organ
- `de.md:79-80`: `[Feedback-Muster zu Adobe Podcast V2](https://thepodcastconsultant.com/blog/adobe-podcast-enhance)` — Drittseite

**Fix:** Links in Plain-Text umwandeln.

### I-04 — A11y: Preset-Fieldset-Legend "Qualität" statt "Stärke" (CARRY-FORWARD Pass 2)

`FileTool.svelte:465`: `<legend class="presets__legend">Qualität</legend>` — hardcoded für alle File-Tools. Für sprache-verbessern semantisch inkohärent (Stärke-Einstellungen, nicht Qualitätsstufen). Screen-Reader-Nutzer hören "Gruppe Qualität". Site-weite Verbesserung.

---

## Observations (Backlog)

- O-01: `ort.env.wasm.wasmPaths = '/ort/'` — WASM self-hosted (public/ort/), kein CDN. CLAUDE.md §18 #7 eingehalten. ✓
- O-02: Modell-URL hardcoded (huggingface.co/grazder/DeepFilterNet3). §7a-Ausnahme genehmigt. ✓
- O-03: No `onclick="..."` oder `javascript:` in dist/de/sprache-verbessern/index.html — keine CSP-Inline-Event-Handler. ✓
- O-04: 73 DE-Routen, Pagefind 73 Seiten indexiert. ✓
- O-05: Related-Bar: hevc-zu-h264, hintergrund-entfernen, webp-konverter — alle 3 Routen in dist/ vorhanden. ✓
- O-06: Word count: 1246 Wörter (≥300 Pflicht). ✓
- O-07: 21× `&nbsp;` in de.md (korrekte Zahl-Einheit-Trennung). ✓
- O-08: Letzte H2 ist `## Verwandte Audio-Tools` mit 3 internen Links. ✓
- O-09: `headingHtml`: `<em>Sprache</em> verbessern — KI-Rauschunterdrückung` — max 1 `<em>`, wraps Ziel-Substantiv. ✓

---

## §2.9 Regression-Status (Pass 2 → Pass 3)

| Pass-2-Finding | Status | Beleg |
|----------------|--------|-------|
| B-01: ONNX Tensor Assertion (5132d15) | ✓ **bestätigt gefixt** | speech-enhancer.ts:161-176: `badInputs`/`badOutputs`-Check + `throw new Error(...)`. `grep "TODO" speech-enhancer.ts` = 0 Hits. |
| I-01: atten_lim_db-Prosa | ✗ offen | de.md:45-47 unverändert. Non-blocking, carry-forward. |
| I-02: A/B kein Sync-Scrub | ✗ offen | FileTool.svelte: zwei unabhängige `<audio controls>`. Non-blocking, carry-forward. |
| I-03: Externe Links | ✗ offen | de.md:40 + de.md:79-80 unverändert. Non-blocking, carry-forward. |
| I-04: Legend "Qualität" | ✗ offen | FileTool.svelte:465 unverändert. Non-blocking, site-wide carry-forward. |

Keine neuen Blocker durch Regression entstanden. Build-SHA 5132d15 ist identisch mit Pass-2-SHA.

---

## Abschnitts-Zusammenfassung

| Dimension | Status | Details |
|-----------|--------|---------|
| Build & Boot | ✓ | 1650 Tests, Route OK, Pagefind 73 Seiten |
| Funktion | ✓ | B-01 fix bestätigt; Bypass/Inference korrekt; WAV-Encoder korrekt; Watchdog korrekt |
| Input-Format-Konsistenz (§2.2.1) | ✓ N/A | Kein numerischer Freitext-Input |
| Security | ✓ | Kein innerHTML/eval; WASM self-hosted; keine unbefugten Netzwerk-Calls; keine Inline-Handler |
| Performance | ✓ | 112.28 kB gzip lazy-loaded (< 150 kB Limit) |
| A11y | ~ | I-04 Presets-Legend "Qualität" (site-wide, non-blocking) |
| UX | ~ | A/B ohne Sync-Scrub (I-02, V1-akzeptabel) |
| Content | ~ | I-01 atten_lim_db-Prosa + I-03 externe Links (beide non-blocking) |
| Dossier-Differenzierung | ~ | H1 ✓, H2 ✓, H3 ~ (partial A/B), H4 ✓ |

---

## Recommendation for CEO

**Verdict: clean. Tool ist ship-ready.**

Triple-Pass abgeschlossen:
- Pass 1: B-01 identifiziert (unverified ONNX tensor names → silent no-op)
- Pass 2: B-01 fix (5132d15) verifiziert, 0 Blocker
- Pass 3: Unabhängige Bestätigung — 0 Blocker, keine Regressionen, 1650/1650 Tests grün

Carry-forward Post-Ship Backlog:
1. `de.md:45-47` + Tabelle: atten_lim_db-Beschreibung auf Wet/Dry-Mix-Sprache aktualisieren (I-01)
2. `de.md:40 + 79-80`: Externe Links in Plain-Text (I-03)
3. `FileTool.svelte:465`: Legend-Text aus Config-Prop ziehen statt hardcoded "Qualität" (I-04, site-wide)
4. A/B Sync-Scrub via `timeupdate` (I-02, V1.1-Kandidat)

→ **Appendiere in Freigabe-Liste.**
