<script lang="ts">
  import { onMount } from 'svelte';

  // Only runs in production builds — no-op in dev.
  // Sends CLS, LCP, INP, FCP, TTFB to CF Web Analytics as custom beacon events.
  // CF beacon exposes window.cfBeacon.push('record', name, data); events are
  // visible in the CF Analytics dashboard under custom events.
  onMount(async () => {
    if (!import.meta.env.PROD) return;

    const { onCLS, onLCP, onINP, onFCP, onTTFB } = await import('web-vitals');

    function sendToBeacon(name: string, value: number) {
      if (typeof window !== 'undefined' && (window as any).cfBeacon?.push) {
        (window as any).cfBeacon.push('record', name, { value: Math.round(value) });
      }
    }

    onCLS(({ name, value }) => sendToBeacon(name, value));
    onLCP(({ name, value }) => sendToBeacon(name, value));
    onINP(({ name, value }) => sendToBeacon(name, value));
    onFCP(({ name, value }) => sendToBeacon(name, value));
    onTTFB(({ name, value }) => sendToBeacon(name, value));
  });
</script>
