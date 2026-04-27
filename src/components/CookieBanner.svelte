<script lang="ts">
  import { t } from '../lib/i18n/strings';
  import type { Lang } from '../lib/i18n/lang';
  import { getConsent, setConsent } from '../lib/consent';

  interface Props {
    lang: Lang;
  }
  const { lang }: Props = $props();

  const strings = t(lang);
  const privacyUrl = `/${lang}${strings.cookieBanner.privacyHref}`;
  const privacyLink = `<a href="${privacyUrl}">${strings.cookieBanner.privacyLinkLabel}</a>`;
  const bannerBodyHtml = strings.cookieBanner.bodyHtml.replace('{privacyLink}', privacyLink);

  let mode = $state<'banner' | 'drawer' | 'hidden'>('hidden');
  let toggles = $state({ notwendig: true, statistik: false, marketing: false });

  $effect(() => {
    if (!getConsent()) mode = 'banner';
  });

  function acceptAll() {
    setConsent({ statistik: true, marketing: true, ts: Date.now() });
    mode = 'hidden';
  }

  function acceptNecessary() {
    setConsent({ statistik: false, marketing: false, ts: Date.now() });
    mode = 'hidden';
  }

  function openDrawer() {
    mode = 'drawer';
  }

  function saveDrawer() {
    setConsent({ statistik: toggles.statistik, marketing: toggles.marketing, ts: Date.now() });
    mode = 'hidden';
  }
</script>

{#if mode === 'banner'}
  <div class="banner" role="dialog" aria-modal="true" aria-label={strings.cookieBanner.bannerAria}>
    <p class="eyebrow">{strings.cookieBanner.eyebrowPrivacy}</p>
    <p class="body">{@html bannerBodyHtml}</p>
    <div class="buttons">
      <button class="primary" onclick={acceptAll}>{strings.cookieBanner.acceptAll}</button>
      <button class="ghost" onclick={openDrawer}>{strings.cookieBanner.selectChoices}</button>
      <button class="ghost" onclick={acceptNecessary}>{strings.cookieBanner.acceptNecessary}</button>
    </div>
  </div>
{:else if mode === 'drawer'}
  <div class="banner" role="dialog" aria-modal="true" aria-label={strings.cookieBanner.drawerAria}>
    <p class="eyebrow">{strings.cookieBanner.eyebrowSelection}</p>
    <ul class="toggles">
      <li>
        <label>
          <input type="checkbox" checked disabled />
          <span>{strings.cookieBanner.necessaryLabel} <span class="note">{strings.cookieBanner.necessaryNote}</span></span>
        </label>
      </li>
      <li>
        <label>
          <input type="checkbox" bind:checked={toggles.statistik} />
          <span>{strings.cookieBanner.statisticsLabel} <span class="note">{strings.cookieBanner.statisticsNote}</span></span>
        </label>
      </li>
      <li>
        <label>
          <input type="checkbox" bind:checked={toggles.marketing} />
          <span>{strings.cookieBanner.marketingLabel} <span class="note">{strings.cookieBanner.marketingNote}</span></span>
        </label>
      </li>
    </ul>
    <div class="buttons">
      <button class="primary" onclick={saveDrawer}>{strings.cookieBanner.save}</button>
    </div>
  </div>
{/if}

<style>
  .banner {
    position: fixed;
    bottom: var(--space-6);
    right: var(--space-6);
    max-width: 24rem;
    padding: var(--space-6);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-md);
    z-index: 100;
  }

  .eyebrow {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    text-transform: uppercase;
    letter-spacing: var(--tracking-label);
    color: var(--color-text-subtle);
    margin: 0 0 var(--space-2);
  }

  .body {
    margin: 0 0 var(--space-4);
    font-size: var(--font-size-small);
    line-height: var(--font-lh-small);
    color: var(--color-text-muted);
  }

  .body :global(a) {
    color: var(--color-accent);
    text-decoration-thickness: 1px;
    text-underline-offset: var(--underline-offset);
  }

  .body :global(a:hover) {
    color: var(--color-accent-hover);
  }

  .buttons {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .primary {
    background: var(--color-text);
    color: var(--color-bg);
    padding: var(--space-2) var(--space-4);
    border: none;
    border-radius: var(--r-sm);
    font-size: var(--font-size-small);
    font-family: var(--font-family-sans);
    cursor: pointer;
    transition: opacity var(--dur-fast) var(--ease-out);
  }

  .primary:hover {
    opacity: 0.85;
  }

  .ghost {
    background: transparent;
    color: var(--color-text-muted);
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    font-size: var(--font-size-small);
    font-family: var(--font-family-sans);
    cursor: pointer;
    transition: color var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
  }

  .ghost:hover {
    color: var(--color-text);
    border-color: var(--color-text-muted);
  }

  .toggles {
    list-style: none;
    padding: 0;
    margin: 0 0 var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .toggles label {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-small);
    color: var(--color-text);
    cursor: pointer;
  }

  .toggles input[type='checkbox']:disabled + span {
    color: var(--color-text-subtle);
  }

  .note {
    color: var(--color-text-subtle);
    font-size: var(--font-size-xs);
  }

  @media (max-width: 40rem) {
    .banner {
      left: var(--space-4);
      right: var(--space-4);
      bottom: var(--space-4);
      max-width: none;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .banner {
      animation: slide-in var(--dur-med) var(--ease-out);
    }

    @keyframes slide-in {
      from {
        transform: translateY(8px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  }
</style>
