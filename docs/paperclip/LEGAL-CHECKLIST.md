# LEGAL-CHECKLIST (v1.0, 2026-04-23)

> **Zweck:** DSGVO + TMG (Impressumspflicht) + AdSense-TOS + TTDSG + BGH-Rulings. Legal-Auditor (Agent 10) enforced diese Checkliste 1× pro Release und bei jedem Ship eines neuen Tool-Typs mit Datenverarbeitung.
>
> **Status:** binding. Verstöße gegen §1–§3 blocken Deploy. §4 ist `warning`.

## §1. Impressum (TMG §5 + DDG §5, Deutschland)

Pflicht-Felder auf `/de/impressum/`:

1. **Name + Anschrift** — vollständige ladungsfähige Adresse (Privatperson: Vor- und Nachname; GbR: alle Gesellschafter)
2. **Kontakt** — Email UND (Telefon ODER Kontaktformular)
3. **Vertretungsberechtigter** (bei juristischer Person)
4. **Umsatzsteuer-ID** (§27a UStG) — wenn vorhanden
5. **Wirtschafts-ID** (§139c AO) — optional
6. **Aufsichtsbehörde** — bei zulassungspflichtigen Tätigkeiten
7. **Berufsbezeichnung + berufsrechtliche Regelungen** — bei freien Berufen
8. **EU-Streitschlichtung** — OS-Link: `https://ec.europa.eu/consumers/odr/` + Disclaimer „nicht zur Teilnahme an Streitbeilegungsverfahren bereit oder verpflichtet"
9. **Verantwortlich für den Inhalt (§18 MStV)** — Name + Anschrift

**Check:** Legal-Auditor parsed `/de/impressum/index.md` gegen Regex-Schema:

```bash
grep -q "Anschrift:" && grep -q "E-Mail:" && grep -q -E "(Telefon|Kontakt)" && \
grep -q "Umsatzsteuer" && grep -q "ec.europa.eu/consumers/odr"
```

## §2. Datenschutzerklärung (DSGVO Art. 13 + TTDSG)

Pflicht-Sections auf `/de/datenschutz/`:

| Section | Pflicht | Inhalt |
|---|---|---|
| §1 Verantwortlicher | hart | Name, Anschrift, Kontakt (wie Impressum) |
| §2 Datenarten | hart | „Wir verarbeiten KEINE personenbezogenen Daten beim Tool-Use — alle Berechnungen erfolgen im Browser." |
| §3 Server-Logs | hart | Cloudflare: IP-Adresse, User-Agent, Timestamp, angefragte URL — 30d-Retention, keine Weitergabe |
| §4 Cookies / Local-Storage | hart | Nur Theme-Preference (`prefers-color-scheme`-Override), Cookie-Banner wenn AdSense (§2.1) |
| §5 AdSense (Phase 2+) | hart wenn aktiv | Cookie-Consent-Banner, Google-Link zu Google's Datenschutzerklärung, Opt-Out-Link |
| §6 Web-Analytics | hart | Cloudflare Analytics (cookie-less, keine PII) — Alternative zu Google Analytics |
| §7 Rechte der Betroffenen | hart | Auskunft, Löschung, Widerspruch, Datenportabilität, Beschwerde bei Aufsichtsbehörde |
| §8 Drittanbieter | hart | AdSense, Cloudflare (Hoster+CDN) — mit Sitz + Datenübermittlungs-Mechanismus (SCC) |
| §9 Änderungen | hart | Last-Modified-Datum; ≤90d alt bei jedem Ship-Check |

**TTDSG §25** (Cookie-Einwilligung): Banner PFLICHT wenn Cookies **nicht** technisch notwendig (AdSense-Cookies sind nicht-notwendig). Theme-Preference via LocalStorage = technisch notwendig → kein Banner nötig dafür.

## §3. AdSense-TOS-Compliance (Phase 2+)

Vor Ersten AdSense-Ship:

1. **Policy-Check** — Seite hat keine verbotenen Inhalte (Adult, Hate, Violence, Copyright-Infringing)
2. **Ads.txt** unter `/ads.txt` mit Publisher-ID: `google.com, pub-XXXXXXXX, DIRECT, f08c47fec0942fa0`
3. **Consent Management Platform (CMP)** — IAB TCF 2.2 zertifiziert, wenn EU-Traffic (unser Fall: 100% EU)
4. **Cookie-Banner** — Ablehnen-Button gleichwertig zu Akzeptieren (DSK-Beschluss 2022)
5. **Personalisierte Ads** — nur bei Consent; default = non-personalized
6. **Kein Ad-Density-Miss** — AdSense erlaubt max 3 Ads above-fold; unsere DESIGN.md §5 begrenzt zusätzlich auf 1 Ad-Slot pro Tool-Detail (nach Tool-UI, vor Article-Content)
7. **AdSense-Disclaimer** in Datenschutz + Impressum-Note

