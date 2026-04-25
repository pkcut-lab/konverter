---
title: Completed Tools — Live-Liste
maintained_by: CEO-Agent (auto-append via §7.5 Post-Deploy-Hook)
format_version: 2
seed_date: 2026-04-21
last_manual_sync: 2026-04-21
---

# Completed Tools — Live-Liste

Automatisch gepflegte Liste aller ausgelieferten Konverter-Tools. CEO hängt
nach jedem erfolgreichen Deploy-Routing (Autonomie-Gate §7 oder ship-as-is)
eine neue Zeile direkt unter dem Anchor-Marker an. Neue Einträge erscheinen
oben, ältere wandern nach unten.

- **Local-Dev-URL:** `http://localhost:4322/de/<slug>` (Astro dev)
- **Production-URL:** `https://konverter-7qc.pages.dev/de/<slug>` (CF Pages)
- **Shipped-Date:** erster Commit der `src/content/tools/<slug>/de.md`-Datei
- **Status:** `shipped` (regulär gemerged) · `ship-as-is` (Auto-Resolve >2 Reworks, Score ≥0.80) · `in-review` (dispatched, noch nicht gemerged)

## Auto-Append-Contract (für CEO §7.5)

CEO nutzt eine anchored awk-Regel, die NUR exakt den Marker-Kommentar als
einzelne Zeile matcht — Referenzen im Fließtext (wie dieser hier) matchen
nicht und führen zu keinem Doppel-Append. Der exakte Marker-String ist im
AGENTS.md §7.5-Block dokumentiert und darf im Body dieses Files sonst
NICHT als eigenständige Zeile vorkommen.

Pipeline pro Deploy: Duplikat-Guard → Enum-Guard → anchored awk-Insert →
Backlog-Skip-Sync → Digest-Note → einzelner Commit.

## Tool-Liste

