const APP_URL = 'https://manocerca-mvp.vercel.app';
const PROJECT_HOST = 'kjomabxbqrlbpuxkvbze.supabase.co';
const request_timeout_ms = 15000;

function fail(message) {
  throw new Error(message);
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(request_timeout_ms),
  });
  if (!response.ok) fail(`HTTP ${response.status} en ${new URL(url).hostname}`);
  return response;
}

function valid_professional(row) {
  return row && typeof row === 'object'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(row.id)
    && typeof row.full_name === 'string' && row.full_name.length > 0
    && typeof row.specialty === 'string' && row.specialty.length > 0
    && typeof row.zone === 'string';
}

async function deployed_config(html) {
  const queue = [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+\.js)["']/gi)]
    .map((match) => new URL(match[1], APP_URL));
  if (!queue.length) fail('El HTML publicado no incluye los módulos JavaScript de la aplicación');

  const visited = new Set();
  const urls = new Set();
  const keys = new Set();
  while (queue.length) {
    const asset = queue.shift();
    if (asset.origin !== APP_URL || visited.has(asset.href)) continue;
    if (visited.size >= 60) fail('Demasiados módulos JavaScript para identificar la configuración');
    visited.add(asset.href);
    const code = await (await request(asset.href)).text();
    for (const match of code.matchAll(/https:\/\/[a-z0-9-]+\.supabase\.co/gi)) urls.add(match[0]);
    for (const match of code.matchAll(/sb_publishable_[A-Za-z0-9_-]+/g)) keys.add(match[0]);
    for (const match of code.matchAll(/(?:from\s*|import\s*\()\s*["'](\.\/[^"']+\.js)["']/g)) {
      queue.push(new URL(match[1], asset));
    }
  }
  if (urls.size !== 1 || keys.size !== 1)
    fail('No se pudo identificar una única URL y clave publicable en el despliegue');
  const url = [...urls][0];
  if (new URL(url).hostname !== PROJECT_HOST)
    fail('El despliegue no apunta al proyecto Supabase de producción esperado');
  return { url, key: [...keys][0] };
}

async function supabase_json(url, key, options = {}) {
  const response = await request(url, {
    ...options,
    headers: { apikey: key, Accept: 'application/json', ...options.headers },
  });
  return response.json();
}

async function main() {
  const html = await (await request(APP_URL)).text();
  if (!html.includes('<app-root')) fail('Vercel respondió, pero no entregó la aplicación Angular');
  console.log('[OK] Vercel responde por HTTPS');

  const { url, key } = await deployed_config(html);
  const professionals = await supabase_json(
    `${url}/rest/v1/professionals?select=id,full_name,specialty,zone,latitude,longitude&limit=1`,
    key,
  );
  if (!Array.isArray(professionals)) fail('Supabase devolvió una estructura inesperada');
  if (professionals.length && (!valid_professional(professionals[0])
    || !Number.isFinite(professionals[0].latitude)
    || !Number.isFinite(professionals[0].longitude)))
    fail('El maestro de referencia tiene datos inválidos');
  console.log('[OK] La configuración publicada conecta con Supabase de producción');

  const reference = professionals[0];
  const results = await supabase_json(`${url}/rest/v1/rpc/search_professionals`, key, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      p_specialty: reference?.specialty ?? null,
      p_zone: reference?.zone ?? null,
      p_lat: reference?.latitude ?? -16.3989,
      p_lng: reference?.longitude ?? -71.535,
      p_radius_km: 1,
      p_available_only: false,
    }),
  });
  if (!Array.isArray(results) || !results.every(valid_professional))
    fail('search_professionals devolvió resultados con estructura inválida');
  console.log('[OK] search_professionals responde correctamente');

  if (reference && !results.some((row) => row.id === reference.id))
    fail('Existe un maestro en producción, pero la búsqueda no lo recuperó');
  console.log(reference
    ? '[OK] Datos reales encontrados'
    : '[OK] La base no tiene maestros; búsqueda vacía verificada');
  console.log('\nProducción verificada correctamente');
}

main().catch((error) => {
  console.error(`[FAIL] ${error instanceof Error ? error.message : 'Error inesperado'}`);
  process.exitCode = 1;
});
