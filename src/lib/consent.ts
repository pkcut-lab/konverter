export type Consent = { statistik: boolean; marketing: boolean; ts: number };
const KEY = 'kittokit-consent';

export function getConsent(): Consent | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as Consent; } catch { return null; }
}

export function setConsent(c: Consent): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(c));
  window.dispatchEvent(new CustomEvent('kittokit-consent-change', { detail: c }));
}

export function hasStatistikConsent(): boolean { return getConsent()?.statistik === true; }
export function hasMarketingConsent(): boolean { return getConsent()?.marketing === true; }

export function subscribeConsent(cb: (c: Consent | null) => void): () => void {
  const handler = () => cb(getConsent());
  window.addEventListener('kittokit-consent-change', handler);
  handler();
  return () => window.removeEventListener('kittokit-consent-change', handler);
}
