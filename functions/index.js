/**
 * CF Pages Function — root language redirect.
 * Priority: cookie > Accept-Language header > default (de).
 * Supported languages must stay in sync with ACTIVE_LANGUAGES in hreflang.ts.
 */
const SUPPORTED = ['de', 'en'];
const DEFAULT_LANG = 'de';
const COOKIE_NAME = 'kittokit-lang';

export async function onRequest({ request, next }) {
  const url = new URL(request.url);

  // Only intercept the bare root — everything else passes through.
  if (url.pathname !== '/') return next();

  // 1. Cookie takes highest priority (explicit user choice).
  const cookieHeader = request.headers.get('Cookie') ?? '';
  const cookieLang = parseCookie(cookieHeader, COOKIE_NAME);
  if (cookieLang && SUPPORTED.includes(cookieLang)) {
    return redirect(url, cookieLang);
  }

  // 2. Accept-Language header negotiation.
  const acceptLang = request.headers.get('Accept-Language') ?? '';
  const negotiated = negotiate(acceptLang, SUPPORTED);
  return redirect(url, negotiated ?? DEFAULT_LANG);
}

function redirect(url, lang) {
  const dest = new URL(url);
  dest.pathname = `/${lang}/`;
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
