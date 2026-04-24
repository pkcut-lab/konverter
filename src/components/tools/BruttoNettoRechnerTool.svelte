<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import { parseDE } from '../../lib/tools/parse-de';
  import {
    formatEuro,
    berechne,
    kirchensteuerSatz,
    isSachsen,
  } from '../../lib/tools/brutto-netto-rechner';
  import type { Steuerklasse, Beschaeftigungsart } from '../../lib/tools/brutto-netto-rechner';

  interface Props {
    config: FormatterConfig;
  }
  let { config }: Props = $props();
  void config;

  const SK_OPTIONS: { value: string; label: string }[] = [
    { value: '1', label: 'I — Ledig / verwitwet / getrennt' },
    { value: '2', label: 'II — Alleinerziehend' },
    { value: '3', label: 'III — Ehegatte Besserverdiener' },
    { value: '4', label: 'IV — Ehegatte gleiches Einkommen' },
    { value: '5', label: 'V — Ehegatte Geringverdiener' },
    { value: '6', label: 'VI — Zweites Dienstverhältnis' },
  ];

  const BUNDESLAENDER = [
    { id: 'BW', label: 'Baden-Württemberg (KiSt 8 %)' },
    { id: 'BY', label: 'Bayern (KiSt 8 %)' },
    { id: 'BE', label: 'Berlin' },
    { id: 'BB', label: 'Brandenburg' },
    { id: 'HB', label: 'Bremen' },
    { id: 'HH', label: 'Hamburg' },
    { id: 'HE', label: 'Hessen' },
    { id: 'MV', label: 'Mecklenburg-Vorpommern' },
    { id: 'NI', label: 'Niedersachsen' },
    { id: 'NW', label: 'Nordrhein-Westfalen' },
    { id: 'RP', label: 'Rheinland-Pfalz' },
    { id: 'SL', label: 'Saarland' },
    { id: 'SN', label: 'Sachsen (PV-Sonderregel)' },
    { id: 'ST', label: 'Sachsen-Anhalt' },
    { id: 'SH', label: 'Schleswig-Holstein' },
    { id: 'TH', label: 'Thüringen' },
  ] as const;

  // ---- Eingaben ----
  let beschaeftigungsart = $state<Beschaeftigungsart>('vollzeit');
  let bruttoStr = $state('3.500');
  let steuerklasseStr = $state('1');
  let bundesland = $state('NW');
  let kirchensteuer = $state(false);
  let kinderlos = $state(false);
  let pkv = $state(false);
  let pkvBeitragStr = $state('');

  // ---- Geparste Werte ----
  const brutto = $derived(parseDE(bruttoStr));
  const steuerklasse = $derived<Steuerklasse>(
    parseInt(steuerklasseStr, 10) as Steuerklasse,
  );
  const pkvBeitrag = $derived(
    pkv && pkvBeitragStr.trim() !== '' ? parseDE(pkvBeitragStr) : 0,
  );

  // ---- Validierung ----
  const bruttoError = $derived.by<string | null>(() => {
    if (bruttoStr.trim() === '') return null;
    if (!Number.isFinite(brutto) || brutto < 0) return 'Bitte einen gültigen Betrag eingeben.';
    if (brutto > 100_000) return 'Maximalbetrag: 100.000 €';
    return null;
  });

  const pkvError = $derived.by<string | null>(() => {
    if (!pkv || pkvBeitragStr.trim() === '') return null;
    if (!Number.isFinite(pkvBeitrag) || pkvBeitrag < 0) return 'Bitte einen gültigen PKV-Beitrag eingeben.';
    return null;
  });

  // ---- Berechnung ----
  const result = $derived.by(() => {
    if (bruttoStr.trim() === '') return null;
    if (!Number.isFinite(brutto) || brutto < 0) return null;
    if (pkv && pkvBeitragStr.trim() !== '' && (!Number.isFinite(pkvBeitrag) || pkvBeitrag < 0)) return null;
    return berechne({
      brutto,
      steuerklasse,
      bundesland,
      kirchensteuer,
      beschaeftigungsart,
      pkv,
      pkvBeitragMonatlich: pkv ? (Number.isFinite(pkvBeitrag) ? pkvBeitrag : 0) : 0,
      kinderlos,
    });
  });

  const isMinijob = $derived(result !== null && result.warnungen.includes('minijob'));
  const isMidijob = $derived(result !== null && result.warnungen.includes('midijob'));

  // ---- Transparenz-Layer: Formeltext pro Abzugsposten ----
  const formulaRV = $derived.by<string>(() => {
    if (!result || !Number.isFinite(brutto)) return '';
    if (isMinijob) return 'Minijob\u00a0— AN-Beitrag entfällt';
    const bbg = Math.min(brutto, 8450);
    const midijobHint = isMidijob ? '\u00a0(Midijob-Basis)' : '';
    return `9,30\u00a0%\u00a0\u00d7\u00a0${formatEuro(bbg)}\u00a0€${midijobHint}\u00a0(BBG: 8.450\u00a0€)`;
  });

  const formulaKV = $derived.by<string>(() => {
    if (!result || !Number.isFinite(brutto)) return '';
    if (isMinijob) return 'Minijob\u00a0— AN-Beitrag entfällt';
    if (pkv) {
      const shown = pkvBeitragStr.trim() !== '' ? formatEuro(pkvBeitrag) : '0,00';
      return `Private KV\u00a0— eingegebener Beitrag: ${shown}\u00a0€`;
    }
    const bbg = Math.min(brutto, 5812.5);
    return `8,025\u00a0%\u00a0\u00d7\u00a0${formatEuro(bbg)}\u00a0€\u00a0(7,30\u00a0%\u00a0+\u00a0\u00bd\u00a0\u00d7\u00a01,45\u00a0%, BBG: 5.812,50\u00a0€)`;
  });

  const formulaPV = $derived.by<string>(() => {
    if (!result || !Number.isFinite(brutto)) return '';
    if (isMinijob) return 'Minijob\u00a0— AN-Beitrag entfällt';
    const bbg = Math.min(brutto, 5812.5);
    if (isSachsen(bundesland)) {
      return `2,30\u00a0%\u00a0\u00d7\u00a0${formatEuro(bbg)}\u00a0€\u00a0(Sachsen-Sonderregel, BBG: 5.812,50\u00a0€)`;
    }
    const rate = kinderlos ? '2,40' : '1,80';
    const label = kinderlos ? 'kinderlos\u00a0\u226523' : 'mit\u00a0Kind';
    return `${rate}\u00a0%\u00a0\u00d7\u00a0${formatEuro(bbg)}\u00a0€\u00a0(${label}, BBG: 5.812,50\u00a0€)`;
  });

  const formulaAV = $derived.by<string>(() => {
    if (!result || !Number.isFinite(brutto)) return '';
    if (isMinijob) return 'Minijob\u00a0— AN-Beitrag entfällt';
    const bbg = Math.min(brutto, 8450);
    const midijobHint = isMidijob ? '\u00a0(Midijob-Basis)' : '';
    return `1,30\u00a0%\u00a0\u00d7\u00a0${formatEuro(bbg)}\u00a0€${midijobHint}\u00a0(BBG: 8.450\u00a0€)`;
  });

  const formulaLSt = $derived.by<string>(() => {
    if (!result || !Number.isFinite(brutto)) return '';
    if (isMinijob) return 'Minijob\u00a0— pauschal durch AG oder keine Lohnsteuer';
    return `Steuerklasse\u00a0${steuerklasse}\u00a0\u00b7\u00a0§\u00a032a EStG 2026\u00a0(Jahrestarif\u00a0\u00f712, vereinfacht)`;
  });

  const formulaSoli = $derived.by<string>(() => {
    if (!result) return '';
    if (isMinijob || result.soli === 0) {
      return 'Freigrenze: Jahres-LSt\u00a0\u2264\u00a018.130\u00a0€\u00a0\u2192\u00a0kein Soli';
    }
    return `5,5\u00a0%\u00a0\u00d7\u00a0LSt\u00a0(Gleitzone: 11,9\u00a0%\u00a0\u00d7\u00a0(LSt\u00a0\u2212\u00a0Freigrenze), gedeckelt)`;
  });

  const formulaKiSt = $derived.by<string>(() => {
    if (!kirchensteuer) return 'Nicht aktiviert\u00a0— abwählen spart diesen Abzug';
    if (!result || result.lohnsteuer === 0) {
      return 'Lohnsteuer\u00a00\u00a0€\u00a0\u2192\u00a0Kirchensteuer\u00a00\u00a0€';
    }
    const rate = kirchensteuerSatz(bundesland);
    const pct = (rate * 100).toFixed(0);
    return `${pct}\u00a0%\u00a0\u00d7\u00a0${formatEuro(result.lohnsteuer)}\u00a0€\u00a0LSt\u00a0(${pct === '8' ? 'BY/BW' : 'alle anderen BL'})`;
  });

  // ---- Abzugsquote ----
  const abzugsquote = $derived.by<string>(() => {
    if (!result || !Number.isFinite(brutto) || brutto <= 0) return '';
    return ((result.gesamtAbzuege / brutto) * 100).toFixed(1).replace('.', ',');
  });

  function handleReset() {
    beschaeftigungsart = 'vollzeit';
    bruttoStr = '3.500';
    steuerklasseStr = '1';
    bundesland = 'NW';
    kirchensteuer = false;
    kinderlos = false;
    pkv = false;
    pkvBeitragStr = '';
  }
