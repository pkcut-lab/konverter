import { StitchToolClient, stitch, StitchError } from '@google/stitch-sdk';

if (!process.env.STITCH_API_KEY || process.env.STITCH_API_KEY.startsWith('PASTE_')) {
  console.error('✗ STITCH_API_KEY nicht gesetzt. .env prüfen und via --env-file=.env laden.');
  process.exit(1);
}

const client = new StitchToolClient({ apiKey: process.env.STITCH_API_KEY });

try {
  console.log('→ Stitch-Verbindung testen…\n');

  const { tools } = await client.listTools();
  console.log(`✓ Verbunden. ${tools.length} MCP-Tools verfügbar:`);
  for (const t of tools) console.log(`  · ${t.name}`);

  console.log('\n→ Projekte abfragen…');
  const projects = await stitch.projects();
  console.log(`✓ ${projects.length} Projekt(e):`);
  for (const p of projects) {
    console.log(`  · ${p.projectId ?? p.id}`);
  }

  console.log('\n✓ Smoke-Test erfolgreich.');
} catch (err) {
  if (err instanceof StitchError) {
    console.error(`✗ StitchError [${err.code}]: ${err.message}`);
    if (err.recoverable) console.error('  (recoverable)');
  } else {
    console.error('✗ Unerwarteter Fehler:', err?.message ?? err);
  }
  process.exit(1);
} finally {
  await client.close();
}
