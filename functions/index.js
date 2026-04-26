/**
 * CF Pages Function — root language redirect.
 *
 * Behaviour:
 *   - Only intercepts the bare "/" root. Any path that already starts with a
 *     known language prefix (`/de/...`, `/en/...`) is passed through untouched
 *     so a user's explicit URL choice is always respected.
 *   - Priority for /  → cookie > Accept-Language > DEFAULT_LANG.
 *   - DEFAULT_LANG is `'en'` (changed from `'de'` 2026-04-26): EN is the broader
 *     audience for non-german browsers; DE-speakers get DE via the de;q=… token
 *     in their Accept-Language header anyway.
 *
 * Cookie name `kittokit-lang` is also written to localStorage by the header
 * language switcher (src/components/Header.astro inline script) so the choice
 * survives even if the cookie is cleared by a privacy extension.
 *
 * SUPPORTED must stay in sync with ACTIVE_LANGUAGES in src/lib/hreflang.ts.
 */
const SUPPORTED = ['de', 'en'];
const DEFAULT_LANG = 'en';
const COOKIE_NAME = 'kittokit-lang';

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Bypass: explicit language choice in path → respect it.
  for (const lang of SUPPORTED) {
    if (path === `/${lang}` || path.startsWith(`/${lang}/`)) {
      return next();
    }
  }

  // Only redirect from the bare root — every other unknown path falls through
  // to the static asset handler (which renders the localised 404 page).
  if (path !== '/') return next();

  // 1. Cookie takes highest priority (explicit user choice from the lang switcher).
  const cookieHeader = request.headers.get('Cookie') ?? '';
  const cookieLang = parseCookie(cookieHeader, COOKIE_NAME);
  if (cookieLang && SUPPORTED.includes(cookieLang)) {
    return redirect(url, cookieLang);
  }

  // 2. Accept-Language header negotiation. Falls back to DEFAULT_LANG (EN) when
  //    the browser sends no `Accept-Language` or only unsupported languages.
  const acceptLang = request.headers.get('Accept-Language') ?? '';
  const negotiated = negotiate(acceptLang, SUPPORTED);
  return redirect(url, negotiated ?? DEFAULT_LANG);
}

function redirect(url, lang) {
  const dest = new URL(url);
  // No trailing slash — astro.config.mjs has trailingSlash: 'never', so /de/
  // would chain into a second 301 to /de. One redirect, not two.
  dest.pathname = `/${lang}`;
  return Response.redirect(dest.toString(), 302);
}

function parseCookie(header, name) {
  const match = header.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function negotiate(header, supported) {
  // Parse quality-weighted list, e.g. "en-US,en;q=0.9,de;q=0.8"
  const entries = header.split(',').map((s) => {
    const [tag, q] = s.trim().split(';q=');
    return { tag: tag.trim(), q: q ? parseFloat(q) : 1.0 };
  });
  entries.sort((a, b) => b.q - a.q);

  for (const { tag } of entries) {
    const lang = tag.split('-')[0].toLowerCase();
    if (supported.includes(lang)) return lang;
  }
  return null;
}
