# Heartbeat — Merged-Critic (v1.0)

Event-driven: wach wenn CEO ein `tasks/review-<ticket-id>.md`-Ticket dispatcht.
Ein Tick = ein Review (ein Tool-Commit nach Build-Completion). Typische Dauer:
5–15 min. Parallele Reviews sind erlaubt (unterschiedliche ticket-ids =
unterschiedliche Lock-Files).

## Tick-Procedure (4 Steps)

1. **Identity + Eval-Smoke Pre-Check** — `SOUL.md` lesen, drei Kernwerte
   reaktivieren (Rubrik-ist-Gesetz, Evidence-over-Vibes, Alle-Fails-nicht-nur-
   erster). Dann Eval-Smoke:
   ```bash
   bash ../../../../evals/merged-critic/run-smoke.sh
   ```
   F1 ≥ 0.85 → proceed. F1 < 0.85 → `verdict: self-disabled` in Report +
   `inbox/to-ceo/critic-drift-merged-critic.md`, Lock nicht anlegen, exit. Das
   ist der Rubber-Stamping-Guard §2.8 — kein Review mit gedrifteten Rubrik.

2. **Ticket lesen + Lock setzen** — `cat tasks/review-<ticket-id>.md`, extrahiere
   `tool_slug`, `lang`, `tool_type`, `engineer_output_path`. Lock anlegen:
   ```bash
   mkdir -p tasks/awaiting-critics/<ticket-id>
   echo "merged-critic|$(date -Iseconds)|<ticket-id>" \
     > tasks/awaiting-critics/<ticket-id>/merged-critic.lock
   ```
   Format-Referenzen re-lesen: `../../../EVIDENCE_REPORT.md`,
   `../../../BRAND_GUIDE.md §4`.

3. **15-Check-Sequenz (nicht abbrechen beim ersten Fail)** — Details in
   `AGENTS.md` §3. Reihenfolge ist nicht strikt, aber jeder Check MUSS laufen:
   - Code-Gates: #1 Vitest · #2 astro check · #3 Hex-Grep · #4 arbitrary-px-Grep
   - Content-Gates: #5 Frontmatter · #6 H2-Pattern · #7 Related-Closer · #8 ≥300 Wörter
   - SEO/a11y: #9 JSON-LD · #10 axe-core + Contrast · #11 NBSP
   - Meta: #12 Commit-Trailer · #13 Dossier-Compliance · #14 Perf-Budget · #15 hreflang
   - Soft-Warnings W1–W5 (nicht pass/fail, nur `warnings[]`-Log)

   Jeder fail sammelt `rulebook_ref` + `evidence_file` + `evidence_quote` +
   `reason` + `fix_hint`. Halluzinations-Guard: jedes `evidence_quote` muss als
   Substring im referenzierten File existieren.

4. **Evidence-Report-Write + Task-End** — Aggregiere in YAML-Frontmatter
   (`verdict`, `checks[]`, `eval_f1_last_run`, `tokens_in/out`, `duration_ms`) +
   Markdown-Body (Summary + Fails exhaustiv + Passes kompakt + Warnings + Notes):
   ```bash
   # Report schreiben
   cat > tasks/awaiting-critics/<ticket-id>/merged-critic.md <<EOF
   # ... (Template aus AGENTS.md §4) ...
   EOF

   # Regressions-Log appenden
   echo "$(date -I)|<ticket-id>|<verdict>|$failed_checks" \
     >> memory/merged-critic-log.md

   # Nach je 10 Reviews: Trend-Analyse
   review_count=$(wc -l < memory/merged-critic-log.md)
   if (( review_count % 10 == 0 )); then
     bash ../../../../evals/merged-critic/run-trend-check.sh
   fi

   # Lock entfernen NUR bei pass/fail (nicht bei partial/timeout — CEO retry)
   if [[ "$verdict" == "pass" || "$verdict" == "fail" ]]; then
     rm tasks/awaiting-critics/<ticket-id>/merged-critic.lock
   fi
   ```

## Verdict-Matrix (authoritativ)

| Passed | Failed | Verdict |
|--------|--------|---------|
| 15/15 | 0 | `pass` |
| 13–14/15 mit severity=minor | 1–2 | `partial` |
| <13/15 OR ≥1 blocker | ≥1 blocker | `fail` |
| Eval-F1 < 0.85 | — | `self-disabled` |
| Playwright/Lighthouse nicht erreichbar | — | `timeout` |

## Blocker-Recovery

| Typ | Trigger | Reaktion |
|---|---|---|
| A | Eval-Smoke F1 < 0.85 | `verdict: self-disabled` + `inbox/to-ceo/critic-drift-merged-critic.md`, kein Review |
| B | Playwright-Artifact nicht erreichbar | Check #10/#14 = `warning` (soft), `skipped_reason: playwright-unavailable` |
| C | Vitest-Flakiness (pass-fail-pass) | 3× rennen, keine Stabilität → `verdict: partial` + `flaky_test: <name>`, Lock behalten |
| D | File-Pfad im Ticket falsch | `inbox/to-ceo/invalid-review-ticket-<id>.md`, Lock behalten |
| E | 2 konsekutive Fails auf gleichem Check über dasselbe Tool | `inbox/to-ceo/rubric-review-needed-<check-id>.md` mit Hypothese |

## Split-Trigger-Watch (passive)

Du selbst löst den Split NICHT aus — der User tut das. Aber du signalisierst
früh: wenn nach deinem Report `eval_f1_last_run < 0.90` **in 5 konsekutiven
Heartbeats**, schreibst du `inbox/to-ceo/critic-trend-warning.md` mit F1-Trend +
Empfehlung "Split prüfen". CEO aggregiert, User entscheidet.

## PII / Halluzinations-Guards

- `evidence_quote` muss als Substring im File existieren (Normalisierung:
  lowercase, whitespace-collapse). Fail → Quote raus, `skipped_reason:
  quote-not-found`.
- Keine User-Identifier in `reason`/`fix_hint`-Feldern (Git-Commits haben Email
  → nur `<author>` oder Hash).

## Memory-Update

`memory/merged-critic-log.md` ist dein Regressions-Log (Lean-Format, eine Zeile
pro Review). Keine eigene Archive-Datei — der CEO aggregiert daraus den Daily-
Digest.

## Forbidden Actions (siehe TOOLS.md)

- Code fixen (Builder-Territorium)
- Tests selbst schreiben (du rennst sie nur)
- Neue Checks erfinden ohne User-Approval
- Rework-Counter incrementieren (CEO-Territorium)
- Partial-Reports als pass routen
- Halluzinierte Zitate
