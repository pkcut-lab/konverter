# Paperclip — Agent-Bootstrap für Phase 2

**Status:** Vorbereitungs-Artefakte. Noch NICHT aktiv. Activation: Phase 2 Session 1 (~Session 30).

**Warum jetzt schon:** Claude-Max-20x macht Setup kostenlos. Template-Stabilität ist der Blocker, nicht Tooling. Wenn Phase 1 Session ~10 die 5 Tool-Typen gehärtet hat, liftet Phase 2 Session 1 diesen Ordner nach `~/.paperclip/<company>/` und startet sofort.

## Inhalt

| Datei | Zweck |
|-------|-------|
| `ONBOARDING.md` | Phase-2-Session-1 Bootstrap-Runbook (Installation, Mission, Hiring-Order) |
| `BRAND_GUIDE.md` | Agent-lesbare Eval-Rubrik (konsolidiert STYLE.md + CONTENT.md + tokens.css) |
| `TICKET_TEMPLATE.md` | 1 Ticket = 1 Tool Schema (Slug, Type, Content-Gates, Accept-Kriterien) |
| `HEARTBEAT.md` | 30-min Intervall, Lock-File-Mechanik, Identity-Check |
| `SKILLS.md` | `skills.sh`-Installationsliste pro Rolle |
| `souls/*.md` | SOUL-Files (Identität, Values) für 7 Rollen |
| `agents/*.md` | AGENTS-Prozedur-Files für die 3 kritischen Rollen (CEO, Tool-Builder, QA) |

## Hard-Prerequisites (aus Literatur-Research 2026-04-19)

Vor Paperclip-Start MÜSSEN erfüllt sein:

1. **Template-Stabilität:** Mindestens 5 Tool-Typen live + gehärtet (Converter, Calculator, Generator, Formatter, Validator). Stand 2026-04-19: 1/5 (Meter-zu-Fuß). Gate = Phase 1 Sessions 5–10 abgeschlossen.
2. **Eval-Rubrik:** `BRAND_GUIDE.md` in Agenten-Sprache (konkret, messbar: "44px tap target", nicht "looks professional"). Siehe §36-Quote in NotebookLM-Research.
3. **Rulebooks fixiert:** PROJECT.md / CONVENTIONS.md / STYLE.md / CONTENT.md / TRANSLATION.md unverändert seit Phase 1 Ende.
4. **Git-Account-Lock aktiv:** `scripts/check-git-account.sh` läuft pre-commit. Paperclip-Agenten committen nur als `pkcut-lab`.
5. **Test-Gate:** Jeder Tool-Commit muss `npm test` + `astro check` grün durchlaufen. Engineer-Agent darf nicht `engineer_output.md` schreiben bevor beide grün.
6. **Monthly-Spend-Cap:** `$0` dank Max-20x, aber Budget-UI auf `$0` gesetzt als Tripwire (rennt Agent API-Mode statt Subscription → sofort Stop).

## Activation-Checklist (Phase 2 Session 1)

- [ ] Node.js ≥ 18 vorhanden
- [ ] `npm install -g paperclip-agents` + `@anthropic-ai/claude-code` (beides schon da via Max-Plan)
- [ ] `paperclip init` in Projekt-Root
- [ ] `cp -r docs/paperclip/souls/ ~/.paperclip/konverter/agents/souls/`
- [ ] `cp -r docs/paperclip/agents/ ~/.paperclip/konverter/agents/procedures/`
- [ ] Skills laden via `skills add` (Liste in `SKILLS.md`)
- [ ] Company-Mission aus `ONBOARDING.md` kopieren
- [ ] CEO hiren, 1 Testing-Ticket schicken, Heartbeat auf 30 min
- [ ] Nach 3 grünen Heartbeat-Zyklen → Tool-Builder hiren
- [ ] Nach 5 fertig gebauten Tools mit QA-pass → Skalierungs-Backlog öffnen

## Was Paperclip NICHT automatisiert (menschliche Entscheidungen bleiben beim User)

- Brand-/Taste-Regel-Anpassungen (nur der User editiert `BRAND_GUIDE.md`)
- Architektur-Entscheidungen, die Rulebooks ändern würden
- Deployment auf Production (CF-Pages-Secrets bleiben menschlich gated)
- Content-Approval bei sensiblen Tools (Persönlichkeitstest etc. — User-Review Pflicht)
- Differenzierungs-Check (§2.4 in jeder Tool-Spec) — bleibt menschlich

## Abgrenzung zu Claude-Code-Subagenten

| Aspekt | Claude-Code-Subagent (Phase 1) | Paperclip (ab Phase 2) |
|--------|--------------------------------|------------------------|
| Coordination | Manuell, per Session | Heartbeat-getrieben, 24/7 |
| State | Session-lokal | File-based persistent |
| Parallelität | 1-3 Subagenten ad-hoc | 5-10 spezialisierte Dauer-Agenten |
| Sweet Spot | Template-Validierung, komplexe Einzel-Tasks | Fan-out auf stabiles Template |
