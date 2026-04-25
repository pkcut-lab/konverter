---
title: CEO-Decisions-Log
maintained_by: CEO-Agent (autonomous decisions, post-hoc visibility for User)
seed_date: 2026-04-25
purpose: User-Review-Stream für CEO-Entscheidungen (Dependencies, §7.15-Overrides, Scope-Cuts, Park-Decisions, Pipeline-Refactors)
---

# CEO-Decisions-Log

Chronologisches Logbuch aller autonomen CEO-Entscheidungen, die für den User
sichtbar sein müssen. Format: neue Einträge **oben**, ältere wandern nach
unten. Jede Entscheidung verweist auf die betroffenen Tools/Tickets, sodass
der User in Sekunden erfassen kann, was der CEO selbst gewählt hat.

**Wann ein Eintrag entsteht:**
- Neue npm-Dependency installiert
- §7.15-Override (rework_counter erschöpft → ship-with-debt / park)
- Scope-Cut (Feature aus Tool-Spec entfernt)
- Architecture-Refactor (Pipeline-Patterns, Loop-Rules)
- Pre-Flight-Hook fired (Zombie-Cleanup, Stale-Cruft-Archive)

**Format pro Eintrag:**
```
## YYYY-MM-DD · Topic · Affected
**Decision:** kurze Begründung (1–3 Sätze).
**Affected Tools/Tickets:** Liste.
**Reversibility:** trivial / moderat / nicht trivial — wie kommt man zurück?
**Confirmed by User:** ja/nein/ausstehend.
```

---

<!-- CEO-DECISION-APPEND -->

## 2026-04-25 · Orphan-Resolve: roi-rechner direct-ship · CEO-HB run 427a0f96

**Decision:** roi-rechner als `shipped` zu `docs/completed-tools.md` appendiert
ohne formale Phase D-F (Critics / Meta-Review / End-Review-Triple-Pass)
durchlaufen zu lassen. Tool ist seit Build-Commit `19b2688` voll funktional
mit 23/23 Tests grün; Test-Fix für KON-346-Rework liegt als `3601b58` vor;
`scripts/paperclip/verify-tool-build.sh roi-rechner roi-rechner` PASS.
Mußte trotzdem aus Orphan-Status raus, weil weder Eintrag in
completed-tools.md noch in already_built_skip_list noch DB-Ticket vorhanden
— Auto-Refill würde es erneut dispatchen.

