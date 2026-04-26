# T13 — Email Routing @kittokit.com — Worker-Output

**Status:** partial-done (Restschuld: Aliases + User-Input ausstehend)
**Agent:** cf-infra-engineer
**Timestamp:** 2026-04-26

---

## Done

### Email Routing aktiviert

- `POST /zones/754c2f2c6089f081c6b8864904079c9a/email/routing/enable` → `200 OK`
- Status: `enabled: true`, `status: "ready"`

### DNS-Records angelegt (automatisch via Enable-API)

| Type | Name                              | Value                                          | Priority |
|------|-----------------------------------|------------------------------------------------|----------|
| MX   | kittokit.com                      | route1.mx.cloudflare.net.                      | 50       |
| MX   | kittokit.com                      | route2.mx.cloudflare.net.                      | 90       |
| MX   | kittokit.com                      | route3.mx.cloudflare.net.                      | 42       |
| TXT  | kittokit.com                      | "v=spf1 include:_spf.mx.cloudflare.net ~all"   | —        |
| TXT  | cf2024-1._domainkey.kittokit.com  | DKIM key (auto-generiert, 2048-bit RSA)        | —        |

Verifiziert via `GET /zones/{zone}/dns_records?type=MX,TXT` — alle 5 Records vorhanden.

---

## Restschuld (Partial-Block)

### 1. Destination Address (Ziel-Email)
- Endpoint `POST /accounts/{account}/email/routing/addresses` gibt `10000 Authentication error`
- Ursache: API-Token hat keine **Zone > Email Routing > Edit** Permission
- User-Input-Datei geschrieben: `inbox/to-user/REQUIRES-USER-INPUT-email-target.md`

### 2. Routing Rules (6 Aliases)
- Endpoint `POST /zones/{zone}/email/routing/rules` gleicher Auth-Fehler
- Geplante Aliases (sobald Ziel-Email bestätigt + Permission vorhanden):
  - `hello@kittokit.com`
  - `support@kittokit.com`
  - `dmca@kittokit.com`
  - `dpo@kittokit.com`
  - `adsense@kittokit.com`
  - `postmaster@kittokit.com`

---

## Unblocking-Pfad

**Option A (API):** User erweitert Token um `Zone > Email Routing > Edit`, bestätigt Ziel-Email → nächster Heartbeat erstellt Aliases per API.

**Option B (Manuell):** User legt Destination + Rules im Cloudflare Dashboard an, bestätigt im Chat → T13 wird als done markiert.

---

## Übergabe an quality-reviewer

Bitte prüfen:
- DNS-Records korrekt propagiert? (MX + SPF + DKIM)
- Entscheidung: API-Token erweitern oder manuelle Dashboard-Einrichtung?
- Sobald Aliases live: T13 → done
