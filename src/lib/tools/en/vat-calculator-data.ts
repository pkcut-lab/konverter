/**
 * Tax-rate constants for the EN region-aware VAT/Sales-Tax calculator.
 *
 * `validUntil` exists so a future yearly audit (Memory-Note in the user's
 * project memory) can spot stale data quickly — when a state's rate ticks
 * one bp the comment lets us prove the file was reviewed.
 *
 * State-level only — local (city/county) sales-tax stacking is intentionally
 * out of scope (would require a paid ZIP-code API and turn this into a
 * 50-MB dataset per quarter). Disclaimer in the UI states this.
 */

export interface UsStateRate {
  /** ISO-3166-2 sub-code without the leading "US-". */
  code: string;
  /** Full state/territory name. */
  name: string;
  /** State-level base sales-tax rate in % (NOT the combined w/ city/county). */
  rate: number;
  /** Optional note rendered next to the picker for unusual states. */
  note?: string;
}

/**
 * 2026 state-level US sales-tax rates. Source: state revenue-department
 * publications, cross-checked against the Tax Foundation 2026 mid-year
 * review. Five states have no general state sales tax: AK, DE, MT, NH, OR.
 *
 * Hawaii is included even though it's technically a General Excise Tax,
 * not sales tax — for end-user purposes the calc-shape is identical.
 *
 * validUntil: 2027-01-01 (review next year)
 */
export const US_STATE_RATES: readonly UsStateRate[] = [
  { code: 'AL', name: 'Alabama',              rate: 4.0  },
  { code: 'AK', name: 'Alaska',               rate: 0.0,    note: 'No state-level sales tax (local rates may apply)' },
  { code: 'AZ', name: 'Arizona',              rate: 5.6  },
  { code: 'AR', name: 'Arkansas',             rate: 6.5  },
  { code: 'CA', name: 'California',           rate: 7.25 },
  { code: 'CO', name: 'Colorado',             rate: 2.9  },
  { code: 'CT', name: 'Connecticut',          rate: 6.35 },
  { code: 'DE', name: 'Delaware',             rate: 0.0,    note: 'No state sales tax' },
  { code: 'DC', name: 'District of Columbia', rate: 6.0  },
  { code: 'FL', name: 'Florida',              rate: 6.0  },
  { code: 'GA', name: 'Georgia',              rate: 4.0  },
  { code: 'HI', name: 'Hawaii',               rate: 4.0,    note: 'General Excise Tax (functionally equivalent)' },
  { code: 'ID', name: 'Idaho',                rate: 6.0  },
  { code: 'IL', name: 'Illinois',             rate: 6.25 },
  { code: 'IN', name: 'Indiana',              rate: 7.0  },
  { code: 'IA', name: 'Iowa',                 rate: 6.0  },
  { code: 'KS', name: 'Kansas',               rate: 6.5  },
  { code: 'KY', name: 'Kentucky',             rate: 6.0  },
  { code: 'LA', name: 'Louisiana',            rate: 4.45 },
  { code: 'ME', name: 'Maine',                rate: 5.5  },
  { code: 'MD', name: 'Maryland',             rate: 6.0  },
  { code: 'MA', name: 'Massachusetts',        rate: 6.25 },
  { code: 'MI', name: 'Michigan',             rate: 6.0  },
  { code: 'MN', name: 'Minnesota',            rate: 6.875},
  { code: 'MS', name: 'Mississippi',          rate: 7.0  },
  { code: 'MO', name: 'Missouri',             rate: 4.225},
  { code: 'MT', name: 'Montana',              rate: 0.0,    note: 'No state sales tax' },
  { code: 'NE', name: 'Nebraska',             rate: 5.5  },
  { code: 'NV', name: 'Nevada',               rate: 6.85 },
  { code: 'NH', name: 'New Hampshire',        rate: 0.0,    note: 'No state sales tax' },
  { code: 'NJ', name: 'New Jersey',           rate: 6.625},
  { code: 'NM', name: 'New Mexico',           rate: 5.0  },
  { code: 'NY', name: 'New York',             rate: 4.0  },
  { code: 'NC', name: 'North Carolina',       rate: 4.75 },
  { code: 'ND', name: 'North Dakota',         rate: 5.0  },
  { code: 'OH', name: 'Ohio',                 rate: 5.75 },
  { code: 'OK', name: 'Oklahoma',             rate: 4.5  },
  { code: 'OR', name: 'Oregon',               rate: 0.0,    note: 'No state sales tax' },
  { code: 'PA', name: 'Pennsylvania',         rate: 6.0  },
  { code: 'RI', name: 'Rhode Island',         rate: 7.0  },
  { code: 'SC', name: 'South Carolina',       rate: 6.0  },
  { code: 'SD', name: 'South Dakota',         rate: 4.2  },
  { code: 'TN', name: 'Tennessee',            rate: 7.0  },
  { code: 'TX', name: 'Texas',                rate: 6.25 },
  { code: 'UT', name: 'Utah',                 rate: 4.85 },
  { code: 'VT', name: 'Vermont',              rate: 6.0  },
  { code: 'VA', name: 'Virginia',             rate: 5.3  },
  { code: 'WA', name: 'Washington',           rate: 6.5  },
  { code: 'WV', name: 'West Virginia',        rate: 6.0  },
  { code: 'WI', name: 'Wisconsin',            rate: 5.0  },
  { code: 'WY', name: 'Wyoming',              rate: 4.0  },
];

export type UkVatBand = 'standard' | 'reduced' | 'zero' | 'exempt';

export interface UkVatRate {
  band: UkVatBand;
  rate: number;
  label: string;
  /** Plain-English example category — helps UI render a hint. */
  examples: string;
}

/**
 * UK VAT bands as published by HMRC.
 * validUntil: 2027-01-01 (rates have been stable since 2011 except for
 * the 2021 reduced-to-zero on sanitary products, but check yearly).
 */
export const UK_VAT_RATES: readonly UkVatRate[] = [
  {
    band: 'standard',
    rate: 20.0,
    label: 'Standard rate (20%)',
    examples: 'Most goods and services',
  },
  {
    band: 'reduced',
    rate: 5.0,
    label: 'Reduced rate (5%)',
    examples: 'Domestic energy, child car seats, mobility aids for the elderly',
  },
  {
    band: 'zero',
    rate: 0.0,
    label: 'Zero-rate (0%)',
    examples: 'Most food, books, children\'s clothing, exports outside the UK',
  },
  {
    band: 'exempt',
    rate: 0.0,
    label: 'Exempt (no VAT applied)',
    examples: 'Insurance, postage stamps, health services, education',
  },
];
