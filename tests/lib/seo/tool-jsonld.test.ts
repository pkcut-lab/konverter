import { describe, it, expect } from 'vitest';
import { buildToolJsonLd } from '../../../src/lib/seo/tool-jsonld';

describe('buildToolJsonLd — @graph structure (Task 2.3)', () => {
  const content = {
    toolId: 'remove-background',
    lang: 'de',
    title: 'Hintergrund entfernen',
    description: 'Beschreibung',
    category: 'image',
    toolType: 'file-tool',
    faq: [
      { q: 'Funktioniert das offline?', a: 'Ja, nach dem ersten Modell-Download.' },
      { q: 'Ist es kostenlos?', a: 'Ja.' },
    ],
    steps: [
      { title: 'Bild hochladen', description: 'Drag-&-Drop oder Click.' },
      { title: 'Warten', description: 'KI arbeitet 100–200 ms lokal.' },
      { title: 'Download', description: 'PNG mit Transparenz.' },
    ],
  };

  const url = 'https://example.com/de/hintergrund-entfernen';

  it('returns a single object with @context and @graph', () => {
    const result = buildToolJsonLd(content, url);
    expect(result['@context']).toBe('https://schema.org');
    expect(Array.isArray(result['@graph'])).toBe(true);
  });

  it('@graph items have no nested @context (they inherit from root)', () => {
    const result = buildToolJsonLd(content, url);
    const graph = result['@graph'] as Record<string, unknown>[];
    for (const item of graph) {
      expect(item['@context']).toBeUndefined();
    }
  });

  it('@graph contains SoftwareApplication, FAQPage, HowTo (BreadcrumbList is in Breadcrumbs.astro)', () => {
    const result = buildToolJsonLd(content, url);
    const graph = result['@graph'] as Record<string, unknown>[];
    const types = graph.map((x) =>
      Array.isArray(x['@type']) ? (x['@type'] as string[]).join(',') : String(x['@type']),
    );
    expect(types.some((t) => t.includes('SoftwareApplication'))).toBe(true);
    expect(types).not.toContain('BreadcrumbList');
    expect(types).toContain('FAQPage');
    expect(types).toContain('HowTo');
  });

  it('SoftwareApplication includes name, applicationCategory, offers free', () => {
    const result = buildToolJsonLd(content, url);
    const graph = result['@graph'] as Record<string, unknown>[];
    const soft = graph.find((x) =>
      Array.isArray(x['@type'])
        ? (x['@type'] as string[]).includes('SoftwareApplication')
        : x['@type'] === 'SoftwareApplication',
    )!;
    expect(soft.name).toBe('Hintergrund entfernen');
    expect(soft.applicationCategory).toBe('MultimediaApplication');
    expect((soft.offers as { price: string }).price).toBe('0');
  });

  it('FAQPage mainEntity matches faq length', () => {
    const result = buildToolJsonLd(content, url);
    const graph = result['@graph'] as Record<string, unknown>[];
    const faq = graph.find((x) => x['@type'] === 'FAQPage');
    expect((faq?.mainEntity as unknown[]).length).toBe(2);
  });

  it('HowTo step count matches steps length', () => {
    const result = buildToolJsonLd(content, url);
    const graph = result['@graph'] as Record<string, unknown>[];
    const howTo = graph.find((x) => x['@type'] === 'HowTo');
    expect((howTo?.step as unknown[]).length).toBe(3);
  });

  it('omits FAQPage when faq is empty', () => {
    const result = buildToolJsonLd({ ...content, faq: [] }, url);
    const graph = result['@graph'] as Record<string, unknown>[];
    expect(graph.find((x) => x['@type'] === 'FAQPage')).toBeUndefined();
  });

  it('omits HowTo when steps are empty', () => {
    const result = buildToolJsonLd({ ...content, steps: [] }, url);
    const graph = result['@graph'] as Record<string, unknown>[];
    expect(graph.find((x) => x['@type'] === 'HowTo')).toBeUndefined();
  });

  it('BreadcrumbList is absent from @graph (owned by Breadcrumbs.astro component)', () => {
    const result = buildToolJsonLd(content, url);
    const graph = result['@graph'] as Record<string, unknown>[];
    expect(graph.find((x) => x['@type'] === 'BreadcrumbList')).toBeUndefined();
  });

  it('maps applicationCategory: dev → DeveloperApplication', () => {
    const result = buildToolJsonLd({ ...content, category: 'dev' }, url);
    const graph = result['@graph'] as Record<string, unknown>[];
    const soft = graph[0];
    expect(soft.applicationCategory).toBe('DeveloperApplication');
  });

  it('falls back to UtilitiesApplication for unknown category', () => {
    const result = buildToolJsonLd({ ...content, category: 'nonexistent' }, url);
    const graph = result['@graph'] as Record<string, unknown>[];
    expect(graph[0].applicationCategory).toBe('UtilitiesApplication');
  });
});

