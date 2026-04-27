---
toolId: gross-net-calculator
language: en
title: "Paycheck Calculator — US Federal & UK Take-Home"
headingHtml: "Calculate your <em>take-home pay</em> in the US or UK"
metaDescription: "Free paycheck calculator. US: federal income tax + FICA across all 4 filing statuses. UK: PAYE + Class-1 NI + Personal Allowance taper. 2025 rates."
tagline: "Enter your gross annual salary, pick your filing status (US) or just your salary (UK), and see federal/income tax, FICA or NI, and your take-home pay broken down by line."
intro: "This calculator runs two side-by-side paycheck systems — US federal income tax plus FICA across all four filing statuses, and UK income tax plus Class-1 employee National Insurance with the Personal Allowance taper. The math uses 2025 federal brackets and 2025/26 UK tax-year rates. Pick your region with the toggle at the top of the tool."
howToUse:
  - "Pick your region — United States or United Kingdom. The choice persists in your browser."
  - "Enter your gross annual salary in USD (US) or GBP (UK)."
  - "US only: choose your IRS filing status — Single, Married filing jointly, Head of household, or Married filing separately."
  - "Read the take-home (annual + monthly) and the line-by-line tax breakdown below."
  - "Numbers update live as you type. Calculation runs entirely in your browser."
faq:
  - q: "What's the difference between US gross-to-net and UK gross-to-net?"
    a: "The US system stacks federal income tax (a 7-bracket marginal schedule from 10% to 37%) on top of FICA — Social Security (6.2% up to a wage base) plus Medicare (1.45% on all wages, plus 0.9% on high earners). State and local income tax sit on top of the federal layer. The UK system uses one tax-free Personal Allowance (£12,570) followed by a 3-band income-tax schedule (20%/40%/45%) plus Class-1 employee National Insurance (8% / 2%). UK includes everything in one PAYE deduction; the US splits it into multiple line items on a W-2."
  - q: "Why doesn't the US calculator include state income tax?"
    a: "Forty-three states have their own income tax with their own brackets, deductions, and credits — California, New York, and Hawaii alone have 9+ brackets each. Modeling all of them in a single calculator would obscure the federal math without adding much accuracy, and the rates change each January. The result here is your federal take-home; subtract your state's effective rate from the breakdown if you need state-specific math. States with no income tax (FL, TX, WA, NV, TN, SD, WY, NH, AK) need no adjustment."
  - q: "Why does the UK Personal Allowance disappear at high incomes?"
    a: "The Personal Allowance tapers off at £1 for every £2 of gross income above £100,000, fully phased out at £125,140. This creates an effective marginal rate of about 60% in that band — you pay 40% income tax on the next £1, plus you lose 50p of allowance which adds another 40p of tax. The calculator handles this correctly: at £110,000 your PA shows £7,570 (£12,570 minus £5,000)."
  - q: "Which UK tax year does the calculator use?"
    a: "2025/26, running 6 April 2025 to 5 April 2026. Personal Allowance £12,570, basic rate 20% on £37,700 of taxable income, higher rate 40%, additional rate 45% above £125,140. Class-1 employee NI is 8% between the Primary Threshold and the Upper Earnings Limit, then 2% above. Scotland uses a different 6-band income-tax structure not modeled here."
  - q: "What is FICA exactly?"
    a: "FICA (Federal Insurance Contributions Act) is the umbrella term for two payroll taxes that fund Social Security and Medicare. Social Security is 6.2% on wages up to the annual wage base ($176,100 in 2025), then 0% above. Medicare is 1.45% on all wages with no cap, plus an Additional Medicare Tax of 0.9% on wages above $200,000 single / $250,000 married filing jointly / $125,000 married filing separately. Employers match the SS and base Medicare portions but not the Additional Medicare — that one is employee-only."
  - q: "What is the Personal Allowance taper and when does it apply?"
    a: "Above £100,000 of adjusted net income, the £12,570 Personal Allowance reduces by £1 for every £2 of additional income. By £125,140 the allowance is gone completely. The effective marginal rate in this £25,140 band is around 60%, which is why salary-sacrifice pension contributions and other PA-recovery strategies are common at this income level."
relatedTools:
  - vat-calculator
  - hourly-to-annual
  - interest-calculator
category: finance
contentVersion: 2
datePublished: '2026-04-26'
dateModified: '2026-04-27'

---

## What This Tool Does

The calculator is two systems behind one URL. The region toggle at the top of the page picks which one is active and remembers your choice for the next visit.

- **United States** — federal income tax across all four IRS filing statuses (Single, MFJ, HoH, MFS) plus the full FICA stack (Social Security, Medicare, Additional Medicare). Standard deduction is auto-applied per filing status. State, city, and local income tax are not included — they vary too widely to model in one calculator.
- **United Kingdom** — income tax across the three official bands (basic 20%, higher 40%, additional 45%) with the £12,570 Personal Allowance, the £100,000–£125,140 PA taper, and Class-1 employee National Insurance at the Spring 2024 rates (8% PT-to-UEL, 2% above UEL).

Both regions display the same outputs: take-home (annual and monthly), the effective tax rate, and a full line-by-line breakdown.

## How Does the Math Work?

### United States (2025 tax year)

