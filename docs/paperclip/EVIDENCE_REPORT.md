# Evidence-Report — Format-Standard für Kritiker

> **Zweck:** Einheitliches Output-Format aller Critic-Rollen (merged-critic, content-critic, design-critic, a11y-auditor, performance-auditor, security-auditor, legal-auditor, seo-auditor, platform-engineer). CEO aggregiert diese Reports maschinell über den YAML-Frontmatter und eskaliert pro Ticket auf Basis der `verdict`-Felder.
>
> **Ablage:** `tasks/awaiting-critics/<ticket-id>/<critic-name>.md` — ein File pro Critic pro Ticket. Der CEO liest alle Files in diesem Ordner nach Fan-Out-Completion.
>
> **Quelle der Wahrheit:** Research-Report `research/2026-04-20-multi-agent-role-matrix.md` §5.2 (Critic-Archetyp) + §6.1 Item 3 + §2.8 (Eval-Gate).

## Schema

### YAML-Frontmatter (Pflicht, maschinenlesbar)

```yaml
---
evidence_report_version: 1
ticket_id: tool-build-0042
tool_slug: meter-zu-fuss
language: de
critic: merged-critic
critic_version: 1.0
audit_started: 2026-04-21T10:30:00Z
audit_completed: 2026-04-21T10:45:00Z
heartbeat_id: hb-2026-04-21-0417
rubric: brand-guide-v2        # authoritative reference, z.B. brand-guide-v2 | a11y-aaa-wcag | core-web-vitals-2026

# Verdict
verdict: pass                 # pass | fail | partial | timeout
total_checks: 12
passed: 10
failed: 2
warnings: 0
rework_required: true
rework_severity: blocker      # blocker | major | minor (nur bei fail/partial)

# Cost-Transparenz (§7.11 Observability)
tokens_in: 14200
tokens_out: 2100
webfetch_calls: 0
firecrawl_calls: 0            # Budget-Guard §7.16
duration_ms: 900000

# Rubber-Stamping-Guard (§2.8 Eval-Gate)
eval_version: 2026-04-20      # Fixture-Set-Timestamp; CEO cross-checkt vs evals/<critic>/VERSION
eval_f1_last_run: 0.94        # letzte Regressions-F1 > Threshold 0.85

# Per-Check-Matrix (maschinenlesbar)
checks:
  - id: 1
    name: Tests grün
    rulebook_ref: BRAND_GUIDE.md §4 #1
    status: pass
    evidence: "npm test exit 0, 127/127 grün"
  - id: 5
    name: Frontmatter-Schema valid
    rulebook_ref: CONTENT.md §13.1 (15 Felder) + §13.5 Regel 2
    status: fail
    severity: blocker
    evidence_file: src/content/tools/meter-zu-fuss/de.md:3
    evidence_quote: 'headingHtml: "<em>Meter</em> in <em>Fuß</em> umrechnen"'
    reason: "§13.5 Regel 2 erlaubt max 1 <em>; Ziel-Substantiv ist 'Fuß', nicht beide."
    fix_hint: "headingHtml: 'Meter in <em>Fuß</em> umrechnen'"
  - id: 6
    name: H2-Pattern-Konformität (Pattern A, 6 Locked-H2s)
    rulebook_ref: CONTENT.md §13.2
    status: fail
    severity: major
    evidence_file: src/content/tools/meter-zu-fuss/de.md:47
    evidence_quote: "## Wann brauchst du Meter-zu-Fuß?"
    reason: "Pattern-A Position 4 erwartet exakt '## Häufige Einsatzgebiete'; abweichender Wortlaut bricht Locked-Sequence."
    fix_hint: "H2 auf '## Häufige Einsatzgebiete' umbenennen."
---
```

### Markdown-Body (menschenlesbar, strukturiert)

