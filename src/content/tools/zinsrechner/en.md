---
toolId: interest-calculator
language: en
title: "Simple Interest Calculator — Loans & Savings"
headingHtml: "Simple Interest Calculator — <em>Fast Loan & Savings Math</em>"
metaDescription: "Calculate simple interest instantly. Formula: I = P × r × t. For car loans, personal loans, and savings. Compare simple vs compound interest."
tagline: "Enter principal, rate, and time to calculate simple interest and total payback amount. Ideal for car loans, personal loans, and short-term savings. Includes a simple vs compound interest comparison."
intro: "Simple interest is the most straightforward form of interest calculation: interest is charged only on the original principal, not on accumulated interest. It is used for many US car loans, personal loans, and some short-term savings products. The formula is I = P × r × t — principal times rate times time. Enter your values here to calculate interest owed, total repayment amount, and daily interest accrual."
howToUse:
  - "Enter the principal — the original loan amount or deposit."
  - "Enter the annual interest rate as a percentage (e.g., 6.5 for 6.5%)."
  - "Enter the loan or deposit term in years (or switch to months for shorter terms)."
  - "The results panel shows total interest, total amount owed or earned, and daily interest accrual."
  - "Click 'Compare with Compound Interest' to see the difference between simple and compound calculation for the same inputs."
faq:
  - q: "What is the simple interest formula?"
    a: "Simple interest is calculated with I = P × r × t, where I is the interest amount, P is the principal (starting balance), r is the annual interest rate as a decimal (e.g., 6% = 0.06), and t is the time in years. The total amount owed or earned is A = P + I = P(1 + rt)."
  - q: "Are US car loans simple interest?"
    a: "Most US auto loans use simple interest, calculated daily on the outstanding balance. Because interest accrues daily, paying early or making extra payments reduces the total interest paid — every dollar of principal reduction immediately reduces future daily interest. The 2024–2025 average new car loan rate in the US is approximately 6–8% APR depending on credit score and loan term."
  - q: "What is the typical personal loan interest rate in the US?"
    a: "Personal loan rates in the US range from approximately 7% APR (excellent credit, top online lenders) to 36% APR (fair credit). The average in 2024 was approximately 12–15% APR. Credit unions often offer lower rates than banks or online lenders. Personal loans typically use simple interest amortized over 2–7 years."
  - q: "How is simple interest different from compound interest?"
    a: "With simple interest, interest is always calculated only on the original principal. With compound interest, interest is added to the balance periodically, and the next period's interest is calculated on the new (higher) balance. For the same principal, rate, and term, compound interest always produces more interest — beneficial for savings, detrimental for loans. The difference becomes significant over periods longer than 2–3 years."
  - q: "What is daily interest accrual?"
    a: "On simple-interest loans, interest accrues every day based on the current principal balance divided by 365 (or 360, depending on the lender's day-count convention). Daily interest = (principal × annual rate) ÷ 365. For a $20,000 auto loan at 7% APR, daily interest = ($20,000 × 0.07) ÷ 365 = $3.84 per day."
  - q: "Does simple interest apply to credit cards?"
    a: "No. Credit cards use compound interest, typically compounded daily. The daily periodic rate is the APR divided by 365, and interest is added to the balance daily. This is why credit card balances grow so quickly when only minimum payments are made — unlike a simple-interest loan where paying early reduces total cost proportionally."
relatedTools:
  - compound-interest-calculator
  - loan-calculator
  - vat-calculator
category: finance
contentVersion: 1
---

## What This Tool Does

This simple interest calculator computes interest and total payback amounts using the formula I = P × r × t. It handles loans (showing total interest owed and payback amount) and savings (showing interest earned and final balance). A comparison panel shows the difference between simple and compound interest for the same inputs — helping you understand why lenders favor one and borrowers should know both.

## How It Works

The arithmetic is direct:

- **Interest earned or owed:** `I = P × r × t`
- **Total amount:** `A = P + I = P × (1 + r × t)`
- **Daily interest:** `daily = (P × r) ÷ 365`

