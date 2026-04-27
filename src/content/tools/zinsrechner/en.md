---
toolId: interest-calculator
language: en
title: "Interest Calculator — Simple, Compound, US APR & UK ISA"
headingHtml: "Calculate <em>simple or compound interest</em> with US/UK tax"
metaDescription: "Free interest calculator. Simple or compound, any frequency. Apply US federal marginal tax or UK ISA / income-tax band on interest. APY shown."
tagline: "Run the math both ways: simple I = P × r × t, or compound at any frequency. Apply your US federal marginal bracket or your UK income-tax band on the interest, or set 0% for an ISA / Roth account."
intro: "This calculator does the two things most interest tools skip: it runs both simple and compound math, and it models the tax on interest. Pick your region (US or UK) at the top — the calculator then shows the right tax dropdown (US federal brackets, or UK ISA / income-tax bands) for your jurisdiction."
howToUse:
  - "Pick your region — United States or United Kingdom. The choice persists in your browser."
  - "Enter principal, annual rate, and term in years."
  - "Choose Simple or Compound interest. Compound mode lets you pick a frequency (annual, semi-annual, quarterly, monthly, daily)."
  - "US: pick your federal marginal tax bracket on the interest income (0% for tax-deferred / Roth). UK: tick the ISA box for tax-free, otherwise pick your income-tax band."
  - "Read the net final amount, net interest, APY, and a daily-accrual figure useful for loan-day-cost questions."
faq:
  - q: "What's the difference between simple and compound interest?"
    a: "Simple interest uses I = P × r × t — interest is calculated only on the original principal, never on accumulated interest. It's used for many US auto loans, personal loans, and short-term Treasury bills. Compound interest uses A = P × (1 + r/n)^(n × t) where n is the compounding frequency — interest is added to the balance periodically, and the next period's interest is calculated on the new (higher) balance. For the same nominal rate and term, compound interest always produces more total interest, beneficial for savers and detrimental for borrowers."
  - q: "What is APY and how is it different from APR?"
    a: "APY (Annual Percentage Yield) is the rate that, compounded once a year, produces the same final amount as the actual compounding schedule. It accounts for compounding effects. APR (Annual Percentage Rate) is a nominal yearly rate — typically the headline rate quoted on a loan or savings product, ignoring compounding. For monthly-compounded 5% nominal, APY is about 5.116%. APY > APR whenever the rate compounds more than once a year."
  - q: "How do US savings interest taxes work?"
    a: "Interest from a regular taxable account (high-yield savings, money-market account, CDs, taxable brokerage) is taxed as ordinary income at your federal marginal bracket plus state/local income tax. Interest from a Roth IRA / 401(k) inside the wrapper grows tax-free. Interest from a Traditional IRA / 401(k) is tax-deferred — it grows untaxed until withdrawal, then is taxed as ordinary income. Pick 0% in the dropdown for any tax-deferred or Roth account."
  - q: "How does a UK ISA make interest tax-free?"
    a: "ISAs (Individual Savings Accounts) are a UK tax wrapper — interest, dividends, and capital gains earned inside an ISA are not subject to income tax or capital-gains tax. The annual allowance is £20,000 (2025/26) split across Cash ISAs and Stocks & Shares ISAs. Outside an ISA, the Personal Savings Allowance covers the first £1,000 of interest for basic-rate taxpayers (£500 for higher-rate, £0 for additional-rate); above the PSA, interest is taxed at your income-tax band."
  - q: "Should I prefer monthly or daily compounding?"
    a: "Daily compounding produces marginally more interest than monthly — for 5% nominal over 1 year, daily APY is about 5.127% versus 5.116% monthly. The difference grows over very long horizons but is small over typical savings periods. The bigger lever is the nominal rate itself; chasing 0.01% extra APY through compounding-frequency arbitrage is rarely worth the friction of switching products."
  - q: "Why does the calculator show a 'daily accrual' figure?"
    a: "On a loan, daily interest accrual = principal × annual-rate ÷ 365. It's the per-day cost of carrying a balance, which is what auto loans and credit cards actually charge. Knowing the figure makes loan timing decisions concrete — paying a $20,000 loan a week early at 7% APR saves about $27 in interest. We compute it at t=0 (current principal) so it's a forward-looking estimate."
relatedTools:
  - compound-interest-calculator
  - loan-calculator
  - vat-calculator
category: finance
contentVersion: 2
datePublished: '2026-04-26'
dateModified: '2026-04-27'

---

## What This Tool Does

The calculator runs both simple and compound interest math with region-aware tax treatment behind the scenes. The region toggle at the top of the page picks which tax system the calculator applies; your choice persists for the next visit.

- **United States** — federal marginal-tax-bracket dropdown (0% / 10% / 12% / 22% / 24% / 32% / 35% / 37%). Pick 0% for Roth IRA / Roth 401(k) / Traditional IRA / Traditional 401(k) / HSA — everything where interest grows tax-deferred or tax-free inside the wrapper. Pick your bracket for a regular taxable account.
- **United Kingdom** — ISA-tax-free toggle, plus an income-tax-band dropdown (0% Personal Savings Allowance / 20% basic / 40% higher / 45% additional) for non-ISA accounts.

Both regions support simple and compound interest with a frequency picker (annual, semi-annual, quarterly, monthly, daily). The output shows the gross final amount, gross interest, tax on interest, net interest, net final amount, APY, and daily accrual at t=0.

## How Does the Math Work?

### Simple Interest

```
I     = P × r × t
A     = P + I = P × (1 + r × t)
APY   = r           (no compounding — APY equals nominal rate)
```

Where P is principal, r is the annual rate as a decimal, and t is time in years. Used for most US auto loans, personal loans, federal student loans, and short-term Treasury bills.

