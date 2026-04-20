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
