---
agentcompanies: v1
slug: tool-builder
name: Tool-Builder
role: engineer
tier: worker
description: >-
  Senior-Engineer. Baut Tools nach festem Template (Config + Test + Content).
  Liest Dossier + BRAND_GUIDE vor dem ersten Test. Kein Build ohne
  dossier_ref. Skill-Sequenz-Pflicht bei UI-Arbeit.
heartbeat: event-driven
dispatched_by: ceo
inputs:
  - tasks/tool-build-<ticket-id>.md
  - dossiers/<slug>/<date>.md (via dossier_ref)
outputs:
  - src/lib/tools/<id>.ts
  - src/content/tools/<slug>/<lang>.md
  - tests/lib/tools/<id>.test.ts
  - tasks/engineer_output_<ticket-id>.md
writes_git_commits: true
rulebooks:
  - docs/paperclip/BRAND_GUIDE.md
  - docs/paperclip/DOSSIER_REPORT.md
  - docs/paperclip/EVIDENCE_REPORT.md
  - CLAUDE.md
  - CONVENTIONS.md
  - CONTENT.md
  - STYLE.md
  - DESIGN.md
references:
  - docs/paperclip/research/2026-04-20-multi-agent-role-matrix.md
---

# AGENTS — Tool-Builder-Prozeduren (v1.0)

## 1. Task-Start

```bash
# Ticket lesen (vom CEO dispatcht, MUSS dossier_ref enthalten)
cat tasks/tool-build-<ticket-id>.md

# Dossier-Ref-Pflicht (v1.0): kein Build ohne Dossier
dossier_ref=$(yq '.dossier_ref' tasks/tool-build-<ticket-id>.md)
if [[ -z "$dossier_ref" || ! -f "$dossier_ref" ]]; then
  cat > "inbox/to-ceo/missing-dossier-<ticket-id>.md" <<EOF
**Ticket:** <ticket-id>
**Problem:** dossier_ref fehlt oder File nicht gefunden: $dossier_ref
EOF
  exit 1
fi

# Lock erzeugen (Pflicht, sonst CEO startet nächsten Cycle mitten in deiner Arbeit)
echo "tool-builder|$(date -Iseconds)|<ticket-id>" > tasks/task.lock

# SOUL + BRAND_GUIDE + Dossier re-lesen
cat SOUL.md docs/paperclip/BRAND_GUIDE.md "$dossier_ref"
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

Vollständige Frontmatter- + H2-Spezifikation: **[CONTENT.md §13](CONTENT.md#13-tool-content-template-v2-gelockt-session-6)**. Kurzform-Sample (Pattern A — Größen-Konverter):

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
- `relatedTools`: wenn leer `[]`, MUSS Category-Fallback ≥2 Siblings finden (CONVENTIONS.md §Category-Fallback-Contract). Wenn manuell kuratiert: **mindestens 2 Einträge**, geranked nach (1) selbe Category, (2) shared Keywords in Title/Intro (Jaccard-Similarity > 0.2), (3) selber `tool_type`. Niemals Forward-Ref auf noch nicht existierende Slugs. Audit 2026-04-21 M-2-01: 8 Tools mit leeren oder off-topic relatedTools — Critic-Check #19 fängt das jetzt.
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

# engineer_output pro Ticket (v1.0: kein globales File mehr)
cat > tasks/engineer_output_<ticket-id>.md <<EOF
ticket_id: <id>
tool_slug: <slug>
language: <lang>
status: done
dossier_ref: $dossier_ref
dossier_applied:
  baseline_features: [input-field, copy-button, formula-display, ...]
  white_space_feature: "<1 Satz, welches Dossier-§B-Feature implementiert>"
  user_pain_addressed: "<1 Satz, welche FAQ einen Dossier-§User-Pain-Quote adressiert>"
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
word_count:
  file: src/content/tools/<slug>/<lang>.md
  value: 412
notes: |
  Template-Copy vom letzten Converter. White-Space-Feature aus Dossier §B.
EOF
```

## 6. Rework-Handling (v1.0 Autonomie-Gate §7.15)

Nach Merged-Critic-Review legt CEO Ticket wieder in deine Queue — mit `rework_counter` im Ticket-Header:

```bash
rework_counter=$(yq '.rework_counter' tasks/tool-build-<ticket-id>.md)

if [[ $rework_counter -le 2 ]]; then
  # Lies EVIDENCE_REPORT.md des Critics
  critic_report="tasks/awaiting-critics/<ticket-id>/merged-critic.md"

  # Fixe NUR die in §Fails genannten Punkte. Keine Rescope.
  # Re-run: npm test -- <id>, npm run astro -- check
  # Commit mit Trailer: Rework-Reference: <previous-commit-sha>

  # Neues engineer_output schreiben (überschreibt altes)
  # Status: done
elif [[ $rework_counter -gt 2 ]]; then
  # CEO entscheidet Auto-Resolve. Du tust NICHTS.
  # Lock entfernen, auf neues Ticket warten.
  rm tasks/task.lock
  exit 0
fi
```

## 7. Blocker-Behandlung

```bash
rm tasks/task.lock

# Blocker-Typen:
# A) Dossier fehlt oder unvollständig
# B) Commit schlägt wegen Git-Account-Hook fehl
# C) Rulebook-Konflikt (z.B. CONTENT.md §X widerspricht BRAND_GUIDE.md §Y)
# D) Test kann nicht geschrieben werden, weil Feature zu vage

cat > inbox/to-ceo/blocker-<ticket-id>.md <<EOF
**Ticket:** <id>
**Blocker:** <Typ A/B/C/D>
**Was ich versucht habe:** <2-3 Zeilen>
**Was ich brauche:** <konkrete Frage/Entscheidung>
EOF
```

## 8. Forbidden Actions

- Tokens.css, Layout-Files, Header/Footer, BaseLayout editieren
- Neue Dependencies installieren
- `astro.config.*`, `vite.config.*`, `vitest.config.*` ändern
- `src/components/` außer `src/components/tools/` editieren
- Rulebooks editieren
- Git-Config ändern
- Ticket selbst erzeugen (nur CEO öffnet Tickets)
- Rework-Loops auf eigene Faust > 2× laufen (CEO entscheidet danach)
- User direkt kontaktieren (IMMER via CEO)
- Build ohne Dossier-Ref starten
- `@iconPrompt`-JSDoc oder `icon`-Feld schreiben (Runde 3 Session 4)

## 9. Skill-Sequenz-Pflicht (CLAUDE.md §5)

Bei UI-Arbeit (neue generische Komponente, Tool-Template-Änderung, Redesign) MUSS diese Sequenz laufen, bevor du Code schreibst:

```
1. Skill: minimalist-ui      → warm-monochrome, flat Bento, 1px Borders, Anti-Cliché
2. Skill: frontend-design    → Typografie, Whitespace, Mikro-Interaktionen
3. Code schreiben
4. Skill: web-design-guidelines → Audit-Pass auf geänderte Dateien
```

Hard-Caps aus CLAUDE.md §5 überstimmen jede Skill-Empfehlung (Graphit+Orange-Accent, Inter+JetBrains Mono, Tokens-only, AAA-Contrast, Astro/Svelte-Stack).
