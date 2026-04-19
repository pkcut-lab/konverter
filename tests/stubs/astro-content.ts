// Test-only stub for Astro's virtual module `astro:content`.
// Vitest cannot resolve the virtual module, so we alias it here.
// Actual behavior is supplied by `vi.mock('astro:content', …)` in each test.
export const getCollection = async (): Promise<unknown[]> => [];
