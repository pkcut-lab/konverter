# AGENTS — Tool-Builder-Prozeduren

## 1. Task-Start

```bash
# Ticket lesen
cat tasks/current_task.md

# Lock erzeugen (Pflicht, sonst CEO startet nächsten Cycle mitten in deiner Arbeit)
echo "tool-builder|$(date -Iseconds)|<ticket-id>" > tasks/task.lock

# SOUL + BRAND_GUIDE re-lesen (du darfst vergessen zwischen Heartbeats)
cat souls/tool-builder.md BRAND_GUIDE.md
```

## 2. Build-Sequenz

### Schritt A — Config-File

`src/lib/tools/{tool-id}.ts`:

```typescript
import type { ConverterConfig } from './types';
import { ok, err } from './types';

export const meterToFeet: ConverterConfig = {
  id: 'meter-to-feet',
  type: 'converter',
  category: 'length',      // 14-Enum, authoritative in CONVENTIONS.md §Category-Taxonomie
  // ... config gemäß Zod-Schema in src/lib/tools/schemas.ts
};
```

**Pflicht:**
- KEIN `@iconPrompt` JSDoc, KEIN `icon`-Feld (Runde 3 Session 4 — Tool-Karten tragen keine Icons mehr)
- `category` aus 14-Enum (CONVENTIONS.md §Category-Taxonomie) — Zod refined, Build bricht bei ungültigem Wert
- Config wird NICHT default-exported (CONVENTIONS.md)
- Zod-validiert via `parseToolConfig()` in Test

### Schritt B — Test-File (TDD: zuerst)

`tests/lib/tools/{tool-id}.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { parseToolConfig } from '../../../src/lib/tools/schemas';
import { meterToFeet } from '../../../src/lib/tools/meter-to-feet';

describe('meter-to-feet config', () => {
  it('parses as valid ConverterConfig', () => {
    const r = parseToolConfig(meterToFeet);
    expect(r.ok).toBe(true);
  });
  
  it('rejects invalid modification', () => {
    const broken = { ...meterToFeet, category: '' };
    const r = parseToolConfig(broken);
    expect(r.ok).toBe(false);
  });
  
  // Tool-Typ-spezifische Tests (z.B. Konversion 1m = 3.28084 ft)
});
```

### Schritt C — Content-File

`src/content/tools/{slug}/{lang}.md`:

