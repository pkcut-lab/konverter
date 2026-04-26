import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getConsent, setConsent, hasStatistikConsent, hasMarketingConsent } from '../../src/lib/consent';

describe('consent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('getConsent', () => {
    it('returns null when no consent stored', () => {
      expect(getConsent()).toBeNull();
    });

    it('returns stored consent object', () => {
      const c = { statistik: true, marketing: false, ts: 1000 };
      localStorage.setItem('kittokit-consent', JSON.stringify(c));
      expect(getConsent()).toEqual(c);
    });

    it('returns null on malformed JSON', () => {
      localStorage.setItem('kittokit-consent', '{invalid json}');
      expect(getConsent()).toBeNull();
    });

    it('returns null when localStorage is unavailable (SSR guard)', () => {
      const orig = globalThis.localStorage;
      // @ts-expect-error — intentional SSR simulation
      delete globalThis.localStorage;
      expect(getConsent()).toBeNull();
      // Restore
      globalThis.localStorage = orig;
    });
  });

  describe('setConsent', () => {
    it('stores consent in localStorage', () => {
      setConsent({ statistik: true, marketing: false, ts: 2000 });
      const raw = localStorage.getItem('kittokit-consent');
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!)).toEqual({ statistik: true, marketing: false, ts: 2000 });
    });

    it('dispatches kittokit-consent-change event', () => {
      const events: Event[] = [];
      window.addEventListener('kittokit-consent-change', (e) => events.push(e));
      setConsent({ statistik: false, marketing: false, ts: 3000 });
      window.removeEventListener('kittokit-consent-change', (e) => events.push(e));
      expect(events).toHaveLength(1);
      expect((events[0] as CustomEvent).detail).toEqual({ statistik: false, marketing: false, ts: 3000 });
    });

    it('overwrites previous consent', () => {
      setConsent({ statistik: false, marketing: false, ts: 1000 });
      setConsent({ statistik: true, marketing: true, ts: 2000 });
      expect(getConsent()).toEqual({ statistik: true, marketing: true, ts: 2000 });
    });
  });

  describe('hasStatistikConsent', () => {
    it('returns false when no consent stored', () => {
      expect(hasStatistikConsent()).toBe(false);
    });

    it('returns true when statistik is true', () => {
      setConsent({ statistik: true, marketing: false, ts: 0 });
      expect(hasStatistikConsent()).toBe(true);
    });

    it('returns false when statistik is false', () => {
      setConsent({ statistik: false, marketing: true, ts: 0 });
      expect(hasStatistikConsent()).toBe(false);
    });
  });

  describe('hasMarketingConsent', () => {
    it('returns false when no consent stored', () => {
      expect(hasMarketingConsent()).toBe(false);
    });

    it('returns true when marketing is true', () => {
      setConsent({ statistik: false, marketing: true, ts: 0 });
      expect(hasMarketingConsent()).toBe(true);
    });

    it('returns false when marketing is false', () => {
      setConsent({ statistik: true, marketing: false, ts: 0 });
      expect(hasMarketingConsent()).toBe(false);
    });
  });
});
