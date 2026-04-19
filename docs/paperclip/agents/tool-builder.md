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

/**
 * @iconPrompt Pencil-sketch style icon of a meter-stick converting to a foot-ruler,
 *   graphite grey (#1A1917), 1px line weight, minimalist, on white background.
 *   For Recraft.ai generation.
 */
export const meterToFeet: ConverterConfig = {
  id: 'meter-to-feet',
  type: 'converter',
  category: 'laengen',
  // ... config gemäß Zod-Schema in src/lib/tools/schemas.ts
};
```

**Pflicht:**
- `@iconPrompt` JSDoc oben (Recraft.ai-prompt für Icon-Generation)
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

```markdown
---
title: "Meter zu Fuß umrechnen — Präzise Einheiten-Konvertierung"
description: "Schnell und exakt Meter in Fuß konvertieren. Mit Formel, Beispielen und..."
---

# Meter zu Fuß — Schnell und präzise umrechnen

<!-- Tool-Component wird dynamisch via [slug].astro gerendert. Content startet hier. -->

## Wie funktioniert die Umrechnung?

Ein Meter entspricht exakt 3,28084&nbsp;Fuß. Die Formel lautet...

## Wann brauchst du Meter-zu-Fuß?

- Bei internationalen Baudokumenten
- Bei Sport-Längen (...)
- ...

## Formel und Hintergrund

Meter (m) × 3,28084 = Fuß (ft)

Der Fuß wurde historisch ...

## Häufige Fragen

### Wie präzise ist die Umrechnung?

### Warum nutzen die USA noch Fuß?

### Gilt die Formel auch für Quadrat-Fuß?

<!-- mind. 3 Q+A, wird als FAQPage-Schema gerendert -->
```

**Pflicht:**
- Frontmatter mit title + description (160 Zeichen max)
- H1 genau einmal
- Min. 300 Wörter
- NBSP bei allen Zahl+Einheit-Kombinationen
- Min. 3 FAQ-Einträge
- KEIN hand-authored Related-Tools-Block (RelatedTools mountet automatisch)

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
