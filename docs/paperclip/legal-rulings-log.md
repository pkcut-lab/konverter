# Legal-Rulings-Log (v1.0, 2026-04-23)

> **Zweck:** Tracker für BGH / EuGH / LG / OLG-Entscheidungen mit Impact auf DSGVO, TMG, TTDSG, AdSense, UrhG.
>
> **Maintained by:** `legal-auditor` (Monthly-Rulings-Sweep am 1. des Monats). User approved neue Einträge manuell.
>
> **Fresh-SLA:** Last-Modified ≤30d. Bei Überschreitung öffnet `legal-auditor` Check L8 `warning`.
>
> **Format:** YAML-Frontmatter + Tabelle. Jede Zeile = 1 Ruling.

---

## Bekannte relevante Rulings (Baseline 2026-04-23)

| Datum | Court | Aktenzeichen | Kurz | Impact | Status | Action |
|---|---|---|---|---|---|---|
| 2024-09 | BGH | I ZR 140/23 | Cookie-Opt-Out muss 1-Klick sein | Cookie-Banner-UX | reviewed | Banner-Design prüft vorsorglich |
| 2022-12 | DSK | Beschluss 2022 | Cookie-Banner: Ablehnen gleichwertig zu Akzeptieren | Cookie-Banner-UX | reviewed | Pre-Implementation, Phase 2+ |
| 2020-10 | BGH | I ZR 7/16 (Cookie II) | Einwilligung vor Tracking-Cookies | Essentials of Cookie-Consent | reviewed | via TTDSG §25 fortgeschrieben |
| 2020-07 | EuGH | C-311/18 (Schrems II) | SCCs für US-Datenübermittlung | AdSense / Cloudflare | reviewed | Cloudflare + Google haben SCCs + Data-Privacy-Framework |

## Eintrag-Schema

```yaml
- datum: YYYY-MM
  court: BGH | EuGH | LG-<Stadt> | OLG-<Stadt> | DSK | BfDI
  aktenzeichen: <offizielle Referenz>
  kurz: <1-Satz-Summary>
  quelle_url: <primary source>
  impact_score: 1-5          # 1 = n/a für uns, 5 = dringender Handlungsbedarf
  impact_areas: [cookie-banner, impressum, datenschutz, adsense, hosting, content]
  recommendation: <1-Satz, konkrete Änderung>
  status: pending | reviewed | actioned | archived
  reviewed_at: YYYY-MM-DD
  actioned_commit_sha: <optional>
```

## Monthly-Sweep-Sources (für legal-auditor)

| Source | Typ | Fetch-Methode |
|---|---|---|
| `rsw.beck.de` | Kommerziell (News-Feed frei) | WebFetch RSS |
| `dsgvo-portal.de` | Blog | WebFetch RSS |
| `noyb.eu/en/press` | NGO | WebFetch |
| `bfdi.bund.de/DE/Fachthemen/Pressemitteilungen` | Behörde | WebFetch |
| `edpb.europa.eu` | EU-Body | WebFetch |
| `dsk.gmbh` | DSK | WebFetch |
| `curia.europa.eu` | EuGH | WebFetch |

## Sweep-Output-Pipeline

1. `legal-auditor` Monthly-Sweep fetched alle Sources (last-30d-Window)
2. Für jedes neue Ruling: Impact-Score via LLM (legal-auditor ist opus-4-7)
3. Rulings mit Score ≥3 → Append in diese Tabelle unter "Pending Review" + `inbox/to-user/legal-ruling-<date>-<kurz>.md`
4. Rulings mit Score <3 → Only Digest-Note, kein User-Ping
5. User reviewed Pending-Einträge, approved + actioned → Commit + `status: actioned`

---

## Pending Review (User-Approval-Queue)

_leer — Initial-State_

---

## Tranche-B-Notiz

Die in `scripts/legal-rulings-fetch.mjs` (nicht existent 2026-04-23) referenzierte Automatisierung wird in Tranche B implementiert. Bis dahin:
- `legal-auditor` liest diese Datei read-only
- User pflegt Tabelle manuell via neue Rulings beim Aufkommen
- Check L8 (`rulings_log_age_days ≤30`) wird bei mtime >30d `warning`; Sweep muss man manuell triggern bis Script existiert
