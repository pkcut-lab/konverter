---
ticket_type: end-review
pass_number: 2
target_slug: sprache-verbessern
tool_id: speech-enhancer
build_commit_sha: 5132d1512c99aeb64998d64a157de931795fd996
dossier_ref: tasks/dossiers/_cache/audio/sprache-verbessern.dossier.md
previous_pass_ref: tasks/end-review-sprache-verbessern-pass1.md
verdict: clean
reviewed_at: 2026-04-25T21:15:00Z
reviewer_model: claude-sonnet-4-6
thinking_budget: ultra
---

## TL;DR

**clean.** Pass 1 Blocker B-01 (unverified ONNX tensor names → silent no-op) ist in commit 5132d15 vollständig gefixt: Assertion bei Model-Load, 0 verbleibende TODOs, 1615/1615 Tests grün. Keine neuen Blocker aus dem unabhängigen Pass-2-Review. Die zwei nicht-blockierenden Improvements aus Pass 1 (I-01 atten_lim_db-Prosa, I-03 externe Links) sind bewusst nicht gefixt — sie bleiben als Improvements offen.

---

## §2.1 Build & Boot

```
npm run build → Complete! (keine Errors)
Tests: 1615/1615 ✓
Route: dist/de/sprache-verbessern/index.html ✓
Pagefind: 73 Seiten indexiert ✓
```

Build sauber. Chunk-Size-Warnungen sind pre-existing site-wide (dynamic-import-collision). `speech-enhancer.GOdBaOm6.js`: 407 kB / 112 kB gzip — lazy-loaded, nicht blocking.

---

## §2.2 Funktions-Test

**Bypass-Pfad (attenLimDb = 0):**
`speech-enhancer.ts:233`: `if (opts.attenLimDb === 0) { return encodeWav(samples48k, SAMPLE_RATE); }` — kein ONNX-Call. ✓

**Inference-Pfad (attenLimDb > 0):**
- Wet/dry-Mix: `wet = min(1, attenLimDb / 100)`, `dry = 1 - wet` — korrekt für Stärke-Kontrolle.
- Per-Frame try/catch: bei ONNX-Error → Fallback auf Hann-gefensterten Original-Frame. ✓
- Tensor-Assertion: nach Model-Load werden `session.inputNames.includes('input')` und `session.outputNames.includes('output')` geprüft. Mismatch wirft expliziten Error. ✓

**Stall-Watchdog:**
`prepareSpeechEnhancementModel` hat 120s Watchdog mit `StallError`. Race-Condition-sicher via `settled`-Flag. ✓

**WAV-Encoder (D2-Pflicht):**
LIST-INFO/ISFT-Chunk mit `kittokit.de AI-processed (model=DeepFilterNet3)`. RIFF-Struktur mathematisch verifiziert (totalBytes = 52 + pcmLength + infoChunkSize stimmt). ✓

### Input-Format-Konsistenz (§2.2.1)

N/A. Kein numerisches Freitext-Input-Feld. Stärke-Preset ist ein Radiogruppe mit 4 fixen Optionen (0, 20, 40, 100). DE-Locale-Parsing-Bugs strukturell ausgeschlossen. ✓

---

## §2.3 Dossier §9 Differenzierung

| Hypothese | Status | Nachweis |
|-----------|--------|----------|
| H1: Pure-Client (kein Upload) | ✓ | Keine Netzwerk-Calls außer HF-Modell-Download (§7a-Ausnahme); Tagline + FAQ1 kommunizieren es klar |
| H2: Strength-Slider Default 30%/20dB | ✓ | Config `default: '20'`; Label "Dezent · empfohlen"; HTML: `checked=""` auf Preset-20 |
| H3: A/B-Playback mit Sync-Scrub | ~ | Zwei unabhängige `<audio controls>` (ORIGINAL + ERGEBNIS). Kein Sync-Scrub. Partial-Impl akzeptabel für V1. |
| H4: DE-native (sprach-agnostisch) | ✓ | de.md erklärt spektralen Filter ohne ASR; FAQ3 klärt Mono-Output |

H3 bleibt Improvement (I-02 aus Pass 1, carry-forward, nicht Blocker).

