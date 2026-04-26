---
toolId: hex-to-rgb
language: en
title: "Hex to RGB Color Converter — #RRGGBB"
headingHtml: "Hex to <em>RGB</em> Color Converter"
metaDescription: "Convert hex color codes to RGB, RGBA, and HSL — and back. Instant preview, copy-ready CSS values. Essential for web design, CSS, and design tool workflows."
tagline: "Paste a hex code, get RGB and HSL instantly. Or enter RGB values to get the hex. Live color preview included."
intro: "Hex color codes and RGB values represent the same colors expressed in different notations. CSS, design tools, and color pickers all use these formats interchangeably. This converter translates between hex (#RRGGBB), RGB (rgb(r, g, b)), RGBA (rgba(r, g, b, a)), and HSL (hsl(h, s%, l%)) — in real time, with a live color preview and one-click copy for each format."
howToUse:
  - "Enter a hex color code in the Hex field (e.g., #3A86FF or 3A86FF)."
  - "RGB, RGBA, and HSL values update instantly with a live color preview."
  - "Or enter RGB values directly to generate the hex equivalent."
  - "Click any copy button to grab that format's value for use in CSS or your design tool."
faq:
  - q: "What is a hex color code?"
    a: "A hex color code like #3A86FF encodes a color as three two-digit hexadecimal numbers: red (3A = 58), green (86 = 134), blue (FF = 255). The # prefix is optional in some contexts."
  - q: "What is the difference between RGB and RGBA?"
    a: "RGB specifies a color using red, green, and blue channels (0–255 each). RGBA adds an alpha (opacity) channel ranging from 0.0 (fully transparent) to 1.0 (fully opaque). Both are valid CSS values."
  - q: "What is HSL?"
    a: "HSL stands for Hue, Saturation, Lightness. Hue is a degree on the color wheel (0–360). Saturation is the intensity (0–100%). Lightness is how bright (0% = black, 100% = white, 50% = pure color). HSL is often more intuitive for designers than RGB."
  - q: "Does #RGB shorthand work the same as #RRGGBB?"
    a: "Yes, if each digit is doubled. #36F is equivalent to #3366FF. Each single hex digit is doubled, not padded with zero. This tool accepts and expands 3-digit shorthand."
  - q: "What is #000000 and #FFFFFF?"
    a: "#000000 is pure black (R=0, G=0, B=0). #FFFFFF is pure white (R=255, G=255, B=255)."
  - q: "Can I use this for CSS opacity / transparent colors?"
    a: "Yes. The RGBA output includes the alpha channel. You can also use 8-digit hex (#RRGGBBAA) in modern CSS — the tool outputs both formats."
relatedTools:
  - contrast-checker
  - css-formatter
  - webp-converter
category: color
stats:
  - label: "Color formats"
    value: "5"
  - label: "Conversion"
    value: "real-time"
  - label: "Color space"
    value: "sRGB"
contentVersion: 1
datePublished: '2026-04-26'
dateModified: '2026-04-26'

---

## What This Tool Does