```markdown
# Evidence-Report — <tool_slug> (<language>) — <critic>

## Summary

- Verdict: **fail** (blocker)
- Checks: 10/12 pass, 2 fail, 0 warnings
- Heartbeats: 1 (completed within budget)
- Rework empfohlen: ja — Builder soll headingHtml + H2 fixen, re-submit.

## Fails (alle, nicht nur erster)

### Check #5 — Frontmatter-Schema valid (BLOCKER)
- **Rulebook:** CONTENT.md §13.1 + §13.5 Regel 2
- **File:** `src/content/tools/meter-zu-fuss/de.md:3`
- **Zitat:** `headingHtml: "<em>Meter</em> in <em>Fuß</em> umrechnen"`
- **Begründung (≤2 Sätze):** §13.5 Regel 2 erlaubt genau ein `<em>`; Ziel-Substantiv ist das Resultat der Umwandlung („Fuß"), nicht der Ausgangs-Wert.
- **Fix-Vorschlag:** `headingHtml: "Meter in <em>Fuß</em> umrechnen"`.

### Check #6 — H2-Pattern-Konformität (MAJOR)
- **Rulebook:** CONTENT.md §13.2 Pattern A
- **File:** `src/content/tools/meter-zu-fuss/de.md:47`
- **Zitat:** `## Wann brauchst du Meter-zu-Fuß?`
- **Begründung:** Pattern A Position 4 ist „Häufige Einsatzgebiete" — exakter Wortlaut. Abweichung bricht Locked-Sequence-Grep-Test im Vitest content-test.
- **Fix-Vorschlag:** `## Häufige Einsatzgebiete` (Content bleibt, nur Heading-Wortlaut).

## Passes (kompakt)

- §4 #1 Tests grün (127/127) ✓
- §4 #2 Astro-Check 0/0/0 ✓
- §4 #3 Kein Hex in Component-Code ✓
- §4 #4 Keine arbitrary-px ✓
- §4 #7 Prose-Link-Closer korrekt (3 Bullets, §13.4) ✓
- §4 #8 headingHtml max 1 `<em>` — **siehe Check #5 fail**
- §4 #9 Schema.org JSON-LD (WebApp + FAQPage + Breadcrumb) ✓
- §4 #10 axe-core clean ✓
- §4 #11 NBSP 0 matches (Regex) ✓
- §4 #12 Commit-Trailer `Rulebooks-Read:` ✓

## Warnings (soft)

_Keine._

## Notes (≤3 Sätze, optional)

