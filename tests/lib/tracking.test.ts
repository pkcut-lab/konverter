import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dispatchToolUsed } from '../../src/lib/tracking';
import type { ToolUsedDetail } from '../../src/lib/tracking';

describe('dispatchToolUsed', () => {
  let handler: (e: Event) => void;
  let captured: CustomEvent<ToolUsedDetail>[];

  beforeEach(() => {
    captured = [];
    handler = (e: Event) => {
      captured.push(e as CustomEvent<ToolUsedDetail>);
    };
    document.addEventListener('tool-used', handler);
  });

  afterEach(() => {
    document.removeEventListener('tool-used', handler);
  });

  it('dispatches a tool-used CustomEvent with correct detail', () => {
    dispatchToolUsed({ slug: 'cash-discount-calculator', category: 'finance', locale: 'de' });

    expect(captured).toHaveLength(1);
    expect(captured[0].type).toBe('tool-used');
    expect(captured[0].detail).toEqual({
      slug: 'cash-discount-calculator',
      category: 'finance',
      locale: 'de',
    });
  });

  it('event does not bubble', () => {
    dispatchToolUsed({ slug: 'zinsrechner', category: 'finance', locale: 'de' });
    expect(captured[0].bubbles).toBe(false);
  });

  it('event is not cancelable', () => {
    dispatchToolUsed({ slug: 'zinsrechner', category: 'finance', locale: 'de' });
    expect(captured[0].cancelable).toBe(false);
  });

  it('dispatches once per call — caller controls dedup', () => {
    dispatchToolUsed({ slug: 'kreditrechner', category: 'finance', locale: 'de' });
    dispatchToolUsed({ slug: 'kreditrechner', category: 'finance', locale: 'de' });

    expect(captured).toHaveLength(2);
  });

  it('is a no-op when document is undefined (SSR guard)', () => {
    const dispatchSpy = vi.spyOn(document, 'dispatchEvent');

    // Temporarily make document appear unavailable
    const origDocument = globalThis.document;
    // @ts-expect-error — intentional SSR simulation
    delete globalThis.document;

    dispatchToolUsed({ slug: 'meter-zu-fuss', category: 'length', locale: 'de' });

    expect(dispatchSpy).not.toHaveBeenCalled();

    // Restore
    globalThis.document = origDocument;
    dispatchSpy.mockRestore();
  });

  it('passes correct slug and category from different tools', () => {
    const cases: ToolUsedDetail[] = [
      { slug: 'meter-to-feet', category: 'length', locale: 'de' },
      { slug: 'brutto-netto-rechner', category: 'finance', locale: 'de' },
      { slug: 'tilgungsplan-rechner', category: 'finance', locale: 'de' },
    ];

    for (const detail of cases) {
      dispatchToolUsed(detail);
    }

    expect(captured).toHaveLength(3);
    expect(captured[0].detail.slug).toBe('meter-to-feet');
    expect(captured[1].detail.slug).toBe('brutto-netto-rechner');
    expect(captured[2].detail.category).toBe('finance');
  });
});
