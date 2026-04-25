# Freigabe-Liste — Ship-Ready Tools (v1.0)

**Zweck.** Append-only Liste aller Tools, die den End-Reviewer-Triple-Pass
(`docs/paperclip/bundle/agents/end-reviewer/AGENTS.md`) mit `verdict=clean`
in Pass 3 absolviert haben.

**Semantik.** Ein Eintrag hier bedeutet: das Tool ist **ship-ready** aus
unabhängiger Deep-Review-Sicht. Der Schritt danach ist `route_to_deploy_queue`
(CEO §7) → Post-Deploy-List-Append in `docs/completed-tools.md` (CEO §7.5).

**Editier-Policy.**
- Nur der `end-reviewer`-Agent darf appendieren, und nur wenn `pass_number=3`
  und `verdict=clean` im Verdict-File stehen.
- Kein Duplicate-Slug (Pre-Check im Agent).
- Kein Remove außer durch User (z.B. bei Regression-Rollback nach Post-Deploy-
  Audit).
- Reihenfolge = Append-Reihenfolge (Freigabe-Datum, älteste oben).

**Kolonnen-Konvention.**
- `#` — fortlaufende Nummer (letzte Zeile +1)
- `Slug` — URL-Slug (deutsch), z.B. `meter-zu-fuss`
- `Pass-3-Date` — ISO-Datum des Pass-3-Clean-Verdicts
- `Pass-3-Report` — Pfad zum Verdict-File (`tasks/end-review-<slug>-pass3.md`)
- `Build-Commit` — SHA des Tool-Build-Commits, der freigegeben wurde
- `Status` — `ready-for-ship` (default), `shipped` (nach Deploy-Append),
  `rolled-back` (User-Override bei Post-Deploy-Regression)

## Freigabe-Tabelle

| # | Slug | Pass-3-Date | Pass-3-Report | Build-Commit | Status |
|---|------|-------------|---------------|--------------|--------|
| 1 | tilgungsplan-rechner | 2026-04-24 | tasks/end-review-tilgungsplan-rechner-pass3.md | f2d7a37 | shipped |
| 2 | zinsrechner | 2026-04-25 | tasks/end-review-zinsrechner-pass3.md | c1e6549 | shipped |
| 3 | skonto-rechner | 2026-04-25 | tasks/end-review-skonto-rechner-pass3.md | 273e12c | ready-for-ship |
| 4 | webcam-hintergrund-unschaerfe | 2026-04-25 | tasks/end-review-webcam-hintergrund-unschaerfe-pass3.md | 4e69d07b | ready-for-ship |
| 5 | sprache-verbessern | 2026-04-25 | tasks/end-review-sprache-verbessern-pass3.md | 5132d15 | ready-for-ship |
