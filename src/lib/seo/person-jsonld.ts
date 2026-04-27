export interface PersonJsonLd {
  '@context': string;
  '@type': string;
  '@id': string;
  name: string;
  url: string;
  sameAs: string[];
  jobTitle: string;
}

const ABOUT_PATH: Record<string, string> = { de: 'ueber', en: 'about' };

export function buildPersonJsonLd(lang: string): PersonJsonLd {
  const base = 'https://kittokit.com';
  const aboutSlug = ABOUT_PATH[lang] ?? 'ueber';
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    // Lang-agnostic fragment-id — same identity across DE/EN/future locales.
    // Earlier this hardcoded /de/ueber#person which leaked DE on every EN
    // page (audit P1-G, 2026-04-27).
    '@id': `${base}/#person`,
    name: 'Paul Kuhn',
    url: `${base}/${lang}/${aboutSlug}`,
    sameAs: [
      'https://github.com/pkcut-lab',
    ],
    jobTitle: lang === 'de' ? 'Indie-Entwickler' : 'Indie Developer',
  };
}
