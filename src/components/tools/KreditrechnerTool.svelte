<script lang="ts">
  import type { FormatterConfig } from '../../lib/tools/schemas';
  import {
    computeKreditErgebnis,
    buildTilgungsplan,
  } from '../../lib/tools/kreditrechner';
  import type { TilgungsplanZeile } from '../../lib/tools/kreditrechner';

  interface Props {
    config: FormatterConfig;
  }
  let { config }: Props = $props();
  void config;

  // ---- Hilfsfunktionen ----
  function parseDE(s: string): number {
    const cleaned = s.trim().replace(/\./g, '').replace(',', '.');
    return cleaned === '' ? NaN : Number(cleaned);
  }

  function formatEuro(n: number): string {
    if (!Number.isFinite(n)) return '—';
    return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // ---- Eingabe-States ----
  let kreditbetragStr = $state('200.000');
  let sollzinsStr = $state('3,80');
  let laufzeitStr = $state('240');
  let sondertilgungStr = $state('');

  // ---- Computed: geparste Werte ----
  const kreditbetrag = $derived(parseDE(kreditbetragStr));
  const sollzins = $derived(parseDE(sollzinsStr));
  const laufzeit = $derived(parseDE(laufzeitStr));
  const sondertilgung = $derived(sondertilgungStr.trim() === '' ? 0 : parseDE(sondertilgungStr));

  // ---- Validierung ----
  const kreditbetragError = $derived.by<string | null>(() => {
    if (!Number.isFinite(kreditbetrag)) return 'Bitte einen Betrag eingeben.';
    if (kreditbetrag <= 0) return 'Kreditbetrag muss > 0 € sein.';
    if (kreditbetrag > 10_000_000) return 'Maximalbetrag: 10.000.000 €';
    return null;
  });

  const sollzinsError = $derived.by<string | null>(() => {
    if (!Number.isFinite(sollzins)) return 'Bitte einen Zinssatz eingeben.';
    if (sollzins <= 0) return 'Sollzins muss > 0 % sein.';
    if (sollzins > 20) return 'Sollzins darf maximal 20 % betragen.';
    return null;
  });

  const laufzeitError = $derived.by<string | null>(() => {
    if (!Number.isFinite(laufzeit)) return 'Bitte eine Laufzeit eingeben.';
    if (laufzeit < 1) return 'Laufzeit muss mindestens 1 Monat betragen.';
    if (laufzeit > 600) return 'Laufzeit maximal 600 Monate (50 Jahre).';
    return null;
  });

  const sondertilgungError = $derived.by<string | null>(() => {
    if (sondertilgungStr.trim() === '') return null;
    if (!Number.isFinite(sondertilgung)) return 'Bitte einen gültigen Betrag eingeben.';
    if (sondertilgung < 0) return 'Sondertilgung muss ≥ 0 € sein.';
    if (Number.isFinite(kreditbetrag) && sondertilgung > kreditbetrag * 0.5) {
      return 'Sondertilgung über 50 % des Kredits — korrekt?';
    }
    return null;
  });

  const hasErrors = $derived(
    kreditbetragError !== null ||
    sollzinsError !== null ||
    laufzeitError !== null,
  );

  // ---- Berechnung ----
  const ergebnis = $derived.by(() => {
    if (hasErrors) return null;
    if (!Number.isFinite(kreditbetrag) || !Number.isFinite(sollzins) || !Number.isFinite(laufzeit)) return null;
    const r = computeKreditErgebnis(kreditbetrag, sollzins, Math.round(laufzeit), sondertilgung);
    if (!Number.isFinite(r.monatsrate)) return null;
    return r;
  });

  // Tilgungsplan (jährliche Übersicht) — nur wenn Ergebnis da
  const tilgungsplan = $derived.by<TilgungsplanZeile[]>(() => {
    if (!ergebnis) return [];
    return buildTilgungsplan(kreditbetrag, sollzins, Math.round(laufzeit), sondertilgung);
  });

  // Jährliche Zusammenfassung aus monatlichem Plan
  interface JahrZeile {
    jahr: number;
    zinsenJahr: number;
    tilgungJahr: number;
    sondertilgungJahr: number;
    restschuld: number;
  }

  const jahresplan = $derived.by<JahrZeile[]>(() => {
    if (tilgungsplan.length === 0) return [];
    const map = new Map<number, JahrZeile>();
    for (const z of tilgungsplan) {
      const jahr = Math.ceil(z.monat / 12);
      const existing = map.get(jahr);
      if (existing) {
        existing.zinsenJahr += z.zinsanteil;
        existing.tilgungJahr += z.tilgungsanteil;
        existing.sondertilgungJahr += z.sondertilgung;
        existing.restschuld = z.restschuld;
      } else {
        map.set(jahr, {
          jahr,
          zinsenJahr: z.zinsanteil,
          tilgungJahr: z.tilgungsanteil,
          sondertilgungJahr: z.sondertilgung,
          restschuld: z.restschuld,
        });
      }
    }
    return Array.from(map.values());
  });

  const hatSondertilgung = $derived(jahresplan.some((r) => r.sondertilgungJahr > 0));

  // ---- Zurücksetzen ----
  function handleReset() {
    kreditbetragStr = '200.000';
    sollzinsStr = '3,80';
    laufzeitStr = '240';
    sondertilgungStr = '';
  }
</script>

<div class="kreditrechner-tool" aria-label="Kreditrechner">

  <!-- Eingabefelder -->
  <div class="inputs-grid">

    <div class="input-field">
      <label class="input-field__label" for="inp-kreditbetrag">Kreditbetrag</label>
      <div class="input-field__wrap" class:input-field__wrap--error={kreditbetragError !== null}>
        <input
          id="inp-kreditbetrag"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder="z.B. 200.000"
          bind:value={kreditbetragStr}
          aria-label="Kreditbetrag in Euro"
          aria-invalid={kreditbetragError !== null}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">€</span>
      </div>
      {#if kreditbetragError}
        <p class="field-error" role="alert">{kreditbetragError}</p>
      {/if}
    </div>

    <div class="input-field">
      <label class="input-field__label" for="inp-sollzins">Sollzins p.a.</label>
      <div class="input-field__wrap" class:input-field__wrap--error={sollzinsError !== null}>
        <input
          id="inp-sollzins"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder="z.B. 3,80"
          bind:value={sollzinsStr}
          aria-label="Sollzinssatz pro Jahr in Prozent"
          aria-invalid={sollzinsError !== null}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">%</span>
      </div>
      {#if sollzinsError}
        <p class="field-error" role="alert">{sollzinsError}</p>
      {/if}
    </div>

    <div class="input-field">
      <label class="input-field__label" for="inp-laufzeit">Laufzeit</label>
      <div class="input-field__wrap" class:input-field__wrap--error={laufzeitError !== null}>
        <input
          id="inp-laufzeit"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder="z.B. 240"
          bind:value={laufzeitStr}
          aria-label="Laufzeit in Monaten"
          aria-invalid={laufzeitError !== null}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">Monate</span>
      </div>
      {#if laufzeitError}
        <p class="field-error" role="alert">{laufzeitError}</p>
      {/if}
    </div>

    <div class="input-field input-field--optional">
      <label class="input-field__label" for="inp-sondertilgung">
        Sondertilgung p.a.
        <span class="optional-badge">optional</span>
      </label>
      <div class="input-field__wrap" class:input-field__wrap--error={sondertilgungError !== null}>
        <input
          id="inp-sondertilgung"
          type="text"
          inputmode="decimal"
          class="input-field__input"
          placeholder="z.B. 5.000"
          bind:value={sondertilgungStr}
          aria-label="Jährliche Sondertilgung in Euro"
          aria-invalid={sondertilgungError !== null}
          autocomplete="off"
        />
        <span class="input-field__unit" aria-hidden="true">€/Jahr</span>
      </div>
      {#if sondertilgungError}
        <p class="field-error" role="alert">{sondertilgungError}</p>
      {/if}
    </div>

  </div><!-- /inputs-grid -->

  <!-- Ergebnis-Bereich -->
  <div class="results" aria-live="polite" aria-label="Berechnungsergebnis">

    {#if ergebnis}
      <!-- Haupt-Summary-Cards -->
      <div class="summary-grid">
        <div class="summary-card summary-card--primary">
          <span class="summary-card__label">Monatsrate</span>
          <span class="summary-card__value">{formatEuro(ergebnis.monatsrate)} <span class="summary-card__unit">€</span></span>
        </div>
        <div class="summary-card">
          <span class="summary-card__label">Gesamtzinsen</span>
          <span class="summary-card__value">{formatEuro(ergebnis.gesamtzinsen)} <span class="summary-card__unit">€</span></span>
        </div>
        <div class="summary-card">
          <span class="summary-card__label">Gesamtkosten</span>
          <span class="summary-card__value">{formatEuro(ergebnis.gesamtkosten)} <span class="summary-card__unit">€</span></span>
        </div>
      </div>

      <!-- Sondertilgungs-Delta (Differenzierung H2) -->
      {#if ergebnis.ersparnis_zinsen > 0}
        <div class="sondertilgung-box" role="note" aria-label="Sondertilgung-Einsparung">
          <span class="sondertilgung-box__icon" aria-hidden="true">✓</span>
          <div>
            Durch die jährliche Sondertilgung von {formatEuro(sondertilgung)}&nbsp;€ sparst du
            <strong>{formatEuro(ergebnis.ersparnis_zinsen)}&nbsp;€ Zinsen</strong> und bist
            <strong>{ergebnis.ersparnis_monate} Monate früher</strong> schuldenfrei.
          </div>
        </div>
      {/if}

      <!-- Tilgungsplan Jahresübersicht -->
      {#if jahresplan.length > 0}
        <div class="table-section">
          <div class="table-header">
            <h2 class="table-title">Tilgungsplan (Jahresübersicht)</h2>
          </div>
          <div class="table-wrap">
            <table class="tilgungsplan-table" aria-label="Jährlicher Tilgungsplan">
              <thead>
                <tr>
                  <th scope="col">Jahr</th>
                  <th scope="col">Zinsen</th>
                  <th scope="col">Tilgung</th>
                  {#if hatSondertilgung}
                    <th scope="col">Sondertilg.</th>
                  {/if}
                  <th scope="col">Restschuld</th>
                </tr>
              </thead>
              <tbody>
                {#each jahresplan as row (row.jahr)}
                  <tr>
                    <td class="cell--year">{row.jahr}</td>
                    <td class="cell--num">{formatEuro(row.zinsenJahr)}</td>
                    <td class="cell--num">{formatEuro(row.tilgungJahr)}</td>
                    {#if hatSondertilgung}
                      <td class="cell--num">{row.sondertilgungJahr > 0 ? formatEuro(row.sondertilgungJahr) : '—'}</td>
                    {/if}
                    <td class="cell--num cell--restschuld">{formatEuro(row.restschuld)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}

    {:else if !hasErrors && Number.isFinite(kreditbetrag) && Number.isFinite(sollzins) && Number.isFinite(laufzeit)}
      <p class="empty-state">Bitte alle Pflichtfelder prüfen — die Berechnung startet automatisch.</p>
    {:else if !Number.isFinite(kreditbetrag) || !Number.isFinite(sollzins) || !Number.isFinite(laufzeit)}
      <p class="empty-state">Gib Kreditbetrag, Sollzins und Laufzeit ein, um die Berechnung zu starten.</p>
    {/if}

  </div><!-- /results -->

  <!-- Zurücksetzen -->
  <div class="actions-bar">
    <button type="button" class="reset-btn" onclick={handleReset}>Zurücksetzen</button>
  </div>

  <!-- Disclaimer -->
  <p class="disclaimer">
    Diese Berechnung dient ausschließlich zur unverbindlichen Information und ersetzt keine Bankberatung.
    Tatsächliche Konditionen hängen von Ihrer Bonität und dem jeweiligen Kreditvertrag ab.
  </p>

  <!-- Privacy badge -->
  <div class="privacy-badge" aria-label="Datenschutz-Hinweis">
    Kein Server-Upload · Kein Tracking · Rechnet lokal in Ihrem Browser
  </div>

</div><!-- /kreditrechner-tool -->

<style>
  .kreditrechner-tool {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  /* Inputs Grid */
  .inputs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
    gap: var(--space-4);
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

  /* Summary Grid */
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
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

  /* Sondertilgung Box */
  .sondertilgung-box {
    display: flex;
    gap: var(--space-3);
    padding: var(--space-4);
    border: 1px solid var(--color-success);
    border-radius: var(--r-md);
    background: color-mix(in oklch, var(--color-success) 8%, transparent);
    font-size: var(--font-size-small);
    color: var(--color-text);
    line-height: 1.5;
  }

  .sondertilgung-box__icon {
    flex-shrink: 0;
    color: var(--color-success);
    font-weight: 700;
    font-size: 1rem;
    font-style: normal;
    line-height: 1.4;
  }

  /* Table */
  .table-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .table-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .table-title {
    margin: 0;
    font-size: var(--font-size-small);
    font-weight: 600;
    color: var(--color-text-muted);
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .table-wrap {
    overflow-x: auto;
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
  }

  .tilgungsplan-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--font-size-small);
    font-family: var(--font-family-mono);
  }

  .tilgungsplan-table thead th {
    padding: var(--space-2) var(--space-3);
    text-align: right;
    font-weight: 600;
    color: var(--color-text-muted);
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    white-space: nowrap;
    letter-spacing: 0.01em;
  }

  .tilgungsplan-table thead th:first-child {
    text-align: left;
  }

  .tilgungsplan-table tbody td {
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text);
    text-align: right;
    white-space: nowrap;
  }

  .tilgungsplan-table tbody tr:last-child td {
    border-bottom: none;
  }

  .tilgungsplan-table tbody tr:hover td {
    background: var(--color-surface);
  }

  .cell--year {
    text-align: left !important;
    font-weight: 500;
    color: var(--color-text-muted);
  }

  .cell--num {
    text-align: right;
  }

  .cell--restschuld {
    font-weight: 600;
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
    .input-field__wrap,
    .reset-btn {
      transition: none;
    }
  }
</style>
