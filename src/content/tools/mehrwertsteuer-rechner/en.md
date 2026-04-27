---
toolId: vat-calculator
language: en
title: "Sales Tax & VAT Calculator — US States and UK VAT"
headingHtml: "Add or extract <em>sales tax</em> for any state or VAT rate"
metaDescription: "Free sales tax and VAT calculator. Pick your US state or UK VAT band, enter an amount, and get the tax owed plus the gross total — both directions, no signup."
tagline: "Pick your US state for the right state-level sales-tax rate, or switch to UK for the four official VAT bands. Add tax to a net price or extract tax from a tax-inclusive total."
intro: "This calculator covers the two cases that actually matter in practice: a US shopper or seller working out state sales tax on a purchase, and a UK shopper or business adding or removing VAT at one of the four HMRC bands. Pick your region with the toggle at the top of the tool, choose your state or VAT band, and the math runs instantly in your browser."
howToUse:
  - "Pick your region — United States or United Kingdom. The choice is remembered for the next visit."
  - "Enter the amount you're calculating against."
  - "US: pick your state from the dropdown. For city/county combined rates (e.g. NYC 8.875%) tick 'Custom rate' instead. UK: choose the VAT band — Standard 20%, Reduced 5%, Zero, or Exempt."
  - "Choose the direction: 'Add tax to net' (amount is pre-tax) or 'Extract tax from gross' (amount already includes tax)."
  - "Read the net amount, tax amount, and gross total in the results panel below."
faq:
  - q: "What is the difference between US sales tax and UK VAT?"
    a: "US sales tax is collected only at the point of sale and is not included in the listed price — you see the pre-tax sticker, then tax is added at checkout. UK VAT is collected at every stage of production and is normally included in the displayed retail price (\"VAT-inclusive\"). The arithmetic for adding or extracting either tax is identical, but in the US you usually start from a pre-tax price, and in the UK you usually start from a gross price."
  - q: "Which US states have no state-level sales tax?"
    a: "Five states have no statewide sales tax: Alaska, Delaware, Montana, New Hampshire, and Oregon. In Alaska, local jurisdictions can still levy their own sales tax, so the effective rate is rarely zero in practice. The other four are genuinely tax-free at the state and (mostly) local level for general retail."
  - q: "What is the highest US state sales-tax rate?"
    a: "California has the highest state-level rate at 7.25%. Once city and county sales tax stack on top, several California jurisdictions exceed 10% combined. Tennessee, Mississippi, Indiana, and Rhode Island all sit at the second-tier 7%. Louisiana's combined state-plus-local average is the highest in the country at around 9.5%."
  - q: "Why does the calculator show only state-level rates by default?"
    a: "There are over 13,000 US sales-tax jurisdictions when you include cities, counties, and special districts — and they change quarterly. Maintaining a full ZIP-code-resolved matrix would require a paid tax-rate API. State-level rates are stable, official, and adequate for most calculations; for combined rates use the 'Custom rate' field with the value from your local revenue department."
  - q: "How do I calculate the pre-tax amount from a tax-inclusive total?"
    a: "Divide the gross by (1 + rate as a decimal). Example: a UK gross price of £120 at 20% VAT → £120 ÷ 1.20 = £100 net, with £20 VAT. Choose the 'Extract tax from gross' mode in the calculator and the math runs both ways automatically."
  - q: "What are the four UK VAT bands?"
    a: "Standard rate (20%) covers most goods and services. Reduced rate (5%) applies to domestic energy, mobility aids for the elderly, child car seats, and a small list of other items. Zero rate (0%) covers most food, books and newspapers, children's clothing, and exports outside the UK. Exempt items (insurance, postage stamps, health services, education) are not VAT-able at all — VAT-registered businesses cannot reclaim input VAT on them."
relatedTools:
  - discount-calculator
  - gross-to-net-calculator
  - interest-calculator
category: finance
contentVersion: 2
datePublished: '2026-04-26'
dateModified: '2026-04-27'

---

## What This Tool Does

The tool runs as two calculators behind one URL — the region toggle at the top of the page picks which one is active, and your choice is remembered for next time.

- **United States** (default for `en-US` browsers) — a 50-state plus DC dropdown with each state's official sales-tax rate. Five states have no state-level sales tax: Alaska, Delaware, Montana, New Hampshire, and Oregon. For city- or county-combined rates (NYC 8.875%, LA 9.5%, Chicago 10.25%), tick "Custom rate" and type the combined value.
- **United Kingdom** (default for `en-GB` browsers) — the four official HMRC bands as radio buttons: Standard 20%, Reduced 5%, Zero 0%, and Exempt. Each band shows a short example list so you know which one applies.

Both regions support the same two calculation directions: adding tax to a net (pre-tax) amount, or extracting tax from a gross (tax-inclusive) total.

## How Does the Calculation Work?

### Adding Tax to a Net Price

The amount you enter is the *pre-tax* amount.

```
tax     = net × rate
gross   = net + tax = net × (1 + rate)
```