| Slug | Category | Status | Shipped | Local | CEO-Notes |
|---|---|---|---|---|---|
<!-- CEO-APPEND -->
| [video-hintergrund-entfernen](https://konverter-7qc.pages.dev/de/video-hintergrund-entfernen) | video | shipped | 2026-04-26 | [dev](http://localhost:4322/de/video-hintergrund-entfernen) | Erstes ML-File-Video-Tool (§7a-Ausnahme); 25/25 Tests (16 Config + 9 Worker-Shim mit MockWorker); Web-Worker-Pipeline (BiRefNet_lite/MODNet via @huggingface/transformers + Mediabunny VP9+Alpha-Mux); CONVENTIONS §10 MLFileTool-Template separat committed (3af9bc0); 4 V1-Scope-Cuts logged (Audio + Bild/Video-BG + PNG-Seq → Phase 2); PE4 (KON-454) revertiert da client:load-Hydration broken; vite.worker.format=es ergänzt; Modell-CDN: transformers.js HF-Mirror für V1, R2-Self-Hosted Phase 2 |
| [webcam-hintergrund-unschaerfe](https://konverter-7qc.pages.dev/de/webcam-hintergrund-unschaerfe) | image | shipped | 2026-04-25 | [dev](http://localhost:4322/de/webcam-hintergrund-unschaerfe) | 3-Pass End-Review clean (KON-441 P1 clean 0 blockers, KON-442 P2 clean 0 blockers +I-03 role=alert, KON-443 P3 clean commit 9dd6340); R2 rework (KON-437 webcam Formatter double-rendering fix — type=interactive guard in [slug].astro); Pipeline: build → 8 R1 Critics → Meta-R1 → R2-rework KON-437 → Meta-R2 KON-437 SHIP-READY |
| [skonto-rechner](https://konverter-7qc.pages.dev/de/skonto-rechner) | finance | shipped | 2026-04-25 | [dev](http://localhost:4322/de/skonto-rechner) | 3-Pass End-Review clean (KON-426 P1 clean, KON-428 P2 1 blocker B-01, KON-438 fix commit 273e12c, KON-439 re-check clean, KON-440 P3 clean); R2 rework (KON-402 B1 --color-warning token + B2 tap-targets 44px); Dossier KON-315; Pipeline: KON-317 build → 8 R1 Critics → KON-401 Meta-R1 → KON-402 R2 rework → 8 R2 Critics → KON-424 Meta-R2 SHIP-READY |
| [pdf-aufteilen](https://konverter-7qc.pages.dev/de/pdf-aufteilen) | document | shipped | 2026-04-26 | [dev](http://localhost:4322/de/pdf-aufteilen) | Phase 2 Sonderdelegation Tool 2 (Greenfield ab Dossier KON-323); 40/40 Tests (Page-Range-Parser sauber abgedeckt: leer/0/-3/a-b/5-3/1-99/three-part/500-char-overflow/full-doc/duplicates/whitespace/trailing-comma); Custom-Component PdfAufteilenTool.svelte (~370 LoC) mit pdf-lib lazy-import; pdf-split-utils.ts pure helpers (parsePageRanges 1-indexed, totalPagesInRanges, formatRangeLabel U+2013, derivePerRangeFilename); 2-Modi-Toggle (Eine Datei vs. Pro Bereich, Differenzierung-Mode-Combo); Default-Range = Full-Doc nach Upload; encrypted-PDF Cut konsistent zu pdf-zusammenfuehren; 3-Pass End-Review clean |
| [pdf-zusammenfuehren](https://konverter-7qc.pages.dev/de/pdf-zusammenfuehren) | document | shipped | 2026-04-26 | [dev](http://localhost:4322/de/pdf-zusammenfuehren) | Phase 2 Sonderdelegation Tool 1; 26/26 Tests; Custom-Component PdfZusammenfuehrenTool.svelte (~340 LoC) mit pdf-lib lazy-import (438 KB chunk, code-split); button-up/down Reorder statt Drag-Drop für A11y; Metadata-strip-Toggle (Differenzierung H3); encrypted-PDF-Support deferred wegen pdf-lib-Limit (FAQ + Prose ehrlich umgeschrieben, CEO-Decisions-Log 2026-04-26); YAML-Encoding-Fix (4× ASCII-`"` → typografisches `"`); 3-Pass End-Review clean |
| [roi-rechner](https://konverter-7qc.pages.dev/de/roi-rechner) | finance | shipped | 2026-04-25 | [dev](http://localhost:4322/de/roi-rechner) | Orphan-Resolve CEO-HB run 427a0f96; Build-Commit 19b2688 + Test-Fix 3601b58 (KON-346 rework); 23/23 Tests grün; verify-tool-build.sh PASS; 3 Modi (Einfach/Erweitert/DuPont); kgv-rechner-Präzedenz für Direct-Sequential-Ship ohne formale Phase D-F |
| [audio-transkription](https://konverter-7qc.pages.dev/de/audio-transkription) | text | shipped | 2026-04-25 | [dev](http://localhost:4322/de/audio-transkription) | Sonderdelegation Heartbeat-44 Tool 10; 16/16 Tests; Whisper-Modell via @huggingface/transformers, AudioTranskriptionTool.svelte (705 LoC) Custom-Component vorhanden; Phase B–E aus früherer Session, Tests in dieser Session ergänzt |
| [ki-bild-detektor](https://konverter-7qc.pages.dev/de/ki-bild-detektor) | text | shipped | 2026-04-25 | [dev](http://localhost:4322/de/ki-bild-detektor) | Sonderdelegation Heartbeat-44 Tool 9; 15/15 Tests; Vision-Transformer-Modell via @huggingface/transformers für AI-vs-Real-Image-Klassifikation, KiBildDetektorTool.svelte (484 LoC); Phase B–E aus früherer Session |
| [ki-text-detektor](https://konverter-7qc.pages.dev/de/ki-text-detektor) | text | shipped | 2026-04-25 | [dev](http://localhost:4322/de/ki-text-detektor) | Sonderdelegation Heartbeat-44 Tool 8; 15/15 Tests; ONNX-RoBERTa-Modell (onnx-community/tmr-ai-text-detector-ONNX) via @huggingface/transformers, KiTextDetektorTool.svelte (423 LoC); Phase B–E aus früherer Session |
| [bild-zu-text](https://konverter-7qc.pages.dev/de/bild-zu-text) | text | shipped | 2026-04-25 | [dev](http://localhost:4322/de/bild-zu-text) | Sonderdelegation Heartbeat-44 Tool 7; 16/16 Tests; Tesseract.js OCR (Deutsch + Englisch) lokal im Browser, HEIC-Pre-Decode via heic2any; Tool war Phase B–E bereits fertig (Tests fehlten) |
| [jpg-zu-pdf](https://konverter-7qc.pages.dev/de/jpg-zu-pdf) | document | shipped | 2026-04-25 | [dev](http://localhost:4322/de/jpg-zu-pdf) | Sonderdelegation Heartbeat-44 Tool 4; 23/23 Tests; 9 TS-Errors in jpg-zu-pdf-runtime.ts gefixt (Null-Guards für data[i+N], exactOptionalPropertyTypes-Refactor); FileTool generic via tool-runtime-registry; lossless DCTDecode-JPEG-Embed via pdf-lib; mobile-first mit cameraCapture |
| [erbschaftsteuer-rechner](https://konverter-7qc.pages.dev/de/erbschaftsteuer-rechner) | finance | shipped | 2026-04-25 | [dev](http://localhost:4322/de/erbschaftsteuer-rechner) | Sonderdelegation Heartbeat-44 Tool 3; 25/25 Tests; 2 Floating-Point-Test-Fails durch round2() in berechneRohsteuer gefixt; Härteausgleich §24 ErbStG implementiert; Content + Slug-Map + Tool-Registry neu angelegt; Legal-Disclaimer "Keine Steuerberatung" eingebaut |
| [leasing-faktor-rechner](https://konverter-7qc.pages.dev/de/leasing-faktor-rechner) | finance | shipped | 2026-04-25 | [dev](http://localhost:4322/de/leasing-faktor-rechner) | Sonderdelegation Heartbeat-44 Tool 2; 27/27 Tests; TS-Fix exactOptionalPropertyTypes durch refactor von Object-Spread zu conditional assignment; 5-stufige leasingmarkt.de-Bewertungsskala + Markt-Benchmark-Gauge |
| [cashflow-rechner](https://konverter-7qc.pages.dev/de/cashflow-rechner) | finance | shipped | 2026-04-25 | [dev](http://localhost:4322/de/cashflow-rechner) | Sonderdelegation Heartbeat-44 Tool 1; 27/27 Tests; Phase A–F clean (Phase A–B aus früherer Session, Phase D–F durch Tool-Builder); 3 Berechnungsmodi (direkt/indirekt/Free CF) in einem Tool |
| [kgv-rechner](https://konverter-7qc.pages.dev/de/kgv-rechner) | finance | shipped | 2026-04-25 | [dev](http://localhost:4322/de/kgv-rechner) | erstes Tool durch neue Sequential-Pipeline (§0 v1.5); 20/20 Tests; Phase A–F clean ohne Rework |
| [stundenlohn-jahresgehalt](https://konverter-7qc.pages.dev/de/stundenlohn-jahresgehalt) | finance | shipped | 2026-04-25 | [dev](http://localhost:4322/de/stundenlohn-jahresgehalt) | — |
| [zinseszins-rechner](https://konverter-7qc.pages.dev/de/zinseszins-rechner) | finance | ship-as-is | 2026-04-25 | [dev](http://localhost:4322/de/zinseszins-rechner) | — |
| [brutto-netto-rechner](https://konverter-7qc.pages.dev/de/brutto-netto-rechner) | finance | shipped | 2026-04-24 | [dev](http://localhost:4322/de/brutto-netto-rechner) | — |
| [kreditrechner](https://konverter-7qc.pages.dev/de/kreditrechner) | finance | shipped | 2026-04-24 | [dev](http://localhost:4322/de/kreditrechner) | — |
| [rabatt-rechner](https://konverter-7qc.pages.dev/de/rabatt-rechner) | finance | shipped | 2026-04-24 | [dev](http://localhost:4322/de/rabatt-rechner) | — |
| [tilgungsplan-rechner](https://konverter-7qc.pages.dev/de/tilgungsplan-rechner) | finance | shipped | 2026-04-24 | [dev](http://localhost:4322/de/tilgungsplan-rechner) | — |
| [zinsrechner](https://konverter-7qc.pages.dev/de/zinsrechner) | finance | shipped | 2026-04-25 | [dev](http://localhost:4322/de/zinsrechner) | — |
| [quadratkilometer-zu-quadratmeile](https://konverter-7qc.pages.dev/de/quadratkilometer-zu-quadratmeile) | area | shipped | 2026-04-24 | [dev](http://localhost:4322/de/quadratkilometer-zu-quadratmeile) | — |
| [milliliter-zu-unzen](https://konverter-7qc.pages.dev/de/milliliter-zu-unzen) | volume | shipped | 2026-04-24 | [dev](http://localhost:4322/de/milliliter-zu-unzen) | — |
| [liter-zu-gallonen](https://konverter-7qc.pages.dev/de/liter-zu-gallonen) | volume | shipped | 2026-04-24 | [dev](http://localhost:4322/de/liter-zu-gallonen) | — |
| [hektar-zu-acre](https://konverter-7qc.pages.dev/de/hektar-zu-acre) | area | shipped | 2026-04-21 | [dev](http://localhost:4322/de/hektar-zu-acre) | — |
| [tonne-zu-pfund](https://konverter-7qc.pages.dev/de/tonne-zu-pfund) | weight | shipped | 2026-04-21 | [dev](http://localhost:4322/de/tonne-zu-pfund) | — |
| [stone-zu-kilogramm](https://konverter-7qc.pages.dev/de/stone-zu-kilogramm) | weight | shipped | 2026-04-21 | [dev](http://localhost:4322/de/stone-zu-kilogramm) | — |
| [pfund-zu-kilogramm](https://konverter-7qc.pages.dev/de/pfund-zu-kilogramm) | weight | shipped | 2026-04-21 | [dev](http://localhost:4322/de/pfund-zu-kilogramm) | — |
| [gramm-zu-unzen](https://konverter-7qc.pages.dev/de/gramm-zu-unzen) | weight | shipped | 2026-04-21 | [dev](http://localhost:4322/de/gramm-zu-unzen) | — |
| [seemeile-zu-kilometer](https://konverter-7qc.pages.dev/de/seemeile-zu-kilometer) | length | shipped | 2026-04-21 | [dev](http://localhost:4322/de/seemeile-zu-kilometer) | — |
| [fuss-zu-meter](https://konverter-7qc.pages.dev/de/fuss-zu-meter) | length | shipped | 2026-04-21 | [dev](http://localhost:4322/de/fuss-zu-meter) | — |
| [yard-zu-meter](https://konverter-7qc.pages.dev/de/yard-zu-meter) | length | shipped | 2026-04-21 | [dev](http://localhost:4322/de/yard-zu-meter) | — |
| [millimeter-zu-zoll](https://konverter-7qc.pages.dev/de/millimeter-zu-zoll) | length | shipped | 2026-04-21 | [dev](http://localhost:4322/de/millimeter-zu-zoll) | — |
| [bild-diff](https://konverter-7qc.pages.dev/de/bild-diff) | image | shipped | 2026-04-21 | [dev](http://localhost:4322/de/bild-diff) | — |
| [json-zu-csv](https://konverter-7qc.pages.dev/de/json-zu-csv) | dev | shipped | 2026-04-21 | [dev](http://localhost:4322/de/json-zu-csv) | — |
| [json-diff](https://konverter-7qc.pages.dev/de/json-diff) | dev | shipped | 2026-04-21 | [dev](http://localhost:4322/de/json-diff) | — |
| [kontrast-pruefer](https://konverter-7qc.pages.dev/de/kontrast-pruefer) | color | shipped | 2026-04-21 | [dev](http://localhost:4322/de/kontrast-pruefer) | — |
| [jwt-decoder](https://konverter-7qc.pages.dev/de/jwt-decoder) | dev | shipped | 2026-04-21 | [dev](http://localhost:4322/de/jwt-decoder) | — |
| [css-formatter](https://konverter-7qc.pages.dev/de/css-formatter) | dev | shipped | 2026-04-21 | [dev](http://localhost:4322/de/css-formatter) | — |
| [xml-formatter](https://konverter-7qc.pages.dev/de/xml-formatter) | dev | shipped | 2026-04-21 | [dev](http://localhost:4322/de/xml-formatter) | — |
| [sql-formatter](https://konverter-7qc.pages.dev/de/sql-formatter) | dev | shipped | 2026-04-21 | [dev](http://localhost:4322/de/sql-formatter) | — |
| [qr-code-generator](https://konverter-7qc.pages.dev/de/qr-code-generator) | image | shipped | 2026-04-21 | [dev](http://localhost:4322/de/qr-code-generator) | — |
| [hash-generator](https://konverter-7qc.pages.dev/de/hash-generator) | dev | shipped | 2026-04-21 | [dev](http://localhost:4322/de/hash-generator) | — |
| [lorem-ipsum-generator](https://konverter-7qc.pages.dev/de/lorem-ipsum-generator) | text | shipped | 2026-04-21 | [dev](http://localhost:4322/de/lorem-ipsum-generator) | — |
| [zeitzonen-rechner](https://konverter-7qc.pages.dev/de/zeitzonen-rechner) | time | shipped | 2026-04-21 | [dev](http://localhost:4322/de/zeitzonen-rechner) | — |
| [roemische-zahlen](https://konverter-7qc.pages.dev/de/roemische-zahlen) | text | shipped | 2026-04-21 | [dev](http://localhost:4322/de/roemische-zahlen) | — |
| [url-encoder-decoder](https://konverter-7qc.pages.dev/de/url-encoder-decoder) | dev | shipped | 2026-04-21 | [dev](http://localhost:4322/de/url-encoder-decoder) | — |
| [base64-encoder](https://konverter-7qc.pages.dev/de/base64-encoder) | dev | shipped | 2026-04-21 | [dev](http://localhost:4322/de/base64-encoder) | — |
| [zoll-zu-zentimeter](https://konverter-7qc.pages.dev/de/zoll-zu-zentimeter) | length | shipped | 2026-04-21 | [dev](http://localhost:4322/de/zoll-zu-zentimeter) | — |
| [zeichenzaehler](https://konverter-7qc.pages.dev/de/zeichenzaehler) | text | shipped | 2026-04-21 | [dev](http://localhost:4322/de/zeichenzaehler) | — |
| [uuid-generator](https://konverter-7qc.pages.dev/de/uuid-generator) | dev | shipped | 2026-04-21 | [dev](http://localhost:4322/de/uuid-generator) | — |
| [unix-timestamp](https://konverter-7qc.pages.dev/de/unix-timestamp) | time | shipped | 2026-04-21 | [dev](http://localhost:4322/de/unix-timestamp) | — |
| [text-diff](https://konverter-7qc.pages.dev/de/text-diff) | text | shipped | 2026-04-21 | [dev](http://localhost:4322/de/text-diff) | — |
| [regex-tester](https://konverter-7qc.pages.dev/de/regex-tester) | dev | shipped | 2026-04-21 | [dev](http://localhost:4322/de/regex-tester) | — |
| [passwort-generator](https://konverter-7qc.pages.dev/de/passwort-generator) | dev | ship-as-is | 2026-04-21 | [dev](http://localhost:4322/de/passwort-generator) | — |
| [json-formatter](https://konverter-7qc.pages.dev/de/json-formatter) | dev | shipped | 2026-04-21 | [dev](http://localhost:4322/de/json-formatter) | — |
| [hex-rgb-konverter](https://konverter-7qc.pages.dev/de/hex-rgb-konverter) | color | shipped | 2026-04-21 | [dev](http://localhost:4322/de/hex-rgb-konverter) | — |
| [hevc-zu-h264](https://konverter-7qc.pages.dev/de/hevc-zu-h264) | video | shipped | 2026-04-20 | [dev](http://localhost:4322/de/hevc-zu-h264) | — |
| [zentimeter-zu-zoll](https://konverter-7qc.pages.dev/de/zentimeter-zu-zoll) | length | shipped | 2026-04-19 | [dev](http://localhost:4322/de/zentimeter-zu-zoll) | — |
| [webp-konverter](https://konverter-7qc.pages.dev/de/webp-konverter) | image | shipped | 2026-04-19 | [dev](http://localhost:4322/de/webp-konverter) | — |
| [quadratmeter-zu-quadratfuss](https://konverter-7qc.pages.dev/de/quadratmeter-zu-quadratfuss) | area | shipped | 2026-04-19 | [dev](http://localhost:4322/de/quadratmeter-zu-quadratfuss) | — |
| [meter-zu-fuss](https://konverter-7qc.pages.dev/de/meter-zu-fuss) | length | shipped | 2026-04-19 | [dev](http://localhost:4322/de/meter-zu-fuss) | — |
| [kilometer-zu-meilen](https://konverter-7qc.pages.dev/de/kilometer-zu-meilen) | length | shipped | 2026-04-19 | [dev](http://localhost:4322/de/kilometer-zu-meilen) | — |
| [kilogramm-zu-pfund](https://konverter-7qc.pages.dev/de/kilogramm-zu-pfund) | weight | shipped | 2026-04-19 | [dev](http://localhost:4322/de/kilogramm-zu-pfund) | — |
| [hintergrund-entfernen](https://konverter-7qc.pages.dev/de/hintergrund-entfernen) | image | shipped | 2026-04-19 | [dev](http://localhost:4322/de/hintergrund-entfernen) | — |
| [celsius-zu-fahrenheit](https://konverter-7qc.pages.dev/de/celsius-zu-fahrenheit) | temperature | shipped | 2026-04-19 | [dev](http://localhost:4322/de/celsius-zu-fahrenheit) | — |
| [mehrwertsteuer-rechner](https://konverter-7qc.pages.dev/de/mehrwertsteuer-rechner) | finance | shipped | 2026-04-24 | [dev](http://localhost:4322/de/mehrwertsteuer-rechner) | — |

## Duplikat-Guard

Vor dem Append: `grep -q "| \[${slug}\](" docs/completed-tools.md && return 0`.
Ein Slug darf nur einmal in der Liste stehen. Bei Re-Deploy (Rework → Ship):
Bestehende Zeile NICHT duplizieren — optional `state`-Feld via `sed`
aktualisieren.

## Backlog-Cross-Reference

Nach jedem Append: Slug zu `already_built_skip_list` in
`tasks/backlog/differenzierung-queue.md` Frontmatter hinzufügen, damit
Auto-Refill den Slug nicht erneut dispatcht. Ohne dieses Gate riskierst
du Endlos-Redispatch.

## Manuelle Sync-Events

Log von manuellen Reparaturen dieser Datei (durch User oder Claude):

- **2026-04-21:** CEO §7.5 awk-Pattern ohne Anchor matchte literalen Marker
  im Body-Text → Doppel-Append pro Deploy. Datei rewritten, 8 Duplikate
  entfernt, format_version → 2, AGENTS.md §7.5 fix anchored-regex.