---

## Blocker

**Keine.**

---

## Improvements (sollten gemacht werden, nicht ship-blocking)

### I-01 — Content-Genauigkeit: Prose behauptet direkten atten_lim_db-Zugriff (CARRY-FORWARD Pass 1)

**Problem:** `de.md:45-47`:
> "Der Stärke-Slider gibt dir direkte Kontrolle über den `atten_lim_db`-Parameter des Modells: Wie stark Rauschen maximal gedämpft werden darf."

Tatsächliche Implementation (`speech-enhancer.ts:351-353`):
```typescript
const wet = Math.min(1, Math.max(0, attenLimDb / 100));
const dry = 1 - wet;
// → overlap-add mit wet/dry mix post-inference
```
Das Modell exposes `atten_lim_db` **nicht** als ONNX-Input. Die Zahl wird als linearer Blend-Prozentsatz (÷100) genutzt. Auch die Tabelle bei `de.md:72` nutzt `atten_lim_dB` als Spaltenheader, was physikalisch irreführend ist (dB impliziert logarithmische Dämpfung, die Werte sind lineare Prozentwerte).

**Fix:** `de.md:45-47` und Tabelle-Header ersetzen: "Der Stärke-Slider steuert, wie stark die gefilterte Version zum Original beigemischt wird (0 % = Bypass, 100 % = vollständig gefiltert)."

### I-02 — Dossier H3: A/B-Playback ohne Sync-Scrub (CARRY-FORWARD Pass 1)

Zwei unabhängige `<audio controls>`. Kein Sync-Scrub via `timeupdate`-Event. Akzeptabel für V1.

**Fix-Vorschlag:** FileTool.svelte: `timeupdate` von einem `<audio>`-Element → `currentTime` auf das andere setzen.

### I-03 — Content: Zwei externe Links (CONTENT.md §11 Verletzung) (CARRY-FORWARD Pass 1)

**Problem:**
- `de.md:40`: `[ICASSP 2023 als State-of-the-Art-Modell](https://github.com/Rikorose/DeepFilterNet)` — GitHub, kein Normungs-Organ
- `de.md:80`: `[Feedback-Muster zu Adobe Podcast V2](https://thepodcastconsultant.com/blog/adobe-podcast-enhance)` — Drittseite

**Fix:** Links in Plain-Text umwandeln.

### I-04 — A11y: Preset-Fieldset-Legend "Qualität" statt "Stärke" (NEU Pass 2)

**Problem:** `FileTool.svelte:461`: `<legend class="presets__legend">Qualität</legend>` — hardcoded "Qualität" für alle File-Tools mit Presets. Für sprache-verbessern sind die Presets Stärke-Einstellungen, nicht Qualitätsstufen. Screen-Reader-Nutzer hören "Gruppe Qualität" gefolgt von "Bypass · kein Filter", "Dezent · 20 dB", etc. — semantisch inkohärent.

**Beleg:** HTML: `<fieldset class="presets svelte-9ggdb8" ...><legend class="presets__legend svelte-9ggdb8">Qualität</legend>`

**Impact:** Screen-Reader-Nutzer können den Slider-Zweck nicht aus der Fieldset-Beschriftung ableiten. Visuell irrelevant, per SR erfahrbar.

**Fix:** `FileTool.svelte` — Legend-Text aus der `config.presets`-Prop nehmen (z.B. optional `config.presets.legend` fallback "Einstellungen") oder explizit für audio-Kategorie "Stärke" setzen.

**Severity-Klärung:** Improvement, nicht Blocker. Die Radio-Labels selbst (Bypass, Dezent, Mittel, Maximal) sind korrekt und voll lesbar. Die Fieldset-Legend ist nur der Gruppen-Kontext.

---

## Observations (Backlog)