describe('buildToolJsonLd — Task 2.4: WebApplication + browserRequirements + featureList', () => {
  const base = {
    toolId: 'json-formatter',
    lang: 'de',
    title: 'JSON Formatter',
    description: 'Formatiert JSON',
    category: 'dev',
    faq: [],
    steps: [],
  };

  it('file-tool gets @type array including WebApplication', () => {
    const result = buildToolJsonLd({ ...base, toolType: 'file-tool' }, 'https://example.com/x');
    const graph = result['@graph'] as Record<string, unknown>[];
    const soft = graph[0];
    expect(Array.isArray(soft['@type'])).toBe(true);
    expect((soft['@type'] as string[]).includes('WebApplication')).toBe(true);
    expect((soft['@type'] as string[]).includes('SoftwareApplication')).toBe(true);
  });

  it('formatter gets @type array including WebApplication', () => {
    const result = buildToolJsonLd({ ...base, toolType: 'formatter' }, 'https://example.com/x');
    const graph = result['@graph'] as Record<string, unknown>[];
    expect(Array.isArray(graph[0]['@type'])).toBe(true);
    expect((graph[0]['@type'] as string[]).includes('WebApplication')).toBe(true);
  });

  it('converter gets @type string SoftwareApplication (no WebApplication)', () => {
    const result = buildToolJsonLd({ ...base, toolType: 'converter' }, 'https://example.com/x');
    const graph = result['@graph'] as Record<string, unknown>[];
    expect(graph[0]['@type']).toBe('SoftwareApplication');
  });

  it('generator gets SoftwareApplication (no WebApplication)', () => {
    const result = buildToolJsonLd({ ...base, toolType: 'generator' }, 'https://example.com/x');
    const graph = result['@graph'] as Record<string, unknown>[];
    expect(graph[0]['@type']).toBe('SoftwareApplication');
  });

  it('always includes browserRequirements', () => {
    const result = buildToolJsonLd(base, 'https://example.com/x');
    const graph = result['@graph'] as Record<string, unknown>[];
    expect(graph[0].browserRequirements).toBeTruthy();
    expect(String(graph[0].browserRequirements)).toContain('JavaScript');
  });

  it('includes featureList when provided', () => {
    const features = ['No upload', 'AES-256', 'Offline'];
    const result = buildToolJsonLd({ ...base, featureList: features }, 'https://example.com/x');
    const graph = result['@graph'] as Record<string, unknown>[];
    expect(graph[0].featureList).toEqual(features);
  });

  it('omits featureList when not provided', () => {
    const result = buildToolJsonLd(base, 'https://example.com/x');
    const graph = result['@graph'] as Record<string, unknown>[];
    expect(graph[0].featureList).toBeUndefined();
  });

  it('image file-tool includes fileFormat array', () => {
    const result = buildToolJsonLd(
      { ...base, category: 'image', toolType: 'file-tool' },
      'https://example.com/x',
    );
    const graph = result['@graph'] as Record<string, unknown>[];
    const formats = graph[0].fileFormat as string[];
    expect(Array.isArray(formats)).toBe(true);
    expect(formats).toContain('image/png');
    expect(formats).toContain('image/webp');
  });

  it('creator links to /de/ueber#person', () => {
    const result = buildToolJsonLd(base, 'https://example.com/x');
    const graph = result['@graph'] as Record<string, unknown>[];
    const creator = graph[0].creator as Record<string, unknown>;
    expect(creator['@id']).toBe('https://kittokit.com/de/ueber#person');
    expect(creator['@type']).toBe('Person');
  });
});

describe('buildToolJsonLd — Task 2.5: ImageObject for hero', () => {
  it('omits ImageObject when heroSlug is not provided', () => {
    const result = buildToolJsonLd(
      {
        toolId: 'x',
        lang: 'de',
        title: 'T',
        description: 'D',
        faq: [],
        steps: [],
      },
      'https://example.com/x',
    );
    const graph = result['@graph'] as Record<string, unknown>[];
    expect(graph.find((x) => x['@type'] === 'ImageObject')).toBeUndefined();
  });

  it('omits ImageObject when hero file does not exist on disk', () => {
    // non-existent slug → existsSync returns false → no ImageObject
    const result = buildToolJsonLd(
      {
        toolId: 'nonexistent-tool',
        lang: 'de',
        title: 'T',
        description: 'D',
        faq: [],
        steps: [],
        heroSlug: 'nonexistent-hero-slug-xyz-abc',
      },
      'https://example.com/x',
    );
    const graph = result['@graph'] as Record<string, unknown>[];
    expect(graph.find((x) => x['@type'] === 'ImageObject')).toBeUndefined();
  });
});
