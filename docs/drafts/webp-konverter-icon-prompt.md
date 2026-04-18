# Recraft.ai Icon-Prompt — WebP Konverter

**Target file:** `public/icons/tools/webp-konverter.webp` (built aus
`pending-icons/webp-konverter.png`)
**Graphit-Ref:** `#6B7280` (Icon-Tinte, Single-Weight-Linien)
**Alt-Text (DE):** `Pencil-Sketch-Icon von zwei Bild-Rahmen mit Umwandlungs-Pfeil`

---

## Motiv-Wahl

Zwei stilisierte Bild-Rahmen (klassisches „Foto"-Symbol mit Berg- und
Sonnen-Piktogramm innen) stehen nebeneinander; dazwischen ein nach rechts
weisender geschwungener Pfeil. Der rechte Rahmen wirkt dezent „verdichtet" —
Andeutung von Kompression durch leicht engere innere Linienführung. Keine
Buchstaben, kein „WebP"-Label, keine Dateierweiterungs-Text-Elemente.

Alternative Motive wurden verworfen:

- Einzelnes Bild mit Komprimierungs-Wellen → zu abstrakt, nicht als
  Konvertierung erkennbar.
- Bild-Stapel → wirkt wie Gallery/Slideshow, nicht wie Format-Wechsel.
- Rahmen mit explizitem „WebP"-Schriftzug → widerspricht Pencil-Sketch-
  `no text`-Regel und provoziert Recraft-Halluzinationen des Google-Logos.

---

## Primary Prompt (English, for Recraft.ai input)

```
Pencil-sketch icon of two simple picture frames side by side, each containing
a minimal mountain-and-sun sketch, connected by a curved arrow pointing from
left to right, drawn in monochrome graphite gray (#6B7280), single-weight
hand-drawn strokes, no shading, no fill, transparent background, minimalist
line art, square aspect, balanced composition, the right frame slightly more
compressed in its internal spacing to suggest file-size reduction.
```

Wörterzahl: ~70. Liegt im Recraft-Sweetspot (40–80 Wörter).

---

## Style-Anchors

Jede dieser Phrasen muss einzeln im Recraft „Style"-Feld auftauchen, damit der
Batch konsistent bleibt:

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
outlines, no WebP logo, no Google logo, no trademark symbols, no file
extension labels.
```

Die WebP/Google-Logo-Sperre ist wichtig: Recraft assoziiert „WebP" häufig mit
dem offiziellen Google-Logo und rendert es aus Reflex ein — das wäre
Markenrechts-riskant und stilwidrig.

---

## Technical Specification

- **Format:** PNG mit Alpha-Kanal
- **Size:** 512 × 512 px (Source), Build konvertiert zu 160 × 160 WebP Q=85
  (Spec Section 9.5), CSS-Display 80 × 80 (2× Retina)
- **Background:** transparent
- **Color-Mode:** Graustufen (keine RGB-Streuung), Linien in `#6B7280` ± 10 %
- **Padding:** ca. 8 % Rand zum Canvas

---

## QA-Checkliste vor Drop in `pending-icons/webp-konverter.png`

1. Zwei klar getrennte Rahmen mit einem Pfeil — nicht verschmolzen, nicht
   überlappend.
2. Keine Farbpixel außerhalb des Graustufenbereichs (Photoshop „Sättigung
   reduzieren" testen).
3. Transparenz sauber — kein weißer Fond hinter dem Motiv.
4. Single-Weight-Linien, keine Kalligraphie-Variationen.
5. Kein „WebP"-Schriftzug, kein Google-Logo, kein Dateisymbol mit Extension.
6. Dark-Mode-Preview: Das Icon bleibt nach `filter: invert(0.92) brightness(1.05)`
   als hellgrauer Strich auf dunklem Grund lesbar (Spec Section 5.6, OQ3).
7. Export-Größe unter 30 KB PNG; sonst Recraft-Regenerate.
