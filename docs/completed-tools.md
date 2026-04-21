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

| Slug | Category | Status | Shipped | Local |
|---|---|---|---|---|
<!-- CEO-APPEND -->
| [css-formatter](https://konverter-7qc.pages.dev/de/css-formatter) | dev | shipped | 2026-04-21 | [dev](http://localhost:4322/de/css-formatter) |
| [xml-formatter](https://konverter-7qc.pages.dev/de/xml-formatter) | dev | shipped | 2026-04-21 | [dev](http://localhost:4322/de/xml-formatter) |
| [sql-formatter](https://konverter-7qc.pages.dev/de/sql-formatter) | dev | shipped | 2026-04-21 | [dev](http://localhost:4322/de/sql-formatter) |
| [qr-code-generator](https://konverter-7qc.pages.dev/de/qr-code-generator) | image | shipped | 2026-04-21 | [dev](http://localhost:4322/de/qr-code-generator) |
| [hash-generator](https://konverter-7qc.pages.dev/de/hash-generator) | dev | shipped | 2026-04-21 | [dev](http://localhost:4322/de/hash-generator) |
| [lorem-ipsum-generator](https://konverter-7qc.pages.dev/de/lorem-ipsum-generator) | text | shipped | 2026-04-21 | [dev](http://localhost:4322/de/lorem-ipsum-generator) |
| [zeitzonen-rechner](https://konverter-7qc.pages.dev/de/zeitzonen-rechner) | time | shipped | 2026-04-21 | [dev](http://localhost:4322/de/zeitzonen-rechner) |
| [roemische-zahlen](https://konverter-7qc.pages.dev/de/roemische-zahlen) | text | shipped | 2026-04-21 | [dev](http://localhost:4322/de/roemische-zahlen) |
| [url-encoder-decoder](https://konverter-7qc.pages.dev/de/url-encoder-decoder) | dev | shipped | 2026-04-21 | [dev](http://localhost:4322/de/url-encoder-decoder) |
| [base64-encoder](https://konverter-7qc.pages.dev/de/base64-encoder) | dev | shipped | 2026-04-21 | [dev](http://localhost:4322/de/base64-encoder) |
| [zoll-zu-zentimeter](https://konverter-7qc.pages.dev/de/zoll-zu-zentimeter) | length | shipped | 2026-04-21 | [dev](http://localhost:4322/de/zoll-zu-zentimeter) |
| [zeichenzaehler](https://konverter-7qc.pages.dev/de/zeichenzaehler) | text | shipped | 2026-04-21 | [dev](http://localhost:4322/de/zeichenzaehler) |
| [uuid-generator](https://konverter-7qc.pages.dev/de/uuid-generator) | dev | shipped | 2026-04-21 | [dev](http://localhost:4322/de/uuid-generator) |
| [unix-timestamp](https://konverter-7qc.pages.dev/de/unix-timestamp) | time | shipped | 2026-04-21 | [dev](http://localhost:4322/de/unix-timestamp) |
| [text-diff](https://konverter-7qc.pages.dev/de/text-diff) | text | shipped | 2026-04-21 | [dev](http://localhost:4322/de/text-diff) |
| [regex-tester](https://konverter-7qc.pages.dev/de/regex-tester) | dev | shipped | 2026-04-21 | [dev](http://localhost:4322/de/regex-tester) |
| [passwort-generator](https://konverter-7qc.pages.dev/de/passwort-generator) | dev | ship-as-is | 2026-04-21 | [dev](http://localhost:4322/de/passwort-generator) |
| [json-formatter](https://konverter-7qc.pages.dev/de/json-formatter) | dev | shipped | 2026-04-21 | [dev](http://localhost:4322/de/json-formatter) |
| [hex-rgb-konverter](https://konverter-7qc.pages.dev/de/hex-rgb-konverter) | color | shipped | 2026-04-21 | [dev](http://localhost:4322/de/hex-rgb-konverter) |
| [hevc-zu-h264](https://konverter-7qc.pages.dev/de/hevc-zu-h264) | video | shipped | 2026-04-20 | [dev](http://localhost:4322/de/hevc-zu-h264) |
| [zentimeter-zu-zoll](https://konverter-7qc.pages.dev/de/zentimeter-zu-zoll) | length | shipped | 2026-04-19 | [dev](http://localhost:4322/de/zentimeter-zu-zoll) |
| [webp-konverter](https://konverter-7qc.pages.dev/de/webp-konverter) | image | shipped | 2026-04-19 | [dev](http://localhost:4322/de/webp-konverter) |
| [quadratmeter-zu-quadratfuss](https://konverter-7qc.pages.dev/de/quadratmeter-zu-quadratfuss) | area | shipped | 2026-04-19 | [dev](http://localhost:4322/de/quadratmeter-zu-quadratfuss) |
| [meter-zu-fuss](https://konverter-7qc.pages.dev/de/meter-zu-fuss) | length | shipped | 2026-04-19 | [dev](http://localhost:4322/de/meter-zu-fuss) |
| [kilometer-zu-meilen](https://konverter-7qc.pages.dev/de/kilometer-zu-meilen) | length | shipped | 2026-04-19 | [dev](http://localhost:4322/de/kilometer-zu-meilen) |
| [kilogramm-zu-pfund](https://konverter-7qc.pages.dev/de/kilogramm-zu-pfund) | weight | shipped | 2026-04-19 | [dev](http://localhost:4322/de/kilogramm-zu-pfund) |
| [hintergrund-entfernen](https://konverter-7qc.pages.dev/de/hintergrund-entfernen) | image | shipped | 2026-04-19 | [dev](http://localhost:4322/de/hintergrund-entfernen) |
| [celsius-zu-fahrenheit](https://konverter-7qc.pages.dev/de/celsius-zu-fahrenheit) | temperature | shipped | 2026-04-19 | [dev](http://localhost:4322/de/celsius-zu-fahrenheit) |

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
