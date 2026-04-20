# Ticket-Template — 1 Tool = 1 Ticket

> **Regel:** Ein Ticket umfasst GENAU ein Tool (Slug + Sprache). Nie Batches. Literatur: atomare Execution verhindert Kontext-Verwässerung (NotebookLM-Research 2026-04-19).

## Schema

```yaml
# ticket-id wird von Paperclip gesetzt
type: tool-build          # tool-build | tool-translate | tool-audit | bugfix
priority: normal          # low | normal | high | urgent (User-only)
assignee: tool-builder    # SOUL-Name

tool:
  slug: meter-zu-fuss               # kebab-case, ASCII
  tool_id: meter-to-feet            # sprach-neutral
  tool_type: converter              # converter | calculator | generator | formatter | validator | analyzer | comparer (+ ml-file-* für Phase 7a)
  category: length                  # PFLICHT. Authoritative Enum in CONVENTIONS.md §Category-Taxonomie (length | weight | area | volume | distance | temperature | image | video | audio | document | text | dev | color | time)
  lang: de                          # de | en | es | fr | pt-BR (Phase 3)

files:
  config: src/lib/tools/meter-to-feet.ts
  content: src/content/tools/meter-zu-fuss/de.md
  test: tests/lib/tools/meter-to-feet.test.ts

accept:
  # Siehe BRAND_GUIDE.md §4 für die 12-Punkte-Eval-Rubrik (v2). Hier nur Ticket-spezifische Zusätze + kurze Mnemonik:
  - Tests grün + astro check 0/0/0
  - Frontmatter-Schema valid (15 Felder gemäß CONTENT.md §13.1; category PFLICHT; headingHtml max 1 <em>)
  - H2-Pattern konform (A/B/C gemäß CONTENT.md §13.2; Tool-Typ bestimmt Pattern)
  - Prose-Link-Closer `## Verwandte <Kat>-Tools` + wortgleiche Intro-Zeile + 3 Bullets (CONTENT.md §13.4)
  - Kat-Label aus §13.3-Mapping (`length → Längen` etc.)
  - NBSP zwischen allen Zahl-Einheit-Paaren
  - `relatedTools: []` ist OK — Category-Fallback trägt (CONVENTIONS.md §Category-Fallback-Contract). Kuration nur bei redaktionellem Wunsch.
  - FAQ 4–6 Einträge (JSON-LD FAQPage)
  - Differenzierungs-Check §2.4 verlinkt (bei Tools mit Unique-Strategie)
  - Commit-Trailer `Rulebooks-Read: PROJECT, CONVENTIONS, STYLE, CONTENT`

budget:
  heartbeats: 4                     # max Heartbeat-Zyklen bis Timeout → User-Eskalation
  reworks: 2                        # max QA-Rejects → User-Review

dependencies:
  blocked_by: []                    # ticket-ids die zuerst fertig sein müssen
  blocks: []                        # ticket-ids die auf mich warten

differenzierung:
  applies: false                    # true bei unique-strategy tools → §2.4 Pflicht
  research_subagent: null           # ticket-id für parallel laufenden Subagent-Research
```

## Workflow pro Ticket

1. **CEO liest Backlog** → wählt nächstes Ticket (dependencies resolved?)
2. **CEO schreibt** `tasks/current_task.md` mit dem Ticket-YAML + Verweis auf `BRAND_GUIDE.md`
3. **Tool-Builder schreibt** `task.lock` → baut alle 3 Files (config, content, test) → `npm test` lokal grün → entfernt `task.lock` → schreibt `tasks/engineer_output.md` mit Datei-Liste + Diff-Summary
4. **QA-Agent** liest `engineer_output.md` → läuft 11-Punkte-Rubrik aus `BRAND_GUIDE.md` → schreibt `tasks/qa_results.md` mit PASS/FAIL + Details
5. **Bei PASS:** CEO schreibt `inbox/ready-to-ship/<ticket-id>.md` (User-Approval vor Deploy)
6. **Bei FAIL:** CEO öffnet Re-Work-Ticket mit QA-Befund, erhöht `reworks` Counter
7. **Reworks > 2:** CEO schreibt `inbox/user-escalation/<ticket-id>.md`

## Ticket-Atomarität

- Genau EIN Tool pro Ticket. Keine "batch of 10 converters".
- Übersetzungen (de → en) = SEPARATES Ticket, Type `tool-translate`, blocked_by de-Ticket.
- SEO-Audit = SEPARATES Ticket, Type `tool-audit`, läuft nach ship.

## Prioritäten (wer darf setzen)

- `urgent`: Nur User
- `high`: User oder CEO bei Bug-Reports
- `normal`: Default (CEO setzt)
- `low`: CEO bei Nice-to-have Enhancements

## Example — ausgefüllt für Session-5-Tool

```yaml
type: tool-build
priority: normal
assignee: tool-builder

tool:
  slug: kilometer-zu-meilen
  tool_id: kilometer-to-miles
  tool_type: converter
  category: length
  lang: de

files:
  config: src/lib/tools/kilometer-to-miles.ts
  content: src/content/tools/kilometer-zu-meilen/de.md
  test: tests/lib/tools/kilometer-to-miles.test.ts

accept:
  - Tests grün + astro check 0/0/0
  - Frontmatter v2 gemäß CONTENT.md §13.1 (inkl. category: length, contentVersion: 1)
  - Pattern A Locked-H2 (Was macht / Umrechnungsformel / Anwendungsbeispiele / Häufige Einsatzgebiete / Häufige Fragen / Verwandte Längen-Tools)
  - Prose-Link-Closer §13.4 (3 Bullets, Titel fett + Link, Prose ≤120 Z.)
  - Formel-Sektion: 1 km = 0.621371 mi
  - FAQ 4–6 Fragen (Wann / Präzision / Historie / Formel-Exaktheit)
  - relatedTools darf [] sein — Category-Fallback füllt aus length-Siblings
  - Commit-Trailer vorhanden

budget:
  heartbeats: 2
  reworks: 1

dependencies:
  blocked_by: []
  blocks: [kilometer-zu-meilen-en, kilometer-zu-meilen-fr]   # wird in Phase 3 relevant

differenzierung:
  applies: false
```
