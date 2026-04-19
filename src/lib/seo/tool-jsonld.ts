export interface ToolContentForJsonLd {
  toolId: string;
  lang: string;
  title: string;
  description: string;
  faq: Array<{ q: string; a: string }>;
  steps: Array<{ title: string; description: string }>;
}

export function buildToolJsonLd(
  content: ToolContentForJsonLd,
  url: string,
): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = [];

  out.push({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: content.title,
    description: content.description,
    url,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    inLanguage: content.lang,
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
