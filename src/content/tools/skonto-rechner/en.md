---
toolId: cash-discount-calculator
language: en
title: "Cash Discount Calculator — Early Payment"
headingHtml: "Calculate Your <em>Early Payment Discount</em>"
metaDescription: "Calculate cash discounts on invoices using standard US payment terms like 2/10 net 30. Find annualized cost of skipping the discount. Free tool."
tagline: "Enter invoice amount, discount rate, and payment window to compute savings — plus the annualized cost of skipping the discount, so you know what delaying payment really costs."
intro: "Early payment discounts — called cash discounts or prompt payment discounts in US B2B — are one of the most underanalyzed line items in corporate finance. A vendor offering '2/10 net 30' is effectively lending you money at an annualized rate of about 36%. This tool makes that math immediate: enter the invoice amount and terms, see your savings and the true annual cost of not paying early."
howToUse:
  - "Enter the invoice amount in US dollars."
  - "Enter the discount percentage (e.g., 2 for a 2% discount)."
  - "Enter the discount period in days (e.g., 10 for '2/10 net 30')."
  - "Enter the net payment period in days (e.g., 30 for 'net 30')."
  - "Read off your dollar savings if you pay early, and the annualized interest rate you avoid by taking the discount."
faq:
  - q: "What does '2/10 net 30' mean?"
    a: "'2/10 net 30' is standard US payment shorthand: take a 2% discount if you pay within 10 days; otherwise, the full invoice is due within 30 days. The 20-day difference between the discount window and the net period is the basis for calculating the annualized cost."
  - q: "How do I calculate the annualized cost of not taking a cash discount?"
    a: "The formula is: Annualized cost = (Discount% ÷ (1 − Discount%)) × (365 ÷ (Net days − Discount days)). For 2/10 net 30: (0.02 ÷ 0.98) × (365 ÷ 20) ≈ 37.2%. Skipping the discount costs the same as borrowing at 37% per year."
  - q: "Is it always worth taking the early payment discount?"
    a: "Generally yes, if you have the cash available. The annualized cost of skipping is almost always higher than your cost of capital or business credit line rate. Exceptions: if your cash is deployed in an investment earning more than the annualized discount cost, or if you're managing cash flow through a tight period."
  - q: "Do large US retailers offer cash discounts to suppliers?"
    a: "Yes, but they often invert it: large retailers like Walmart use dynamic discounting or supply chain finance programs where they offer suppliers early payment (at a fee to the supplier) rather than waiting net 60–90 days. The math uses the same underlying formula."
  - q: "What is the difference between a cash discount and a trade discount?"
    a: "A trade discount is a reduction from the list price given based on the buyer's position in the supply chain (e.g., wholesaler gets 30% off list). A cash discount is a reduction for prompt payment. Both may appear on the same invoice."
relatedTools:
  - discount-calculator
  - vat-calculator
  - interest-calculator
category: finance
contentVersion: 1
datePublished: '2026-04-26'
dateModified: '2026-04-26'

---

## What This Tool Does

The Cash Discount Calculator computes two numbers from a standard early payment offer: (1) the dollar savings from paying early, and (2) the annualized interest rate you are effectively paying by declining the discount. That second number is the critical insight — it reframes the decision from "should I save a few percent?" to "am I borrowing at 37% per year?"

## How It Works

**Dollar savings:**

Savings = Invoice Amount × (Discount% ÷ 100)

**Annualized cost of skipping the discount (implicit interest rate):**

Rate = (Discount% ÷ (100 − Discount%)) × (365 ÷ (Net days − Discount days)) × 100

**Standard US payment terms and their annualized costs:**

| Terms | Discount | Window | Annualized Cost |
|---|---|---|---|
| 1/10 net 30 | 1% | 20 days | 18.4% |
| 2/10 net 30 | 2% | 20 days | 37.2% |
| 2/10 net 60 | 2% | 50 days | 14.9% |
| 3/10 net 30 | 3% | 20 days | 56.4% |
| 2/15 net 45 | 2% | 30 days | 24.8% |

## What Are Common Use Cases?

**Accounts payable optimization** — US companies with strong cash positions routinely review outstanding invoices for early payment discount opportunities. A company paying $5,000,000 in annual invoices under 2/10 net 30 terms could save $100,000 by consistently paying within the discount window.

**Small business cash flow decisions** — A small manufacturing firm receiving a $50,000 invoice with 2/10 net 30 terms: pay $49,000 within 10 days or $50,000 by day 30. The $1,000 savings over 20 days = 37.2% annualized. If the business line of credit charges 8%, it's worth borrowing to pay early.

**Evaluating vendor terms in RFPs** — Procurement teams negotiating with multiple vendors compare not just price but payment terms. A vendor offering 1% net 10 vs. 2/10 net 30 may be more or less favorable depending on your cash cycle.

**Accounting software configuration** — QuickBooks, Xero, and FreshBooks all support early payment discount tracking. Calculate the correct discount parameters here before configuring your payment terms in the software.

**Treasury management** — Corporate treasury teams in the US use annualized discount costs as inputs to their dynamic cash deployment models. Any invoice with an implicit rate above the firm's cost of capital warrants early payment.

## Häufige Fragen?

**What is "net 30" and why is it a US default?**
Net 30 means the full invoice amount is due within 30 calendar days of the invoice date. It became the US B2B default in the mid-20th century and remains standard across manufacturing, distribution, and professional services. Europe more commonly uses net 60 or net 90, making cross-border AP/AR management more complex.

**Can I negotiate better early payment terms with my vendors?**
Yes. Vendors often prefer faster payment and may accept higher discount rates in exchange for reliable early payment. If you consistently pay within 10 days, you have leverage to negotiate a 2.5% or 3% discount rate instead of the standard 2%.

**How does dynamic discounting differ from standard cash discounts?**
Dynamic discounting platforms (like those offered by C2FO, Taulia, or Ariba) allow buyers to offer variable discount rates based on how many days early the payment is made — not just a fixed discount window. The formula is the same, but the rate scales continuously with the payment date.
