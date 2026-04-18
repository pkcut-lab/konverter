# Recraft.ai Icon-Prompt — Meter zu Fuß

**Target file:** `public/icons/tools/meter-zu-fuss.png`
**Graphit-Ref:** `#6B7280` (Icon-Tinte, Single-Weight-Linien)
**Alt-Text (DE):** `Pencil-Sketch-Icon von Maßband neben Fußabdruck`

---

## Primary Prompt (English, for Recraft.ai input)

```
Pencil-sketch icon of a retractable measuring tape partially extended toward a
bare human footprint outline, both elements drawn in monochrome graphite gray
(#6B7280), single-weight hand-drawn strokes, no shading, no fill, transparent
background, minimalist line art, square aspect, balanced composition with tape
on the left and footprint on the right, small measurement ticks visible on the
tape surface.
```

Wörterzahl: ~65. Liegt im Recraft-sweetspot (40–80 Wörter).

---

## Style-Anchors

Jede dieser Phrasen muss einzeln im Recraft "Style"-Feld auftauchen, damit der
Batch später konsistent bleibt:

- `hand-drawn pencil sketch`
- `single-weight strokes`
- `no shading`
- `no fill`
- `monochrome graphite gray`
- `grayscale only`
- `minimalist line art`
- `transparent background`

---

## Negative Prompt

```
no color, no gradient, no photo-realism, no 3D rendering, no text, no numbers,
no watermark, no drop shadow, no background fill, no crosshatching, no bold
outlines.
```

---

## Technical Specification

- **Format:** PNG mit Alpha-Kanal
- **Size:** 512 × 512 px (Source), wird via `sharp` auf 80 × 80 CSS-Display
  reduziert (Spec Section 5.6)
- **Background:** transparent
- **Color-Mode:** Graustufen (keine RGB-Streuung), Linien in `#6B7280` ± 10 %
- **Padding:** ca. 8 % Rand zum Canvas (kein randloses Layout)

---

## QA-Checkliste vor Drop in `pending-icons/`

1. Ein einziges zusammenhängendes Sujet (Maßband + Fußabdruck), nicht zwei
   getrennte Icons nebeneinander.
2. Keine Farbpixel außerhalb des Graustufenbereichs (Pickel via Photoshop
   „Sättigung reduzieren“ prüfen).
3. Transparenz sauber — kein weißer Fond hinter dem Motiv.
4. Single-Weight-Linien (keine Kalligraphie-Variationen). Erkennbar daran, dass
   sich alle Konturen auf dieselbe Strichstärke zurückführen lassen.
5. Dark-Mode-Preview: Das Icon bleibt nach `filter: invert(0.92) brightness(1.05)`
   als hellgrauer Strich auf dunklem Grund lesbar (Spec Section 5.6, OQ3).
6. Export-Größe unter 10 KB PNG — sonst Recraft-Regenerate oder via
   `sharp --quality 85` nachbearbeiten.

---

## Hintergrund

Motiv-Wahl: Maßband + Fußabdruck kombiniert beide Einheiten visuell — metrisch
(Maßband = Zollstock-Assoziation neutral, Tick-Marks zeigen Längenmessung) und
imperial (Fußabdruck = wörtliche Bedeutung von „foot/Fuß“). Alternative
Motive wurden verworfen:

- Zollstock allein → zu generisch, erkennbar nur als „Länge“, nicht als
  Meter↔Fuß-Bezug.
- Lineal mit Zahlen → widerspricht `no text, no numbers`-Regel des
  Pencil-Sketch-Styles.
- Maßband + Gebäude → driftet in Bauwesen-Bedeutung ab, Tool ist general-purpose.