Bei einem unique-tool-Ticket würde §2.4-Differenzierungs-Check hier zusätzlich geprüft. Nicht relevant für dieses Standard-Tool.
```

## Gate-Check (CEO-Aggregation)

Der CEO liest NUR den Frontmatter maschinell. Ein Ticket passiert den Critic-Gate wenn:

1. **Alle Critics** im `tasks/awaiting-critics/<ticket-id>/` haben ein Evidence-Report-File abgelegt.
2. Jedes File hat `verdict: pass` ODER `verdict: partial + rework_severity: minor`.
3. `eval_f1_last_run ≥ 0.85` pro Critic (Rubber-Stamping-Guard).
4. Kein File hat `verdict: timeout` (partial-Reports zählen nicht als Pass).

Bei Fail wird das Ticket gemäß §7.15 Autonomie-Gates **automatisch** zu Rework/Park/Ship-as-is routed — nicht User-Eskalation (außer §7.15-Live-Alarm-Trigger greift).

## Ship-Gate-Rules (v1.2, 2026-04-25 — Defense-in-Depth via Severity-Trigger)

**v1.2-Patch (2026-04-25, CEO-Decision autonomous):** Stufe 1 erweitert um
expliziten `severity == blocker` Trigger. Redundant zu `verdict == fail`,
aber macht die Logik self-documenting und fängt edge-cases ab, in denen
ein Critic eine `partial`-Verdict mit `severity: blocker` mischt (z.B.
Merged-Critic Severity-Drift bei not_tested-Domains). Quelle: Meta-
Reviewer-Finding KON-401 (skonto-rechner R1) — siehe ceo-decisions-log.md
2026-04-25-Eintrag „Ship-Gate v1.2 — Severity-Trigger".



**Problem.** Runde 3 auf `tilgungsplan-rechner`: merged-critic meldete `verdict=pass` (19-Check-Rubrik, 0 fails), während a11y-auditor `partial` mit 3 WCAG-Fails (inkl. A13 = WCAG 2.1.1 Level A), design-critic `fail`, conversion-critic `partial (rework_required=true)` ablieferten. Ohne Meta-Review wäre das Tool als ship-ready durchgerutscht.

**Root-Cause.** Der merged-critic fährt eine **eigenständige, orthogonale 19-Check-Composite-Rubrik** (Brand-Guide + Basics). Er aggregiert die individual-critics NICHT und darf deren Verdicts NICHT überstimmen. Divergenz ist daher kein Bug, sondern erwartet — die Rule muss das explizit behandeln.

### Scope-Definitionen (verbindlich)

| Critic-Typ | Rubrik | Autorität |
|---|---|---|
| **merged-critic** | Cross-cutting 19-Check-Composite (Tests, astro-check, Hex-Guard, Frontmatter, H2-Pattern, Prose-Closer, Schema.org, NBSP, Commit-Trailer, Dossier-Compliance, Perf-Budget, hreflang, Prod-Build, Meta-Desc, Tool-Type-Security, relatedTools) | **Zusätzliche** Rubrik. Kein Aggregat der individual-critics. |
| **individual-critics** (content, design, a11y, performance, security, conversion, platform) | Je eigene Domain-spezifische Rubrik | **Eigenständiges Veto-Recht.** Kein individual-critic-`fail` wird durch merged-critic-`pass` neutralisiert. |
| **meta-reviewer** | 6-Dimensionen-Audit (§3 meta-reviewer AGENTS.md) + **Divergence-Check zwischen merged- und individual-verdicts (Kernauftrag)** | Entscheidet bei Divergenz. Flagt Rework oder lässt Ship zu. |

### Ship-Gate-Algorithmus (pseudocode, autoritativ)

CEO führt diesen Algorithmus in §7 Autonomie-Gate-Resolve aus, NACH Fan-Out-Completion aller 8 Critics und BEFORE `route_to_meta_review`/`route_to_deploy_queue`:

```python
def ship_gate(ticket, critic_reports):
    """
    Input: critic_reports = {merged-critic, content-critic, design-critic,
                             a11y-auditor, performance-auditor, security-auditor,
                             conversion-critic, platform-engineer}

    Output: 'rework' | 'meta-review-required' | 'ship-ready'

    Regel (2026-04-24 festgeschrieben via KON-242):
    Individual-Critics haben Veto. merged-critic-pass überstimmt KEINEN
    individual-critic-fail. Bei merged=pass + ≥1 individual=partial läuft
    Meta-Reviewer ZWINGEND — das ist der Divergenz-Check-Gate.
    """

    # --- Stufe 1: Individual-Critic-Veto (hart) ---
    # v1.2 (2026-04-25): severity-blocker als expliziter Trigger ergaenzt
    # (defense-in-depth, redundant zu verdict==fail, aber faengt Severity-
    # Drift in not_tested-Domains ab — Quelle KON-401 skonto-rechner R1).
    for critic, report in critic_reports.items():
        if critic == 'merged-critic':
            continue  # merged wird in Stufe 2 geprüft
        if report.verdict == 'fail':
            return 'rework'
        if getattr(report, 'severity', None) == 'blocker':
            return 'rework'  # v1.2 — explicit severity-blocker veto
        if (report.verdict == 'partial'
            and report.rework_required is True
            and report.rework_severity in ('blocker', 'major')):
            return 'rework'

    # --- Stufe 1b: Merged-Severity-Drift-Guard (v1.2, 2026-04-25) ---
    # merged-critic kann rework_severity: minor melden, waehrend Specialists
    # Blocker melden, weil merged-Rubrik die Domain nicht abdeckt (not_tested).
    # Trigger Rework wenn merged.rework_required UND beliebiger Specialist
    # severity in (blocker, major) hat.
    merged = critic_reports['merged-critic']
    if getattr(merged, 'rework_required', False) is True:
        for critic, report in critic_reports.items():
            if critic == 'merged-critic':
                continue
            if getattr(report, 'severity', None) in ('blocker', 'major'):
                return 'rework'  # v1.2 — Severity-Drift-Guard

    # --- Stufe 2: merged-critic-Gate ---
    merged = critic_reports['merged-critic']
    merged_acceptable = (
        merged.verdict == 'pass'
        or (merged.verdict == 'partial'
            and merged.rework_severity == 'minor')
    )
    if not merged_acceptable:
        return 'rework'

    # --- Stufe 3: Divergenz-Trigger ---
    # Wenn merged=pass UND ≥1 individual=partial → meta-reviewer PFLICHT
    any_individual_partial = any(
        r.verdict == 'partial'
        for c, r in critic_reports.items()
        if c != 'merged-critic'
    )
    if any_individual_partial:
        return 'meta-review-required'

    # --- Stufe 4: Meta-Review (auch ohne Divergenz, pre-ship) ---
    # User-Decision 2026-04-24: JEDES Tool läuft durch Meta-Review + End-Review
    # Triple-Pass VOR ship (§7 + §7.6 CEO-AGENTS.md). Keine Kompromisse.
    return 'meta-review-required'


