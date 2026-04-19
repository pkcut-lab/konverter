# Phase-2-Session-1 Bootstrap Runbook

**Voraussetzung:** README.md `Hard-Prerequisites` 1–6 alle grün. Sonst zurück zu Phase 1.

## Schritt 1 — Installation (5 min)

```bash
# Paperclip CLI installieren
npm install -g paperclip-agents

# Version-Sanity
paperclip --version   # erwarte ≥ aktueller Release zum Activation-Zeitpunkt
claude --version      # erwarte Max-20x aktiv
```

## Schritt 2 — Init (2 min)

```bash
cd /c/Users/carin/.gemini/Konverter\ Webseite
paperclip init konverter
# Erzeugt: ~/.paperclip/konverter/{agents,tasks,config}
```

## Schritt 3 — Artefakte liften (3 min)

```bash
cp docs/paperclip/souls/*.md       ~/.paperclip/konverter/agents/souls/
cp docs/paperclip/agents/*.md      ~/.paperclip/konverter/agents/procedures/
cp docs/paperclip/BRAND_GUIDE.md   ~/.paperclip/konverter/docs/
cp docs/paperclip/TICKET_TEMPLATE.md ~/.paperclip/konverter/docs/
cp docs/paperclip/HEARTBEAT.md     ~/.paperclip/konverter/config/
```

## Schritt 4 — Company Mission setzen (1 min)

Über Dashboard oder `paperclip config mission`:

```
Mission: Eine multilinguale Konverter-Webseite mit 1000+ Tools betreiben und
skalieren. Jeder Tool-Commit muss: (1) die Rulebooks PROJECT/CONVENTIONS/STYLE/
CONTENT/TRANSLATION einhalten, (2) `npm test` + `astro check` grün durchlaufen,
(3) WCAG-AAA-Contrast garantieren, (4) unter pkcut-lab committen. Kein Tool
geht live ohne QA-Pass. Privacy-First, Refined Minimalism, DSGVO-konform.

Non-Negotiables (Spec Section 18, überstimmen jede Effizienz-Entscheidung):
- Kein Server-Upload von Nutzer-Daten (Ausnahme 7a: ML-File-Tools mit Worker)
- Kein Tracking ohne Consent
- Kein thin Content (< 300 Wörter → abgelehnt)
- Keine externen Network-Dependencies zur Runtime
- AdSense erst Phase 2 (= ab Paperclip-Start okay, vorher verboten)
```

## Schritt 5 — CEO hiren (2 min)

- Runtime: Claude Opus (Max-Plan deckt ab)
- SOUL: `~/.paperclip/konverter/agents/souls/ceo.md`
- AGENTS: `~/.paperclip/konverter/agents/procedures/ceo.md`
- Budget: `$0` (Tripwire — bei API-Fallback Stop)
- Heartbeat: `30m`

**Erstes Ticket:** "Lies BRAND_GUIDE.md + docs/paperclip/README.md. Schreib 3-Zeilen-Zusammenfassung deines Verständnisses in `inbox/ceo-briefing-001.md`. Danach: warte auf mein Approval für dein erstes Hiring."

## Schritt 6 — Smoke-Test (1 Heartbeat-Zyklus, 30 min)

User-Check nach 30 min:
- [ ] `inbox/ceo-briefing-001.md` existiert
- [ ] CEO hat alle 5 Non-Negotiables korrekt referenziert
- [ ] Kein Runaway-Token-Spend (Max-Plan-Quota intakt)
- [ ] `task.lock` sauber geräumt

Falls ≥1 Check fail → Paperclip stoppen, CEO-SOUL/AGENTS iterieren.

## Schritt 7 — Tool-Builder hiren (nach Smoke-Test-Pass)

- SOUL: `souls/tool-builder.md`
- AGENTS: `agents/tool-builder.md`
- Skills: `frontend-design`, `astro`, `svelte-core-bestpractices`, `web-design-guidelines`

**Erstes Ticket:** `TICKET_TEMPLATE.md` befüllt für EIN einfaches Tool (Vorschlag: `kilometer-zu-meilen` — Converter, Typ schon gelockt). Nicht der erste echte Phase-2-Rollout, sondern Validierung dass der Agent den Prozess kann.

## Schritt 8 — QA-Agent hiren

- SOUL: `souls/qa.md`
- AGENTS: `agents/qa.md`
- Tools: `execute_command` für `npm test` + `astro check`, `read` für Diff

## Schritt 9 — Visual-QA hiren (optional Phase 2, Pflicht Phase 3)

- SOUL: `souls/visual-qa.md`
- Skills: Playwright-Screenshots
- Aufgabe: Screenshot-Diff gegen Session-5-Baseline, WCAG-Contrast-Audit

## Schritt 10 — Rollout freigeben

Nach 5 grünen Tools (gebaut + QA-pass + deployed) öffnet der User das Phase-2-Backlog (`paperclip issue create` oder Dashboard → Backlog-Import aus `docs/superpowers/plans/phase-2/`).

**Rollout-Rate-Limit:** Max 10 neue Tool-Tickets/Tag als CEO-Config-Cap, bis der erste 100er-Batch live ist. Dann Re-Evaluation.

---

## Rollback-Trigger

Stoppe Paperclip sofort wenn:
- QA-Failure-Rate > 20% über 10 Tools
- Agent schreibt mit `DennisJedlicka` commit (Git-Hook sollte es fangen — aber doppelt sicher)
- Spec-Drift: Agent schlägt Änderung der Rulebooks vor, ohne User-Approval-Ticket
- Token-Spend > $0 (Tripwire)
- Brand-Guide-Violation in 2 aufeinanderfolgenden Tools
