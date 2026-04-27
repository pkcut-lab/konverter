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

  // ── Validator component ────────────────────────────────────────────
  validator: {
    ready: string;
    valid: string;
    invalid: string;
  };

  // ── FileTool component ─────────────────────────────────────────────
  fileTool: {
    presetsLegend: string;
    formatLegend: string;
    dropzoneAria: string;
    dragHere: string;
    subjectVideo: string;
    subjectImage: string;
    subjectAudio: string;
    subjectDocument: string;
    subjectFile: string;
    pasteBtn: string;
    pasteError: string;
    camera: string;
    modelLoading: string;
    convertingAria: string;
    converting: string;
    etaRemaining: string;
    done: string;
    doneAria: string;
    original: string;
    result: string;
    sourceAlt: string;
    resultAlt: string;
    audioFallback: string;
    pdfFallback: string;
    sourcePdfAria: string;
    resultPdfAria: string;
    ocrTextAria: string;
    clipboardCopy: string;
    clipboardError: string;
    transparency: string;
    whiteBackground: string;
    qualityLabel: string;
    qualityMin: string;
    qualityMax: string;
    errorUnsupportedType: string;
    errorTooLarge: string;
    errorNoProcessor: string;
    errorHeicDecode: string;
    errorModelLoad: string;
    errorConversion: string;
    errorFormatChange: string;
  };

  // ── Validation / error messages ────────────────────────────────
  errors: {
    required: string;
    invalidNumber: string;
    outOfRange: string;
    emptyInput: string;
    parseFailed: string;
  };

  // ── Per-tool namespaces ────────────────────────────────────────
  // Tool-specific labels live here so adding a new language is one file.
  // Components access via `t(lang).tools.<slug>.<key>`. Interpolation:
  // `{placeholder}` tokens are resolved with `.replace()` at the use site.
  tools: {
    tilgungsplan: {
      // Region / aria
      regionAria: string;
      resultsAria: string;
      // Mode bar
      modeLabel: string;
      modeBarAria: string;
      modeAnfangstilgung: string;
      modeMonatsrate: string;
      modeLaufzeit: string;
      // Inputs
      loanAmountLabel: string;
      loanAmountPlaceholder: string;
      loanAmountAria: string;
      interestRateLabel: string;
      interestRatePlaceholder: string;
      interestRateAria: string;
      initialPayoffLabel: string;
      initialPayoffPlaceholder: string;
      initialPayoffAria: string;
      desiredMonthlyLabel: string;
      desiredMonthlyPlaceholder: string;
      desiredMonthlyAria: string;
      desiredTermLabel: string;
      desiredTermPlaceholder: string;
      desiredTermAria: string;
      fixedTermLabel: string;
      fixedTermPlaceholder: string;
      fixedTermAria: string;
      extraPayoffLabel: string;
      extraPayoffPlaceholder: string;
      extraPayoffAria: string;
      optionalBadge: string;
      unitYears: string;
      unitMonths: string;
      unitEuroPerYear: string;
      unitPctPerYear: string;
      // Validation
      errAmountRequired: string;
      errAmountMin: string;
      errAmountMax: string;
      errInterestRequired: string;
      errInterestMin: string;
      errInterestMax: string;
      errInitialPayoffRequired: string;
      errInitialPayoffMin: string;
      errInitialPayoffMax: string;
      errMonthlyRequired: string;
      errMonthlyMin: string;
      /** {amount} — formatted euro value of monthly interest. */
      errMonthlyTooLow: string;
      errTermRequired: string;
      errTermRange: string;
      errFixedTermRequired: string;
      errFixedTermRange: string;
      errExtraAmountInvalid: string;
      errExtraNegative: string;
      errExtraTooLarge: string;
      // Result cards
      cardMonthlyRate: string;
      cardTotalInterest: string;
      cardBalanceAfter: string;
      cardTotalTerm: string;
      cardInitialPayoff: string;
      // Warning / extra-effect
      warningParadoxAria: string;
      warningParadoxLabel: string;
      /** {init} {rate} {years} — rendered with `{@html}` because of inline `<strong>`. */
      warningParadoxBodyHtml: string;
      extraEffectAria: string;
      /** {amount} {savings} {months} — rendered with `{@html}` because of inline `<strong>`. */
      extraEffectBodyHtml: string;
      // Table
      tableTitle: string;
      tableScrollAria: string;
      tableAria: string;
      colYear: string;
      colRatePerYear: string;
      colInterest: string;
      colPrincipal: string;
      colExtra: string;
      colBalance: string;
      endOfFixedTerm: string;
      endOfFixedTermBadge: string;
      // Follow-up financing
      followupAria: string;
      followupTitle: string;
      /** {years} {amount} — rendered with `{@html}` because of inline `<strong>`. */
      followupRemainingBalanceHtml: string;
      followupNewRateLabel: string;
      followupNewRatePlaceholder: string;
      followupNewRateAria: string;
      /** {amount} */
      /** {amount} — rendered with `{@html}` because of inline `<strong>`. */
      followupNewMonthlyHtml: string;
      /** {years} */
      followupRemainingTerm: string;
      // Empty / disclaimer / privacy
      emptyState: string;
      disclaimer: string;
      privacyBadge: string;
      // Clipboard
      clipboardTitle: string;
      /** {amount} */
      clipboardMonthly: string;
      /** {amount} */
      clipboardTotalInterest: string;
      /** {amount} */
      clipboardBalanceAfter: string;
      /** {years} {months} */
      clipboardTerm: string;
    };
    loanCalculator: {
      // Region / aria
      regionAria: string;
      resultsAria: string;
      // Inputs
      loanAmountLabel: string;
      loanAmountPlaceholder: string;
      loanAmountAria: string;
      interestRateLabel: string;
      interestRatePlaceholder: string;
      interestRateAria: string;
      termLabel: string;
      termPlaceholder: string;
      termAria: string;
      extraPayoffLabel: string;
      extraPayoffPlaceholder: string;
      extraPayoffAria: string;
      optionalBadge: string;
      unitMonths: string;
      unitEuroPerYear: string;
      // Validation
      errAmountRequired: string;
      errAmountMin: string;
      errAmountMax: string;
      errInterestRequired: string;
      errInterestMin: string;
      errInterestMax: string;
      errTermRequired: string;
      errTermMin: string;
      errTermMax: string;
      errExtraAmountInvalid: string;
      errExtraNegative: string;
      errExtraTooLarge: string;
      // Result cards
      cardMonthlyRate: string;
      cardTotalInterest: string;
      cardTotalCost: string;
      // Extra-effect
      extraEffectAria: string;
      /** {amount} {savings} {months} — rendered with `{@html}` because of inline `<strong>`. */
      extraEffectBodyHtml: string;
      // Table
      tableTitle: string;
      tableAria: string;
      colYear: string;
      colInterest: string;
      colPrincipal: string;
      colExtra: string;
      colBalance: string;
      // Empty / disclaimer / privacy
      emptyStateCheckFields: string;
      emptyStateFillFields: string;
      disclaimer: string;
      privacyBadge: string;
    };
    compoundInterestCalculator: {
      // Inputs / fieldset
      legend: string;
      initialCapitalLabel: string;
      initialCapitalPlaceholder: string;
      initialCapitalAria: string;
      monthlyContributionLabel: string;
      monthlyContributionPlaceholder: string;
      monthlyContributionAria: string;
      interestRateLabel: string;
      interestRatePlaceholder: string;
      interestRateAria: string;
      termLabel: string;
      termPlaceholder: string;
      termAria: string;
      inflationLabel: string;
      inflationPlaceholder: string;
      inflationAria: string;
      terLabel: string;
      terPlaceholder: string;
      terAria: string;
      optionalBadge: string;
      unitEuroPerMonth: string;
      unitYears: string;
      unitPctPerYear: string;
      // Validation
      errEnterNumber: string;
      errInitialNegative: string;
      errInitialMax: string;
      errContribNegative: string;
      errContribMax: string;
      errInterestRequired: string;
      errInterestMin: string;
      errInterestMax: string;
      errTermRequired: string;
      errTermMin: string;
      errTermMax: string;
      errInflationNegative: string;
      errInflationMax: string;
      errTerNegative: string;
      errTerMax: string;
      // Result cards
      resultsAria: string;
      cardNominalLabel: string;
      cardNominalAria: string;
      cardNominalDesc: string;
      cardAfterTaxLabel: string;
      cardAfterTaxAria: string;
      cardAfterTaxDesc: string;
      cardRealLabel: string;
      cardRealAria: string;
      /** {inflation} */
      cardRealDescTemplate: string;
      // Detail strip
      detailContributions: string;
      detailGrossInterest: string;
      detailTaxesTotal: string;
      // Hint / privacy
      hintFillCorrectly: string;
      privacyBadge: string;
    };
    roiCalculator: {
      regionAria: string;
      // Mode switcher
      modeAria: string;
      modeBasis: string;
      modeErweitert: string;
      modeDupont: string;
      // Inputs
      investitionLabel: string;
      investitionPlaceholder: string;
      investitionAria: string;
      ertragLabel: string;
      ertragPlaceholder: string;
      ertragAria: string;
      laufzeitLabel: string;
      laufzeitPlaceholder: string;
      laufzeitAria: string;
      betriebskostenLabel: string;
      betriebskostenPlaceholder: string;
      betriebskostenAria: string;
      gewinnLabel: string;
      gewinnPlaceholder: string;
      gewinnAria: string;
      nettoumsatzLabel: string;
      nettoumsatzPlaceholder: string;
      nettoumsatzAria: string;
      gesamtkapitalLabel: string;
      gesamtkapitalPlaceholder: string;
      gesamtkapitalAria: string;
      optionalBadge: string;
      unitYears: string;
      unitEuroPerYear: string;
      // Validation
      errInvalidNumber: string;
      errInvestitionPositive: string;
      errInvalidErtrag: string;
      errInvalidLaufzeit: string;
      errLaufzeitMin: string;
      errLaufzeitMax: string;
      errInvalidBetrag: string;
      errBetriebskostenNegative: string;
      errInvalidGewinn: string;
      errInvalidZahl: string;
      errNettoumsatzPositive: string;
      errGesamtkapitalPositive: string;
      // Results
      resultsAria: string;
      cardRoi: string;
      cardRoiTotal: string;
      cardRoiAnnualized: string;
      cardRoiAnnualizedSub: string;
      cardRoiDupont: string;
      cardProfit: string;
      cardProfitSub: string;
      /** {amount} */
      cardProfitInclTemplate: string;
      cardAmortization: string;
      cardAmortizationSub: string;
      cardAmortizationNoneSub: string;
      cardAmortizationUnit: string;
      cardUmsatzrendite: string;
      cardUmsatzrenditeSub: string;
      cardKapitalumschlag: string;
      cardKapitalumschlagSub: string;
      // Status
      statusGewinn: string;
      statusVerlust: string;
      statusBreakeven: string;
      // Formula labels
      formelAriaBasis: string;
      formelLabelBasis: string;
      formelAriaErweitertRoi: string;
      formelLabelErweitertRoi: string;
      formelAriaErweitertAroi: string;
      formelLabelErweitertAroi: string;
      formelAriaDupont: string;
      formelLabelDupont: string;
      // Actions / status
      copyAria: string;
      copyError: string;
      // Disclaimer / privacy
      disclaimer: string;
      privacyBadge: string;
    };
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

    validator: {
      ready: 'Bereit',
      valid: 'Gültig',
      invalid: 'Ungültig',
    },

    fileTool: {
      presetsLegend: 'Einstellungen',
      formatLegend: 'Format',
      dropzoneAria: 'Dateien hierher ziehen oder auswählen',
      dragHere: '{subject} hierher ziehen',
      subjectVideo: 'Video',
      subjectImage: 'Bild',
      subjectAudio: 'Audio',
      subjectDocument: 'Dokument',
      subjectFile: 'Datei',
      pasteBtn: 'Einfügen',
      pasteError: 'Nichts Passendes',
      camera: 'Foto aufnehmen',
      modelLoading: 'Lädt einmalig Modell …',
      convertingAria: 'Konvertiert',
      converting: 'Konvertiert …',
      etaRemaining: '{eta} verbleibend',
      done: 'FERTIG',
      doneAria: 'Status: fertig',
      original: 'ORIGINAL',
      result: 'ERGEBNIS',
      sourceAlt: 'Quelldatei',
      resultAlt: 'Vorschau des Ergebnisses',
      audioFallback: 'Dein Browser unterstützt kein Audio.',
      pdfFallback: 'PDF-Vorschau',
      sourcePdfAria: 'Quelldatei (PDF-Vorschau)',
      resultPdfAria: 'Ergebnis (PDF-Vorschau)',
      ocrTextAria: 'Erkannter Text',
      clipboardCopy: 'In Zwischenablage',
      clipboardError: 'Nicht unterstützt',
      transparency: 'Transparenz',
      whiteBackground: 'weißer Hintergrund',
      qualityLabel: 'Qualität',
      qualityMin: 'kleiner',
      qualityMax: 'schärfer',
      errorUnsupportedType: 'Dateityp nicht unterstützt. Erlaubt: {types}.',
      errorTooLarge: 'Datei zu groß. Maximal {size} MB erlaubt.',
      errorNoProcessor: 'Kein Prozessor registriert für „{id}“.',
      errorHeicDecode: 'HEIC-Decode-Fehler: {msg}',
      errorModelLoad: 'Modell-Lade-Fehler: {msg}',
      errorConversion: 'Konvertierung fehlgeschlagen: {msg}',
      errorFormatChange: 'Format-Wechsel fehlgeschlagen.',
    },

    errors: {
      required: 'Pflichtfeld',
      invalidNumber: 'Bitte eine gültige Zahl eingeben.',
      outOfRange: 'Wert außerhalb des erlaubten Bereichs.',
      emptyInput: 'Eingabe ist leer.',
      parseFailed: 'Konnte Eingabe nicht verarbeiten.',
    },

    tools: {
      tilgungsplan: {
        regionAria: 'Tilgungsplan-Rechner',
        resultsAria: 'Berechnungsergebnis',
        modeLabel: 'Berechne',
        modeBarAria: 'Berechnungsmodus auswählen',
        modeAnfangstilgung: 'Monatsrate aus Tilgungssatz',
        modeMonatsrate: 'Laufzeit aus Monatsrate',
        modeLaufzeit: 'Monatsrate aus Laufzeit',
        loanAmountLabel: 'Darlehensbetrag',
        loanAmountPlaceholder: 'z.B. 300.000',
        loanAmountAria: 'Darlehensbetrag in Euro',
        interestRateLabel: 'Sollzinssatz p.a.',
        interestRatePlaceholder: 'z.B. 3,50',
        interestRateAria: 'Sollzinssatz pro Jahr in Prozent',
        initialPayoffLabel: 'Anfangstilgung p.a.',
        initialPayoffPlaceholder: 'z.B. 2,00',
        initialPayoffAria: 'Anfangstilgung pro Jahr in Prozent',
        desiredMonthlyLabel: 'Gewünschte Monatsrate',
        desiredMonthlyPlaceholder: 'z.B. 1.375',
        desiredMonthlyAria: 'Monatliche Rate in Euro',
        desiredTermLabel: 'Gewünschte Laufzeit',
        desiredTermPlaceholder: 'z.B. 25',
        desiredTermAria: 'Laufzeit in Jahren',
        fixedTermLabel: 'Zinsbindung',
        fixedTermPlaceholder: 'z.B. 10',
        fixedTermAria: 'Zinsbindungsdauer in Jahren',
        extraPayoffLabel: 'Sondertilgung p.a.',
        extraPayoffPlaceholder: 'z.B. 5.000',
        extraPayoffAria: 'Jährliche Sondertilgung in Euro',
        optionalBadge: 'optional',
        unitYears: 'Jahre',
        unitMonths: 'Monate',
        unitEuroPerYear: '€/Jahr',
        unitPctPerYear: '% p.a.',
        errAmountRequired: 'Bitte einen Betrag eingeben.',
        errAmountMin: 'Mindestbetrag: 1.000 €',
        errAmountMax: 'Maximalbetrag: 10.000.000 €',
        errInterestRequired: 'Bitte einen Zinssatz eingeben.',
        errInterestMin: 'Zinssatz muss mindestens 0,1 % betragen.',
        errInterestMax: 'Zinssatz darf maximal 20 % betragen.',
        errInitialPayoffRequired: 'Bitte eine Anfangstilgung eingeben.',
        errInitialPayoffMin: 'Anfangstilgung muss > 0 % sein.',
        errInitialPayoffMax: 'Anfangstilgung maximal 20 %.',
        errMonthlyRequired: 'Bitte eine Monatsrate eingeben.',
        errMonthlyMin: 'Monatsrate muss > 0 € sein.',
        errMonthlyTooLow: 'Rate zu gering — Monatszinsen betragen {amount} €.',
        errTermRequired: 'Bitte eine Laufzeit eingeben.',
        errTermRange: 'Laufzeit: 1–50 Jahre.',
        errFixedTermRequired: 'Bitte eine Zinsbindung eingeben.',
        errFixedTermRange: 'Zinsbindung: 1–40 Jahre.',
        errExtraAmountInvalid: 'Bitte einen gültigen Betrag eingeben.',
        errExtraNegative: 'Sondertilgung muss ≥ 0 € sein.',
        errExtraTooLarge: 'Sondertilgung über 50 % des Darlehens — korrekt?',
        cardMonthlyRate: 'Monatsrate',
        cardTotalInterest: 'Gesamtzinsen',
        cardBalanceAfter: 'Restschuld nach Zinsbindung',
        cardTotalTerm: 'Gesamtlaufzeit',
        cardInitialPayoff: 'Anfangstilgung',
        warningParadoxAria: 'Tilgungsparadoxon-Hinweis',
        warningParadoxLabel: 'Tilgungsparadoxon:',
        warningParadoxBodyHtml:
          'Bei {init}&nbsp;% Anfangstilgung und {rate}&nbsp;% Zinssatz beträgt Ihre vollständige Tilgungsdauer <strong>{years} Jahre</strong>. Experten empfehlen mindestens 2&nbsp;% Anfangstilgung — dadurch sinkt die Gesamtlaufzeit erheblich.',
        extraEffectAria: 'Sondertilgung-Effekt',
        extraEffectBodyHtml:
          'Durch die jährliche Sondertilgung von {amount}&nbsp;€ sparst du <strong>{savings}&nbsp;€ Zinsen</strong> und bist <strong>{months} Monate früher</strong> schuldenfrei.',
        tableTitle: 'Tilgungsplan (Jahresübersicht)',
        tableScrollAria: 'Tilgungsplan-Tabelle, horizontal scrollbar',
        tableAria: 'Jährlicher Tilgungsplan',
        colYear: 'Jahr',
        colRatePerYear: 'Rate/Jahr',
        colInterest: 'Zinsen',
        colPrincipal: 'Tilgung',
        colExtra: 'Sondertilg.',
        colBalance: 'Restschuld',
        endOfFixedTerm: 'Ende der Zinsbindungsperiode',
        endOfFixedTermBadge: 'ZB-Ende',
        followupAria: 'Anschlussfinanzierung planen',
        followupTitle: 'Wie hoch wäre meine Rate nach der Zinsbindung?',
        followupRemainingBalanceHtml: 'Restschuld nach {years} Zinsbindung: <strong>{amount}&nbsp;€</strong>',
        followupNewRateLabel: 'Neuer Zinssatz:',
        followupNewRatePlaceholder: 'z.B. 4,00',
        followupNewRateAria: 'Neuer Zinssatz für Anschlussfinanzierung in Prozent',
        followupNewMonthlyHtml: 'Neue Monatsrate: <strong>{amount}&nbsp;€</strong>',
        followupRemainingTerm: 'Restlaufzeit nach Zinsbindungsende: ca. {years}',
        emptyState: 'Gib alle Pflichtfelder ein, um den Tilgungsplan zu berechnen.',
        disclaimer:
          'Diese Berechnung dient ausschließlich zur unverbindlichen Information und ersetzt keine Bankberatung. Tatsächliche Konditionen hängen von Ihrer Bonität und dem jeweiligen Kreditvertrag ab.',
        privacyBadge: 'Kein Server-Upload · Kein Tracking · Rechnet lokal in Ihrem Browser',
        clipboardTitle: 'Tilgungsplan-Ergebnis',
        clipboardMonthly: 'Monatsrate: {amount} €',
        clipboardTotalInterest: 'Gesamtzinsen: {amount} €',
        clipboardBalanceAfter: 'Restschuld nach Zinsbindung: {amount} €',
        clipboardTerm: 'Gesamtlaufzeit: {years} Jahre ({months} Monate)',
      },
      loanCalculator: {
        regionAria: 'Kreditrechner',
        resultsAria: 'Berechnungsergebnis',
        loanAmountLabel: 'Kreditbetrag',
        loanAmountPlaceholder: 'z.B. 200.000',
        loanAmountAria: 'Kreditbetrag in Euro',
        interestRateLabel: 'Sollzins p.a.',
        interestRatePlaceholder: 'z.B. 3,80',
        interestRateAria: 'Sollzinssatz pro Jahr in Prozent',
        termLabel: 'Laufzeit',
        termPlaceholder: 'z.B. 240',
        termAria: 'Laufzeit in Monaten',
        extraPayoffLabel: 'Sondertilgung p.a.',
        extraPayoffPlaceholder: 'z.B. 5.000',
        extraPayoffAria: 'Jährliche Sondertilgung in Euro',
        optionalBadge: 'optional',
        unitMonths: 'Monate',
        unitEuroPerYear: '€/Jahr',
        errAmountRequired: 'Bitte einen Betrag eingeben.',
        errAmountMin: 'Kreditbetrag muss > 0 € sein.',
        errAmountMax: 'Maximalbetrag: 10.000.000 €',
        errInterestRequired: 'Bitte einen Zinssatz eingeben.',
        errInterestMin: 'Sollzins muss > 0 % sein.',
        errInterestMax: 'Sollzins darf maximal 20 % betragen.',
        errTermRequired: 'Bitte eine Laufzeit eingeben.',
        errTermMin: 'Laufzeit muss mindestens 1 Monat betragen.',
        errTermMax: 'Laufzeit maximal 600 Monate (50 Jahre).',
        errExtraAmountInvalid: 'Bitte einen gültigen Betrag eingeben.',
        errExtraNegative: 'Sondertilgung muss ≥ 0 € sein.',
        errExtraTooLarge: 'Sondertilgung über 50 % des Kredits — korrekt?',
        cardMonthlyRate: 'Monatsrate',
        cardTotalInterest: 'Gesamtzinsen',
        cardTotalCost: 'Gesamtkosten',
        extraEffectAria: 'Sondertilgung-Einsparung',
        extraEffectBodyHtml:
          'Durch die jährliche Sondertilgung von {amount}&nbsp;€ sparst du <strong>{savings}&nbsp;€ Zinsen</strong> und bist <strong>{months} Monate früher</strong> schuldenfrei.',
        tableTitle: 'Tilgungsplan (Jahresübersicht)',
        tableAria: 'Jährlicher Tilgungsplan',
        colYear: 'Jahr',
        colInterest: 'Zinsen',
        colPrincipal: 'Tilgung',
        colExtra: 'Sondertilg.',
        colBalance: 'Restschuld',
        emptyStateCheckFields: 'Bitte alle Pflichtfelder prüfen — die Berechnung startet automatisch.',
        emptyStateFillFields: 'Gib Kreditbetrag, Sollzins und Laufzeit ein, um die Berechnung zu starten.',
        disclaimer:
          'Diese Berechnung dient ausschließlich zur unverbindlichen Information und ersetzt keine Bankberatung. Tatsächliche Konditionen hängen von Ihrer Bonität und dem jeweiligen Kreditvertrag ab.',
        privacyBadge: 'Kein Server-Upload · Kein Tracking · Rechnet lokal in Ihrem Browser',
      },
      compoundInterestCalculator: {
        legend: 'Sparplan-Parameter',
        initialCapitalLabel: 'Anfangskapital',
        initialCapitalPlaceholder: 'z.B. 10.000',
        initialCapitalAria: 'Anfangskapital in Euro',
        monthlyContributionLabel: 'Monatliche Sparrate',
        monthlyContributionPlaceholder: 'z.B. 200',
        monthlyContributionAria: 'Monatliche Sparrate in Euro',
        interestRateLabel: 'Zinssatz p. a.',
        interestRatePlaceholder: 'z.B. 7',
        interestRateAria: 'Jahreszinssatz in Prozent',
        termLabel: 'Laufzeit',
        termPlaceholder: 'z.B. 20',
        termAria: 'Laufzeit in Jahren',
        inflationLabel: 'Inflationsrate',
        inflationPlaceholder: 'Standard: 2',
        inflationAria: 'Inflationsrate in Prozent',
        terLabel: 'Kosten / TER',
        terPlaceholder: 'Standard: 0',
        terAria: 'Jährliche Kostenquote TER in Prozent',
        optionalBadge: 'optional',
        unitEuroPerMonth: '€/Mo',
        unitYears: 'Jahre',
        unitPctPerYear: '% p. a.',
        errEnterNumber: 'Bitte eine Zahl eingeben.',
        errInitialNegative: 'Anfangskapital muss ≥ 0 € sein.',
        errInitialMax: 'Maximal 100.000.000 €',
        errContribNegative: 'Sparrate muss ≥ 0 € sein.',
        errContribMax: 'Maximal 1.000.000 €/Monat',
        errInterestRequired: 'Bitte einen Zinssatz eingeben.',
        errInterestMin: 'Zinssatz minimal −20 %',
        errInterestMax: 'Zinssatz maximal 50 %',
        errTermRequired: 'Bitte eine Laufzeit eingeben.',
        errTermMin: 'Mindestens 1 Jahr',
        errTermMax: 'Maximal 80 Jahre',
        errInflationNegative: 'Inflationsrate muss ≥ 0 % sein.',
        errInflationMax: 'Maximal 30 %',
        errTerNegative: 'TER muss ≥ 0 % sein.',
        errTerMax: 'Maximal 5 %',
        resultsAria: 'Berechnungsergebnis',
        cardNominalLabel: 'Endkapital nominal',
        cardNominalAria: 'Endkapital nominal: {amount} Euro',
        cardNominalDesc: 'Brutto vor Steuern und Inflationsbereinigung',
        cardAfterTaxLabel: 'Nach Steuer',
        cardAfterTaxAria: 'Endkapital nach Steuer: {amount} Euro',
        cardAfterTaxDesc: 'Abzgl. Abgeltungssteuer 26,375 % (Sparerpauschbetrag 1.000 €/Jahr)',
        cardRealLabel: 'Reale Kaufkraft',
        cardRealAria: 'Reale Kaufkraft: {amount} Euro',
        cardRealDescTemplate: 'Kaufkraft in heutigen € nach Fisher-Gleichung ({inflation} % Inflation)',
        detailContributions: 'Gesamteinzahlungen',
        detailGrossInterest: 'Zinserträge brutto',
        detailTaxesTotal: 'Steuern gesamt',
        hintFillCorrectly: 'Bitte alle Pflichtfelder korrekt ausfüllen.',
        privacyBadge: 'Kein Server-Upload · Kein Tracking · Rechnet lokal im Browser',
      },
      roiCalculator: {
        regionAria: 'ROI-Rechner',
        modeAria: 'Berechnungsmodus',
        modeBasis: 'Einfach',
        modeErweitert: 'Erweitert',
        modeDupont: 'DuPont',
        investitionLabel: 'Investition',
        investitionPlaceholder: 'z.B. 50.000',
        investitionAria: 'Anfangsinvestition in Euro',
        ertragLabel: 'Gesamtertrag',
        ertragPlaceholder: 'z.B. 63.400',
        ertragAria: 'Gesamtertrag oder Endwert in Euro',
        laufzeitLabel: 'Laufzeit',
        laufzeitPlaceholder: 'z.B. 3',
        laufzeitAria: 'Laufzeit in Jahren',
        betriebskostenLabel: 'Betriebskosten/Jahr',
        betriebskostenPlaceholder: 'z.B. 0',
        betriebskostenAria: 'Jährliche Betriebskosten in Euro',
        gewinnLabel: 'Betriebsgewinn',
        gewinnPlaceholder: 'z.B. 13.400',
        gewinnAria: 'Betriebsgewinn in Euro',
        nettoumsatzLabel: 'Nettoumsatz',
        nettoumsatzPlaceholder: 'z.B. 200.000',
        nettoumsatzAria: 'Nettoumsatz in Euro',
        gesamtkapitalLabel: 'Gesamtkapital',
        gesamtkapitalPlaceholder: 'z.B. 100.000',
        gesamtkapitalAria: 'Gesamtkapital oder investiertes Kapital in Euro',
        optionalBadge: 'optional',
        unitYears: 'Jahre',
        unitEuroPerYear: '€/Jahr',
        errInvalidNumber: 'Bitte eine gültige Zahl eingeben.',
        errInvestitionPositive: 'Investitionsbetrag muss größer als 0 sein.',
        errInvalidErtrag: 'Bitte einen gültigen Ertrag eingeben.',
        errInvalidLaufzeit: 'Bitte eine gültige Laufzeit eingeben.',
        errLaufzeitMin: 'Laufzeit muss mindestens 0,01 Jahre betragen.',
        errLaufzeitMax: 'Sehr lange Laufzeit — annualisierter ROI nähert sich 0 %.',
        errInvalidBetrag: 'Bitte einen gültigen Betrag eingeben.',
        errBetriebskostenNegative: 'Betriebskosten müssen ≥ 0 € sein.',
        errInvalidGewinn: 'Bitte einen gültigen Gewinn eingeben.',
        errInvalidZahl: 'Bitte eine gültige Zahl eingeben.',
        errNettoumsatzPositive: 'Nettoumsatz muss größer als 0 sein.',
        errGesamtkapitalPositive: 'Gesamtkapital muss größer als 0 sein.',
        resultsAria: 'Berechnungsergebnis',
        cardRoi: 'Return on Investment',
        cardRoiTotal: 'ROI gesamt',
        cardRoiAnnualized: 'Annualisierter ROI',
        cardRoiAnnualizedSub: 'Zinseszins-Formel',
        cardRoiDupont: 'ROI (DuPont)',
        cardProfit: 'Gewinn / Verlust',
        cardProfitSub: 'Ertrag − Investition',
        cardProfitInclTemplate: 'inkl. {amount} € Betriebskosten',
        cardAmortization: 'Amortisation',
        cardAmortizationSub: 'bis zur Kostendeckung',
        cardAmortizationNoneSub: 'kein positiver Ertrag',
        cardAmortizationUnit: 'Jahre',
        cardUmsatzrendite: 'Umsatzrendite',
        cardUmsatzrenditeSub: 'Gewinn / Nettoumsatz',
        cardKapitalumschlag: 'Kapitalumschlag',
        cardKapitalumschlagSub: 'Nettoumsatz / Gesamtkapital',
        statusGewinn: 'Gewinn',
        statusVerlust: 'Verlust',
        statusBreakeven: 'Break-Even',
        formelAriaBasis: 'Formel-Aufschlüsselung',
        formelLabelBasis: 'Formel',
        formelAriaErweitertRoi: 'Formel-Aufschlüsselung ROI',
        formelLabelErweitertRoi: 'ROI-Formel',
        formelAriaErweitertAroi: 'Formel-Aufschlüsselung annualisierter ROI',
        formelLabelErweitertAroi: 'AROI-Formel',
        formelAriaDupont: 'DuPont-Formel',
        formelLabelDupont: 'DuPont',
        copyAria: 'ROI-Ergebnis in die Zwischenablage kopieren',
        copyError: 'Fehler',
        disclaimer:
          'Diese Berechnung dient ausschließlich zur unverbindlichen Information. Tatsächliche Renditen können abweichen. Kein Ersatz für Fachberatung.',
        privacyBadge: 'Kein Server-Upload · Kein Tracking · Rechnet lokal in Ihrem Browser',
      },
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

    validator: {
      ready: 'Ready',
      valid: 'Valid',
      invalid: 'Invalid',
    },

    fileTool: {
      presetsLegend: 'Settings',
      formatLegend: 'Format',
      dropzoneAria: 'Drag files here or select',
      dragHere: 'Drop {subject} here',
      subjectVideo: 'video',
      subjectImage: 'image',
      subjectAudio: 'audio',
      subjectDocument: 'document',
      subjectFile: 'file',
      pasteBtn: 'Paste',
      pasteError: 'Nothing suitable',
      camera: 'Take photo',
      modelLoading: 'Loading model …',
      convertingAria: 'Converting',
      converting: 'Converting …',
      etaRemaining: '{eta} remaining',
      done: 'DONE',
      doneAria: 'Status: done',
      original: 'ORIGINAL',
      result: 'RESULT',
      sourceAlt: 'Source file',
      resultAlt: 'Preview of result',
      audioFallback: 'Your browser does not support audio.',
      pdfFallback: 'PDF preview',
      sourcePdfAria: 'Source file (PDF preview)',
      resultPdfAria: 'Result (PDF preview)',
      ocrTextAria: 'Recognized text',
      clipboardCopy: 'Copy to clipboard',
      clipboardError: 'Not supported',
      transparency: 'Transparency',
      whiteBackground: 'white background',
      qualityLabel: 'Quality',
      qualityMin: 'smaller',
      qualityMax: 'sharper',
      errorUnsupportedType: 'Unsupported file type. Allowed: {types}.',
      errorTooLarge: 'File too large. Maximum {size} MB.',
      errorNoProcessor: 'No processor registered for "{id}".',
      errorHeicDecode: 'HEIC decode error: {msg}',
      errorModelLoad: 'Model load error: {msg}',
      errorConversion: 'Conversion failed: {msg}',
      errorFormatChange: 'Format change failed.',
    },

    errors: {
      required: 'Required',
      invalidNumber: 'Please enter a valid number.',
      outOfRange: 'Value is out of range.',
      emptyInput: 'Input is empty.',
      parseFailed: 'Could not parse input.',
    },

    tools: {
      tilgungsplan: {
        regionAria: 'Amortization calculator',
        resultsAria: 'Calculation result',
        modeLabel: 'Calculate',
        modeBarAria: 'Select calculation mode',
        modeAnfangstilgung: 'Monthly payment from repayment rate',
        modeMonatsrate: 'Term from monthly payment',
        modeLaufzeit: 'Monthly payment from term',
        loanAmountLabel: 'Loan amount',
        loanAmountPlaceholder: 'e.g. 300,000',
        loanAmountAria: 'Loan amount in euros',
        interestRateLabel: 'Annual interest rate',
        interestRatePlaceholder: 'e.g. 3.50',
        interestRateAria: 'Annual interest rate in percent',
        initialPayoffLabel: 'Initial repayment rate (p.a.)',
        initialPayoffPlaceholder: 'e.g. 2.00',
        initialPayoffAria: 'Annual initial repayment rate in percent',
        desiredMonthlyLabel: 'Desired monthly payment',
        desiredMonthlyPlaceholder: 'e.g. 1,375',
        desiredMonthlyAria: 'Monthly payment in euros',
        desiredTermLabel: 'Desired loan term',
        desiredTermPlaceholder: 'e.g. 25',
        desiredTermAria: 'Loan term in years',
        fixedTermLabel: 'Fixed-rate period',
        fixedTermPlaceholder: 'e.g. 10',
        fixedTermAria: 'Fixed-rate period in years',
        extraPayoffLabel: 'Annual extra payment',
        extraPayoffPlaceholder: 'e.g. 5,000',
        extraPayoffAria: 'Annual extra payment in euros',
        optionalBadge: 'optional',
        unitYears: 'years',
        unitMonths: 'months',
        unitEuroPerYear: '€/year',
        unitPctPerYear: '% p.a.',
        errAmountRequired: 'Please enter an amount.',
        errAmountMin: 'Minimum amount: 1,000 €',
        errAmountMax: 'Maximum amount: 10,000,000 €',
        errInterestRequired: 'Please enter an interest rate.',
        errInterestMin: 'Interest rate must be at least 0.1 %.',
        errInterestMax: 'Interest rate cannot exceed 20 %.',
        errInitialPayoffRequired: 'Please enter an initial repayment rate.',
        errInitialPayoffMin: 'Initial repayment rate must be > 0 %.',
        errInitialPayoffMax: 'Initial repayment rate cannot exceed 20 %.',
        errMonthlyRequired: 'Please enter a monthly payment.',
        errMonthlyMin: 'Monthly payment must be > 0 €.',
        errMonthlyTooLow: 'Payment too low — monthly interest is {amount} €.',
        errTermRequired: 'Please enter a loan term.',
        errTermRange: 'Loan term: 1–50 years.',
        errFixedTermRequired: 'Please enter a fixed-rate period.',
        errFixedTermRange: 'Fixed-rate period: 1–40 years.',
        errExtraAmountInvalid: 'Please enter a valid amount.',
        errExtraNegative: 'Extra payment must be ≥ 0 €.',
        errExtraTooLarge: 'Extra payment exceeds 50 % of the loan — is that correct?',
        cardMonthlyRate: 'Monthly payment',
        cardTotalInterest: 'Total interest',
        cardBalanceAfter: 'Balance after fixed-rate period',
        cardTotalTerm: 'Total term',
        cardInitialPayoff: 'Initial repayment',
        warningParadoxAria: 'Amortization paradox notice',
        warningParadoxLabel: 'Amortization paradox:',
        warningParadoxBodyHtml:
          'At {init}&nbsp;% initial repayment and {rate}&nbsp;% interest, your full repayment period is <strong>{years} years</strong>. Experts recommend at least 2&nbsp;% initial repayment — this reduces the total term substantially.',
        extraEffectAria: 'Extra payment impact',
        extraEffectBodyHtml:
          'With an annual extra payment of {amount}&nbsp;€, you save <strong>{savings}&nbsp;€ in interest</strong> and are <strong>debt-free {months} months earlier</strong>.',
        tableTitle: 'Amortization schedule (annual overview)',
        tableScrollAria: 'Amortization table, horizontally scrollable',
        tableAria: 'Annual amortization schedule',
        colYear: 'Year',
        colRatePerYear: 'Payment/year',
        colInterest: 'Interest',
        colPrincipal: 'Principal',
        colExtra: 'Extra',
        colBalance: 'Balance',
        endOfFixedTerm: 'End of fixed-rate period',
        endOfFixedTermBadge: 'FRP end',
        followupAria: 'Plan follow-up financing',
        followupTitle: 'What would my payment be after the fixed-rate period?',
        followupRemainingBalanceHtml:
          'Balance after {years} of fixed rate: <strong>{amount}&nbsp;€</strong>',
        followupNewRateLabel: 'New interest rate:',
        followupNewRatePlaceholder: 'e.g. 4.00',
        followupNewRateAria: 'New interest rate for follow-up financing in percent',
        followupNewMonthlyHtml: 'New monthly payment: <strong>{amount}&nbsp;€</strong>',
        followupRemainingTerm: 'Remaining term after fixed-rate period: approx. {years}',
        emptyState: 'Fill in all required fields to calculate the amortization schedule.',
        disclaimer:
          'This calculation is for informational purposes only and does not constitute financial advice. Actual terms depend on your creditworthiness and loan agreement.',
        privacyBadge: 'No server upload · No tracking · Runs locally in your browser',
        clipboardTitle: 'Amortization schedule result',
        clipboardMonthly: 'Monthly payment: {amount} €',
        clipboardTotalInterest: 'Total interest: {amount} €',
        clipboardBalanceAfter: 'Balance after fixed-rate period: {amount} €',
        clipboardTerm: 'Total term: {years} years ({months} months)',
      },
      loanCalculator: {
        regionAria: 'Loan calculator',
        resultsAria: 'Calculation result',
        loanAmountLabel: 'Loan amount',
        loanAmountPlaceholder: 'e.g. 200,000',
        loanAmountAria: 'Loan amount in euros',
        interestRateLabel: 'Annual interest rate',
        interestRatePlaceholder: 'e.g. 3.80',
        interestRateAria: 'Annual interest rate in percent',
        termLabel: 'Loan term',
        termPlaceholder: 'e.g. 240',
        termAria: 'Loan term in months',
        extraPayoffLabel: 'Annual extra payment',
        extraPayoffPlaceholder: 'e.g. 5,000',
        extraPayoffAria: 'Annual extra payment in euros',
        optionalBadge: 'optional',
        unitMonths: 'months',
        unitEuroPerYear: '€/year',
        errAmountRequired: 'Please enter an amount.',
        errAmountMin: 'Loan amount must be > 0 €.',
        errAmountMax: 'Maximum amount: 10,000,000 €',
        errInterestRequired: 'Please enter an interest rate.',
        errInterestMin: 'Interest rate must be > 0 %.',
        errInterestMax: 'Interest rate cannot exceed 20 %.',
        errTermRequired: 'Please enter a loan term.',
        errTermMin: 'Loan term must be at least 1 month.',
        errTermMax: 'Loan term cannot exceed 600 months (50 years).',
        errExtraAmountInvalid: 'Please enter a valid amount.',
        errExtraNegative: 'Extra payment must be ≥ 0 €.',
        errExtraTooLarge: 'Extra payment exceeds 50 % of the loan — is that correct?',
        cardMonthlyRate: 'Monthly payment',
        cardTotalInterest: 'Total interest',
        cardTotalCost: 'Total cost',
        extraEffectAria: 'Extra payment impact',
        extraEffectBodyHtml:
          'With an annual extra payment of {amount}&nbsp;€, you save <strong>{savings}&nbsp;€ in interest</strong> and are <strong>debt-free {months} months earlier</strong>.',
        tableTitle: 'Amortization schedule (annual overview)',
        tableAria: 'Annual amortization schedule',
        colYear: 'Year',
        colInterest: 'Interest',
        colPrincipal: 'Principal',
        colExtra: 'Extra',
        colBalance: 'Balance',
        emptyStateCheckFields: 'Please check all required fields — calculation starts automatically.',
        emptyStateFillFields: 'Enter loan amount, interest rate, and term to start the calculation.',
        disclaimer:
          'This calculation is for informational purposes only and does not constitute financial advice. Actual terms depend on your creditworthiness and loan agreement.',
        privacyBadge: 'No server upload · No tracking · Runs locally in your browser',
      },
      compoundInterestCalculator: {
        legend: 'Savings plan parameters',
        initialCapitalLabel: 'Initial capital',
        initialCapitalPlaceholder: 'e.g. 10,000',
        initialCapitalAria: 'Initial capital in euros',
        monthlyContributionLabel: 'Monthly contribution',
        monthlyContributionPlaceholder: 'e.g. 200',
        monthlyContributionAria: 'Monthly contribution in euros',
        interestRateLabel: 'Interest rate p. a.',
        interestRatePlaceholder: 'e.g. 7',
        interestRateAria: 'Annual interest rate in percent',
        termLabel: 'Term',
        termPlaceholder: 'e.g. 20',
        termAria: 'Term in years',
        inflationLabel: 'Inflation rate',
        inflationPlaceholder: 'default: 2',
        inflationAria: 'Inflation rate in percent',
        terLabel: 'Costs / TER',
        terPlaceholder: 'default: 0',
        terAria: 'Annual total expense ratio (TER) in percent',
        optionalBadge: 'optional',
        unitEuroPerMonth: '€/mo',
        unitYears: 'years',
        unitPctPerYear: '% p. a.',
        errEnterNumber: 'Please enter a number.',
        errInitialNegative: 'Initial capital must be ≥ 0 €.',
        errInitialMax: 'Maximum 100,000,000 €',
        errContribNegative: 'Contribution must be ≥ 0 €.',
        errContribMax: 'Maximum 1,000,000 €/month',
        errInterestRequired: 'Please enter an interest rate.',
        errInterestMin: 'Interest rate minimum −20 %',
        errInterestMax: 'Interest rate maximum 50 %',
        errTermRequired: 'Please enter a term.',
        errTermMin: 'Minimum 1 year',
        errTermMax: 'Maximum 80 years',
        errInflationNegative: 'Inflation rate must be ≥ 0 %.',
        errInflationMax: 'Maximum 30 %',
        errTerNegative: 'TER must be ≥ 0 %.',
        errTerMax: 'Maximum 5 %',
        resultsAria: 'Calculation result',
        cardNominalLabel: 'Final capital (nominal)',
        cardNominalAria: 'Nominal final capital: {amount} euros',
        cardNominalDesc: 'Gross before taxes and inflation adjustment',
        cardAfterTaxLabel: 'After tax',
        cardAfterTaxAria: 'Final capital after tax: {amount} euros',
        cardAfterTaxDesc: 'Less German capital-gains tax 26.375 % (saver allowance 1,000 €/year)',
        cardRealLabel: 'Real purchasing power',
        cardRealAria: 'Real purchasing power: {amount} euros',
        cardRealDescTemplate: 'Purchasing power in today\'s € via Fisher equation ({inflation} % inflation)',
        detailContributions: 'Total contributions',
        detailGrossInterest: 'Gross interest earnings',
        detailTaxesTotal: 'Total taxes',
        hintFillCorrectly: 'Please fill in all required fields correctly.',
        privacyBadge: 'No server upload · No tracking · Runs locally in your browser',
      },
      roiCalculator: {
        regionAria: 'ROI calculator',
        modeAria: 'Calculation mode',
        modeBasis: 'Simple',
        modeErweitert: 'Extended',
        modeDupont: 'DuPont',
        investitionLabel: 'Investment',
        investitionPlaceholder: 'e.g. 50,000',
        investitionAria: 'Initial investment in euros',
        ertragLabel: 'Total return',
        ertragPlaceholder: 'e.g. 63,400',
        ertragAria: 'Total return or final value in euros',
        laufzeitLabel: 'Term',
        laufzeitPlaceholder: 'e.g. 3',
        laufzeitAria: 'Term in years',
        betriebskostenLabel: 'Operating costs/year',
        betriebskostenPlaceholder: 'e.g. 0',
        betriebskostenAria: 'Annual operating costs in euros',
        gewinnLabel: 'Operating profit',
        gewinnPlaceholder: 'e.g. 13,400',
        gewinnAria: 'Operating profit in euros',
        nettoumsatzLabel: 'Net revenue',
        nettoumsatzPlaceholder: 'e.g. 200,000',
        nettoumsatzAria: 'Net revenue in euros',
        gesamtkapitalLabel: 'Total capital',
        gesamtkapitalPlaceholder: 'e.g. 100,000',
        gesamtkapitalAria: 'Total or invested capital in euros',
        optionalBadge: 'optional',
        unitYears: 'years',
        unitEuroPerYear: '€/year',
        errInvalidNumber: 'Please enter a valid number.',
        errInvestitionPositive: 'Investment amount must be greater than 0.',
        errInvalidErtrag: 'Please enter a valid return.',
        errInvalidLaufzeit: 'Please enter a valid term.',
        errLaufzeitMin: 'Term must be at least 0.01 years.',
        errLaufzeitMax: 'Very long term — annualized ROI approaches 0 %.',
        errInvalidBetrag: 'Please enter a valid amount.',
        errBetriebskostenNegative: 'Operating costs must be ≥ 0 €.',
        errInvalidGewinn: 'Please enter a valid profit.',
        errInvalidZahl: 'Please enter a valid number.',
        errNettoumsatzPositive: 'Net revenue must be greater than 0.',
        errGesamtkapitalPositive: 'Total capital must be greater than 0.',
        resultsAria: 'Calculation result',
        cardRoi: 'Return on investment',
        cardRoiTotal: 'Total ROI',
        cardRoiAnnualized: 'Annualized ROI',
        cardRoiAnnualizedSub: 'Compound-interest formula',
        cardRoiDupont: 'ROI (DuPont)',
        cardProfit: 'Profit / loss',
        cardProfitSub: 'Return − investment',
        cardProfitInclTemplate: 'incl. {amount} € operating costs',
        cardAmortization: 'Payback period',
        cardAmortizationSub: 'until break-even',
        cardAmortizationNoneSub: 'no positive return',
        cardAmortizationUnit: 'years',
        cardUmsatzrendite: 'Net profit margin',
        cardUmsatzrenditeSub: 'Profit / net revenue',
        cardKapitalumschlag: 'Asset turnover',
        cardKapitalumschlagSub: 'Net revenue / total capital',
        statusGewinn: 'Profit',
        statusVerlust: 'Loss',
        statusBreakeven: 'Break-even',
        formelAriaBasis: 'Formula breakdown',
        formelLabelBasis: 'Formula',
        formelAriaErweitertRoi: 'ROI formula breakdown',
        formelLabelErweitertRoi: 'ROI formula',
        formelAriaErweitertAroi: 'Annualized ROI formula breakdown',
        formelLabelErweitertAroi: 'AROI formula',
        formelAriaDupont: 'DuPont formula',
        formelLabelDupont: 'DuPont',
        copyAria: 'Copy ROI result to clipboard',
        copyError: 'Error',
        disclaimer:
          'This calculation is for informational purposes only. Actual returns may differ. Not a substitute for professional advice.',
        privacyBadge: 'No server upload · No tracking · Runs locally in your browser',
      },
    },
  },
};

export function t(lang: Lang): UiStrings {
  return strings[lang] ?? strings.de;
}
