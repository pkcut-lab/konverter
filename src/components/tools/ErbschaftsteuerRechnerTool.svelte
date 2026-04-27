<script lang="ts">
  import { parseDE } from '../../lib/tools/parse-de';
  import {
    berechneErbschaftsteuer,
    formatEuro,
    formatEuroRound,
    formatProzent,
    type Verwandtschaftsgrad,
  } from '../../lib/tools/erbschaftsteuer-rechner';
  import { t } from '../../lib/i18n/strings';
  import type { Lang } from '../../lib/i18n/lang';

  interface Props {
    lang: Lang;
  }
  let { lang }: Props = $props();
  const strings = $derived(t(lang));
  const T = $derived(strings.tools.inheritanceTaxCalculator);

  const VERWANDTSCHAFT_OPTIONS = $derived<{ value: Verwandtschaftsgrad; label: string }[]>([
    { value: 'ehepartner',                  label: T.vgEhepartner },
    { value: 'kind',                        label: T.vgKind },
    { value: 'enkel-eltern-verstorben',     label: T.vgEnkelEltVerstorben },
    { value: 'enkel-eltern-leben',          label: T.vgEnkelEltLeben },
    { value: 'eltern-grosseltern',          label: T.vgElternGroßeltern },
    { value: 'geschwister',                 label: T.vgGeschwister },
    { value: 'nichten-neffen',              label: T.vgNichtenNeffen },
    { value: 'schwiegereltern-stiefeltern', label: T.vgSchwiegerStief },
    { value: 'sonstiges',                   label: T.vgSonstiges },
  ]);

  // ---- Eingaben ----
  let verwandtschaft = $state<Verwandtschaftsgrad>('ehepartner');
  let nachlasswertStr = $state('500.000');
  let schuldenStr = $state('');
  let familienheimStr = $state('');
  let mietwohnAbschlag = $state(false);
  let mietwohnStr = $state('');
  let vorschenkungStr = $state('');
  let kindesalterStr = $state('');

  // ---- Copy-Button ----
  type CopyState = 'idle' | 'copied' | 'error';
  let copyState = $state<CopyState>('idle');
  let copyTimer: ReturnType<typeof setTimeout> | null = null;

  // ---- Parsed ----
  const nachlasswert = $derived(parseDE(nachlasswertStr));
  const schulden = $derived(schuldenStr.trim() !== '' ? parseDE(schuldenStr) : 0);
  const familienheimWert = $derived(familienheimStr.trim() !== '' ? parseDE(familienheimStr) : 0);
  const mietwohnWert = $derived(mietwohnStr.trim() !== '' ? parseDE(mietwohnStr) : 0);
  const vorschenkungen = $derived(vorschenkungStr.trim() !== '' ? parseDE(vorschenkungStr) : 0);
  const kindesalter = $derived(kindesalterStr.trim() !== '' ? parseDE(kindesalterStr) : 0);

  const isKind = $derived(verwandtschaft === 'kind');

  // ---- Validierung ----
  const nachlasswertError = $derived.by<string | null>(() => {
    if (nachlasswertStr.trim() === '') return null;
    if (!Number.isFinite(nachlasswert) || nachlasswert < 0) return T.errInvalidAmount;
    return null;
  });

  const schuldenError = $derived.by<string | null>(() => {
    if (schuldenStr.trim() === '') return null;
    if (!Number.isFinite(schulden) || schulden < 0) return T.errInvalidAmount;
    return null;
  });

  const familienheimError = $derived.by<string | null>(() => {
    if (familienheimStr.trim() === '') return null;
    if (!Number.isFinite(familienheimWert) || familienheimWert < 0) return T.errInvalidAmount;
    return null;
  });

  const mietwohnError = $derived.by<string | null>(() => {
    if (!mietwohnAbschlag || mietwohnStr.trim() === '') return null;
    if (!Number.isFinite(mietwohnWert) || mietwohnWert < 0) return T.errInvalidAmount;
    return null;
  });

  const vorschenkungError = $derived.by<string | null>(() => {
    if (vorschenkungStr.trim() === '') return null;
    if (!Number.isFinite(vorschenkungen) || vorschenkungen < 0) return T.errInvalidAmount;
    return null;
  });

  const kindesalterError = $derived.by<string | null>(() => {
    if (!isKind || kindesalterStr.trim() === '') return null;
    if (!Number.isFinite(kindesalter) || kindesalter < 0 || kindesalter > 150) return T.errInvalidAge;
    return null;
  });

  const hasErrors = $derived(
    nachlasswertError !== null ||
    schuldenError !== null ||
    familienheimError !== null ||
    mietwohnError !== null ||
    vorschenkungError !== null ||
    kindesalterError !== null,
  );

  // ---- Ergebnis ----
  const result = $derived.by(() => {
    if (hasErrors) return null;
    if (!Number.isFinite(nachlasswert) || nachlasswert < 0) return null;
    return berechneErbschaftsteuer({
      verwandtschaftsgrad: verwandtschaft,
      nachlasswert,
      schulden: Number.isFinite(schulden) ? schulden : 0,
      familienheimWert: Number.isFinite(familienheimWert) ? familienheimWert : 0,
      mietwohnAbschlag,
      mietwohnWert: Number.isFinite(mietwohnWert) ? mietwohnWert : 0,
      vorschenkungen: Number.isFinite(vorschenkungen) ? vorschenkungen : 0,
      kindesalter: Number.isFinite(kindesalter) ? kindesalter : 0,
    });
  });

  // ---- Berater-Export Copy ----
  async function copyExport() {
    if (!result) return;
    const r = result;
    const vgLabel = VERWANDTSCHAFT_OPTIONS.find((o) => o.value === verwandtschaft)?.label ?? verwandtschaft;
    const lines: string[] = [
      T.exportTitle,
      '',
      `${T.exportLabelVg}        ${vgLabel}`,
      `${T.exportLabelKlasse}               ${r.steuerklasse}`,
      `${T.exportLabelNachlass}      ${formatEuro(r.nachlasswertBrutto)} €`,
      r.schulden > 0 ? `${T.exportLabelSchulden}  −${formatEuro(r.schulden)} €` : null,
      `${T.exportLabelErbfallkosten}    −${formatEuro(r.erbfallkostenpauschale)} €`,
      `${T.exportLabelHausrat}         −${formatEuro(r.hausratPauschale)} €`,
      r.familienheimAbzug > 0 ? `${T.exportLabelFamilienheim}        −${formatEuro(r.familienheimAbzug)} €` : null,
      r.mietwohnAbzug > 0 ? `${T.exportLabelMietwohn}  −${formatEuro(r.mietwohnAbzug)} €` : null,
      `${T.exportLabelStpflVor}     ${formatEuro(r.stpflErwerbVorFreibetrag)} €`,
      `${T.exportLabelFreibetrag} −${formatEuro(r.freibetrag)} €`,
      r.versorgungsfreibetrag > 0 ? `${T.exportLabelVersorgung} −${formatEuro(r.versorgungsfreibetrag)} €` : null,
      r.vorschenkungen > 0 ? `${T.exportLabelVorschenkung}      +${formatEuro(r.vorschenkungen)} €` : null,
      `${T.exportLabelStpflNetto}      ${formatEuro(r.stpflErwerbNetto)} €`,
      '',
      `${T.exportLabelSatz}                 ${formatProzent(r.angewandterSatz)}`,
      `${T.exportLabelSteuer}            ${formatEuroRound(r.erbschaftsteuer)} €`,
      `${T.exportLabelNetto}                 ${formatEuroRound(r.nettoErbe)} €`,
      '',
      T.exportNote1,
      T.exportNote2,
    ].filter((l): l is string => l !== null);
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      copyState = 'copied';
    } catch {
      copyState = 'error';
    }
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copyState = 'idle'; }, 2500);
  }

  // ---- Reset ----
  function handleReset() {
    nachlasswertStr = '500.000';
    schuldenStr = '';
    familienheimStr = '';
    mietwohnAbschlag = false;
    mietwohnStr = '';
    vorschenkungStr = '';
    kindesalterStr = '';
    verwandtschaft = 'ehepartner';
    copyState = 'idle';
  }
