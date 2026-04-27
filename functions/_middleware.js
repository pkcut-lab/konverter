/**
 * CF Pages Middleware — runs on EVERY request, not just `/`.
 *
 * Purpose: prevent the *.pages.dev preview URL from being indexed by
 * search engines while the production custom domain (kittokit.com) is
 * indexable. Without this, Googlebot can crawl `konverter-7qc.pages.dev`
 * and present it as a duplicate of kittokit.com — diluting rankings.
 *
 * Audit P1-D (2026-04-27).
 *
 * Behaviour:
 *   - On any host that ends in `.pages.dev`, we append
 *     `X-Robots-Tag: noindex, nofollow` to every response. The deploy
 *     URL is therefore strictly off-index, while the custom domain
 *     (which never matches `.pages.dev`) is unaffected.
 *   - On the custom domain (kittokit.com / *.kittokit.com / etc.) we
 *     pass the response through untouched — robots policy comes from
 *     the in-page <meta name="robots"> per-route.
 */
export async function onRequest({ request, next }) {
  const response = await next();

  const url = new URL(request.url);
  if (url.hostname.endsWith('.pages.dev')) {
    // Clone so we can mutate headers safely (some response classes are
    // immutable until cloned).
    const headers = new Headers(response.headers);
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  return response;
}
