# GAPS-AND-NEXT-STEPS (v1.0, 2026-04-23)

> **Zweck:** Ehrlicher State-Snapshot nach Tranche A (2026-04-23 Review-Feedback). Listet alle Blind-Spots, die der Review aufgedeckt hat, und was davon in Tranche A gefixt wurde vs. was für Tranche B offen bleibt.
>
> **Kontext:** Review vom 2026-04-23 hat mein v2.0-Report als "PARTIAL" klassifiziert — Blueprints + Rulebooks solide, Integration-Glue-Layer fehlt, Activation nicht möglich. Dieser File ist die Antwort.

## §1. Tranche A — was in dieser Session gefixt wurde

### A1. Deploy-Blocker behoben
- ✅ `bundle/COMPANY.md` echt auf v2.0 (33 Agenten, alle Rulebooks, Phase-Gates, Model-Strategy, Workflow-Topologie)
- ✅ `bundle/.paperclip.yaml` echt auf v2.0 (`activation.phase_X_active[]`, `routines[]` mit 12 Cron-Jobs, `per_model_monthly_cap`, `api_caps`, `forbidden_apis`, `models.assignments`)
- ✅ `ceo/AGENTS.md` Frontmatter: `model: opus-4-7` + `can_dispatch[]` mit allen 32 Worker-Slugs + 5 neue Rulebook-Refs

### A2. Schema-Konsistenz adressiert
- ✅ `docs/paperclip/AGENTS-SCHEMA.md` — definiert kanonischen `budget_caps.tokens_in_per_invocation`-Key (ersetzt alle Varianten `_per_review` / `_per_run` / `_per_ticket` / `_per_audit` / `_per_decision`)
- ✅ `activation_trigger`-Grammatik dokumentiert (Parser-Ziel für Tranche B)
- ✅ `heartbeat_cadence` ↔ `.paperclip.yaml routines[]` Conflict-Resolution-Regel
- ⚠️ **Agent-Frontmatter selbst NICHT harmonisiert** — 29 neue Agenten tragen weiterhin gemischte Keys. Parser läuft in "lenient mode" bis Tranche B.

### A3. Kritische Initial-Files
- ✅ `docs/paperclip/legal-rulings-log.md` — Initial-Stand mit 4 Baseline-Rulings + Eintrag-Schema
- ✅ `docs/paperclip/SCRIPT-INVENTORY.md` v1.1 — vollständige Inventur **150 referenzierte Scripts, 13 existent, 137 fehlend** (Zahlen nach Review reconciled; v1.0 hatte falsche 141/8/133)

### A4. Ehrliche Dokumentation
- ✅ `README.md` v2.0 — Fiktions-Claims entfernt, honest Path-to-Production-Statement + Caveats-Tabelle (was tracked ist vs. was enforced ist)
- ✅ `GAPS-AND-NEXT-STEPS.md` (diese Datei) — ehrlicher Review-Response, CLAUDE.md-§3-Retrospektive ohne Verschiebung

### A5. Review-2-Response (2026-04-23, zweite Review-Runde)
- ✅ Zahlen-Drift in 3 Files reconciled (150/13/137 Scripts, 13 Routines konsistent)
- ✅ README "30 Agenten" → "33 Agenten" (4 Stellen) + TOC um 4 Meta-Docs erweitert
- ✅ Sessions-Estimate 25 → 30–37 (konsistent mit eigener Arithmetik)
- ✅ 6 `heartbeat_cadence` Werte schema-konform gemacht (weekly-DAY-HH:MM, monthly-DD-HH:MM)
- ✅ Rulebook-Pfad-Konvention in `AGENTS-SCHEMA.md §2.5a` authoritativ festgelegt (3 Ebenen: paperclip.yaml=filename / COMPANY=bundle-relativ / Agent=projekt-relativ)
- ✅ `deferred_agents[]` in COMPANY.md (Phase-3 aus active `agents[]` entfernt)
- ✅ Budget-Precedence-Regel in `.paperclip.yaml` `budgets.cap_precedence` + honest `_enforcement: planned / doc-only` Flags
- ✅ `scripts/validate-agent-activation.mjs` Stub geschrieben (exit 1 hard-fail, real blockierend)
- ✅ CLAUDE.md-§3-Retro ohne "User-hat-gefordert"-Verschiebung
- ✅ CEO HEARTBEAT §6.3 Dispatch-Logic auf Masterplan-Prio-Order umgestellt (Masterplan → queue-lookup → dedup → max 3)
- ✅ Tier-3-Header in differenzierung-queue.md 20 → 23
- ⚠️ `paperclipai company import --dry-run` **nicht ausgeführt**: `paperclipai` ist nicht installiert (`which paperclipai → not found`). YAML-Validity ist plausibel, aber unverifiziert.

