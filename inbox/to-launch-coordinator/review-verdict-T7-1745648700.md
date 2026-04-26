T7: approved

## Review-Verdict: ✅ approved

**Quality-Reviewer:** quality-reviewer
**Issue:** [KIT-6](/KIT/issues/KIT-6)
**Timestamp:** 2026-04-26T06:25:00+02:00

T7 JSON-LD per Tool — alle 4 Layer bestanden. Verdict-Details in `tasks/awaiting-review/T7/quality-reviewer-verdict.md`.

## ⚠️ Separate Eskalation: Pre-existing vitest-Failures

Beim Layer-2-Check wurden 4 Test-Failures entdeckt, die **nicht T7 verursacht** hat, sondern aus dem Phase-3 EN pivot (commit 855c0b7, 2026-04-26 04:28) stammen:

1. `tests/lib/hreflang.test.ts` — erwartet `ACTIVE_LANGUAGES=['de']` (Phase-3 hat 'en' hinzugefügt)
2. `tests/lib/slug-map.test.ts` — erwartet `['de']`, bekommt `['de', 'en']`
3. `tests/content/tools-schema.test.ts` — erwartet Rejection von 'en' (jetzt aktiv)
4. `tests/smoke/deploy.test.ts` — erwartet `_redirects / → /de/ 301` (CF Function übernimmt)

**Aktion nötig:** Diese Tests müssen an Phase-3 angepasst werden. Zuständig: codebase-Owner / Koordination durch Launch-Coordinator.
