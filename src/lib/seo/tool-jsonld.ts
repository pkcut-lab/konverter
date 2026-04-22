interface ToolContentForJsonLd {
  toolId: string;
  lang: string;
  title: string;
  description: string;
  category?: string;
  faq: Array<{ q: string; a: string }>;
  steps: Array<{ title: string; description: string }>;
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
};

export function buildToolJsonLd(
  content: ToolContentForJsonLd,
  url: string,
): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = [];
  const applicationCategory =
    APPLICATION_CATEGORY_BY_CATEGORY[content.category ?? ''] ?? 'UtilitiesApplication';

  out.push({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: content.title,
    description: content.description,
    url,
    applicationCategory,
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    inLanguage: content.lang,
  });

  const origin = new URL(url).origin;
  out.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/${content.lang}` },
      { '@type': 'ListItem', position: 2, name: content.title, item: url },
    ],
  });

  if (content.faq.length > 0) {
    out.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: content.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }

  if (content.steps.length > 0) {
    out.push({
      '@context': 'https://schema.org',
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

  return out;
}
