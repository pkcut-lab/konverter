---
title: Claude-Verifikations-Checkliste — 9-unfertige-Tools-Report
created: 2026-04-25
purpose: Wenn der User den Agent-Report zurückgibt, arbeitet Claude diese Checkliste ab um die Arbeit objektiv zu prüfen
target_input: docs/agent-handoff/2026-04-25-finish-incomplete-tools-REPORT.md
---

# Verifikations-Checkliste

Wenn der User den Agent-Report zurückgibt, arbeitet Claude diese Liste in Reihenfolge ab. Niemals ohne diese Verifikation einen Tool-Status auf der completed-tools.md akzeptieren.

## Phase 1 — Report-Struktur

- [ ] Report existiert unter `docs/agent-handoff/2026-04-25-finish-incomplete-tools-REPORT.md`
- [ ] Frontmatter vollständig (`tools_attempted`, `tools_shipped`, `tools_parked`)
- [ ] Pro Tool: Status + Commit-SHA + Test-Bilanz + Phasen-Bilanz + Quality-Bar + CEO-Decisions
- [ ] Kumulierte Metriken vorhanden
- [ ] Verifikations-Sektion mit reproduzierbaren Commands

## Phase 2 — Git-Hygiene

```bash
# Erwartung: jedes shipped tool hat genau 1 Commit
git log --oneline 9c3e1e6..HEAD --grep="feat(tools" | wc -l
# Wert sollte = report.tools_shipped

# Pro Commit-Body Phase A–F dokumentiert?
for sha in $(git log --pretty=format:%h 9c3e1e6..HEAD --grep="feat(tools"); do
  git log -1 --format="%h %s" $sha
  git log -1 --format="%b" $sha | grep -E "Phase A|Phase B|Phase E.*3-Pass|Co-Authored-By"
done
# Erwartung: jeder Commit zitiert mindestens Phase A, B, E (3-Pass), und hat Co-Authored-By Trailer
```

- [ ] Commit-Count matches report
- [ ] Jeder Commit hat Phase-A–F-Body
- [ ] Co-Authored-By Trailer vorhanden
- [ ] Git-Account `pkcut-lab` durchgängig (kein DennisJedlicka)

## Phase 3 — Build + Tests

```bash
# Production Build — KEIN dev
npx astro build 2>&1 | tail -10

# Test-Suite vollständig
npx vitest run --reporter=basic 2>&1 | tail -5

# Astro check (TS-Strict) — Delta vs. baseline
npx astro check 2>&1 | tail -3
```

- [ ] Astro build grün, neue Pages für jedes shipped Tool unter `dist/de/<slug>/`
- [ ] Vitest-Pass-Rate ≥ Pre-Session-Baseline (1415 von 1420 vor Handoff-Start)
- [ ] Astro-check TS-Fehler-Delta ≤ 0 (Agent darf keine NEUEN TS-Fehler einführen)

## Phase 4 — Quality-Bar pro Tool (stichprobenartig)

Für jedes shipped Tool:

```bash
SLUG=<slug>
# Frontmatter-Schema
py -c "
import yaml, re
c = open(f'src/content/tools/{$SLUG}/de.md').read()
m = re.match(r'^---\n(.*?)\n---', c, re.DOTALL)
d = yaml.safe_load(m.group(1))
assert 30 <= len(d['title']) <= 60, f'title={len(d[\"title\"])}'
assert 140 <= len(d['metaDescription']) <= 160, f'meta={len(d[\"metaDescription\"])}'
assert 3 <= len(d['howToUse']) <= 5, f'howToUse={len(d[\"howToUse\"])}'
assert 4 <= len(d['faq']) <= 6, f'faq={len(d[\"faq\"])}'
assert 0 <= len(d['relatedTools']) <= 5
print('OK')
"

# Tests des Tools
npx vitest run "$SLUG"

# Render-Check
test -f "dist/de/$SLUG/index.html" && echo "✓ rendered" || echo "✗ MISSING"

# JSON-LD Coverage
grep -c "application/ld+json" "dist/de/$SLUG/index.html"  # erwartet ≥3 (SoftwareApplication + BreadcrumbList + FAQPage)

# Italic-accent H1
grep -E '<h1[^>]*>.*<em>' "dist/de/$SLUG/index.html" | head -1

# Eyebrow-Pill
grep -E 'class="eyebrow"' "dist/de/$SLUG/index.html" | head -1

# Slug-Map + Tool-Registry
grep -c "$SLUG\b" src/lib/slug-map.ts src/lib/tool-registry.ts
```