Where:
- P = Principal (original amount)
- r = Annual interest rate as a decimal (divide the percentage by 100)
- t = Time in years

For a 6-month term, use t = 0.5. For 90 days, use t = 90/365 = 0.2466. The tool accepts months or days directly and converts internally.

## Simple vs Compound Interest Comparison

Example: $15,000 principal at 7% for 5 years.

| Method | Total Interest | Final Amount |
|--------|---------------|--------------|
| Simple interest | $5,250.00 | $20,250.00 |
| Annually compounded | $6,053.73 | $21,053.73 |
| Monthly compounded | $6,188.93 | $21,188.93 |

Over 5 years, the difference between simple and monthly compound interest is $938.93 on a $15,000 loan — significant enough to factor into loan comparisons.

## Common Use Cases

**Auto loan cost estimation.** Most US car loans (bank, credit union, and dealership financing) use simple interest. Knowing the total interest cost before signing helps you compare financing options. A $30,000 auto loan at 7% for 5 years costs $5,250 in total interest. The same loan at 9% costs $6,750 — a $1,500 difference worth negotiating over.

**Personal loan comparison.** Online lenders (SoFi, LightStream, Marcus), credit unions, and banks all offer personal loans with different APRs. Use this calculator to compute the total cost of each offer in dollars, not just percentages — a 3-point rate difference on a $10,000 3-year loan translates to approximately $450 in total interest.

**Short-term savings instruments.** Some money market accounts and short-term Treasury bills use simple interest for their stated yields. Entering the current rate and your deposit amount shows the exact dollar return at maturity without guessing.

**Understanding daily interest accrual on auto loans.** Because US auto loans accrue interest daily, the timing of your payment within the month affects total interest paid. Paying a week early every month saves a modest but real amount over a 5-year loan term. This calculator's daily interest output makes that math concrete.

**Comparing simple interest offers against APY savings accounts.** If a lender quotes a simple interest rate and a bank quotes a savings account APY (which assumes compounding), they are not directly comparable. This tool calculates simple interest total returns, which you can compare against the compounded APY output from the compound interest calculator.

**Student loan interest estimation.** Federal student loans use simple interest that accrues daily. During a deferment or forbearance period, unpaid interest may capitalize (be added to the principal) — converting into compound interest after that point. Understanding daily accrual on a deferred loan helps borrowers decide whether to make interest-only payments during school to prevent capitalization.

## FAQ

**What is the difference between APR and interest rate?**
The interest rate is the cost of borrowing expressed as a percentage. APR (Annual Percentage Rate) includes the interest rate plus other costs — origination fees, closing costs, mandatory insurance — expressed as a single annual percentage. For simple comparison, APR is more complete. This calculator uses the interest rate only; to account for fees, add them to the principal or subtract them from the loan proceeds.

**What is the US federal student loan interest rate?**
For undergraduate Direct Subsidized and Unsubsidized Loans in the 2024–2025 school year, the rate is 6.53% APR (fixed for the life of the loan). Graduate Direct Unsubsidized Loans are at 8.08%. Interest accrues daily using simple interest at these rates. Unsubsidized loans accrue interest during school; subsidized loans are interest-free during enrollment.

**How do I calculate interest for less than one year?**
Use the fraction of the year: 6 months = t × 0.5, 3 months = t × 0.25, 90 days = t × (90/365). For example, $5,000 at 5% for 6 months: I = 5,000 × 0.05 × 0.5 = $125. Many CDs and Treasury bills use this approach to calculate interest for terms shorter than a year.

**Why do some lenders use 360 days instead of 365?**
The 360-day convention (also called the "banker's rule" or "30/360") simplifies monthly calculations by assuming each month has exactly 30 days. It slightly increases the effective interest rate compared to 365/actual. Mortgages, bonds, and some commercial loans use 360-day conventions. Consumer auto loans and most retail loans use 365/actual. The tool uses 365 by default, matching consumer loan practice.