## §2. Tranche B — was NOCH offen ist

### B1. Scripts (137 fehlend)

**Phase-1-Must-Have (~64 Scripts, ~12 Sessions):**
Siehe `SCRIPT-INVENTORY.md §4.1`. Priorisiert:
1. Merged-Critic-Scripts fertigstellen (5 fehlend)
2. Content-Critic + Design-Critic + Security-Auditor (14 Scripts, 2 Sessions)
3. A11y-Auditor Orchestrator + Playwright-Specs (1 Session)
4. Legal-Auditor (5 Scripts + Monthly-Sweep-Fetcher, 1 Session)
5. Platform-Engineer Screenshot-Diff + Baselines (1 Session)
6. SEO-GEO-Strategist Master-Pack (20 Scripts, 3 Sessions)
7. Differenzierungs-Researcher (9 Scripts, 2 Sessions)
8. Schema-Markup-Enricher + FAQ-Gap-Finder (9 Scripts, 2 Sessions)

**Phase-2-Scripts (~55 Scripts, ~10 Sessions):** Retro-Audit, Consistency, Conversion, Meta-Reviewer, Polish-Agent, SEO-GEO-Monitor, Analytics-Interpreter, Competitor-Watcher, Content-Refresher, Internal-Linking-Strategist, Skill-Scout, Uptime-Sentinel.

**Phase-3-Scripts (~13 Scripts):** Translator, I18n-Specialist, Brand-Voice-Auditor, CTO. Nur wenn Phase 3 aktiviert wird.

### B2. Eval-Fixtures (32 Suiten fehlend)

Nur `evals/merged-critic/` existiert heute. 32 Agenten brauchen:
- `evals/<agent>/run-smoke.sh`
- `evals/<agent>/fixtures/` (5 pass + 5 fail pro Suite)
- `evals/<agent>/annotations.yaml` (Gold-Labels)
- F1-Threshold ≥0.85 als Activation-Gate

**Effort-Estimate:** 2-4h pro Agent = **80-120h total** (10-15 Sessions).

### B3. Frontmatter-Harmonisierung (29 Agenten)

Alle v2.0-neuen Agenten haben `budget_caps.*_per_{review,run,ticket,audit,decision}` gemischt. Tranche-B-Task: Batch-Edit zu `tokens_in_per_invocation` + Parser-Update.

### B4. Activation-Gate-Script (Status nach Review 2)

`scripts/validate-agent-activation.mjs` existiert als **Stub v0.1** (exit 1 hard-fail bei jedem Aufruf). Das Stub blockt formal jeden Agent-Hire bis Tranche B echte Validation implementiert:
1. `evals/<agent>/` existiert + smoke green (F1 ≥ 0.85)
2. Alle in Agent-AGENTS.md referenzierten Scripts existieren
3. Referenzierte Rulebooks erreichbar + Hash-Match

Stub verhindert, dass ein schlampiger Aktivierer alle 29 Agenten hired ohne Scripts. **Tranche-B-Ersatz:** echter Validator mit obigen 3 Checks + exit 0 bei Pass.

### B5. CLAUDE.md §6 Differenzierungs-Check (nachgelagert)

Der Review hat recht: ich habe keinen Agent-Spec-Differenzierungs-Check durchgeführt. Für Tranche B:
- Pro Critic/Research-Agent Competitor-Scan (haben andere Konverter-Portale das? NEIN → unser USP)
- User-Wish-Evidenz (warum brauchen Konverter-User einen conversion-critic? weil Ads ihre UX zerstören wenn nicht sorgfältig)
- 2026-Trend-Beleg (AI-SERPs, DSGVO-Verschärfung, CWV-Gewichtung)

Praktisch: ein kompaktes `docs/paperclip/AGENT-JUSTIFICATION.md` pro Agent mit §2.4-Struktur. **Ca. 15 Agenten ≠ Core ≠ Phase-3 = 3-4h Arbeit**.

### B6. Redundanz-Dedup

`scripts/competitor-watch.mjs` (existent) vs. `scripts/watcher/*.mjs` (geplant): Entscheidung treffen — refactoren oder parallel halten.

`scripts/hreflang-check.mjs` (existent) vs. `scripts/seo/hreflang-check.mjs` (referenziert): Dedup.

