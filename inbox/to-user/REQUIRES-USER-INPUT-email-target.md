# T13 partial-block: Ziel-Email für Forwarding + API-Token-Permission benötigt

**Status:** Email Routing aktiviert, DNS-Records gesetzt — Aliases noch ausstehend

---

## Was bereits erledigt ist

- Cloudflare Email Routing für `kittokit.com` **enabled** (Status: `ready`)
- DNS-Records automatisch angelegt:
  - `MX kittokit.com → route1.mx.cloudflare.net (pri 50)`
  - `MX kittokit.com → route2.mx.cloudflare.net (pri 90)`
  - `MX kittokit.com → route3.mx.cloudflare.net (pri 42)`
  - `TXT kittokit.com → "v=spf1 include:_spf.mx.cloudflare.net ~all"`
  - `TXT cf2024-1._domainkey.kittokit.com → DKIM-Record (auto-generiert)`

---

## Was du tun musst

### Option A — API-Token erweitern (empfohlen für Automation)

1. Gehe zu: https://dash.cloudflare.com/profile/api-tokens
2. Öffne den bestehenden Token
3. Füge folgende Permission hinzu:
   - **Zone > Email Routing > Edit**
4. Sag im Chat: `"T13 token updated"` — dann lege ich die 6 Aliases per API an

### Option B — Manuell im Dashboard (schneller)

1. Gehe zu: https://dash.cloudflare.com → Zone `kittokit.com` → **Email** → **Email Routing**
2. Unter **Destination addresses**: füge deine Ziel-Email hinzu und verifiziere sie
   - Empfehlung: `paulkuhn.cut@gmail.com`
3. Unter **Routing rules**: lege diese 6 Aliases an (alle → deine Ziel-Email):
   - `hello@kittokit.com`
   - `support@kittokit.com`
   - `dmca@kittokit.com`
   - `dpo@kittokit.com`
   - `adsense@kittokit.com`
   - `postmaster@kittokit.com`
4. Sag im Chat: `"T13 manual aliases done"` — dann markiere ich T13 als done

---

## Ziel-Email bestätigen

Falls du Option A wählst, bestätige auch deine Ziel-Email:

> Tippe: `"T13 forward to paulkuhn.cut@gmail.com"` (oder deine bevorzugte Adresse)
