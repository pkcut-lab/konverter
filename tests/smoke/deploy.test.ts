import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('Deploy — Cloudflare Pages wiring', () => {
  const root = process.cwd();

  it('astro.config `site` matches the canonical kittokit.com domain', () => {
    const config = readFileSync(join(root, 'astro.config.mjs'), 'utf8');
    expect(config).toMatch(/site:\s*['"]https:\/\/kittokit\.com['"]/);
  });

  it('src/lib/site.ts SITE_URL matches astro.config (single source of truth)', () => {
    const site = readFileSync(join(root, 'src', 'lib', 'site.ts'), 'utf8');
    expect(site).toMatch(/SITE_URL\s*=\s*['"]https:\/\/kittokit\.com['"]/);
  });

  it('public/_headers exists and pins SW + hashed-asset cache strategy', () => {
    const path = join(root, 'public', '_headers');
    expect(existsSync(path)).toBe(true);
    const headers = readFileSync(path, 'utf8');

    // SW must not be cached by the browser — otherwise Workbox
    // skipWaiting can't land and users stay on the old shell forever.
    expect(headers).toMatch(/\/sw\.js[\s\S]*?Cache-Control:\s*no-cache/);
    // Hashed bundles are immutable; long cache is safe.
    expect(headers).toMatch(/\/_astro\/\*[\s\S]*?max-age=31536000,\s*immutable/);
    // Fonts are content-identified by name, same treatment.
    expect(headers).toMatch(/\/fonts\/\*[\s\S]*?max-age=31536000,\s*immutable/);
    // Manifest short cache so icon/theme-color updates land fast.
    expect(headers).toMatch(/\/manifest\.webmanifest[\s\S]*?max-age=3600/);
    // Baseline security headers on every response.
    expect(headers).toMatch(/Strict-Transport-Security:\s*max-age=31536000/);
    expect(headers).toMatch(/X-Content-Type-Options:\s*nosniff/);
    expect(headers).toMatch(/Referrer-Policy:\s*strict-origin-when-cross-origin/);
  });

  it('public/_redirects sends / to /de/ as 301 (replaces Astro\'s meta-refresh stub)', () => {
    const path = join(root, 'public', '_redirects');
    expect(existsSync(path)).toBe(true);
    const redirects = readFileSync(path, 'utf8');
    expect(redirects).toMatch(/^\/\s+\/de\/\s+301\s*$/m);
  });

  it('GitHub Actions workflow wires verify → deploy on push to main', () => {
    const path = join(root, '.github', 'workflows', 'deploy.yml');
    expect(existsSync(path)).toBe(true);
    const wf = readFileSync(path, 'utf8');

    // Trigger rules — main push + PR preview.
    expect(wf).toMatch(/on:\s*[\s\S]*?push:\s*[\s\S]*?branches:\s*\[\s*main\s*\]/);
    expect(wf).toMatch(/pull_request:/);

    // Two jobs: verify gates the deploy, deploy needs verify.
    expect(wf).toMatch(/verify:/);
    expect(wf).toMatch(/deploy:\s*[\s\S]*?needs:\s*verify/);

    // Verify runs the full gate.
    expect(wf).toMatch(/npm ci/);
    expect(wf).toMatch(/npm run check/);
    expect(wf).toMatch(/npm test/);
    expect(wf).toMatch(/npm run build/);

    // Deploy hands the dist artifact to wrangler and pins the project.
    expect(wf).toMatch(/cloudflare\/wrangler-action@v3/);
    expect(wf).toMatch(/project-name=konverter-7qc/);
    // Preview-URL pattern depends on the branch flag being dynamic —
    // head_ref (PRs) or ref_name (pushes).
    expect(wf).toMatch(/github\.head_ref\s*\|\|\s*github\.ref_name/);

    // Concurrency guard so two deploys on the same ref can't race.
    expect(wf).toMatch(/cancel-in-progress:\s*true/);
  });

  it('DEPLOY.md documents the secrets the user must set before first deploy', () => {
    const path = join(root, 'DEPLOY.md');
    expect(existsSync(path)).toBe(true);
    const doc = readFileSync(path, 'utf8');
    expect(doc).toMatch(/CLOUDFLARE_API_TOKEN/);
    expect(doc).toMatch(/CLOUDFLARE_ACCOUNT_ID/);
    // Project-name invariant referenced here too — keeps the three
    // places (workflow, dashboard, docs) aligned.
    expect(doc).toMatch(/konverter-7qc/);
  });
});
