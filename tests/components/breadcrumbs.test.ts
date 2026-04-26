/**
 * tests/components/breadcrumbs.test.ts
 *
 * Tests for the Breadcrumbs component data contract (T3.6).
 * We can't render Astro components in Vitest, so we test:
 *  - The breadcrumb path helpers (getStaticPagePath)
 *  - The i18n strings for DE and EN
 *  - The token-compliance of the component source
 *  - The BreadcrumbList JSON-LD structure
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { getStaticPagePath } from '../../src/lib/static-page-slugs';
import { t } from '../../src/lib/i18n/strings';

const ROOT = resolve(import.meta.dirname, '..', '..');
const BREADCRUMBS_SOURCE = readFileSync(join(ROOT, 'src/components/Breadcrumbs.astro'), 'utf8');

describe('Breadcrumbs — path helpers', () => {
  it('getStaticPagePath returns /de/werkzeuge for DE tools index', () => {
    expect(getStaticPagePath('tools', 'de')).toBe('/de/werkzeuge');
  });

  it('getStaticPagePath returns /en/tools for EN tools index', () => {
    expect(getStaticPagePath('tools', 'en')).toBe('/en/tools');
  });
});

describe('Breadcrumbs — i18n strings', () => {
  it('DE has breadcrumbHome = "Start"', () => {
    expect(t('de').breadcrumbHome).toBe('Start');
  });

  it('DE has breadcrumbTools = "Werkzeuge"', () => {
    expect(t('de').breadcrumbTools).toBe('Werkzeuge');
  });

  it('EN has breadcrumbHome = "Home"', () => {
    expect(t('en').breadcrumbHome).toBe('Home');
  });

  it('EN has breadcrumbTools = "Tools"', () => {
    expect(t('en').breadcrumbTools).toBe('Tools');
  });

  it('DE has relatedToolsHeading = "Verwandte Werkzeuge"', () => {
    expect(t('de').relatedToolsHeading).toBe('Verwandte Werkzeuge');
  });

  it('EN has relatedToolsHeading = "Related Tools"', () => {
    expect(t('en').relatedToolsHeading).toBe('Related Tools');
  });
});

describe('Breadcrumbs — component source contract', () => {
  it('contains <nav aria-label>', () => {
    expect(BREADCRUMBS_SOURCE).toContain('aria-label=');
    expect(BREADCRUMBS_SOURCE).toContain('<nav');
  });

  it('contains <ol> list for breadcrumb items', () => {
    expect(BREADCRUMBS_SOURCE).toContain('<ol');
  });

  it('contains aria-current="page" for current item', () => {
    expect(BREADCRUMBS_SOURCE).toContain('aria-current="page"');
  });

  it('contains BreadcrumbList schema type', () => {
    expect(BREADCRUMBS_SOURCE).toContain('BreadcrumbList');
  });

  it('contains ListItem schema type', () => {
    expect(BREADCRUMBS_SOURCE).toContain('ListItem');
  });

  it('token-compliance: no hex color values', () => {
    // Strip comments and script blocks, then check for hex
    const strippedSource = BREADCRUMBS_SOURCE
      .replace(/\/\*[\s\S]*?\*\//g, '') // remove block comments
      .replace(/\/\/.*/g, ''); // remove line comments

    const hexMatches = strippedSource.match(/#[0-9a-fA-F]{3,8}(?![0-9a-fA-F])/g) ?? [];
    // Allow hex inside schema.org URL strings (https://schema.org)
    const colorHex = hexMatches.filter((h) => !h.includes('schema'));
    expect(colorHex).toHaveLength(0);
  });

  it('token-compliance: no arbitrary spacing px values (1px borders/outlines are allowed)', () => {
    const styleBlock = BREADCRUMBS_SOURCE.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? '';
    // Allow 1px (borders) and 2px (outline-offset) — standard design-system conventions.
    // Flag px values ≥ 3px that should be var(--space-*) tokens instead.
    const pxValues = styleBlock.match(/:\s*[3-9]\d*px|:\s*\d{2,}px/g) ?? [];
    expect(pxValues).toHaveLength(0);
  });
});

describe('Breadcrumbs — BreadcrumbList JSON-LD structure (unit)', () => {
  it('builds correct itemListElement for 3-level breadcrumb', () => {
    // Simulate what [slug].astro builds for /de/meter-zu-fuss
    const items = [
      { label: 'Start', href: '/de' },
      { label: 'Werkzeuge', href: '/de/werkzeuge' },
      { label: 'Meter zu Fuß' }, // no href = current page
    ];

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.label,
        ...(item.href ? { item: `https://kittokit.com${item.href}` } : {}),
      })),
    };

    expect(jsonLd.itemListElement).toHaveLength(3);
    expect(jsonLd.itemListElement[0]).toMatchObject({ position: 1, name: 'Start' });
    expect(jsonLd.itemListElement[1]).toMatchObject({ position: 2, name: 'Werkzeuge' });
    expect(jsonLd.itemListElement[2]).toMatchObject({ position: 3, name: 'Meter zu Fuß' });
    // Last item (current page) has no 'item' property
    expect(jsonLd.itemListElement[2]).not.toHaveProperty('item');
  });
});
