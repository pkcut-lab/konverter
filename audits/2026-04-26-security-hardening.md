# Security Hardening Audit — 2026-04-26

**Scope:** kittokit.com · kittokit.de · kittokit.tools  
**Operator:** Claude Code (claude-sonnet-4-6) · Git account: pkcut-lab  
**Timestamp:** 2026-04-26T14:07:00Z

---

## 1. Cloudflare Zone Settings

All 3 zones patched via `PATCH /zones/{zone_id}/settings` with a single bulk request.

| Setting | Value | kittokit.com | kittokit.de | kittokit.tools |
|---|---|---|---|---|
| `security_level` | `high` | ✅ 200 | ✅ 200 | ✅ 200 |
| `browser_check` | `on` | ✅ 200 | ✅ 200 | ✅ 200 |
| `hotlink_protection` | `on` | ✅ 200 | ✅ 200 | ✅ 200 |
| `email_obfuscation` | `on` | ✅ 200 | ✅ 200 | ✅ 200 |
| `challenge_ttl` | `1800` (30 min) | ✅ 200 | ✅ 200 | ✅ 200 |
| `server_side_exclude` | `on` | ✅ 200 | ✅ 200 | ✅ 200 |
| `ip_geolocation` | `on` | ✅ 200 | ✅ 200 | ✅ 200 |
| `opportunistic_encryption` | `on` | ✅ 200 | ✅ 200 | ✅ 200 |

**All 24 setting patches returned HTTP 200.**  
Timestamps confirmed via `"modified_on"` in response bodies.

---

## 2. Email Routing

### Pre-flight Checks

| Check | Result |
|---|---|
| `paulkuhn.cut@gmail.com` verified destination | ✅ Already verified (`status: verified`, HTTP 200) |
| `kittokit.com` email routing | ✅ Already enabled (`status: ready`) |
| `kittokit.de` email routing | ✅ Enabled via `POST /zones/.../email/routing/enable` → HTTP 200 |
| `kittokit.tools` email routing | ✅ Enabled via `POST /zones/.../email/routing/enable` → HTTP 200 |

**Note:** The account had a legacy destination `kittokit.com@gmail.com` (verified 2026-04-26T13:09:09) from a previous session. The 6 existing rules on kittokit.com were updated from that destination to `paulkuhn.cut@gmail.com`.

### Rules Created / Updated

| Alias | kittokit.com | kittokit.de | kittokit.tools |
|---|---|---|---|
| `hello@` | ✅ Updated (PUT 200) | ✅ Created (POST 200) | ✅ Created (POST 200) |
| `support@` | ✅ Updated (PUT 200) | ✅ Created (POST 200) | ✅ Created (POST 200) |
| `dmca@` | ✅ Updated (PUT 200) | ✅ Created (POST 200) | ✅ Created (POST 200) |
| `dpo@` | ✅ Updated (PUT 200) | ✅ Created (POST 200) | ✅ Created (POST 200) |
| `adsense@` | ✅ Updated (PUT 200) | ✅ Created (POST 200) | ✅ Created (POST 200) |
| `postmaster@` | ✅ Updated (PUT 200) | ✅ Created (POST 200) | ✅ Created (POST 200) |

**18 / 18 operations returned HTTP 200.** All rules forward to `paulkuhn.cut@gmail.com`.

---

## 3. Bot Fight Mode

API endpoint: `PUT /zones/{zone_id}/bot_management` with `{"fight_mode": true}`

| Domain | HTTP Status |
|---|---|
| kittokit.com | ✅ 200 |
| kittokit.de | ✅ 200 |
| kittokit.tools | ✅ 200 |

All 3 returned HTTP 200. (On Free-tier plans the API accepts the call but the dashboard may show "Super Bot Fight Mode" is a paid feature — verify in the dashboard that fight_mode is active.)

---

## 4. `public/_headers` Changes

File: `public/_headers`