This converter translates between the color notations used in CSS and design tools: hexadecimal (#RRGGBB), RGB, RGBA, and HSL. It works bidirectionally — enter a hex code to get RGB and HSL, or enter RGB channels to generate the corresponding hex. A live color preview shows the actual color as you type.

## How Does It Work?

All four formats encode the same underlying data: three color channels (red, green, blue) each ranging from 0 to 255, plus an optional alpha channel.

### Hex to RGB

```
Hex format:  #RRGGBB  (two hex digits per channel)

Red   = parseInt("RR", 16)   → 0–255
Green = parseInt("GG", 16)   → 0–255
Blue  = parseInt("BB", 16)   → 0–255
```

Example:

```
#3A86FF
R = 0x3A = 58
G = 0x86 = 134
B = 0xFF = 255

→ rgb(58, 134, 255)
```

### RGB to Hex

```
Hex = "#" + toHex(R) + toHex(G) + toHex(B)
where toHex(n) = n.toString(16).padStart(2, '0').toUpperCase()
```

Example:

```
rgb(58, 134, 255)
R: 58  → 3A
G: 134 → 86
B: 255 → FF

→ #3A86FF
```

### RGB to HSL

```
r = R / 255,  g = G / 255,  b = B / 255
max = Math.max(r, g, b)
min = Math.min(r, g, b)
delta = max - min

L = (max + min) / 2

S = delta === 0 ? 0 : delta / (1 - |2L - 1|)

H = (if max = r): 60 × ((g - b) / delta % 6)
    (if max = g): 60 × ((b - r) / delta + 2)
    (if max = b): 60 × ((r - g) / delta + 4)
```

## What Color Formats Are Supported?

| Format | Syntax | Example |
|--------|--------|---------|
| Hex | #RRGGBB | #3A86FF |
| Hex shorthand | #RGB | #38F |
| Hex with alpha | #RRGGBBAA | #3A86FFCC |
| RGB | rgb(r, g, b) | rgb(58, 134, 255) |
| RGBA | rgba(r, g, b, a) | rgba(58, 134, 255, 0.8) |
| HSL | hsl(h, s%, l%) | hsl(217, 100%, 61%) |
| HSLA | hsla(h, s%, l%, a) | hsla(217, 100%, 61%, 0.8) |

## What Are Common US Web Design Use Cases?

**Translating design tool colors to CSS.** Figma, Sketch, and Adobe XD all display colors in hex by default. When writing CSS manually, you might need the RGB equivalent to use `rgba()` for semi-transparent overlays: `background: rgba(58, 134, 255, 0.15)` creates a light blue tint with 15% opacity.

**Debugging CSS color values.** When a color looks slightly off in the browser and you're not sure why, converting the hex to HSL makes it easy to see whether the hue, saturation, or lightness is the culprit — and adjust accordingly.

**Meeting WCAG contrast requirements.** Color contrast checkers require RGB values to calculate relative luminance. If your design spec uses hex codes, converting to RGB is the first step in a contrast audit.

**Building design tokens.** Many token systems and theme files store colors in HSL for easier programmatic manipulation (darkening, lightening, saturation shifts). Converting from hex to HSL helps you establish those baseline values.

**Creating transparent color variants.** CSS custom properties support RGBA: `--color-brand-overlay: rgba(58, 134, 255, 0.12)`. This converter gives you the R, G, B values to plug in directly.

## Frequently Asked Questions

### What is a hex color code?

A hex color code (hexadecimal color) represents a color as three two-digit base-16 numbers, one for each color channel: red, green, and blue. The prefix `#` signals hex notation in CSS. `#3A86FF` breaks down as: `3A` (hex) = 58 (decimal) for red; `86` = 134 for green; `FF` = 255 for blue.

Values range from `00` (0) to `FF` (255), giving 256 possible values per channel and 16,777,216 possible colors in total.

### What is the difference between RGB and RGBA?

RGB (`rgb(r, g, b)`) specifies a fully opaque color using three channels: red, green, and blue, each 0–255. RGBA (`rgba(r, g, b, a)`) adds a fourth alpha channel that controls transparency. Alpha ranges from 0.0 (completely transparent, invisible) to 1.0 (completely opaque, same as the RGB equivalent). For example, `rgba(0, 0, 0, 0.5)` is 50% transparent black — useful for overlays and shadows.

### What is HSL?

HSL stands for Hue, Saturation, Lightness. It models colors the way humans tend to think about them:
- **Hue** — the basic color, expressed as a degree on the color wheel (0° = red, 120° = green, 240° = blue, 360° = red again).
- **Saturation** — how vivid vs. gray the color is (0% = gray, 100% = fully saturated).
- **Lightness** — how bright the color is (0% = black, 50% = the pure hue, 100% = white).

HSL is popular for generating color palettes programmatically because you can systematically adjust lightness while keeping the same hue.

### Does the 3-digit #RGB shorthand work the same as 6-digit #RRGGBB?

Yes, when each digit is doubled. `#38F` is identical to `#3388FF`. This is a CSS shorthand that only works when both digits of each channel would be the same. You cannot shorten `#3A86FF` to a 3-digit code because none of its channel pairs repeat. This tool accepts 3-digit codes and automatically expands them.

### What is #000000 and #FFFFFF?

`#000000` is pure black: R=0, G=0, B=0. `#FFFFFF` is pure white: R=255, G=255, B=255. `#808080` is neutral gray (R=128, G=128, B=128). These are useful reference points for understanding the scale.

### Can I use this for transparent colors in CSS?

Yes. The RGBA output gives you the correct `rgba()` value with alpha set to 1.0 by default. Adjust the alpha slider to generate semi-transparent variants. Modern CSS (all major browsers since 2021) also supports 8-digit hex with alpha: `#RRGGBBAA`, where the last two digits represent the alpha channel. For example, `#3A86FFCC` is the same as `rgba(58, 134, 255, 0.8)`.
