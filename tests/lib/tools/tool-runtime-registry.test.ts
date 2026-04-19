import { describe, it, expect } from 'vitest';
import { getRuntime, toolRuntimeRegistry } from '../../../src/lib/tools/tool-runtime-registry';

describe('tool-runtime-registry', () => {
  it('contains an entry for png-jpg-to-webp with process function', () => {
    const r = getRuntime('png-jpg-to-webp');
    expect(r).toBeDefined();
    expect(typeof r?.process).toBe('function');
    expect(r?.prepare).toBeUndefined();
  });

  it('returns undefined for unknown tool-id', () => {
    expect(getRuntime('does-not-exist')).toBeUndefined();
  });

  it('exports the underlying registry for test-only override', () => {
    expect(toolRuntimeRegistry).toBeDefined();
    expect(typeof toolRuntimeRegistry).toBe('object');
  });
});
