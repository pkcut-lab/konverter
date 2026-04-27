<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
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
    config: FormatterConfig;
    lang: Lang;
  }
  let { config, lang }: Props = $props();
  void config;
  const strings = $derived(t(lang));

  const VERWANDTSCHAFT_OPTIONS: { value: Verwandtschaftsgrad; label: string }[] = [
    { value: 'ehepartner',                  label: 'Ehepartner / Lebenspartner' },
    { value: 'kind',                        label: 'Kind (unter 28 Jahre)' },
    { value: 'enkel-eltern-verstorben',     label: 'Enkel (Eltern verstorben)' },
    { value: 'enkel-eltern-leben',          label: 'Enkel (Eltern leben)' },
    { value: 'eltern-grosseltern',          label: 'Eltern / Großeltern' },
    { value: 'geschwister',                 label: 'Geschwister' },
    { value: 'nichten-neffen',              label: 'Nichten / Neffen' },
    { value: 'schwiegereltern-stiefeltern', label: 'Schwiegereltern / Stiefeltern' },
    { value: 'sonstiges',                   label: 'Nicht verwandt' },
  ];

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
    if (!Number.isFinite(nachlasswert) || nachlasswert < 0) return 'Bitte einen gültigen Betrag eingeben.';
    return null;
  });

  const schuldenError = $derived.by<string | null>(() => {
    if (schuldenStr.trim() === '') return null;
    if (!Number.isFinite(schulden) || schulden < 0) return 'Bitte einen gültigen Betrag eingeben.';
    return null;
  });

  const familienheimError = $derived.by<string | null>(() => {
    if (familienheimStr.trim() === '') return null;
    if (!Number.isFinite(familienheimWert) || familienheimWert < 0) return 'Bitte einen gültigen Betrag eingeben.';
    return null;
  });

  const mietwohnError = $derived.by<string | null>(() => {
    if (!mietwohnAbschlag || mietwohnStr.trim() === '') return null;
    if (!Number.isFinite(mietwohnWert) || mietwohnWert < 0) return 'Bitte einen gültigen Betrag eingeben.';
    return null;
  });

  const vorschenkungError = $derived.by<string | null>(() => {
    if (vorschenkungStr.trim() === '') return null;
    if (!Number.isFinite(vorschenkungen) || vorschenkungen < 0) return 'Bitte einen gültigen Betrag eingeben.';
    return null;
  });

  const kindesalterError = $derived.by<string | null>(() => {
    if (!isKind || kindesalterStr.trim() === '') return null;
    if (!Number.isFinite(kindesalter) || kindesalter < 0 || kindesalter > 150) return 'Bitte ein gültiges Alter eingeben (0–150).';
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
      '=== Erbschaftsteuer-Berechnung (kittokit.com) ===',
      '',
      `Verwandtschaftsgrad:        ${vgLabel}`,
      `Steuerklasse:               ${r.steuerklasse}`,
      `Nachlasswert (brutto):      ${formatEuro(r.nachlasswertBrutto)} €`,
      r.schulden > 0 ? `Schulden / Verbindlichk.:  −${formatEuro(r.schulden)} €` : null,
      `Erbfallkostenpauschale:    −${formatEuro(r.erbfallkostenpauschale)} €`,
      `Hausrat-Pauschale:         −${formatEuro(r.hausratPauschale)} €`,
      r.familienheimAbzug > 0 ? `Familienheim (§13):        −${formatEuro(r.familienheimAbzug)} €` : null,
      r.mietwohnAbzug > 0 ? `Mietwohn-Abschlag (§13d):  −${formatEuro(r.mietwohnAbzug)} €` : null,
      `Stpfl. Erwerb (vor FB):     ${formatEuro(r.stpflErwerbVorFreibetrag)} €`,
      `Persönl. Freibetrag (§16): −${formatEuro(r.freibetrag)} €`,
      r.versorgungsfreibetrag > 0 ? `Versorgungsfreibetrag §17: −${formatEuro(r.versorgungsfreibetrag)} €` : null,
      r.vorschenkungen > 0 ? `Vorschenkungen (§14):      +${formatEuro(r.vorschenkungen)} €` : null,
      `Stpfl. Erwerb (netto):      ${formatEuro(r.stpflErwerbNetto)} €`,
      '',
      `Steuersatz:                 ${formatProzent(r.angewandterSatz)}`,
      `ERBSCHAFTSTEUER:            ${formatEuroRound(r.erbschaftsteuer)} €`,
      `Netto-Erbe:                 ${formatEuroRound(r.nettoErbe)} €`,
      '',
      'Hinweis: Diese Berechnung dient nur als erste Orientierung.',
      'Betriebsvermögen, internationale Erbschaften und Vorerbschaft',
      'erfordern Fachberatung (§§ 13a, 13b ErbStG, DBA).',
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

<div class="erb-tool" aria-label="Erbschaftsteuer-Rechner">

  <!-- Verwandtschaftsgrad -->
  <div class="input-field input-field--full">
    <label class="input-field__label" for="inp-verwandtschaft">Verwandtschaftsgrad</label>
    <div class="input-field__wrap input-field__wrap--select">
      <select
        id="inp-verwandtschaft"
        class="input-field__select"
        bind:value={verwandtschaft}
        aria-label="Verwandtschaftsgrad zum Erblasser"
      >
        {#each VERWANDTSCHAFT_OPTIONS as opt (opt.value)}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
    </div>
    <p class="field-hint">
      {#if verwandtschaft === 'ehepartner'}
        Steuerklasse I · Freibetrag 500.000&nbsp;€ · Versorgungsfreibetrag 256.000&nbsp;€
      {:else if verwandtschaft === 'kind'}
        Steuerklasse I · Freibetrag 400.000&nbsp;€ · Versorgungsfreibetrag altersabhängig
      {:else if verwandtschaft === 'enkel-eltern-verstorben'}
        Steuerklasse I · Freibetrag 400.000&nbsp;€
      {:else if verwandtschaft === 'enkel-eltern-leben'}
        Steuerklasse I · Freibetrag 200.000&nbsp;€
      {:else if verwandtschaft === 'eltern-grosseltern'}
        Steuerklasse I · Freibetrag 100.000&nbsp;€
      {:else if verwandtschaft === 'geschwister' || verwandtschaft === 'nichten-neffen' || verwandtschaft === 'schwiegereltern-stiefeltern'}
        Steuerklasse II · Freibetrag 20.000&nbsp;€
      {:else}
        Steuerklasse III · Freibetrag 20.000&nbsp;€
      {/if}
    </p>
  </div>

  <!-- Kindesalter (nur bei Kind) -->
  {#if isKind}
    <div class="input-field">
      <label class="input-field__label" for="inp-alter">
        Alter des Kindes
        <span class="default-badge">für Versorgungsfreibetrag</span>
      </label>
      <div class="input-field__wrap" class:input-field__wrap--error={kindesalterError !== null}>
        <input
          id="inp-alter"
          type="text"
          inputmode="numeric"
          class="input-field__input"
          placeholder="z.B. 12"
          bind:value={kindesalterStr}
          aria-label="Alter des Kindes in Jahren"
          aria-invalid={kindesalterError !== null}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">Jahre</span>
      </div>
      {#if kindesalterError}
        <p class="field-error" role="alert">{kindesalterError}</p>
      {/if}
    </div>
  {/if}

  <!-- Nachlasswert -->
  <div class="inputs-grid">
    <div class="input-field">
      <label class="input-field__label" for="inp-nachlasswert">Nachlasswert (brutto)</label>
      <div class="input-field__wrap" class:input-field__wrap--error={nachlasswertError !== null}>
        <input
          id="inp-nachlasswert"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder="z.B. 500.000"
          bind:value={nachlasswertStr}
          aria-label="Gesamter Nachlasswert in Euro"
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
        Schulden / Verbindlichkeiten
        <span class="default-badge">optional</span>
      </label>
      <div class="input-field__wrap" class:input-field__wrap--error={schuldenError !== null}>
        <input
          id="inp-schulden"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder="z.B. 50.000"
          bind:value={schuldenStr}
          aria-label="Schulden und Verbindlichkeiten des Nachlasses in Euro"
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
        Familienheim-Wert (§13 befreit)
        <span class="default-badge">optional</span>
      </label>
      <div class="input-field__wrap" class:input-field__wrap--error={familienheimError !== null}>
        <input
          id="inp-familienheim"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder="z.B. 300.000"
          bind:value={familienheimStr}
          aria-label="Wert des selbstgenutzten Familienheims in Euro (§13 ErbStG vollständig steuerfrei)"
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
        Vorschenkungen (letzte 10 Jahre, §14)
        <span class="default-badge">optional</span>
      </label>
      <div class="input-field__wrap" class:input-field__wrap--error={vorschenkungError !== null}>
        <input
          id="inp-vorschenk"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder="z.B. 100.000"
          bind:value={vorschenkungStr}
          aria-label="Wert der erhaltenen Schenkungen der letzten 10 Jahre in Euro"
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
        aria-label="10%-Abschlag auf Mietwohngrundstücke nach §13d ErbStG anwenden"
      />
      <span class="checkbox-text">
        10&nbsp;%-Abschlag Mietwohngrundstück (§13d ErbStG, ab 2023)
      </span>
    </label>
  </div>

  {#if mietwohnAbschlag}
    <div class="input-field">
      <label class="input-field__label" for="inp-mietwohn">
        Wert der Mietwohnimmobilie
      </label>
      <div class="input-field__wrap" class:input-field__wrap--error={mietwohnError !== null}>
        <input
          id="inp-mietwohn"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder="z.B. 400.000"
          bind:value={mietwohnStr}
          aria-label="Wert der Mietwohnimmobilie in Euro"
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
    <div class="result-section" aria-live="polite" aria-label="Berechnungsergebnis">

      <!-- Haupt-Kacheln -->
      <div class="result-kacheln">
        <div class="kachel kachel--primary">
          <span class="kachel__label">Erbschaftsteuer</span>
          <span class="kachel__value">{formatEuroRound(result.erbschaftsteuer)}&nbsp;€</span>
          <span class="kachel__sub">Steuersatz {formatProzent(result.angewandterSatz)}</span>
        </div>
        <div class="kachel">
          <span class="kachel__label">Netto-Erbe</span>
          <span class="kachel__value">{formatEuroRound(result.nettoErbe)}&nbsp;€</span>
          <span class="kachel__sub">nach Steuer</span>
        </div>
        <div class="kachel">
          <span class="kachel__label">Steuerklasse</span>
          <span class="kachel__value">
            {#if result.steuerklasse === 1}I{:else if result.steuerklasse === 2}II{:else}III{/if}
          </span>
          <span class="kachel__sub">§15 ErbStG</span>
        </div>
      </div>

      <!-- Aufschlüsselung -->
      <div class="aufschluesselung" aria-label="Berechnungsaufschlüsselung">
        <div class="aufschluesselung__title">Berechnungsweg</div>
        <dl class="aufschluesselung__list">
          <div class="aufschluesselung__row">
            <dt>Nachlasswert (brutto)</dt>
            <dd>{formatEuro(result.nachlasswertBrutto)}&nbsp;€</dd>
          </div>
          {#if result.schulden > 0}
            <div class="aufschluesselung__row aufschluesselung__row--abzug">
              <dt>Schulden / Verbindlichk.</dt>
              <dd>−{formatEuro(result.schulden)}&nbsp;€</dd>
            </div>
          {/if}
          <div class="aufschluesselung__row aufschluesselung__row--abzug">
            <dt>Erbfallkosten-Pauschale (§10 Abs. 5)</dt>
            <dd>−{formatEuro(result.erbfallkostenpauschale)}&nbsp;€</dd>
          </div>
          <div class="aufschluesselung__row aufschluesselung__row--abzug">
            <dt>Hausrat-Pauschale (§13 Abs. 1 Nr. 1)</dt>
            <dd>−{formatEuro(result.hausratPauschale)}&nbsp;€</dd>
          </div>
          {#if result.familienheimAbzug > 0}
            <div class="aufschluesselung__row aufschluesselung__row--abzug">
              <dt>Familienheim steuerfrei (§13)</dt>
              <dd>−{formatEuro(result.familienheimAbzug)}&nbsp;€</dd>
            </div>
          {/if}
          {#if result.mietwohnAbzug > 0}
            <div class="aufschluesselung__row aufschluesselung__row--abzug">
              <dt>10&nbsp;%-Abschlag Mietwohng. (§13d)</dt>
              <dd>−{formatEuro(result.mietwohnAbzug)}&nbsp;€</dd>
            </div>
          {/if}
          <div class="aufschluesselung__row aufschluesselung__row--subtotal">
            <dt>Stpfl. Erwerb (vor Freibetrag)</dt>
            <dd>{formatEuro(result.stpflErwerbVorFreibetrag)}&nbsp;€</dd>
          </div>
          <div class="aufschluesselung__row aufschluesselung__row--abzug">
            <dt>Persönl. Freibetrag (§16)</dt>
            <dd>−{formatEuro(result.freibetrag)}&nbsp;€</dd>
          </div>
          {#if result.versorgungsfreibetrag > 0}
            <div class="aufschluesselung__row aufschluesselung__row--abzug">
              <dt>Versorgungsfreibetrag (§17)</dt>
              <dd>−{formatEuro(result.versorgungsfreibetrag)}&nbsp;€</dd>
            </div>
          {/if}
          {#if result.vorschenkungen > 0}
            <div class="aufschluesselung__row aufschluesselung__row--addition">
              <dt>Vorschenkungen §14 (10 J.)</dt>
              <dd>+{formatEuro(result.vorschenkungen)}&nbsp;€</dd>
            </div>
          {/if}
          <div class="aufschluesselung__row aufschluesselung__row--total">
            <dt>Stpfl. Erwerb (netto)</dt>
            <dd>{formatEuro(result.stpflErwerbNetto)}&nbsp;€</dd>
          </div>
        </dl>
      </div>

      <!-- Disclaimer -->
      <p class="disclaimer">
        Betriebsvermögen (§§&nbsp;13a/13b ErbStG), internationale Erbschaften sowie Vor-/Nacherbschaft
        erfordern individuelle Fachberatung. Diese Berechnung ist eine erste Orientierung, kein Rechtsgutachten.
        BVerfG-Entscheidung zu Betriebsvermögen-Verschonung steht noch aus.
      </p>

      <!-- Aktionen -->
      <div class="actions">
        <button
          type="button"
          class="btn-copy"
          class:btn-copy--copied={copyState === 'copied'}
          class:btn-copy--error={copyState === 'error'}
          onclick={copyExport}
          aria-label="Ergebnis als Text für Steuerberater kopieren"
        >
          {#if copyState === 'copied'}
            {strings.toolsCommon.copied}
          {:else if copyState === 'error'}
            Fehler
          {:else}
            Ergebnis für Berater kopieren
          {/if}
        </button>
        <button
          type="button"
          class="btn-reset"
          onclick={handleReset}
          aria-label="Alle Eingaben zurücksetzen"
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
