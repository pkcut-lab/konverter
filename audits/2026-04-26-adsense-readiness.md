# AdSense-Readiness Audit — kittokit

**Date:** 2026-04-26
**Auditor:** adsense-prep-checker (T15)
**Sprint:** kittokit-launch T5-T15

---

## Pflicht-Anforderungen

| # | Item | Status | Notiz |
|---|------|--------|-------|
| 1 | Original Content (≥300 Wörter pro Tool-Seite) | ✅ | 72 Tools × Original-Content via CONTENT.md Rulebook — alle Tool-Seiten haben strukturierten H1/H2/H3/Tabellen-Content |
| 2 | Privacy-Page live (`/de/datenschutz`, `/en/privacy`) | ⬜ | Seiten existieren strukturell ✅, aber `[NEEDS USER INPUT]` Platzhalter (Name, Adresse, E-Mail) → User muss persönliche Daten einpflegen. AdSense-Sektion (4.1) vorhanden. |
| 3 | Imprint-Page live (`/de/impressum`, `/en/imprint`) | ⬜ | Seiten existieren strukturell ✅, aber `[NEEDS USER INPUT]` Platzhalter → User-Aktion required. |
| 4 | Cookie-Consent-Banner | ⬜ | T6 [KIT-7] in_progress — `CookieBanner.svelte` vorhanden, Implementierung läuft |
| 5 | Mobile-Friendly / Core Web Vitals | ⬜ | T8 [KIT-1] pending — Lighthouse-Audit noch nicht abgeschlossen |
| 6 | Keine Copyright-Verletzungen | ✅ | Alle Inhalte original, Tool-Konstanten Public-Domain/NIST, Assets CC0/AI-generiert |
| 7 | About-Page (`/de/ueber`, `/en/about`) | ✅ | Neu erstellt in diesem T15-Run (de/ueber.astro + en/about.astro) |
| 8 | Contact/E-Mail im Impressum | ⬜ | Impressum-Struktur vorhanden, wartet auf User-Dateneingabe (T5 external) |
| 9 | ads.txt unter `/ads.txt` | ✅ | Neu erstellt in diesem T15-Run (leer-Template, nach Approval füllen) |
| 10 | Sprache AdSense-supported | ✅ | Deutsch + Englisch — beide von Google AdSense offiziell unterstützt |
| 11 | Sitemap vorhanden | ⬜ | T10 [KIT-3] pending — error-pages-builder zuständig |
| 12 | CF Web Analytics / CMP | ⬜ | T11 [KIT-8] blocked (wartet auf T6) — Cloudflare Analytics + Clarity pending |
| 13 | Datenschutz erwähnt AdSense | ✅ | Section 4.1 "Google AdSense (geplant, Phase 2)" vorhanden in datenschutz.astro |
| 14 | Default non-personalized Ads | ⬜ | T6/T11 Consent-System pending — Implementierung via consent.ts erwartet |
| 15 | Site-Alter ≥ 6 Monate | ❌ | kittokit.com ist eine neue Domain — mind. 6 Monate Wartezeit vor AdSense-Bewerbung (AdSense-Anforderung, zeitgebunden) |
| 16 | Domain registriert + erreichbar | ✅ | kittokit.com via Porkbun registriert |

---

## Status-Zusammenfassung

| Kategorie | Anzahl |
|-----------|--------|
| ✅ Done | 6 |
| ⬜ Pending (andere T-Tasks oder User-Input) | 8 |
| ❌ Blocked (zeitgebunden) | 1 |
| **Gesamt** | **15** |

---

## Action Items (User + Agent)

### User-Aktionen (vor AdSense-Application)

1. **Persönliche Daten eintragen** in:
   - `src/pages/de/datenschutz.astro` — alle `[NEEDS USER INPUT]` ersetzen
   - `src/pages/de/impressum.astro` — alle `[NEEDS USER INPUT]` ersetzen
   - `src/pages/en/privacy.astro` — alle `[NEEDS USER INPUT]` ersetzen
   - `src/pages/en/imprint.astro` — alle `[NEEDS USER INPUT]` ersetzen
2. **Site ca. 6 Monate laufen lassen** mit Original-Content vor erster AdSense-Bewerbung
3. **AdSense-Bewerbung** erst wenn alle ✅: adsense.google.com → Sites → Add → kittokit.com → Verification-Snippet einbauen
4. **ads.txt nach Approval aktualisieren**: `public/ads.txt` mit Publisher-ID befüllen (`google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`)

### Agent-Aktionen (warten auf andere T-Tasks)

- Cookie-Banner: T6 [KIT-7] (cookie-consent-builder)
- CWV/Performance-Score: T8 [KIT-1] (perf-auditor)
- Sitemap: T10 [KIT-3] (error-pages-builder)
- CF Analytics + Clarity: T11 [KIT-8] (cf-infra-engineer, blocked auf T6)

---

## Application-Trigger

**Wann AdSense beantragen:**
Erst wenn ALLE folgenden Bedingungen erfüllt:
1. ✅ T5 (User-Daten in Datenschutz + Impressum eingetragen)
2. ✅ T6 Cookie-Banner live (IAB TCF 2.2 CMP)
3. ✅ T8 Lighthouse Mobile-Score ≥ 75
4. ✅ T11 CF Analytics live
5. ✅ Site ≥ 6 Monate alt mit Original-Content
6. ✅ About-Page live
7. ✅ ads.txt erreichbar unter `https://kittokit.com/ads.txt`

**Antragsweg:** adsense.google.com → "Get started" → Site-URL eingeben → Verification-Code in `<head>` einbetten (via `src/layouts/BaseLayout.astro` oder neues `AdSenseVerification.astro`) → 2-4 Wochen Prüfzeit.

---

## Dateien erstellt in diesem T15-Run

| Datei | Zweck |
|-------|-------|
| `public/ads.txt` | AdSense ads.txt Platzhalter (leer bis Approval) |
| `src/pages/de/ueber.astro` | About-Page Deutsch |
| `src/pages/en/about.astro` | About-Page Englisch |
| `audits/2026-04-26-adsense-readiness.md` | Dieses Dokument |
