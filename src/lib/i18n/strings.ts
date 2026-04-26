import type { Lang } from '../tools/types';

export interface UiStrings {
  // Tool detail page
  asideHeading: string;
  howToSectionLabel: string;
  howToHeadingHtml: string;
  stepPrefix: string;

  // Home page
  homeTitle: string;
  homeDescription: string;
  homeH1: string;
  homeLede: string;
  homeAllTools: string;

  // Werkzeuge / Tools listing page
  categories: Record<string, string>;
  categoriesUncategorized: string;

  // Werkzeuge / tools listing page (additional)
  toolsPageTitle: string;
  toolsPageDescription: string;
  toolsPageH1: string;
  toolsPageEyebrow: string;
  toolsPageCategoriesNav: string;

  // Structured data / meta
  orgDescription: string;
  ogImageAlt: string;

  // Tool article footer
  lastUpdatedLabel: string;

  // Breadcrumb navigation
  breadcrumbHome: string;
  breadcrumbTools: string;

  // Related tools block (inside article)
  relatedToolsHeading: string;
}

const strings: Record<Lang, UiStrings> = {
  de: {
    asideHeading: 'So funktioniert es',
    howToSectionLabel: '01 — Anleitung',
    howToHeadingHtml: 'Wie benutzt du <em>dieses Tool</em>?',
    stepPrefix: 'Schritt',

    homeTitle: 'kittokit — Werkzeuge, die im Browser bleiben',
    homeDescription:
      'kittokit — Konverter, Rechner und Datei-Tools. Alle arbeiten direkt im Browser, ohne Upload, ohne Anmeldung, ohne Tracking.',
    homeH1: 'Werkzeuge, die im Browser bleiben.',
    homeLede:
      'Freisteller, Format-Umwandlung, Umrechnungen. Alles läuft auf deinem Gerät — keine Uploads, keine Anmeldung, kein Tracking.',
    homeAllTools: 'Alle Werkzeuge',

    categories: {
      finance: 'Finanzen',
      construction: 'Bauen & Renovieren',
      math: 'Mathematik',
      science: 'Wissenschaft',
      engineering: 'Technik & Ingenieur',
      health: 'Gesundheit',
      sport: 'Sport & Fitness',
      automotive: 'Auto & Fahrzeug',
      agriculture: 'Landwirtschaft',
      education: 'Bildung & Schule',
      length: 'Länge',
      weight: 'Gewicht',
      area: 'Fläche',
      volume: 'Volumen',
      distance: 'Distanz',
      temperature: 'Temperatur',
      image: 'Bild',
      video: 'Video',
      audio: 'Audio',
      document: 'Dokument',
      text: 'Text',
      color: 'Farbe',
      time: 'Zeit',
      dev: 'Entwickler',
    },
    categoriesUncategorized: 'Weitere',

    toolsPageTitle: 'Alle Werkzeuge — kittokit',
    toolsPageDescription:
      'Vollständige Übersicht aller kittokit-Werkzeuge, gruppiert nach Kategorie. Alles läuft im Browser, ohne Upload, ohne Tracking, ohne Anmeldung.',
    toolsPageH1: 'Alle Werkzeuge',
    toolsPageEyebrow: 'Übersicht',
    toolsPageCategoriesNav: 'Kategorien',

    orgDescription:
      'kittokit — schnelle Browser-Tools: Konverter, Rechner, Datei-Werkzeuge. Pure-client, ohne Upload, ohne Tracking.',
    ogImageAlt: 'kittokit — Schnelle Tools. Kein Upload. Kein Tracking.',

    lastUpdatedLabel: 'Zuletzt aktualisiert:',

    breadcrumbHome: 'Start',
    breadcrumbTools: 'Werkzeuge',
    relatedToolsHeading: 'Verwandte Werkzeuge',
  },

  en: {
    asideHeading: 'How It Works',
    howToSectionLabel: '01 — How to Use',
    howToHeadingHtml: 'How do you use <em>this tool</em>?',
    stepPrefix: 'Step',

    homeTitle: 'kittokit — Tools That Stay in Your Browser',
    homeDescription:
      'kittokit — converters, calculators, and file tools. Everything runs directly in your browser — no uploads, no sign-up, no tracking.',
    homeH1: 'Tools That Stay in Your Browser.',
    homeLede:
      'Background removal, format conversion, unit conversions. All processing happens on your device — no uploads, no account, no tracking.',
    homeAllTools: 'All Tools',

    categories: {
      finance: 'Finance',
      construction: 'Construction & Renovation',
      math: 'Math',
      science: 'Science',
      engineering: 'Engineering',
      health: 'Health',
      sport: 'Sports & Fitness',
      automotive: 'Automotive',
      agriculture: 'Agriculture',
      education: 'Education',
      length: 'Length',
      weight: 'Weight',
      area: 'Area',
      volume: 'Volume',
      distance: 'Distance',
      temperature: 'Temperature',
      image: 'Images',
      video: 'Video',
      audio: 'Audio',
      document: 'Documents',
      text: 'Text',
      color: 'Color',
      time: 'Time',
      dev: 'Developer',
    },
    categoriesUncategorized: 'Other',

    toolsPageTitle: 'All Tools — kittokit',
    toolsPageDescription:
      'Browse all kittokit tools, grouped by category. Everything runs in your browser — no uploads, no tracking, no sign-up.',
    toolsPageH1: 'All Tools',
    toolsPageEyebrow: 'Overview',
    toolsPageCategoriesNav: 'Categories',

    orgDescription:
      'kittokit — fast browser tools: converters, calculators, file utilities. Pure client-side, no uploads, no tracking.',
    ogImageAlt: 'kittokit — Fast Tools. No Uploads. No Tracking.',

    lastUpdatedLabel: 'Last updated:',

    breadcrumbHome: 'Home',
    breadcrumbTools: 'Tools',
    relatedToolsHeading: 'Related Tools',
  },
};

export function t(lang: Lang): UiStrings {
  return strings[lang] ?? strings.de;
}