def on_meta_review_done(ticket, meta_report):
    """Nach meta-reviewer-done — Divergence-Check-Verdict lesen."""
    if meta_report.divergence_flagged is True:
        return 'rework'            # merged/individual-widerspruch bestätigt
    if meta_report.findings_blocker_count > 0:
        return 'rework'
    # End-Reviewer Triple-Pass (§7.6) übernimmt ab hier
    return 'route-to-end-review-pass-1'
```

### Rationale (Option C, Status quo festgeschrieben)

Drei Optionen wurden in [KON-242](/KON/issues/KON-242) diskutiert:

- **A — strict-conjunction:** verlangt `all(individual.verdict ∈ {pass, partial+minor})`. Nachteil: verliert merged-critic als Second-Opinion-Signal; bei jedem Minor-Flake-Partial wird blockiert.
- **B — merged-override:** merged synthetisiert individual-critics. Nachteil: merged-Rubrik müsste komplett umgebaut werden (derzeit orthogonal), und ein Critic, der alle anderen aggregiert, ist ein Single-Point-of-Failure (Rubber-Stamping-Risiko).
- **C — meta-review-required:** merged bleibt cross-cutting composite, individual-critics behalten Veto, Divergenz triggert Meta-Reviewer. **Gewählt**, weil (a) es die faktische Praxis seit User-Decision 2026-04-24 („alles durch Meta-Review") ist und (b) es den Rubber-Stamping-Guard ergänzt statt ersetzt.

### Integration mit §7 Autonomie-Gate-Resolve (CEO)

Der bestehende `resolve_gate(ticket, critic_reports)` in `docs/paperclip/bundle/agents/ceo/AGENTS.md` §7.15 ruft `ship_gate` als ersten Schritt auf:

```python
verdict = ship_gate(ticket, critic_reports)
if verdict == 'rework':
    route_to_rework(ticket, failed_checks=collect_fails(critic_reports))
elif verdict == 'meta-review-required':
    route_to_meta_review(ticket)   # §7 existing
