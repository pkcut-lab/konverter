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
    // Mobile-aware ML banner & retry UI (added 2026-04-28).
    mlBannerOneTime: string;       // "Lädt einmalig {size}-Modell. …"
    mlBannerSwitchQuality: string; // "Qualität wechseln ({size})"
    mlBannerSwitchFast: string;    // "Schnell-Variante ({size})"
    mlBannerSwitchPro: string;     // "Maximale Qualität ({size})"
    mlStalledTitle: string;        // "Download stockt."
    mlStalledRetry: string;        // "Erneut versuchen"
    mlStalledFallback: string;     // "Zur Schnell-Variante wechseln"
    mlVariantFast: string;         // "Schnell"
    mlVariantQuality: string;      // "Qualität"
    mlVariantPro: string;          // "Maximum"
    mlActiveVariant: string;       // "Aktiv: {variant} · {size}"
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
    hourlyToAnnual: {
      // Direction
      directionAria: string;
      directionToSalary: string;
      directionToHourly: string;
      // Inputs
      hourlyLabel: string;
      hourlyPlaceholder: string;
      hourlyAria: string;
      annualLabel: string;
      annualPlaceholder: string;
      annualAria: string;
      errAmountRange: string;
      // Weekly hours
      weeklyHoursLabel: string;
      quickSelectAria: string;
      weeklyHoursAdjustAria: string;
      unitHoursPerWeek: string;
      hintArbeitszeitgesetz: string;
      // Mode
      modeLabel: string;
      modeAria: string;
      modeSchnell: string;
      modeSchnellSub: string;
      modeExakt: string;
      modeExaktSub: string;
      // Exact params
      vacationLabel: string;
      vacationAria: string;
      unitDays: string;
      hintVacationMinimum: string;
      stateLabel: string;
      stateAria: string;
      /** {feiertage} */
      stateOptionTemplate: string;
      // Formula explanation
      formulaTipAria: string;
      /** {hours} */
      formulaSchnellTemplate: string;
      /** {workdays} {hoursPerDay} {vacation} {holidays} */
      formulaExaktTemplate: string;
      // Result table
      resultTableAria: string;
      colTimePeriod: string;
      colAmount: string;
      rowHourly: string;
      rowDaily: string;
      rowWeekly: string;
      rowMonthly: string;
      rowYearly: string;
      unitEuroPerHour: string;
      unitEuroPerDay: string;
      unitEuroPerWeek: string;
      unitEuroPerMonth: string;
      unitEuroPerYear: string;
      warnDotAria: string;
      warnDotTitle: string;
      // Alerts
      /** {amount} — rendered with `{@html}` because of inline `<strong>`. */
      alertMinWageHtml: string;
      /** {amount} — rendered with `{@html}` because of inline `<strong>`. */
      alertMinijobHtml: string;
      /** {amount} — rendered with `{@html}` because of inline `<strong>`. */
      minPreview2027Html: string;
      bruttoHintHtml: string;
      // Empty state
      emptyStateToSalary: string;
      emptyStateToHourly: string;
      // Privacy
      privacyBadge: string;
    };
    discountCalculator: {
      regionAria: string;
      // Mode
      modeLabel: string;
      modeBarAria: string;
      modeStandard: string;
      modeRueckPreis: string;
      modeRueckRabatt: string;
      modeKette: string;
      // Inputs
      ursprungspreisLabel: string;
      ursprungspreisPlaceholder: string;
      ursprungspreisAria: string;
      endpreisLabelPaid: string;
      endpreisLabel: string;
      endpreisPlaceholder: string;
      endpreisAria: string;
      rabattLabel: string;
      rabattPlaceholder: string;
      rabattAria: string;
      rabatt1Label: string;
      rabatt1Placeholder: string;
      rabatt1Aria: string;
      rabatt2Label: string;
      rabatt2Placeholder: string;
      rabatt2Aria: string;
      // Validation
      errAmountRequired: string;
      errAmountPositive: string;
      errAmountMax: string;
      errEndpreisRequired: string;
      errEndpreisNegative: string;
      errEndpreisGreater: string;
      errRabattRequired: string;
      errRabattNegative: string;
      errRabattMax: string;
      errRabatt1Required: string;
      errRabattRange: string;
      errRabatt2Required: string;
      // Results
      resultsAria: string;
      cardEndpreis: string;
      cardSavings: string;
      cardSavingsAlt: string;
      cardRabatt: string;
      cardGesamtRabatt: string;
      cardUrsprungspreis: string;
      // Additiv-Falle
      /** {r1} {r2} {naive} */
      additivAria: string;
      /** {r1} {r2} {naive} */
      additivHeader: string;
      additivExplanation: string;
      additivMathAria: string;
      /** {r1} {r2} {naive} */
      additivCalcWrongHtml: string;
      /** {right} */
      additivCalcRightHtml: string;
      // Empty / privacy
      emptyState: string;
      privacyBadge: string;
    };
    cashDiscountCalculator: {
      regionAria: string;
      // Basis bar
      basisLabel: string;
      basisBarAria: string;
      basisBrutto: string;
      basisNetto: string;
      basisHintBrutto: string;
      basisHintNetto: string;
      // Inputs
      betragLabelBrutto: string;
      betragLabelNetto: string;
      betragPlaceholder: string;
      betragAria: string;
      satzLabel: string;
      satzPlaceholder: string;
      satzAria: string;
      skontofristLabel: string;
      skontofristPlaceholder: string;
      skontofristAria: string;
      zahlungszielLabel: string;
      zahlungszielPlaceholder: string;
      zahlungszielAria: string;
      mwstLabel: string;
      mwstPlaceholder: string;
      mwstAria: string;
      unitDays: string;
      // Validation
      errAmountRequired: string;
      errAmountPositive: string;
      errSatzRequired: string;
      errSatzNegative: string;
      errSatzMax: string;
      errDaysPositive: string;
      errZahlungszielPositive: string;
      errFristShorter: string;
      errMwstRequired: string;
      errMwstNegative: string;
      // Results
      resultsAria: string;
      jahreszinsAria: string;
      jahreszinsLabel: string;
      jahreszinsCopyAria: string;
      jahreszinsUnit: string;
      ampelGruen: string;
      ampelGelb: string;
      ampelRot: string;
      cardSkontoBetrag: string;
      cardSkontoCopyAria: string;
      cardZahlBetrag: string;
      cardZahlCopyAria: string;
      // Netto-Box
      nettoAria: string;
      nettoTitle: string;
      nettoVorSkonto: string;
      nettoNachSkonto: string;
      /** {mwst} */
      nettoMwstNachTemplate: string;
      nettoBruttoNach: string;
      nettoHint: string;
      // Empty / privacy
      emptyState: string;
      privacyBadge: string;
    };
    cashFlowCalculator: {
      regionAria: string;
      // Mode
      modeAria: string;
      modeDirekt: string;
      modeIndirekt: string;
      modeFree: string;
      // Mode descriptions
      descDirekt: string;
      descIndirekt: string;
      descFree: string;
      // Direct inputs
      einzahlungenLabel: string;
      einzahlungenPlaceholder: string;
      einzahlungenAria: string;
      auszahlungenLabel: string;
      auszahlungenPlaceholder: string;
      auszahlungenAria: string;
      // Indirect inputs
      juLabel: string;
      juHint: string;
      juPlaceholder: string;
      juAria: string;
      afaLabel: string;
      afaPlaceholder: string;
      afaAria: string;
      rueckLabel: string;
      rueckHint: string;
      rueckPlaceholder: string;
      rueckAria: string;
      fordLabel: string;
      fordHint: string;
      fordPlaceholder: string;
      fordAria: string;
      vorrLabel: string;
      vorrHint: string;
      vorrPlaceholder: string;
      vorrAria: string;
      verbLabel: string;
      verbHint: string;
      verbPlaceholder: string;
      verbAria: string;
      // Free CF inputs
      ocfLabel: string;
      ocfPlaceholder: string;
      ocfAria: string;
      capexLabel: string;
      capexPlaceholder: string;
      capexAria: string;
      // Validation
      errInvalidNumber: string;
      errEinzahlungenNegative: string;
      errAuszahlungenNegative: string;
      errAfaNegative: string;
      errCapexNegative: string;
      // Results
      resultsAria: string;
      resultRegionAria: string;
      cardCashflow: string;
      cardOcf: string;
      cardFreeCf: string;
      statusPositiv: string;
      statusNegativ: string;
      statusBreakeven: string;
      // Lernmoment
      lernmomentAria: string;
      lernmomentLabel: string;
      /** {ju} {ocf} — rendered with `{@html}` because of inline `<strong>`. */
      lernmomentTextHtml: string;
      // Free CF explanation
      freeAria: string;
      freeLabel: string;
      /** {capex} {free} — rendered with `{@html}` because of inline `<strong>`. */
      freeTextHtml: string;
      // Formula
      formelAria: string;
      formelLabel: string;
      // Empty / privacy
      emptyState: string;
      privacyBadge: string;
    };
    leasingFactorCalculator: {
      regionAria: string;
      // Inputs
      rateLabel: string;
      ratePlaceholder: string;
      rateAria: string;
      unitEuroPerMonth: string;
      listenpreisLabel: string;
      listenpreisPlaceholder: string;
      listenpreisAria: string;
      sonderzahlungToggle: string;
      optionalBadge: string;
      sonderzahlungLabel: string;
      sonderzahlungPlaceholder: string;
      sonderzahlungAria: string;
      laufzeitLabel: string;
      laufzeitAria: string;
      /** {months} */
      laufzeitOptionTemplate: string;
      // Validation
      errInvalidRate: string;
      errRateNegative: string;
      errInvalidListenpreis: string;
      errListenpreisPositive: string;
      errInvalidSonderzahlung: string;
      errSonderzahlungNegative: string;
      // Bereinigung-Info
      /** {anteil} {bereinigt} — rendered with `{@html}` because of inline `<strong>`. */
      bereinigungInfoHtml: string;
      // Results
      resultsAria: string;
      cardLeasingfaktor: string;
      cardMarktdurchschnitt: string;
      cardMarktSource: string;
      cardBereinigung: string;
      cardBereinigungActive: string;
      /** {months} */
      cardBereinigungSubTemplate: string;
      // Bewertung labels (component-mapped, do not translate data-layer)
      bewertungSpitze: string;
      bewertungSehrGut: string;
      bewertungGut: string;
      bewertungDurchschnittlich: string;
      bewertungWenigAttraktiv: string;
      // Gauge
      gaugeAria: string;
      /** {factor} {bewertung} */
      gaugeImgAriaTemplate: string;
      benchmarkAriaLabel: string;
      benchmarkLabel: string;
      // Formel / actions / disclaimer
      formelAria: string;
      formelLabel: string;
      copyAria: string;
      copyError: string;
      disclaimer: string;
      privacyBadge: string;
    };
    inheritanceTaxCalculator: {
      regionAria: string;
      // Verwandtschaft
      verwandtschaftLabel: string;
      verwandtschaftAria: string;
      vgEhepartner: string;
      vgKind: string;
      vgEnkelEltVerstorben: string;
      vgEnkelEltLeben: string;
      vgElternGroßeltern: string;
      vgGeschwister: string;
      vgNichtenNeffen: string;
      vgSchwiegerStief: string;
      vgSonstiges: string;
      // Hint per relationship
      hintEhepartner: string;
      hintKind: string;
      hintEnkelEltVerstorben: string;
      hintEnkelEltLeben: string;
      hintElternGroßeltern: string;
      hintKlasse2: string;
      hintKlasse3: string;
      // Kindesalter
      kindesalterLabel: string;
      kindesalterBadge: string;
      kindesalterPlaceholder: string;
      kindesalterAria: string;
      unitYears: string;
      // Inputs
      nachlasswertLabel: string;
      nachlasswertPlaceholder: string;
      nachlasswertAria: string;
      schuldenLabel: string;
      optionalBadge: string;
      schuldenPlaceholder: string;
      schuldenAria: string;
      familienheimLabel: string;
      familienheimPlaceholder: string;
      familienheimAria: string;
      vorschenkungLabel: string;
      vorschenkungPlaceholder: string;
      vorschenkungAria: string;
      mietwohnCheckboxAria: string;
      mietwohnCheckboxText: string;
      mietwohnLabel: string;
      mietwohnPlaceholder: string;
      mietwohnAria: string;
      // Validation
      errInvalidAmount: string;
      errInvalidAge: string;
      // Result
      resultsAria: string;
      kachelSteuer: string;
      /** {satz} */
      kachelSteuerSubTemplate: string;
      kachelNetto: string;
      kachelNettoSub: string;
      kachelKlasse: string;
      kachelKlasseSub: string;
      // Aufschlüsselung
      aufschluesselungAria: string;
      aufTitle: string;
      rowNachlassBrutto: string;
      rowSchulden: string;
      rowErbfallkosten: string;
      rowHausrat: string;
      rowFamilienheim: string;
      rowMietwohnAbzug: string;
      rowSubtotal: string;
      rowFreibetrag: string;
      rowVersorgungsfreibetrag: string;
      rowVorschenkungen: string;
      rowTotal: string;
      // Disclaimer / actions
      disclaimer: string;
      copyAria: string;
      copyButton: string;
      copyError: string;
      resetAria: string;
      // Export
      exportTitle: string;
      exportLabelVg: string;
      exportLabelKlasse: string;
      exportLabelNachlass: string;
      exportLabelSchulden: string;
      exportLabelErbfallkosten: string;
      exportLabelHausrat: string;
      exportLabelFamilienheim: string;
      exportLabelMietwohn: string;
      exportLabelStpflVor: string;
      exportLabelFreibetrag: string;
      exportLabelVersorgung: string;
      exportLabelVorschenkung: string;
      exportLabelStpflNetto: string;
      exportLabelSatz: string;
      exportLabelSteuer: string;
      exportLabelNetto: string;
      exportNote1: string;
      exportNote2: string;
    };
    audioTranscription: {
      // Upload
      removeFileAria: string;
      uploadText: string;
      uploadHint: string;
      // Size warnings
      /** {mb} */
      sizeWarningTemplate: string;
      /** {mb} */
      sizeHintTemplate: string;
      // Config
      modelLabel: string;
      modelTiny: string;
      modelBase: string;
      modelSmall: string;
      languageLabel: string;
      languageGerman: string;
      languageEnglish: string;
      languageFrench: string;
      languageSpanish: string;
      languageAuto: string;
      // Actions
      startButton: string;
      // Loading
      loaderModelLoading: string;
      /** {sizeLabel} */
      loaderModelLoadingNoteTemplate: string;
      // Speed labels (used in loader template)
      speedSchnell: string;
      speedAusgewogen: string;
      speedGroß: string;
      sizeTiny: string;
      sizeBase: string;
      sizeSmall: string;
      analyzingText: string;
      analyzingNote: string;
      // Result
      resultTitle: string;
      formatTxt: string;
      formatSrt: string;
      copyTitle: string;
      downloadTitle: string;
      downloadButton: string;
      // Errors
      errorGeneric: string;
      // Reset
      otherFileButton: string;
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
      mlBannerOneTime: 'Lädt einmalig ein {size}-Modell. Datenverbrauch nur beim ersten Mal — danach offline nutzbar.',
      mlBannerSwitchQuality: 'Qualität wechseln ({size})',
      mlBannerSwitchFast: 'Schnell-Variante ({size})',
      mlBannerSwitchPro: 'Maximale Qualität ({size})',
      mlStalledTitle: 'Download stockt.',
      mlStalledRetry: 'Erneut versuchen',
      mlStalledFallback: 'Zur Schnell-Variante wechseln',
      mlVariantFast: 'Schnell',
      mlVariantQuality: 'Qualität',
      mlVariantPro: 'Maximum',
      mlActiveVariant: 'Aktiv: {variant} · {size}',
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
      hourlyToAnnual: {
        directionAria: 'Berechnungsrichtung wählen',
        directionToSalary: 'Stundenlohn → Gehalt',
        directionToHourly: 'Jahresgehalt → Stundenlohn',
        hourlyLabel: 'Stundenlohn (Brutto)',
        hourlyPlaceholder: 'z.B. 15,50',
        hourlyAria: 'Stundenlohn in Euro',
        annualLabel: 'Jahresgehalt (Brutto)',
        annualPlaceholder: 'z.B. 45.000',
        annualAria: 'Jahresgehalt in Euro',
        errAmountRange: 'Bitte eine Zahl zwischen 0,01 und 99.999 eingeben.',
        weeklyHoursLabel: 'Wochenstunden',
        quickSelectAria: 'Wochenstunden Schnellwahl',
        weeklyHoursAdjustAria: 'Wochenstunden anpassen',
        unitHoursPerWeek: 'h/Woche',
        hintArbeitszeitgesetz:
          'Arbeitszeitgesetz: max. 48 h/Woche im Durchschnitt (§ 3 ArbZG).',
        modeLabel: 'Methode',
        modeAria: 'Berechnungsmethode wählen',
        modeSchnell: 'Schnell',
        modeSchnellSub: '× 52 Wochen',
        modeExakt: 'Exakt',
        modeExaktSub: 'Urlaubstage + Feiertage',
        vacationLabel: 'Urlaubstage/Jahr',
        vacationAria: 'Urlaubstage pro Jahr',
        unitDays: 'Tage',
        hintVacationMinimum: 'Gesetzliches Minimum: 20 Tage (5-Tage-Woche).',
        stateLabel: 'Bundesland',
        stateAria: 'Bundesland für Feiertagsanzahl',
        stateOptionTemplate: '{feiertage} Feiertage',
        formulaTipAria: 'Verwendete Formel',
        formulaSchnellTemplate: 'Schnell-Methode: Stundenlohn × {hours} h/Woche × 52 Wochen',
        formulaExaktTemplate:
          'Exakt-Methode: Stundenlohn × {workdays} Arbeitstage × {hoursPerDay} h/Tag ({vacation} Urlaubstage + {holidays} Feiertage abgezogen)',
        resultTableAria: 'Gehalts-Übersicht',
        colTimePeriod: 'Zeitraum',
        colAmount: 'Betrag (Brutto)',
        rowHourly: 'Stündlich',
        rowDaily: 'Täglich',
        rowWeekly: 'Wöchentlich',
        rowMonthly: 'Monatlich',
        rowYearly: 'Jährlich',
        unitEuroPerHour: '€/h',
        unitEuroPerDay: '€/Tag',
        unitEuroPerWeek: '€/Woche',
        unitEuroPerMonth: '€/Monat',
        unitEuroPerYear: '€/Jahr',
        warnDotAria: 'Unter Mindestlohn',
        warnDotTitle: 'Unter Mindestlohn 2026',
        alertMinWageHtml:
          '<strong>Unter Mindestlohn 2026:</strong> Der gesetzliche Mindestlohn beträgt ab Januar 2026 <strong>{amount} €/h</strong>.',
        alertMinijobHtml:
          '<strong>Minijob-Bereich:</strong> Monatswert unter der Minijob-Grenze 2026 (€ {amount}/Monat). Besondere Regelungen zu Sozialabgaben und Steuern beachten.',
        minPreview2027Html:
          'Vorschau: Ab 1. Jan 2027 steigt der Mindestlohn auf <strong>{amount} €/h</strong> (geplant).',
        bruttoHintHtml:
          'Alle Werte sind <strong>Brutto</strong> — Steuern und Sozialabgaben noch nicht abgezogen. Für die Nettoberechnung einen separaten Brutto-Netto-Rechner nutzen.',
        emptyStateToSalary: 'Stundenlohn eingeben — Jahres-, Monats-, Wochen- und Tageswert erscheinen sofort.',
        emptyStateToHourly: 'Jahresgehalt eingeben — Stundenlohn und alle Zeiträume erscheinen sofort.',
        privacyBadge: 'Alle Berechnungen lokal im Browser · Deine Gehaltsinfos verlassen nicht dein Gerät · Kein Tracking',
      },
      discountCalculator: {
        regionAria: 'Rabatt-Rechner',
        modeLabel: 'Berechne',
        modeBarAria: 'Berechnungsmodus auswählen',
        modeStandard: 'Endpreis',
        modeRueckPreis: 'Ursprungspreis',
        modeRueckRabatt: 'Rabatt %',
        modeKette: 'Kettenrabatt',
        ursprungspreisLabel: 'Ursprungspreis',
        ursprungspreisPlaceholder: 'z.B. 100',
        ursprungspreisAria: 'Ursprungspreis in Euro',
        endpreisLabelPaid: 'Endpreis (bezahlt)',
        endpreisLabel: 'Endpreis',
        endpreisPlaceholder: 'z.B. 80',
        endpreisAria: 'Endpreis in Euro',
        rabattLabel: 'Rabatt',
        rabattPlaceholder: 'z.B. 20',
        rabattAria: 'Rabatt in Prozent',
        rabatt1Label: 'Rabatt 1',
        rabatt1Placeholder: 'z.B. 15',
        rabatt1Aria: 'Erster Rabattsatz in Prozent',
        rabatt2Label: 'Rabatt 2',
        rabatt2Placeholder: 'z.B. 8',
        rabatt2Aria: 'Zweiter Rabattsatz in Prozent',
        errAmountRequired: 'Bitte einen Betrag eingeben.',
        errAmountPositive: 'Bitte einen positiven Betrag eingeben.',
        errAmountMax: 'Maximalbetrag: 9.999.999 €',
        errEndpreisRequired: 'Bitte einen Endpreis eingeben.',
        errEndpreisNegative: 'Endpreis muss ≥ 0 sein.',
        errEndpreisGreater: 'Endpreis darf nicht größer als Ursprungspreis sein.',
        errRabattRequired: 'Bitte einen Rabatt-Prozentsatz eingeben.',
        errRabattNegative: 'Rabatt muss ≥ 0 % sein.',
        errRabattMax: 'Rabatt kann nicht mehr als 100 % betragen.',
        errRabatt1Required: 'Bitte Rabatt 1 eingeben.',
        errRabattRange: 'Rabatt: 0–100 %',
        errRabatt2Required: 'Bitte Rabatt 2 eingeben.',
        resultsAria: 'Berechnungsergebnis',
        cardEndpreis: 'Endpreis',
        cardSavings: 'Du sparst',
        cardSavingsAlt: 'Ersparnis',
        cardRabatt: 'Rabatt',
        cardGesamtRabatt: 'Gesamtrabatt',
        cardUrsprungspreis: 'Ursprungspreis',
        additivAria: 'Erklärung: Warum addieren sich Rabatte nicht?',
        additivHeader: 'Warum {r1} % + {r2} % ≠ {naive} % Gesamtrabatt?',
        additivExplanation:
          'Jeder Rabatt wird auf den bereits reduzierten Preis angewendet. Der zweite Rabatt bezieht sich also nicht mehr auf den Originalpreis, sondern auf den günstigeren Zwischenpreis.',
        additivMathAria: 'Rechenweg Kettenrabatt',
        additivCalcWrongHtml:
          '{r1}&nbsp;%&thinsp;+&thinsp;{r2}&nbsp;% <span class="calc--wrong">≠&thinsp;{naive}&nbsp;%</span>',
        additivCalcRightHtml:
          'Richtig: <span class="calc--right">{right}&nbsp;%</span>',
        emptyState: 'Gib die Werte ein, um das Ergebnis sofort zu sehen.',
        privacyBadge: 'Kein Server-Upload · Kein Tracking · Rechnet lokal in Ihrem Browser',
      },
      cashDiscountCalculator: {
        regionAria: 'Skonto-Rechner',
        basisLabel: 'Skontobasis',
        basisBarAria: 'Skontobasis auswählen',
        basisBrutto: 'Brutto',
        basisNetto: 'Netto + MwSt',
        basisHintBrutto: 'Buchhalterischer Standard (DE)',
        basisHintNetto: 'Nettobetrag eingeben, MwSt wird separat ausgewiesen',
        betragLabelBrutto: 'Rechnungsbetrag (Brutto)',
        betragLabelNetto: 'Rechnungsbetrag (Netto)',
        betragPlaceholder: 'z.B. 1000',
        betragAria: 'Rechnungsbetrag in Euro',
        satzLabel: 'Skontosatz',
        satzPlaceholder: 'z.B. 2',
        satzAria: 'Skontosatz in Prozent',
        skontofristLabel: 'Skontofrist',
        skontofristPlaceholder: 'z.B. 10',
        skontofristAria: 'Skontofrist in Tagen',
        zahlungszielLabel: 'Zahlungsziel',
        zahlungszielPlaceholder: 'z.B. 30',
        zahlungszielAria: 'Zahlungsziel in Tagen',
        mwstLabel: 'MwSt-Satz',
        mwstPlaceholder: 'z.B. 19',
        mwstAria: 'Mehrwertsteuersatz in Prozent',
        unitDays: 'Tage',
        errAmountRequired: 'Bitte einen Betrag eingeben.',
        errAmountPositive: 'Bitte einen positiven Betrag eingeben.',
        errSatzRequired: 'Bitte einen Skontosatz eingeben.',
        errSatzNegative: 'Der Skontosatz kann nicht negativ sein.',
        errSatzMax: 'Ein Skontosatz von 100 % oder mehr ist nicht zulässig.',
        errDaysPositive: 'Bitte positive Tage eingeben.',
        errZahlungszielPositive: 'Bitte positive Tage eingeben.',
        errFristShorter: 'Die Skontofrist muss kürzer sein als das Zahlungsziel.',
        errMwstRequired: 'Bitte einen MwSt-Satz eingeben.',
        errMwstNegative: 'MwSt-Satz muss ≥ 0 % sein.',
        resultsAria: 'Berechnungsergebnis',
        jahreszinsAria: 'Effektiver Jahreszins',
        jahreszinsLabel: 'Effektiver Jahreszins (Lieferantenkredit)',
        jahreszinsCopyAria: 'Jahreszins kopieren',
        jahreszinsUnit: '% p.a.',
        ampelGruen: 'Skonto lohnt sich — günstiger als jeder Bankkredit',
        ampelGelb: 'Hängt von Ihrem Finanzierungszins ab',
        ampelRot: 'Skonto lohnt sich selten bei so niedrigem Zinssatz',
        cardSkontoBetrag: 'Skontobetrag',
        cardSkontoCopyAria: 'Skontobetrag kopieren',
        cardZahlBetrag: 'Zahlbetrag',
        cardZahlCopyAria: 'Zahlbetrag kopieren',
        nettoAria: 'Netto-Aufschlüsselung',
        nettoTitle: 'Aufschlüsselung (Netto-Basis)',
        nettoVorSkonto: 'Netto vor Skonto',
        nettoNachSkonto: 'Netto nach Skonto',
        nettoMwstNachTemplate: 'MwSt nach Skonto ({mwst} %)',
        nettoBruttoNach: 'Brutto nach Skonto',
        nettoHint: 'Hinweis: Durch den Skontoabzug reduziert sich auch die Vorsteuer des Käufers.',
        emptyState: 'Gib die Werte ein, um das Ergebnis sofort zu sehen.',
        privacyBadge: 'Kein Server-Upload · Kein Tracking · Rechnet lokal in Ihrem Browser',
      },
      cashFlowCalculator: {
        regionAria: 'Cashflow-Rechner',
        modeAria: 'Berechnungsmethode wählen',
        modeDirekt: 'Direkte Methode',
        modeIndirekt: 'Indirekte Methode',
        modeFree: 'Free Cashflow',
        descDirekt: 'Direkte Methode: Cashflow = Einzahlungen − Auszahlungen. Geeignet für Selbstständige und Kleinunternehmen.',
        descIndirekt: 'Indirekte Methode (HGB/IFRS): Ausgangspunkt Jahresüberschuss, korrigiert um nicht zahlungswirksame Posten und Working-Capital-Änderungen.',
        descFree: 'Free Cashflow: Das nach Investitionen frei verfügbare Kapital — für Tilgung, Dividenden oder Reinvestition.',
        einzahlungenLabel: 'Einzahlungen',
        einzahlungenPlaceholder: 'z.B. 85.000',
        einzahlungenAria: 'Einzahlungen in Euro',
        auszahlungenLabel: 'Auszahlungen',
        auszahlungenPlaceholder: 'z.B. 72.000',
        auszahlungenAria: 'Auszahlungen in Euro',
        juLabel: 'Jahresüberschuss',
        juHint: 'darf negativ sein',
        juPlaceholder: 'z.B. 20.000',
        juAria: 'Jahresüberschuss in Euro',
        afaLabel: 'Abschreibungen (AfA)',
        afaPlaceholder: 'z.B. 15.000',
        afaAria: 'Abschreibungen in Euro',
        rueckLabel: 'Δ Rückstellungen',
        rueckHint: '+ = gestiegen',
        rueckPlaceholder: 'z.B. 0',
        rueckAria: 'Änderung Rückstellungen in Euro',
        fordLabel: 'Δ Forderungen',
        fordHint: '+ = gestiegen → verschlechtert CF',
        fordPlaceholder: 'z.B. 5.000',
        fordAria: 'Änderung Forderungen in Euro',
        vorrLabel: 'Δ Vorräte',
        vorrHint: '+ = gestiegen → verschlechtert CF',
        vorrPlaceholder: 'z.B. 0',
        vorrAria: 'Änderung Vorräte in Euro',
        verbLabel: 'Δ Verbindlichkeiten',
        verbHint: '+ = gestiegen → verbessert CF',
        verbPlaceholder: 'z.B. 0',
        verbAria: 'Änderung Verbindlichkeiten in Euro',
        ocfLabel: 'Operativer Cashflow (OCF)',
        ocfPlaceholder: 'z.B. 30.000',
        ocfAria: 'Operativer Cashflow in Euro',
        capexLabel: 'Investitionsauszahlungen (CapEx)',
        capexPlaceholder: 'z.B. 10.000',
        capexAria: 'CapEx in Euro',
        errInvalidNumber: 'Bitte eine gültige Zahl eingeben.',
        errEinzahlungenNegative: 'Einzahlungen müssen ≥ 0 € sein.',
        errAuszahlungenNegative: 'Auszahlungen müssen ≥ 0 € sein.',
        errAfaNegative: 'Abschreibungen müssen ≥ 0 € sein.',
        errCapexNegative: 'CapEx muss ≥ 0 € sein.',
        resultsAria: 'Berechnungsergebnis',
        resultRegionAria: 'Cashflow-Ergebnis',
        cardCashflow: 'Cashflow',
        cardOcf: 'Operativer Cashflow',
        cardFreeCf: 'Free Cashflow',
        statusPositiv: 'Positiver Cashflow — Liquiditätszufluss',
        statusNegativ: 'Negativer Cashflow — Liquiditätsrisiko prüfen',
        statusBreakeven: 'Break-Even — Cashflow ausgeglichen',
        lernmomentAria: 'Lernmoment',
        lernmomentLabel: 'Warum Gewinn ≠ Liquidität',
        lernmomentTextHtml:
          'Ihr Jahresüberschuss beträgt <strong>{ju}&nbsp;€</strong>, Ihr operativer Cashflow ist <strong>{ocf}&nbsp;€</strong>. Die Differenz erklärt sich durch nicht zahlungswirksame Posten (AfA, Rückstellungen) und Änderungen im Working Capital (Forderungen, Vorräte, Verbindlichkeiten).',
        freeAria: 'Free-Cashflow-Erklärung',
        freeLabel: 'Was bedeutet der Free Cashflow?',
        freeTextHtml:
          'Nach Abzug der Investitionsauszahlungen ({capex}&nbsp;€) verbleiben <strong>{free}&nbsp;€</strong> frei — für Schuldentilgung, Dividenden oder neue Investitionen.',
        formelAria: 'Formel-Aufschlüsselung',
        formelLabel: 'Formel',
        emptyState: 'Gib die Werte ein, um den Cashflow sofort zu sehen.',
        privacyBadge: 'Kein Server-Upload · Kein Tracking · Rechnet lokal in Ihrem Browser',
      },
      leasingFactorCalculator: {
        regionAria: 'Leasingfaktor-Rechner',
        rateLabel: 'Monatliche Rate',
        ratePlaceholder: 'z.B. 250',
        rateAria: 'Monatliche Leasingrate in Euro',
        unitEuroPerMonth: '€/Monat',
        listenpreisLabel: 'Bruttolistenpreis',
        listenpreisPlaceholder: 'z.B. 33.850',
        listenpreisAria: 'Bruttolistenpreis des Fahrzeugs in Euro',
        sonderzahlungToggle: 'Sonderzahlung berücksichtigen',
        optionalBadge: 'optional',
        sonderzahlungLabel: 'Sonderzahlung',
        sonderzahlungPlaceholder: 'z.B. 3.600',
        sonderzahlungAria: 'Einmalige Sonderzahlung oder Anzahlung in Euro',
        laufzeitLabel: 'Laufzeit',
        laufzeitAria: 'Laufzeit in Monaten',
        laufzeitOptionTemplate: '{months} Monate',
        errInvalidRate: 'Bitte eine gültige Rate eingeben.',
        errRateNegative: 'Rate muss ≥ 0 sein.',
        errInvalidListenpreis: 'Bitte einen gültigen Listenpreis eingeben.',
        errListenpreisPositive: 'Listenpreis muss > 0 sein.',
        errInvalidSonderzahlung: 'Bitte eine gültige Sonderzahlung eingeben.',
        errSonderzahlungNegative: 'Sonderzahlung muss ≥ 0 sein.',
        bereinigungInfoHtml:
          'Anteilige Sonderzahlung: <strong>{anteil}&nbsp;€/Monat</strong> — bereinigte Rate: <strong>{bereinigt}&nbsp;€</strong>',
        resultsAria: 'Berechnungsergebnis',
        cardLeasingfaktor: 'Leasingfaktor',
        cardMarktdurchschnitt: 'Marktdurchschnitt 2024',
        cardMarktSource: 'Quelle: leasingmarkt.de',
        cardBereinigung: 'Bereinigung',
        cardBereinigungActive: 'aktiv',
        cardBereinigungSubTemplate: 'Sonderzahlung verteilt auf {months} Monate',
        bewertungSpitze: 'Spitzenangebot',
        bewertungSehrGut: 'Sehr gut',
        bewertungGut: 'Gut',
        bewertungDurchschnittlich: 'Durchschnittlich',
        bewertungWenigAttraktiv: 'Wenig attraktiv',
        gaugeAria: 'Bewertungs-Gauge',
        gaugeImgAriaTemplate: 'Leasingfaktor {factor} — {bewertung}',
        benchmarkAriaLabel: 'Marktdurchschnitt 0,63',
        benchmarkLabel: 'Ø 0,63',
        formelAria: 'Formel-Aufschlüsselung',
        formelLabel: 'Formel',
        copyAria: 'Leasingfaktor in die Zwischenablage kopieren',
        copyError: 'Fehler',
        disclaimer:
          'Diese Berechnung dient ausschließlich zur unverbindlichen Information. Der Leasingfaktor ist eine Vergleichskennzahl — er ersetzt keine vollständige Angebotsprüfung.',
        privacyBadge: 'Kein Server-Upload · Kein Tracking · Rechnet lokal in Ihrem Browser',
      },
      inheritanceTaxCalculator: {
        regionAria: 'Erbschaftsteuer-Rechner',
        verwandtschaftLabel: 'Verwandtschaftsgrad',
        verwandtschaftAria: 'Verwandtschaftsgrad zum Erblasser',
        vgEhepartner: 'Ehepartner / Lebenspartner',
        vgKind: 'Kind (unter 28 Jahre)',
        vgEnkelEltVerstorben: 'Enkel (Eltern verstorben)',
        vgEnkelEltLeben: 'Enkel (Eltern leben)',
        vgElternGroßeltern: 'Eltern / Großeltern',
        vgGeschwister: 'Geschwister',
        vgNichtenNeffen: 'Nichten / Neffen',
        vgSchwiegerStief: 'Schwiegereltern / Stiefeltern',
        vgSonstiges: 'Nicht verwandt',
        hintEhepartner: 'Steuerklasse I · Freibetrag 500.000 € · Versorgungsfreibetrag 256.000 €',
        hintKind: 'Steuerklasse I · Freibetrag 400.000 € · Versorgungsfreibetrag altersabhängig',
        hintEnkelEltVerstorben: 'Steuerklasse I · Freibetrag 400.000 €',
        hintEnkelEltLeben: 'Steuerklasse I · Freibetrag 200.000 €',
        hintElternGroßeltern: 'Steuerklasse I · Freibetrag 100.000 €',
        hintKlasse2: 'Steuerklasse II · Freibetrag 20.000 €',
        hintKlasse3: 'Steuerklasse III · Freibetrag 20.000 €',
        kindesalterLabel: 'Alter des Kindes',
        kindesalterBadge: 'für Versorgungsfreibetrag',
        kindesalterPlaceholder: 'z.B. 12',
        kindesalterAria: 'Alter des Kindes in Jahren',
        unitYears: 'Jahre',
        nachlasswertLabel: 'Nachlasswert (brutto)',
        nachlasswertPlaceholder: 'z.B. 500.000',
        nachlasswertAria: 'Gesamter Nachlasswert in Euro',
        schuldenLabel: 'Schulden / Verbindlichkeiten',
        optionalBadge: 'optional',
        schuldenPlaceholder: 'z.B. 50.000',
        schuldenAria: 'Schulden und Verbindlichkeiten des Nachlasses in Euro',
        familienheimLabel: 'Familienheim-Wert (§13 befreit)',
        familienheimPlaceholder: 'z.B. 300.000',
        familienheimAria: 'Wert des selbstgenutzten Familienheims in Euro (§13 ErbStG vollständig steuerfrei)',
        vorschenkungLabel: 'Vorschenkungen (letzte 10 Jahre, §14)',
        vorschenkungPlaceholder: 'z.B. 100.000',
        vorschenkungAria: 'Wert der erhaltenen Schenkungen der letzten 10 Jahre in Euro',
        mietwohnCheckboxAria: '10%-Abschlag auf Mietwohngrundstücke nach §13d ErbStG anwenden',
        mietwohnCheckboxText: '10 %-Abschlag Mietwohngrundstück (§13d ErbStG, ab 2023)',
        mietwohnLabel: 'Wert der Mietwohnimmobilie',
        mietwohnPlaceholder: 'z.B. 400.000',
        mietwohnAria: 'Wert der Mietwohnimmobilie in Euro',
        errInvalidAmount: 'Bitte einen gültigen Betrag eingeben.',
        errInvalidAge: 'Bitte ein gültiges Alter eingeben (0–150).',
        resultsAria: 'Berechnungsergebnis',
        kachelSteuer: 'Erbschaftsteuer',
        kachelSteuerSubTemplate: 'Steuersatz {satz}',
        kachelNetto: 'Netto-Erbe',
        kachelNettoSub: 'nach Steuer',
        kachelKlasse: 'Steuerklasse',
        kachelKlasseSub: '§15 ErbStG',
        aufschluesselungAria: 'Berechnungsaufschlüsselung',
        aufTitle: 'Berechnungsweg',
        rowNachlassBrutto: 'Nachlasswert (brutto)',
        rowSchulden: 'Schulden / Verbindlichk.',
        rowErbfallkosten: 'Erbfallkosten-Pauschale (§10 Abs. 5)',
        rowHausrat: 'Hausrat-Pauschale (§13 Abs. 1 Nr. 1)',
        rowFamilienheim: 'Familienheim steuerfrei (§13)',
        rowMietwohnAbzug: '10 %-Abschlag Mietwohng. (§13d)',
        rowSubtotal: 'Stpfl. Erwerb (vor Freibetrag)',
        rowFreibetrag: 'Persönl. Freibetrag (§16)',
        rowVersorgungsfreibetrag: 'Versorgungsfreibetrag (§17)',
        rowVorschenkungen: 'Vorschenkungen §14 (10 J.)',
        rowTotal: 'Stpfl. Erwerb (netto)',
        disclaimer:
          'Betriebsvermögen (§§ 13a/13b ErbStG), internationale Erbschaften sowie Vor-/Nacherbschaft erfordern individuelle Fachberatung. Diese Berechnung ist eine erste Orientierung, kein Rechtsgutachten. BVerfG-Entscheidung zu Betriebsvermögen-Verschonung steht noch aus.',
        copyAria: 'Ergebnis als Text für Steuerberater kopieren',
        copyButton: 'Ergebnis für Berater kopieren',
        copyError: 'Fehler',
        resetAria: 'Alle Eingaben zurücksetzen',
        exportTitle: '=== Erbschaftsteuer-Berechnung (kittokit.com) ===',
        exportLabelVg: 'Verwandtschaftsgrad:',
        exportLabelKlasse: 'Steuerklasse:',
        exportLabelNachlass: 'Nachlasswert (brutto):',
        exportLabelSchulden: 'Schulden / Verbindlichk.:',
        exportLabelErbfallkosten: 'Erbfallkostenpauschale:',
        exportLabelHausrat: 'Hausrat-Pauschale:',
        exportLabelFamilienheim: 'Familienheim (§13):',
        exportLabelMietwohn: 'Mietwohn-Abschlag (§13d):',
        exportLabelStpflVor: 'Stpfl. Erwerb (vor FB):',
        exportLabelFreibetrag: 'Persönl. Freibetrag (§16):',
        exportLabelVersorgung: 'Versorgungsfreibetrag §17:',
        exportLabelVorschenkung: 'Vorschenkungen (§14):',
        exportLabelStpflNetto: 'Stpfl. Erwerb (netto):',
        exportLabelSatz: 'Steuersatz:',
        exportLabelSteuer: 'ERBSCHAFTSTEUER:',
        exportLabelNetto: 'Netto-Erbe:',
        exportNote1: 'Hinweis: Diese Berechnung dient nur als erste Orientierung.',
        exportNote2: 'Betriebsvermögen, internationale Erbschaften und Vorerbschaft erfordern Fachberatung (§§ 13a, 13b ErbStG, DBA).',
      },
      audioTranscription: {
        removeFileAria: 'Datei entfernen',
        uploadText: 'Audio-Datei auswählen',
        uploadHint: 'MP3, WAV, M4A · Lokal im Browser',
        sizeWarningTemplate: 'Große Datei ({mb} MB) – die Verarbeitung kann je nach Gerät mehrere Minuten dauern und den Browser beanspruchen.',
        sizeHintTemplate: 'Mittlere Datei ({mb} MB) – Verarbeitung kann etwas dauern.',
        modelLabel: 'Modell:',
        modelTiny: 'Schnell (~150 MB)',
        modelBase: 'Ausgewogen (~450 MB)',
        modelSmall: 'Beste Qualität (~1 GB)',
        languageLabel: 'Sprache:',
        languageGerman: 'Deutsch',
        languageEnglish: 'Englisch',
        languageFrench: 'Französisch',
        languageSpanish: 'Spanisch',
        languageAuto: 'Auto-Erkennung',
        startButton: 'Transkription starten',
        loaderModelLoading: 'KI-Modell lädt...',
        loaderModelLoadingNoteTemplate:
          'Das {speed} Spracherkennungs-Modell ({size}) wird geladen und im Browser vorbereitet.',
        speedSchnell: 'schnelle',
        speedAusgewogen: 'ausgewogene',
        speedGroß: 'große',
        sizeTiny: '~150 MB',
        sizeBase: '~450 MB',
        sizeSmall: '~1 GB',
        analyzingText: 'Audiodaten werden transkribiert...',
        analyzingNote: 'Lokale Transkription läuft. Keine Audiodaten verlassen deinen Browser. Dies kann je nach Audio-Länge etwas dauern.',
        resultTitle: 'Transkribierter Text',
        formatTxt: '.txt (Nur Text)',
        formatSrt: '.srt (Untertitel)',
        copyTitle: 'In die Zwischenablage kopieren',
        downloadTitle: 'Herunterladen',
        downloadButton: 'Download',
        errorGeneric: 'Fehler bei der Transkription.',
        otherFileButton: 'Andere Datei wählen',
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
      mlBannerOneTime: 'One-time {size} model download. Mobile data only on the first run — after that the tool works offline.',
      mlBannerSwitchQuality: 'Switch to quality ({size})',
      mlBannerSwitchFast: 'Switch to fast variant ({size})',
      mlBannerSwitchPro: 'Maximum quality ({size})',
      mlStalledTitle: 'Download stalled.',
      mlStalledRetry: 'Retry',
      mlStalledFallback: 'Switch to fast variant',
      mlVariantFast: 'Fast',
      mlVariantQuality: 'Quality',
      mlVariantPro: 'Maximum',
      mlActiveVariant: 'Active: {variant} · {size}',
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
      hourlyToAnnual: {
        directionAria: 'Select calculation direction',
        directionToSalary: 'Hourly wage → Salary',
        directionToHourly: 'Annual salary → Hourly wage',
        hourlyLabel: 'Hourly wage (gross)',
        hourlyPlaceholder: 'e.g. 15.50',
        hourlyAria: 'Hourly wage in euros',
        annualLabel: 'Annual salary (gross)',
        annualPlaceholder: 'e.g. 45,000',
        annualAria: 'Annual salary in euros',
        errAmountRange: 'Please enter a number between 0.01 and 99,999.',
        weeklyHoursLabel: 'Weekly hours',
        quickSelectAria: 'Weekly hours quick select',
        weeklyHoursAdjustAria: 'Adjust weekly hours',
        unitHoursPerWeek: 'h/week',
        hintArbeitszeitgesetz:
          'German Working Time Act: max. 48 h/week on average (§ 3 ArbZG).',
        modeLabel: 'Method',
        modeAria: 'Select calculation method',
        modeSchnell: 'Quick',
        modeSchnellSub: '× 52 weeks',
        modeExakt: 'Exact',
        modeExaktSub: 'Vacation + holidays',
        vacationLabel: 'Vacation days/year',
        vacationAria: 'Vacation days per year',
        unitDays: 'days',
        hintVacationMinimum: 'Legal minimum: 20 days (5-day week).',
        stateLabel: 'Federal state',
        stateAria: 'Federal state for public-holiday count',
        stateOptionTemplate: '{feiertage} holidays',
        formulaTipAria: 'Formula used',
        formulaSchnellTemplate: 'Quick method: Hourly wage × {hours} h/week × 52 weeks',
        formulaExaktTemplate:
          'Exact method: Hourly wage × {workdays} workdays × {hoursPerDay} h/day ({vacation} vacation days + {holidays} public holidays subtracted)',
        resultTableAria: 'Salary overview',
        colTimePeriod: 'Period',
        colAmount: 'Amount (gross)',
        rowHourly: 'Hourly',
        rowDaily: 'Daily',
        rowWeekly: 'Weekly',
        rowMonthly: 'Monthly',
        rowYearly: 'Yearly',
        unitEuroPerHour: '€/h',
        unitEuroPerDay: '€/day',
        unitEuroPerWeek: '€/week',
        unitEuroPerMonth: '€/month',
        unitEuroPerYear: '€/year',
        warnDotAria: 'Below minimum wage',
        warnDotTitle: 'Below minimum wage 2026',
        alertMinWageHtml:
          '<strong>Below minimum wage 2026:</strong> The German statutory minimum wage from January 2026 is <strong>{amount} €/h</strong>.',
        alertMinijobHtml:
          '<strong>Minijob range:</strong> Monthly value below the 2026 minijob threshold (€ {amount}/month). Special rules for social-security contributions and taxes apply.',
        minPreview2027Html:
          'Preview: From 1 Jan 2027 the minimum wage will rise to <strong>{amount} €/h</strong> (planned).',
        bruttoHintHtml:
          'All values are <strong>gross</strong> — taxes and social-security contributions not yet deducted. Use a separate gross-to-net calculator for the net amount.',
        emptyStateToSalary: 'Enter hourly wage — yearly, monthly, weekly and daily values appear instantly.',
        emptyStateToHourly: 'Enter annual salary — hourly wage and all periods appear instantly.',
        privacyBadge: 'All calculations run locally in your browser · Your salary data never leaves your device · No tracking',
      },
      discountCalculator: {
        regionAria: 'Discount calculator',
        modeLabel: 'Calculate',
        modeBarAria: 'Select calculation mode',
        modeStandard: 'Final price',
        modeRueckPreis: 'Original price',
        modeRueckRabatt: 'Discount %',
        modeKette: 'Chain discount',
        ursprungspreisLabel: 'Original price',
        ursprungspreisPlaceholder: 'e.g. 100',
        ursprungspreisAria: 'Original price in euros',
        endpreisLabelPaid: 'Final price (paid)',
        endpreisLabel: 'Final price',
        endpreisPlaceholder: 'e.g. 80',
        endpreisAria: 'Final price in euros',
        rabattLabel: 'Discount',
        rabattPlaceholder: 'e.g. 20',
        rabattAria: 'Discount in percent',
        rabatt1Label: 'Discount 1',
        rabatt1Placeholder: 'e.g. 15',
        rabatt1Aria: 'First discount rate in percent',
        rabatt2Label: 'Discount 2',
        rabatt2Placeholder: 'e.g. 8',
        rabatt2Aria: 'Second discount rate in percent',
        errAmountRequired: 'Please enter an amount.',
        errAmountPositive: 'Please enter a positive amount.',
        errAmountMax: 'Maximum amount: 9,999,999 €',
        errEndpreisRequired: 'Please enter a final price.',
        errEndpreisNegative: 'Final price must be ≥ 0.',
        errEndpreisGreater: 'Final price cannot exceed the original price.',
        errRabattRequired: 'Please enter a discount percentage.',
        errRabattNegative: 'Discount must be ≥ 0 %.',
        errRabattMax: 'Discount cannot exceed 100 %.',
        errRabatt1Required: 'Please enter discount 1.',
        errRabattRange: 'Discount: 0–100 %',
        errRabatt2Required: 'Please enter discount 2.',
        resultsAria: 'Calculation result',
        cardEndpreis: 'Final price',
        cardSavings: 'You save',
        cardSavingsAlt: 'Savings',
        cardRabatt: 'Discount',
        cardGesamtRabatt: 'Total discount',
        cardUrsprungspreis: 'Original price',
        additivAria: 'Explanation: Why do discounts not add up?',
        additivHeader: 'Why does {r1} % + {r2} % ≠ {naive} % total discount?',
        additivExplanation:
          'Each discount is applied to the already-reduced price. The second discount refers not to the original price, but to the lower intermediate price.',
        additivMathAria: 'Chain-discount calculation',
        additivCalcWrongHtml:
          '{r1}&nbsp;%&thinsp;+&thinsp;{r2}&nbsp;% <span class="calc--wrong">≠&thinsp;{naive}&nbsp;%</span>',
        additivCalcRightHtml:
          'Correct: <span class="calc--right">{right}&nbsp;%</span>',
        emptyState: 'Enter the values to see the result instantly.',
        privacyBadge: 'No server upload · No tracking · Runs locally in your browser',
      },
      cashDiscountCalculator: {
        regionAria: 'Cash discount calculator',
        basisLabel: 'Discount basis',
        basisBarAria: 'Select discount basis',
        basisBrutto: 'Gross',
        basisNetto: 'Net + VAT',
        basisHintBrutto: 'Standard accounting practice (DE)',
        basisHintNetto: 'Enter net amount; VAT is shown separately',
        betragLabelBrutto: 'Invoice amount (gross)',
        betragLabelNetto: 'Invoice amount (net)',
        betragPlaceholder: 'e.g. 1000',
        betragAria: 'Invoice amount in euros',
        satzLabel: 'Discount rate',
        satzPlaceholder: 'e.g. 2',
        satzAria: 'Discount rate in percent',
        skontofristLabel: 'Discount period',
        skontofristPlaceholder: 'e.g. 10',
        skontofristAria: 'Discount period in days',
        zahlungszielLabel: 'Payment due date',
        zahlungszielPlaceholder: 'e.g. 30',
        zahlungszielAria: 'Payment due date in days',
        mwstLabel: 'VAT rate',
        mwstPlaceholder: 'e.g. 19',
        mwstAria: 'VAT rate in percent',
        unitDays: 'days',
        errAmountRequired: 'Please enter an amount.',
        errAmountPositive: 'Please enter a positive amount.',
        errSatzRequired: 'Please enter a discount rate.',
        errSatzNegative: 'The discount rate cannot be negative.',
        errSatzMax: 'A discount rate of 100 % or more is not allowed.',
        errDaysPositive: 'Please enter a positive number of days.',
        errZahlungszielPositive: 'Please enter a positive number of days.',
        errFristShorter: 'The discount period must be shorter than the payment due date.',
        errMwstRequired: 'Please enter a VAT rate.',
        errMwstNegative: 'VAT rate must be ≥ 0 %.',
        resultsAria: 'Calculation result',
        jahreszinsAria: 'Effective annual interest rate',
        jahreszinsLabel: 'Effective annual rate (supplier credit)',
        jahreszinsCopyAria: 'Copy annual rate',
        jahreszinsUnit: '% p.a.',
        ampelGruen: 'Cash discount pays off — cheaper than any bank loan',
        ampelGelb: 'Depends on your financing rate',
        ampelRot: 'Cash discount rarely pays off at such a low rate',
        cardSkontoBetrag: 'Discount amount',
        cardSkontoCopyAria: 'Copy discount amount',
        cardZahlBetrag: 'Payment amount',
        cardZahlCopyAria: 'Copy payment amount',
        nettoAria: 'Net breakdown',
        nettoTitle: 'Breakdown (net basis)',
        nettoVorSkonto: 'Net before discount',
        nettoNachSkonto: 'Net after discount',
        nettoMwstNachTemplate: 'VAT after discount ({mwst} %)',
        nettoBruttoNach: 'Gross after discount',
        nettoHint: 'Note: The discount also reduces the buyer\'s deductible input VAT.',
        emptyState: 'Enter the values to see the result instantly.',
        privacyBadge: 'No server upload · No tracking · Runs locally in your browser',
      },
      cashFlowCalculator: {
        regionAria: 'Cash-flow calculator',
        modeAria: 'Select calculation method',
        modeDirekt: 'Direct method',
        modeIndirekt: 'Indirect method',
        modeFree: 'Free cash flow',
        descDirekt: 'Direct method: Cash flow = receipts − payments. Suited for freelancers and small businesses.',
        descIndirekt: 'Indirect method (HGB/IFRS): Starts from net income, adjusted for non-cash items and working-capital changes.',
        descFree: 'Free cash flow: Capital available after investments — for debt repayment, dividends, or reinvestment.',
        einzahlungenLabel: 'Cash receipts',
        einzahlungenPlaceholder: 'e.g. 85,000',
        einzahlungenAria: 'Cash receipts in euros',
        auszahlungenLabel: 'Cash payments',
        auszahlungenPlaceholder: 'e.g. 72,000',
        auszahlungenAria: 'Cash payments in euros',
        juLabel: 'Net income',
        juHint: 'may be negative',
        juPlaceholder: 'e.g. 20,000',
        juAria: 'Net income in euros',
        afaLabel: 'Depreciation',
        afaPlaceholder: 'e.g. 15,000',
        afaAria: 'Depreciation in euros',
        rueckLabel: 'Δ Provisions',
        rueckHint: '+ = increased',
        rueckPlaceholder: 'e.g. 0',
        rueckAria: 'Change in provisions in euros',
        fordLabel: 'Δ Receivables',
        fordHint: '+ = increased → reduces CF',
        fordPlaceholder: 'e.g. 5,000',
        fordAria: 'Change in receivables in euros',
        vorrLabel: 'Δ Inventory',
        vorrHint: '+ = increased → reduces CF',
        vorrPlaceholder: 'e.g. 0',
        vorrAria: 'Change in inventory in euros',
        verbLabel: 'Δ Liabilities',
        verbHint: '+ = increased → improves CF',
        verbPlaceholder: 'e.g. 0',
        verbAria: 'Change in liabilities in euros',
        ocfLabel: 'Operating cash flow (OCF)',
        ocfPlaceholder: 'e.g. 30,000',
        ocfAria: 'Operating cash flow in euros',
        capexLabel: 'Capital expenditures (CapEx)',
        capexPlaceholder: 'e.g. 10,000',
        capexAria: 'CapEx in euros',
        errInvalidNumber: 'Please enter a valid number.',
        errEinzahlungenNegative: 'Cash receipts must be ≥ 0 €.',
        errAuszahlungenNegative: 'Cash payments must be ≥ 0 €.',
        errAfaNegative: 'Depreciation must be ≥ 0 €.',
        errCapexNegative: 'CapEx must be ≥ 0 €.',
        resultsAria: 'Calculation result',
        resultRegionAria: 'Cash-flow result',
        cardCashflow: 'Cash flow',
        cardOcf: 'Operating cash flow',
        cardFreeCf: 'Free cash flow',
        statusPositiv: 'Positive cash flow — liquidity inflow',
        statusNegativ: 'Negative cash flow — review liquidity risk',
        statusBreakeven: 'Break-even — cash flow balanced',
        lernmomentAria: 'Learning moment',
        lernmomentLabel: 'Why profit ≠ liquidity',
        lernmomentTextHtml:
          'Your net income is <strong>{ju}&nbsp;€</strong>, your operating cash flow is <strong>{ocf}&nbsp;€</strong>. The difference is explained by non-cash items (depreciation, provisions) and changes in working capital (receivables, inventory, liabilities).',
        freeAria: 'Free cash-flow explanation',
        freeLabel: 'What does the free cash flow mean?',
        freeTextHtml:
          'After subtracting capital expenditures ({capex}&nbsp;€), <strong>{free}&nbsp;€</strong> remains free — for debt repayment, dividends, or new investments.',
        formelAria: 'Formula breakdown',
        formelLabel: 'Formula',
        emptyState: 'Enter the values to see the cash flow instantly.',
        privacyBadge: 'No server upload · No tracking · Runs locally in your browser',
      },
      leasingFactorCalculator: {
        regionAria: 'Leasing factor calculator',
        rateLabel: 'Monthly payment',
        ratePlaceholder: 'e.g. 250',
        rateAria: 'Monthly leasing payment in euros',
        unitEuroPerMonth: '€/month',
        listenpreisLabel: 'Manufacturer\'s list price',
        listenpreisPlaceholder: 'e.g. 33,850',
        listenpreisAria: 'Manufacturer\'s gross list price in euros',
        sonderzahlungToggle: 'Include down payment',
        optionalBadge: 'optional',
        sonderzahlungLabel: 'Down payment',
        sonderzahlungPlaceholder: 'e.g. 3,600',
        sonderzahlungAria: 'One-time down payment in euros',
        laufzeitLabel: 'Term',
        laufzeitAria: 'Term in months',
        laufzeitOptionTemplate: '{months} months',
        errInvalidRate: 'Please enter a valid payment.',
        errRateNegative: 'Payment must be ≥ 0.',
        errInvalidListenpreis: 'Please enter a valid list price.',
        errListenpreisPositive: 'List price must be > 0.',
        errInvalidSonderzahlung: 'Please enter a valid down payment.',
        errSonderzahlungNegative: 'Down payment must be ≥ 0.',
        bereinigungInfoHtml:
          'Pro-rated down payment: <strong>{anteil}&nbsp;€/month</strong> — adjusted payment: <strong>{bereinigt}&nbsp;€</strong>',
        resultsAria: 'Calculation result',
        cardLeasingfaktor: 'Leasing factor',
        cardMarktdurchschnitt: 'Market average 2024',
        cardMarktSource: 'Source: leasingmarkt.de',
        cardBereinigung: 'Adjustment',
        cardBereinigungActive: 'active',
        cardBereinigungSubTemplate: 'Down payment spread over {months} months',
        bewertungSpitze: 'Top deal',
        bewertungSehrGut: 'Very good',
        bewertungGut: 'Good',
        bewertungDurchschnittlich: 'Average',
        bewertungWenigAttraktiv: 'Unattractive',
        gaugeAria: 'Rating gauge',
        gaugeImgAriaTemplate: 'Leasing factor {factor} — {bewertung}',
        benchmarkAriaLabel: 'Market average 0.63',
        benchmarkLabel: 'Ø 0.63',
        formelAria: 'Formula breakdown',
        formelLabel: 'Formula',
        copyAria: 'Copy leasing factor to clipboard',
        copyError: 'Error',
        disclaimer:
          'This calculation is for informational purposes only. The leasing factor is a comparison metric — it does not replace a full offer review.',
        privacyBadge: 'No server upload · No tracking · Runs locally in your browser',
      },
      inheritanceTaxCalculator: {
        regionAria: 'German inheritance-tax calculator',
        verwandtschaftLabel: 'Relationship to deceased',
        verwandtschaftAria: 'Relationship to the deceased',
        vgEhepartner: 'Spouse / civil partner',
        vgKind: 'Child (under 28 years)',
        vgEnkelEltVerstorben: 'Grandchild (parents deceased)',
        vgEnkelEltLeben: 'Grandchild (parents living)',
        vgElternGroßeltern: 'Parents / grandparents',
        vgGeschwister: 'Siblings',
        vgNichtenNeffen: 'Nieces / nephews',
        vgSchwiegerStief: 'Parents-in-law / step-parents',
        vgSonstiges: 'Not related',
        hintEhepartner: 'Tax class I · Allowance 500,000 € · Pension allowance 256,000 €',
        hintKind: 'Tax class I · Allowance 400,000 € · Pension allowance age-dependent',
        hintEnkelEltVerstorben: 'Tax class I · Allowance 400,000 €',
        hintEnkelEltLeben: 'Tax class I · Allowance 200,000 €',
        hintElternGroßeltern: 'Tax class I · Allowance 100,000 €',
        hintKlasse2: 'Tax class II · Allowance 20,000 €',
        hintKlasse3: 'Tax class III · Allowance 20,000 €',
        kindesalterLabel: 'Age of child',
        kindesalterBadge: 'for pension allowance',
        kindesalterPlaceholder: 'e.g. 12',
        kindesalterAria: 'Age of child in years',
        unitYears: 'years',
        nachlasswertLabel: 'Estate value (gross)',
        nachlasswertPlaceholder: 'e.g. 500,000',
        nachlasswertAria: 'Total estate value in euros',
        schuldenLabel: 'Debts / liabilities',
        optionalBadge: 'optional',
        schuldenPlaceholder: 'e.g. 50,000',
        schuldenAria: 'Estate debts and liabilities in euros',
        familienheimLabel: 'Family home value (§13 exempt)',
        familienheimPlaceholder: 'e.g. 300,000',
        familienheimAria: 'Value of the owner-occupied family home in euros (§13 ErbStG fully tax-exempt)',
        vorschenkungLabel: 'Prior gifts (last 10 years, §14)',
        vorschenkungPlaceholder: 'e.g. 100,000',
        vorschenkungAria: 'Value of gifts received in the last 10 years in euros',
        mietwohnCheckboxAria: 'Apply 10 % rebate on rental properties under §13d ErbStG',
        mietwohnCheckboxText: '10 % rebate on rental property (§13d ErbStG, since 2023)',
        mietwohnLabel: 'Rental-property value',
        mietwohnPlaceholder: 'e.g. 400,000',
        mietwohnAria: 'Rental-property value in euros',
        errInvalidAmount: 'Please enter a valid amount.',
        errInvalidAge: 'Please enter a valid age (0–150).',
        resultsAria: 'Calculation result',
        kachelSteuer: 'Inheritance tax',
        kachelSteuerSubTemplate: 'Tax rate {satz}',
        kachelNetto: 'Net inheritance',
        kachelNettoSub: 'after tax',
        kachelKlasse: 'Tax class',
        kachelKlasseSub: '§15 ErbStG',
        aufschluesselungAria: 'Calculation breakdown',
        aufTitle: 'Calculation steps',
        rowNachlassBrutto: 'Estate value (gross)',
        rowSchulden: 'Debts / liabilities',
        rowErbfallkosten: 'Probate-cost lump sum (§10 (5))',
        rowHausrat: 'Household-goods lump sum (§13 (1) No. 1)',
        rowFamilienheim: 'Family home tax-exempt (§13)',
        rowMietwohnAbzug: '10 % rental-property rebate (§13d)',
        rowSubtotal: 'Taxable inheritance (before allowance)',
        rowFreibetrag: 'Personal allowance (§16)',
        rowVersorgungsfreibetrag: 'Pension allowance (§17)',
        rowVorschenkungen: 'Prior gifts §14 (10 yrs)',
        rowTotal: 'Taxable inheritance (net)',
        disclaimer:
          'Business assets (§§ 13a/13b ErbStG), international inheritances, and reversionary inheritance require individual professional advice. This calculation is a first orientation, not legal advice. The Federal Constitutional Court ruling on business-asset relief is still pending.',
        copyAria: 'Copy result as text for tax advisor',
        copyButton: 'Copy result for advisor',
        copyError: 'Error',
        resetAria: 'Reset all inputs',
        exportTitle: '=== Inheritance-tax calculation (kittokit.com) ===',
        exportLabelVg: 'Relationship:',
        exportLabelKlasse: 'Tax class:',
        exportLabelNachlass: 'Estate (gross):',
        exportLabelSchulden: 'Debts / liabilities:',
        exportLabelErbfallkosten: 'Probate-cost lump sum:',
        exportLabelHausrat: 'Household-goods lump sum:',
        exportLabelFamilienheim: 'Family home (§13):',
        exportLabelMietwohn: 'Rental-property rebate (§13d):',
        exportLabelStpflVor: 'Taxable inh. (before allowance):',
        exportLabelFreibetrag: 'Personal allowance (§16):',
        exportLabelVersorgung: 'Pension allowance §17:',
        exportLabelVorschenkung: 'Prior gifts (§14):',
        exportLabelStpflNetto: 'Taxable inh. (net):',
        exportLabelSatz: 'Tax rate:',
        exportLabelSteuer: 'INHERITANCE TAX:',
        exportLabelNetto: 'Net inheritance:',
        exportNote1: 'Note: This calculation is only a first orientation.',
        exportNote2: 'Business assets, international inheritances, and reversionary inheritance require professional advice (§§ 13a, 13b ErbStG, DTA).',
      },
      audioTranscription: {
        removeFileAria: 'Remove file',
        uploadText: 'Choose audio file',
        uploadHint: 'MP3, WAV, M4A · Local in browser',
        sizeWarningTemplate: 'Large file ({mb} MB) — processing may take several minutes depending on device and put load on your browser.',
        sizeHintTemplate: 'Medium file ({mb} MB) — processing may take a while.',
        modelLabel: 'Model:',
        modelTiny: 'Fast (~150 MB)',
        modelBase: 'Balanced (~450 MB)',
        modelSmall: 'Best quality (~1 GB)',
        languageLabel: 'Language:',
        languageGerman: 'German',
        languageEnglish: 'English',
        languageFrench: 'French',
        languageSpanish: 'Spanish',
        languageAuto: 'Auto-detect',
        startButton: 'Start transcription',
        loaderModelLoading: 'AI model loading...',
        loaderModelLoadingNoteTemplate:
          'The {speed} speech-recognition model ({size}) is being loaded and prepared in the browser.',
        speedSchnell: 'fast',
        speedAusgewogen: 'balanced',
        speedGroß: 'large',
        sizeTiny: '~150 MB',
        sizeBase: '~450 MB',
        sizeSmall: '~1 GB',
        analyzingText: 'Transcribing audio data...',
        analyzingNote: 'Local transcription in progress. No audio data leaves your browser. This may take a while depending on audio length.',
        resultTitle: 'Transcribed text',
        formatTxt: '.txt (text only)',
        formatSrt: '.srt (subtitles)',
        copyTitle: 'Copy to clipboard',
        downloadTitle: 'Download',
        downloadButton: 'Download',
        errorGeneric: 'Transcription failed.',
        otherFileButton: 'Choose another file',
      },
    },
  },
};

export function t(lang: Lang): UiStrings {
  return strings[lang] ?? strings.de;
}
