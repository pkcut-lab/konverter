import { existsSync } from 'node:fs';
import { join } from 'node:path';

export interface ToolContentForJsonLd {
  toolId: string;
  lang: string;
  title: string;
  description: string;
  category?: string;
  toolType?: string;
  faq: Array<{ q: string; a: string }>;
  steps: Array<{ title: string; description: string }>;
  datePublished?: string;
  dateModified?: string;
  featureList?: string[];
  heroSlug?: string;
}

const APPLICATION_CATEGORY_BY_CATEGORY: Record<string, string> = {
  dev: 'DeveloperApplication',
  text: 'UtilitiesApplication',
  time: 'UtilitiesApplication',
  color: 'DesignApplication',
  image: 'MultimediaApplication',
  video: 'MultimediaApplication',
  audio: 'MultimediaApplication',
  document: 'UtilitiesApplication',
  length: 'UtilitiesApplication',
  weight: 'UtilitiesApplication',
  area: 'UtilitiesApplication',
  volume: 'UtilitiesApplication',
  distance: 'UtilitiesApplication',
  temperature: 'UtilitiesApplication',
  finance: 'FinanceApplication',
};

// Task 2.4: granular @type mapping per tool type
const WEB_APP_TYPES = new Set(['formatter', 'validator', 'analyzer', 'comparer', 'file-tool', 'interactive']);

const FILE_FORMAT_BY_CATEGORY: Record<string, string[]> = {
  image: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
  video: ['video/mp4', 'video/x-m4v'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  document: ['application/pdf'],
};

function getApplicationType(toolType?: string): string | string[] {
  if (toolType && WEB_APP_TYPES.has(toolType)) {
    return ['SoftwareApplication', 'WebApplication'];
  }
  return 'SoftwareApplication';
}

/**
 * Builds a single JSON-LD @graph block for a tool page.
 * Returns { '@context': 'https://schema.org', '@graph': [...] } — one script tag,
 * easier for validators and avoids repeated @context in the DOM.
 */
export function buildToolJsonLd(
  content: ToolContentForJsonLd,
  url: string,
): Record<string, unknown> {
  const applicationCategory =
    APPLICATION_CATEGORY_BY_CATEGORY[content.category ?? ''] ?? 'UtilitiesApplication';

  const appType = getApplicationType(content.toolType);
  const fileFormats = content.category ? FILE_FORMAT_BY_CATEGORY[content.category] : undefined;

  const graph: Record<string, unknown>[] = [];

  const softwareApp: Record<string, unknown> = {
    '@type': appType,
    name: content.title,
    description: content.description,
    url,
    applicationCategory,
    operatingSystem: 'Web',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    inLanguage: content.lang,
    creator: {
      '@type': 'Person',
      '@id': 'https://kittokit.com/de/ueber#person',
    },
  };

  if (content.datePublished) softwareApp.datePublished = content.datePublished;
  if (content.dateModified) softwareApp.dateModified = content.dateModified;
  if (fileFormats) softwareApp.fileFormat = fileFormats;
  if (content.featureList && content.featureList.length > 0) {
    softwareApp.featureList = content.featureList;
  }

  graph.push(softwareApp);

  // Task 2.5: ImageObject for tool hero if it exists on disk
  if (content.heroSlug) {
    const heroPath = join(process.cwd(), 'public', 'heroes', 'tools', `${content.heroSlug}.webp`);
    if (existsSync(heroPath)) {
      graph.push({
        '@type': 'ImageObject',
        url: `https://kittokit.com/heroes/tools/${content.heroSlug}.webp`,
        contentUrl: `https://kittokit.com/heroes/tools/${content.heroSlug}.webp`,
        width: 1200,
        height: 630,
        name: content.title,
      });
    }
  }

  if (content.faq.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: content.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  if (content.steps.length > 0) {
    graph.push({
      '@type': 'HowTo',
      name: content.title,
      step: content.steps.map((s, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: s.title,
        text: s.description,
      })),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}