</script>

<div class="bn-tool" aria-label="Brutto-Netto-Rechner">

  <!-- Beschäftigungsart -->
  <div class="art-bar">
    <span class="art-bar__label">Beschäftigungsart</span>
    <div class="art-pills" role="group" aria-label="Beschäftigungsart auswählen">
      <button
        type="button"
        class="art-pill"
        class:art-pill--active={beschaeftigungsart === 'vollzeit'}
        aria-pressed={beschaeftigungsart === 'vollzeit'}
        onclick={() => { beschaeftigungsart = 'vollzeit'; }}
      >Vollzeit</button>
      <button
        type="button"
        class="art-pill"
        class:art-pill--active={beschaeftigungsart === 'midijob'}
        aria-pressed={beschaeftigungsart === 'midijob'}
        onclick={() => { beschaeftigungsart = 'midijob'; }}
      >Midijob <span class="art-pill__sub">603–2.000&nbsp;€</span></button>
      <button
        type="button"
        class="art-pill"
        class:art-pill--active={beschaeftigungsart === 'minijob'}
        aria-pressed={beschaeftigungsart === 'minijob'}
        onclick={() => { beschaeftigungsart = 'minijob'; }}
      >Minijob <span class="art-pill__sub">≤&nbsp;603&nbsp;€</span></button>
    </div>
  </div>

  <!-- Eingabe-Felder -->
  <div class="inputs-grid">

    <!-- Bruttogehalt -->
    <div class="input-field input-field--wide">
      <label class="input-field__label" for="inp-brutto">Bruttogehalt pro Monat</label>
      <div class="input-field__wrap" class:input-field__wrap--error={bruttoError !== null}>
        <input
          id="inp-brutto"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder="z.B. 3.500"
          bind:value={bruttoStr}
          aria-label="Bruttogehalt pro Monat in Euro"
          aria-invalid={bruttoError !== null}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">€/Monat</span>
      </div>
      {#if bruttoError}
        <p class="field-error" role="alert">{bruttoError}</p>
      {/if}
    </div>

    <!-- Steuerklasse -->
    <div class="input-field">
      <label class="input-field__label" for="inp-sk">Steuerklasse</label>
      <select
        id="inp-sk"
        class="select-field"
        bind:value={steuerklasseStr}
        aria-label="Steuerklasse auswählen"
      >
        {#each SK_OPTIONS as opt}
          <option value={opt.value}>{opt.label}</option>
        {/each}
      </select>
    </div>

    <!-- Bundesland -->
    <div class="input-field">
      <label class="input-field__label" for="inp-bl">Bundesland</label>
      <select
        id="inp-bl"
        class="select-field"
        bind:value={bundesland}
        aria-label="Bundesland auswählen"
      >
        {#each BUNDESLAENDER as bl}
          <option value={bl.id}>{bl.label}</option>
        {/each}
      </select>
    </div>

  </div><!-- /inputs-grid -->

  <!-- Toggles -->
  <div class="toggles-row" role="group" aria-label="Optionale Abzüge">
    <button
      type="button"
      class="toggle-btn"
      class:toggle-btn--active={kirchensteuer}
      aria-pressed={kirchensteuer}
      onclick={() => { kirchensteuer = !kirchensteuer; }}
    >
      Kirchensteuer
      {#if kirchensteuer}<span class="toggle-btn__on" aria-hidden="true">an</span>{/if}
    </button>
    <button
      type="button"
      class="toggle-btn"
      class:toggle-btn--active={kinderlos}
      aria-pressed={kinderlos}
      onclick={() => { kinderlos = !kinderlos; }}
    >
      Kinderlos (≥&nbsp;23)
      {#if kinderlos}<span class="toggle-btn__on" aria-hidden="true">an</span>{/if}
    </button>
    <button
      type="button"
      class="toggle-btn"
      class:toggle-btn--active={pkv}
      aria-pressed={pkv}
      onclick={() => { pkv = !pkv; if (!pkv) pkvBeitragStr = ''; }}
    >
      Private KV (PKV)
      {#if pkv}<span class="toggle-btn__on" aria-hidden="true">an</span>{/if}
    </button>
  </div>

  <!-- PKV-Beitrag (optional, nur wenn PKV aktiv) -->
  {#if pkv}
    <div class="input-field">
      <label class="input-field__label" for="inp-pkv">
        PKV-Monatsbeitrag
        <span class="optional-badge">optional</span>
      </label>
      <div class="input-field__wrap" class:input-field__wrap--error={pkvError !== null}>
        <input
          id="inp-pkv"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder="z.B. 450"
          bind:value={pkvBeitragStr}
          aria-label="Monatlicher PKV-Beitrag in Euro"
          aria-invalid={pkvError !== null}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">€/Monat</span>
      </div>
      {#if pkvError}
        <p class="field-error" role="alert">{pkvError}</p>
      {/if}
    </div>
  {/if}

  <!-- Ergebnis-Bereich -->
  <div class="results" aria-live="polite" aria-label="Berechnungsergebnis">

    {#if result}
      <!-- Summary-Cards -->
      <div class="summary-grid">
        <div class="summary-card summary-card--primary">
          <span class="summary-card__label">Netto / Monat</span>
          <span class="summary-card__value">{formatEuro(result.netto)}&thinsp;<span class="summary-card__unit">€</span></span>
        </div>
        <div class="summary-card">
          <span class="summary-card__label">Jahres-Netto</span>
          <span class="summary-card__value">{formatEuro(result.jahresNetto)}&thinsp;<span class="summary-card__unit">€</span></span>
        </div>
        <div class="summary-card">
          <span class="summary-card__label">Gesamt-Abzüge</span>
          <span class="summary-card__value">{formatEuro(result.gesamtAbzuege)}&thinsp;<span class="summary-card__unit">€</span></span>
        </div>
        {#if abzugsquote}
          <div class="summary-card">
            <span class="summary-card__label">Abzugsquote</span>
            <span class="summary-card__value">{abzugsquote}&thinsp;<span class="summary-card__unit">%</span></span>
          </div>
        {/if}
      </div>

      <!-- Transparenz-Layer: Abzüge im Detail mit Formel -->
      <div class="breakdown" aria-label="Abzüge im Detail">
        <h2 class="breakdown__title">Abzüge im Detail</h2>
        <div class="bd-table" role="table" aria-label="Aufschlüsselung der Lohnabzüge">
          <div class="bd-head" role="rowgroup">
            <div class="bd-row bd-row--header" role="row">
              <span class="bd-cell bd-cell--label" role="columnheader">Posten</span>
              <span class="bd-cell bd-cell--value" role="columnheader">Betrag</span>
              <span class="bd-cell bd-cell--formula" role="columnheader">Formel (Transparenz-Layer)</span>
            </div>
          </div>
          <div class="bd-body" role="rowgroup">

            <div class="bd-row" role="row">
              <span class="bd-cell bd-cell--label" role="cell">Rentenversicherung</span>
              <span class="bd-cell bd-cell--value" role="cell">{formatEuro(result.rentenversicherung)}&nbsp;€</span>
              <span class="bd-cell bd-cell--formula" role="cell">{formulaRV}</span>
            </div>

            <div class="bd-row" role="row">
              <span class="bd-cell bd-cell--label" role="cell">Krankenversicherung</span>
              <span class="bd-cell bd-cell--value" role="cell">{formatEuro(result.krankenversicherung)}&nbsp;€</span>
              <span class="bd-cell bd-cell--formula" role="cell">{formulaKV}</span>
            </div>

            <div class="bd-row" role="row">
              <span class="bd-cell bd-cell--label" role="cell">Pflegeversicherung</span>
              <span class="bd-cell bd-cell--value" role="cell">{formatEuro(result.pflegeversicherung)}&nbsp;€</span>
              <span class="bd-cell bd-cell--formula" role="cell">{formulaPV}</span>
            </div>

            <div class="bd-row" role="row">
              <span class="bd-cell bd-cell--label" role="cell">Arbeitslosenversicherung</span>
              <span class="bd-cell bd-cell--value" role="cell">{formatEuro(result.arbeitslosenversicherung)}&nbsp;€</span>
              <span class="bd-cell bd-cell--formula" role="cell">{formulaAV}</span>
            </div>

            <div class="bd-row" role="row">
              <span class="bd-cell bd-cell--label" role="cell">Lohnsteuer</span>
              <span class="bd-cell bd-cell--value" role="cell">{formatEuro(result.lohnsteuer)}&nbsp;€</span>
              <span class="bd-cell bd-cell--formula" role="cell">{formulaLSt}</span>
            </div>

            <div class="bd-row" role="row">
              <span class="bd-cell bd-cell--label" role="cell">Solidaritätszuschlag</span>
              <span class="bd-cell bd-cell--value" role="cell">{formatEuro(result.soli)}&nbsp;€</span>
              <span class="bd-cell bd-cell--formula" role="cell">{formulaSoli}</span>
            </div>

            {#if kirchensteuer}
              <div class="bd-row" role="row">
                <span class="bd-cell bd-cell--label" role="cell">Kirchensteuer</span>
                <span class="bd-cell bd-cell--value" role="cell">{formatEuro(result.kirchensteuerBetrag)}&nbsp;€</span>
                <span class="bd-cell bd-cell--formula" role="cell">{formulaKiSt}</span>
              </div>
            {/if}

            <div class="bd-row bd-row--divider" role="row" aria-hidden="true">
              <span class="bd-cell" role="cell"></span>
              <span class="bd-cell" role="cell"></span>
              <span class="bd-cell" role="cell"></span>
            </div>

            <div class="bd-row bd-row--total" role="row">
              <span class="bd-cell bd-cell--label" role="cell">= Netto-Gehalt</span>
              <span class="bd-cell bd-cell--value bd-cell--total" role="cell">{formatEuro(result.netto)}&nbsp;€</span>
              <span class="bd-cell bd-cell--formula" role="cell">{formatEuro(brutto)}&nbsp;€&nbsp;Brutto&nbsp;−&nbsp;{formatEuro(result.gesamtAbzuege)}&nbsp;€&nbsp;Abzüge</span>
            </div>

          </div>
        </div>
      </div>

      <!-- Hinweise / Warnungen -->
      {#if result.warnungen.includes('midijob')}
        <div class="info-box info-box--note" role="note" aria-label="Midijob-Hinweis">
          <strong>Midijob-Gleitzone:</strong> F-Faktor 0,6619 — die SV-Bemessungsgrundlage wird linear von 603&nbsp;€ bis 2.000&nbsp;€ auf die volle Basis hochgeführt. Der volle Sozialversicherungsschutz bleibt erhalten.
        </div>
      {/if}
      {#if result.warnungen.includes('minijob')}
        <div class="info-box info-box--note" role="note" aria-label="Minijob-Hinweis">
          <strong>Minijob:</strong> Bei Verdienst bis 603&nbsp;€ fallen für den Arbeitnehmer keine SV-Beiträge und in der Regel keine Lohnsteuer an. Der Arbeitgeber zahlt Pauschalabgaben.
        </div>
      {/if}
      {#if result.warnungen.includes('bbg-kv')}
        <div class="info-box info-box--note" role="note" aria-label="BBG-Hinweis KV/PV">
          <strong>BBG-Kappung KV/PV:</strong> Über der Beitragsbemessungsgrenze (5.812,50&nbsp;€/Monat) werden für KV und PV keine weiteren Beiträge erhoben.
        </div>
      {/if}
      {#if result.warnungen.includes('bbg-rv')}
        <div class="info-box info-box--note" role="note" aria-label="BBG-Hinweis RV/AV">
          <strong>BBG-Kappung RV/AV:</strong> Über der Beitragsbemessungsgrenze (8.450&nbsp;€/Monat) werden für RV und AV keine weiteren Beiträge erhoben.
        </div>
      {/if}

    {:else if bruttoStr.trim() === ''}
      <p class="empty-state">Bruttogehalt eingeben — Netto und Abzüge erscheinen sofort.</p>
    {/if}

  </div><!-- /results -->

  <!-- Zurücksetzen -->
  <div class="actions-bar">
    <button type="button" class="reset-btn" onclick={handleReset}>Zurücksetzen</button>
  </div>

  <!-- Disclaimer -->
  <p class="disclaimer">
    Systembedingte Abweichungen von ±10–20&nbsp;€ möglich — vereinfachter §&nbsp;32a-Tarif, nicht PAP-Algorithmus des BMF. Nicht für steuerliche Beratung geeignet.
  </p>

  <!-- Privacy-Badge -->
  <div class="privacy-badge" aria-label="Datenschutz-Hinweis">
    Kein Server-Upload · Kein Tracking · Alle Berechnungen lokal im Browser
  </div>

</div><!-- /bn-tool -->

<style>
  .bn-tool {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  /* Beschäftigungsart-Bar */
  .art-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
  }
  .art-bar__label {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    font-weight: 500;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
  .art-pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .art-pill {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text);
    font-size: var(--font-size-small);
    border-radius: var(--r-md);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out);
    text-align: left;
    min-height: 2.75rem;
  }
  .art-pill:hover {
    background: var(--color-surface-raised);
  }
  .art-pill--active {
    background: var(--color-text);
    color: var(--color-bg);
    border-color: var(--color-text);
  }
  .art-pill__sub {
    font-size: 0.6875rem;
    opacity: 0.7;
    font-family: var(--font-family-mono);
    margin-top: 1px;
  }

  /* Inputs Grid */
  .inputs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
    gap: var(--space-4);
  }
  .input-field--wide {
    grid-column: 1 / -1;
  }
  @media (min-width: 30rem) {
    .input-field--wide {
      grid-column: span 2;
    }
  }

  .input-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .input-field__label {
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-muted);
    letter-spacing: 0.02em;
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  .optional-badge {
    font-size: 0.65rem;
    letter-spacing: 0.04em;
    color: var(--color-text-subtle);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    padding: 0 var(--space-1);
    font-weight: 400;
    text-transform: uppercase;
  }
  .input-field__wrap {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    background: var(--color-bg);
    padding: 0 var(--space-3);
    transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
  }
  .input-field__wrap:focus-within {
    border-color: var(--color-text);
    box-shadow: 0 0 0 2px var(--color-focus-ring, var(--color-accent));
  }
  .input-field__wrap--error {
    border-color: var(--color-error);
  }
  .input-field__input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: var(--color-text);
    font-size: 1rem;
    font-family: var(--font-family-mono);
    padding: var(--space-3) 0;
    min-width: 0;
  }
  .input-field__unit {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
    flex-shrink: 0;
    white-space: nowrap;
  }
  .field-error {
    margin: 0;
    font-size: var(--font-size-small);
    color: var(--color-error);
    line-height: 1.4;
  }

  /* Select */
  .select-field {
    padding: var(--space-3) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    background: var(--color-bg);
    color: var(--color-text);
    font-size: var(--font-size-small);
    font-family: var(--font-family-mono);
    outline: none;
    cursor: pointer;
    width: 100%;
    min-height: 2.75rem;
  }
  .select-field:focus {
    border-color: var(--color-text);
    box-shadow: 0 0 0 2px var(--color-focus-ring, var(--color-accent));
  }

  /* Toggles */
  .toggles-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .toggle-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
    border-radius: var(--r-md);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
    min-height: 2.75rem;
  }
  .toggle-btn:hover {
    border-color: var(--color-text-muted);
    color: var(--color-text);
  }
  .toggle-btn--active {
    background: var(--color-surface-raised);
    border-color: var(--color-text);
    color: var(--color-text);
  }
  .toggle-btn__on {
    font-size: 0.6rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text);
    font-family: var(--font-family-mono);
  }

  /* Summary Grid */
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
    gap: var(--space-3);
  }
  .summary-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-4);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    background: var(--color-surface);
  }
  .summary-card--primary {
    border-color: var(--color-text);
  }
  .summary-card__label {
    font-size: 0.6875rem;
    letter-spacing: 0.04em;
    color: var(--color-text-subtle);
    text-transform: uppercase;
    font-weight: 500;
  }
  .summary-card__value {
    font-size: 1.25rem;
    font-family: var(--font-family-mono);
    font-weight: 600;
    color: var(--color-text);
    line-height: 1.2;
  }
  .summary-card__unit {
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--color-text-muted);
  }

  /* Breakdown Transparenz-Layer */
  .breakdown {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }
  .breakdown__title {
    margin: 0;
    font-size: var(--font-size-small);
    font-weight: 600;
    color: var(--color-text-muted);
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .bd-table {
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    overflow: hidden;
  }
  .bd-row {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: var(--space-3);
    align-items: center;
    padding: var(--space-2) var(--space-4);
    border-bottom: 1px solid var(--color-border);
  }
  .bd-row:last-child {
    border-bottom: none;
  }
  .bd-row--header {
    background: var(--color-surface);
  }
  .bd-row--divider {
    padding: var(--space-1) var(--space-4);
    background: var(--color-surface);
    border-top: 1px solid var(--color-border);
  }
  .bd-row--total {
    background: var(--color-surface);
  }
  .bd-cell--label {
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    white-space: nowrap;
  }
  .bd-row--header .bd-cell--label {
    font-size: 0.6875rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    font-weight: 500;
  }
  .bd-row--total .bd-cell--label {
    color: var(--color-text);
    font-weight: 600;
  }
  .bd-cell--value {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text);
    text-align: right;
    white-space: nowrap;
  }
  .bd-row--header .bd-cell--value {
    font-size: 0.6875rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--color-text-subtle);
    font-weight: 500;
    font-family: inherit;
  }
  .bd-cell--total {
    font-weight: 700;
    font-size: 1rem;
    color: var(--color-text);
  }
  .bd-cell--formula {
    font-size: 0.6875rem;
    font-family: var(--font-family-mono);
    color: var(--color-text-subtle);
    line-height: 1.4;
    overflow-wrap: break-word;
    min-width: 0;
  }
  .bd-row--header .bd-cell--formula {
    font-size: 0.6875rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    font-family: inherit;
    font-weight: 500;
    color: var(--color-text-subtle);
  }

  @media (max-width: 40rem) {
    .bd-row {
      grid-template-columns: 1fr auto;
      grid-template-rows: auto auto;
    }
    .bd-cell--formula {
      grid-column: 1 / -1;
      padding-bottom: var(--space-1);
      border-top: none;
    }
    .bd-row--header .bd-cell--formula {
      display: none;
    }
    .bd-row--divider {
      display: none;
    }
  }

  /* Info-Boxen */
  .info-box {
    padding: var(--space-3) var(--space-4);
    border-radius: var(--r-md);
    font-size: var(--font-size-small);
    line-height: 1.5;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text-muted);
  }
  .info-box--note {
    border-color: var(--color-border);
  }

  /* Empty state */
  .empty-state {
    margin: 0;
    text-align: center;
    color: var(--color-text-subtle);
    font-size: var(--font-size-small);
    padding: var(--space-4) 0;
  }

  /* Actions */
  .actions-bar {
    display: flex;
    gap: var(--space-2);
  }
  .reset-btn {
    padding: var(--space-2) var(--space-4);
    border: 1px solid var(--color-border);
    background: transparent;
    color: var(--color-text-muted);
    font-size: var(--font-size-small);
    border-radius: var(--r-md);
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
    min-height: 2.75rem;
  }
  .reset-btn:hover {
    border-color: var(--color-text);
    color: var(--color-text);
  }

  /* Disclaimer */
  .disclaimer {
    margin: 0;
    font-size: 0.6875rem;
    color: var(--color-text-subtle);
    line-height: 1.5;
    border-top: 1px solid var(--color-border);
    padding-top: var(--space-3);
  }

  /* Privacy badge */
  .privacy-badge {
    font-size: 0.6875rem;
    letter-spacing: 0.04em;
    color: var(--color-text-subtle);
    text-align: center;
    padding-top: var(--space-1);
  }

  @media (prefers-reduced-motion: reduce) {
    .art-pill,
    .toggle-btn,
    .reset-btn,
    .input-field__wrap,
    .select-field {
      transition: none;
    }
  }
</style>
