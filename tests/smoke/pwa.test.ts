import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('PWA — Manifest + Icons', () => {
  const root = process.cwd();

  it('manifest.webmanifest exists under public/', () => {
    expect(existsSync(join(root, 'public', 'manifest.webmanifest'))).toBe(true);
  });

  it('manifest has the required PWA fields', () => {
    const raw = readFileSync(join(root, 'public', 'manifest.webmanifest'), 'utf8');
    const manifest = JSON.parse(raw);

    expect(manifest.name).toBe('Konverter');
    expect(manifest.short_name).toBe('Konverter');
    expect(manifest.start_url).toBe('/de/');
    expect(manifest.scope).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(typeof manifest.description).toBe('string');
    expect(manifest.description.length).toBeGreaterThan(30);
    expect(manifest.theme_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(manifest.background_color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(manifest.lang).toBe('de');
  });

  it('manifest declares all four icon variants (SVG + 192 + 512 + maskable)', () => {
    const manifest = JSON.parse(
      readFileSync(join(root, 'public', 'manifest.webmanifest'), 'utf8'),
    ) as {
      icons: Array<{ src: string; sizes: string; type: string; purpose: string }>;
    };

    expect(manifest.icons).toHaveLength(4);

    const svg = manifest.icons.find((i) => i.type === 'image/svg+xml');
    expect(svg).toBeDefined();
    expect(svg?.src).toBe('/icon.svg');

    const png192 = manifest.icons.find((i) => i.sizes === '192x192');
    expect(png192?.src).toBe('/icon-192.png');

    const png512 = manifest.icons.find((i) => i.sizes === '512x512' && i.purpose === 'any');
    expect(png512?.src).toBe('/icon-512.png');

    const maskable = manifest.icons.find((i) => i.purpose === 'maskable');
    expect(maskable?.src).toBe('/icon-maskable-512.png');
    expect(maskable?.sizes).toBe('512x512');
  });

  it('all manifest-referenced icon assets exist on disk', () => {
    const manifest = JSON.parse(
      readFileSync(join(root, 'public', 'manifest.webmanifest'), 'utf8'),
    ) as { icons: Array<{ src: string }> };

    for (const icon of manifest.icons) {
      const path = join(root, 'public', icon.src.replace(/^\//, ''));
      expect(existsSync(path), `missing ${icon.src}`).toBe(true);
    }
  });

  it('favicon-32.png (browser tab) exists', () => {
    expect(existsSync(join(root, 'public', 'favicon-32.png'))).toBe(true);
  });

  it('BaseLayout wires manifest + icons + apple-touch-icon + apple-web-app tags', () => {
    const layout = readFileSync(join(root, 'src', 'layouts', 'BaseLayout.astro'), 'utf8');

    expect(layout).toMatch(/rel="manifest"\s+href="\/manifest\.webmanifest"/);
    expect(layout).toMatch(/rel="icon"\s+type="image\/svg\+xml"\s+href="\/icon\.svg"/);
    expect(layout).toMatch(/rel="icon"\s+type="image\/png"\s+sizes="32x32"\s+href="\/favicon-32\.png"/);
    expect(layout).toMatch(/rel="apple-touch-icon"\s+href="\/icon-192\.png"/);
    expect(layout).toMatch(/name="apple-mobile-web-app-capable"\s+content="yes"/);
    expect(layout).toMatch(/name="apple-mobile-web-app-title"\s+content="Konverter"/);
    expect(layout).toMatch(/name="application-name"\s+content="Konverter"/);
  });

  it('BaseLayout references /registerSW.js so the Workbox SW gets claimed', () => {
    const layout = readFileSync(join(root, 'src', 'layouts', 'BaseLayout.astro'), 'utf8');
    expect(layout).toMatch(/src="\/registerSW\.js"/);
  });

  it('astro.config wires @vite-pwa/astro with autoUpdate + runtime caching', () => {
    const config = readFileSync(join(root, 'astro.config.mjs'), 'utf8');

    expect(config).toMatch(/@vite-pwa\/astro/);
    expect(config).toMatch(/registerType:\s*['"]autoUpdate['"]/);
    expect(config).toMatch(/manifestFilename:\s*['"]manifest\.webmanifest['"]/);
    // Model + pagefind runtime caching are the two non-precache paths
    // that matter for offline BG-Remover + search latency.
    // Cache names are the stable anchor — regex literals escape the dot
    // as `\.` in source, so we assert on the name, not the hostname.
    expect(config).toMatch(/cacheName:\s*['"]hf-model-cache['"]/);
    expect(config).toMatch(/cacheName:\s*['"]pagefind-index['"]/);
    // Lazy chunks must be excluded — otherwise precache balloons and
    // every visitor pays the transformers.js download even on /styleguide.
    expect(config).toMatch(/FileTool\.\*\.js/);
    expect(config).toMatch(/heic2any\.\*\.js/);
  });
});