Example: $200 net at California's 7.25% state rate → tax $14.50, gross $214.50. £100 net at UK Standard VAT 20% → VAT £20, gross £120.

### Extracting Tax from a Gross Total

The amount you enter is the *tax-inclusive* total.

```
net     = gross ÷ (1 + rate)
tax     = gross − net
```

Example: $214.50 gross at 7.25% → net $200, tax $14.50. £120 gross at 20% VAT → net £100, VAT £20.

The calculator rounds to two decimals at each step using commercial rounding (half-up), which matches what you'd see on a printed receipt.

## When Do You Need Each Mode?

**Add mode** is what US shoppers use most: the price tag is pre-tax, you want to know the after-tax total. It's also what businesses do when invoicing a B2C customer in the US.

**Extract mode** is what UK shoppers use most: the price tag already includes VAT, you want to know what portion was VAT — typically because you're claiming an expense, doing bookkeeping, or comparing the net price across vendors.

It's also what US sellers do when reconciling tax-inclusive totals from a point-of-sale system that prints a single line.

## What Are the Common US State Sales-Tax Rates in 2026?

These are state-level rates only. Cities, counties, and special districts add their own rates on top — for combined rates use the "Custom rate" field.

- **0%** — Alaska, Delaware, Montana, New Hampshire, Oregon
- **2.9%** — Colorado (lowest non-zero state-level rate)
- **4.0%** — Alabama, Georgia, Hawaii (general excise tax), New York, Wyoming
- **6.0%** — Florida, Idaho, Iowa, Kentucky, Maryland, Michigan, Pennsylvania, South Carolina, Vermont, West Virginia, DC
- **6.25%** — Illinois, Massachusetts, Texas
- **6.5%** — Arkansas, Kansas, Washington
- **7.0%** — Indiana, Mississippi, Rhode Island, Tennessee
- **7.25%** — California (highest state-level rate)

Once you add city and county rates, several California, Tennessee, and Louisiana jurisdictions push past 10% combined.

## What Are the UK VAT Bands in 2026?

The standard VAT rate has been 20% since January 2011. The reduced rate of 5% has applied to domestic energy since 1997. The zero-rate on most food and children's clothing predates VAT itself, having survived from the older Purchase Tax.

| Band | Rate | Common examples |
| ---- | ---- | --------------- |
| Standard | 20% | Most goods and services |
| Reduced | 5% | Domestic energy, child car seats, mobility aids for the elderly |
| Zero | 0% | Most food, books and newspapers, children's clothing, exports outside the UK |
| Exempt | — | Insurance, postage stamps, health services, education |

Zero-rated and exempt look identical from a customer's point of view (no VAT on the receipt), but they differ for the seller: a zero-rated supply lets the business reclaim input VAT, an exempt supply does not.

## Where Do the Rates Come From and What About Privacy?

The calculator runs entirely in your browser — your amounts, state choices, and VAT-band picks never leave your device. There's no analytics fingerprint and no signup. The region you pick (US or UK) is stored only in your own browser's `localStorage` so you don't have to pick again next visit.

US rates were verified against state revenue-department publications and the Tax Foundation's 2026 mid-year review. UK rates come straight from HMRC. We update the data when statutory rates change; the rate displayed in the dropdown is what the tool actually uses for the calculation.

## Frequently Asked Questions

**Why state-level only for the US instead of resolving by ZIP code?**
There are over 13,000 US sales-tax jurisdictions and they change every quarter. Resolving by ZIP requires a paid tax-rate API and a continuously updated dataset, neither of which is compatible with a free, no-signup, runs-in-your-browser tool. State-level rates are public, stable, and accurate for the cases where the city/county portion is zero. For everything else, type the combined rate into "Custom rate" — the math handles it identically.

**Can I use this for B2B cross-border VAT (reverse charge)?**
The calculator is consumer-grade. Reverse charge, partial exemption, the EU One-Stop-Shop scheme, and Northern Ireland's protocol-specific rules need an accountant or specialist software, not a free web tool. Use this for the basic VAT-on / VAT-off cases.

**Does the calculator handle EU VAT or just UK?**
Just UK. EU VAT rates vary by country (Germany 19%, France 20%, Italy 22%, etc.) and the rules around B2C distance selling and the One-Stop-Shop have been changing since the 2021 reforms. We picked UK because the user need is concentrated and the rates are stable. For German VAT use the [Mehrwertsteuer-Rechner](/de/mehrwertsteuer-rechner) on the German side of the site.

**Why is "Exempt" listed if it gives the same answer as zero-rate?**
The customer-facing math is the same — no VAT shown on the receipt. But the bookkeeping side differs sharply: a VAT-registered business can reclaim input VAT on zero-rated supplies and cannot on exempt supplies. The calculator labels them separately so the result is unambiguous when you copy-paste it into accounting notes.

## Which Related Tools Pair Well With This One?

If you're working through a price, you may also need a [discount calculator](/en/discount-calculator) for percent-off promotions, a [gross-to-net calculator](/en/gross-to-net-calculator) for paycheck math, or an [interest calculator](/en/interest-calculator) for loan or savings totals.
