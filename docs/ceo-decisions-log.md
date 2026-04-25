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