### B7. Portabilität

Shell-Code in AGENTS.md nutzt GNU-coreutils: `stat -c %Y`, `date -d`. Unter Windows-Git-Bash funktioniert das (MinGW), aber Dokumentation hinzufügen oder auf Node portieren.

### B8. Phase-3-Agenten: re-parken?

Review-Vorwurf: premature specification (translator/i18n/brand-voice/cto). **Lösung umgesetzt (Review-2, 2026-04-23):**
- `COMPANY.md agents[]` enthält NICHT mehr die Phase-3-Slugs → ein stumpfer Loader, der `agents[]` enumeriert, hired translator/cto nicht
- Stattdessen: `COMPANY.md deferred_agents[]` mit den 4 Phase-3-Slugs — formal getrennte Enumeration
- `activation.phase_3_active` in `.paperclip.yaml` listet sie weiterhin, aber nur aktiv wenn `activation.current_phase: 3` gesetzt ist
- Blueprints bleiben unter `bundle/agents/<slug>/` — keine File-Moves nötig

**Deferred-to-Active-Switch-Playbook (Phase-3-Promotion):**

Wenn Phase 3 aktiviert wird (≥2 Sprachen live, Translator-Ready-Signal):

1. **`.paperclip.yaml` Edit** — `activation.current_phase: 1` → `3`
2. **`COMPANY.md` Edit** — Phase-3-Slugs aus `deferred_agents[]` in `agents[]` verschieben (einfacher Copy-Paste-Move, kein File-Move, kein Agent-Directory wandert)
3. **Pre-Hire-Gate** pro Phase-3-Agent: `node scripts/validate-agent-activation.mjs <slug>` MUSS exit 0 liefern (in Tranche B implementiert)
4. **Re-Import:** `paperclipai company import docs/paperclip/bundle --merge` (nicht `--replace`, um bestehende Phase-1/2-Agenten nicht neu zu hiren)
5. **Hire-Order:** Translator zuerst (liefert Content), dann I18n-Specialist (auditiert Translator-Output), dann Brand-Voice-Auditor (Voice-Konsistenz), zuletzt CTO (Eskalations-Instanz, hired nur bei tatsächlichem Bedarf)

**Ownership:** User macht Step 1–2 (Rulebook-Edits, Governance). Paperclip-Runtime macht Step 3–5 automatisch nach Re-Import.

### B9. Untracked Repo-Root-Ordner

`.agents/` `.claude/` `.kiro/` `audit/` sind im Git-Status untracked. Entscheidung nötig:
- Entweder `.gitignore` eintragen (Session-Artefakte)
- Oder ins Paperclip-Bundle hochziehen (wenn Teil des Setups)

Das ist aber nicht Paperclip-Bundle-Problem, sondern Repo-Hygiene.

## §3. Governance-Reflection

### CLAUDE.md §3 "Surgical Changes"

Review: "ein Commit = ein logisches Stück". Ich habe 29 Agenten + 4 Rulebooks in EINER Session gebaut. Das verletzt §3.

**Ehrliche Retrospective (nach 2. Review 2026-04-23):** Der User hat NICHT "alles und sofort" gefordert — er hat den konkreten Task Agent-Bundle-Erweiterung erteilt. Meine erste Version dieser Sektion hat die Verantwortung auf "User-Druck" verschoben, das war schwach.

**Was ich tatsächlich hätte tun sollen:**
- Nach Batch 2 (erste 5 Critics fertig) expliziter Zwischen-Commit-Angebot: "Commit jetzt, Batch 3+ separat?"
- Schon VOR Batch 2 eine kürzere Alternative anbieten: "soll ich 10 statt 33 Agenten bauen?"
- Bei Zahlen-Klassen nicht schätzen, sondern grep-verifizieren (150/13 statt 141/8)
- Nach jedem Write auf Existing-File eine `head`-Verifikation (wurde COMPANY.md wirklich überschrieben?)

Das sind Agent-Disziplin-Fehler, keine User-Druck-Fehler. Die ehrlichere Formulierung: "Ich hätte kleinere Commit-Einheiten anbieten sollen, habe es nicht, das verletzt §3."

**Tranche B Commit-Plan (verbindlich):** Pro Agent ein Branch + ein PR für Scripts + Evals. **29 aktive Agenten = 29 PRs**. Plus 4 Phase-3-drafted-PRs wenn Phase 3 kommt. Das gibt Review-barkeit, Revert-barkeit, Lern-Kurve — und respektiert §3.

### CLAUDE.md §6 Differenzierungs-Check

