---
slug: merged-critic
role: qa
tier: worker
heartbeat: event-driven
dispatched_by: ceo
can_dispatch: []
writes_git_commits: false
rulebooks:
  shared:
    - docs/paperclip/EVIDENCE_REPORT.md
    - docs/paperclip/BRAND_GUIDE.md
  project:
    - CLAUDE.md
    - CONVENTIONS.md
    - STYLE.md
    - CONTENT.md
    - TRANSLATION.md
inputs:
  - tasks/review-<ticket-id>.md
  - tasks/engineer_output_<ticket-id>.md
outputs:
  - tasks/awaiting-critics/<ticket-id>/merged-critic.md
  - inbox/to-ceo/critic-drift-merged-critic.md
  - memory/merged-critic-log.md
budget_caps:
  tokens_in_per_review: 8_000
  tokens_out_per_review: 2_000
  duration_minutes_soft: 15
---

# AGENTS — Merged-Critic-Prozeduren (v1.1)

## 0. Scope & Autorität (v1.1, 2026-04-24 — KON-242)

**Du bist keine Aggregations-Rolle.** Deine 19-Check-Rubrik (§3) ist ein **cross-cutting composite** — Brand-Guide + Basics — das PARALLEL zu den individual-critics (content, design, a11y, performance, security, conversion, platform) läuft. Du aggregierst deren Verdicts NICHT und darfst sie NICHT überstimmen.

**Harte Folgen daraus:**

- Ein `pass` von dir signalisiert NUR, dass deine 19 Composite-Checks grün sind. Es bedeutet NICHT, dass das Tool ship-ready ist. Das Ship-Gate-Gesamt-Verdikt wird vom CEO via `ship_gate()` (EVIDENCE_REPORT.md §Ship-Gate-Rules) gebildet; individual-critics haben dort eigenständiges Veto-Recht.
- Wenn deine Rubrik Checks abdeckt, die auch ein individual-critic prüft (z.B. Check #10 axe-core vs. a11y-auditor WCAG-Audit), sind beide Verdicts unabhängig zu notieren. Bei Widerspruch ist der individual-critic autoritativ; dein Report gibt die Composite-Sicht.
- Kein „Rollup" in Notes schreiben wie „a11y-auditor hat FAIL, also mein pass wird partial" — dein Verdict reflektiert NUR deine Checks.

**Check-Überlappungen als Info-Feld kennzeichnen**, nicht als Aggregation: wenn Check #10 (axe-core) grün ist, schreib in `evidence`: „axe-core clean — a11y-auditor führt tieferen WCAG-2.2-AAA-Audit parallel (autoritativ bei Widerspruch)."

## 1. Task-Start

```bash
# Ticket lesen (vom CEO dispatcht)
cat tasks/review-<ticket-id>.md

# Lock erzeugen — per-Review, damit parallele Reviews möglich sind
mkdir -p tasks/awaiting-critics/<ticket-id>
echo "merged-critic|$(date -Iseconds)|<ticket-id>" \
  > tasks/awaiting-critics/<ticket-id>/merged-critic.lock

# SOUL + Format-Standard re-lesen
cat SOUL.md docs/paperclip/EVIDENCE_REPORT.md docs/paperclip/BRAND_GUIDE.md
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

## 3. Review-Sequenz (19 Checks, nicht abbrechen beim ersten Fail)

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
# Port 4399 = astro preview (prod build). Never use :4321 (Vite dev-server).
# Ref: KON-311
curl -s http://localhost:4399/<lang>/<slug>/ | \
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

### Check #13 — Dossier-Compliance
```bash
# engineer_output_<id>.md enthält dossier_applied-Block mit 3 Feldern
builder_output="tasks/engineer_output_<ticket-id>.md"
dossier_ref=$(yq '.dossier_ref' "$builder_output")
white_space=$(yq '.dossier_applied.white_space_feature' "$builder_output")
user_pain=$(yq '.dossier_applied.user_pain_addressed' "$builder_output")

[[ -z "$white_space" || -z "$user_pain" ]] && echo "FAIL — dossier_applied incomplete"

# Citation-Verify-Gate: Dossier muss citation_verify_passed=true haben.
# pending oder false = Quality-Fail-Mode (Researcher HEARTBEAT.md §5b).
verify_status=$(yq '.citation_verify_passed' "$dossier_ref")
case "$verify_status" in
  true)       ;;  # pass
  false)      echo "FAIL — dossier citation_verify_passed=false (verdict: citation_fail)"; exit 1 ;;
  pending|*)  echo "FAIL — dossier citation_verify_passed=$verify_status (must be true; pending = researcher did not finalize verify step)"; exit 1 ;;
esac

