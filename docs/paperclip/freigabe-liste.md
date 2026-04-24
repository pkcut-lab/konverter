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