</script>

<div class="erb-tool" aria-label={T.regionAria}>

  <!-- Verwandtschaftsgrad -->
  <div class="input-field input-field--full">
    <label class="input-field__label" for="inp-verwandtschaft">{T.verwandtschaftLabel}</label>
    <div class="input-field__wrap input-field__wrap--select">
      <select
        id="inp-verwandtschaft"
        class="input-field__select"
        bind:value={verwandtschaft}
        aria-label={T.verwandtschaftAria}
      >
        {#each VERWANDTSCHAFT_OPTIONS as opt (opt.value)}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
    </div>
    <p class="field-hint">
      {#if verwandtschaft === 'ehepartner'}
        {T.hintEhepartner}
      {:else if verwandtschaft === 'kind'}
        {T.hintKind}
      {:else if verwandtschaft === 'enkel-eltern-verstorben'}
        {T.hintEnkelEltVerstorben}
      {:else if verwandtschaft === 'enkel-eltern-leben'}
        {T.hintEnkelEltLeben}
      {:else if verwandtschaft === 'eltern-grosseltern'}
        {T.hintElternGroßeltern}
      {:else if verwandtschaft === 'geschwister' || verwandtschaft === 'nichten-neffen' || verwandtschaft === 'schwiegereltern-stiefeltern'}
        {T.hintKlasse2}
      {:else}
        {T.hintKlasse3}
      {/if}
    </p>
  </div>

  <!-- Kindesalter (nur bei Kind) -->
  {#if isKind}
    <div class="input-field">
      <label class="input-field__label" for="inp-alter">
        {T.kindesalterLabel}
        <span class="default-badge">{T.kindesalterBadge}</span>
      </label>
      <div class="input-field__wrap" class:input-field__wrap--error={kindesalterError !== null}>
        <input
          id="inp-alter"
          type="text"
          inputmode="numeric"
          class="input-field__input"
          placeholder={T.kindesalterPlaceholder}
          bind:value={kindesalterStr}
          aria-label={T.kindesalterAria}
          aria-invalid={kindesalterError !== null}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">{T.unitYears}</span>
      </div>
      {#if kindesalterError}
        <p class="field-error" role="alert">{kindesalterError}</p>
      {/if}
    </div>
  {/if}

  <!-- Nachlasswert -->
  <div class="inputs-grid">
    <div class="input-field">
      <label class="input-field__label" for="inp-nachlasswert">{T.nachlasswertLabel}</label>
      <div class="input-field__wrap" class:input-field__wrap--error={nachlasswertError !== null}>
        <input
          id="inp-nachlasswert"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder={T.nachlasswertPlaceholder}
          bind:value={nachlasswertStr}
          aria-label={T.nachlasswertAria}
          aria-invalid={nachlasswertError !== null}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">€</span>
      </div>
      {#if nachlasswertError}
        <p class="field-error" role="alert">{nachlasswertError}</p>
      {/if}
    </div>

    <div class="input-field">
      <label class="input-field__label" for="inp-schulden">
        {T.schuldenLabel}
        <span class="default-badge">{T.optionalBadge}</span>
      </label>
      <div class="input-field__wrap" class:input-field__wrap--error={schuldenError !== null}>
        <input
          id="inp-schulden"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder={T.schuldenPlaceholder}
          bind:value={schuldenStr}
          aria-label={T.schuldenAria}
          aria-invalid={schuldenError !== null}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">€</span>
      </div>
      {#if schuldenError}
        <p class="field-error" role="alert">{schuldenError}</p>
      {/if}
    </div>

    <!-- §13 Familienheim -->
    <div class="input-field">
      <label class="input-field__label" for="inp-familienheim">
        {T.familienheimLabel}
        <span class="default-badge">{T.optionalBadge}</span>
      </label>
      <div class="input-field__wrap" class:input-field__wrap--error={familienheimError !== null}>
        <input
          id="inp-familienheim"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder={T.familienheimPlaceholder}
          bind:value={familienheimStr}
          aria-label={T.familienheimAria}
          aria-invalid={familienheimError !== null}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">€</span>
      </div>
      {#if familienheimError}
        <p class="field-error" role="alert">{familienheimError}</p>
      {/if}
    </div>

    <!-- §14 Vorschenkungen -->
    <div class="input-field">
      <label class="input-field__label" for="inp-vorschenk">
        {T.vorschenkungLabel}
        <span class="default-badge">{T.optionalBadge}</span>
      </label>
      <div class="input-field__wrap" class:input-field__wrap--error={vorschenkungError !== null}>
        <input
          id="inp-vorschenk"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder={T.vorschenkungPlaceholder}
          bind:value={vorschenkungStr}
          aria-label={T.vorschenkungAria}
          aria-invalid={vorschenkungError !== null}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">€</span>
      </div>
      {#if vorschenkungError}
        <p class="field-error" role="alert">{vorschenkungError}</p>
      {/if}
    </div>
  </div>

  <!-- §13d Mietwohnimmobilien-Abschlag -->
  <div class="checkbox-row">
    <label class="checkbox-label">
      <input
        type="checkbox"
        class="checkbox-input"
        bind:checked={mietwohnAbschlag}
        aria-label={T.mietwohnCheckboxAria}
      />
      <span class="checkbox-text">
        {T.mietwohnCheckboxText}
      </span>
    </label>
  </div>

  {#if mietwohnAbschlag}
    <div class="input-field">
      <label class="input-field__label" for="inp-mietwohn">
        {T.mietwohnLabel}
      </label>
      <div class="input-field__wrap" class:input-field__wrap--error={mietwohnError !== null}>
        <input
          id="inp-mietwohn"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder={T.mietwohnPlaceholder}
          bind:value={mietwohnStr}
          aria-label={T.mietwohnAria}
          aria-invalid={mietwohnError !== null}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">€</span>
      </div>
      {#if mietwohnError}
        <p class="field-error" role="alert">{mietwohnError}</p>
      {/if}
    </div>
  {/if}

  <!-- Ergebnis -->
  {#if result}
    <div class="result-section" aria-live="polite" aria-label={T.resultsAria}>

      <!-- Haupt-Kacheln -->
      <div class="result-kacheln">
        <div class="kachel kachel--primary">
          <span class="kachel__label">{T.kachelSteuer}</span>
          <span class="kachel__value">{formatEuroRound(result.erbschaftsteuer)}&nbsp;€</span>
          <span class="kachel__sub">{T.kachelSteuerSubTemplate.replace('{satz}', formatProzent(result.angewandterSatz))}</span>
        </div>
        <div class="kachel">
          <span class="kachel__label">{T.kachelNetto}</span>
          <span class="kachel__value">{formatEuroRound(result.nettoErbe)}&nbsp;€</span>
          <span class="kachel__sub">{T.kachelNettoSub}</span>
        </div>
        <div class="kachel">
          <span class="kachel__label">{T.kachelKlasse}</span>
          <span class="kachel__value">
            {#if result.steuerklasse === 1}I{:else if result.steuerklasse === 2}II{:else}III{/if}
          </span>
          <span class="kachel__sub">{T.kachelKlasseSub}</span>
        </div>
      </div>

      <!-- Aufschlüsselung -->
      <div class="aufschluesselung" aria-label={T.aufschluesselungAria}>
        <div class="aufschluesselung__title">{T.aufTitle}</div>
        <dl class="aufschluesselung__list">
          <div class="aufschluesselung__row">
            <dt>{T.rowNachlassBrutto}</dt>
            <dd>{formatEuro(result.nachlasswertBrutto)}&nbsp;€</dd>
          </div>
          {#if result.schulden > 0}
            <div class="aufschluesselung__row aufschluesselung__row--abzug">
              <dt>{T.rowSchulden}</dt>
              <dd>−{formatEuro(result.schulden)}&nbsp;€</dd>
            </div>
          {/if}
          <div class="aufschluesselung__row aufschluesselung__row--abzug">
            <dt>{T.rowErbfallkosten}</dt>
            <dd>−{formatEuro(result.erbfallkostenpauschale)}&nbsp;€</dd>
          </div>
          <div class="aufschluesselung__row aufschluesselung__row--abzug">
            <dt>{T.rowHausrat}</dt>
            <dd>−{formatEuro(result.hausratPauschale)}&nbsp;€</dd>
          </div>
          {#if result.familienheimAbzug > 0}
            <div class="aufschluesselung__row aufschluesselung__row--abzug">
              <dt>{T.rowFamilienheim}</dt>
              <dd>−{formatEuro(result.familienheimAbzug)}&nbsp;€</dd>
            </div>
          {/if}
          {#if result.mietwohnAbzug > 0}
            <div class="aufschluesselung__row aufschluesselung__row--abzug">
              <dt>{T.rowMietwohnAbzug}</dt>
              <dd>−{formatEuro(result.mietwohnAbzug)}&nbsp;€</dd>
            </div>
          {/if}
          <div class="aufschluesselung__row aufschluesselung__row--subtotal">
            <dt>{T.rowSubtotal}</dt>
            <dd>{formatEuro(result.stpflErwerbVorFreibetrag)}&nbsp;€</dd>
          </div>
          <div class="aufschluesselung__row aufschluesselung__row--abzug">
            <dt>{T.rowFreibetrag}</dt>
            <dd>−{formatEuro(result.freibetrag)}&nbsp;€</dd>
          </div>
          {#if result.versorgungsfreibetrag > 0}
            <div class="aufschluesselung__row aufschluesselung__row--abzug">
              <dt>{T.rowVersorgungsfreibetrag}</dt>
              <dd>−{formatEuro(result.versorgungsfreibetrag)}&nbsp;€</dd>
            </div>
          {/if}
          {#if result.vorschenkungen > 0}
            <div class="aufschluesselung__row aufschluesselung__row--addition">
              <dt>{T.rowVorschenkungen}</dt>
              <dd>+{formatEuro(result.vorschenkungen)}&nbsp;€</dd>
            </div>
          {/if}
          <div class="aufschluesselung__row aufschluesselung__row--total">
            <dt>{T.rowTotal}</dt>
            <dd>{formatEuro(result.stpflErwerbNetto)}&nbsp;€</dd>
          </div>
        </dl>
      </div>

      <!-- Disclaimer -->
      <p class="disclaimer">
        {T.disclaimer}
      </p>

      <!-- Aktionen -->
      <div class="actions">
        <button
          type="button"
          class="btn-copy"
          class:btn-copy--copied={copyState === 'copied'}
          class:btn-copy--error={copyState === 'error'}
          onclick={copyExport}
          aria-label={T.copyAria}
        >
          {#if copyState === 'copied'}
            {strings.toolsCommon.copied}
          {:else if copyState === 'error'}
            {T.copyError}
          {:else}
            {T.copyButton}
          {/if}
        </button>
        <button
          type="button"
          class="btn-reset"
          onclick={handleReset}
          aria-label={T.resetAria}
        >
          {strings.toolsCommon.reset}
        </button>
      </div>
    </div>
  {/if}

</div>

<style>
  .erb-tool {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  /* ---- Input Fields ---- */
  .inputs-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }

  @media (max-width: 32rem) {
    .inputs-grid {
      grid-template-columns: 1fr;
    }
  }

  .input-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .input-field--full {
    grid-column: 1 / -1;
  }

  .input-field__label {
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text);
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .input-field__wrap {
    display: flex;
    align-items: center;
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
    transition: border-color var(--dur-fast) var(--ease-out);
    overflow: hidden;
  }

  .input-field__wrap:focus-within {
    border-color: var(--color-accent);
    outline: 2px solid color-mix(in oklch, var(--color-accent) 20%, transparent);
    outline-offset: 1px;
  }

  .input-field__wrap--error {
    border-color: var(--color-error);
  }

  .input-field__wrap--select {
    padding: 0;
  }

  .input-field__input {
    flex: 1;
    border: none;
    background: transparent;
    padding: var(--space-3) var(--space-4);
    font-size: 0.9375rem;
    font-family: var(--font-family-mono);
    color: var(--color-text);
    min-width: 0;
  }

  .input-field__input:focus {
    outline: none;
  }

  .input-field__select {
    flex: 1;
    border: none;
    background: transparent;
    padding: var(--space-3) var(--space-4);
    font-size: 0.9375rem;
    color: var(--color-text);
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right var(--space-3) center;
    padding-right: var(--space-9);
    min-width: 0;
  }

  .input-field__select:focus {
    outline: none;
  }

  .input-field__unit {
    padding: 0 var(--space-3) 0 0;
    font-size: var(--font-size-small);
    font-family: var(--font-family-mono);
    color: var(--color-text-subtle);
    white-space: nowrap;
  }

  .field-hint {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    margin: 0;
    line-height: 1.4;
  }

  .field-error {
    font-size: var(--font-size-small);
    color: var(--color-error);
    margin: 0;
  }

  .default-badge {
    font-size: var(--font-size-xs);
    font-weight: 400;
    color: var(--color-text-subtle);
    font-family: var(--font-family-mono);
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  /* ---- Checkbox ---- */
  .checkbox-row {
    display: flex;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    cursor: pointer;
  }

  .checkbox-input {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
    accent-color: var(--color-accent);
    cursor: pointer;
  }

  .checkbox-text {
    font-size: var(--font-size-small);
    color: var(--color-text);
    line-height: 1.4;
  }

  /* ---- Result ---- */
  .result-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    padding-top: var(--space-5);
    border-top: 1px solid var(--color-border);
    animation: result-fade-in var(--dur-fast) var(--ease-out);
  }

  @keyframes result-fade-in {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Kacheln */
  .result-kacheln {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-3);
  }

  @media (max-width: 28rem) {
    .result-kacheln {
      grid-template-columns: 1fr;
    }
  }

  .kachel {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-4) var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
  }

  .kachel--primary {
    border-color: var(--color-accent);
    background: color-mix(in oklch, var(--color-accent) 6%, var(--color-surface));
  }

  .kachel__label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
  }

  .kachel__value {
    font-size: 1.375rem;
    font-weight: 600;
    color: var(--color-text);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.01em;
    line-height: 1.2;
  }

  .kachel--primary .kachel__value {
    color: var(--color-accent);
  }

  .kachel__sub {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    font-family: var(--font-family-mono);
  }

  /* Aufschlüsselung */
  .aufschluesselung {
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    overflow: hidden;
  }

  .aufschluesselung__title {
    padding: var(--space-3) var(--space-4);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-xs);
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
  }

  .aufschluesselung__list {
    margin: 0;
    padding: var(--space-2) 0;
    background: var(--color-bg);
  }

  .aufschluesselung__row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: var(--space-1) var(--space-4);
    gap: var(--space-4);
  }

  .aufschluesselung__row dt {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
  }

  .aufschluesselung__row dd {
    font-size: var(--font-size-small);
    font-family: var(--font-family-mono);
    color: var(--color-text);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .aufschluesselung__row--abzug dd {
    color: var(--color-error);
  }

  .aufschluesselung__row--addition dd {
    color: var(--color-text-muted);
  }

  .aufschluesselung__row--subtotal {
    border-top: 1px solid var(--color-border);
    margin-top: var(--space-1);
    padding-top: var(--space-2);
  }

  .aufschluesselung__row--subtotal dt,
  .aufschluesselung__row--subtotal dd {
    color: var(--color-text);
    font-weight: 500;
  }

  .aufschluesselung__row--total {
    border-top: 1px solid var(--color-border);
    margin-top: var(--space-1);
    padding-top: var(--space-2);
  }

  .aufschluesselung__row--total dt,
  .aufschluesselung__row--total dd {
    color: var(--color-text);
    font-weight: 600;
    font-size: 0.875rem;
  }

  /* Disclaimer */
  .disclaimer {
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
    line-height: 1.5;
    margin: 0;
    padding: var(--space-3) var(--space-4);
    background: color-mix(in oklch, var(--color-text-subtle) 6%, transparent);
    border-radius: var(--r-md);
    border: 1px solid var(--color-border);
  }

  /* Aktionen */
  .actions {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .btn-copy,
  .btn-reset {
    display: inline-flex;
    align-items: center;
    padding: var(--space-2) var(--space-4);
    border-radius: var(--r-md);
    font-size: var(--font-size-small);
    font-weight: 500;
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
    border: 1px solid var(--color-border);
  }

  .btn-copy {
    background: var(--color-text);
    color: var(--color-bg);
    border-color: var(--color-text);
  }

  .btn-copy:hover {
    opacity: 0.88;
  }

  .btn-copy--copied {
    background: var(--color-success);
    border-color: var(--color-success);
    color: var(--color-bg);
  }

  .btn-copy--error {
    background: var(--color-error);
    border-color: var(--color-error);
    color: var(--color-bg);
  }

  .btn-reset {
    background: transparent;
    color: var(--color-text-muted);
  }

  .btn-reset:hover {
    background: var(--color-surface);
    color: var(--color-text);
  }

  .btn-copy:focus-visible,
  .btn-reset:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .result-section {
      animation: none;
    }
    .input-field,
    .btn-copy,
    .btn-reset {
      transition: none;
    }
  }
</style>