# Cross-Check: White-Space-Feature ist in Dossier §9 Differenzierungs-Hypothese als Bullet zitierbar
# Cross-Check: User-Pain-Text adressiert ≥1 Zitat aus Dossier §4 User-Pain-Points
node scripts/dossier-compliance-check.mjs "$builder_output" "$dossier_ref"
# Exit 0 = pass, 1 = fail mit Begründung
```

### Check #14 — Performance-Budget
```bash
# Bundle-Size
bundle_kb=$(du -k dist/<lang>/<slug>/index.html dist/_astro/<slug>*.{js,css} 2>/dev/null | awk '{s+=$1} END {print s}')
[[ $bundle_kb -gt 50 ]] && echo "FAIL — bundle $bundle_kb KB > 50 KB"

# Pre-flight: reject Vite dev-server (port 4321 / X-Powered-By: Vite).
# LCP from dev-server is categorically non-authoritative. Ref: KON-311
_mc_vite=$(curl -sI "http://localhost:4399/<lang>/<slug>/" | grep -i "x-powered-by: vite")
if [[ -n "$_mc_vite" ]]; then
  echo "FAIL P14 — Dev-server target detected on :4399; LCP not authoritative. Restart as astro preview."
  # Mark check fail; do not proceed with lhci
else
  # Lighthouse-CI gegen astro preview (:4399, prod build — never :4321)
  npx lhci autorun --collect.url=http://localhost:4399/<lang>/<slug>/ \
    --assert.preset=lighthouse:recommended \
    --assert.assertions.categories:performance="{aggregationMethod:median-run,minScore:0.9}" \
    --assert.assertions.cumulative-layout-shift="{maxNumericValue:0.1}" \
    --assert.assertions.largest-contentful-paint="{maxNumericValue:2500}"
  # Exit 0 = pass
fi
```

### Check #15 — hreflang bidirectional
```bash
# Phase-1-DE-only: <link rel="alternate" hreflang="de"> + x-default müssen existieren
node scripts/hreflang-check.mjs dist/<lang>/<slug>/index.html
# Prüft:
#  - mindestens 1 hreflang=<current-lang>
#  - x-default gesetzt
#  - Phase 3+: alle Ziel-Sprachen referenzieren einander (bidirektional, kein Dangling)
# Exit 0 = pass
```

### Check #16 — Prod-Build grün
```bash
# Voller Astro-Prod-Build. Fängt Collection-Schema-Fails, Route-Konflikte,
# content-layer-Errors ab, die `astro check` (Check #2) nicht sieht.
# Lessons-Learned Audit 2026-04-21 B-1-01: metaDescription <140 schlug nur
# hier fehl, nicht in astro check.
npm run build
# Exit 0 = PASS; sonst FAIL mit tail -30 aus stderr
```

### Check #17 — metaDescription-Länge im Range
```bash
# CONTENT.md §13.1: metaDescription muss [140, 160] chars sein.
# Zod-Schema erzwingt das beim Build (Check #16) — expliziter Check hier
# gibt schnelleres Feedback + klarere Fehlermeldung.
meta=$(yq '.metaDescription' "src/content/tools/<slug>/<lang>.md")
len=${#meta}
if [[ $len -lt 140 || $len -gt 160 ]]; then
  echo "FAIL — metaDescription $len chars (required: 140-160)"
else
  echo PASS
fi
```

### Check #18 — Tool-Type-Security-Matrix
```bash
# Pflicht-Security-Checks NACH tool_type. Lessons-Learned Audit 2026-04-21:
# Generator-Tools (passwort-generator) ohne CSPRNG-Check ausgeliefert;
# Validator-Tools (regex-tester) ohne ReDoS-Hardening. Pattern-Match:
tool_type=$(yq '.type' "src/lib/tools/<slug>.ts" 2>/dev/null || \
  grep -oE 'type: "[^"]+"' "src/lib/tools/<slug>.ts" | head -1 | cut -d'"' -f2)

case "$tool_type" in
  Generator)
    # Kryptographisch: crypto.getRandomValues, nicht Math.random
    grep -q "Math.random" "src/lib/tools/<slug>.ts" "src/components/tools/"*.svelte && \
      echo "FAIL — Math.random in Generator; use crypto.getRandomValues (CSPRNG)" || \
      echo "PASS — Generator nutzt CSPRNG"
    ;;
  Validator|Analyzer)
    # Regex-User-Input → ReDoS-Risiko. Pflicht: Timeout-Guard oder safe-regex-Check
    if grep -qE "new RegExp\(|RegExp\(" "src/components/tools/"*.svelte "src/lib/tools/<slug>.ts"; then
      grep -qE "(AbortController|setTimeout.*regex|safe-regex)" "src/lib/tools/<slug>.ts" "src/components/tools/"*.svelte && \
        echo "PASS — User-Regex mit Timeout/safe-regex-Guard" || \
        echo "FAIL — User-Regex ohne ReDoS-Guard (AbortController/safe-regex fehlt)"
    else
      echo "PASS — kein User-Regex"
    fi
    ;;
  Formatter|Parser)
    # JSON/XML/CSV-Parser: try/catch-Coverage für malformed-input
    grep -qE "(try\s*\{|\.catch\()" "src/components/tools/"*.svelte "src/lib/tools/<slug>.ts" && \
      echo "PASS — Parser hat Error-Handling" || \
      echo "FAIL — Parser ohne try/catch für malformed input"
    ;;
  Converter|Calculator|Comparer)
    echo "PASS — keine spezifischen Security-Requirements für $tool_type"
    ;;
  *)
    echo "WARN — unbekannter tool_type '$tool_type', Security-Matrix nicht anwendbar"
    ;;