**Check:**
```bash
curl -sI https://konverter-7qc.pages.dev/ads.txt | grep -q "200"
grep -q "AdSense" src/content/static-pages/de/datenschutz.md
grep -q "non-personalized" src/lib/consent.ts  # Default-State
```

## §4. BGH / EuGH / LG / OLG — Rulings-Tracker (Warning-Only)

Legal-Auditor hält `docs/paperclip/legal-rulings-log.md` mit monatlichem Update (via WebFetch auf `rsw.beck.de`, `dsgvo-portal.de`, `noyb.eu`):

| Ruling | Datum | Impact | Action |
|---|---|---|---|
| BGH I ZR 140/23 (Cookies-Opt-Out) | 2024-09 | Ablehnen = 1-Klick, kein Layered | Banner-UX geprüft ✓ |
| EuGH C-621/22 (Schrems III Derivate) | 2025-XX | SCC evaluieren | 90d-Review |
| BGH VI ZR 115/23 (KI-Trainingsdaten) | 2025-XX | Author-Info evtl. Pflicht | Soft-Warning |
| … | … | … | … |

Neue Rulings werden nicht automatisch enforced — Legal-Auditor öffnet `inbox/to-user/legal-ruling-<date>-<kurz>.md` mit Summary + Empfehlung.

## §5. Haftung & Urheberrecht

- **Tool-Outputs** sind Werke des Nutzers → keine Claim-Rechte unsererseits
- **Tool-Konstanten** (z.B. NIST SI-Faktoren) sind Public-Domain / no-rights-claimed (siehe Content-Primärquellen)
- **Copy + Content** MIT-Lizenz gem. `LICENSE`
- **Image-Assets** — alle selbst erstellt / AI-generiert / CC0-sourced; keine Stock-Photos mit restriktiver Lizenz
- **Disclaimer** im Footer: „Alle Berechnungen erfolgen ohne Gewähr. Bei kritischen Anwendungen prüfe die Ergebnisse mit einer weiteren Quelle."

## §6. Tool-spezifische Legal-Gates

| Tool-Typ | Zusätzliche Pflicht |
|---|---|
| **Finance-Tools** (Phase 2+) | Disclaimer: „Keine Anlageberatung" |
| **Health-Tools** (NEIN — bewusst ausgeschlossen) | — (wir bauen keine) |
| **Tools mit File-Upload (ML)** | Privacy-Hinweis „Files bleiben im Browser" explizit im Tool-UI |
| **Generator-Tools (Passwort, UUID)** | Disclaimer: „Für sicherheitskritische Anwendungen eigene Primärquelle verwenden" |
| **Compare-Tools (Diff)** | Keep „Es werden keine Daten übermittelt"-Badge sichtbar |

## §7. Output-Format Legal-Report

```yaml
# tasks/awaiting-critics/<ticket-id>/legal-auditor.md
---
evidence_report_version: 1
critic: legal-auditor
critic_version: 1.0
verdict: <pass|fail|partial>
impressum_complete: <bool>
datenschutz_sections_present: <n/9>
datenschutz_age_days: <n>
adsense_compliance: <pass|n/a|fail>
ttdsg_compliance: <pass|fail>
rulings_reviewed_last: <ISO-date>
violations: [list]
warnings: [list]
---
```

## §8. Hart-Gate-Failure-Handling

| Violation | Block-Deploy? | User-Eskalation |
|---|---|---|
| Impressum-Feld fehlt | ja | Live-Alarm sofort |
| Datenschutz älter 90d | ja | Live-Alarm sofort |
| AdSense aktiv ohne CMP | ja | Live-Alarm + Halt |
| BGH-Ruling unbearbeitet (30d) | nein | Digest-Note |
| Disclaimer fehlt (Finance/Generator) | ja | Live-Alarm |

## §9. Referenzen

- TMG / DDG (https://www.gesetze-im-internet.de/ddg)
- DSGVO Art. 13 + 14 + 15 + 17 + 20 + 21
- TTDSG §25 (Cookie-Einwilligung)
- DSK-Beschluss zu Cookie-Bannern (2022)
- Google AdSense Policies (https://support.google.com/adsense/answer/48182)
- IAB TCF 2.2
- `CLAUDE.md` §18 Non-Negotiables #2 (Privacy-First)
