# Archived SOULs

Diese SOUL-Files wurden in v1.0 (2026-04-20) aus dem aktiven Set entfernt. Historisch aufbewahrt, damit der Audit-Trail nachvollziehbar bleibt — NICHT von CEO/Builder/Critic referenzieren.

## qa.md

**Archiviert:** 2026-04-20  
**Grund:** Subsumiert in `../merged-critic.md` als Teil der 4-Rollen-Core-Architektur. Die 12-Check-Rubrik des Merged-Critic deckt alle vormals getrennten QA-Kriterien ab (Tests, astro-check, Hex-Scan, arbitrary-px, Content-min-300, H1-unique, Schema.org, Contrast, Focus-Ring, NBSP, Commit-Trailer) plus 1 zusätzlichen Pattern-A-H2-Check. Re-Split ist Option bei 200+ aktiven Tools oder F1-Drift (siehe `research/2026-04-20-multi-agent-role-matrix.md` §6.1 Action #14).

## visual-qa.md

**Archiviert:** 2026-04-20  
**Grund:** In v0.9 redundant neben a11y-Auditor + Design-Critic vorgesehen; v1.0-Audit-Trail des Research-Reports identifizierte den Scope-Overlap. Visual-QA-Aufgaben (Screenshot-Diffs, Contrast-Audits) laufen ab Phase 3 im Merged-Critic-Check #10 (axe-core + Contrast) via Playwright — bis dahin nicht aktiv.
