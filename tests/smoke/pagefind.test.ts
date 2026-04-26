import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Pagefind — build-step + header wiring', () => {
  const root = process.cwd();

  it('build script runs pagefind after astro build', () => {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
      scripts: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    expect(pkg.scripts.build).toMatch(/astro build\s*&&\s*pagefind\s+--site\s+dist/);
    expect(pkg.devDependencies.pagefind).toBeDefined();
  });

  it('BaseLayout tags <main> as the indexable body', () => {
    const layout = readFileSync(join(root, 'src', 'layouts', 'BaseLayout.astro'), 'utf8');
    expect(layout).toMatch(/<main[^>]*data-pagefind-body/);
  });

  it('HeaderSearch component loads /pagefind/pagefind-ui.{js,css} dynamically', () => {
    const cmp = readFileSync(join(root, 'src', 'components', 'HeaderSearch.svelte'), 'utf8');
    expect(cmp).toMatch(/\/pagefind\/pagefind-ui\.js/);
    expect(cmp).toMatch(/\/pagefind\/pagefind-ui\.css/);
    // Dev-fallback: when the bundle 404s under `astro dev`, the
    // disabled stub renders instead of throwing. Guard it with a
    // state flag so the check can't regress silently.
    expect(cmp).toMatch(/unavailable\s*=\s*\$state\(false\)/);
  });

  it('Header mounts HeaderSearch and excludes itself from indexing', () => {
    const header = readFileSync(join(root, 'src', 'components', 'Header.astro'), 'utf8');
    expect(header).toMatch(/<HeaderSearch[^>]*client:(load|idle|visible)/);
    expect(header).toMatch(/data-pagefind-ignore/);
    // The old disabled stub is gone — otherwise it competes with the
    // real input and confuses keyboard users.
    expect(header).not.toMatch(/placeholder="Tools durchsuchen \(bald verfügbar\)"/);
  });

  it('global.css remaps Pagefind CSS variables onto graphite tokens', () => {
    const css = readFileSync(join(root, 'src', 'styles', 'global.css'), 'utf8');
    expect(css).toMatch(/\.pagefind-ui\s*\{/);
    expect(css).toMatch(/--pagefind-ui-primary:\s*var\(--color-text\)/);
    expect(css).toMatch(/--pagefind-ui-background:\s*var\(--color-surface\)/);
    expect(css).toMatch(/--pagefind-ui-border:\s*var\(--color-border\)/);
    expect(css).toMatch(/--pagefind-ui-font:\s*var\(--font-family-sans\)/);
  });
});
