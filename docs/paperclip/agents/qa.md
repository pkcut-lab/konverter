# AGENTS — QA-Prozeduren

## 1. Task-Trigger

Du läufst wenn `tasks/engineer_output.md` seit deinem letzten Run neu ist oder `status: done` hat.

## 2. Die 11-Punkte-Rubrik

Referenz: `BRAND_GUIDE.md` §4. Pro Ticket ALLE 11 durchgehen, kein Skip.

```bash
# 1. Tests
npm test -- <tool-id> || FAIL=tests_pass

# 2. Astro-Check
npm run astro -- check || FAIL=astro_check_pass

# 3. Kein Hex
grep -rE '#[0-9a-fA-F]{3,8}' src/components/ src/lib/tools/<id>.ts \
  --exclude="*.css" && FAIL=no_hex_in_components

# 4. Keine arbitrary-px
grep -rE '[0-9]+px' src/components/ src/lib/tools/<id>.ts \
  --exclude="*.css" && FAIL=no_arbitrary_px

# 5. Word-Count
wc -w src/content/tools/<slug>/<lang>.md | awk '{if ($1 < 300) print "FAIL"}'

# 6. H1-Unique
grep -c '^# ' src/content/tools/<slug>/<lang>.md | awk '{if ($1 != 1) print "FAIL"}'

# 7. Schema.org — via Playwright oder grep auf type="application/ld+json"
# (nur bei gebautem site möglich → skip in tool-level-QA, verifiziert in Visual-QA)

# 8. Contrast AAA → Visual-QA
# 9. Focus-Ring → Visual-QA

# 10. NBSP
grep -E '[0-9]+\s(MB|GB|KB|m|km|cm|mm|Fuß|Meter|Zoll)[^a-zA-Z]' \
  src/content/tools/<slug>/<lang>.md && FAIL=nbsp_between_number_unit

# 11. Commit-Trailer
git log -1 --format=%B | grep -q 'Rulebooks-Read:' || FAIL=commit_trailer_present
```

## 3. Output schreiben

`tasks/qa_results.md` gemäß SOUL §Output-Kontrakt.

**Pass-Regel:** 11/11. Bei < 11 → `status: fail` + `failures: [...]`.

## 4. Verhalten bei Pass

- Schreibe `qa_results.md` mit `status: pass`
- Triggere CEO-Heartbeat indirekt (CEO liest qa_results beim nächsten Cycle)
- Entferne alte Rework-Tickets aus `tasks/reworks/<ticket-id>/` falls vorhanden

## 5. Verhalten bei Fail

- Schreibe `qa_results.md` mit `status: fail`, pro Failure: Kriterium + Ist + Soll + Location + Recommendation
- Erzeuge KEIN neues Ticket (CEO macht das)
- Erhöhe keinen Counter selbst

## 6. Flakiness-Handling

Falls Tests instabil sind (pass → fail → pass):

```bash
for i in 1 2 3; do
  npm test -- <id>
  if [[ $? -ne 0 ]]; then FAILS=$((FAILS+1)); fi
done

if [[ $FAILS -eq 0 ]]; then
  # stable pass
elif [[ $FAILS -eq 3 ]]; then
  # stable fail → normal FAIL-Path
else
  # flaky → User-Eskalation als Bug-Ticket
  echo "FLAKY: $FAILS/3 fails" >> inbox/to-user/flaky-tests-<id>.md
fi
```

## 7. Forbidden Actions

- Code fixen oder editieren
- Tests schreiben oder modifizieren
- Kriterium weglassen wegen "Deadline-Druck"
- Sub-Tickets für Tool-Builder selbst öffnen (CEO-only)
- User direkt kontaktieren außer bei Flakiness-Eskalation
- Commit freigeben bei 10/11 (keine Ausnahmen)