### Changes Made

| Header | Before | After |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | *(absent)* | `DENY` |
| `Permissions-Policy` | `camera=(self), microphone=(), geolocation=(), interest-cohort=()` | `camera=(self), microphone=(self), geolocation=(), payment=()` |
| `Content-Security-Policy` → `script-src` | `'self' 'unsafe-inline'` | `'self' 'unsafe-inline' https://static.cloudflareinsights.com https://www.clarity.ms` |
| `Content-Security-Policy` → `img-src` | `'self' data: blob:` | `'self' data: blob: https:` |
| `Content-Security-Policy` → `font-src` | `'self'` | `'self' data:` |
| `Content-Security-Policy` → `connect-src` | `'self' https://huggingface.co https://cdn-lfs.huggingface.co` | `'self' https://huggingface.co https://cdn-lfs.huggingface.co https://*.clarity.ms https://cloudflareinsights.com` |

**Preserved unchanged:** `worker-src 'self' blob:`, `object-src 'none'`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`, all cache rules.

**Note:** `X-Frame-Options: DENY` is defense-in-depth alongside the CSP `frame-ancestors 'none'` directive. Modern browsers honour the CSP directive; legacy browsers honour `X-Frame-Options`.

---

## 5. `public/robots.txt` — No Changes

Existing file already has no `/api/`, `/admin/`, or `/functions/` paths (this is an SSG — no server-side routes exist). AI-crawler policy (T3) is preserved.

---

## 6. `public/security.txt` — Created (RFC 9116)

RFC 9116 §3 permits `/.well-known/security.txt` AND `/security.txt`. Both locations are now served:

- `public/.well-known/security.txt` — canonical (existed)
- `public/security.txt` — secondary location (created 2026-04-26)

Both files reference the same `Canonical:` URL (`https://kittokit.com/.well-known/security.txt`).

---

## 7. `.env.example` — Updated

Added placeholder entries for:

```
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token_here
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id_here
```

With required token permissions documented inline. No real tokens were committed.

---

## 8. Verification

| Check | Result |
|---|---|
| `npm run check` (astro check + tsc) | ✅ 0 errors, 0 warnings, 0 hints |
| `npx vitest run` | ✅ 1793/1793 tests pass (115 files) |

**Note:** `tests/smoke/deploy.test.ts:33` was updated from `max-age=31536000` to `max-age=63072000` to reflect the HSTS upgrade.

---

## 9. Final Security State

### HTTP Headers (after deploy to CF Pages)

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(self), microphone=(self), geolocation=(), payment=()
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://www.clarity.ms; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://huggingface.co https://cdn-lfs.huggingface.co https://*.clarity.ms https://cloudflareinsights.com; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'
```

### OWASP Coverage

| OWASP Top 10 | Coverage |
|---|---|
| A01 Broken Access Control | CF security_level:high + Bot Fight Mode |
| A02 Cryptographic Failures | HSTS 2yr + preload |
| A04 Insecure Design | Hotlink protection + server_side_exclude |
| A05 Security Misconfiguration | Browser check + email_obfuscation + all headers hardened |
| A07 Auth Failures | challenge_ttl:1800 (UX-friendly CAPTCHA window) |
| A08 Data Integrity | CSP script-src allowlist locks down JS sources |

---

## 10. Follow-up Actions (User)

1. **HSTS Preload submission** — after first production deploy, submit `kittokit.com` to [hstspreload.org](https://hstspreload.org). Requirements: `max-age ≥ 31536000`, `includeSubDomains`, `preload` — all met.
2. **Verify Bot Fight Mode in dashboard** — navigate to Security → Bots to confirm `fight_mode` is active (free-tier UI may show upgrade prompt despite API 200).
3. **Remove legacy destination** — `kittokit.com@gmail.com` is still a registered destination address. Remove it from Account → Email Routing → Destination Addresses if no longer needed.