- **O-01:** `ort.env.wasm.wasmPaths = '/ort/'` — WASM self-hosted (public/ort/), kein CDN. CLAUDE.md §18 #7 eingehalten. ✓
- **O-02:** Modell-URL hardcoded (`huggingface.co/grazder/DeepFilterNet3`). §7a-Ausnahme genehmigt. Keine weiteren externen Calls.
- **O-03:** CSP fehlt site-wide (0 Content-Security-Policy in HTML). Pre-existing. Nicht sprache-verbessern-Scope.
- **O-04:** `<label class="btn btn--primary">` wrapping `<input type="file">` — kein echtes `<button>`. Keyboard-Zugänglichkeit via Tab → Enter funktioniert durch hidden file-input, aber Screen-Reader-Rolle ist "label" nicht "button". Akzeptabel, da Inhalt klar.
- **O-05:** Related-bar zeigt 3 Tools (hevc-zu-h264, hintergrund-entfernen, audio-transkription) — System auto-füllt 3. Alle 3 Routen existieren im dist. ✓
- **O-06:** `<audio controls>` hat keinen expliziten `aria-label`. Browser-Standard-Label genügt für Zugänglichkeit (NVDA/VoiceOver kündigt "audio"-Element an). Nicht Blocker.

---

## §2.9 Regression-Status

| Pass-1-Finding | Status | Beleg |
|----------------|--------|-------|
| B-01: Unverified ONNX Tensor Names | ✓ **gefixt** (5132d15) | speech-enhancer.ts:161-176: `badInputs`/`badOutputs`-Check + `throw new Error(...)` ersetzt beide TODO-Kommentare. `grep -c "TODO" speech-enhancer.ts` = 0. |
| I-01: atten_lim_db-Prosa | ✗ offen | de.md:45-47 unverändert: "direkte Kontrolle über den atten_lim_db-Parameter". Non-blocking, carry-forward. |
| I-02: A/B kein Sync-Scrub | ✗ offen | FileTool.svelte: zwei unabhängige `<audio controls>`. Non-blocking, carry-forward. |
| I-03: Externe Links | ✗ offen | de.md:40 + de.md:80 unverändert. Non-blocking, carry-forward. |

Keine neuen Blocker durch den B-01-Fix entstanden (Regression geprüft: Build grün, alle Code-Paths verifiziert).

---

## Abschnitts-Zusammenfassung

| Dimension | Status | Details |
|-----------|--------|---------|
| Build & Boot | ✓ | 1615 Tests, Route OK, Pagefind 73 Seiten |
| Funktion | ✓ | B-01 gefixt; Bypass/Inference-Pfade korrekt; WAV-Encoder korrekt |
| Input-Format-Konsistenz (§2.2.1) | ✓ N/A | Kein numerischer Freitext-Input |
| Security | ✓ | Kein innerHTML/eval; WASM self-hosted; keine unbefugten Netzwerk-Calls |
| Performance | ✓ | 112 kB gzip lazy-loaded (< 150 kB Limit) |
| A11y | ~ | Presets-Legend "Qualität" (I-04 site-wide, Improvement) |
| UX | ~ | A/B ohne Sync-Scrub (I-02, V1-akzeptabel) |
| Content | ~ | I-01 atten_lim_db-Prosa + I-03 externe Links (beide non-blocking) |
| Dossier-Differenzierung | ~ | H1 ✓, H2 ✓, H3 ~ (partial A/B), H4 ✓ |

---

## Recommendation for CEO

**Verdict: clean. Tool ist ship-ready.**

B-01 ist vollständig gefixt (Tensor-Assertion wirft expliziten Error bei Mismatch statt silent Fallback). Keine Blocker. 1615/1615 Tests grün.

Die drei offenen Improvements (I-01, I-02, I-03) sind bewusst nicht vor Ship gefixt — sie sind nicht user-blocking. I-04 ist ein site-weites FileTool.svelte-Problem.

**Empfohlene Post-Ship Backlog-Items:**
1. `de.md:45-47` + Tabelle: atten_lim_db-Beschreibung auf Wet/Dry-Mix-Sprache aktualisieren (I-01).
2. `de.md:40 + 80`: Externe Links in Plain-Text umwandeln (I-03).
3. `FileTool.svelte:461`: Legend-Text aus Config-Prop ziehen statt hardcoded "Qualität" (I-04, site-wide).
4. A/B Sync-Scrub via `timeupdate` (I-02, V1.1-Kandidat).

→ **Appendiere in Freigabe-Liste.**
