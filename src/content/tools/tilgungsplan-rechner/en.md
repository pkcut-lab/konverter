---
toolId: amortization-calculator
language: en
title: "Amortization Calculator — Loan Payment Schedule"
headingHtml: "Full <em>Amortization Schedule</em> for Any Loan"
metaDescription: "Calculate your monthly payment and see the full amortization schedule — principal vs. interest for every period. Works for mortgages and auto loans."
tagline: "Enter your loan amount, interest rate, and term. Get your monthly payment and a complete period-by-period breakdown of principal and interest."
intro: "An amortization schedule shows exactly how each payment splits between reducing your loan balance (principal) and paying the lender's cost (interest). This calculator generates the full schedule for any fixed-rate loan — mortgage, auto, student, or personal — so you can see how much interest you'll pay over the life of the loan."
howToUse:
  - "Enter the loan amount (e.g., $400,000 for a home purchase)."
  - "Enter the annual interest rate (e.g., 6.75%)."
  - "Set the loan term in years (e.g., 30 for a standard mortgage)."
  - "Optionally enter a start date to see exact calendar payment dates."
  - "View the monthly payment amount and scroll through the full schedule."
faq:
  - q: "What is amortization?"
    a: "Amortization is the process of paying off a loan through regular fixed payments. Each payment covers the interest accrued since the last payment, with the remainder reducing the principal balance."
  - q: "Why is so much of my early mortgage payment interest?"
    a: "Because interest is calculated on the remaining balance. At the start, your balance is highest, so interest takes the largest share. As the balance drops, more of each payment goes to principal."
  - q: "What is the monthly payment on a $400,000 30-year mortgage at 6.75%?"
    a: "Approximately $2,594/month for principal and interest. Over 30 years, you'd pay about $534,000 in interest — more than the original loan amount."
  - q: "How does an extra monthly payment affect total interest paid?"
    a: "Extra principal payments reduce your balance faster, which reduces future interest charges. Even $100/month extra on a 30-year mortgage can save tens of thousands in interest and cut years off the term."
  - q: "What is the difference between a 15-year and 30-year mortgage?"
    a: "A 15-year loan has higher monthly payments but substantially lower total interest — typically 50–60% less. A 30-year loan has lower payments, giving more cash-flow flexibility at the cost of more interest paid over time."
  - q: "Does this include property taxes, insurance, or PMI?"
    a: "No — this calculator covers principal and interest (P&I) only. Your total monthly housing cost (PITI) also includes property taxes, homeowner's insurance, and potentially PMI if your down payment is under 20%."
relatedTools:
  - loan-calculator
  - compound-interest-calculator
  - interest-calculator
category: finance
contentVersion: 1
datePublished: '2026-04-26'
dateModified: '2026-04-26'

---

## What This Tool Does

This amortization calculator computes your fixed monthly payment and generates a complete schedule showing how each payment breaks down between principal and interest — for every period from the first payment to payoff.

## How It Works

For a fixed-rate loan, the monthly payment is calculated using the standard annuity formula:

**M = P × [r(1+r)^n] ÷ [(1+r)^n − 1]**

Where:
- **M** = monthly payment
- **P** = principal (loan amount)
- **r** = monthly interest rate (annual rate ÷ 12)
- **n** = total number of payments (years × 12)

Each row in the schedule then calculates:

| Column | Formula |
|---|---|
| Interest payment | Remaining balance × monthly rate |
| Principal payment | Monthly payment − interest payment |
| Remaining balance | Previous balance − principal payment |

## What Are Common Use Cases?

**30-Year Fixed Mortgage.** The most common US home loan. A $350,000 loan at 7.00% has a monthly P&I payment of $2,329. Over 360 payments, total interest paid is approximately $488,000 — nearly 1.4× the original loan.

**15-Year Fixed Mortgage.** Higher monthly payment ($3,145 at 6.50% on the same $350,000) but total interest of roughly $216,000 — a savings of over $270,000 compared to the 30-year at higher rate.

**Auto Loan.** A $35,000 car loan at 7.50% over 60 months yields a $700/month payment and $7,000 in total interest. Use the schedule to see your exact payoff balance at any point — useful if you plan to sell or trade in early.

**Student Loan Repayment Planning.** Federal student loan standard repayment is 10 years. On $50,000 at 6.54% (graduate Stafford rate, 2024), the monthly payment is $566 and total interest is $17,920.

**Extra Payment Analysis.** By adding an extra principal payment each period, you shorten the schedule. The tool recalculates the remaining balance row-by-row so you can see exactly which month the loan pays off.

## How Do You Read the Amortization Schedule?

| Period | Payment | Interest | Principal | Balance |
|---|---|---|---|---|
| 1 | $2,594 | $2,250 | $344 | $399,656 |
| 12 | $2,594 | $2,248 | $346 | $395,815 |
| 120 | $2,594 | $2,205 | $389 | $362,831 |
| 240 | $2,594 | $2,049 | $545 | $336,555 |
| 360 | $2,594 | $14 | $2,580 | $0 |

*Example: $400,000 loan, 6.75% annual rate, 30-year term.*

Notice how the interest column declines gradually while the principal column grows — the crossover point where principal exceeds interest occurs around payment 252 (month 21 of year 21) for this example.

## Häufige Fragen?

**Can I use this for adjustable-rate mortgages (ARMs)?**
This tool calculates fixed-rate schedules. For ARMs, the rate resets periodically — run separate calculations for each rate period and manually chain the results, using the end balance of one period as the principal for the next.

**What is a balloon payment loan?**
A balloon loan has lower regular payments followed by one large final payment. This calculator assumes full amortization (balance reaches zero at the last regular payment). Balloon loans require a different calculation.

**How accurate is the schedule?**
Results match standard US lending calculations within a few cents per period due to rounding conventions. Lenders may round differently on individual statements, but total interest figures will be very close.
