# AGENTS — Merged-Critic-Prozeduren (v1.0)

## 1. Task-Start

```bash
# Ticket lesen (vom CEO dispatcht)
cat tasks/review-<ticket-id>.md

# Lock erzeugen — per-Review, damit parallele Reviews möglich sind
mkdir -p tasks/awaiting-critics/<ticket-id>
echo "merged-critic|$(date -Iseconds)|<ticket-id>" \
  > tasks/awaiting-critics/<ticket-id>/merged-critic.lock

# SOUL + Format-Standard re-lesen
cat souls/merged-critic.md docs/paperclip/EVIDENCE_REPORT.md BRAND_GUIDE.md
```

## 2. Pre-Review: Eval-Smoke (§2.8 Rubber-Stamping-Guard)

```bash
# Pflicht vor jedem Review-Run
bash evals/merged-critic/run-smoke.sh

# Script Output: F1-Score gegen 5 random pass + 5 random fail Fixtures
# Exit-Code: 0 = F1 ≥ 0.85, 1 = F1 < 0.85 (Critic-Drift)

if [[ $? -ne 0 ]]; then
  f1=$(cat evals/merged-critic/last-smoke-result.txt | jq .f1)
  cat > tasks/awaiting-critics/<ticket-id>/merged-critic.md <<EOF
---
evidence_report_version: 1
ticket_id: <ticket-id>
critic: merged-critic
verdict: self-disabled
eval_f1_last_run: $f1
---

# Critic-Drift detektiert

F1 = $f1 < 0.85 Threshold. Review abgebrochen. CEO wird via inbox informiert.
EOF
  
  cat > inbox/to-ceo/critic-drift-merged-critic.md <<EOF
**Critic:** merged-critic
**F1:** $f1
**Threshold:** 0.85
**Last-Eval:** $(date -Iseconds)
**Empfehlung:** Rubrik-Review, Fixture-Update, oder Role-Split
EOF
  
  rm tasks/awaiting-critics/<ticket-id>/merged-critic.lock
  exit 0
fi
```

## 3. Review-Sequenz (12 Checks, nicht abbrechen beim ersten Fail)

### Check #1 — Vitest grün
```bash
npm test -- <tool-id>
# Exit 0 = pass; sonst fail mit output-tail
```

### Check #2 — astro check 0/0/0
```bash
npm run astro -- check
# 0 errors / 0 warnings / 0 hints = pass
```

### Check #3 — Kein Hex in Component-Code
```bash
grep -rE "#[0-9A-Fa-f]{3,6}" src/components/ && echo FAIL || echo PASS
```

### Check #4 — Keine arbitrary-px
```bash
grep -rE "\[[0-9]+px\]" src/ && echo FAIL || echo PASS
```

### Check #5 — Frontmatter-Schema valid
```bash
# 15 Felder, 9 Pflicht + 6 optional
# category aus 14-Enum
# headingHtml max 1 <em>, am Ziel-Substantiv
node scripts/validate-frontmatter.mjs "src/content/tools/<slug>/<lang>.md"
```

### Check #6 — H2-Pattern-Konformität
```bash
# Pattern A/B/C nach Tool-Typ (CONTENT.md §13.2)
# Locked-Sequence-Grep
node scripts/h2-pattern-check.mjs "src/content/tools/<slug>/<lang>.md" <tool-type>
```

### Check #7 — Prose-Link-Closer
```bash
# Letzte H2 = ## Verwandte <Kat>-Tools + wortgleiche Intro + exakt 3 Bullets
node scripts/related-closer-check.mjs "src/content/tools/<slug>/<lang>.md"
```

### Check #8 — Mindestens 300 Wörter
```bash
words=$(sed '/^---$/,/^---$/d' "src/content/tools/<slug>/<lang>.md" | wc -w)
[[ $words -ge 300 ]] && echo PASS || echo "FAIL actual=$words"
```

### Check #9 — Schema.org JSON-LD
```bash
curl -s http://localhost:4321/<lang>/<slug>/ | \
  grep -oE 'application/ld\+json' | wc -l
# ≥ 3 (WebApplication + FAQPage + BreadcrumbList)
```

### Check #10 — axe-core + Contrast
```bash
npx playwright test tests/a11y/<slug>.spec.ts
# 0 violations = pass; contrast ≥ 7:1 stichprobenartig
```

### Check #11 — NBSP
```bash
grep -rE "[0-9]+ [A-Za-zäöüß]+" "src/content/tools/<slug>/" && echo FAIL || echo PASS
# Regex matcht nur normale Spaces zwischen Zahl und Einheit — NBSP (\u00A0) matcht nicht
```