### Compound Interest

```
A     = P × (1 + r/n)^(n × t)
I     = A − P
APY   = (1 + r/n)^n − 1
```

Where n is the number of compounding periods per year (12 for monthly, 365 for daily). Used for nearly every modern savings account, brokerage interest, CDs (typically monthly), and any growth-asset projection.

### Tax on Interest

```
tax_on_interest = I × tax_rate
net_interest    = I − tax_on_interest
net_final       = P + net_interest
```

The tax rate comes from your region-specific selection. For US Roth / tax-deferred accounts and UK ISAs, set 0% — the gross figures are also the net figures.

## Which Tax Rate Should You Pick (US)?

The federal marginal rate that applies to your interest income is the same as the rate on your last dollar of wages — not your effective rate. If you're in the 22% bracket on wages, you're in the 22% bracket on interest. The 2025 brackets:

- **0%** — Tax-deferred accounts (Traditional IRA, 401(k), HSA) where interest grows untaxed; Roth accounts where it grows tax-free.
- **10%** — Single income up to $11,925.
- **12%** — Single $11,925 – $48,475.
- **22%** — Single $48,475 – $103,350. The most common bracket for middle-class W-2 earners.
- **24%** — Single $103,350 – $197,300.
- **32% / 35% / 37%** — Higher-income brackets.

State income tax on interest is not modeled here — varies by state.

## Which Tax Treatment Should You Pick (UK)?

- **ISA (tax-free)** — Cash ISA, Stocks & Shares ISA, Innovative Finance ISA. Interest is not subject to income tax. Annual contribution allowance £20,000 (2025/26).
- **0% (PSA-covered)** — Outside an ISA, the Personal Savings Allowance gives basic-rate taxpayers £1,000 of tax-free interest (£500 for higher-rate, £0 for additional-rate). For amounts within the PSA, the effective rate is 0%.
- **20% / 40% / 45%** — Income tax on interest above the PSA, taxed at your marginal income-tax band.

## What Are Common Use Cases?

**Comparing a tax-free ISA against a higher-yielding regular account.** A 5% UK Cash ISA versus a 5.5% taxable savings account at the higher 40% rate: ISA wins because 5.5% × (1 − 0.40) = 3.3% net, which is lower than the ISA's 5% tax-free.

**Long-term retirement projection (US).** $100,000 at 7% nominal compounded monthly for 30 years inside a Roth IRA: about $811,649 net (no tax). Same numbers in a taxable account at 24% marginal: about $658,053 net. The wrapper choice is worth ~$150k over 30 years.

**Loan day-cost estimation.** A $30,000 auto loan at 7.5% APR has a daily accrual of about $6.16. Paying a week early saves ~$43.

**APY arbitrage between savings products.** Bank A advertises 4.5% APR with monthly compounding (APY ≈ 4.59%). Bank B advertises 4.55% APR with annual compounding (APY = 4.55%). Bank A wins by 0.04 percentage points despite the lower headline rate.

**Comparing simple-interest auto-loan offers.** Two dealerships quote 7% and 8% APR simple interest on $25,000 over 5 years. The 1% rate difference costs $1,250 in total interest — meaningful enough to negotiate.

## What's the APY for Common Compounding Frequencies?

For a 5% nominal rate:

| Frequency | Periods/year | APY |
| --------- | ------------ | --- |
| Annual | 1 | 5.0000% |
| Semi-annual | 2 | 5.0625% |
| Quarterly | 4 | 5.0945% |
| Monthly | 12 | 5.1162% |
| Daily | 365 | 5.1267% |

Daily compounding adds about 11 basis points (0.11%) over annual compounding at 5% nominal. The marginal benefit of switching from monthly to daily is about 1 basis point.

## Where Do the Tax Brackets Come From and What About Privacy?

US brackets are the 2025 IRS-published federal marginal rates (Rev. Proc. 2024-40). UK rates are HMRC's 2025/26 income-tax bands. The Personal Savings Allowance has been £1,000 / £500 / £0 since April 2016.

The calculator runs entirely client-side. Your principal, rate, term, and tax-bracket pick never leave your browser — no analytics, no signup, no server. The region (US or UK) is the only thing stored, and only in your own browser's `localStorage`.

## Frequently Asked Questions

**Does this tool model variable-rate accounts?**
No. The calculator assumes a constant annual rate over the entire term — it's the right model for fixed-rate CDs, fixed-rate bonds, fixed-rate loans, and back-of-envelope projections. For a variable-rate savings account, plug in your current rate; the result is a snapshot, not a forecast.

**Does this account for inflation?**
No. The output is in nominal currency units. To convert to real (inflation-adjusted) terms, divide the final amount by (1 + expected_inflation)^years. Real returns are typically 2–3 percentage points lower than nominal in long-run modeling.

**What about the Additional Rate Threshold change in the UK?**
The £125,140 threshold for the 45% additional-rate band has been in place since April 2023 (reduced from £150,000). The calculator uses the current threshold; the dropdown picks the rate, the threshold is just for context.

**Why is daily accrual computed at t=0 instead of averaging?**
Daily accrual at t=0 is the most useful single number for loan-timing decisions ("what does each extra day on this balance cost?"). Averaging over the full term would smooth out the figure and make per-day comparisons less actionable. For total interest over a term, the gross-interest output is the right number.

## Which Related Tools Pair Well With This One?

For deeper compounding scenarios use the dedicated [compound interest calculator](/en/compound-interest-calculator); for loan amortization see the [loan calculator](/en/loan-calculator); for after-tax pricing the [VAT/sales-tax calculator](/en/vat-calculator).
