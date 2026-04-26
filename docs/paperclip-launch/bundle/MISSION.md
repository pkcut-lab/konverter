# MISSION — kittokit-launch

**Sprint-Ziel:** kittokit produktionsreif machen. Alle 11 Launch-Tasks (T5-T15) abschließen, jeden Output reviewen + auto-korrigieren, finalen Bericht in `LAUNCH_REPORT.md` schreiben.

**Status der existing kittokit Company:** PAUSIERT via `.paperclip/EMERGENCY_HALT`. Reaktivierung erst nach Launch-Sprint-Ende.

**Sprint-Start:** 2026-04-26 04:47 UTC
**Sprint-Deadline:** Best-Effort, Launch-Coordinator entscheidet Reihenfolge anhand Abhängigkeiten

---

## Task-Liste mit Abhängigkeiten + Ownership

| ID | Task | Owner-Agent | Reviewer | Dep | Status |
|----|------|-------------|----------|-----|--------|
| T5 | Datenschutz + Impressum (DE+EN) | (existing kittokit-legal-auditor — extern, nicht in dieser Company) | quality-reviewer | — | externe Pipeline |
| T6 | Cookie-Banner (Refined Minimalism) | cookie-consent-builder | quality-reviewer | T5 | pending |
| T7 | JSON-LD per Tool (SoftwareApp/HowTo/FAQ/Breadcrumb) | jsonld-enricher | quality-reviewer | — | pending |
| T8 | Performance + Core Web Vitals Audit + Fix | perf-auditor | quality-reviewer | — | pending |
| T9 | WCAG 2.2 AAA Accessibility Audit + Fix | a11y-auditor | quality-reviewer | — | pending |
| T10 | 404/500 Error-Pages + Sitemap + robots.txt | error-pages-builder | quality-reviewer | — | pending |
| T11 | Cloudflare Web Analytics + Microsoft Clarity Setup | cf-infra-engineer | quality-reviewer | T6 | pending |
| T12 | Open-Graph-Bilder pro Tool + Brand-Asset-Audit | og-image-generator | quality-reviewer | — | pending |
| T13 | Email Routing @kittokit.com via Cloudflare | cf-infra-engineer | quality-reviewer | — | pending |
| T14 | Search Console + Bing Webmaster Setup | cf-infra-engineer | quality-reviewer | T10, **kittokit.com live** | conditional-pending |
| T15 | AdSense-Approval-Vorbereitung Checklist | adsense-prep-checker | quality-reviewer | T5, T6, T8, T11 | pending |

---

## Hard-Constraints (überstimmen JEDE Agent-Default-Behavior)

1. **CLAUDE.md Non-Negotiables** sind binding — refined-minimalism, tokens-only, AAA-Contrast, pure-client, DSGVO, kein Server-Upload (Ausnahme 7a)
2. **Astro 5 SSG + Svelte 5 Runes + Tailwind** — keine React/Next.js-Imports
3. **Git-Account-Lock:** nur `pkcut-lab`. Pre-Commit `bash scripts/check-git-account.sh` Pflicht
4. **Test-Gates:** `npm run check` 0/0/0 + `npx vitest run` 100% pass nach jedem Commit
5. **Surgical Changes:** ein Commit = ein logisches Stück, keine Mix-Commits
6. **Quality-Reviewer ist nicht optional:** jede Worker-Output muss durch quality-reviewer-Pass, bevor T-Status auf "done" geht

## Reporting-Pflicht

Jeder Worker schreibt nach Task-Abschluss in `LAUNCH_REPORT.md`:
- T-ID + Task-Name
- Was wurde geändert (file paths, line counts)
- Verifikations-Output (test results, build status)
- Bekannte Restschulden (klar markiert)
- Übergabe an quality-reviewer (Reviewer schreibt eigenen Block "Review-Pass <ts>")

Quality-Reviewer schreibt NACH Review:
- Verdict: ✅ approved | 🟡 corrected (mit Fix-Diff) | ❌ rework needed
- Bei 🟡: führt Korrektur SOFORT aus, dann re-verifiziert
- Bei ❌: blockt Task, eskaliert via inbox/to-launch-coordinator/

Launch-Coordinator schreibt täglich (oder nach 3 Task-Closes) eine Status-Zeile am Top von `LAUNCH_REPORT.md`.

## Definition of Done (gesamtes Sprint)

- ✅ T5-T13, T15 alle approved (quality-reviewer ✅ verdict)
- 🟡 T14 conditional — wartet auf kittokit.com live (User-Decision); blockiert Sprint-Ende NICHT
- LAUNCH_REPORT.md final-pass durch launch-coordinator
- `git log --oneline` zeigt sprint-Commits unter pkcut-lab
- `npm run check` + `npx vitest run` grün

Sprint-Ende-Signal: launch-coordinator schreibt `inbox/to-user/SPRINT_DONE.md` mit Bullet-Liste was abgehakt wurde + Liste der 14er-Restschuld + nächsten User-Aktionen.
