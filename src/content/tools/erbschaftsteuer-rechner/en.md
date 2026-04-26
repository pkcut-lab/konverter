---
toolId: inheritance-tax-calculator
language: en
title: "Estate & Inheritance Tax Calculator"
headingHtml: "Estate & <em>Inheritance Tax</em> Calculator"
metaDescription: "Estimate US federal estate tax and state inheritance tax on an estate. See how the $13.6M federal exemption applies and which states impose additional taxes."
tagline: "Enter an estate value and see the estimated federal estate tax and applicable state estate or inheritance tax. Covers all 50 states. Runs privately in your browser."
intro: "Most American estates pay zero estate tax — the federal exemption is $13.61 million per person in 2024. But 12 states and DC have their own estate or inheritance taxes with much lower thresholds. This calculator estimates both federal and state tax liability based on estate size and state of residence."
howToUse:
  - "Enter the total gross estate value (all assets: real estate, investments, retirement accounts, business interests, life insurance payable to the estate)."
  - "Enter allowable deductions: marital deduction (assets left to spouse), charitable deductions, debts, and funeral expenses."
  - "Select the state of the deceased's permanent residence at time of death."
  - "For states with an inheritance tax (Iowa, Kentucky, Maryland, Nebraska, New Jersey, Pennsylvania), select the beneficiary's relationship to the deceased."
  - "Review the estimated federal and state tax, effective tax rate, and after-tax estate value."
faq:
  - q: "What is the federal estate tax exemption for 2024?"
    a: "The federal estate tax exemption is $13.61 million per individual ($27.22 million for married couples using portability) in 2024. Estates below this threshold pay zero federal estate tax. This exemption is scheduled to revert to approximately $7 million (inflation-adjusted) after December 31, 2025, when provisions of the 2017 Tax Cuts and Jobs Act sunset."
  - q: "What is the difference between estate tax and inheritance tax?"
    a: "An estate tax is levied on the total value of the deceased's estate before distribution. An inheritance tax is levied on the beneficiary who receives assets — meaning the tax depends on the beneficiary's relationship to the deceased and the amount they inherit. The federal government imposes only an estate tax. Six states impose an inheritance tax; some states impose both."
  - q: "Which states have an estate or inheritance tax?"
    a: "As of 2024, 12 states and DC have an estate tax: Connecticut, Hawaii, Illinois, Maine, Maryland, Massachusetts, Minnesota, New York, Oregon, Rhode Island, Vermont, Washington, and DC. Six states have an inheritance tax: Iowa (phasing out by 2025), Kentucky, Maryland, Nebraska, New Jersey, and Pennsylvania. Maryland is the only state with both."
  - q: "Does the marital deduction eliminate estate tax?"
    a: "Yes, for US citizen spouses. Assets left outright to a US citizen spouse qualify for an unlimited marital deduction, completely eliminating federal estate tax on those assets. The tax is deferred until the surviving spouse's estate is settled. Non-citizen spouses have a limited annual exclusion instead."
  - q: "Do retirement accounts (IRA, 401k) count as part of the estate?"
    a: "Yes. IRAs, 401(k)s, and other retirement accounts are included in the gross estate for estate tax purposes. However, the beneficiary will also owe income tax on distributions — meaning inherited retirement accounts can be subject to both estate tax and income tax, though estate tax is generally deductible against income tax on the same assets."
  - q: "How does the TCJA sunset in 2026 affect estate planning?"
    a: "The Tax Cuts and Jobs Act of 2017 doubled the estate tax exemption. Those provisions expire after December 31, 2025. If Congress doesn't extend them, the exemption will drop to roughly $7 million (inflation-adjusted) in 2026. Estates between $7M and $13.61M that currently owe nothing could face significant federal estate tax after the sunset."
relatedTools:
  - roi-calculator
  - compound-interest-calculator
  - interest-calculator
category: finance
contentVersion: 1
---

## What This Tool Does

The Estate and Inheritance Tax Calculator estimates the total tax liability on a US estate — both at the federal level and at the state level if the deceased's state of residence imposes its own tax.

The federal estate tax applies only to taxable estates above $13.61 million in 2024. State estate and inheritance taxes have far lower thresholds — Massachusetts taxes estates over $2 million, Oregon taxes estates over $1 million, and several states tax inheritances regardless of estate size depending on the beneficiary's relationship to the deceased.

This tool is for **estimation purposes only**. Estate tax law is complex, fact-specific, and changes regularly. Always consult a licensed estate planning attorney or CPA for actual tax planning.

## Formula / How It Works

```
Step 1: Gross Estate
  = Real estate + Financial accounts + Retirement accounts
    + Life insurance (payable to estate) + Business interests
    + Personal property + Other assets

Step 2: Deductions
  Taxable Estate = Gross Estate
    − Marital deduction (assets to US citizen spouse)
    − Charitable deduction (assets to qualifying charities)
    − Debts and mortgages
    − Funeral and estate administration expenses

Step 3: Adjusted Taxable Estate
  = Taxable Estate − Lifetime Gift Tax Exemption Used

Step 4: Federal Tentative Tax (if Taxable Estate > $13,610,000)
  Taxable Amount = Taxable Estate − $13,610,000
  Federal Tax = Progressive tax on excess (top rate: 40%)

  Federal Rate Schedule (on amounts above exemption):
    $0 – $10,000:          18%
    $10,001 – $20,000:     20%
    ...
    Over $1,000,000:       40% (effective rate on excess)

Step 5: State Estate Tax
  Threshold and rates vary by state (see table below)

Step 6: State Inheritance Tax
  Rate varies by beneficiary relationship
    Surviving spouse:   0% (all states exempt)
    Children/grandchildren: 0–1% in most states
    Siblings:           4–16%
    Unrelated parties:  10–18%

Net Estate = Gross Estate − Federal Tax − State Tax(es)
```

