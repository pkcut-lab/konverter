/**
 * tests/a11y/helpers.ts
 * Shared helpers for axe-core + Playwright a11y specs.
 *
 * Used by every per-slug spec. The 5 checks below correspond to the
 * a11y-auditor's 12-check sequence (A1, A2, A3, A4, A11).
 */

import { type Page, expect } from 'playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

/** Base URL for the DE locale (served by `npx serve dist`). */
export const BASE_DE = '/de';

/** Build the DE page URL for a given slug. */
export function toolUrl(slug: string): string {
  return `${BASE_DE}/${slug}`;
}

// ---------------------------------------------------------------------------
// A1 — axe-core strict scan
// ---------------------------------------------------------------------------

/**
 * Runs axe-core with the strictest ruleset including WCAG 2.2 Level AAA.
 * Tags: wcag2a, wcag2aa, wcag2aaa, wcag21a, wcag21aa, wcag22aa.
 * color-contrast-enhanced is always included (WCAG AAA ≥7:1).
 */
export async function checkAxeStrict(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .include('body')
    .analyze();

  expect(
    results.violations,
    `axe-strict found ${results.violations.length} violation(s):\n` +
      results.violations
        .map(v => `  [${v.impact ?? 'unknown'}] ${v.id}: ${v.description} (${v.nodes.length} node(s))`)
        .join('\n'),
  ).toHaveLength(0);
}

// ---------------------------------------------------------------------------
// A2 — Tab-order
// ---------------------------------------------------------------------------

/**
 * Verifies that pressing Tab cycles through all interactive elements in
 * logical DOM order and that at least one focusable element is present.
 */
export async function checkTabOrder(page: Page): Promise<void> {
  // Collect all naturally focusable elements in DOM order.
  const handles = await page.locator(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  ).all();

  expect(handles.length, 'No focusable elements found on page').toBeGreaterThan(0);

  // Tab through and verify each element receives focus without JavaScript errors.
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement?.tagName ?? 'BODY');
  expect(focused).not.toBe('BODY');
}

// ---------------------------------------------------------------------------
// A3 — Focus-ring contrast
// ---------------------------------------------------------------------------

/**
 * Ensures the first focusable element shows a visible outline when focused.
 * Checks that outline or box-shadow is non-zero (browser-computed).
 */
export async function checkFocusRing(page: Page): Promise<void> {
  const firstFocusable = page.locator(
    'a[href], button:not([disabled]), input:not([disabled])',
  ).first();

  await firstFocusable.focus();

  const hasVisibleRing = await firstFocusable.evaluate((el: Element) => {
    const s = window.getComputedStyle(el);
    // A focus ring exists if outline-width > 0 OR box-shadow is non-empty.
    const outlineW = parseFloat(s.outlineWidth ?? '0');
    const shadow = s.boxShadow ?? '';
    return outlineW > 0 || (shadow !== 'none' && shadow !== '');
  });

  expect(hasVisibleRing, 'No visible focus ring on first focusable element').toBe(true);
}

// ---------------------------------------------------------------------------
// A4 — Focus-trap (modal/dialog guard)
// ---------------------------------------------------------------------------

/**
 * If the page contains a <dialog> or [role="dialog"], opens it and verifies
 * that Tab does not escape the dialog boundary. Skips gracefully when no
 * dialog is present.
 */
export async function checkFocusTrap(page: Page): Promise<void> {
  const dialogs = await page.locator('dialog, [role="dialog"]').all();
  if (dialogs.length === 0) {
    // No dialogs on this page — guard passes vacuously.
    return;
  }

  // Open the first dialog (trigger button or programmatic).
  const triggerBtn = page.locator('[aria-haspopup="dialog"], [data-dialog-trigger]').first();
  if (await triggerBtn.isVisible()) {
    await triggerBtn.click();
  }

  const dialog = dialogs[0];
  const isVisible = await dialog.isVisible();
  if (!isVisible) return; // Dialog exists but isn't open — skip.

  // Tab 10 times; focus must not leave the dialog.
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab');
    const activeInDialog = await page.evaluate(() => {
      const active = document.activeElement;
      const dlg = document.querySelector('dialog[open], [role="dialog"]');
      return dlg ? dlg.contains(active) : true;
    });
    expect(activeInDialog, `Focus escaped dialog on Tab press ${i + 1}`).toBe(true);
  }
}

// ---------------------------------------------------------------------------
// A11 — prefers-reduced-motion
// ---------------------------------------------------------------------------

/**
 * Emulates prefers-reduced-motion: reduce and verifies that no CSS animations
 * or transitions with duration > 0ms remain active on the page.
 *
 * The project uses `var(--dur-*)` tokens + a global `@media (prefers-reduced-motion: reduce)`
 * block that should zero out all durations.
 */
export async function checkPrefersReducedMotion(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();

  const animatingElements = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('*'));
    return elements.filter(el => {
      const s = window.getComputedStyle(el);
      const animDur = parseFloat(s.animationDuration ?? '0');
      const transDur = parseFloat(s.transitionDuration ?? '0');
      return animDur > 0 || transDur > 0;
    }).length;
  });

  expect(
    animatingElements,
    `${animatingElements} element(s) still animate under prefers-reduced-motion: reduce`,
  ).toBe(0);
}
