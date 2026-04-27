import type { Lang } from './lang';

/**
 * Centralised UI strings — single source of truth for every user-visible
 * label, button, error, ARIA-label, and meta-string in the app.
 *
 * The `UiStrings` interface is the contract: every active language MUST
 * provide every key. Adding a new language to `Lang` makes the `strings`
 * record below a TypeScript compile-error until every entry is filled in.
 *
 * Component conventions:
 *   - Components receive `lang: Lang` as a prop (or read it from the
 *     `[lang]` route segment) and call `t(lang).<section>.<key>`.
 *   - No component should define its own `Record<string, string>` map
 *     of localised strings. If you find one, fold it into the section
 *     here and import.
 */

export interface UiStrings {
  // ── Tool detail page ────────────────────────────────────────────
  asideHeading: string;
  howToSectionLabel: string;
  howToHeadingHtml: string;
  stepPrefix: string;

  // ── Home page ──────────────────────────────────────────────────
  homeTitle: string;
  homeDescription: string;
  homeH1: string;
  homeLede: string;
  homeAllTools: string;

  // ── Categories (used in tool listings) ─────────────────────────
  categories: Record<string, string>;
  categoriesUncategorized: string;

  // ── Tools listing page ─────────────────────────────────────────
  toolsPageTitle: string;
  toolsPageDescription: string;
  toolsPageH1: string;
  toolsPageEyebrow: string;
  toolsPageCategoriesNav: string;
  toolsPageLede: string;
  toolsPageItemCountLabel: string;

  // ── Structured data / OpenGraph ────────────────────────────────
  orgDescription: string;
  ogImageAlt: string;

  // ── Tool article footer ────────────────────────────────────────
  lastUpdatedLabel: string;

  // ── Breadcrumb navigation ──────────────────────────────────────
  breadcrumbHome: string;
  breadcrumbTools: string;

  // ── Related tools block ────────────────────────────────────────
  relatedToolsHeading: string;
  youMightAlsoLike: string;

  // ── Header ─────────────────────────────────────────────────────
  header: {
    searchPlaceholder: string;
    searchLabel: string;
    nav: {
      tools: string;
      about: string;
    };
    popularLabel: string;
    brandAria: string;
    mainNavAria: string;
    /** Endonym used as aria-label for language switcher buttons. */
    endonym: string;
  };

  // ── Footer ─────────────────────────────────────────────────────
  footer: {
    legalHeading: string;
    privacyLabel: string;
    privacyHref: string;
    imprintLabel: string;
    imprintHref: string;
    tagline: string;
    brandAria: string;
    backToTop: string;
    moreTools: string;
  };

  // ── Theme toggle ───────────────────────────────────────────────
  themeToggle: {
    groupLabel: string;
    auto: string;
    light: string;
    dark: string;
  };

  // ── Cookie banner ──────────────────────────────────────────────
  cookieBanner: {
    bannerAria: string;
    drawerAria: string;
    eyebrowPrivacy: string;
    eyebrowSelection: string;
    bodyHtml: string;
    privacyLinkLabel: string;
    privacyHref: string;
    acceptAll: string;
    selectChoices: string;
    acceptNecessary: string;
    save: string;
    necessaryLabel: string;
    necessaryNote: string;
    statisticsLabel: string;
    statisticsNote: string;
    marketingLabel: string;
    marketingNote: string;
  };

  // ── Skip-to-content link ───────────────────────────────────────
  skipToContent: string;

  // ── Search (Pagefind UI overrides + fallback) ──────────────────
  search: {
    hostAria: string;
    fallbackPlaceholder: string;
    pagefind: {
      clearSearch: string;
      loadMore: string;
      searchLabel: string;
      filtersLabel: string;
      zeroResults: string;
      manyResults: string;
      oneResult: string;
      altSearch: string;
      searchSuggestion: string;
      searching: string;
    };
  };