## 2024 State Estate Tax Reference

| State | Exemption | Top Rate |
|---|---|---|
| Connecticut | $13.61M (matches federal) | 12% |
| Hawaii | $5.49M | 20% |
| Illinois | $4M | 16% |
| Maine | $6.41M | 12% |
| Maryland | $5M | 16% |
| Massachusetts | $2M | 16% |
| Minnesota | $3M | 16% |
| New York | $6.94M | 16% |
| Oregon | $1M | 16% |
| Rhode Island | $1.77M | 16% |
| Vermont | $5M | 16% |
| Washington | $2.193M | 20% |
| DC | $4.528M | 16% |
| All other states | No estate tax | — |

## 2024 State Inheritance Tax Rates by Beneficiary

| State | Spouse | Children | Siblings | Unrelated |
|---|---|---|---|---|
| Iowa (phasing out) | 0% | 0% | 5–10% | 10–15% |
| Kentucky | 0% | 0% | 4–16% | 6–16% |
| Maryland | 0% | 0% | 10% | 10% |
| Nebraska | 0% | 1% (over $100K) | 13% | 18% |
| New Jersey | 0% | 0% | 11–16% | 15–16% |
| Pennsylvania | 0% | 4.5% | 12% | 15% |

## Common Use Cases

**Basic estate planning check.** A couple in Illinois with a combined estate of $6 million wants to know if they face estate tax. At $4 million per person, Illinois does not tax the surviving spouse's estate up to $4M — but without planning, the second-to-die estate at $6M would owe Illinois estate tax on the $2M excess.

**Evaluating the impact of charitable giving.** An estate of $15 million includes a $2 million charitable bequest. That reduces the taxable estate below $13.61M, potentially eliminating all federal estate tax — the charity receives more and the family pays less.

**Preparing for the 2026 TCJA sunset.** A single person with a $10 million estate currently owes no federal estate tax (below the $13.61M exemption). After the sunset, if the exemption drops to $7 million, the same estate would face federal tax on $3 million at 40% — roughly $1.2 million. Running the numbers helps identify whether pre-sunset gifting strategies are worth pursuing.

**Estimating state tax exposure for a multi-state estate.** A Massachusetts resident with $4 million in assets owes Massachusetts estate tax on the $2M above the $2M exemption — potentially $100,000–$200,000. This often surprises families who assumed the federal exemption covered everything.

**Beneficiary planning in inheritance-tax states.** In Pennsylvania, assets left to adult children are taxed at 4.5%, while assets left to a sibling are taxed at 12%. Knowing this in advance can inform decisions about how assets are titled and who is named as beneficiary on retirement accounts.

## Frequently Asked Questions

**What is the federal estate tax exemption for 2024?**
$13.61 million per individual. Married couples can effectively double this to $27.22 million using portability — the surviving spouse can claim the deceased spouse's unused exemption by filing a timely estate tax return (Form 706), even if no tax is owed. The exemption is indexed for inflation annually. This high exemption means roughly 99.9% of American estates pay zero federal estate tax.

**What is the difference between estate tax and inheritance tax?**
Estate tax is paid by the estate itself, before assets are distributed to beneficiaries. Inheritance tax is paid by the individual beneficiary after receiving their inheritance. The federal government imposes only an estate tax. Some states impose one, the other, or both — Maryland uniquely imposes both.

**Which states have an estate or inheritance tax?**
Twelve states and DC impose an estate tax, with exemptions ranging from $1 million (Oregon) to $13.61 million (Connecticut). Six states impose an inheritance tax: Iowa (phasing out), Kentucky, Maryland, Nebraska, New Jersey, and Pennsylvania. If you live in one of these states, state tax can be significant even when no federal estate tax is owed.

**Does the marital deduction eliminate estate tax?**
Yes, for assets passing to a US citizen spouse — the marital deduction is unlimited, meaning any amount can pass estate-tax-free to a US citizen spouse at death. This defers (not eliminates) the tax until the surviving spouse's estate is settled. Non-citizen spouses require a Qualified Domestic Trust (QDOT) to access the marital deduction.

**Do retirement accounts count as part of the estate?**
Yes. All retirement accounts (traditional IRA, 401(k), 403(b), etc.) are included in the gross estate. Inherited IRAs are subject to income tax when withdrawn by beneficiaries, and under the SECURE 2.0 Act, most non-spouse beneficiaries must withdraw the full account within 10 years. Estate tax paid on IRAs can generate an income tax deduction (Income in Respect of a Decedent deduction) that partially offsets the double-taxation burden.

**How does the TCJA sunset in 2026 affect estate planning?**
The Tax Cuts and Jobs Act doubled the estate tax exemption beginning in 2018. Those changes expire after December 31, 2025. Without Congressional action, the exemption reverts to approximately $7 million (2017 amount indexed for inflation). Estates currently between $7M and $13.61M should evaluate strategies like irrevocable trusts, spousal lifetime access trusts (SLATs), and accelerated gifting before the sunset takes effect.
