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
  category: laengen                 # aus src/lib/tools/categories.ts
  lang: de                          # de | en | es | fr | pt-BR (Phase 3)

files:
  config: src/lib/tools/meter-to-feet.ts
  content: src/content/tools/meter-zu-fuss/de.md
  test: tests/lib/tools/meter-to-feet.test.ts

accept:
  - Tests grün (npm test)
  - astro check 0/0/0
  - Content ≥ 300 Wörter
  - H1 vorhanden + unique
  - FAQ-Block mit ≥ 3 Fragen + FAQPage-Schema
  - NBSP zwischen allen Zahl-Einheit-Paaren
  - Icon-Prompt als JSDoc in tool-config (für Recraft.ai)
  - Related-Tools-Slot leer (wird automatisch via RelatedTools gesetzt)
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
  category: laengen
  lang: de

files:
  config: src/lib/tools/kilometer-to-miles.ts
  content: src/content/tools/kilometer-zu-meilen/de.md
  test: tests/lib/tools/kilometer-to-miles.test.ts

accept:
  - Tests grün
  - astro check 0/0/0
  - Content ≥ 300 Wörter
  - Formel-Sektion: 1 km = 0.621371 mi
  - FAQ ≥ 3 Fragen (Wann, Präzision, Historie)
  - Icon-Prompt in tool-config als JSDoc
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