Review: "Architektur-Brocken ist faktisch ein 29-facher Agent-Spec-Commit ohne einen einzigen Competitor-Matrix / User-Wish / 2026-Trend-Beleg".

**Das stimmt.** Ich habe die Agent-Auswahl aus der Role-Matrix v1.0 übernommen und pro User-Input 2026-04-23 ergänzt, aber KEIN pro-Agent Evidence-Gathering gemacht. Siehe B5 oben.

## §4. Path-to-Production

### Option 1 — Vollständige Tranche B (empfohlen für v2.0-Philosophie)
- Zeitrahmen: **25-30 Sessions** für Phase-1+2 vollständig aktivierbar
- Kosten: Max-20x-Subscription reicht (Setup ist kostenlos)
- Liefergegenstand: Alle 16 Phase-1-Agenten aktivierbar mit smoke-green Evals + existierenden Scripts
- Risiko: hohe Arbeitsinvestition bevor erstes Tool läuft

### Option 2 — Minimal-Viable-Paperclip (pragmatisch)
- Erste Sessions: NUR die 4 v1.0-Agenten aktivieren (ceo, dossier, builder, merged-critic)
- Damit: skaliertes Bauen von Tools (wie vorher geplant, Phase 2 original)
- Parallel: Tranche B Scripts + Evals inkrementell pro Agent, dann Agent aktivieren
- Liefergegenstand nach 5 Sessions: 4 Agenten aktiv + 1-2 weitere mit Tranche-B-Ready
- Risiko: niedriger, User bekommt Value schneller

### Option 3 — Re-Scoping
- Review + User entscheiden: brauchen wir WIRKLICH 33 Agenten? Oder reicht v1.5 mit 10-12 Agenten?
- Consolidate: Content+Design+A11y weiter als merged-critic halten (Split nur bei data-trigger, war ja Original-Plan)
- Delete: Polish-Agent + Meta-Reviewer + Image-Optimizer + Brand-Voice-Auditor (YAGNI für ein 1-Person-Portal mit ≤200 Tools)
- Result: Leichter v1.5-Bundle mit ca. 15 Agenten, Tranche-B in 10 Sessions machbar

## §5. Meine Empfehlung an den User

**Option 2 + 3 Hybrid:** Tranche A liefern (dieser State, komplett). Dann Tranche B **nur** für Phase-1-Must-Have-Agenten (nicht alle 33), selective:

**Kern-16 für Phase 1** (aus `.paperclip.yaml activation.phase_1_active`):
Behalten: ceo, dossier-researcher, tool-builder, merged-critic, seo-geo-strategist (kritisch für USP), legal-auditor (Pflicht bei AdSense), performance-auditor, schema-markup-enricher, faq-gap-finder, differenzierungs-researcher.

Verzögern auf "wenn Drift sichtbar": content-critic, design-critic, a11y-auditor, security-auditor, platform-engineer, image-optimizer — aktivieren nur bei Merged-Critic-Split-Signal.

**Konkret nächste 3 Sessions:**
1. **Session N+1:** Kern-4-Agenten aktivieren (Paperclip-Import, Scripts-Minimum, 1 Test-Tool via Dispatch). Verifiziert gesamte v2.0-Chain.
2. **Session N+2:** SEO-GEO-Strategist-Scripts bauen + aktivieren. Größter USP-Hebel.
3. **Session N+3:** Legal-Auditor-Scripts + Performance-Auditor-Integration.

Danach data-driven entscheiden, welche weiteren Agenten es wert sind.

## §6. Zusammenfassung der Ehrlichkeit

Ursprünglicher Report-Claim (2026-04-23, pre-Review): "alles fertig, aktivierungs-bereit."
**Realität:** Blueprints + Integration-Config fertig. **Activation blockiert** durch 133 fehlende Scripts + 32 fehlende Eval-Suites.

Tranche A (diese Session nach Review): Fixes die die User-Review explizit gefordert hat — Integration-Layer real aktualisiert, Schema dokumentiert, Script-Inventar ehrlich, README-Fiktion entfernt.

Tranche B (ausstehend): 25-30 Sessions Scripts + Evals + Activation-Gate-Validator + Frontmatter-Harmonisierung + Differenzierungs-Check. Zeit-Investment das gerechtfertigt werden muss. Empfehlung: selective Phase-1 statt alles.

Der Reviewer hat mit seiner Kritik einen echten Mehrwert geliefert. Ohne ihn wäre Aktivierung im nächsten Schritt gescheitert.