Vollständige Frontmatter- + H2-Spezifikation: **[CONTENT.md §13](../../../CONTENT.md#13-tool-content-template-v2-gelockt-session-6)**. Kurzform-Sample (Pattern A — Größen-Konverter):

```markdown
---
toolId: "meter-to-feet"
language: "de"
title: "Meter in Fuß umrechnen — Präzise Längen-Konvertierung"
metaDescription: "Meter zu Fuß exakt umrechnen. Formel 1 m = 3,28084 ft, Beispiele, FAQ. Kostenlos, client-seitig, ohne Tracking."
tagline: "Schnell und präzise von Meter zu Fuß"
intro: "Rechne Meter in Fuß um — mit der exakten Formel 1 m = 3,28084 ft. Ideal für Baudokumente, Sport-Längen und internationale Datenblätter."
category: "length"
contentVersion: 1
headingHtml: "Meter in <em>Fuß</em> umrechnen"
howToUse:
  - "Gib den Meter-Wert in das Eingabefeld ein."
  - "Das Ergebnis in Fuß erscheint sofort — kein Klick nötig."
  - "Kopiere das Ergebnis über den Copy-Button."
faq:
  - q: "Wie präzise ist die Umrechnung?"
    a: "Exakt 3,28084 Fuß pro Meter (7 Nachkomma-Stellen)."
  - q: "Warum nutzen die USA noch Fuß?"
    a: "Historisch gewachsen — das US-customary-System basiert auf britischen Imperial-Einheiten."
  - q: "Gilt die Formel auch für Quadrat-Fuß?"
    a: "Nein — Flächen quadrieren: 1 m² = 10,7639 ft²."
  - q: "Wie exakt ist 3,28084?"
    a: "Per Definition ist 1 Fuß = 0,3048 m (seit 1959) — Kehrwert liefert 3,2808398..."
relatedTools: []   # [] ist OK — Category-Fallback füllt aus length-Siblings
---

## Was macht dieser Konverter?

Ein Meter entspricht exakt 3,28084&nbsp;Fuß. …

## Umrechnungsformel

Meter (m) × 3,28084 = Fuß (ft). …

## Anwendungsbeispiele

- 10&nbsp;m = 32,8084&nbsp;ft
- 100&nbsp;m = 328,084&nbsp;ft
- …

## Häufige Einsatzgebiete

- Internationale Baudokumente
- Sport-Längen (Leichtathletik, Schwimmen)
- …

## Häufige Fragen

(FAQ wird aus Frontmatter als FAQPage-Schema gerendert.)

## Verwandte Längen-Tools

Weitere Tools aus dem Konverter-Ökosystem, die zum Thema passen:

- **[Kilometer zu Meilen](/de/kilometer-zu-meilen)** — Längere Distanzen zwischen metrisch und imperial umrechnen.
- **[Zentimeter zu Zoll](/de/zentimeter-zu-zoll)** — Kleinere Längen für Datenblätter und Handwerk konvertieren.
- **[Quadratmeter zu Quadratfuß](/de/quadratmeter-zu-quadratfuss)** — Flächen statt Längen zwischen SI und imperial umwandeln.
```

**Pflicht (Kurzliste — volle Regeln in CONTENT.md §13):**
- Frontmatter **15 Felder** gemäß §13.1 (9 Pflicht + 6 optional). `category` PFLICHT aus 14-Enum.
- `headingHtml` (optional): max 1 `<em>…</em>`, kein anderes HTML. `<em>` umschließt **Ziel-Substantiv** der Umwandlung, nicht Verb/Prozess (§13.5 Regel 2).
- KEIN `icon`-Feld (§13.5 Regel 5 — keine Tool-Icons)
- H2-Pattern A/B/C nach Tool-Typ (§13.2) — Pattern-A-Converter haben 6 fixe H2s in exakter Reihenfolge.
- **Letzte H2 immer** `## Verwandte <Kat>-Tools` + wortgleiche Intro-Zeile + exakt 3 Bullets (§13.4). `<Kat>` aus Mapping §13.3 (`length → Längen`).
- 4–6 FAQ-Einträge in Frontmatter (werden als FAQPage-JSON-LD gerendert).
- NBSP zwischen ALLEN Zahl-Einheit-Paaren.
- `relatedTools: []` ist OK — Category-Fallback trägt (CONVENTIONS.md §Category-Fallback-Contract). Kuration nur bei redaktionellem Wunsch, niemals Forward-Ref auf noch nicht existierende Slugs.
- Mindestens 300 Wörter Prose (thin-Content-Guard).

## 3. Test-Gate lokal

```bash
# Vor engineer_output.md:
npm test -- <tool-id>           # muss exit 0
npm run astro -- check          # muss 0/0/0
wc -w src/content/tools/<slug>/<lang>.md   # muss ≥ 300
```

## 4. Commit

```bash
git add src/lib/tools/<id>.ts \
        src/content/tools/<slug>/<lang>.md \
        tests/lib/tools/<id>.test.ts

git commit -m "$(cat <<'EOF'
feat(tools): add <tool-name> <tool-type>

Rulebooks-Read: PROJECT, CONVENTIONS, STYLE, CONTENT
EOF
)"
```

**Niemals:**
- `--no-verify` (Git-Account-Hook muss laufen)
- `git push` (CEO macht Ready-to-Ship-Ticket, User approved Deploy)
- Amend von bereits gepushten Commits
- `git config user.name` ändern

## 5. Task-End

```bash
rm tasks/task.lock

# engineer_output.md schreiben
cat > tasks/engineer_output.md <<EOF
ticket_id: <id>
status: done
files_changed:
  - path: src/lib/tools/<id>.ts
    action: created
    lines: +82 -0
  - path: src/content/tools/<slug>/<lang>.md
    action: created
    lines: +340 -0
  - path: tests/lib/tools/<id>.test.ts
    action: created
    lines: +45 -0
tests:
  ran: npm test -- <id>
  result: pass
  output: |
    Test Files  1 passed (1)
    Tests  6 passed (6)
astro_check:
  ran: npm run astro -- check
  result: pass
notes: |
  Nichts Besonderes. Template-Copy vom letzten Converter.
EOF
```

## 6. Blocker-Behandlung

```bash
# Wenn du nicht weiterkommst
rm tasks/task.lock

cat > inbox/from-agents/clarify-<ticket-id>.md <<EOF
**Ticket:** <id>
**Blocker:** <1-Satz>
**Was ich versucht habe:** <2-3 Zeilen>
**Was ich brauche:** <konkrete Frage/Entscheidung>
EOF

# Ticket-Status auf blocked setzen
# (via Paperclip-CLI oder Dashboard-API)
```

## 7. Forbidden Actions

- Tokens.css, Layout-Files, Header/Footer, BaseLayout editieren
- Neue Dependencies installieren
- `astro.config.*`, `vite.config.*`, `vitest.config.*` ändern
- `src/components/` außer `src/components/tools/` editieren
- Rulebooks editieren
- Git-Config ändern
- Ticket selbst erzeugen (nur CEO öffnet Tickets)
- Rework-Loops auf eigene Faust >2× laufen
- User direkt kontaktieren (IMMER via CEO)