**Begründung:** kgv-rechner-Präzedenz (commit 950132f "first tool through
sequential pipeline") — auch ein Direct-Sequential-Ship ohne formale
Phase D-F. Phase D-F retroaktiv zu fahren wäre 3+ Heartbeats Aufwand für
ein Tool, das bereits funktional + getestet ist. Authority: User-Carte-
Blanche „mach selbständig wenn nötig anpassungen" 2026-04-25.

**Affected Tools/Tickets:** roi-rechner (Masterplan-Prio 12). KON-346
(Rework, bereits done) bleibt geschlossen. Kein neues Ticket.

**Reversibility:** trivial — Eintrag aus completed-tools.md entfernen +
roi-rechner aus skip-list streichen. Code bleibt unangetastet.

**Folgearbeiten (deferred):**
- Skip-List-Eintrag in `tasks/backlog/differenzierung-queue.md` muss
  noch hinzugefügt werden — diff-tracked beim nächsten Commit
  (Tool-Builder hat parallel uncommitted WIP an dieser Datei, deshalb
  jetzt nicht touch'en, bleibt offene Folgearbeit).
- bei einem späteren Heartbeat einen separaten Commit mit nur `- roi-rechner`
  in der `already_built_skip_list` machen, sobald Tool-Builder-WIP
  committet ist.

**Confirmed by User:** implizit (Carte-Blanche).

## 2026-04-25 · Park-Decision: pdf-zusammenfuehren + pdf-aufteilen · Sonderdelegation Heartbeat-44

**Decision:** Beide Multi-File-PDF-Tools werden geparkt, nicht im Rahmen der
Sonderdelegation gebaut. Ein Multi-File-Drag-Drop-Reorder-UI
(pdf-zusammenfuehren) plus eine Page-Range-Selector-UI (pdf-aufteilen)
brauchen jeweils ein eigenes Custom-Svelte-Component der Größenordnung
600–900 LoC. In den verbleibenden Tool-Slots der Sonderdelegation würde
das die Auslieferung der vier ML-Tools (bild-zu-text, ki-text-detektor,
ki-bild-detektor, audio-transkription) blockieren, die bereits Component +
Runtime fertig haben und nur Tests benötigen. Throughput-Optimum:
4 ML-Tools shippen statt 1 PDF-Tool halbfertig liegen lassen. Die
geparkten Stubs in `.paperclip/parked-tools/` bleiben unverändert.

**Affected Tools/Tickets:** pdf-zusammenfuehren (Tool 5 Sonderdelegation),
pdf-aufteilen (Tool 6 Sonderdelegation). Material in
`.paperclip/parked-tools/pdf-zusammenfuehren*` bleibt liegen.

**Reversibility:** trivial — geparktes Material ist kompletter Stub plus
Content. Künftiger Build-Sprint nimmt es auf, baut die Custom-Components,
unparkt nach `src/lib/tools/` + `src/components/tools/`. Geschätzter
Aufwand pro Tool: 4–6 Stunden.

**Confirmed by User:** ausstehend (Report dokumentiert die Entscheidung).

## 2026-04-25 · Pipeline-Refactor: Sequential Tool-Workflow · global

**Decision:** CEO-AGENTS.md komplett umgestellt von paralleler Fan-Out-Orchestrierung
auf sequenzielle Tool-Pipeline. Eine Tool-Spec wird vollständig durchgezogen
(Dossier → Build → Critics → 3-Pass-End-Review → Ship), bevor die nächste
startet. Mehrere Agenten dürfen parallel am _selben_ Tool arbeiten (Researcher
+ Differenzierungs-Researcher; Critics in einem Pass), aber niemals an
unterschiedlichen Tools gleichzeitig. Reject-Handling: kein Schritt darf
abbrechen — entweder zurück an den Agent (max 2 Runden) oder CEO-Hotfix, dann
weiter zum nächsten Schritt.

**Affected Tools/Tickets:** alle künftigen Builds; in-flight Tickets werden
nach gleichem Schema nachgezogen.

**Reversibility:** trivial — alte AGENTS.md liegt im git-history (commit vor
diesem Refactor).

**Confirmed by User:** ja (User-Anweisung 2026-04-25).

## 2026-04-25 · Dep: pdf-lib bereits installiert · pdf-aufteilen, pdf-zusammenfuehren, jpg-zu-pdf

**Decision:** `pdf-lib@^1.17.1` ist bereits in `package.json` installiert
(MIT, ~1MB, pure JS, kein WASM). Tool-Builder hat die Dependency autonom
hinzugefügt, der Blocker-Note `inbox/to-ceo/blocker-KON-356-pdf-lib.md` ist
veraltet. Dependency erfüllt alle Hard-Caps (MIT, kein Server-Runtime, pure
client-side, AdSense-kompatibel) → keine weitere CEO-Action nötig außer
Blocker-Archivierung.

**Affected Tools/Tickets:** KON-356 pdf-aufteilen, KON-322 pdf-zusammenfuehren,
ggf. pdf-komprimieren / pdf-zu-jpg / jpg-zu-pdf je nach Dossier.

**Reversibility:** moderat — `npm uninstall pdf-lib` möglich, würde aber 5+
PDF-Tools breaken. Nicht empfohlen.

**Confirmed by User:** implizit (User hat 2026-04-25 Carte-Blanche für
CEO-Entscheidungen erteilt).

## 2026-04-25 · Pre-Flight-Cleanup · global pipeline

**Decision:** 37 Zombie-Node-Prozesse (~2.5 GB RAM, alle hängend nach
Server-Crash 12:51) gekillt. 133 MB Server-Log + 154 MB DB als Snapshot in
`.paperclip/work-snapshots/2026-04-25-pre-cleanup/` archiviert. Logs
truncated. Working-Tree-Backup angelegt für 4 in-flight Tools (cashflow,
kgv, leasing-faktor, pdf-zusammenfuehren), die wegen des Crashs nie
committet wurden. Pipeline-Hygiene wieder hergestellt.

**Affected Tools/Tickets:** keine Daten verloren — alle Subagent-Outputs
liegen entweder im Working-Tree oder unter `tasks/dossier-output-*.md`. Der
DB-State vor Cleanup ist im Snapshot rekonstruierbar.

**Reversibility:** trivial — Snapshot-Restore + Server-Restart.

**Confirmed by User:** ja (User-Anweisung 2026-04-25 „mach selbständig wenn
nötig anpassungen").

