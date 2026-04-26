---
toolId: gross-net-calculator
language: en
title: "Gross to Net Salary Calculator (US)"
headingHtml: "Gross to <em>Net</em> Salary Calculator"
metaDescription: "Calculate your US take-home pay from gross salary. Accounts for federal income tax, FICA (Social Security & Medicare), and optional state tax. Free and private."
tagline: "Enter your annual or hourly gross pay and instantly see your estimated take-home pay after federal taxes, Social Security, Medicare, and state income tax."
intro: "This calculator estimates your net (take-home) pay from a gross salary or hourly wage. It applies 2024 US federal income tax brackets, FICA payroll taxes, and optional state income tax. All calculations happen in your browser — no data is stored or transmitted."
howToUse:
  - "Enter your gross annual salary, or switch to hourly mode and enter your hourly rate plus weekly hours."
  - "Select your federal filing status: Single, Married Filing Jointly, Married Filing Separately, or Head of Household."
  - "Enter your state (or select 'No state income tax') to apply the correct state tax rate."
  - "Optionally add pre-tax deductions such as 401(k) contributions or health insurance premiums."
  - "View the results breakdown: federal tax, FICA, state tax, deductions, and final take-home pay — monthly and annual."
faq:
  - q: "What is the difference between gross pay and net pay?"
    a: "Gross pay is your salary before any taxes or deductions. Net pay — commonly called take-home pay — is what actually lands in your bank account after federal income tax, Social Security (6.2%), Medicare (1.45%), and any applicable state taxes are withheld."
  - q: "Does this calculator include state income tax?"
    a: "Yes. Select your state from the dropdown to apply a simplified state income tax estimate. Note that state tax calculations are simplified — they use a representative marginal rate rather than the full state bracket schedule. For precise state tax liability, consult your state's official tax agency or a CPA."
  - q: "What is FICA and how much is it?"
    a: "FICA stands for Federal Insurance Contributions Act. It consists of Social Security tax (6.2% on wages up to $168,600 in 2024) and Medicare tax (1.45% with no wage cap). Your employer matches these amounts, but those amounts don't come out of your paycheck."
  - q: "Are health insurance and 401(k) included?"
    a: "You can enter pre-tax deductions manually. Common pre-tax items include 401(k) and 403(b) contributions, traditional IRA contributions via payroll, health insurance premiums (employer-sponsored), HSA contributions, and FSA contributions. These reduce your taxable federal income."
  - q: "Does this calculator cover self-employed income?"
    a: "No. Self-employed individuals pay both the employee and employer halves of FICA (total 15.3% self-employment tax), and the calculation method differs significantly. Use a dedicated self-employment tax calculator for freelance or 1099 income."
  - q: "How accurate is this estimate?"
    a: "This tool provides a reasonable estimate for W-2 employees with straightforward tax situations. It does not account for itemized deductions beyond the standard deduction, investment income, the additional 0.9% Medicare surtax on high earners, or tax credits. For tax planning purposes, consult a CPA or use the IRS Tax Withholding Estimator."
relatedTools:
  - hourly-to-annual-salary
  - vat-calculator
  - interest-calculator
category: finance
stats:
  - label: "Tax classes"
    value: "6"
  - label: "Federal states"
    value: "16"
  - label: "Precision"
    value: "±0.01"
    unit: "EUR"
contentVersion: 1
datePublished: '2026-04-26'
dateModified: '2026-04-26'

---

## What This Tool Does

The Gross-to-Net Salary Calculator shows how much of your paycheck you actually keep after US payroll taxes and deductions. It handles the most common W-2 employee scenario: a regular salary or hourly wage with federal income tax withholding, FICA payroll taxes, and state income tax.

The results display as an annual and monthly breakdown, making it easy to compare job offers, plan a budget, or understand why your paycheck doesn't match your quoted salary.

## How Does It Work?

The calculation follows standard US payroll withholding rules for 2024:

```
Step 1: Gross Annual Salary (or Hourly Rate × Hours/Week × 52)

Step 2: Pre-tax Deductions
  Adjusted Gross = Gross − 401(k) − Health Insurance − HSA − other pre-tax

Step 3: Federal Taxable Income
  Taxable Income = Adjusted Gross − Standard Deduction
    Standard Deduction 2024:
      Single / MFS         → $14,600
      Married Filing Joint → $29,200
      Head of Household    → $21,900

Step 4: Federal Income Tax (marginal brackets 2024, Single example)
  10%  on $0 – $11,600
  12%  on $11,601 – $47,150
  22%  on $47,151 – $100,525
  24%  on $100,526 – $191,950
  32%  on $191,951 – $243,725
  35%  on $243,726 – $609,350
  37%  on $609,351+

Step 5: FICA Taxes (applied to gross wages)
  Social Security: 6.2% × min(Gross, $168,600)
  Medicare:        1.45% × Gross
  (Additional Medicare 0.9% on Gross > $200,000 — not included)

Step 6: State Income Tax (simplified representative rate)

Step 7: Net Pay = Gross − Federal Tax − FICA − State Tax − Pre-tax Deductions
```

## What Are the 2024 Federal Tax Brackets?

| Tax Rate | Single | Married Filing Jointly |
|---|---|---|
| 10% | $0 – $11,600 | $0 – $23,200 |
| 12% | $11,601 – $47,150 | $23,201 – $94,300 |
| 22% | $47,151 – $100,525 | $94,301 – $201,050 |
| 24% | $100,526 – $191,950 | $201,051 – $383,900 |
| 32% | $191,951 – $243,725 | $383,901 – $487,450 |
| 35% | $243,726 – $609,350 | $487,451 – $731,200 |
| 37% | $609,351+ | $731,201+ |

## Which States Have No Income Tax?

Alaska, Florida, Nevada, New Hampshire (wages only), South Dakota, Tennessee (wages only), Texas, Washington (wages only), Wyoming.

## What Are Common Use Cases?

**Comparing job offers.** Two offers — $95,000 in Texas vs. $105,000 in California — look very different once state taxes are applied. Enter each scenario to compare net pay side by side.

**Budgeting a new hire.** HR professionals can estimate an employee's expected net pay to help them understand their offer letter and plan their personal finances.

**Evaluating a 401(k) contribution increase.** Increasing your 401(k) contribution from 6% to 10% reduces your taxable income. Use the calculator to see how much your paycheck actually decreases — usually much less than the full contribution amount because the tax savings partially offset it.

**Negotiating salary.** When negotiating, knowing your exact net figure for each gross salary level makes it easier to identify the minimum acceptable offer.

**Estimating quarterly estimated taxes.** If you have additional income (freelance work, rental income), knowing your W-2 net pay is the starting point for calculating whether you need to make quarterly estimated tax payments.

## Frequently Asked Questions

**What is the difference between gross pay and net pay?**
Gross pay is your full salary as agreed — the number on your offer letter. Net pay is what your employer actually deposits in your bank account. The difference is withheld for federal income tax, Social Security (6.2%), Medicare (1.45%), and any applicable state taxes. On a $75,000 salary in Texas (no state tax), a single filer might take home roughly $57,000–$59,000 depending on their deductions.

**Does this calculator include state income tax?**
Yes, using simplified representative rates by state. For example, California applies a 9.3% representative marginal rate, while Texas and Florida apply 0%. Full state tax accuracy requires running the state's complete bracket schedule, which varies by filing status and locality — for precise figures, use your state's official withholding calculator.

**What is FICA and how much is it?**
FICA (Federal Insurance Contributions Act) funds Social Security and Medicare. As an employee, you pay 6.2% of your wages to Social Security (capped at $168,600 in 2024) and 1.45% to Medicare (no cap). Your employer pays an equal match — so the total contribution is 15.3% of your wages, but only half comes from your paycheck.

**Are health insurance and 401(k) included?**
Enter these as pre-tax deductions. A $500/month health insurance premium reduces your federal taxable income by $6,000/year, which at the 22% bracket saves you about $1,320 in federal taxes. The calculator applies this reduction before computing federal income tax.

**Does this calculator cover self-employed income?**
No. Freelancers and sole proprietors on 1099 income pay self-employment tax of 15.3% (both halves of FICA) on net self-employment income, and the calculation is fundamentally different. Use a dedicated self-employment tax tool for 1099 scenarios.

**How accurate is this estimate?**
Accurate enough for budgeting and offer comparisons — typically within a few hundred dollars of your actual withholding. It does not model itemized deductions, tax credits (Child Tax Credit, Earned Income Credit), investment income, the 0.9% additional Medicare surtax, or alternative minimum tax. For tax planning or filing, consult a CPA.
