export interface PersonJsonLd {
  '@context': string;
  '@type': string;
  '@id': string;
  name: string;
  url: string;
  sameAs: string[];
  jobTitle: string;
}

export function buildPersonJsonLd(lang: string): PersonJsonLd {
  const base = 'https://kittokit.com';
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${base}/de/ueber#person`,
    name: 'Paul Kuhn',
    url: `${base}/${lang}/ueber`,
    sameAs: [
      'https://github.com/pkcut-lab',
    ],
    jobTitle: lang === 'de' ? 'Indie-Entwickler' : 'Indie Developer',
  };
}
