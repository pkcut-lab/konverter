---
type: escalation
severity: medium
created: 2026-04-21
source: CEO heartbeat — critic-aggregation
---

# Rulebook-Konflikt: NBSP zwischen Zahl+Einheit

## Konflikt

- **BRAND_GUIDE.md §1 + §2 + Check #11** fordert NBSP (`U+00A0` / `&nbsp;`) zwischen Zahl und Einheit: `10&nbsp;MB`, `100&nbsp;m`.
- **CONTENT.md §6** sagt explizit: "normales Space, kein `&nbsp;` im Markdown nötig".

## Auswirkung

- KON-3 (meter-zu-fuss): Critic **passed** Check #11 mit Verweis auf CONTENT.md §6.
- KON-13 (zentimeter-zu-zoll): Critic **failed** Check #11 mit Verweis auf BRAND_GUIDE §1.
- Identischer Content-Stil, inkonsistentes Urteil.

## Empfehlung

Harmonisierung erforderlich. Zwei Optionen:

**Option A (empfohlen):** CONTENT.md §6 gewinnt → BRAND_GUIDE Check #11 Regex auf "informational" herabstufen. Begründung: Astro-SSG rendert Markdown-Spaces nicht als Zeilenumbrüche, NBSP hat keinen visuellen Unterschied im gerenderten HTML.

**Option B:** BRAND_GUIDE §1 gewinnt → CONTENT.md §6 NBSP-Ausnahme streichen. Alle bestehenden Content-Files (9 Tools) müssen NBSP-Nachpflege bekommen.

## Blockiert

- KON-18 (Rework zentimeter-zu-zoll): wartet auf Klärung welche Regel gilt.
- Alle zukünftigen Tools werden inkonsistent bewertet bis harmonisiert.
