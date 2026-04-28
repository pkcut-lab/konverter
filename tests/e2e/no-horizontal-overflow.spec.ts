import { test, expect } from 'playwright/test';

/**
 * Mobile-Overflow-Gate — Layer 4 der 4-Layer-Defense (2026-04-28).
 *
 * Iteriert über sechs Mobile-Viewport-Breiten × representative Routen
 * und assertiert, dass kein Element des Dokuments breiter ist als der
 * Viewport (`scrollWidth <= clientWidth`).
 *
 * Warum dieser Test existiert
 * ----------------------------
 * Layer 1 (viewport-meta) und Layer 2 (`body { overflow-x: clip }`)
 * verhindern, dass der User horizontalen Scroll sieht — sie maskieren
 * aber NICHT die underlying Layout-Wahrheit. Ohne diesen Gate würde
 * jede künftige Regression silent hinter dem Safety-Net verschwinden,
 * bis ein Tester sie zufällig findet.
 *
 * Test-Design
 * -----------
 * Vor der Messung lifte der Test temporär das Layer-2-Mask (overflow-x:
 * visible auf html + body), misst dann `scrollWidth - clientWidth` am
 * `<html>`, und re-instated Layer 2 sofort. Bei Overflow > 0 listet der
 * Error die Top-10 offending elements (tag/id/class/overshoot) als
 * direkten Fix-Hint.
 *
 * Bei neuen Tools / Routen
 * ------------------------
 * - Route in ROUTES eintragen (eine repräsentative Route pro Tool-Typ
 *   reicht; nicht jede der 1000+ Tools).
 * - Bei Failure: Error-Meldung lesen, offending-element identifizieren,
 *   `min-width: 0` (Flex/Grid) oder `overflow-wrap: anywhere` (Text)
 *   ergänzen, Tokens statt arbitrary-px verwenden.
 */

interface Viewport {
  readonly name: string;
  readonly width: number;
  readonly height: number;
}

const VIEWPORTS: readonly Viewport[] = [
  { name: 'iPhone-SE', width: 320, height: 568 },
  { name: 'iPhone-mini', width: 375, height: 812 },
  { name: 'iPhone-15', width: 390, height: 844 },
  { name: 'Pixel-7', width: 412, height: 915 },
  { name: 'iPhone-15-Plus', width: 430, height: 932 },
  { name: 'iPad-mini', width: 768, height: 1024 },
];

/**
 * Repräsentative Routen, eine pro Tool-Typ + Layout-Pattern. NICHT
 * jede der ~1000 Tools — das wäre Build-Zeit-Verschwendung. Diese
 * Auswahl deckt alle 7 generischen Tool-Typen (Converter, Calculator,
 * Generator, Formatter, Validator, Analyzer, Comparer) plus die
 * idiosynkratischen Renderpfade (KI-Detector circular-chart-SVG,
 * Mondphasen 200×200-SVG, AudioTranskription wide-output-card) ab.
 *
 * Bei neuem Layout-Pattern hier eintragen. Bei neuem Tool desselben
 * Typs reicht eine bestehende Route — die strukturelle Class deckt's ab.
 */
const ROUTES: readonly string[] = [
  '/de',                       // DE homepage (card grid + hero)
  '/de/werkzeuge',             // Tools-Index (filter-grid)
  '/de/hex-zu-rgb',            // ColorConverter (swatch + input row)
  '/de/jpg-zu-pdf',            // File-Tool (multi-image grid)
  '/de/kreditrechner',         // Calculator + wide tilgungsplan-table
  '/de/meter-zu-fuss',         // Simple Converter (two-panel-stack)
  '/de/json-formatter',        // Formatter <pre> output (white-space: pre)
  '/de/passwort-generator',    // Generator <pre> + word-break: break-all
  '/de/ki-text-detektor',      // SVG ohne width/height (circular-chart)
  '/de/mondphasen-rechner',    // 200×200-SVG mit eigenem MQ
  '/de/audio-transkription',   // wide result-card + transcription-text
  '/de/bild-diff',             // wide-section (--wide 48rem) Comparer
];

interface OverflowOffender {
  readonly tag: string;
  readonly id: string | null;
  readonly classes: string | null;
  readonly over: number;
}

interface OverflowMeasurement {
  readonly clientWidth: number;
  readonly scrollWidth: number;
  readonly offenders: readonly OverflowOffender[];
}

for (const vp of VIEWPORTS) {
  for (const route of ROUTES) {
    test(`no horizontal overflow @ ${vp.width}px (${vp.name}) on ${route}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const result: OverflowMeasurement = await page.evaluate(() => {
        const html = document.documentElement;
        const body = document.body;

        // Layer 2 (body { overflow-x: clip }) maskiert sub-element overflow.
        // Für die Messung temporär lifen, damit wir die underlying Layout-
        // Wahrheit sehen, nicht nur die clipped Visualisierung.
        const origHtml = html.style.overflowX;
        const origBody = body.style.overflowX;
        html.style.overflowX = 'visible';
        body.style.overflowX = 'visible';

        const clientWidth = html.clientWidth;
        const scrollWidth = html.scrollWidth;
        const offenders = Array.from(document.querySelectorAll<HTMLElement>('*'))
          .filter((el) => el.scrollWidth > clientWidth)
          .slice(0, 10)
          .map((el) => ({
            tag: el.tagName.toLowerCase(),
            id: el.id || null,
            classes:
              typeof el.className === 'string' && el.className.length > 0
                ? el.className.slice(0, 80)
                : null,
            over: el.scrollWidth - clientWidth,
          }));

        // Layer 2 sofort re-instaten — der Test darf das App-State nicht
        // dauerhaft verändern.
        html.style.overflowX = origHtml;
        body.style.overflowX = origBody;

        return { clientWidth, scrollWidth, offenders };
      });

      const overshoot = result.scrollWidth - result.clientWidth;
      if (overshoot > 0) {
        const offendersList = result.offenders
          .map(
            (o) =>
              `  <${o.tag}${o.id ? ` id="${o.id}"` : ''}${o.classes ? ` class="${o.classes}"` : ''}> overshoot ${o.over}px`,
          )
          .join('\n');
        throw new Error(
          `Horizontal overflow ${overshoot}px @ ${vp.width}px on ${route}.\n` +
            `client=${result.clientWidth} scroll=${result.scrollWidth}\n` +
            `Top offenders:\n${offendersList}`,
        );
      }

      expect(overshoot).toBeLessThanOrEqual(0);
    });
  }
}
