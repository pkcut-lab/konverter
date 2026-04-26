---
toolId: discount-calculator
language: en
title: "Discount Calculator — Price & Savings"
headingHtml: "Calculate Your <em>Discount</em> Instantly"
metaDescription: "Find your discounted price and total savings instantly. Enter any price and discount % — or reverse-calculate the % off from a sale price. Free."
tagline: "Enter an original price and a discount percentage to get the sale price and dollar savings — or work backwards from a sale price to find the percentage off."
intro: "Whether you're shopping Black Friday deals, applying a coupon code, or verifying a wholesale markdown, this tool gives you the exact discounted price and total savings with zero math. It also handles the reverse: paste in an original price and a sale price, and it tells you exactly what percentage off you're getting."
howToUse:
  - "Enter the original (full) price in the first field."
  - "Enter the discount percentage (e.g., 20 for 20% off)."
  - "Read off the discounted price and your dollar savings instantly."
  - "To reverse-calculate: enter the original price and the sale price — the tool returns the discount percentage."
faq:
  - q: "How do I calculate a discount percentage manually?"
    a: "Subtract the sale price from the original price, divide by the original price, then multiply by 100. Example: ($80 original − $60 sale) ÷ $80 × 100 = 25% off."
  - q: "Can I calculate the price after multiple discounts (stacked coupons)?"
    a: "Apply discounts sequentially. A 20% discount followed by an additional 10% discount is not 30% off — it's 28% off. Run the tool twice: first apply 20%, then apply 10% to that result."
  - q: "What's the difference between a 'percent off' and a 'dollar off' coupon?"
    a: "A percent-off coupon scales with the price — better on expensive items. A dollar-off coupon is a fixed reduction. For a $15 item, 20% off = $3 savings; a $5-off coupon saves more."
  - q: "How do retailers set discount percentages during Black Friday?"
    a: "Most US retailers work backwards from a target margin. They set a 'compare at' price and calculate what discount % reaches the promotional sale price while staying above cost."
  - q: "Is tax calculated on the original price or the discounted price?"
    a: "In the US, sales tax is generally applied to the final discounted price, not the original. Always verify with your state's tax rules, as some promotional items have different rules."
relatedTools:
  - vat-calculator
  - gross-to-net-calculator
  - roi-calculator
category: finance
contentVersion: 1
datePublished: '2026-04-26'
dateModified: '2026-04-26'

---

## What This Tool Does

The Discount Calculator takes two numbers — a price and a percentage — and instantly returns the discounted price and the dollar amount you save. It also runs in reverse: give it an original price and a sale price, and it computes the percentage off. No calculator app, no mental math, no rounding guesses.

## How It Works

The forward calculation uses the standard retail discount formula:

| Input | Formula | Result |
|---|---|---|
| Original price $P$, Discount % $D$ | Sale price = P × (1 − D/100) | Discounted price |
| Original price $P$, Discount % $D$ | Savings = P × (D/100) | Dollar savings |

The reverse calculation:

| Input | Formula | Result |
|---|---|---|
| Original $P$, Sale price $S$ | Discount % = (P − S) ÷ P × 100 | Percentage off |

All calculations happen in your browser. Nothing is sent to a server.

## What Are Common Use Cases?

**Black Friday & Cyber Monday shopping** — Retailers advertise "up to 70% off," but the actual savings vary by item. Paste in the price tag and the advertised sale price to verify you're actually getting the deal claimed.

**Coupon stacking at checkout** — Many US stores (Target, Kohls, Amazon) allow stacking a store coupon with a manufacturer coupon. Calculate each discount step in sequence to find your final out-of-pocket cost.

**Wholesale and B2B purchasing** — Distributors frequently quote net prices as "list minus 30%." Enter the list price and 30% to confirm the number before signing a purchase order.

**Student and military discounts** — Programs like UNiDAYS and GovX offer 10–15% off. Quickly verify whether a brand's discount is competitive before committing to a subscription.

**Price-matching requests** — US big-box stores (Best Buy, Walmart, Target) price-match competitors. Calculate what a competitor's discount works out to in dollars, then present the exact amount to customer service.

**Restaurant and app promo codes** — Food delivery apps (DoorDash, Uber Eats) frequently offer 20–30% off your first order or $15 off orders over $30. Check which deal type saves you more for your order size.

## Häufige Fragen?

**Why does stacking two 10% discounts not equal 20% off?**
Because each discount applies to the already-reduced price. First 10% off $100 = $90. Second 10% off $90 = $81. Total savings: $19, which is 19% — not 20%.

**What is a "markdown" vs. a "discount"?**
In US retail terminology, a markdown is a permanent price reduction (the item's new regular price is lower). A discount is a temporary reduction from the original price, often requiring a coupon or promotion code. Mathematically, the calculation is identical.

**How do I find the original price if I only know the sale price and the discount?**
Original price = Sale price ÷ (1 − Discount%/100). Example: A $75 item is "25% off." Original price = $75 ÷ 0.75 = $100. This tool handles that calculation automatically in reverse mode.