- [ ] Frontmatter-Schema-konform pro Tool
- [ ] Tests grün pro Tool
- [ ] HTML existiert in dist/
- [ ] ≥3 JSON-LD-Blöcke
- [ ] H1 mit `<em>` rendered
- [ ] Eyebrow-Pill rendered
- [ ] Slug + Registry Eintrag

## Phase 5 — completed-tools.md Audit

```bash
# Pro Report-shipped-Tool: Eintrag mit CEO-Notes vorhanden?
for slug in $(report_shipped_slugs); do
  grep "^| \[$slug\]" docs/completed-tools.md | head -1
done

# Skip-List synchron?
for slug in $(report_shipped_slugs); do
  grep -c "^$slug$" tasks/.ceo-tmp/completed.txt
done
```

- [ ] Jedes shipped Tool ist in completed-tools.md mit CEO-Notes ausgefüllt (nicht nur `—`)
- [ ] Jedes shipped Tool ist in `.ceo-tmp/completed.txt`

## Phase 6 — CEO-Decisions-Log Audit

```bash
# Wurden alle non-trivialen Decisions geloggt?
grep -c "^## " docs/ceo-decisions-log.md

# Stichprobe: alle neuen Dependencies dokumentiert?
git diff 9c3e1e6..HEAD -- package.json | grep "^+" | grep -E '"[a-z-]+":' 
# Jede neue Dep MUSS in ceo-decisions-log.md erwähnt sein
```

- [ ] Jede neue Dependency in ceo-decisions-log.md
- [ ] Jeder §7.15-Override dokumentiert
- [ ] Jede Park-Decision dokumentiert

## Phase 7 — Sequential-Pipeline-Compliance

- [ ] Kein Tool wurde geshippet bevor das vorherige in completed-tools.md stand (Commit-Reihenfolge prüfen)
- [ ] Kein Commit umfasst MEHRERE Tools im Body (1 Commit = 1 Tool)
- [ ] Keine §0-Verletzungen im Report dokumentiert

## Phase 8 — Verdict für User

Nach allen Phasen Claude formuliert:

```
✅ ACCEPTED — alle <N> Tools korrekt shipped, Quality-Bar grün
   → kgv-rechner-Pattern erfolgreich repliziert
   → completed-tools.md Stand jetzt: <pre-count> + <new-count> = <total>

ODER

⚠️  PARTIAL — <X>/<N> Tools korrekt, <Y> Tools mit Issues
   → Issues: <list mit file:line + Verbesserungsvorschlag>
   → Empfehlung: <re-dispatch | claude-direct-fix | accept-as-is>

ODER

❌ REJECTED — Quality-Bar verfehlt, Re-Dispatch nötig
   → Hauptprobleme: <top-3>
   → Neue Anweisung: <was anders gemacht werden muss>
```

## Anti-Patterns die Claude flaggen muss

- Tool als shipped markiert obwohl Tests rot
- Tool ohne Italic-accent-H1 (Refined-Minimalism-Verletzung)
- Hex-Codes oder arbitrary-px in Components (Tokens-only-Verletzung)
- Emojis in UI-Strings (außer User-Config)
- Server-Upload oder Tracking eingebaut (Privacy-First-Verletzung)
- DSGVO-Disclaimer fehlt bei sensitiven Tools (z.B. erbschaftsteuer)
- Tests gemockt statt echte Edge-Cases
- Mehrere Tools in einem Commit
- §7.15-Override ohne Backlog-Eintrag
- Park-Decision ohne CEO-Decisions-Log-Eintrag
