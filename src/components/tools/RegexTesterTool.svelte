<script lang="ts">
  import type { ValidatorConfig } from '../../lib/tools/schemas';

  interface Props {
    config: ValidatorConfig;
  }
  let { config }: Props = $props();
  void config;

  let pattern = $state<string>('(\\w+)@(\\w+\\.\\w+)');
  let flags = $state<string>('g');
  let subject = $state<string>('Schreib uns an hello@konverter.app oder support@konverter.de.');

  type FlagKey = 'g' | 'i' | 'm' | 's' | 'u' | 'y';
  const ALL_FLAGS: Array<{ key: FlagKey; label: string }> = [
    { key: 'g', label: 'global' },
    { key: 'i', label: 'case-insensitive' },
    { key: 'm', label: 'multiline' },
    { key: 's', label: 'dotAll' },
    { key: 'u', label: 'unicode' },
    { key: 'y', label: 'sticky' },
  ];

  function toggleFlag(key: FlagKey) {
    if (flags.includes(key)) {
      flags = flags.replace(key, '');
    } else {
      flags = flags + key;
    }
  }

  type CompileResult =
    | { ok: true; regex: RegExp }
    | { ok: false; error: string };

  const compiled = $derived.by<CompileResult>(() => {
    if (pattern === '') return { ok: false, error: 'Leeres Pattern.' };
    try {
      return { ok: true, regex: new RegExp(pattern, flags) };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Ungültiges Pattern.' };
    }
  });

  interface Hit {
    index: number;
    length: number;
    match: string;
    groups: string[];
  }

  const hits = $derived.by<Hit[]>(() => {
    if (!compiled.ok) return [];
    if (subject === '') return [];
    const regex = compiled.regex;
    const list: Hit[] = [];

    if (regex.global || regex.sticky) {
      regex.lastIndex = 0;
      let m: RegExpExecArray | null;
      let guard = 0;
      while ((m = regex.exec(subject)) !== null) {
        list.push({
          index: m.index,
          length: m[0].length,
          match: m[0],
          groups: m.slice(1).map((g) => g ?? ''),
        });
        if (m[0].length === 0) regex.lastIndex++;
        if (++guard > 10_000) break;
      }
    } else {
      const m = regex.exec(subject);
      if (m) {
        list.push({
          index: m.index,
          length: m[0].length,
          match: m[0],
          groups: m.slice(1).map((g) => g ?? ''),
        });
      }
    }
    return list;
  });

  interface Segment {
    text: string;
    hitIndex: number | null;
  }

  const segments = $derived.by<Segment[]>(() => {
    if (hits.length === 0) return [{ text: subject, hitIndex: null }];
    const out: Segment[] = [];
    let cursor = 0;
    hits.forEach((h, i) => {
      if (h.index > cursor) {
        out.push({ text: subject.slice(cursor, h.index), hitIndex: null });
      }
      out.push({ text: subject.slice(h.index, h.index + h.length), hitIndex: i });
      cursor = h.index + h.length;
    });
    if (cursor < subject.length) {
      out.push({ text: subject.slice(cursor), hitIndex: null });
    }
    return out;
  });
</script>

