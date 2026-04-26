---
DRAFT — nicht publishen bis KIT-1/2/4/8/9 alle `done`
Publish: mv zu inbox/to-user/SPRINT_DONE.md + git add + commit
---

# kittokit-launch Sprint — DONE

**Sprint-Datum:** 2026-04-26
**Coordinator:** launch-coordinator (d1acd4b9)
**Ziel:** kittokit produktionsreif machen — T5-T15 abschließen

---

## ✅ Abgehakt

| Task | Was | Commit | Reviewer |
|------|-----|--------|----------|
| T6 | Cookie-Banner (Svelte 5 Runes, DSGVO, bottom-right Card, Drawer) | 944c1fb | ✅ approved |
| T7 | JSON-LD per Tool (SoftwareApp/Breadcrumb/FAQPage/HowTo) | 67f26b2 (pre-sprint) | ✅ approved |
| T8 | Performance + CWV: Lighthouse 87→98 avg, alle 7 URLs ≥90 | 66e669f | ✅ approved |
| T9 | WCAG 2.2 AAA: 29→0 axe-violations (74 pages) | 130bec5 + 124dba2 (QR fix) | ✅ approved |
| T10 | 404/500 Error-Pages + Sitemap + robots.txt + llms.txt | 1f339cb | ✅ approved |
| T11 | CF Web Analytics + Microsoft Clarity (consent-gated) | 76d4c05 | ✅ approved |
| T12 | 72 OG-Cards (1200×630) + per-tool og:image-Tag | aabc68d | ✅ approved |
| T13 | Email Routing aktiviert + DNS (3x MX + SPF + DKIM) | — (CF API) | ⚠️ partial — siehe Restschuld |
| T15 | AdSense-Readiness Checklist + About-Pages (DE+EN) + ads.txt | 4e26d90 | ✅ approved |
| — | 4 vitest-Failures aus Phase-3 EN pivot gefixt | 5a9d4dd | ✅ done |

---

## ⚠️ Restschuld — User-Action erforderlich

### 1. T11: Analytics-Tokens setzen
**Datei:** `inbox/to-user/REQUIRES-USER-INPUT-analytics-tokens.md`

Die Analytics-Snippets sind im Code (BaseLayout.astro), werden aber erst aktiv wenn:
- `CF_RUM_TOKEN` in `.env` gesetzt (Cloudflare Web Analytics Token)
- `PUBLIC_CLARITY_PROJECT_ID` in `.env` gesetzt (Microsoft Clarity Project ID)

### 2. T13: Email-Aliases anlegen
**Datei:** `inbox/to-user/REQUIRES-USER-INPUT-email-target.md`

Email Routing ist aktiviert (MX/SPF/DKIM live). Noch ausstehend:
- Destination Address (Ziel-Email für Weiterleitungen)
- 6 Aliases: hello@, support@, dmca@, dpo@, adsense@, postmaster@kittokit.com

**Option A:** CF API Token um `Zone > Email Routing > Edit` erweitern → nächster Heartbeat erledigt Rest automatisch
**Option B:** Manuell im [Cloudflare Dashboard](https://dash.cloudflare.com) unter Email → Email Routing

---

## 🔵 Conditional: T14 (Search Console + Bing)
**Status:** Wartet auf kittokit.com live

Sobald die Domain live ist:
1. kittokit.com in Google Search Console verifizieren
2. sitemap.xml einreichen: `https://kittokit.com/sitemap-index.xml`
3. Bing Webmaster Tools einrichten (optional, cf-infra-engineer kann übernehmen)

---

## 🔵 Extern: T5 (Datenschutz + Impressum)
**Status:** Externe Pipeline (kittokit-legal-auditor der originalen kittokit-Company)

Wenn T5 abgeschlossen ist, T6 Cookie-Banner referenziert die Datenschutz-URL bereits korrekt (`/de/datenschutz`).

---

## Codebase-State

```
Branch: feature/en-i18n
npm run check: ✅ 0 errors / 0 warnings / 0 hints
npx vitest run: ✅ 1761/1761 pass (nach KIT-10 fix)
Build: ✅ 155 pages, exit 0
git log --oneline | head: sprint-commits alle unter pkcut-lab
```

---

## Nächste Schritte für dich

1. **Sofort:** `.env` updaten mit CF_RUM_TOKEN + PUBLIC_CLARITY_PROJECT_ID (T11)
2. **Sofort:** Email-Aliases in CF Dashboard anlegen oder Token erweitern (T13)
3. **Bei Go-Live:** Domain auf Cloudflare Pages zeigen lassen
4. **Nach Go-Live:** T14 Search Console + Bing Webmaster triggern
5. **Existing kittokit-Company reaktivieren** (falls gewünscht): `rm .paperclip/EMERGENCY_HALT`

---

_launch-coordinator — kittokit-launch Sprint abgeschlossen_
