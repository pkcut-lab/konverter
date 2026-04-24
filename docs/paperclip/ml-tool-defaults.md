# ML-Tool-Defaults — Builder-Spec (v1.0, 2026-04-24)

**Scope.** Tools mit `requires_external_model: true` (Browser-ML via Transformers.js,
MediaPipe, ONNX-Web). Aktuell: `video-hintergrund-entfernen`, `sprache-verbessern`,
`webcam-hintergrund-unschaerfe`, `hintergrund-ersetzen`, `bild-hintergrund-entfernen`,
`audio-enhancement`.

**Zweck.** Statt pro Tool Design-Entscheidungen an den User zu eskalieren,
arbeitet der Tool-Builder mit dokumentierten Defaults — AUTONOM. Der User greift
nur ein, wenn ein neuer Blocker auftaucht, der hier NICHT dokumentiert ist.

---

## 3 bekannte Blocker → 3 Sane Defaults

### D1: WebCodecs Safari-Support

**Problem.** `VideoFrame` / `AudioData` APIs sind in Safari hinter `Experimental Web
Platform features`-Flag. Firefox hat teilweise Support, Chrome/Edge sind grün.

**Default.**
- **KEIN Polyfill.** Keine Canvas-Extraction-Fallback-Pipeline.
- **Feature-Detection** zur Ladezeit via `typeof VideoFrame !== 'undefined'`.
- Bei Fail: **BrowserCompatibilityNotice.svelte** rendert oberhalb der Dropzone:
  > "Dieses Tool braucht WebCodecs. In Safari aktiviere in den Entwickler-
  > Einstellungen `Experimental Web Platform Features` oder nutze Chrome / Firefox /
  > Edge."
- Kein Tracking, kein Prompt. User liest, entscheidet, wechselt Browser oder nicht.

**Rationale.** Polyfill-Canvas-Pipeline verdoppelt Code + verschlechtert Latenz auf
~3× — 95/5 Rule: die 5% Safari-User lesen den Hinweis und switchen oder kommen
später wieder, die 95% Chrome/Firefox/Edge-User kriegen schlanken Build.

### D2: EU-AI-Act-Labeling (Art. 50)

**Problem.** Ab 02.08.2026 MUSS "AI-generated or -manipulated content" für End-User
sichtbar markiert sein. Tool-Output fällt in die Kategorie "AI-assisted content".

**Default.**
- **UI-Badge** neben Download-Button: kleines `<Badge variant="info">AI-verarbeitet</Badge>`
  (Token `--color-info-bg` / `--color-info-fg`, passt ins Design).
- **File-Metadata** im Output (MP4/MP3/WebM/PNG): `Comment`-Tag oder
  `Software`-Tag mit Wert `kittokit.de AI-processed (model=<name>, version=<v>)`.
  Bei MP4 via `ffmpeg.wasm` metadata flag, bei Canvas-Export via PNG-tEXt-Chunk.
- **Keine** sichtbaren Wasserzeichen im Content — nur Badge + Metadata.
- **Footer-Hinweis** unterhalb des Tool-Outputs: "Dieses Tool ersetzt Elemente via
  Machine-Learning. Ausgabedatei enthält Metadaten-Tag `Software: kittokit.de`
  (EU-AI-Act Art. 50)."

**Rationale.** Sichtbares Wasserzeichen disqualifiziert das Tool für professionelle
Nutzung (Podcaster, Video-Producer). Badge + Metadata reicht für Compliance ohne
Quality-Impact. Legal-Auditor muss bei Post-Ship-Audit bestätigen.

### D3: 4K-Passthrough Accuracy-Claim

**Problem.** Browser-ML-Modelle sind max 1024×1024 (MediaPipe-SelfieSegmenter) bis
2048×2048 (MODNet). 4K (3840×2160) würde down+upsampling brauchen → sichtbare
Soft-Edge-Artefakte.

**Default.**
- **UI-Cap auf 1920×1080 (FullHD)** — Dropzone rejected >1920 Pixel Width/Height mit
  klarer Meldung:
  > "Dieses Tool unterstützt bis FullHD (1920×1080). Deine Datei ist
  > {width}×{height}. Bitte skalieren oder später versuchen, wenn 4K-Modelle
  > browser-ready sind."
- **Copy-Anpassung** im Hero + SEO: **Kein** "4K"-Claim. Stattdessen: "Verlustfreie
  FullHD-Verarbeitung, 100% lokal, kein Upload".
- **Dossier-Differenzierungs-Hypothese** (falls 4K erwähnt) wird downgegradet — 
  Builder dokumentiert im Tool-Kommentar: "D3: FullHD-Cap, 4K-Support wenn
  Transformers.js v4 MODNet-2K ships (~Q3 2026)."

**Rationale.** Falscher 4K-Claim ist Marketing-Lüge. FullHD trifft 90% der
Realnutzer (Webcam-Captures, Handy-Videos sind idR 1080p). Upgrade-Path klar
dokumentiert.

---

## Wenn ein neuer ML-Blocker auftaucht

Dossier-Researcher soll `blockers_documented_in_ml_defaults: [D1, D2, D3]` im
Dossier-Frontmatter setzen. Builder checked diese Liste:

- Alle aufgeführten Blocker → Defaults anwenden, autonom builden.
- **Neuer Blocker**, nicht in D1-D3 → Builder schreibt **Daily-Digest-Eintrag**
  (nicht Live-Alarm): "ML-Build <slug> paused: new blocker <kurzbeschreibung>".
  CEO scanned Digest, erzeugt Rework-Ticket mit User-Flag. User aktualisiert
  `ml-tool-defaults.md` → Blocker-Katalog wächst.

**Das ist die einzige Ausnahme**, in der ML-Tools User-Input brauchen. Für D1-D3
ist die Antwort festgelegt.

---

## Change-Log

- **v1.0 (2026-04-24)** — Initial-Set D1/D2/D3, ausgelöst durch Consumer-Loop-Patch
  (Autonomy vor Escalation).