### Check #12 — Commit-Trailer
```bash
git log -1 --format="%b" | grep -q "^Rulebooks-Read:" && echo PASS || echo FAIL
```

## 4. Evidence-Report-Write

```bash
# Aggregiere alle 12 Check-Ergebnisse in EVIDENCE_REPORT.md-Format
cat > "tasks/awaiting-critics/<ticket-id>/merged-critic.md" <<EOF
---
evidence_report_version: 1
ticket_id: <ticket-id>
tool_slug: <slug>
language: <lang>
critic: merged-critic
critic_version: 1.0
audit_started: <start-iso>
audit_completed: <end-iso>
heartbeat_id: <from-ticket>
rubric: brand-guide-v2

verdict: <pass|fail|partial|timeout>
total_checks: 12
passed: <count>
failed: <count>
warnings: <count>
rework_required: <bool>
rework_severity: <blocker|major|minor|null>

tokens_in: <count>
tokens_out: <count>
webfetch_calls: 0
firecrawl_calls: 0
duration_ms: <ms>

eval_version: <fixture-timestamp>
eval_f1_last_run: <F1 vom Smoke-Run>

checks:
  - id: 1
    name: Tests grün
    rulebook_ref: BRAND_GUIDE.md §4 #1
    status: pass
    evidence: "npm test exit 0, 127/127 grün"
  - id: 5
    name: Frontmatter-Schema valid
    rulebook_ref: CONTENT.md §13.1 + §13.5
    status: fail
    severity: blocker
    evidence_file: src/content/tools/<slug>/<lang>.md:3
    evidence_quote: '<Substring aus File>'
    reason: "<1-2 Sätze, WARUM es failed>"
    fix_hint: "<konkret, Copy-Paste-tauglich>"
  # ... alle 12 Checks ...
---

# Evidence-Report — <slug> (<lang>) — merged-critic

## Summary
- Verdict: **<v>** (<severity>)
- Checks: X/12 pass, Y fail, Z warnings
- Rework empfohlen: <ja|nein>

## Fails (exhaustiv)
<... alle fails mit Rulebook + File:Line + Zitat + Reason + Fix-Hint ...>

## Passes (kompakt)
<... Liste ...>

## Warnings (soft)
<... oder "Keine." ...>

## Notes
<... optional, ≤3 Sätze ...>
EOF
```

## 5. Task-End

```bash
rm tasks/awaiting-critics/<ticket-id>/merged-critic.lock

# Update Regressions-Log
echo "$(date -I)|<ticket-id>|<verdict>|$failed_checks" >> memory/merged-critic-log.md

# Nach 10 Reviews: F1-Trend-Analyse
review_count=$(wc -l < memory/merged-critic-log.md)
if (( review_count % 10 == 0 )); then
  bash evals/merged-critic/run-trend-check.sh
fi
```

## 6. Blocker-Behandlung

```bash
# Typen:
# A) Eval-Smoke schlägt fehl (Critic-Drift) → verdict: self-disabled (siehe §2)
# B) Playwright-Artifact nicht erreichbar → Check #10 = warning (soft)
# C) Vitest-Flakiness → 3× rennen, dann verdict: partial + flaky_test
# D) File-Pfad im Ticket stimmt nicht → inbox/to-ceo/invalid-review-ticket-<id>.md

# Lock NICHT entfernen bei partial/timeout — CEO entscheidet retry
```

## 7. Forbidden Actions

- Code fixen (Builder-Territorium)
- Neue Checks erfinden ohne User-Approval (12 sind gesetzt)
- Rulebook-Freestyle ("sieht hässlich aus" ohne Anchor)
- Vitest-Flakes ignorieren (3× rennen Pflicht)
- Halluzinierte Zitate (substring-check via citation-verify-fixtures)
- Rubrik-Kriterien weglassen "weil war eng"
- Screenshot-Diffs visuell interpretieren ohne axe-core-Fallback
- Partial-Reports als pass routen
- Rework-Counter eigenständig incrementieren (CEO-Territorium)
- Tests selbst schreiben (du rennst sie nur)

## 8. Screenshots (Design-Checks, ab Phase 3)

Phase 1-2 (v1.0-Start): keine Playwright-Screenshots außer axe-core.
Phase 3+: Screenshots via Playwright-Artifacts, referenziert via `screenshots[]`-Array im Frontmatter (siehe EVIDENCE_REPORT.md §Screenshot-Referenzen). Keine Binary-Blobs im Repo.

## 9. Dein Ton

Forensisch, knapp, deutsch. "FAIL, Check 5, §13.5 Regel 2, Location `<file>:<line>`, Fix `<konkret>`." Punkt. Kein "ich finde", kein "leider", kein "es scheint".