# 'ship-ready' wird von ship_gate derzeit nie zurückgegeben — User-Policy
# 2026-04-24 zwingt Meta-Review + End-Review-Triple-Pass für alle Tools.
```

Die bestehenden `route_to_polish`- und `route_to_park`-Pfade in §7.15 bleiben unverändert. Polish-Gate (Score 80–94%) greift NACH `ship_gate` und VOR `route_to_meta_review`, weil Polish-Suggestions sonst von Meta-Reviewer als „partial-findings" wiedergekaut werden.

### Checkliste für CEO (Heartbeat Step 8)

- [ ] `ship_gate` als ersten Aufruf in `resolve_gate`
- [ ] Bei `rework`: failed_checks aus **allen** Critic-Reports sammeln, nicht nur merged
- [ ] Bei `meta-review-required`: meta-reviewer bekommt `critic_reports_ref` + expliziten `divergence_check_mandate: true`-Flag im Ticket-Body
- [ ] Bei Meta-Review-Done: `on_meta_review_done` konsumiert `divergence_flagged`-Feld; fehlt das Feld im Report → Critic-Drift-Alarm, weil Meta-Reviewer den Divergence-Check ausgelassen hat

## A11y-Auditor Rubrik-Klärung: --color-text-subtle + Placeholder-Kontrast

> **Gelockt 2026-04-24 (KON-253).** Löst Divergenz zwischen a11y-auditor (BLOCKER) und merged-critic (MINOR) bei `.optional-badge`/`.empty-state` auf kreditrechner (KON-236).

### SC 1.4.6 Text Contrast (AAA ≥7:1) — `--color-text-subtle` als `color`

| Kontext | WCAG-Requirement | Severity wenn fail |
|---|---|---|
| Jeder sichtbare Text (`color: var(--color-text-subtle)`) | **AAA ≥7:1** gegen rendered Hintergrund | **BLOCKER** |
| Empty-State-Messages (`.empty-state`, `.generator__empty` etc.) | **AAA ≥7:1** — instructional text | **BLOCKER** |
| Optional-Badge (`.optional-badge`, "optional"-Label) | **AAA ≥7:1** — instructional text | **BLOCKER** |
| Unit-Labels (`.panel__label-unit`, "km", "€") | **AAA ≥7:1** — informational text | **BLOCKER** |
| Separator-Zeichen (`.converter__separator` "=", `.regex__delim` "/") | **AAA ≥7:1** — formal text, nicht purely decorative | **BLOCKER** |

### SC 1.4.11 Non-Text Contrast (≥3:1) — `--color-text-subtle` als `border-color`/`background`

| Kontext | WCAG-Requirement | Severity wenn fail |
|---|---|---|
| `border-color: var(--color-text-subtle)` (hover-borders, divider-lines) | **≥3:1** gegen angrenzende Fläche | MINOR wenn <3:1, sonst PASS |
| `background: var(--color-text-subtle)` (divider, pulse-dot) | **≥3:1** gegen Nachbar | MINOR wenn <3:1, sonst PASS |

### SC 1.4.3 Note — Placeholder-Text

WCAG SC 1.4.3 Note: *"Inactive user interface components … have no contrast requirement."*
Placeholder-Text (`::placeholder`) gilt als **inactive UI component** — er verschwindet bei Interaktion und ist kein primäres Inhaltselement.

| Kontext | Requirement | Severity |
|---|---|---|
| `::placeholder` mit `color: var(--color-text-subtle)` | **AA ≥4.5:1** (WCAG Note, nicht AAA) | MINOR wenn <4.5:1, PASS wenn ≥4.5:1 |

> Aktueller Stand nach Token-Fix: light subtle (#575450) auf bg/surface ≥7.21:1 ✅ — Placeholder ist damit automatisch auch AAA-konform.

### Token-Kontrast-Referenz (nach KON-253 Fix, 2026-04-24)

| Token | Light mode | Dark mode (nach Fix) |
|---|---|---|
| `--color-text-subtle` Wert | `#575450` | `#B3B0A9` |
| auf `--color-bg` | 7.21:1 ✅ | 8.11:1 ✅ |
| auf `--color-surface` | 7.53:1 ✅ | 7.24:1 ✅ |
| auf `--color-surface-sunk` | 6.62:1 ⚠ (kein Text drauf*) | 8.91:1 ✅ |