  // ── Common tool-UI strings (Converter, Generator, Comparer, …) ─
  toolsCommon: {
    copy: string;
    copied: string;
    copyAria: string;
    swap: string;
    swapAria: string;
    quickValues: string;
    privacyBadgeAria: string;
    reset: string;
    download: string;
    upload: string;
    pickFile: string;
    dropHere: string;
    processing: string;
    loading: string;
    done: string;
    cancel: string;
    inputLabel: string;
    outputLabel: string;
    encodeLabel: string;
    decodeLabel: string;
    fileTooLarge: string;
    invalidFormat: string;
    genericError: string;
  };

  // ── Validation / error messages ────────────────────────────────
  errors: {
    required: string;
    invalidNumber: string;
    outOfRange: string;
    emptyInput: string;
    parseFailed: string;
  };
}

const strings: Record<Lang, UiStrings> = {
  // ════════════════════════════════════════════════════════════════
  //  GERMAN
  // ════════════════════════════════════════════════════════════════
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
      nature: 'Natur & Astronomie',
    },
    categoriesUncategorized: 'Weitere',

    toolsPageTitle: 'Alle Werkzeuge — kittokit',
    toolsPageDescription:
      'Vollständige Übersicht aller kittokit-Werkzeuge, gruppiert nach Kategorie. Alles läuft im Browser, ohne Upload, ohne Tracking, ohne Anmeldung.',
    toolsPageH1: 'Alle Werkzeuge',
    toolsPageEyebrow: 'Übersicht',
    toolsPageCategoriesNav: 'Kategorien',
    toolsPageLede:
      '{count} Werkzeuge, gruppiert nach Kategorie. Alles läuft direkt im Browser — kein Upload, keine Anmeldung, kein Tracking.',
    toolsPageItemCountLabel: 'Werkzeuge',

    orgDescription:
      'kittokit — schnelle Browser-Tools: Konverter, Rechner, Datei-Werkzeuge. Pure-client, ohne Upload, ohne Tracking.',
    ogImageAlt: 'kittokit — Schnelle Tools. Kein Upload. Kein Tracking.',

    lastUpdatedLabel: 'Zuletzt aktualisiert:',

    breadcrumbHome: 'Start',
    breadcrumbTools: 'Werkzeuge',
    relatedToolsHeading: 'Verwandte Werkzeuge',
    youMightAlsoLike: 'Das könnte dir auch gefallen',

    header: {
      searchPlaceholder: 'Tools durchsuchen',
      searchLabel: 'Tools durchsuchen',
      nav: {
        tools: 'Werkzeuge',
        about: 'Über',
      },
      popularLabel: 'Beliebt',
      brandAria: 'kittokit — Startseite',
      mainNavAria: 'Hauptnavigation',
      endonym: 'Deutsch',
    },

    footer: {
      legalHeading: 'Rechtliches',
      privacyLabel: 'Datenschutz',
      privacyHref: '/datenschutz',
      imprintLabel: 'Impressum',
      imprintHref: '/impressum',
      tagline: 'Schnelle Tools. Kein Upload. Kein Tracking.',
      brandAria: 'kittokit — Startseite',
      backToTop: 'Nach oben',
      moreTools: '+ {count} weitere Werkzeuge →',
    },

    themeToggle: {
      groupLabel: 'Farbschema auswählen',
      auto: 'Auto',
      light: 'Hell',
      dark: 'Dunkel',
    },

    cookieBanner: {
      bannerAria: 'Cookie-Einstellungen',
      drawerAria: 'Cookie-Auswahl',
      eyebrowPrivacy: 'Datenschutz',
      eyebrowSelection: 'Auswahl',
      bodyHtml:
        'kittokit nutzt nur notwendige Cookies. Mit deiner Zustimmung helfen Statistik-Cookies (Microsoft Clarity) und später Marketing-Cookies (Google AdSense), kittokit zu verbessern. Details in {privacyLink}.',
      privacyLinkLabel: 'Datenschutz',
      privacyHref: '/datenschutz',
      acceptAll: 'Alle akzeptieren',
      selectChoices: 'Auswählen',
      acceptNecessary: 'Nur notwendige',
      save: 'Speichern',
      necessaryLabel: 'Notwendig',
      necessaryNote: '(immer aktiv)',
      statisticsLabel: 'Statistik',
      statisticsNote: '(Microsoft Clarity)',
      marketingLabel: 'Marketing',
      marketingNote: '(Google AdSense)',
    },

    skipToContent: 'Zum Inhalt springen',

    search: {
      hostAria: 'Tool-Suche',
      fallbackPlaceholder: 'Tools durchsuchen (nur im Produktions-Build)',
      pagefind: {
        clearSearch: 'Zurücksetzen',
        loadMore: 'Mehr laden',
        searchLabel: 'Tools durchsuchen',
        filtersLabel: 'Filter',
        zeroResults: 'Nichts gefunden zu [SEARCH_TERM]',
        manyResults: '[COUNT] Ergebnisse zu [SEARCH_TERM]',
        oneResult: '[COUNT] Ergebnis zu [SEARCH_TERM]',
        altSearch: 'Nichts gefunden zu [SEARCH_TERM] — [DISPLAY_QUERY] anzeigen',
        searchSuggestion: 'Nichts gefunden zu [SEARCH_TERM] — andere Suche: [DISPLAY_QUERY]',
        searching: 'Suche [SEARCH_TERM]…',
      },
    },

    toolsCommon: {
      copy: 'Kopieren',
      copied: 'Kopiert',
      copyAria: 'Ergebnis kopieren',
      swap: 'Tauschen',
      swapAria: 'Richtung tauschen',
      quickValues: 'Häufige Werte',
      privacyBadgeAria: 'Datenschutz-Hinweis',
      reset: 'Zurücksetzen',
      download: 'Herunterladen',
      upload: 'Hochladen',
      pickFile: 'Datei wählen',
      dropHere: 'Datei hier ablegen',
      processing: 'Verarbeitung läuft …',
      loading: 'Lädt …',
      done: 'Fertig',
      cancel: 'Abbrechen',
      inputLabel: 'Eingabe',
      outputLabel: 'Ergebnis',
      encodeLabel: 'Kodieren',
      decodeLabel: 'Dekodieren',
      fileTooLarge: 'Datei ist zu groß.',
      invalidFormat: 'Ungültiges Format.',
      genericError: 'Etwas ist schiefgelaufen.',
    },

    errors: {
      required: 'Pflichtfeld',
      invalidNumber: 'Bitte eine gültige Zahl eingeben.',
      outOfRange: 'Wert außerhalb des erlaubten Bereichs.',
      emptyInput: 'Eingabe ist leer.',
      parseFailed: 'Konnte Eingabe nicht verarbeiten.',
    },
  },

  // ════════════════════════════════════════════════════════════════
  //  ENGLISH
  // ════════════════════════════════════════════════════════════════
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
      nature: 'Nature & Astronomy',
    },
    categoriesUncategorized: 'Other',

    toolsPageTitle: 'All Tools — kittokit',
    toolsPageDescription:
      'Browse all kittokit tools, grouped by category. Everything runs in your browser — no uploads, no tracking, no sign-up.',
    toolsPageH1: 'All Tools',
    toolsPageEyebrow: 'Overview',
    toolsPageCategoriesNav: 'Categories',
    toolsPageLede:
      '{count} tools, grouped by category. Everything runs directly in your browser — no uploads, no account, no tracking.',
    toolsPageItemCountLabel: 'tools',

    orgDescription:
      'kittokit — fast browser tools: converters, calculators, file utilities. Pure client-side, no uploads, no tracking.',
    ogImageAlt: 'kittokit — Fast Tools. No Uploads. No Tracking.',

    lastUpdatedLabel: 'Last updated:',

    breadcrumbHome: 'Home',
    breadcrumbTools: 'Tools',
    relatedToolsHeading: 'Related Tools',
    youMightAlsoLike: 'You might also like',

    header: {
      searchPlaceholder: 'Search tools',
      searchLabel: 'Search tools',
      nav: {
        tools: 'Tools',
        about: 'About',
      },
      popularLabel: 'Popular',
      brandAria: 'kittokit — Homepage',
      mainNavAria: 'Main navigation',
      endonym: 'English',
    },

    footer: {
      legalHeading: 'Legal',
      privacyLabel: 'Privacy',
      privacyHref: '/privacy',
      imprintLabel: 'Imprint',
      imprintHref: '/imprint',
      tagline: 'Fast tools. No uploads. No tracking.',
      brandAria: 'kittokit — Homepage',
      backToTop: 'Back to top',
      moreTools: '+ {count} more tools →',
    },

    themeToggle: {
      groupLabel: 'Choose color scheme',
      auto: 'Auto',
      light: 'Light',
      dark: 'Dark',
    },

    cookieBanner: {
      bannerAria: 'Cookie settings',
      drawerAria: 'Cookie selection',
      eyebrowPrivacy: 'Privacy',
      eyebrowSelection: 'Selection',
      bodyHtml:
        'kittokit only uses necessary cookies by default. With your consent, statistics cookies (Microsoft Clarity) and later marketing cookies (Google AdSense) help improve kittokit. Details in {privacyLink}.',
      privacyLinkLabel: 'Privacy',
      privacyHref: '/privacy',
      acceptAll: 'Accept all',
      selectChoices: 'Choose',
      acceptNecessary: 'Necessary only',
      save: 'Save',
      necessaryLabel: 'Necessary',
      necessaryNote: '(always active)',
      statisticsLabel: 'Statistics',
      statisticsNote: '(Microsoft Clarity)',
      marketingLabel: 'Marketing',
      marketingNote: '(Google AdSense)',
    },

    skipToContent: 'Skip to content',

    search: {
      hostAria: 'Tool search',
      fallbackPlaceholder: 'Search tools (production build only)',
      pagefind: {
        clearSearch: 'Clear',
        loadMore: 'Load more',
        searchLabel: 'Search tools',
        filtersLabel: 'Filters',
        zeroResults: 'No results for [SEARCH_TERM]',
        manyResults: '[COUNT] results for [SEARCH_TERM]',
        oneResult: '[COUNT] result for [SEARCH_TERM]',
        altSearch: 'No results for [SEARCH_TERM] — showing [DISPLAY_QUERY]',
        searchSuggestion: 'No results for [SEARCH_TERM] — try [DISPLAY_QUERY]',
        searching: 'Searching [SEARCH_TERM]…',
      },
    },

    toolsCommon: {
      copy: 'Copy',
      copied: 'Copied',
      copyAria: 'Copy result',
      swap: 'Swap',
      swapAria: 'Swap direction',
      quickValues: 'Quick values',
      privacyBadgeAria: 'Privacy notice',
      reset: 'Reset',
      download: 'Download',
      upload: 'Upload',
      pickFile: 'Choose file',
      dropHere: 'Drop file here',
      processing: 'Processing …',
      loading: 'Loading …',
      done: 'Done',
      cancel: 'Cancel',
      inputLabel: 'Input',
      outputLabel: 'Result',
      encodeLabel: 'Encode',
      decodeLabel: 'Decode',
      fileTooLarge: 'File is too large.',
      invalidFormat: 'Invalid format.',
      genericError: 'Something went wrong.',
    },

    errors: {
      required: 'Required',
      invalidNumber: 'Please enter a valid number.',
      outOfRange: 'Value is out of range.',
      emptyInput: 'Input is empty.',
      parseFailed: 'Could not parse input.',
    },
  },
};

export function t(lang: Lang): UiStrings {
  return strings[lang] ?? strings.de;
}
