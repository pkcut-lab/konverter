---
toolId: vat-calculator
language: en
title: "Sales Tax & VAT Calculator — Add or Remove Tax"
headingHtml: "Add or remove <em>sales tax</em> from any price instantly"
metaDescription: "Calculate sales tax or VAT on any price. Add tax to a pre-tax amount or extract tax from a total. Covers all US state rates and international VAT. Free."
tagline: "Add tax to a net price or strip tax from a gross total. Covers US state sales tax and international VAT rates — instant, no signup."
intro: "Whether you're calculating what a price will cost after adding your state's sales tax, figuring out the pre-tax amount on a receipt, or working with international VAT rates, this calculator handles both directions instantly. Enter the price and the rate, and you get the tax amount plus the full total — or the net price if you're working backward from a tax-inclusive figure."
howToUse:
  - "Enter the price you're working with."
  - "Enter the tax rate as a percentage (e.g. 8.25 for 8.25%)."
  - "Choose the direction: 'Add tax' (price is pre-tax) or 'Remove tax' (price already includes tax)."
  - "Read the tax amount and the final price in the results panel."
faq:
  - q: "What is the difference between sales tax and VAT?"
    a: "US sales tax is collected only at the final point of sale and is not included in the listed price. VAT (Value Added Tax) is collected at each stage of production, included in displayed prices in most countries, and the consumer sees a VAT-inclusive sticker price. The math for extracting or adding either is the same."
  - q: "What are the highest and lowest US state sales tax rates?"
    a: "As of 2025, Louisiana has the highest combined state+local average rate at about 9.56%. Oregon, Montana, New Hampshire, Delaware, and Alaska have no statewide sales tax. California's state rate is 7.25%, but most jurisdictions add local taxes, commonly reaching 8.25%–10.25%."
  - q: "How do I calculate the pre-tax price from a total that includes tax?"
    a: "Divide the total by (1 + tax rate). Example: $108.25 total with 8.25% tax → $108.25 ÷ 1.0825 = $100.00 pre-tax. The tax amount is $8.25."
  - q: "Does the US have a federal sales tax?"
    a: "No. The US has no federal sales tax or VAT. Sales tax is set entirely at the state and local level, which is why rates vary widely across jurisdictions."
  - q: "What is the standard VAT rate in Europe?"
    a: "EU VAT rates vary by country. Common standard rates: Germany 19%, France 20%, UK 20% (not EU but same system), Spain 21%, Italy 22%. Most countries also have reduced rates (5%–10%) for food, medicine, and essential goods."
  - q: "Is sales tax included in online prices?"
    a: "In the US, online prices are typically shown without sales tax. Tax is added at checkout based on the shipping destination. Since the 2018 Supreme Court decision (South Dakota v. Wayfair), states can require out-of-state sellers to collect sales tax if they meet economic nexus thresholds."
relatedTools:
  - discount-calculator
  - gross-to-net-calculator
  - interest-calculator
category: finance
contentVersion: 1
datePublished: '2026-04-26'
dateModified: '2026-04-26'

---

## What This Tool Does

This calculator works in both directions for any sales tax or VAT scenario:

1. **Add tax:** Enter a pre-tax (net) price and a rate → get the tax amount and total (gross) price.
2. **Remove tax:** Enter a tax-inclusive (gross) price and the rate → extract the original pre-tax price and the tax component.

## What Are the Formulas?

### Adding Tax to a Net Price

**Tax Amount = Net Price × (Rate ÷ 100)**

**Total Price = Net Price + Tax Amount = Net Price × (1 + Rate ÷ 100)**

**Example:** $75.00 × 8.875% (New York City combined rate) = $6.66 tax → **$81.66 total**

### Removing Tax from a Gross Price

**Net Price = Gross Price ÷ (1 + Rate ÷ 100)**

**Tax Amount = Gross Price − Net Price**

**Example:** Receipt total is $54.99 in a state with 6.5% tax → $54.99 ÷ 1.065 = **$51.63 pre-tax**, tax = $3.36

## What Are US State Sales Tax Rates?

| State | State Rate | Notes |
|-------|-----------|-------|
| California | 7.25% | Base; many localities add up to 3% more |
| Texas | 6.25% | Local max total: 8.25% |
| New York | 4.0% | NYC total: 8.875% (state + city + Metro) |
| Florida | 6.0% | No income tax state |
| Illinois | 6.25% | Chicago total: 10.25% |
| Washington | 6.5% | No income tax; high sales tax |
| Oregon | 0% | No sales tax statewide |
| Montana | 0% | No sales tax statewide |
| Delaware | 0% | No sales tax; attracts retail tourism |

*Note: Combined rates (state + county + city) often differ significantly from state base rates. Always use the combined rate for your jurisdiction.*

## What Are Common Use Cases?

### Retail and E-Commerce Shopping

Before finalizing an online order, estimate the full cost including tax. A $299 item shipping to Seattle (10.1% combined rate) costs $329.20 total — knowing this before checkout prevents cart abandonment surprises.

### Small Business Invoicing

If you charge clients a flat amount inclusive of sales tax, use the remove-tax direction to separate the taxable revenue from the collected tax. Misreporting collected sales tax as revenue is a common bookkeeping error.

### Freelance and Services

Most US service businesses must collect sales tax on some services depending on state law. Use the add-tax direction when issuing invoices: calculate your fee, then add the applicable rate to show the tax line separately on the invoice.

### International VAT Recovery

European business travelers can sometimes claim a VAT refund on purchases made in the EU. Knowing the VAT component of receipts requires working backward from a VAT-inclusive price. Use the remove-tax direction with the relevant country's standard VAT rate.

### Accounting and Reconciliation

Bookkeepers routinely need to back out sales tax from bank deposit totals to reconcile POS reports. This calculator handles batch mental math for any rate.

## What Are the Differences Between US Sales Tax and VAT?

| Feature | US Sales Tax | EU/International VAT |
|---------|-------------|---------------------|
| Shown in listed price? | No — added at checkout | Yes — price tags are VAT-inclusive |
| Who collects? | Retailer at point of sale | Each business in the supply chain |
| Federal? | No — state and local only | Yes — national standard rate |
| Typical rate range | 0%–10.25% | 17%–27% |
| Reduced rates? | Some states exempt groceries/medicine | Common (5%–12% for food, medicine) |

## Frequently Asked Questions

**Why does my total seem higher than expected?**

Remember that county and city taxes stack on top of state rates. The statewide California rate is 7.25%, but San Francisco adds local taxes to reach a combined 8.625%. Always look up the combined rate for your specific city and county.

**Is there tax on tips at restaurants?**

In the US, sales tax applies to the pre-tip food and beverage total (the taxable sale), not the tip itself. Gratuity added to the bill after tax does not affect the tax calculation.

**What is the difference between tax-inclusive and tax-exclusive pricing?**

Tax-exclusive pricing shows the price without tax; tax is added separately (standard in the US). Tax-inclusive pricing (standard in the EU and Australia) includes the tax in the displayed price. These two systems require different formulas — this tool handles both.