*\* `--color-surface-sunk` wird nur für Icon-Boxen, Toggle-Tracks und Video-Elemente als Hintergrund verwendet — kein `--color-text-subtle`-Text sitzt direkt darauf.*

**Konsequenz für a11y-Auditor:** Wenn ein Callsite `color: var(--color-text-subtle)` auf einem `--color-surface-sunk`-Hintergrund hat, ist das ein **BLOCKER** (6.62:1 light < 7:1). Aktuell existiert kein solcher Callsite. Neue Tools müssen das vermeiden.

---

## Writer-Constraints (nicht verhandelbar)

- **Evidenzbasiert:** Jeder `fail` enthält `rulebook_ref` + `evidence_file` + `evidence_quote` + `reason`. Reports ohne Zitat werden vom CEO als `invalid_report` markiert und der Critic wird zur Neuauditur geschickt.
- **Alle Fails, nicht nur der erste.** Erschöpfende Liste, damit Builder in 1 Rework-Cycle alle Issues fixt statt N Ping-Pong-Runden.
- **Neutralsprache:** Kein „ich finde", „hässlich", „sauber". Nur „laut §X.Y", „im File Y:Z", „Messwert N".
- **Kein Rulebook-Freestyle:** Wenn der Critic keinen Rulebook-Anchor für eine Beobachtung hat, gehört sie in `warnings` (soft), nicht in `failed`.
- **Token-Sparsamkeit:** Markdown-Body ≤ 2000 Tokens. Lange Evidence-Listen nutzen `evidence_file` + 1-Zeilen-Quote, nicht vollständige Code-Blöcke.
- **Keine Halluzinationen:** Zitate müssen als Substring im referenzierten File existieren. Critic-Eval-Suite prüft das mit `citation_verify`-Fixtures (§2.8).

## Screenshot-Referenzen (Design-Critic, a11y-Auditor, Performance-Auditor)

Screenshots werden NICHT im Repo gespeichert (Binary-Bloat). Stattdessen Cloudflare-R2-URL oder Playwright-Artifact-Pfad:

```yaml
screenshots:
  - name: tool-detail-desktop-dark
    artifact_path: playwright-artifacts/ticket-0042/tool-detail-desktop-dark.png
    referenced_in_check: 3
  - name: focus-ring-tab-step-4
    artifact_path: playwright-artifacts/ticket-0042/focus-4.png
    referenced_in_check: 10
```

Artifacts werden nach CEO-Aggregation 30 Tage behalten, dann automatisch gelöscht (`scripts/cleanup-artifacts.sh`, in Batch 3).

## Partial / Timeout-Behandlung

- **Partial-Report** (`verdict: partial`): Critic konnte nicht alle Checks abschließen (z.B. Playwright-Flake). Report enthält nur abgeschlossene Checks; `timeout_reason` im Frontmatter. CEO wertet `partial` **nicht** als `pass` — Ticket geht in Retry-Queue (max 1 Retry, dann `auto-resolve: ship-as-is` wenn Partial-Rate > 90% ODER `park` wenn < 90%).
- **Timeout** (`verdict: timeout`): Budget (1 Heartbeat) überschritten. Gleiche Behandlung wie partial, aber kein Retry.

## Eval-Hook (§2.8)

Der Critic MUSS bei jedem Heartbeat vor dem ersten Review-Check den Eval-Runner kurz anstoßen:

```
evals/<critic>/run-smoke.sh  →  F1 gegen 5 random pass + 5 random fail fixtures
```

Wenn F1 < 0.85: Critic legt `verdict: self-disabled` ab + schreibt `inbox/to-ceo/critic-drift-<name>.md`. CEO löst §7.15 „Critic-Drift-Alarm" aus (Live-Ping an User — einer der 3 Live-Alarm-Fälle).

## Versionierung

Schema-Änderungen erhöhen `evidence_report_version`. CEO rejected Reports mit unbekannter Version. Migration-Pfad für alte Reports: `scripts/migrate-evidence-reports.ts` (Batch 3, optional).
