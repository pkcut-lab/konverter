# Konverter Webseite — Claude-Context

Dieses File wird von Claude Code automatisch bei jedem Session-Start geladen.

## Projekt-Kontext (1-Liner)

Multilinguale Konverter-Webseite (Astro 5 SSG + Svelte 5 + Tailwind), 1000+ Tools.
Launch-Set: DE only (Phase 1-2), +EN/ES/FR/PT-BR (Phase 3).
Expansion-Gates: bis 13 Sprachen (Phase 5), bis 30 (Phase 6).
Monetarisierung: AdSense ab Phase 2.
Vollständige Spec: `docs/superpowers/specs/2026-04-17-konverter-webseite-design.md` (v1.1).

## Bindende Referenzen — LIES ZU SESSION-BEGINN

1. `PROGRESS.md` — aktueller Projekt-Status und Next-Session-Plan
2. `PROJECT.md` — gelockte Tech-Stack-Versionen
3. **Task-abhängig:** `CONVENTIONS.md` (Code) · `STYLE.md` (Visual) · `CONTENT.md` (SEO-Text) · `TRANSLATION.md` (i18n)

## Arbeitsprinzipien (tailored nach Andrej Karpathy)

### 1. Think Before Coding
Bevor du editierst: relevante Rulebooks öffnen, Task-Ziel formulieren, Bite-Size-Steps planen. Kein Code ohne Verständnis von WAS und WARUM. Das ist die deutsche Interpretation von "slow is smooth, smooth is fast".

### 2. Simplicity First
Die einfachste Lösung, die funktioniert. Keine vorausschauenden Abstraktionen, keine Feature-Creep. Drei ähnliche Zeilen schlagen eine voreilige Abstraktion. Wenn du "das wird später nützlich sein" denkst → nicht bauen bis es wirklich gebraucht wird.

### 3. Surgical Changes
Ein Commit = ein logisches Stück (ein Tool, ein Bug-Fix, ein Design-Token). Keine Mix-Commits ("fix X + refactor Y"). Keine opportunistischen Refactors während Bug-Fixes. GitHub Flow: eine Tool-Familie pro Branch.

### 4. Goal-Driven Execution
Jede Session endet mit PROGRESS.md-Update. Task fertig → Commit mit Trailer → stop. Keine "ich mach noch schnell das"-Erweiterungen ohne Plan. Scope-Creep wird aktiv zurückgewiesen.

## Git-Account-Lock (HART)

Nur `pkcut-lab` darf in diesem Workspace committen. Vor jedem Commit:
```bash
bash scripts/check-git-account.sh
```
Muss green sein. `DennisJedlicka` ist in diesem Workspace **verboten**.

## Session-Ritual

**Start (~60 Sek):**
1. `PROGRESS.md` lesen
2. `PROJECT.md` prüfen (Dep-Versionen unverändert?)
3. Task-relevante Rulebooks
4. `bash scripts/check-git-account.sh`
5. Arbeiten beginnen

**Ende (~60 Sek):**
1. `PROGRESS.md` aktualisieren (welche Tools jetzt in welchem Zustand)
2. Commit mit Trailer: `Rulebooks-Read: PROJECT, CONVENTIONS[, STYLE][, CONTENT][, TRANSLATION]`
3. Stop

## Non-Negotiables (siehe Spec Section 18)

1. Session-Continuity: Rulebooks werden befolgt
2. Privacy-First: kein Tracking ohne Consent, kein Server-Upload (Ausnahme: 7a ML-File-Tools)
3. Quality-Gates: Build bricht ab bei fehlender Struktur
4. Git-Account: pkcut-lab only
5. AdSense erst Phase 2
6. Design-Approval vor Template-Extraction
7. Keine externen Network-Dependencies zur Runtime (Ausnahme 7a: ML-File-Tools mit Worker-Fallback, 6 Bedingungen)
8. Kein thin Content (<300 Wörter abgelehnt)
