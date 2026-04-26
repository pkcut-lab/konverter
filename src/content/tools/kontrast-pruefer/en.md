---
toolId: contrast-checker
language: en
title: "WCAG Contrast Checker — AA & AAA Tester"
headingHtml: "WCAG Contrast Checker — <em>AA & AAA Tester</em>"
metaDescription: "Enter two colors and get the WCAG 2.1 contrast ratio plus AA and AAA pass/fail results instantly. Supports hex, RGB, and HSL input — no login needed."
tagline: "Enter a foreground and background color and see the WCAG 2.1 contrast ratio with instant AA and AAA pass/fail — essential for accessible web design."
intro: "Color contrast is the most common accessibility failure on the web. WCAG 2.1 defines minimum ratios that ensure text remains readable for people with low vision or color blindness. This tool calculates the contrast between any two colors and tells you immediately whether the combination passes Level AA or AAA — hex, RGB, and HSL all supported."
howToUse:
  - "Enter your foreground color (text color) in the first input field — hex, rgb(), or hsl() all work."
  - "Enter your background color in the second input field."
  - "The contrast ratio and WCAG AA/AAA pass/fail results appear immediately."
  - "Use the color pickers to visually select or adjust colors."
  - "Check the preview panel to see how your text actually looks at the calculated contrast."
faq:
  - q: "What contrast ratio does WCAG 2.1 Level AA require?"
    a: "Level AA requires a minimum contrast ratio of 4.5:1 for normal text (under 18pt or 14pt bold) and 3:1 for large text (18pt or larger, or 14pt bold). UI components and graphics require 3:1 against adjacent colors."
  - q: "What does WCAG Level AAA require?"
    a: "Level AAA requires 7:1 for normal text and 4.5:1 for large text. AAA is the enhanced standard — it is not legally required in most US contexts but is strongly recommended for accessibility-focused products."
  - q: "Is WCAG compliance legally required in the US?"
    a: "Section 508 of the Rehabilitation Act requires US federal agencies and federally funded organizations to meet WCAG 2.1 AA. The ADA (Americans with Disabilities Act) has been interpreted by courts to require comparable accessibility for public-facing websites. Private sector organizations face increasing legal risk for non-compliance."
  - q: "How is the contrast ratio calculated?"
    a: "The contrast ratio uses WCAG's relative luminance formula: (L1 + 0.05) / (L2 + 0.05), where L1 is the lighter color's relative luminance and L2 is the darker. Relative luminance is calculated from linearized sRGB values using the formula in WCAG 2.1 Success Criterion 1.4.3."
  - q: "Does this work for colored text on colored backgrounds?"
    a: "Yes. The contrast ratio formula works for any foreground/background pair — white on blue, gray on light gray, orange on dark charcoal. The tool does not assume white or black as defaults."
  - q: "What about contrast for icons or non-text elements?"
    a: "WCAG 2.1 Success Criterion 1.4.11 (Non-text Contrast) requires a 3:1 contrast ratio for UI components (buttons, form inputs, icons) and graphical objects. This calculator works for those checks — enter the icon color and background color."
relatedTools:
  - hex-to-rgb
  - css-formatter
  - webp-converter
category: color
contentVersion: 1
datePublished: '2026-04-26'
dateModified: '2026-04-26'

---

## What This Tool Does

Poor color contrast makes text unreadable for the 253 million people worldwide who live with some form of visual impairment. It also fails the millions more who read on glare-prone screens, in bright sunlight, or on low-brightness mobile devices. WCAG 2.1 defines contrast ratios that set the floor for readable, accessible design.

This tool calculates the WCAG-defined contrast ratio between any two colors and returns instant pass/fail verdicts for both Level AA and Level AAA. It also shows a live text preview so you can see the combination as your users will.

## How Does It Work?

**Contrast Ratio = (L1 + 0.05) ÷ (L2 + 0.05)**

Where L1 is the relative luminance of the lighter color and L2 is the relative luminance of the darker color.

**Relative luminance calculation:**
1. Convert sRGB values (0–255) to 0–1 range
2. Apply gamma correction: if C ≤ 0.04045 → C/12.92; else → ((C + 0.055)/1.055)^2.4
3. L = 0.2126 × R + 0.7152 × G + 0.0722 × B

**WCAG 2.1 Pass/Fail Thresholds:**

| Standard | Normal Text | Large Text | UI Components |
|---|---|---|---|
| Level AA | ≥ 4.5:1 | ≥ 3:1 | ≥ 3:1 |
| Level AAA | ≥ 7:1 | ≥ 4.5:1 | Not specified |
| Maximum possible | 21:1 (black on white) | — | — |

**Text size definitions:**
- Normal text: below 18pt (24px) regular, or below 14pt (18.67px) bold
- Large text: 18pt (24px) or larger regular, or 14pt (18.67px) or larger bold

## What Are Common Use Cases?

- **Design system setup:** Validate every color pair in your component library — primary button text, link colors, placeholder text, and error states.
- **Dark mode review:** Dark themes often have subtle contrast failures (gray text on dark gray background). Check every token combination.
- **Accessibility audits:** Before shipping a redesign, run every text/background pair through this tool as part of your WCAG checklist.
- **Client deliverables:** Agencies use contrast ratio screenshots to document compliance in accessibility reports.
- **Legal risk reduction:** US companies facing ADA web-accessibility lawsuits point to documented WCAG compliance as a defense.
- **Brand color validation:** Marketing teams choose a brand palette and need to verify which color combinations are safe for body text, headings, and CTAs.

## Frequently Asked Questions

**My brand blue is #0057B8 on white — does it pass?**
#0057B8 on #FFFFFF has a contrast ratio of approximately 6.4:1 — passing WCAG AA (4.5:1) but not AAA (7:1) for normal text. For large text or UI components (3:1 threshold), it passes AAA as well.

**Why does gray text on white look fine to me but fail WCAG?**
Human visual perception is non-linear and varies by age, screen brightness, and ambient lighting. WCAG uses a standardized luminance formula calibrated for users with moderate visual impairments — not peak conditions. What looks "fine" to one person in a dimly lit office may be unreadable on a glare-heavy phone screen outdoors.

**Can I check a CSS variable or custom property?**
No — the tool needs a resolved color value (hex, RGB, or HSL). Resolve your CSS custom property to its actual value first, then enter it here.

**Does this cover WCAG 3.0?**
This tool implements WCAG 2.1 (the current legal standard in the US under Section 508). WCAG 3.0 introduces a different algorithm (APCA) with a different scale. A separate APCA checker is planned for a future release.