1. Subtract the standard deduction from gross to get taxable income.
2. Apply the 7-band federal income-tax schedule (10/12/22/24/32/35/37%) marginally on the taxable income — each slice taxed at its own rate.
3. Add Social Security: 6.2% on gross up to $176,100, then 0%.
4. Add Medicare: 1.45% on all gross.
5. Add Additional Medicare: 0.9% on gross above the filing-status threshold ($200,000 single, $250,000 MFJ, $125,000 MFS).
6. Subtract the sum from gross — that's your annual take-home. Divide by 12 for monthly.

The marginal-bracket display shows the highest rate that any of your income hits — useful for understanding what an extra $1,000 of salary would cost in tax.

### United Kingdom (2025/26 tax year)

1. Compute your effective Personal Allowance: full £12,570 if gross ≤ £100,000, taper to £0 between £100,000 and £125,140.
2. Subtract PA from gross to get taxable income.
3. Apply income tax: 20% on the first £37,700 of taxable, 40% from there to the additional-rate threshold, 45% above £125,140 of gross.
4. Compute Class-1 employee NI: 0% below £12,570, 8% between £12,570 and £50,270, 2% above £50,270.
5. Subtract income tax + NI from gross — that's your annual take-home.

## Which Filing Status Should You Pick (US)?

- **Single** — unmarried, not head of a household, no qualifying dependents. The default for most W-2 earners.
- **Married filing jointly (MFJ)** — combined return for spouses. Bracket thresholds and standard deduction are roughly double the single values, but the deduction-to-bracket ratio is the same so it's not always advantageous.
- **Head of household (HoH)** — unmarried with a qualifying dependent. Wider brackets than single but tighter than MFJ. Standard deduction is $22,500 (2025).
- **Married filing separately (MFS)** — same brackets as single but the additional-Medicare threshold is half ($125,000 instead of $200,000). Rarely beneficial except for specific tax-strategy reasons.

## What Are the 2025 US Federal Brackets?

For taxable income (gross minus standard deduction), single filer:

| Bracket | Rate | Income range |
| ------- | ---- | ------------ |
| 1 | 10% | $0 – $11,925 |
| 2 | 12% | $11,925 – $48,475 |
| 3 | 22% | $48,475 – $103,350 |
| 4 | 24% | $103,350 – $197,300 |
| 5 | 32% | $197,300 – $250,525 |
| 6 | 35% | $250,525 – $626,350 |
| 7 | 37% | $626,350+ |

Married-filing-jointly thresholds are roughly double, head-of-household sits between single and MFJ.

## What Are the 2025/26 UK Bands?

For taxable income (gross minus Personal Allowance), England/Wales/N.Ireland:

| Band | Rate | Taxable range | Gross equivalent |
| ---- | ---- | ------------- | ---------------- |
| Basic | 20% | £0 – £37,700 | £12,570 – £50,270 |
| Higher | 40% | £37,700 – £112,570 | £50,270 – £125,140 |
| Additional | 45% | £112,570+ | £125,140+ |

Scottish income tax uses a 6-band structure (19/20/21/42/45/48%) — that's a separate calculator and out of scope here.

## Where Do the Rates Come From and What About Privacy?

US numbers come from IRS Revenue Procedure 2024-40 (annual brackets) and the Social Security Administration's 2025 wage-base announcement. UK numbers come from HMRC's published rates for the 2025/26 tax year, including the Spring 2024 NI cuts (12% → 10% → 8%).

The calculator runs entirely client-side. Your salary, filing status, and region pick never leave your browser — no analytics, no signup, no server. The region you choose (US or UK) is the only thing stored, and it's stored only in your own browser's `localStorage` so you don't have to pick again next visit.

## Frequently Asked Questions

**Does this include 401(k), IRA, or pension contributions?**
No. Pre-tax retirement contributions reduce taxable income but not Social Security / Medicare wages, and they vary by employer plan. Subtract your annual 401(k) contribution from gross before entering it if you want to model their effect on federal income tax — but be aware that the FICA line items will be slightly understated.

**Does this include health-insurance premiums or HSA contributions?**
Not directly. Section-125 cafeteria-plan deductions (employer-paid health, HSA, FSA) reduce both federal taxable income and FICA wages. If you want to model them precisely, subtract your annual cafeteria deduction from gross before entering it — the calculator will then represent your post-cafeteria position.

**Why does my actual paycheck stub differ from this number?**
Several common reasons: state and local income tax (US), pre-tax deductions (401(k), HSA, premiums), post-tax deductions (Roth 401(k), garnishments), itemized vs standard deduction, marriage-bracket interactions, and rounding differences in the IRS withholding tables (Pub 15-T) versus the marginal-rate calculation we run here. This tool gives you the *math* of federal tax — actual paycheck withholding is an estimate that trues up at year-end.

**Are the 2025 brackets adjusted for inflation?**
Yes. The IRS publishes annual bracket-threshold adjustments tied to chained CPI-U. The 2025 figures here reflect Rev. Proc. 2024-40, published October 2024. Each January the IRS releases the next year's set; we update this tool when they do.

## Which Related Tools Pair Well With This One?

If you're working through compensation math, you might also need an [hourly-to-annual converter](/en/hourly-to-annual-salary), a [VAT/sales-tax calculator](/en/vat-calculator) for after-tax pricing, or an [interest calculator](/en/interest-calculator) for savings or loan totals.
