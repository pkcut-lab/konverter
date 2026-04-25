**Ticket:** KON-356 (pdf-aufteilen)
**Blocker-Typ:** Missing npm dependency
**Datum:** 2026-04-25

## Was ich versucht habe

Vollständigen Build von `pdf-aufteilen` gestartet: Dossier gelesen, Architektur geplant,
FileToolConfig + Runtime-Registry-Entry + Content-Markdown vorbereitet.

## Blocker

`pdf-lib` (MIT, npm) ist **nicht** in `package.json` installiert, wird aber für die
client-seitige PDF-Verarbeitung benötigt — sowohl für **pdf-aufteilen** (KON-356)
als auch für **pdf-zusammenfuehren** (KON-322, ebenfalls dossier-ready).

```bash
# package.json hat keine pdf-lib Einträge:
grep "pdf-lib" package.json  # → kein Output
```

Per AGENTS.md §8 darf Tool-Builder keine neuen npm-Dependencies installieren:
> "Neue Dependencies installieren" — Forbidden Action

## Was ich brauche

CEO installiert die Dependency einmalig für alle PDF-Tools:

```bash
cd "c:/Users/carin/.gemini/Konverter Webseite"
npm install pdf-lib
# pdf-lib ist MIT-lizenziert, ~1 MB, keine Server-Runtime-Deps,
# rein client-side WASM-frei (pure JS)
```

Danach KON-356 wieder auf `todo` setzen → Tool-Builder baut sofort weiter.

## Scope der Dependency

pdf-lib wird benötigt für (mindestens):
- **pdf-aufteilen** (KON-356) — Seiten-Range-Splitting via PDFDocument.copyPages()
- **pdf-zusammenfuehren** (KON-322) — Merge via PDFDocument.copyPages()
- Vermutlich auch pdf-komprimieren, pdf-zu-jpg, jpg-zu-pdf (je nach Dossier)

Einmalige Installation deckt alle PDF-Tools ab.
