---
title: Completed Tools — Live-Liste
maintained_by: CEO-Agent (auto-append via §7 route_to_deploy_queue + §2.5 Post-Dispatch)
format_version: 1
seed_date: 2026-04-21
---

# Completed Tools — Live-Liste

Automatisch gepflegte Liste aller ausgelieferten Konverter-Tools. CEO hängt
nach jedem erfolgreichen Deploy-Routing (Autonomie-Gate §7 oder ship-as-is)
eine neue Zeile unten an.

- **Local-Dev-URL:** `http://localhost:4322/de/<slug>` (Astro dev)
- **Production-URL:** `https://konverter-7qc.pages.dev/de/<slug>` (CF Pages)
- **Shipped-Date:** erster Commit der `src/content/tools/<slug>/de.md`-Datei
- **Status:** `shipped` (auf main + gebuildet) · `ship-as-is` (Auto-Resolve >2 Reworks, Score ≥0.80) · `in-review` (dispatched, noch nicht gemerged)

## Auto-Append-Snippet (für CEO §7)

```bash
# nach route_to_deploy_queue(ticket), ship-as-is oder regular:
slug="<tool-slug>"
category="<category>"
state="shipped"   # oder "ship-as-is"
today="$(date -I)"
prod="https://konverter-7qc.pages.dev/de/${slug}"
local="http://localhost:4322/de/${slug}"
entry="| [${slug}](${prod}) | ${category} | ${state} | ${today} | [dev](${local}) |"
# Append unter "<!-- CEO-APPEND -->" Marker:
awk -v e="$entry" '/<!-- CEO-APPEND -->/{print;print e;next}1' \
  docs/completed-tools.md > docs/completed-tools.md.tmp && \
  mv docs/completed-tools.md.tmp docs/completed-tools.md
```

## Tool-Liste

| Slug | Category | Status | Shipped | Local |
|---|---|---|---|---|
<!-- CEO-APPEND -->
| [celsius-zu-fahrenheit](https://konverter-7qc.pages.dev/de/celsius-zu-fahrenheit) | temperature | shipped | 2026-04-19 | [dev](http://localhost:4322/de/celsius-zu-fahrenheit) |
| [hintergrund-entfernen](https://konverter-7qc.pages.dev/de/hintergrund-entfernen) | image | shipped | 2026-04-19 | [dev](http://localhost:4322/de/hintergrund-entfernen) |
| [kilogramm-zu-pfund](https://konverter-7qc.pages.dev/de/kilogramm-zu-pfund) | weight | shipped | 2026-04-19 | [dev](http://localhost:4322/de/kilogramm-zu-pfund) |
| [kilometer-zu-meilen](https://konverter-7qc.pages.dev/de/kilometer-zu-meilen) | length | shipped | 2026-04-19 | [dev](http://localhost:4322/de/kilometer-zu-meilen) |
| [meter-zu-fuss](https://konverter-7qc.pages.dev/de/meter-zu-fuss) | length | shipped | 2026-04-19 | [dev](http://localhost:4322/de/meter-zu-fuss) |
| [quadratmeter-zu-quadratfuss](https://konverter-7qc.pages.dev/de/quadratmeter-zu-quadratfuss) | area | shipped | 2026-04-19 | [dev](http://localhost:4322/de/quadratmeter-zu-quadratfuss) |
| [webp-konverter](https://konverter-7qc.pages.dev/de/webp-konverter) | image | shipped | 2026-04-19 | [dev](http://localhost:4322/de/webp-konverter) |
| [zentimeter-zu-zoll](https://konverter-7qc.pages.dev/de/zentimeter-zu-zoll) | length | shipped | 2026-04-19 | [dev](http://localhost:4322/de/zentimeter-zu-zoll) |
| [hevc-zu-h264](https://konverter-7qc.pages.dev/de/hevc-zu-h264) | video | shipped | 2026-04-20 | [dev](http://localhost:4322/de/hevc-zu-h264) |
| [zoll-zu-zentimeter](https://konverter-7qc.pages.dev/de/zoll-zu-zentimeter) | length | shipped | 2026-04-21 | [dev](http://localhost:4322/de/zoll-zu-zentimeter) |

## Duplikat-Guard

Vor dem Append: `grep -q "| \[${slug}\](" docs/completed-tools.md && exit 0`.
Ein Slug darf nur einmal in der Liste stehen. Bei Re-Deploy (Rework → Ship):
Bestehende Zeile NICHT duplizieren — optional `state`-Feld via `sed`
aktualisieren.

## Backlog-Cross-Reference

Nach jedem Append: Slug zu `already_built_skip_list` in
`tasks/backlog/differenzierung-queue.md` Frontmatter hinzufügen, damit
Auto-Refill den Slug nicht erneut dispatcht. Ohne dieses Gate riskierst
du Endlos-Redispatch.
