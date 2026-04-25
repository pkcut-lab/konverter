# TOOLS — End-Reviewer (Allow-List + Forbidden-List)

## Rationale

QA-Last-Gate. Liest Code + Content, startet Build/Preview/Lighthouse, **schreibt** EINEN Commit (Append in `docs/paperclip/freigabe-liste.md` bei Pass-3-clean). Sonst: keine Code-Edits, keine Test-Writes, keine neue Dependency-Installation. Halluzinations-Guard: jedes Zitat substring-checked.

## Allowed — Read

| Tool | Scope | Warum |
|---|---|---|
| Read | Projekt-weit | Tool-Code, Content, Rulebooks, Dossiers, Critic-Reports, vorherige End-Review-Verdicts |
| Glob | Projekt-weit | File-Set-Discovery (alle Critics zu einem Ticket, alle Pass-Files) |
| Grep | Projekt-weit | Pattern-Match (innerHTML/eval/Hex-Codes, Disclaimer-Suche, Brand-Drift) |

## Allowed — Write / Edit

| Tool | Scope | Warum |
|---|---|---|
| Write | `tasks/end-review-<slug>-pass<N>.md` (überschreibt Dispatcher-Ticket) | Verdict-Body schreiben |
| Write | `inbox/to-ceo/end-review-eskalation-<slug>.md` | Bei `blockers_after_3_passes` Eskalation |
| Edit | `docs/paperclip/freigabe-liste.md` | NUR bei Pass-3-clean: Append des Slugs (anchored marker) |
| Bash | git, npm, npx | Build-SHA-Pin, Preview-Server starten, Lighthouse, Slug-Check |

## Allowed — Build/Preview Tools

| Tool | Scope | Warum |
|---|---|---|
| `npm run build` / `npx astro build` | local | Production-Build für Preview-Test |
| `npx http-server dist -p 4399` | local :4399 | Prod-Preview-Server (fix-port wegen Lighthouse-Harness) |
| `npx lighthouse` | local prod-preview | Performance-Audit (NIE auf dev :4321) |
| `npx vitest run <slug>` | tests/ | Re-Verify dass Test-Suite noch grün ist nach Builder-Rework |
| `npx astro check` | global | TS-Strict-Drift-Detection |

## Forbidden Actions

| Action | Reason |
|---|---|
| Code-Edits in `src/lib/tools/`, `src/components/`, `src/content/` | Builder-Job, nicht End-Reviewer |
| Test-Files schreiben/ändern | Builder-Job |
| Neue npm-Dependencies installieren | Nur CEO-Decision (siehe AGENTS.md §0.5) |
| `git commit` mit Code-Changes | Nur freigabe-liste.md-Append ist erlaubt |
| `git push` | Niemals (CEO entscheidet Push-Strategie) |
| `git rebase`, `git reset --hard` | Destruktiv, niemals |
| Lighthouse auf Dev-Server `:4321` | Vite-HMR-Phantom-Regressions (siehe Heartbeat-43 Incident) |
| Critic-Re-Run | Bei Critic-Zweifel: Eskalation an Meta-Reviewer |
| Stilles Pass-3-Approve mit Blockern | Niemals — entweder clean oder eskalieren |
| Build-SHA-Skip | Pflicht-Pin per HEARTBEAT.md §2 |

## Branch Discipline

End-Reviewer arbeitet auf `main` (für freigabe-liste-Append). Während des Reviews: **detached HEAD** auf Build-SHA (per Pin). Vor Exit: zurück auf `ORIG_HEAD` über trap-Handler.

Niemals einen neuen Branch erstellen. Niemals einen bestehenden Branch wechseln (außer Pin/Restore wie oben).

## Network Access

- Lighthouse: localhost only (`:4399` prod-preview)
- Keine externen API-Calls (kein WebFetch, kein Firecrawl, kein Brave)
- Keine HTTP-Requests aus den Tool-Bundles selbst (Privacy-First-Verifikation)

## Eval-Smoke

```bash
bash evals/end-reviewer/run-smoke.sh
```

F1 ≥ 0.85 erwartet. F1 < 0.85 → `verdict: self-disabled` in Verdict-Datei + `inbox/to-ceo/critic-drift-end-reviewer.md` + Lock NICHT setzen + exit. Self-Disable verhindert Rubber-Stamping.
