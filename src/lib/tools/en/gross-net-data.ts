/**
 * Tax-rate constants for the EN region-aware gross-to-net (paycheck)
 * calculator.
 *
 * Year tag: 2025 tax year (US filed in 2026, UK 2025/26 tax year).
 * Sources:
 *   - US: IRS Rev. Proc. 2024-40 + SSA 2025 wage-base announcement.
 *   - UK: HMRC published rates for 2025/26 + Spring 2024 NI cuts.
 *
 * validUntil: 2026-12-31 (review when IRS / HMRC publish 2026/27 data).
 */

// ── United States (2025 tax year) ─────────────────────────────────────────

export type UsFilingStatus = 'single' | 'mfj' | 'hoh' | 'mfs';

export interface UsBracket {
  /** Lower bound of taxable income for this bracket (inclusive). */
  min: number;
  /** Marginal rate as a decimal, e.g. 0.22 for 22 %. */
  rate: number;
}

/**
 * 2025 federal income-tax brackets per filing status. The bracket "min"
 * is the lowest taxable-income value that falls into that bracket; the
 * bracket runs up to the next entry's `min` (or infinity for the last).
 */
export const US_2025_BRACKETS: Record<UsFilingStatus, UsBracket[]> = {
  single: [
    { min: 0,       rate: 0.10 },
    { min: 11925,   rate: 0.12 },
    { min: 48475,   rate: 0.22 },
    { min: 103350,  rate: 0.24 },
    { min: 197300,  rate: 0.32 },
    { min: 250525,  rate: 0.35 },
    { min: 626350,  rate: 0.37 },
  ],
  mfj: [
    { min: 0,       rate: 0.10 },
    { min: 23850,   rate: 0.12 },
    { min: 96950,   rate: 0.22 },
    { min: 206700,  rate: 0.24 },
    { min: 394600,  rate: 0.32 },
    { min: 501050,  rate: 0.35 },
    { min: 751600,  rate: 0.37 },
  ],
  hoh: [
    { min: 0,       rate: 0.10 },
    { min: 17000,   rate: 0.12 },
    { min: 64850,   rate: 0.22 },
    { min: 103350,  rate: 0.24 },
    { min: 197300,  rate: 0.32 },
    { min: 250500,  rate: 0.35 },
    { min: 626350,  rate: 0.37 },
  ],
  mfs: [
    { min: 0,       rate: 0.10 },
    { min: 11925,   rate: 0.12 },
    { min: 48475,   rate: 0.22 },
    { min: 103350,  rate: 0.24 },
    { min: 197300,  rate: 0.32 },
    { min: 250525,  rate: 0.35 },
    { min: 375800,  rate: 0.37 },
  ],
};

/** 2025 standard deduction by filing status. */
export const US_2025_STD_DEDUCTION: Record<UsFilingStatus, number> = {
  single: 15000,
  mfj: 30000,
  hoh: 22500,
  mfs: 15000,
};

/**
 * FICA components — Social Security wage base, Medicare base + additional.
 * Both employee shares; the matching employer share is not surfaced because
 * the W-2 paycheck calculator only needs the employee portion.
 */
export const US_2025_FICA = {
  /** Social Security: 6.2 % up to the wage base. */
  socialSecurityRate: 0.062,
  socialSecurityWageBase: 176100,
  /** Medicare: 1.45 % on all wages. */
  medicareRate: 0.0145,
  /** Additional Medicare: 0.9 % above threshold (single $200k / MFJ $250k / MFS $125k). */
  additionalMedicareRate: 0.009,
  additionalMedicareThreshold: {
    single: 200000,
    mfj: 250000,
    hoh: 200000,
    mfs: 125000,
  } as Record<UsFilingStatus, number>,
} as const;

// ── United Kingdom (2025/26 tax year) ─────────────────────────────────────

export interface UkIncomeTaxBracket {
  min: number; // taxable income above this band-floor
  rate: number;
}

/**
 * 2025/26 UK Personal Allowance + income-tax bands (England/Wales/N.Ireland).
 * Scotland has a separate 6-band system that's out of scope here — UK rUK
 * (rest-of-UK) is the most common case for English-speaking searches.
 */
export const UK_2025_PERSONAL_ALLOWANCE = 12570; // £/year
export const UK_2025_PA_TAPER_START = 100000;    // PA reduces £1 per £2 above
export const UK_2025_PA_TAPER_FULL = 125140;     // PA fully eroded at this point

/** Bands measured against TAXABLE income (gross minus Personal Allowance). */
export const UK_2025_INCOME_TAX: UkIncomeTaxBracket[] = [
  { min: 0,       rate: 0.20 }, // Basic rate
  { min: 37700,   rate: 0.40 }, // Higher rate (gross 50,270)
  { min: 112570,  rate: 0.45 }, // Additional rate (gross 125,140)
];

/**
 * 2025/26 Class-1 employee National Insurance rates.
 * Primary Threshold = £12,570/year, Upper Earnings Limit = £50,270/year.
 * Spring 2024 cuts: 12 % → 10 % (Jan 2024) → 8 % (April 2024). 2 % above UEL.
 */
export const UK_2025_NI = {
  primaryThreshold: 12570,
  upperEarningsLimit: 50270,
  ratePT_to_UEL: 0.08,
  rateAboveUEL: 0.02,
} as const;