<div class="regex" data-testid="regex-tester">
  <div class="regex__pattern-row">
    <div class="regex__panel regex__panel--grow">
      <label class="regex__label" for="regex-pattern">Pattern</label>
      <div class="regex__pattern-input">
        <span class="regex__delim" aria-hidden="true">/</span>
        <input
          id="regex-pattern"
          class="regex__field regex__field--pattern"
          type="text"
          spellcheck="false"
          autocomplete="off"
          value={pattern}
          oninput={(e) => (pattern = (e.target as HTMLInputElement).value)}
        />
        <span class="regex__delim" aria-hidden="true">/</span>
        <span class="regex__flags-echo" aria-hidden="true">{flags}</span>
      </div>
    </div>
  </div>

  <div class="regex__flags">
    <span class="regex__label">Flags</span>
    <div class="regex__flag-list">
      {#each ALL_FLAGS as flag (flag.key)}
        <button
          type="button"
          class="regex__flag"
          class:regex__flag--active={flags.includes(flag.key)}
          onclick={() => toggleFlag(flag.key)}
          aria-pressed={flags.includes(flag.key)}
          title={flag.label}
        >
          <span class="regex__flag-key">{flag.key}</span>
          <span class="regex__flag-label">{flag.label}</span>
        </button>
      {/each}
    </div>
  </div>

  <div class="regex__panel">
    <label class="regex__label" for="regex-subject">Testtext</label>
    <textarea
      id="regex-subject"
      class="regex__field regex__textarea"
      rows="6"
      spellcheck="false"
      autocomplete="off"
      value={subject}
      oninput={(e) => (subject = (e.target as HTMLTextAreaElement).value)}
    ></textarea>
  </div>

  <div class="regex__panel">
    <div class="regex__panel-head">
      <span class="regex__label">Ergebnis</span>
      {#if compiled.ok && subject !== ''}
        <span class="regex__count">
          {hits.length === 1 ? '1 Treffer' : `${hits.length} Treffer`}
        </span>
      {/if}
    </div>

    {#if !compiled.ok}
      <div class="regex__error" role="alert">
        <span class="regex__error-label">Pattern-Fehler</span>
        <span>{compiled.error}</span>
      </div>
    {:else if subject === ''}
      <div class="regex__empty">Testtext eingeben, um Treffer zu sehen.</div>
    {:else if hits.length === 0}
      <div class="regex__empty">Keine Treffer im Testtext.</div>
    {:else}
      <pre class="regex__highlight" aria-live="polite">{#each segments as seg, i (i)}{#if seg.hitIndex === null}{seg.text}{:else}<mark class="regex__mark">{seg.text}</mark>{/if}{/each}</pre>

      <ol class="regex__matches">
        {#each hits as hit, i (i)}
          <li class="regex__match">
            <span class="regex__match-idx">{String(i + 1).padStart(2, '0')}</span>
            <div class="regex__match-body">
              <div class="regex__match-primary">
                <code class="regex__match-value">{hit.match}</code>
                <span class="regex__match-pos">Position {hit.index}, Länge {hit.length}</span>
              </div>
              {#if hit.groups.length > 0}
                <ul class="regex__groups">
                  {#each hit.groups as group, gi (gi)}
                    <li class="regex__group">
                      <span class="regex__group-label">$#{gi + 1}</span>
                      <code class="regex__group-value">{group}</code>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
          </li>
        {/each}
      </ol>
    {/if}
  </div>
</div>

<style>
  .regex {
    padding: var(--space-8);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--r-md);
    box-shadow: var(--shadow-sm);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }
  .regex__panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    min-width: 0;
  }
  .regex__panel--grow {
    flex: 1;
    min-width: 0;
  }
  .regex__panel-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-4);
  }
  .regex__label {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    font-weight: 500;
    color: var(--color-text-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  .regex__count {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
  }
  .regex__pattern-row {
    display: flex;
    gap: var(--space-4);
    align-items: flex-end;
  }
  .regex__pattern-input {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-2) var(--space-3);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    transition: border-color var(--dur-fast) var(--ease-out);
  }
  .regex__pattern-input:hover {
    border-color: var(--color-text-subtle);
  }
  .regex__pattern-input:focus-within {
    border-color: transparent;
    outline: 2px solid var(--color-accent);
    outline-offset: var(--space-1);
  }
  .regex__delim {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-body);
    color: var(--color-text-subtle);
  }
  .regex__flags-echo {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-muted);
    min-width: 1.5ch;
  }
  .regex__field {
    border: 0;
    background: transparent;
    color: var(--color-text);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-body);
    line-height: 1.5;
  }
  .regex__field:focus {
    outline: none;
  }
  .regex__field--pattern {
    flex: 1;
    min-width: 0;
  }
  .regex__textarea {
    padding: var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    resize: vertical;
    min-height: 6rem;
    transition: border-color var(--dur-fast) var(--ease-out);
  }
  .regex__textarea:hover {
    border-color: var(--color-text-subtle);
  }
  .regex__textarea:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: var(--space-1);
    border-color: transparent;
  }
  .regex__flags {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .regex__flag-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }
  .regex__flag {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-3);
    background: transparent;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    cursor: pointer;
    transition:
      color var(--dur-fast) var(--ease-out),
      border-color var(--dur-fast) var(--ease-out);
  }
  .regex__flag:hover {
    color: var(--color-text);
    border-color: var(--color-text-subtle);
  }
  .regex__flag:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .regex__flag--active {
    color: var(--color-text);
    border-color: var(--color-accent);
  }
  .regex__flag-key {
    font-weight: 500;
  }
  .regex__flag-label {
    color: var(--color-text-subtle);
  }
  .regex__flag--active .regex__flag-label {
    color: var(--color-text-muted);
  }
  .regex__highlight {
    margin: 0;
    padding: var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-body);
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--color-text);
    max-height: 16rem;
    overflow: auto;
  }
  .regex__mark {
    background: color-mix(in oklch, var(--color-accent) 22%, transparent);
    color: var(--color-text);
    border-radius: 2px;
    padding: 0 2px;
  }
  .regex__matches {
    list-style: none;
    margin: var(--space-4) 0 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }
  .regex__match {
    display: flex;
    align-items: baseline;
    gap: var(--space-4);
    padding: var(--space-3) 0;
    border-bottom: 1px solid var(--color-border);
  }
  .regex__match:last-child {
    border-bottom: 0;
  }
  .regex__match-idx {
    flex: 0 0 auto;
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
    font-variant-numeric: tabular-nums;
  }
  .regex__match-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .regex__match-primary {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-3);
    flex-wrap: wrap;
  }
  .regex__match-value {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-body);
    color: var(--color-text);
    word-break: break-all;
  }
  .regex__match-pos {
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
    color: var(--color-text-subtle);
  }
  .regex__groups {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  .regex__group {
    display: flex;
    align-items: baseline;
    gap: var(--space-3);
    font-family: var(--font-family-mono);
    font-size: var(--font-size-small);
  }
  .regex__group-label {
    flex: 0 0 3rem;
    color: var(--color-text-subtle);
  }
  .regex__group-value {
    color: var(--color-text-muted);
    word-break: break-all;
  }
  .regex__empty,
  .regex__error {
    padding: var(--space-4);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--r-sm);
    color: var(--color-text-subtle);
    font-size: var(--font-size-small);
  }
  .regex__error {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    color: var(--color-text);
  }
  .regex__error-label {
    font-family: var(--font-family-mono);
    font-weight: 500;
    color: var(--color-accent);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
</style>