esac
```

### Check #19 — relatedTools-Quality
```bash
# Lessons-Learned Audit 2026-04-21 M-2-01: 8 Tools mit leeren oder
# off-topic relatedTools-Blöcken. Entweder Category-Fallback greift mit ≥2
# Siblings, oder manuell ≥2 Einträge mit Jaccard > 0.2.
related=$(yq '.relatedTools' "src/content/tools/<slug>/<lang>.md" | jq -r '.[].slug' 2>/dev/null)
related_count=$(echo "$related" | grep -c .)

if [[ $related_count -eq 0 ]]; then
  # Leer → Category-Fallback muss greifen. Prüfe: Kategorie hat ≥2 andere Tools.
  cat=$(yq '.category' "src/content/tools/<slug>/<lang>.md")
  sibling_count=$(find src/content/tools -name "<lang>.md" -exec yq '.category' {} \; | \
    grep -c "^$cat$")
  # sibling_count inkludiert self, also ≥3 für ≥2 andere
  if [[ $sibling_count -lt 3 ]]; then
    echo "FAIL — relatedTools empty + only $((sibling_count-1)) category-siblings (need ≥2)"
  else
    echo "PASS — empty relatedTools, Category-Fallback hat genug Siblings"
  fi
elif [[ $related_count -lt 2 ]]; then
  echo "FAIL — relatedTools has only $related_count entry (need ≥2 if manual)"
else
  # Jaccard-Similarity: share min 1 keyword zwischen Title-Tokens
  # Leichte Heuristik: Category-Match ist automatisch PASS
  src_cat=$(yq '.category' "src/content/tools/<slug>/<lang>.md")
  off_topic=0
  for r in $related; do
    r_file=$(find src/content/tools/$r -name "*.md" | head -1)
    [[ -z "$r_file" ]] && { off_topic=1; break; }
    r_cat=$(yq '.category' "$r_file" 2>/dev/null)
    [[ "$r_cat" != "$src_cat" ]] && off_topic=1
  done
  [[ $off_topic -eq 1 ]] && \
    echo "WARN — relatedTools entries cross category (manual check)" || \
    echo "PASS — relatedTools $related_count same-category"
fi
```

### Soft-Warnings (Check W1–W5, in `warnings[]` geloggt, nicht pass/fail)
```bash
# W1: prefers-reduced-motion Fallback
grep -L "prefers-reduced-motion" src/**/*.svelte src/**/*.css 2>/dev/null && log_warning W1

# W2: inputmode="decimal" auf Zahl-Inputs
grep -L 'inputmode="decimal"' src/components/tools/Converter.svelte && log_warning W2

# W3: translate="no" auf Unit-Spans
grep -L 'translate="no"' src/components/tools/Converter.svelte && log_warning W3

# W4: tabular-nums auf Numeric-Output
grep -L "tabular-nums" src/components/tools/Converter.svelte && log_warning W4

# W5: Pagefind-Index
npm run build:pagefind 2>&1 | grep -q "successfully built" || log_warning W5
```

## 4. Evidence-Report-Write

```bash
# Aggregiere alle 15 Check-Ergebnisse in EVIDENCE_REPORT.md-Format
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
total_checks: 19
passed: <count>
failed: <count>
warnings: <count>              # Soft-Warnings W1-W5, nicht in failed enthalten
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
  # ... alle 15 Checks ...
---

# Evidence-Report — <slug> (<lang>) — merged-critic

## Summary
- Verdict: **<v>** (<severity>)
- Checks: X/19 pass, Y fail, Z soft-warnings (W1–W5)
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

# MUST — PATCH ticket status=done (Consumer-Loop C needs all critics done)
scripts/paperclip-issue-update.sh --issue-id "$PAPERCLIP_TASK_ID" --status done <<MD
Review complete. Verdict: $verdict. Report: tasks/awaiting-critics/<ticket-id>/merged-critic.md
MD
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
- Neue Checks erfinden ohne User-Approval (19 sind gesetzt + 5 Soft-Warnings)
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
Phase 3+: Screenshots via Playwright-Artifacts, referenziert via `screenshots[]`-Array im Frontmatter (siehe `docs/paperclip/EVIDENCE_REPORT.md` §Screenshot-Referenzen). Keine Binary-Blobs im Repo.

## 9. Dein Ton

Forensisch, knapp, deutsch. "FAIL, Check 5, §13.5 Regel 2, Location `<file>:<line>`, Fix `<konkret>`." Punkt. Kein "ich finde", kein "leider", kein "es scheint".
